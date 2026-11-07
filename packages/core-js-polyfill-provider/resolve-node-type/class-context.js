// `this` / class-context resolution: walks up from a `this` / `super` / `new` / `Reflect.construct`
// site to identify the enclosing class declaration (or object-literal owner). also chains
// parent-class type-arg substitutions so member resolution can flow inherited generics
// through the extends chain.
//
// Public surface:
//   resolveThisAnchor(path)          - { kind: 'class', classPath, isStatic } | { kind: 'object', objectPath } | null
//   resolveThisClass(path)           - class anchor | null (only class anchors)
//   resolveThisObject(path)          - object-literal path | null (only object anchors)
//   resolveExpressionToClassPath(path) - runtime or ambient class declaration path | null
//   resolveSuperClassPath(classPath) - parent ClassDeclaration / DeclareClass path | null
//   classConstructionPreservesInstance(classPath) - whether construction preserves the class's instance
//   resolveClassContext(objectPath)  - resolves `Foo` / `new Foo()` / `this` / `super` / `Reflect.construct(C)` to
//                                      { classPath, isStatic, receiverArgs } - the type arguments an instance
//                                      receiver instantiates the class with; null for an unproven instance
//   buildParentClassSubstFromNodes / buildParentClassSubst - chain extends type-args -> parent declParams
//   reset()                         - drop cached construction proofs when source facts change
//
// Service object:
//   - `t` (Babel/ESTree types adapter)
//   - factory helpers: `resolveRuntimeExpression`, `isReflectConstructCallee`, `buildSubstMap`
//   - cluster outputs: `resolveClassInheritance` (`global-resolve`),
//     `findAmbientDeclarationPath` (`name-resolution`), `applyAliasSubstDeep`
//     (`type-subst` - passed directly; it is bound before this factory runs)
//
// `isAmbientClassNode` imports from `name-resolution` because it doubles as a cache key
// for `ambientDeclCache`; identity must match between cluster and factory call sites.
// `getHeritageTypeArgs` comes from `helpers/ast-patterns.js` directly
import { isAmbientClassNode } from './name-resolution.js';
import { collectQualifiedSegments, openTypeArg } from './ast-shapes.js';
import { MAX_DEPTH } from './base.js';
import {
  classConstructorFunction,
  classSuperPath,
  collectOwnReturns,
  flattenBranchingValueNodes,
  getHeritageTypeArgs,
  prototypeValueMayDispatch,
} from '../helpers/ast-patterns.js';

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
  constructionTypeArgs,
  resolveClassInheritance,
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
    if (t.isClass(resolved.node) || isClassLikeDeclaration(resolved.node)) return resolved;
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
    const superClass = classSuperPath(classPath);
    return superClass.node ? resolveExpressionToClassPath(superClass) : null;
  }

  // A constructor can replace its instance with an unrelated object, including through an
  // inherited or unknown base constructor. A class decorator can replace the constructor itself.
  // Such a result proves neither the class family nor its members. Primitive returns and `return this`
  // preserve the instance; nested returns belong to those functions. The proof is about the class
  // definition, independent of its uses.
  // Rewrites preserve its construction semantics; reset drops it when source facts change.
  let constructionProofs = new WeakMap();
  function classConstructionPreservesInstance(classPath) {
    if (constructionProofs.has(classPath.node)) return constructionProofs.get(classPath.node);
    let result = true;
    let depth = MAX_DEPTH;
    for (let current = classPath; current;) {
      const body = classConstructorFunction(current.node)?.body;
      if (!depth-- || current.node.decorators?.length
        || collectOwnReturns(body).some(ret => flattenBranchingValueNodes([ret.argument]).some(
          value => value.type !== 'ThisExpression' && prototypeValueMayDispatch(value, true),
        ))) {
        result = false;
        break;
      }
      const parent = resolveSuperClassPath(current);
      if (!parent && classSuperPath(current).node && !resolveClassInheritance(current)) result = false;
      current = parent;
    }
    constructionProofs.set(classPath.node, result);
    return result;
  }

  // a class's own type parameters as type arguments, every one left open (`openTypeArg`) - what an
  // instance whose construction the reader cannot see is known by. one array per class: the
  // class-as-type reference built from it is interned by identity
  const openClassArgsCache = new WeakMap();
  function openClassArgs(classNode) {
    const params = classNode.typeParameters?.params;
    if (!params?.length) return undefined;
    let args = openClassArgsCache.get(classNode);
    if (!args) openClassArgsCache.set(classNode, args = params.map(param => openTypeArg(param)));
    return args;
  }

  function resolveClassContext(objectPath) {
    const { node } = objectPath;
    // Foo.staticProp - object is the class itself
    if (t.isClass(node) || isClassLikeDeclaration(node)) return { classPath: objectPath, isStatic: true };
    // new Foo().prop - object is a class instance (`Foo` is a runtime class, an ambient
    // `declare class`, or a qualified `NS.Foo` - all resolved by the shared class-path helper)
    if (t.isNewExpression(node)) {
      const classPath = resolveExpressionToClassPath(objectPath.get('callee'));
      if (classPath && classConstructionPreservesInstance(classPath)) {
        return { classPath, isStatic: false, receiverArgs: constructionTypeArgs(classPath.node, objectPath) };
      }
    }
    // `Reflect.construct(target, args[, newTarget])` is structurally equivalent to
    // `new target(...args)`, EXCEPT the created object's prototype is `newTarget.prototype`
    // when the 3rd argument is present. A target returning another object bypasses that prototype
    // too. Otherwise resolve `arguments[2]` when given (else `arguments[0]`) so
    // `inst.X` reaches the right class's members / polyfill family. callee shape: bare
    // `Reflect.construct` (no local shadow) or post-rewrite alias. `get('arguments')[i]` is the
    // parser-agnostic form (the dotted child-key `'arguments.0'` works in babel but not
    // estree-toolkit)
    if ((t.isCallExpression(node) || t.isOptionalCallExpression(node))
      && isReflectConstructCallee(node.callee, objectPath.scope)
      && node.arguments?.[0]) {
      const ctorIndex = node.arguments[2] ? 2 : 0;
      const classPath = resolveExpressionToClassPath(objectPath.get('arguments')[ctorIndex]);
      const target = ctorIndex ? resolveExpressionToClassPath(objectPath.get('arguments')[0]) : classPath;
      // the arguments travel in an array, so nothing binds the class's type parameters
      if (classPath && target && classConstructionPreservesInstance(target)) {
        return { classPath, isStatic: false, receiverArgs: openClassArgs(classPath.node) };
      }
    }
    // this.prop inside a class member: the instance was made with type arguments the class body
    // cannot see, so its own parameters stay open
    if (t.isThisExpression(node)) {
      const thisCtx = resolveThisClass(objectPath);
      return thisCtx && { ...thisCtx, receiverArgs: openClassArgs(thisCtx.classPath.node) };
    }
    // super.prop inside a class member - resolve to parent class; isStatic inherits the
    // enclosing method's context (`static m() { super.x }` -> parent static; instance -> instance)
    if (node?.type === 'Super') {
      const thisCtx = resolveThisClass(objectPath);
      const parentPath = thisCtx && resolveSuperClassPath(thisCtx.classPath);
      // an INSTANCE `super.x` reads the parent PROTOTYPE, where instance fields never live - they
      // are own properties of the instance, so such a read sees only methods and accessors. a
      // STATIC `super.x` reads the parent constructor, where a static field IS an own property
      // the parent is instantiated by the heritage clause, its missing arguments taking their defaults
      return parentPath ? {
        classPath: parentPath,
        isStatic: thisCtx.isStatic,
        viaPrototype: !thisCtx.isStatic,
        receiverArgs: getHeritageTypeArgs(thisCtx.classPath.node)?.params,
      } : null;
    }
    return null;
  }

  // chain parent-class subst: apply current class's subst to its `extends ParentClass<...>`
  // type-arg slots, then map the resolved arg list to parent's declared type-params.
  // mirrors `appendInterfaceExtendsMembers` which performs the same step for interface chains.
  // node-based primitive shared by `findClassMember` (path-based) and `collectClassLikeMembers`
  // (raw-node walk-up); the path-based wrapper just unwraps `.node` slots
  function buildParentClassSubstFromNodes(childNode, parentNode, childSubst, scope) {
    // the heritage accessor covers the Flow ambient spelling too: without it the parent
    // decl-param subst is empty and inherited generic members resolve to the unbound
    // type-param (lost narrow)
    const superTypeArgs = getHeritageTypeArgs(childNode)?.params;
    const parentDeclParams = parentNode.typeParameters?.params;
    if (!superTypeArgs?.length || !parentDeclParams?.length) return null;
    const args = childSubst ? superTypeArgs.map(a => applyAliasSubstDeep(a, childSubst)) : superTypeArgs;
    return buildSubstMap(parentDeclParams, args, scope);
  }

  function buildParentClassSubst(childClassPath, parentClassPath, childSubst, scope) {
    return buildParentClassSubstFromNodes(childClassPath.node, parentClassPath.node, childSubst, scope);
  }

  // `resolveThisClass` stays cluster-private: it is the class arm of `resolveThisAnchor`, and a
  // consumer that wants both arms has to read the anchor once instead of climbing twice
  return {
    resolveThisAnchor,
    resolveThisObject,
    resolveExpressionToClassPath,
    resolveSuperClassPath,
    classConstructionPreservesInstance,
    resolveClassContext,
    buildParentClassSubstFromNodes,
    buildParentClassSubst,
    reset() { constructionProofs = new WeakMap(); },
  };
}
