import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };

// `globalThis` / `self` / `window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint
// after `globalThis → _globalThis` in-place mutation). scope+adapter optional; without them
// only direct names pass
function isProxyGlobalIdentifierNode(node, scope, adapter) {
  if (node?.type !== 'Identifier') return false;
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name)) return true;
  const hint = scope && adapter ? adapter.getBinding(scope, node.name)?.polyfillHint : null;
  return !!hint && POSSIBLE_GLOBAL_OBJECTS.has(hint);
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` -> 'X', else null.
// babel: `OptionalMemberExpression`; ESTree/oxc: `ChainExpression { MemberExpression { optional } }`
export function globalProxyMemberName(node, scope, adapter) {
  if (node?.type === 'ChainExpression') node = node.expression;
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  if (!isProxyGlobalIdentifierNode(node.object, scope, adapter)) return null;
  const { property, computed } = node;
  if (!computed && property?.type === 'Identifier') return property.name;
  if (computed && property?.type === 'StringLiteral') return property.value;
  // ESTree (oxc) uses `Literal` with a string value for string literals
  if (computed && property?.type === 'Literal' && typeof property.value === 'string') return property.value;
  if (computed && property?.type === 'TemplateLiteral'
    && property.expressions.length === 0 && property.quasis.length === 1) return property.quasis[0].value.cooked;
  return null;
}

// `class C extends MyPromise { super.try(...) }` — `buildSuperStaticMeta` sets
// `superMeta.object` to the binding name (`MyPromise`), but resolver tables key by global
// (`statics.Promise.try`). mutate in place to the registered global hint so lookup succeeds.
// `injector` is the plugin's ImportInjectorState instance; no-op if it doesn't know the name
export function resolveSuperImportName(injector, superMeta) {
  if (!superMeta?.object || !injector) return;
  const imp = injector.getPureImport(superMeta.object);
  if (imp) superMeta.object = imp.hint;
}

// `super.X` in a static method -> static meta on the parent class. `resolveSuperType`
// dispatches on AST shape (Identifier alias chains / MemberExpression proxy-global chains).
// oxc-parser preserves `ParenthesizedExpression` wrappers that babel strips — peel first
export function buildSuperStaticMeta(classNode, key, resolveSuperType) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  let { superClass } = classNode;
  while (superClass?.type === 'ParenthesizedExpression') superClass = superClass.expression;
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
      if (decl?.type !== 'VariableDeclarator' || decl.init?.type !== 'Identifier') return null;
      name = decl.init.name;
    }
    return null;
  }

  function resolveSuperMember(path) {
    const key = staticKeyName(path.node.property, path.node.computed);
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    return buildSuperStaticMeta(info.classNode, key, superClass => superClass.type === 'Identifier'
      ? resolveSuperClassName(superClass.name, path.scope)
      : globalProxyMemberName(superClass, path.scope, adapter));
  }

  let ownInstanceNames = new WeakMap();
  function getOwnInstanceNames(classBodyNode) {
    let names = ownInstanceNames.get(classBodyNode);
    if (names) return names;
    names = new Set();
    for (const m of classBodyNode.body) {
      if (isClassMember(m) && !m.static) {
        const name = classMemberKeyName(m);
        if (name) names.add(name);
      }
    }
    ownInstanceNames.set(classBodyNode, names);
    return names;
  }

  // static ctx -> always shadowed: `this` is the constructor, instance polyfills don't apply.
  // nested non-arrow fn -> `this` rebinds, can't prove ownership -> not shadowed
  function isShadowedByClassOwnMember(path, key) {
    if (typeof key !== 'string') return false;
    const info = findEnclosingClassMember(path);
    if (!info) return false;
    if (info.isStatic) return true;
    return t.isClassBody(info.classBodyNode) && getOwnInstanceNames(info.classBodyNode).has(key);
  }

  function reset() {
    enclosingCache = new WeakMap();
    ownInstanceNames = new WeakMap();
  }

  return { resolveSuperMember, isShadowedByClassOwnMember, reset };
}

// convert Symbol.X key to kebab-case entry: Symbol.hasInstance -> symbol/has-instance
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
