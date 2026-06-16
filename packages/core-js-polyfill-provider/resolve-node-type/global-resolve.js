// Global-reference resolution. classifies AST shapes that bind to known runtime globals or
// their prototype/instance forms:
//   - bare Identifier with no scope binding -> `<name>` (e.g. `Map`, `parseInt`)
//   - `globalThis.X` / `window.X` / `self.X` / `global.X` / top-level `this.X` -> `<X>`
//   - `Cls.prototype` / `const { prototype: P } = Cls; P.method()` -> instance of Cls
//   - `class C extends Base<T>` / `class C extends Cls` -> resolveKnownContainerType base
//     (preserves type-arg through to instance method dispatch)
//
// Public surface:
//   isGlobalProxy(objectPath)
//   resolveGlobalName(path)                  - extracts the canonical global name from any
//                                              of the shapes above; null otherwise
//   knownConstructorAt(path)                 - resolve through runtime-binding chain then
//                                              probe via resolveKnownConstructor
//   resolvePrototypeAsInstance(path)         - MemberExpression `Cls.prototype` + destructure
//                                              `const { prototype: P } = Cls` paths
//   resolveClassInheritance(classPath)       - walk `extends` chain to the first known base
//                                              constructor, with type-arg propagation
import { MAX_DEPTH } from './base.js';
import { globalProxyMemberName, isProxyGlobalIdentifierNode, memberKeyName, POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import {
  isTopLevelThisContext,
  getSuperTypeArgs,
  isAmbientBindingShape,
  objectPatternLiteralKeyPath,
  peelIIFEReturn,
  peelSkippableWrapperPath,
} from '../helpers/ast-patterns.js';
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';

export function createGlobalResolve({
  t,
  getScopeBinding,
  isMemberLike,
  keyMatchesName,
  resolveMemberPropertyName,
  resolveKnownConstructor,
  resolveRuntimeExpression,
  resolveKnownContainerType,
  resolveTypeAnnotation,
  babelBindingAdapter,
}) {
  // TS-runtime shadow filter: raw `scope.getBinding(name)` returns a binding for `declare
  // const X` / `import type { X }` / TSEnumDeclaration / TSInterfaceDeclaration / etc.,
  // but at RUNTIME those declarations are elided by tsc and `name` falls through to the
  // global. without the filter, `declare const Map: any; new Map()` reads as
  // "Map shadowed locally -> not global" and the polyfill emit suppression breaks
  // `path` is the use site: routed through the hook so an over-hoisted `namespace N {}` /
  // `declare global {}` binding does not read as a local shadow of the global for a use OUTSIDE
  // the block (estree side). babel's default hook is the raw lookup, so this stays a no-op there
  function hasRuntimeBinding(scope, name, path = null) {
    const binding = getScopeBinding(scope, name, path);
    if (!binding) return false;
    return !isAmbientBindingShape(binding.path?.node, binding.path?.parent);
  }

  // proxy-global chain link: `globalThis.self`, `globalThis.window`, etc. - each link's
  // property name is in `POSSIBLE_GLOBAL_OBJECTS` AND the chain root is a proxy global.
  // mirror `globalProxyMemberName`'s walk but stays in resolve-node-type's path-based API
  function isProxyGlobalChainLink(objectPath) {
    if (!t.isMemberExpression(objectPath.node) && !t.isOptionalMemberExpression(objectPath.node)) return false;
    // memberKeyName accepts computed string-literal keys (`globalThis['self']`), matching
    // globalProxyMemberName's node-based link walk - a bare `.computed` bail would drop them
    const propName = memberKeyName(objectPath.node);
    return !!propName && POSSIBLE_GLOBAL_OBJECTS.has(propName) && isGlobalProxy(objectPath.get('object'));
  }

  // IIFE returning a proxy-global: `(() => globalThis)()` / `(function(){ return self })()`.
  // peel SKIPPABLE_WRAPPER_TYPES on the callee path so the walk matches `peelIIFEReturn`'s
  // node-level coverage - else TS-wrapped callees like `((() => globalThis) as any)()`
  // find a body in `peelIIFEReturn` but fail the path walk
  function isProxyGlobalIifeReturn(callPath) {
    const ret = peelIIFEReturn(callPath.node);
    if (!ret) return false;
    let fnPath = peelSkippableWrapperPath(callPath.get('callee'));
    // peel SequenceExpression-callee tails on the PATH side too (`(0, function(){...})()` /
    // `(spy(), () => globalThis)()` / nested `(0, (1, () => globalThis))()`): peelIIFEReturn unwraps
    // SE tails to a FIXPOINT on the node side, so loop here to match - a single peel stalls on a
    // doubly-nested SE and the return path is never found, dropping the proxy-global recognition
    while (fnPath?.node?.type === 'SequenceExpression') {
      fnPath = peelSkippableWrapperPath(fnPath.get('expressions').at(-1));
    }
    if (!fnPath?.node) return false;
    const fnBody = fnPath.get('body');
    const retPath = fnBody?.node === ret ? fnBody : findReturnPath(fnBody, ret);
    return retPath ? isGlobalProxy(retPath) : false;
  }

  function isGlobalProxy(objectPath) {
    // peel transparent wrappers up front - oxc preserves ParenthesizedExpression around
    // shapes like `(((() => globalThis) as any)()).Map` where the inner shape IS a
    // proxy-global call. babel strips parens at AST build so this is a no-op for it
    objectPath = peelSkippableWrapperPath(objectPath);
    if (!objectPath?.node) return false;
    if (t.isIdentifier(objectPath.node)) {
      // delegate to the node-based resolver so the path- and node-level proxy-global checks agree on a
      // const-alias / destructure binding (`const g = globalThis; g.Array...`) AND on a post-rewrite
      // generated alias (babel mutates `globalThis` to `_globalThis` in place, so the alias init is the
      // import - recognized via the polyfillHint side-channel). it covers the bare literal-proxy-global
      // case identically and is cycle-guarded against const-alias loops
      return isProxyGlobalIdentifierNode({
        node: objectPath.node, scope: objectPath.scope, adapter: babelBindingAdapter, path: objectPath,
      });
    }
    // top-level `this` (not inside any non-arrow function or class) is a global proxy
    if (t.isThisExpression(objectPath.node) && isTopLevelThisContext(objectPath)) return true;
    if (isProxyGlobalChainLink(objectPath)) return true;
    if (t.isCallExpression(objectPath.node) || t.isOptionalCallExpression(objectPath.node)) {
      return isProxyGlobalIifeReturn(objectPath);
    }
    return false;
  }

  // locate the path for an IIFE return expression inside a BlockStatement body. walks
  // top-level statements until the matching ReturnStatement.argument node is found.
  // narrow scan (top-level only) matches `singleReturnBodyExpression`'s contract: nested
  // control-flow / declarations already bailed before reaching here
  function findReturnPath(bodyPath, retNode) {
    if (!bodyPath.node || bodyPath.node.type !== 'BlockStatement') return null;
    for (const stmtPath of bodyPath.get('body')) {
      if (stmtPath.node?.type === 'ReturnStatement' && stmtPath.node.argument === retNode) {
        return stmtPath.get('argument');
      }
    }
    return null;
  }

  // user-aliased global `const A = Array; new A()`: walk const aliases through
  // `resolveRuntimeExpression`. accept only when the walk LANDED on a different unbound
  // Identifier that's a KNOWN constructor - otherwise bail so generic dispatchers kick in
  function resolveAliasedGlobalName(path) {
    const walked = resolveRuntimeExpression(path);
    const node = walked?.node;
    if (!node || node === path.node || !t.isIdentifier(node)) return null;
    if (hasRuntimeBinding(walked.scope, node.name, walked)) return null;
    return resolveKnownConstructor(node.name) ? node.name : null;
  }

  // `const { window: { Array } } = globalThis` - destructure-leaf bound to a global. walks
  // the ObjectPattern + init through `walkStaticReceiverChain` so the leaf identifier
  // resolves to the source proxy-global's named entry. without this, downstream
  // `Array.from(...)` loses its return-type narrow because `Array` shows a local binding and
  // `resolveAliasedGlobalName` bails at `followableVarInit` on ObjectPattern ids
  function resolveDestructuredGlobalName(path) {
    const binding = getScopeBinding(path.scope, path.node.name, path);
    const declarator = binding?.path?.node;
    if (!declarator || binding.constantViolations?.length || !t.isVariableDeclarator(declarator)) return null;
    if (declarator.id?.type !== 'ObjectPattern' || !declarator.init) return null;
    const keyPath = objectPatternLiteralKeyPath(declarator.id, path.node.name);
    if (!keyPath?.length) return null;
    return walkStaticReceiverChain({
      receiverNode: declarator.init,
      walkPath: keyPath,
      scope: binding.scope ?? binding.path.scope ?? path.scope,
      adapter: babelBindingAdapter,
      path: binding.path,
    });
  }

  // peel transparent wrappers off a path so a parenthesized / TS-cast / optional-chain-wrapped
  // global or proxy-global callee resolves identically on both parsers (oxc preserves
  // ParenthesizedExpression + ChainExpression that babel drops at parse): `(Array)`,
  // `(globalThis).Map`, `(globalThis.Array).from`, `new (globalThis?.Array)()`. canonical
  // peelSkippableWrapperPath covers paren + ChainExpression + TS (a paren-only peel left an oxc
  // `(globalThis?.Array)` as a ChainExpression -> not member-like -> under-narrowed)
  function resolveGlobalName(path) {
    path = peelSkippableWrapperPath(path);
    if (t.isIdentifier(path.node)) {
      if (!hasRuntimeBinding(path.scope, path.node.name, path)) return path.node.name;
      return resolveAliasedGlobalName(path) ?? resolveDestructuredGlobalName(path);
    }
    if (!isMemberLike(path)) return null;
    const object = peelSkippableWrapperPath(path.get('object'));
    if (!isGlobalProxy(object)) return null;
    // memberKeyName covers `globalThis.Map` and `globalThis['Map']` (literal computed key),
    // returning null for dynamic computed keys so they keep generic dispatch
    return memberKeyName(path.node);
  }

  // known constructor at the runtime-resolved target of `path`, or null
  function knownConstructorAt(path) {
    return resolveKnownConstructor(resolveGlobalName(resolveRuntimeExpression(path)));
  }

  // `const { prototype: name } = ...` shape - `name` is bound to the init's `.prototype`.
  // peel AssignmentPattern wrapper on value: `const { prototype: P = Array.prototype } = Set`
  // still binds P to `.prototype` when the default is unreached at runtime
  function isDestructuredAsPrototype(bindingPath, name) {
    if (!t.isVariableDeclarator(bindingPath.node)) return false;
    const { id, init } = bindingPath.node;
    if (!t.isObjectPattern(id) || !init) return false;
    return id.properties.some(p => {
      if (!t.isObjectProperty(p) || p.computed || !keyMatchesName(p.key, 'prototype')) return false;
      const value = t.isAssignmentPattern(p.value) ? p.value.left : p.value;
      return t.isIdentifier(value) && value.name === name;
    });
  }

  // `.prototype` of a known constructor reads as an instance of it: we infer which
  // constructor's instance-methods are reachable here, and prototype objects host those.
  // direct `X.prototype` and member-init `const P = X.prototype` fall through resolvePath;
  // destructure `const { prototype: P } = X` doesn't (resolvePath skips patterns)
  function resolvePrototypeAsInstance(path) {
    if (isMemberLike(path)) {
      return resolveMemberPropertyName(path) === 'prototype'
        ? knownConstructorAt(path.get('object'))
        : null;
    }
    if (!t.isIdentifier(path.node)) return null;
    const binding = getScopeBinding(path.scope, path.node.name, path);
    if (!binding || binding.constantViolations?.length) return null;
    if (!isDestructuredAsPrototype(binding.path, path.node.name)) return null;
    return knownConstructorAt(binding.path.get('init'));
  }

  // `extends` accepts a broader set of shapes than plain `resolveGlobalName`:
  //  - TS / Flow expression wrappers (`(Base as any)`, `(Base!)`, `<Base>Foo`, `(Base satisfies Ctor)`)
  //  - computed proxy-global member (`globalThis['Array']`) - accepted by `memberKeyName`
  //  - post-rewrite proxy-global alias (`_globalThis.Array` after in-place rewrite) - the
  //    factory's `babelBindingAdapter` reports `polyfillHint` for alias names so
  //    `globalProxyMemberName` resolves the chain uniformly with the direct-globalThis shape
  function resolveSuperGlobalName(superPath) {
    const direct = resolveGlobalName(superPath);
    if (direct) return direct;
    // `resolveGlobalName` already peels the full TS/Flow wrapper chain (`(Base as any)`, `Base!`,
    // `<Base>x`, `Base satisfies Ctor`) and resolves a bare global under it, so the only shape left to
    // try is a proxy-global MEMBER chain that `globalProxyMemberName` accepts beyond `resolveGlobalName`
    // (a computed proxy member `globalThis['Array']`, a post-rewrite alias `_globalThis.Array`)
    const peeled = peelSkippableWrapperPath(superPath)?.node;
    if (!peeled || (peeled.type !== 'MemberExpression' && peeled.type !== 'OptionalMemberExpression')) return null;
    return globalProxyMemberName({ node: peeled, scope: superPath.scope, adapter: babelBindingAdapter, path: superPath });
  }

  function resolveClassInheritance(classPath) {
    let current = classPath;
    let depth = MAX_DEPTH;
    while (depth--) {
      if (!current.node.superClass) return null;
      const superPath = current.get('superClass');
      const name = resolveSuperGlobalName(superPath);
      if (name) {
        const base = resolveKnownConstructor(name);
        // `class MyArr extends Array<string>` - the super's type argument is the element type
        // of the instance. resolve through same helper as `new Array<string>()` so the inner
        // flows into polyfill dispatch (`_atMaybeArray` over generic)
        const args = getSuperTypeArgs(current.node);
        return args?.params
          ? resolveKnownContainerType({
            name, base, node: { typeParameters: args }, innerResolver: p => resolveTypeAnnotation(p, current.scope),
          })
          : base;
      }
      current = resolveRuntimeExpression(superPath);
      if (!t.isClass(current.node)) return null;
    }
    return null;
  }

  // `isGlobalProxy` / `knownConstructorAt` stay cluster-private
  return {
    resolveGlobalName,
    resolvePrototypeAsInstance,
    resolveClassInheritance,
  };
}
