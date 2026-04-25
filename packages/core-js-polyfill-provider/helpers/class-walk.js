import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { singleQuasiString, unwrapRuntimeExpr } from './ast-patterns.js';

// declaration-init peel: strip parens + TS wrappers (`unwrapRuntimeExpr`) AND the tail of
// SequenceExpression (`(se(), receiver)` -> `receiver` at runtime). combined walks the
// mixed-wrapper cases like `((se(), X) as any)`. stops when the two peels reach a fixpoint
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

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint
// after `globalThis -> _globalThis` in-place mutation). scope+adapter optional; without them
// only direct names pass. with scope+adapter, a user binding (`function f(globalThis) {}`)
// shadows the global - shadowed names without `polyfillHint` are NOT proxy-global
function isProxyGlobalIdentifierNode(node, scope, adapter) {
  if (node?.type !== 'Identifier') return false;
  if (scope && adapter) {
    const binding = adapter.getBinding(scope, node.name);
    if (binding) return !!binding.polyfillHint && POSSIBLE_GLOBAL_OBJECTS.has(binding.polyfillHint);
  }
  return POSSIBLE_GLOBAL_OBJECTS.has(node.name);
}

// extract a member property's name as a string (identifier, string literal, single-quasi template);
// null when the key isn't statically resolvable.
// this helper is adapter-free (operates on raw AST nodes); the dual `StringLiteral` / `Literal`
// check is the cross-parser dispatch - babel emits `StringLiteral`, oxc emits `Literal`.
// adapter-aware callers should go through `adapter.isStringLiteral` (see `types.isStringLiteral`
// warning in `unplugin/internals/estree-compat.js`)
function memberKeyName(node) {
  const { property, computed } = node;
  if (!computed && property?.type === 'Identifier') return property.name;
  if (computed && property?.type === 'StringLiteral') return property.value;
  // ESTree (oxc) uses `Literal` with a string value for string literals
  if (computed && property?.type === 'Literal' && typeof property.value === 'string') return property.value;
  if (computed) {
    const quasi = singleQuasiString(property);
    if (quasi !== null) return quasi;
  }
  return null;
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` / `globalThis.self.X` -> 'X', else null.
// babel: `OptionalMemberExpression`; ESTree/oxc: `ChainExpression { MemberExpression { optional } }`.
// walks intermediate proxy-global links (`globalThis.self` / `globalThis.window`) so deeper
// chains still resolve to the final key
export function globalProxyMemberName(node, scope, adapter) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = unwrapRuntimeExpr(node.object);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = memberKeyName(object);
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)) return null;
    object = unwrapRuntimeExpr(object.object);
  }
  if (!isProxyGlobalIdentifierNode(object, scope, adapter)) return null;
  return memberKeyName(node);
}

// `class C extends MyPromise { super.try(...) }` - `buildSuperStaticMeta` sets
// `superMeta.object` to the binding name (`MyPromise`), but resolver tables key by global
// (`statics.Promise.try`). returns superMeta with `.object` rewired to the registered
// global hint, or the input unchanged when the injector doesn't know the name.
// pure (non-mutating) so caller cache reuse stays safe
export function resolveSuperImportName(injector, superMeta) {
  if (!superMeta?.object || !injector) return superMeta;
  const imp = injector.getPureImport(superMeta.object);
  return imp ? { ...superMeta, object: imp.hint } : superMeta;
}

// `super.X` in a static method -> static meta on the parent class. `resolveSuperType`
// dispatches on AST shape (Identifier alias chains / MemberExpression proxy-global chains).
// oxc-parser preserves `ParenthesizedExpression` wrappers that babel strips - peel first
export function buildSuperStaticMeta(classNode, key, resolveSuperType) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  // unwrap TS casts too: `class C extends (Base as typeof Base)` should resolve to Base
  const superClass = unwrapRuntimeExpr(classNode.superClass);
  if (!superClass) return null;
  const resolved = resolveSuperType(superClass);
  return resolved ? { kind: 'property', object: resolved, key, placement: 'static' } : null;
}

// shared `super.X` / `this.X` class-walking helpers. `t` is `@babel/types` or
// `estree-compat.types`; `adapter` enables scope-aware proxy-global resolution through
// polyfillHint for plugin-managed imports. `resolveKey` is the provider's key resolver
// (from `detect-usage.js`) - injected rather than imported to avoid circular deps
// (detect-usage already imports class-walk via the helpers barrel). caches live on the
// closure - call once per file
export function createClassHelpers(t, adapter, resolveKey) {
  const isClassMember = node => t.isClassMethod(node) || t.isClassPrivateMethod(node)
    || t.isClassProperty(node) || t.isClassPrivateProperty(node) || t.isClassAccessorProperty(node);

  // resolve a statically determinable key: Identifier (non-computed), StringLiteral, TemplateLiteral
  function staticKeyName(key, computed) {
    if (!key) return null;
    // private members (`#foo` / `accessor #foo`) have PrivateIdentifier keys - they CANNOT be
    // shadowed by / shadow a public member with the same textual name, so the shadow-check
    // must reject them explicitly. falling through to singleQuasiString / returning null by
    // accident would work today but the invariant is too subtle to leave implicit
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
  const backfill = (visited, value) => {
    for (const n of visited) enclosingCache.set(n, value);
    return value;
  };
  function findEnclosingClassMember(path) {
    const visited = [];
    for (let cur = path.parentPath; cur; cur = cur.parentPath) {
      const { node } = cur;
      if (enclosingCache.has(node)) return backfill(visited, enclosingCache.get(node));
      visited.push(node);
      if (isClassMember(node) || t.isStaticBlock(node)) return backfill(visited, {
        classBodyNode: cur.parentPath?.node,
        classNode: cur.parentPath?.parentPath?.node,
        isStatic: !!node.static || t.isStaticBlock(node),
      });
      if (t.isFunction(node) && !t.isArrowFunctionExpression(node)) {
        if (t.isClassMethod(cur.parentPath?.node)) continue; // ESTree wrapper
        return backfill(visited, null);
      }
    }
    return backfill(visited, null);
  }

  // find `{ key: binding }` or shorthand `{ key }` in ObjectPattern where value binds
  // to targetName; null when not found / shape unsupported. return the proxy-member key.
  // accepts both Identifier keys (`{ Promise: MyP }`) and string-literal keys (`{ 'Promise': MyP }`)
  // - both forms resolve to the same runtime property at destructure time
  function findDestructureKeyForBinding(objectPattern, targetName) {
    for (const p of objectPattern.properties ?? []) {
      if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
      // `staticKeyName` covers Identifier / StringLiteral / single-quasi TemplateLiteral;
      // ESTree's oxc `Literal` shape with a string value falls through the `isStringLiteral`
      // check (`nodeType()` maps Literal+string to StringLiteral), so both parser shapes resolve
      const keyName = staticKeyName(p.key, p.computed);
      if (!keyName) continue;
      const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
      if (value?.type !== 'Identifier' || value.name !== targetName) continue;
      return keyName;
    }
    return null;
  }

  // follow `const X = Y` aliases to the first unshadowed global; null on real local
  // bindings. ES imports pass through so `resolveSuperImportName` can map them back
  // to the original global via the injector's `#byName` registry.
  // `seen` is threaded from the caller so cycle detection survives cross-calls to
  // `resolveBindingToGlobalName` (which re-enters this function) - without shared state,
  // mutually-recursive namespace aliases (`const A = NS.P; const NS = { P: A }`) would
  // bounce between the two resolvers with a fresh Set each hop and stack-overflow
  function resolveSuperClassName(startName, scope, seen = new Set()) {
    let name = startName;
    while (!seen.has(name)) {
      seen.add(name);
      // injector-side hints win over scope-walked bindings: `handleDestructuredProperty`
      // rewrites `{Promise: MyP, ...rest} = globalThis` / `{Promise: MyP = Fallback} =
      // globalThis` in-place, so `binding.path.init` becomes an Identifier or a
      // ConditionalExpression that the walk below cannot map back to `Promise`. the
      // destructure emitter explicitly registers the alias via `registerGlobalAlias`,
      // and the adapter surfaces that as `polyfillHint`. prefer it before any scope walk
      const hint = adapter.getBinding?.(scope, name)?.polyfillHint;
      if (hint) return hint;
      const binding = scope?.getBinding?.(name);
      if (!binding) return name;
      if (binding.constantViolations?.length) return null;
      const decl = binding.path?.node;
      if (decl?.type === 'ImportDefaultSpecifier' || decl?.type === 'ImportSpecifier'
        || decl?.type === 'ImportNamespaceSpecifier') return name;
      if (decl?.type !== 'VariableDeclarator') return null;
      // strip parens + TS casts (`const A = Promise as typeof Promise`); without TS-strip
      // the alias chain bails and `super.X` doesn't resolve to the wrapped Promise
      const init = unwrapInitForResolution(decl.init);
      // `const { Promise: MyP } = globalThis; class C extends MyP { super.try() }` - ObjectPattern
      // destructure from a proxy-global is equivalent to `const MyP = globalThis.Promise` (alias
      // chain via member). babel-plugin mutates AST before this runs so binding.path points at
      // the rewritten simple form - but unplugin keeps raw destructure, so resolve it here.
      // `const { Promise: MyP } = globalThis.self` is the same shape through a proxy chain
      // (`self`/`window`/... are themselves known globals) - accept MemberExpression inits
      // whose tail ends at a proxy-global. user destructure like `const { x } = getObj()` bails
      if (decl.id?.type === 'ObjectPattern'
        && (isProxyGlobalIdentifierNode(init, scope, adapter)
          || globalProxyMemberName(init, scope, adapter) !== null)) {
        const keyName = findDestructureKeyForBinding(decl.id, name);
        return keyName ?? null;
      }
      if (init?.type === 'Identifier') {
        name = init.name;
        continue;
      }
      // non-Identifier init: delegate to the unified resolver which handles proxy-global
      // chains AND user-namespace object-literal members. `const A = globalThis.Promise`
      // / `const A = NS.Promise` both resolve to 'Promise' through the same path.
      // thread `seen` so cycles via namespace-member recursion are detected
      return resolveBindingToGlobalName(init, scope, seen);
    }
    return null;
  }

  // a "namespace container" - class body with static properties or object literal - is any
  // value we can statically look up a member on by name. methods / getters / private fields /
  // static blocks intentionally skipped: their value isn't a resolvable alias chain (static
  // block runs at class-eval time with arbitrary code; getters return runtime values)
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

  // unified "what global name does this expression resolve to?" primitive. covers every
  // super-class shape the plugin recognises:
  //  - bare Identifier (`extends Promise`) / identifier alias chain (`const X = Promise`)
  //  - proxy-global member chain (`extends globalThis.Promise`, `extends self.window.Map`)
  //  - user-namespace object literal (`const NS = { Promise }; extends NS.Promise`)
  //  - static class-as-namespace (`class Box { static Promise = Promise }; extends Box.Promise`)
  //  - compositions through any of the above (`const NS = { P: globalThis.Promise }; NS.P`)
  // returns the canonical global name (`'Promise'`, `'Map'`, ...) or null on failure.
  // recursive over property values so nested namespaces and alias chains compose naturally.
  // `seen` is threaded through so mutually-recursive aliases (`const A = NS.P; const NS = { P: A }`)
  // don't stack-overflow via cross-calls to `resolveSuperClassName` - both functions share
  // a single cycle-detection Set for the whole walk
  function resolveBindingToGlobalName(node, scope, seen = new Set()) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'Identifier') return resolveSuperClassName(peeled.name, scope, seen);
    if (peeled?.type !== 'MemberExpression' && peeled?.type !== 'OptionalMemberExpression') return null;
    // proxy-global root (`globalThis.X`, `self.window.X`) - walker returns the leaf key
    const proxyKey = globalProxyMemberName(peeled, scope, adapter);
    if (proxyKey !== null) return proxyKey;
    // namespace-member lookup requires a bare-Identifier root. `(expr).prop` / call-result
    // roots bail: would need runtime evaluation. the key itself can be computed/literal/
    // const-alias chain - delegated to `resolveKey` for uniform resolution
    if (peeled.object?.type !== 'Identifier') return null;
    const propName = resolveKey(peeled.property, peeled.computed, scope, adapter);
    if (!propName) return null;
    const binding = scope?.getBinding?.(peeled.object.name);
    if (!binding || binding.constantViolations?.length) return null;
    // class binding: decl node IS the container (no init step). var binding: peel decl.init
    // down to the container. both ClassExpression + ObjectExpression handled uniformly below
    const declNode = binding.path?.node;
    const container = declNode?.type === 'ClassDeclaration' || declNode?.type === 'ClassExpression'
      ? declNode
      : unwrapInitForResolution(declNode?.init);
    const value = findNamespaceMemberValue(container, propName);
    // recurse: member value can be any shape the outer resolver handles (Identifier alias,
    // nested proxy-global, another namespace member) - composition falls out for free
    return value ? resolveBindingToGlobalName(value, scope, seen) : null;
  }

  // common path for `super.X` and `this.X` in static context - both resolve to the same
  // `<SuperClass>.X` static meta since JS looks up unresolved static names on the
  // super class's static surface.
  // key goes through the provider's `resolveKey` (not the narrow `staticKeyName`) so
  // `super[CONST]` where CONST is a const-bound string / template literal / 'a' + 'b'
  // concat / aliased Symbol.X still lands on the matching static entry
  function resolveStaticInheritedMember(path) {
    const key = resolveKey(path.node.property, path.node.computed, path.scope, adapter);
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    return buildSuperStaticMeta(info.classNode, key,
      superClass => resolveBindingToGlobalName(superClass, path.scope));
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

  // `this.X` is shadowed when the class declares its own `X` of the matching kind -
  // static-ctx checks static members, instance-ctx checks instance members. nested
  // non-arrow fn rebinds `this`, so ownership can't be proven there.
  // computed-key edge `class C { [this.X] = 1 }`: `this` in the key position binds to
  // the surrounding scope (not the class), but `getOwnNames` only lists static-key members,
  // so computed keys can't accidentally produce a shadow match - safe by construction
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

  // gates dispatch to `resolveStaticInheritedMember` plus the downstream instance-fallback
  // bail. `super.X` always returns true because the caller uses the predicate as "is this a
  // super / this-in-static" check that ALSO forces the instance-fallback bail below (pure
  // instance super.X is out of scope of the resolver). `this.X` needs the static-context
  // check - non-static `this.X` is a regular instance read and shouldn't route here.
  // peel parens on object: oxc preserves `(this).X` / `(super).X`, babel strips - without
  // peel the parser-specific shape falls through to instance-method path. direct type-string
  // checks because estree-compat's `types` doesn't export `isSuper`
  function isInheritedStaticLookup(path) {
    let obj = path.node.object;
    while (obj?.type === 'ParenthesizedExpression') obj = obj.expression;
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

// convert Symbol.X key to kebab-case entry: Symbol.hasInstance -> symbol/has-instance.
// pure string transform - DOES NOT validate that the entry actually exists in the user's
// namespace (es / esnext / proposals vary). callers must validate via the resolver before
// treating the result as a real polyfill candidate
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  // well-known symbols all start lowercase; `Symbol.` / `Symbol.XYZ` would produce
  // `symbol/` / `symbol/-x-y-z` - malformed entries that silently miss the lookup
  if (!prop || prop[0] < 'a' || prop[0] > 'z') return null;
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
