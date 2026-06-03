import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  markAndPeelSkippableWrappers,
  memberKeyName,
  peelZeroArgIifeReturn,
  reassignmentBlocksGlobalResolve,
  singleQuasiString,
  unwrapRuntimeExpr,
} from './ast-patterns.js';

// re-export so existing consumers (`global-resolve.js`, `member-resolve.js`) keep their
// import path; canonical definition lives in `ast-patterns.js` next to `singleQuasiString`
export { memberKeyName };

// peel parens / TS wrappers AND SequenceExpression tail (`(se(), X)` -> `X` at runtime)
// to a fixpoint; covers mixed-wrapper cases like `((se(), X) as any)`
function unwrapInitForResolution(node) {
  while (node) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'SequenceExpression') node = peeled.expressions.at(-1);
    else return peeled;
  }
  return node;
}

// `globalThis` / `self` / `window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint).
// scope+adapter optional. shadow check (`function f(globalThis) {}`) bails unless polyfillHint
// is set. `path` anchors TS-runtime shadow detection (`enum globalThis {}`).
// const aliases (`const g = globalThis`) pass through via init-peel
function isProxyGlobalIdentifierNode({ node, scope, adapter, path }) {
  if (node?.type !== 'Identifier') return false;
  if (!scope || !adapter) return POSSIBLE_GLOBAL_OBJECTS.has(node.name);
  const binding = adapter.getBinding(scope, node.name);
  // hint side-channel runs FIRST and independently of scope binding presence: post-rewrite
  // aliases like `_globalThis` are tracked by the injector's global-alias map but may have
  // no entry in babel's scope chain, so the init-follow path never observes them
  const hint = binding?.polyfillHint ?? adapter.getBindingPolyfillHint?.(scope, node.name);
  if (hint) return POSSIBLE_GLOBAL_OBJECTS.has(hint);
  if (binding) return followLocalBindingToProxyGlobal(binding, scope, adapter, path);
  if (adapter.hasBinding?.(scope, node.name, path)) return false;
  return POSSIBLE_GLOBAL_OBJECTS.has(node.name);
}

// const-alias chain: `const g = globalThis` -> recurse into the init. reassigned bindings
// bail (the init-time global identity is no longer guaranteed at the use site). two binding
// shapes flow in: (a) detect-usage adapter pre-unwraps the VariableDeclarator onto
// `binding.node`; (b) babelBindingAdapter (in resolve-node-type) passes the raw babel
// binding where `.node` is the bound Identifier and the declarator lives at `.path.node`.
// branch on `node.type` so a single predicate covers both shapes
function followLocalBindingToProxyGlobal(binding, scope, adapter, path) {
  if (binding.constantViolations?.length) return false;
  const decl = binding.node?.type === 'VariableDeclarator' ? binding.node : binding.path?.node;
  const init = unwrapInitForResolution(decl?.init);
  if (init?.type !== 'Identifier') return false;
  return isProxyGlobalIdentifierNode({ node: init, scope: binding.path?.scope ?? scope, adapter, path });
}

// unwrap paren / TS / SE wrappers AND a zero-arg IIFE returning a proxy-global: at runtime
// `(function(){return globalThis})().Array` accesses `Array` on `globalThis` exactly like the
// bare `globalThis.Array` chain. owns the unwrap so callers pass the raw `.object` node;
// non-IIFE callees (`getGlobal().Array`) return unchanged and keep generic dispatch.
// `peelZeroArgIifeReturn` already bails on async / generator / spread / control-flow bodies,
// so only sound pass-through wrappers peel
function peelProxyGlobalObject(node) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
  const ret = peelZeroArgIifeReturn(node);
  return ret ? unwrapRuntimeExpr(ret) : node;
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` / `globalThis.self.X` -> 'X', else null.
// walks intermediate proxy-global links so deeper chains resolve to the leaf key; peels a
// zero-arg IIFE-return at each hop so `(()=>globalThis)().Array` resolves like `globalThis.Array`.
// empty-string key returns null - no real global has empty name; keeps callers' `!== null` sound
export function globalProxyMemberName({ node, scope, adapter, path }) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = peelProxyGlobalObject(node.object);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = memberKeyName(object);
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)) return null;
    object = peelProxyGlobalObject(object.object);
  }
  if (!isProxyGlobalIdentifierNode({ node: object, scope, adapter, path })) return null;
  return memberKeyName(node) || null;
}

// strict: IIFE caller-arg overrides wrapper-default ONLY when bare Identifier; other shapes
// keep the AssignmentPattern default as the synth target so resolution can fall through.
// the GLOBAL `undefined` arg is special: it makes the runtime apply the parameter default, so
// it is NOT a classifiable receiver. but `undefined` is shadowable - a local binding named
// `undefined` is a real value, so the call-arg DOES override the default in that case. consult
// `adapter.hasBinding` (when scope/adapter are available) to tell global from shadowed; without
// them, treat `undefined` as the global sentinel. a shadow is always an ordinary binding
// (`const undefined` / `var` / param), found without position context, so no `path` arg is
// needed. `void x` is a UnaryExpression and is rejected by the Identifier gate above
export function isClassifiableReceiverArg(node, scope, adapter) {
  if (node?.type !== 'Identifier') return false;
  if (node.name !== 'undefined') return true;
  if (!scope || !adapter) return false;
  return adapter.hasBinding(scope, 'undefined');
}

// permissive: no wrapper-default - accept bare Identifier OR proxy-global MemberExpression
// so `globalThis.X.key` resolves the same as the bare-Identifier IIFE path
export function isExpandedClassifiableReceiver({ node, scope, adapter, path }) {
  if (node?.type === 'Identifier') return true;
  return globalProxyMemberName({ node, scope, adapter, path }) !== null;
}

// mark a synth-swap receiver and all inner sub-nodes as owned by skippedNodes so the
// inner-Identifier visitor doesn't double-fire (orphan import / transform-queue overlap).
// walks through paren / chain / TS wrappers on each `.object` hop too
export function markSynthReceiverSkipped(receiver, skippedNodes) {
  if (!receiver) return;
  let cur = receiver;
  while (cur) {
    skippedNodes.add(cur);
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
      cur = markAndPeelSkippableWrappers(cur.object, skippedNodes);
    } else break;
  }
}

// rewire `superMeta.object` from binding name (`MyPromise`) to registered global hint
// (`Promise`) so resolver tables key by the global. pure - caller cache reuse stays safe
export function resolveSuperImportName(injector, superMeta) {
  if (!superMeta?.object || !injector) return superMeta;
  const imp = injector.getPureImport(superMeta.object);
  return imp ? { ...superMeta, object: imp.hint } : superMeta;
}

// remap inherited-static meta while preserving the computed-key sideEffects channel
// (`super[(fn(),'X')]` would otherwise lose `fn()` evaluation on static-dispatch retarget)
export function remapInheritedStaticMeta(injector, originalMeta, inheritedMeta) {
  if (!inheritedMeta) return null;
  const remapped = resolveSuperImportName(injector, inheritedMeta);
  return remapped && originalMeta?.sideEffects?.length
    ? { ...remapped, sideEffects: originalMeta.sideEffects } : remapped;
}

// `super.X` in a static method -> static meta on the parent class. peel parens + TS casts
// on the superClass node so `class C extends (Base as typeof Base)` resolves to Base
export function buildSuperStaticMeta(classNode, key, resolveSuperType) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  const superClass = unwrapRuntimeExpr(classNode.superClass);
  if (!superClass) return null;
  const resolved = resolveSuperType(superClass);
  return resolved ? { kind: 'property', object: resolved, key, placement: 'static' } : null;
}

// shared `super.X` / `this.X` class-walking helpers.
// - `t`: babel/types or estree-compat types
// - `adapter`: scope/binding accessor (polyfillHint for plugin-managed imports)
// - `resolveKey`: provider's key resolver, injected to avoid circular deps via helpers barrel
// - `getInjector`: lazy accessor for the per-file ImportInjector (factory may run before pre())
// caches on the closure - call once per file
export function createClassHelpers({ t, adapter, resolveKey, getInjector = null }) {
  function isClassMember(node) {
    return t.isClassMethod(node) || t.isClassPrivateMethod(node)
      || t.isClassProperty(node) || t.isClassPrivateProperty(node) || t.isClassAccessorProperty(node);
  }

  // statically determinable key: Identifier (non-computed) / StringLiteral / single-quasi
  // TemplateLiteral. PrivateIdentifier explicit-reject - the no-shadow invariant is too
  // subtle to leave implicit
  function staticKeyName(key, computed) {
    if (!key) return null;
    if (key.type === 'PrivateIdentifier' || key.type === 'PrivateName') return null;
    if (!computed && t.isIdentifier(key)) return key.name;
    if (t.isStringLiteral(key)) return key.value;
    return singleQuasiString(key);
  }

  function classMemberKeyName(m) {
    return staticKeyName(m.key, m.computed);
  }

  // arrows are transparent (lexical super/this); non-arrow fns short-circuit except for the
  // ESTree `MethodDefinition.value = FunctionExpression` wrapper. back-fills visited ancestors
  // so sibling walks in the same subtree are amortized O(1)
  let enclosingCache = new WeakMap();

  function backfill(visited, value) {
    for (const n of visited) enclosingCache.set(n, value);
    return value;
  }

  function findEnclosingClassMember(path) {
    const visited = [];
    let prev = path;
    for (let cur = path.parentPath; cur; cur = cur.parentPath) {
      const { node } = cur;
      if (enclosingCache.has(node)) return backfill(visited, enclosingCache.get(node));
      // computed-key slot AND member decorators evaluate at class-def time in the OUTER scope
      // (this !== the class) - skip the member when prev's node is the key or one of its
      // decorators so `class C { [this.X]() {} }` / `class C { @(this.X) m() {} }` don't resolve
      // `this` to C (mirrors resolveThisAnchor's Decorator bail). skip BEFORE the push so
      // body-side walks reaching the same node fresh resolve to the class context instead of
      // inheriting this walk's outer-null conclusion via the cache
      if (isClassMember(node) && prev
        && ((node.computed && node.key === prev.node) || node.decorators?.includes(prev.node))) {
        prev = cur;
        continue;
      }
      visited.push(node);
      if (isClassMember(node) || t.isStaticBlock(node)) {
        return backfill(visited, {
          classBodyNode: cur.parentPath?.node,
          classNode: cur.parentPath?.parentPath?.node,
          isStatic: !!node.static || t.isStaticBlock(node),
        });
      }
      if (t.isFunction(node) && !t.isArrowFunctionExpression(node)) {
        if (t.isClassMethod(cur.parentPath?.node)) { // ESTree wrapper
          prev = cur;
          continue;
        }
        return backfill(visited, null);
      }
      prev = cur;
    }
    return backfill(visited, null);
  }

  // the ancestor path (inclusive) whose node === `node`, walking up from `from`, or null. used to
  // anchor the usage-pure reassignment proof at the class node rather than the method-nested super site
  function ancestorPathOf(from, node) {
    for (let cur = from; cur; cur = cur.parentPath) if (cur.node === node) return cur;
    return null;
  }

  // find `{ key: binding }` / shorthand `{ key }` in ObjectPattern where value binds to
  // targetName. returns the property key; accepts Identifier and StringLiteral keys
  function findDestructureKeyForBinding(objectPattern, targetName) {
    for (const p of objectPattern.properties ?? []) {
      if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
      const keyName = staticKeyName(p.key, p.computed);
      if (!keyName) continue;
      const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
      if (value?.type !== 'Identifier' || value.name !== targetName) continue;
      return keyName;
    }
    return null;
  }

  // follow `const X = Y` aliases to the first unshadowed global; null on real local bindings.
  // ES imports pass through for `resolveSuperImportName` to remap via injector's `#byName`.
  // `seen` is shared with `resolveBindingToGlobalName` so namespace-cycle detection survives
  function resolveSuperClassName(startName, scope, seen = new Set(), path = null, pureAnchor = null) {
    let name = startName;
    while (!seen.has(name)) {
      seen.add(name);
      // polyfillHint wins: `handleDestructuredProperty` rewrites destructure-with-default
      // shapes in-place, so `binding.path.init` is unrecoverable. plugin adapters expose
      // via binding object; resolver-tier adapter via side-channel
      const hint = adapter.getBinding?.(scope, name)?.polyfillHint
        ?? adapter.getBindingPolyfillHint?.(scope, name);
      if (hint) return hint;
      const binding = scope?.getBinding?.(name);
      // no binding: TS-runtime fallback (`enum X` / `namespace X` / `import X = require()`)
      // anchored on `path` - estree-toolkit's scope tracker misses these
      if (!binding) {
        if (path && adapter.hasBinding?.(scope, name, path)) return null;
        return name;
      }
      // method-aware reassignment bail: usage-global keeps resolving the super-class alias when the
      // reassignment does not dominate the use (init still live); usage-pure resolves only when no
      // reassignment reaches the CAPTURE point. the super site is nested in a method, but `extends`
      // evaluates the base at class-definition time - so pure anchors the proof at the class node
      // (`pureAnchor`), letting a post-class `A = Object` still resolve. global keeps the super site
      if (reassignmentBlocksGlobalResolve({ binding, adapter, path: pureAnchor ?? path })) return null;
      const decl = binding.path?.node;
      if (decl?.type === 'ImportDefaultSpecifier' || decl?.type === 'ImportSpecifier'
        || decl?.type === 'ImportNamespaceSpecifier') {
        // pass-through ONLY for injector-registered core-js imports - otherwise `import
        // {fn as Promise} from './local'` would dispatch `super.X` as the global's polyfill
        const injector = getInjector?.();
        if (!injector) return name;
        return injector.getPureImport?.(name) ? name : null;
      }
      if (decl?.type !== 'VariableDeclarator') return null;
      const init = unwrapInitForResolution(decl.init);
      // ObjectPattern: `const { Promise: MyP } = R` -> `const MyP = R.Promise`. unplugin
      // keeps raw destructure; babel-plugin already rewrites it
      if (decl.id?.type === 'ObjectPattern') {
        const keyName = findDestructureKeyForBinding(decl.id, name);
        if (!keyName) return null;
        if (isProxyGlobalIdentifierNode({ node: init, scope, adapter, path })
            || globalProxyMemberName({ node: init, scope, adapter, path }) !== null) return keyName;
        return resolveBindingToGlobalName({
          type: 'MemberExpression',
          object: init,
          property: { type: 'Identifier', name: keyName },
          computed: false,
        }, scope, seen, path, pureAnchor);
      }
      if (init?.type === 'Identifier') {
        name = init.name;
        continue;
      }
      // delegate proxy-global / namespace-member chains; share `seen` so namespace-member
      // recursion can't loop
      return resolveBindingToGlobalName(init, scope, seen, path, pureAnchor);
    }
    return null;
  }

  // namespace container = class body (static properties) or object literal - anything we
  // can statically look up by name. methods / getters / static blocks skipped (runtime values)
  function findNamespaceMemberValue(container, propName) {
    if (container?.type === 'ClassDeclaration' || container?.type === 'ClassExpression') {
      for (const m of container.body?.body ?? []) {
        if (!m.static) continue;
        if (m.type !== 'ClassProperty' && m.type !== 'PropertyDefinition') continue;
        if (staticKeyName(m.key, m.computed) !== propName) continue;
        return m.value ?? null;
      }
    } else if (container?.type === 'ObjectExpression') {
      for (const p of container.properties ?? []) {
        if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
        if (staticKeyName(p.key, p.computed) !== propName) continue;
        return p.value;
      }
    }
    return null;
  }

  // Identifier -> reachable static container (ClassDeclaration / ClassExpression /
  // ObjectExpression via `const X = ...`). seen guards alias cycles
  function bindingContainerValue(name, scope, seen, pureAnchor = null) {
    if (seen.has(name)) return null;
    seen.add(name);
    const binding = scope?.getBinding?.(name);
    // method-aware reassignment bail. usage-global resolves the static container regardless (over-
    // inject-safe; its anchor stays null, so dominance can't be proven and the inject-if-maybe-needed
    // bias wins). usage-pure resolves only when no reassignment reaches the class-definition capture
    // point - `pureAnchor` (the class node) for the `class C extends NS.Base` path - else bails
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path: pureAnchor })) return null;
    const declNode = binding.path?.node;
    return declNode?.type === 'ClassDeclaration' || declNode?.type === 'ClassExpression'
      ? declNode
      : unwrapInitForResolution(declNode?.init);
  }

  // member-access value lookup: outer -> container, look up leaf property. shared by
  // resolveToContainer (recurses on value) and resolveBindingToGlobalName (maps to global)
  function resolveMemberAccess(memberNode, scope, seen, pureAnchor = null) {
    const propName = resolveKey({ node: memberNode.property, computed: memberNode.computed, scope, adapter });
    if (!propName) return null;
    const outer = resolveToContainer(memberNode.object, scope, seen, pureAnchor);
    if (!outer) return null;
    return findNamespaceMemberValue(outer, propName);
  }

  // any expression -> namespace container that `findNamespaceMemberValue` can index by name.
  // handles bare Identifier (lookup), nested member chain (recurse + property lookup), direct
  // container literals. null when no static container is reachable
  function resolveToContainer(node, scope, seen, pureAnchor = null) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'Identifier') return bindingContainerValue(peeled.name, scope, seen, pureAnchor);
    if (peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression') {
      const value = resolveMemberAccess(peeled, scope, seen, pureAnchor);
      return value ? resolveToContainer(value, scope, seen, pureAnchor) : null;
    }
    // direct container - inline `({Promise}).Promise`. rare but free via the same path
    if (peeled?.type === 'ClassExpression' || peeled?.type === 'ObjectExpression') return peeled;
    return null;
  }

  // unified "what global name does this expression resolve to?" primitive. covers Identifier
  // alias chains, proxy-global member chains, user-namespace object literals, static
  // class-as-namespace, and any N-level composition through them. shared `seen` enables
  // mutually-recursive alias cycle detection; `path` anchors TS-runtime shadow checks
  function resolveBindingToGlobalName(node, scope, seen = new Set(), path = null, pureAnchor = null) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'Identifier') return resolveSuperClassName(peeled.name, scope, seen, path, pureAnchor);
    if (peeled?.type !== 'MemberExpression' && peeled?.type !== 'OptionalMemberExpression') return null;
    const proxyKey = globalProxyMemberName({ node: peeled, scope, adapter, path });
    if (proxyKey !== null) return proxyKey;
    // namespace-member: feed leaf value back through self so deeper chains compose
    const value = resolveMemberAccess(peeled, scope, seen, pureAnchor);
    return value ? resolveBindingToGlobalName(value, scope, seen, path, pureAnchor) : null;
  }

  // `super.X` and `this.X`-in-static both look up `<SuperClass>.X` on the parent's static
  // surface. provider's `resolveKey` (not staticKeyName) so `super[CONST]` / aliased Symbol.X
  // still resolve
  function resolveStaticInheritedMember(path) {
    const key = resolveKey({ node: path.node.property, computed: path.node.computed, scope: path.scope, adapter });
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    // usage-pure anchors its reassignment proof at the class node (where `extends` captures the base),
    // not the method-nested super site; global / narrowing keep the super site (anchor stays null)
    const pureAnchor = adapter?.method === 'usage-pure' ? ancestorPathOf(path, info.classNode) : null;
    return buildSuperStaticMeta(info.classNode, key,
      superClass => resolveBindingToGlobalName(superClass, path.scope, new Set(), path, pureAnchor));
  }

  let ownNamesCache = new WeakMap();
  function getOwnNames(classBodyNode, kind) {
    let cached = ownNamesCache.get(classBodyNode);
    if (!cached) ownNamesCache.set(classBodyNode, cached = { instance: null, static: null });
    if (cached[kind]) return cached[kind];
    const names = new Set();
    const wantStatic = kind === 'static';
    for (const m of classBodyNode.body) {
      if (isClassMember(m) && !!m.static === wantStatic) {
        const name = classMemberKeyName(m);
        if (name) names.add(name);
      }
    }
    cached[kind] = names;
    return names;
  }

  // `this.X` shadowed when class declares own `X` of the matching kind (static / instance).
  // nested non-arrow fn rebinds `this` -> ownership can't be proven there
  function isShadowedByClassOwnMember(path, key) {
    if (typeof key !== 'string') return false;
    const info = findEnclosingClassMember(path);
    if (!info || !t.isClassBody(info.classBodyNode)) return false;
    return getOwnNames(info.classBodyNode, info.isStatic ? 'static' : 'instance').has(key);
  }

  function reset() {
    enclosingCache = new WeakMap();
    ownNamesCache = new WeakMap();
  }

  // true when `path` lives inside a static method or static block - `this` there is the
  // constructor, so unshadowed `this.X` reads the super class's static surface
  function isInStaticContext(path) {
    return !!findEnclosingClassMember(path)?.isStatic;
  }

  // gates static-inheritance dispatch + instance-fallback bail. peel parens / TS casts on
  // the object so `(this as any).X` / `(super).X` still route to static dispatch. direct
  // type-string checks because estree-compat's `types` doesn't export `isSuper`
  function isInheritedStaticLookup(path) {
    const obj = unwrapRuntimeExpr(path.node.object);
    const objType = obj?.type;
    if (objType === 'Super') return true;
    return objType === 'ThisExpression' && isInStaticContext(path);
  }

  return {
    resolveStaticInheritedMember,
    isInStaticContext,
    isInheritedStaticLookup,
    isShadowedByClassOwnMember,
    reset,
  };
}

// `Symbol.hasInstance` -> `symbol/has-instance`. pure string transform - caller must
// validate the entry exists via the resolver. lowercase first char to filter malformed
// inputs (`Symbol.XYZ` -> `symbol/-x-y-z` would silently miss the lookup)
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  if (!prop || prop[0] < 'a' || prop[0] > 'z') return null;
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
