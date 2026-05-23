// Global-reference resolution. classifies AST shapes that bind to known runtime globals or
// their prototype/instance forms:
//   - bare Identifier with no scope binding -> `<name>` (e.g. `Map`, `parseInt`)
//   - `globalThis.X` / `window.X` / `self.X` / `global.X` / top-level `this.X` -> `<X>`
//   - `Cls.prototype` / `const { prototype: P } = Cls; P.method()` -> instance of Cls
//   - `class C extends Base<T>` / `class C extends Cls` -> resolveKnownContainerType base
//     (preserves type-arg through to instance method dispatch)
//
// Public surface:
//   isGlobalThis(path)
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
import { globalProxyMemberName, POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { getSuperTypeArgs, isAmbientBindingShape, peelIIFEReturn, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';

export function createGlobalResolve({
  t,
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
  function hasRuntimeBinding(scope, name) {
    const binding = scope?.getBinding(name);
    if (!binding) return false;
    return !isAmbientBindingShape(binding.path?.node, binding.path?.parent);
  }
  function isGlobalThis(path) {
    let current = path;
    while (current = current.parentPath) {
      // non-arrow function rebinds `this` - not global
      if (t.isFunction(current.node) && !t.isArrowFunctionExpression(current.node)) return false;
      // class body rebinds `this` for property initializers and static blocks
      if (t.isClassBody(current.node)) return false;
      if (t.isProgram(current.node)) return true;
    }
    return false;
  }

  // proxy-global chain link: `globalThis.self`, `globalThis.window`, etc. - each link's
  // property name is in `POSSIBLE_GLOBAL_OBJECTS` AND the chain root is a proxy global.
  // mirror `globalProxyMemberName`'s walk but stays in resolve-node-type's path-based API
  function isProxyGlobalChainLink(objectPath) {
    if (!t.isMemberExpression(objectPath.node) && !t.isOptionalMemberExpression(objectPath.node)) return false;
    if (objectPath.node.computed) return false;
    const propName = objectPath.node.property?.name;
    return !!propName && POSSIBLE_GLOBAL_OBJECTS.has(propName) && isGlobalProxy(objectPath.get('object'));
  }

  // IIFE returning a proxy-global: `(() => globalThis)()` / `(function(){ return self })()`
  function isProxyGlobalIifeReturn(callPath) {
    const ret = peelIIFEReturn(callPath.node);
    if (!ret) return false;
    // oxc preserves `ParenthesizedExpression` on the callee; babel strips it
    let fnPath = callPath.get('callee');
    while (fnPath?.node?.type === 'ParenthesizedExpression') fnPath = fnPath.get('expression');
    if (!fnPath?.node) return false;
    const fnBody = fnPath.get('body');
    const retPath = fnBody?.node === ret ? fnBody : findReturnPath(fnBody, ret);
    return retPath ? isGlobalProxy(retPath) : false;
  }

  function isGlobalProxy(objectPath) {
    if (t.isIdentifier(objectPath.node)) {
      return POSSIBLE_GLOBAL_OBJECTS.has(objectPath.node.name) && !hasRuntimeBinding(objectPath.scope, objectPath.node.name);
    }
    // top-level `this` (not inside any non-arrow function or class) is a global proxy
    if (t.isThisExpression(objectPath.node) && isGlobalThis(objectPath)) return true;
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
    if (hasRuntimeBinding(walked.scope, node.name)) return null;
    return resolveKnownConstructor(node.name) ? node.name : null;
  }

  function resolveGlobalName(path) {
    if (t.isIdentifier(path.node)) {
      return hasRuntimeBinding(path.scope, path.node.name)
        ? resolveAliasedGlobalName(path)
        : path.node.name;
    }
    if (!isMemberLike(path) || path.node.computed) return null;
    const object = path.get('object');
    if (!isGlobalProxy(object)) return null;
    const property = path.get('property');
    return t.isIdentifier(property.node) ? property.node.name : null;
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
    const binding = path.scope?.getBinding(path.node.name);
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
    const peeled = unwrapRuntimeExpr(superPath.node);
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

  // `isGlobalThis` / `isGlobalProxy` / `knownConstructorAt` stay cluster-private
  return {
    resolveGlobalName,
    resolvePrototypeAsInstance,
    resolveClassInheritance,
  };
}
