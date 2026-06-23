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
import { collectQualifiedSegments } from './ast-shapes.js';
import { getSuperTypeArgs } from '../helpers/ast-patterns.js';

// ESTree Property / babel ObjectProperty - both shapes wrap an object/class method's
// function-value via the `.value` slot. unified set covers both parser dialects
const OBJECT_PROPERTY_TYPES = new Set(['Property', 'ObjectProperty']);

// declaration shapes that describe an ambient parent class for type-flow purposes -
// TS `declare class` parses to `ClassDeclaration{declare:true}`, Flow `declare class X`
// to a dedicated `DeclareClass` node. both convey the parent's surface without a runtime
// binding so `resolveSuperClassPath`'s ambient fallback accepts either
const AMBIENT_CLASS_DECL_TYPES = new Set(['ClassDeclaration', 'DeclareClass']);

export function createClassContext({
  t,
  resolveRuntimeExpression,
  isReflectConstructCallee,
  buildSubstMap,
  findAmbientDeclarationPath,
  findDeclPathBySegments,
  isClassLikeDeclaration,
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
    let child = path;
    for (let current = path.parentPath; current; child = current, current = current.parentPath) {
      // Decorator's argument evaluates at class-definition time in the OUTER scope, NOT in
      // the decorated class/method's `this`. crossing a Decorator on the way up means the
      // original `this` lives in the outer scope - returning null here lets the resolver
      // fall back to outer-scope handling instead of binding to the inner class context
      if (current.node.type === 'Decorator') return null;
      if (t.isClassBody(current.parentPath?.node)) {
        // a member's COMPUTED KEY (`[this.x]() {}`) evaluates at class-definition time in the
        // OUTER `this`, not the instance. if we ascended through the key (not the body/value),
        // do not anchor to this class - same outer-scope rule as the Decorator argument above
        if (current.node.computed && child.node === current.node.key) return null;
        const classPath = current.parentPath.parentPath;
        if (!t.isClass(classPath?.node)) return null;
        return { kind: 'class', classPath, isStatic: !!current.node.static || current.node.type === 'StaticBlock' };
      }
      if (!t.isFunction(current.node) || t.isArrowFunctionExpression(current.node)) continue;
      const parent = current.parentPath?.node;
      // Babel ObjectMethod: `{ m() {} }` -> ObjectMethod direct child of ObjectExpression
      if (t.isObjectMethod?.(current.node) && t.isObjectExpression(parent)) {
        // same outer-scope rule as the class-member computed key above: an object method's COMPUTED
        // KEY (`{ [this.x]() {} }`) evaluates at object-definition time in the OUTER `this`, not the
        // object - if we ascended through the key, do not anchor to this object (ESTree reaches the
        // method via Property/value and naturally skips, so this guard keeps babel in step)
        if (current.node.computed && child.node === current.node.key) return null;
        return { kind: 'object', objectPath: current.parentPath };
      }
      // ESTree Property/ObjectProperty wrapping a FunctionExpression: could be an object
      // method (parent ObjectExpression) or a class method (parent ClassBody) - dispatch
      // on grandparent shape; for class methods continue to the ClassBody check next iter
      if (OBJECT_PROPERTY_TYPES.has(parent?.type) && parent.value === current.node) {
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

  // resolve an expression that should denote a class to its declaration path. an ambient
  // `declare class X` carries no runtime value binding on Babel (estree-toolkit binds it
  // regardless), so a bare Identifier is re-resolved through the ambient-declaration index;
  // qualified shapes (`NS.Base`, `Outer.Inner.Base`) descend the namespace segment list. shared
  // by the `extends` clause and the `new` / `Reflect.construct` instance anchors so a
  // `declare class` resolves identically across parsers wherever a class reference is expected.
  // every shape check reads the PEELED node so a TS wrapper (`(Base as typeof Base)`) doesn't
  // break Identifier / qualified-segment dispatch - non-identifier links (computed member, call
  // expressions, etc.) yield null segments so `findDeclPathBySegments` short-circuits
  function resolveExpressionToClassPath(exprPath) {
    const resolved = resolveRuntimeExpression(exprPath);
    if (t.isClass(resolved.node)) return resolved;
    if (t.isIdentifier(resolved.node)) {
      const ambient = findAmbientDeclarationPath(resolved.node.name, resolved.scope, isAmbientClassNode);
      return AMBIENT_CLASS_DECL_TYPES.has(ambient?.node.type) ? ambient : null;
    }
    const segments = collectQualifiedSegments(resolved.node);
    if (!segments?.length) return null;
    return findDeclPathBySegments(segments, resolved.scope, isClassLikeDeclaration);
  }

  // resolve a class's superClass to a declaration path. handles:
  //   - runtime binding (`class C extends Parent` where Parent is in scope)
  //   - ambient (`declare class Parent`) - babel/Flow don't bind as values
  //   - qualified (`class C extends NS.Base` / `Outer.Inner.Base`) - descends through
  //     `TSModuleDeclaration` bodies via segment walk
  // returns null for unresolvable shapes (parametric mixins, conditionals, etc.);
  // `findClassMember` treats null parent as "no further inheritance" and falls through to
  // the resolver's generic dispatch
  function resolveSuperClassPath(classPath) {
    const superClass = classPath.get('superClass');
    return superClass.node ? resolveExpressionToClassPath(superClass) : null;
  }

  function resolveClassContext(objectPath) {
    const { node } = objectPath;
    // Foo.staticProp - object is the class itself
    if (t.isClass(node)) return { classPath: objectPath, isStatic: true };
    // new Foo().prop - object is a class instance (`Foo` is a runtime class, an ambient
    // `declare class`, or a qualified `NS.Foo` - all resolved by the shared class-path helper)
    if (t.isNewExpression(node)) {
      const classPath = resolveExpressionToClassPath(objectPath.get('callee'));
      if (classPath) return { classPath, isStatic: false };
    }
    // `Reflect.construct(target, args[, newTarget])` is structurally equivalent to
    // `new target(...args)`, EXCEPT the created object's prototype is `newTarget.prototype`
    // when the 3rd argument is present - so a 3-arg call returns an instance of newTarget, not
    // target. resolve the constructor from `arguments[2]` when given (else `arguments[0]`) so
    // `inst.X` reaches the right class's members / polyfill family. callee shape: bare
    // `Reflect.construct` (no local shadow) or post-rewrite alias. `get('arguments')[i]` is the
    // parser-agnostic form (the dotted child-key `'arguments.0'` works in babel but not
    // estree-toolkit)
    if ((t.isCallExpression(node) || t.isOptionalCallExpression(node))
      && isReflectConstructCallee(node.callee, objectPath.scope)
      && node.arguments?.[0]) {
      const ctorIndex = node.arguments[2] ? 2 : 0;
      const classPath = resolveExpressionToClassPath(objectPath.get('arguments')[ctorIndex]);
      if (classPath) return { classPath, isStatic: false };
    }
    // this.prop inside a class member
    if (t.isThisExpression(node)) return resolveThisClass(objectPath);
    // super.prop inside a class member - resolve to parent class; isStatic inherits the
    // enclosing method's context (`static m() { super.x }` -> parent static; instance -> instance)
    if (node?.type === 'Super') {
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
  function buildParentClassSubstFromNodes(childNode, parentNode, childSubst, scope) {
    // Flow `declare class Sub extends Base<...>` (DeclareClass) carries super-type-args on the
    // heritage clause (`extends[0].typeParameters`), not on the superType* slots getSuperTypeArgs
    // probes; without the fallback the parent decl-param subst is empty and inherited generic
    // members resolve to the unbound type-param (lost narrow)
    const superTypeArgs = (getSuperTypeArgs(childNode) ?? childNode.extends?.[0]?.typeParameters)?.params;
    const parentDeclParams = parentNode.typeParameters?.params;
    if (!superTypeArgs?.length || !parentDeclParams?.length) return null;
    const args = childSubst ? superTypeArgs.map(a => applyAliasSubstDeep(a, childSubst)) : superTypeArgs;
    return buildSubstMap(parentDeclParams, args, scope);
  }

  function buildParentClassSubst(childClassPath, parentClassPath, childSubst, scope) {
    return buildParentClassSubstFromNodes(childClassPath.node, parentClassPath.node, childSubst, scope);
  }

  return {
    resolveThisAnchor,
    resolveThisClass,
    resolveThisObject,
    resolveExpressionToClassPath,
    resolveSuperClassPath,
    resolveClassContext,
    buildParentClassSubstFromNodes,
    buildParentClassSubst,
  };
}
