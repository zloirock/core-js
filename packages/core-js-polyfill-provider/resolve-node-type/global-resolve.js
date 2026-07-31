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
import { MAX_DEPTH, $Object } from './base.js';
import { globalProxyMemberName, isProxyGlobalIdentifierNode, staticMemberKeyName } from '../helpers/class-walk.js';
import {
  isMutatedGlobalSlot,
  isTopLevelThisContext,
  getSuperTypeArgs,
  isAmbientBindingShape,
  objectPatternLiteralKeyPath,
  peelArrayWrapBindingLayers,
  peelSkippableWrapperPath,
  POSSIBLE_GLOBAL_OBJECTS,
} from '../helpers/ast-patterns.js';
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';
import { inlineCallProxyGlobalRoot } from '../detect-usage/resolve.js';

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
  resolveComputedKeyName,
  getKeyName,
  babelBindingAdapter,
}) {
  // a destructure key-path context for `objectPatternLiteralKeyPath`: a computed key that is a
  // const-bound string (`const k = 'Array'; { [k]: A } = globalThis`) folds through the canonical
  // scope-aware resolver, a plain key reads its literal name - without this the const key resolves
  // to nothing and the whole destructured-global alias degrades to a generic dispatch
  function destructureKeyCtx(scope, path) {
    return {
      scope,
      adapter: babelBindingAdapter,
      path,
      resolveKey: ({ node, computed, scope: keyScope }) => computed ? resolveComputedKeyName(node, keyScope) : getKeyName(node),
    };
  }
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
    const propName = staticMemberKeyName(objectPath.node);
    // a user-replaced hop slot (`globalThis.self = fake`) is the user's redirection - walking
    // through it would narrow to the pristine constructor's type on a foreign runtime value
    // (the detect-usage walk already honors the slot; this is its type-channel mirror)
    return !!propName && POSSIBLE_GLOBAL_OBJECTS.has(propName)
      && !isMutatedGlobalSlot(babelBindingAdapter, propName)
      && isGlobalProxy(objectPath.get('object'));
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
      // a provable call root - a literal IIFE, a NAMED single-return wrapper chain (`const f =
      // () => g(); const g = () => globalThis; f().Array...`) or an identity-param pass-through
      // - proves through the canonical inline walk, the same canon the detect channels collapse
      // this root with. a weaker bespoke IIFE walk here split the channels: the value channel
      // collapsed the chain while the type walk bailed, leaving a generic instance helper and
      // over-injected es.string.* imports on a provably Array receiver
      const buried = inlineCallProxyGlobalRoot({
        callNode: objectPath.node, scope: objectPath.scope, adapter: babelBindingAdapter, path: objectPath,
      });
      return !!buried && isProxyGlobalIdentifierNode({
        node: buried, scope: objectPath.scope, adapter: babelBindingAdapter, path: objectPath,
      });
    }
    // a SequenceExpression `(eff(), globalThis.self)` evaluates to its tail; the proxy-global root IS the
    // tail. peel transparent-to-tail (mirrors the IIFE-callee SE peel above and the runtime value-path) so a
    // SE-wrapped receiver resolves its TYPE like the bare chain - else `(c++, globalThis.self).Array.prototype`
    // under-narrows its receiver type (generic instance helper / over-injected es.string.* in the destructure)
    if (objectPath.node.type === 'SequenceExpression') {
      const exprs = objectPath.get('expressions');
      return exprs.length ? isGlobalProxy(exprs.at(-1)) : false;
    }
    return false;
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
  // `resolveAliasedGlobalName` bails at `followableVarInit` on ObjectPattern ids. the array-wrap
  // positional peel is shared with the class-walk symbol-alias chain-follow
  function resolveDestructuredGlobalName(path) {
    const binding = getScopeBinding(path.scope, path.node.name, path);
    const declarator = binding?.path?.node;
    if (!declarator || binding.constantViolations?.length || !t.isVariableDeclarator(declarator)) return null;
    if (!declarator.init) return null;
    const declScope = binding.scope ?? binding.path?.scope ?? path.scope;
    const keyCtx = destructureKeyCtx(declScope, binding.path);
    // peel array-wrap layers (`const [{ Array: A }] = [globalThis]`) positionally to the inner
    // ObjectPattern + init element (mirrors the usage-side resolveArrayWrappedProxyGlobalAlias)
    // so the leaf still resolves; spread-shifted pairing bails inside the shared peel. `keyCtx`
    // lets the slot-detection fold a computed const key (`[{ [k]: A }]`) as the outer read does
    const peeled = peelArrayWrapBindingLayers(declarator.id, declarator.init, path.node.name, keyCtx);
    if (!peeled) return null;
    const { id, init } = peeled;
    if (id?.type !== 'ObjectPattern') return null;
    const keyPath = objectPatternLiteralKeyPath(id, path.node.name, keyCtx);
    if (!keyPath?.length) return null;
    return walkStaticReceiverChain({
      receiverNode: init,
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
    // staticMemberKeyName covers `globalThis.Map`, `globalThis['Map']` AND a SE-bearing key
    // `globalThis[(e++, 'Map')]` -> 'Map', returning null for dynamic keys (generic dispatch)
    return staticMemberKeyName(path.node);
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
    if (direct) {
      // `extends _Set` (the `Set` super rewritten in place to its polyfill import) has no scope binding,
      // so `resolveGlobalName` returns the bare alias `_Set` - NOT a known constructor. map it via its
      // polyfillHint to the global it aliases (`_Set` -> `Set`) so `this` resolves to that global, whose
      // instance methods the polyfilled super already provides - else they are redundantly re-injected on
      // `this` (a `class extends Set` calling `this.values()` over-emitted `_values` past the `_Set` super)
      if (!resolveKnownConstructor(direct)) {
        const aliasPath = peelSkippableWrapperPath(superPath);
        const hint = t.isIdentifier(aliasPath?.node)
          && babelBindingAdapter.getBindingPolyfillHint?.(aliasPath.scope, aliasPath.node.name);
        if (hint && resolveKnownConstructor(hint)) return hint;
      }
      return direct;
    }
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
      // BASE-LESS (no `extends`) - a plain class whose instances are plain objects. distinct from an
      // UNKNOWABLE super (an `extends` that does not resolve, below): base-less is DEFINITELY `Object`,
      // unknowable could be anything (incl. Array), so the latter must stay generic (null) to keep the
      // polyfill rather than masquerade as `Object` and suppress it
      if (!current.node.superClass) return new $Object('Object');
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
