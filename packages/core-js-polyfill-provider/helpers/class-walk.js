import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { unwrapRuntimeExpr } from './ast-patterns.js';

// `globalThis` / `self` / `window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint
// after `globalThis -> _globalThis` in-place mutation). scope+adapter optional; without them
// only direct names pass
function isProxyGlobalIdentifierNode(node, scope, adapter) {
  if (node?.type !== 'Identifier') return false;
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name)) return true;
  const hint = scope && adapter ? adapter.getBinding(scope, node.name)?.polyfillHint : null;
  return !!hint && POSSIBLE_GLOBAL_OBJECTS.has(hint);
}

// extract a member property's name as a string (identifier, string literal, single-quasi template);
// null when the key isn't statically resolvable
function memberKeyName(node) {
  const { property, computed } = node;
  if (!computed && property?.type === 'Identifier') return property.name;
  if (computed && property?.type === 'StringLiteral') return property.value;
  // ESTree (oxc) uses `Literal` with a string value for string literals
  if (computed && property?.type === 'Literal' && typeof property.value === 'string') return property.value;
  if (computed && property?.type === 'TemplateLiteral'
    && property.expressions.length === 0 && property.quasis.length === 1) return property.quasis[0].value.cooked;
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

// `class C extends MyPromise { super.try(...) }` — `buildSuperStaticMeta` sets
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
// oxc-parser preserves `ParenthesizedExpression` wrappers that babel strips — peel first
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
// polyfillHint for plugin-managed imports. caches live on the closure - call once per file
export function createClassHelpers(t, adapter) {
  const isClassMember = node => t.isClassMethod(node) || t.isClassPrivateMethod(node)
    || t.isClassProperty(node) || t.isClassPrivateProperty(node) || t.isClassAccessorProperty(node);

  // resolve a statically determinable key: Identifier (non-computed), StringLiteral, TemplateLiteral
  function staticKeyName(key, computed) {
    if (!key) return null;
    if (!computed && t.isIdentifier(key)) return key.name;
    if (t.isStringLiteral(key)) return key.value;
    if (t.isTemplateLiteral(key) && key.expressions.length === 0 && key.quasis.length === 1) {
      return key.quasis[0].value.cooked;
    }
    return null;
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

  // follow `const X = Y` aliases to the first unshadowed global; null on real local
  // bindings. ES imports pass through so `resolveSuperImportName` can map them back
  // to the original global via the injector's `#byName` registry
  function resolveSuperClassName(startName, scope) {
    let name = startName;
    const seen = new Set();
    while (!seen.has(name)) {
      seen.add(name);
      const binding = scope?.getBinding?.(name);
      if (!binding) return name;
      if (binding.constantViolations?.length) return null;
      const decl = binding.path?.node;
      if (decl?.type === 'ImportDefaultSpecifier' || decl?.type === 'ImportSpecifier'
        || decl?.type === 'ImportNamespaceSpecifier') return name;
      if (decl?.type !== 'VariableDeclarator') return null;
      // strip parens + TS casts (`const A = Promise as typeof Promise`); without TS-strip
      // the alias chain bails and `super.X` doesn't resolve to the wrapped Promise
      const init = unwrapRuntimeExpr(decl.init);
      if (init?.type === 'Identifier') {
        name = init.name;
        continue;
      }
      // `const A = globalThis.Promise; class C extends A` — alias init points at a proxy-global
      // member. terminate the walk with the final member name (`Promise`) instead of bailing
      return globalProxyMemberName(init, scope, adapter) ?? null;
    }
    return null;
  }

  // common path for `super.X` and `this.X` in static context — both resolve to the same
  // `<SuperClass>.X` static meta since JS looks up unresolved static names on the
  // super class's static surface
  function resolveStaticInheritedMember(path) {
    const key = staticKeyName(path.node.property, path.node.computed);
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    return buildSuperStaticMeta(info.classNode, key, superClass => superClass.type === 'Identifier'
      ? resolveSuperClassName(superClass.name, path.scope)
      : globalProxyMemberName(superClass, path.scope, adapter));
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

  // `this.X` is shadowed when the class declares its own `X` of the matching kind —
  // static-ctx checks static members, instance-ctx checks instance members. nested
  // non-arrow fn rebinds `this`, so ownership can't be proven there
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

  // true when `path` lives inside a static method or static block — `this` there is the
  // constructor, so unshadowed `this.X` reads the super class's static surface
  function isInStaticContext(path) {
    return !!findEnclosingClassMember(path)?.isStatic;
  }

  // gates dispatch to `resolveStaticInheritedMember` plus the downstream instance-fallback
  // bail. both `super.X` (any ctx; instance super.X is out of scope of our resolver) and
  // `this.X` in static ctx look up the super class's static chain via `extends`. direct
  // type-string checks because estree-compat's `types` doesn't export `isSuper`
  function isInheritedStaticLookup(path) {
    const objType = path.node.object?.type;
    if (objType === 'Super') return true;
    return objType === 'ThisExpression' && isInStaticContext(path);
  }

  return {
    resolveStaticInheritedMember,
    // legacy aliases kept for external callers (usage-global uses `resolveSuperMember` only)
    resolveSuperMember: resolveStaticInheritedMember,
    resolveThisStaticMember: resolveStaticInheritedMember,
    isInStaticContext,
    isInheritedStaticLookup,
    isShadowedByClassOwnMember,
    reset,
  };
}

// convert Symbol.X key to kebab-case entry: Symbol.hasInstance -> symbol/has-instance
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
