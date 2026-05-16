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
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import { getSuperTypeArgs } from '../helpers/ast-patterns.js';

export function createGlobalResolve({
  t,
  isMemberLike,
  keyMatchesName,
  resolveMemberPropertyName,
  resolveKnownConstructor,
  resolveRuntimeExpression,
  resolveKnownContainerType,
  resolveTypeAnnotation,
}) {
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

  function isGlobalProxy(objectPath) {
    if (t.isIdentifier(objectPath.node)) {
      return POSSIBLE_GLOBAL_OBJECTS.has(objectPath.node.name) && !objectPath.scope?.getBinding(objectPath.node.name);
    }
    // top-level `this` (not inside any non-arrow function or class) is a global proxy
    return t.isThisExpression(objectPath.node) && isGlobalThis(objectPath);
  }

  // user-aliased global: `const A = Array; new A(...)` / `A(...)` / etc.
  // `resolveRuntimeExpression` peels const-bound Identifier aliases until it lands on
  // an unbound Identifier (a global) or stops at a non-const / non-Identifier RHS.
  // accept only when the walk LANDED on a different Identifier that's a KNOWN
  // constructor -- returning a non-global name here would short-circuit downstream
  // type-inference fallbacks (`null` lets generic dispatchers kick in; a non-global
  // name reaches `resolveKnownConstructor`, which returns null, suppressing the
  // generic emit). reassigned bindings (`let A; A = other`) walk to `other`, which
  // isn't a known constructor -- we bail and preserve the pre-fix generic-dispatch
  function resolveAliasedGlobalName(path) {
    const walked = resolveRuntimeExpression(path);
    const node = walked?.node;
    if (!node || node === path.node || !t.isIdentifier(node)) return null;
    if (walked.scope?.getBinding(node.name)) return null;
    return resolveKnownConstructor(node.name) ? node.name : null;
  }

  function resolveGlobalName(path) {
    if (t.isIdentifier(path.node)) {
      return path.scope?.getBinding(path.node.name)
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

  function resolveClassInheritance(classPath) {
    let current = classPath;
    let depth = MAX_DEPTH;
    while (depth--) {
      if (!current.node.superClass) return null;
      const superPath = current.get('superClass');
      const name = resolveGlobalName(superPath);
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
