// `this` / class-context resolution: walks up from a `this` / `super` / `new` / `Reflect.construct`
// site to identify the enclosing class declaration (or object-literal owner). also chains
// parent-class type-arg substitutions so member resolution can flow inherited generics
// through the extends chain.
//
// Public surface:
//   resolveThisAnchor(path)          - { kind: 'class', classPath, isStatic } | { kind: 'object', objectPath } | null
//   resolveThisClass(path)           - { classPath, isStatic } | null (only class anchors)
//   resolveThisObject(path)          - object-literal path | null (only object anchors)
//   resolveSuperClassPath(classPath) - parent ClassDeclaration / DeclareClass path | null
//   resolveClassContext(objectPath)  - resolves `Foo` / `new Foo()` / `this` / `super` / `Reflect.construct(C)` to { classPath, isStatic }
//   buildParentClassSubstFromNodes / buildParentClassSubst - chain extends type-args -> parent declParams
//
// Service object:
//   - `t` (Babel/ESTree types adapter)
//   - factory helpers: `resolveRuntimeExpression`, `isReflectConstructCallee`, `buildSubstMap`
//   - cluster outputs: `findAmbientDeclarationPath` (`name-resolution`), `applyAliasSubstDeep`
//     (`type-subst` - late-bound via thunk in factory wiring)
//
// `isAmbientClassNode` imports from `name-resolution` because it doubles as a cache key
// for `ambientDeclCache`; identity must match between cluster and factory call sites.
// `getSuperTypeArgs` comes from `helpers/ast-patterns.js` directly
import { isAmbientClassNode } from './name-resolution.js';
import { getSuperTypeArgs } from '../helpers/ast-patterns.js';

export function createClassContext({
  t,
  resolveRuntimeExpression,
  isReflectConstructCallee,
  buildSubstMap,
  findAmbientDeclarationPath,
  applyAliasSubstDeep,
}) {
  // walk up from `path` to find the enclosing scope that bound `this` to the function that
  // contains `path` (transparently passing through arrow functions, which inherit `this`).
  // returns one of:
  //   { kind: 'class', classPath, isStatic } - class member contains the use site
  //   { kind: 'object', objectPath } - object-literal method contains the use site
  //   null - non-arrow function rebound `this`, or top-level `this` reached
  // walk stops at the first non-arrow function; what kind of anchor depends on its parent
  // shape: ClassBody (class member), ObjectMethod / Property{value:FE} (object method),
  // MethodDefinition (ESTree class-method wrapper, continue to ClassBody), Property nested
  // in ClassBody (some adapters - continue), anything else (function rebinds `this`)
  function resolveThisAnchor(path) {
    let current = path;
    while (current = current.parentPath) {
      if (t.isClassBody(current.parentPath?.node)) {
        const classPath = current.parentPath.parentPath;
        if (!t.isClass(classPath?.node)) return null;
        return { kind: 'class', classPath, isStatic: !!current.node.static || current.node.type === 'StaticBlock' };
      }
      if (!t.isFunction(current.node) || t.isArrowFunctionExpression(current.node)) continue;
      const parent = current.parentPath?.node;
      // Babel ObjectMethod: `{ m() {} }` -> ObjectMethod direct child of ObjectExpression
      if (t.isObjectMethod?.(current.node) && t.isObjectExpression(parent)) {
        return { kind: 'object', objectPath: current.parentPath };
      }
      // ESTree Property / ObjectProperty wrapping a FunctionExpression: could be an object
      // method (parent ObjectExpression) or a class method (parent ClassBody) - dispatch
      // on grandparent shape; for class methods continue to the ClassBody check next iter
      if ((parent?.type === 'Property' || parent?.type === 'ObjectProperty') && parent.value === current.node) {
        const grand = current.parentPath?.parentPath?.node;
        if (t.isObjectExpression(grand)) return { kind: 'object', objectPath: current.parentPath.parentPath };
        continue;
      }
      // ESTree MethodDefinition wrapper for class methods (`class { m() {} }` -> MethodDefinition
      // whose .value is a FunctionExpression). step past so the next iter sees ClassBody
      if (parent?.type === 'MethodDefinition') continue;
      // standalone non-arrow function rebinds `this`
      return null;
    }
    return null;
  }

  function resolveThisClass(path) {
    const anchor = resolveThisAnchor(path);
    return anchor?.kind === 'class' ? { classPath: anchor.classPath, isStatic: anchor.isStatic } : null;
  }

  function resolveThisObject(path) {
    const anchor = resolveThisAnchor(path);
    return anchor?.kind === 'object' ? anchor.objectPath : null;
  }

  // resolve a class's superClass identifier to a declaration path, handling both real
  // (`class C extends Parent`) and ambient (`declare class Parent`) forms. returns null
  // for non-Identifier or unresolvable super heads
  function resolveSuperClassPath(classPath) {
    const superClass = classPath.get('superClass');
    if (!superClass.node) return null;
    const resolved = resolveRuntimeExpression(superClass);
    if (t.isClass(resolved.node)) return resolved;
    if (t.isIdentifier(superClass.node)) {
      // accept both TS `declare class` (ClassDeclaration{declare:true}) and Flow
      // `declare class X {...}` (DeclareClass node) - both describe the parent's surface
      // for type-flow analysis, even though only the TS form is currently common
      const ambient = findAmbientDeclarationPath(superClass.node.name, superClass.scope, isAmbientClassNode);
      if (ambient?.node.type === 'ClassDeclaration' || ambient?.node.type === 'DeclareClass') return ambient;
    }
    return null;
  }

  function resolveClassContext(objectPath) {
    // Foo.staticProp - object is the class itself
    if (t.isClass(objectPath.node)) return { classPath: objectPath, isStatic: true };
    // new Foo().prop - object is a class instance
    if (t.isNewExpression(objectPath.node)) {
      const classPath = resolveRuntimeExpression(objectPath.get('callee'));
      if (t.isClass(classPath.node)) return { classPath, isStatic: false };
    }
    // `Reflect.construct(C, args)` is structurally equivalent to `new C(...args)` -
    // returns an instance of C. callee shape: bare `Reflect.construct` (no local shadow)
    // or post-rewrite alias. recognising it lets `inst.X` on the result reach the same
    // class-context resolution as the new-expression path
    if ((t.isCallExpression(objectPath.node) || t.isOptionalCallExpression(objectPath.node))
      && isReflectConstructCallee(objectPath.node.callee, objectPath.scope)
      && objectPath.node.arguments?.[0]) {
      // dotted child-key (`'arguments.0'`) works in babel but not estree-toolkit; the
      // array-form `get('arguments')[0]` is universal across both adapters
      const classPath = resolveRuntimeExpression(objectPath.get('arguments')[0]);
      if (t.isClass(classPath.node)) return { classPath, isStatic: false };
    }
    // this.prop inside a class member
    if (t.isThisExpression(objectPath.node)) return resolveThisClass(objectPath);
    // super.prop inside a class member - resolve to parent class; isStatic inherits the
    // enclosing method's context (`static m() { super.x }` -> parent static; instance -> instance)
    if (objectPath.node?.type === 'Super') {
      const thisCtx = resolveThisClass(objectPath);
      const parentPath = thisCtx && resolveSuperClassPath(thisCtx.classPath);
      return parentPath ? { classPath: parentPath, isStatic: thisCtx.isStatic } : null;
    }
    return null;
  }

  // chain parent-class subst: apply current class's subst to its `extends ParentClass<...>`
  // type-arg slots, then map the resolved arg list to parent's declared type-params.
  // mirrors `appendInterfaceExtendsMembers` which performs the same step for interface chains.
  // node-based primitive shared by `findClassMember` (path-based) and `collectClassLikeMembers`
  // (raw-node walk-up); the path-based wrapper just unwraps `.node` slots
  function buildParentClassSubstFromNodes(childNode, parentNode, childSubst) {
    const superTypeArgs = getSuperTypeArgs(childNode)?.params;
    const parentDeclParams = parentNode.typeParameters?.params;
    if (!superTypeArgs?.length || !parentDeclParams?.length) return null;
    const args = childSubst ? superTypeArgs.map(a => applyAliasSubstDeep(a, childSubst)) : superTypeArgs;
    return buildSubstMap(parentDeclParams, args);
  }

  function buildParentClassSubst(childClassPath, parentClassPath, childSubst) {
    return buildParentClassSubstFromNodes(childClassPath.node, parentClassPath.node, childSubst);
  }

  return {
    resolveThisAnchor,
    resolveThisClass,
    resolveThisObject,
    resolveSuperClassPath,
    resolveClassContext,
    buildParentClassSubstFromNodes,
    buildParentClassSubst,
  };
}
