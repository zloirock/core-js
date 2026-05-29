// Class / object member resolution. dispatches `Cls.x` / `obj.x` / `Cls.method()` /
// `obj.method()` against both bodies (class member walks + object literal properties) +
// merged-interface declarations + index signatures. covers four shapes:
//   - own class body (`class C { x: T; static y(){} }`) - walks reverse so duplicate keys
//     pick the runtime last-wins entry
//   - superClass chain (real `extends` + ambient `declare class`)
//   - merged sibling interface (`class C {}; interface C { extra: ... }`) - subst built
//     per-iface so renamed type-params resolve positionally
//   - object literal properties (regular / shorthand / getter / setter / method shorthand /
//     spread bailout)
//
// Public surface:
//   findClassMember({ classPath, name, isStatic, classSubst, depth, visited })
//   resolveClassMember({ classPath, name, isStatic, callPath, receiverArgs })
//   resolveClassMemberNode(member, callPath, classSubst)
//   resolveMethodOrGetterCallReturn({ methodFn, kind, callPath, classSubst })
//   resolveBodyReturnValue(fnPath)
//   methodFnPath(memberPath)
//   classSubstInner(annotation, subst)
//   findObjectMember(objectPath, name)
//   resolveObjectMember(objectPath, name, callPath)
//   applySubstToTypeRefArgs(typeRef, subst)
//   resolveMemberFromMembers({ members, name, scope, callPath })
//   isMethodMember(node)
//   isPropertyMember(node)
import { $Object, MAX_DEPTH, nodePathInScope } from './base.js';
import { isOpenKeywordAnnotation } from './ast-shapes.js';
import { createClassMemberShape } from './class-member-shapes.js';

const NAMESPACE_FN_PATH_TYPES = ['FunctionDeclaration', 'TSDeclareFunction'];

export function createClassObjectMember({
  t,
  keyMatchesName,
  literalKeyValue,
  singleQuasiString,
  buildSubstMap,
  unwrapTypeAnnotation,
  typesEqual,
  collectReturnPaths,
  resolveRuntimeExpression,
  resolveNodeType,
  resolveReturnType,
  resolveTypeAnnotation,
  applySubst,
  applyAliasSubstDeep,
  resolveSuperClassPath,
  buildParentClassSubst,
  resolveClassFieldType,
  staticFieldShadowable,
  instanceMemberShadowable,
  getTypeMembers,
  findNamespacedFunctionPath,
}) {
  // computed key matches only when statically resolvable to a string (`['foo']` literal,
  // `[`foo`]` single-quasi, `[42]` numeric). binding-Identifier computed (`[sym]` over
  // `const sym = Symbol()`) is disjoint from same-named string key per ECMA-262 13.2.5.5,
  // so `{ items: 'a', [items]: 'b' }` does NOT shadow `items: 'a'`
  function memberKeyMatches(key, computed, name) {
    return computed
      ? (literalKeyValue(key) ?? singleQuasiString(key)) === name
      : keyMatchesName(key, name);
  }
  // babel splits public/private/accessor into distinct types; ESTree uses MethodDefinition /
  // PropertyDefinition with a PrivateIdentifier key. shared `./class-member-shapes.js`
  // collapses both shapes so `resolveClassMemberNode` doesn't miss private members
  const { isMethodMember, isPropertyMember } = createClassMemberShape({ t });

  // private members (`#x`, `static #x`, `accessor #x`) are lexically class-scoped: a subclass
  // declaring `#x` creates a distinct brand, never an override of the base's slot, so a
  // `this.#x` read always resolves to the lexical class's member regardless of the runtime
  // instance. the subclass-shadow bail must skip them (matches `class-fields.js` isPrivateMember)
  function isPrivateClassMember(node) {
    return node?.key?.type === 'PrivateIdentifier'
      || t.isClassPrivateProperty?.(node) || t.isClassPrivateMethod?.(node);
  }

  // does the class body own a getter / setter for `name` matching `isStatic`? used to
  // gate `resolveMergedNamespaceStatic` fallback - setter-only members own the slot even
  // though `findClassMember` skips them
  function hasOwnAccessor({ classPath, name, isStatic }) {
    for (const member of classPath.get('body').get('body')) {
      const { node } = member;
      if (!node || !!node.static !== isStatic) continue;
      if (node.kind !== 'get' && node.kind !== 'set') continue;
      if (memberKeyMatches(node.key, node.computed, name)) return true;
    }
    return false;
  }

  function findClassMember({ classPath, name, isStatic, classSubst, depth = 0, visited = undefined }) {
    if (depth > MAX_DEPTH) return null;
    // reverse-walk: duplicate keys are legal; runtime takes the last definition.
    // `findObjectMember` does the same; both must agree
    const members = classPath.get('body').get('body');
    for (let i = members.length - 1; i >= 0; i--) {
      const member = members[i];
      if (!memberKeyMatches(member.node.key, member.node.computed, name)) continue;
      if (!!member.node.static !== isStatic) continue;
      if (member.node.kind === 'set') continue;
      return { member, subst: classSubst ?? null };
    }
    // `class A extends B; class B extends A` cycle: MAX_DEPTH bottoms out via 64-frame
    // CPU-burn. visited Set on class nodes short-circuits at the second visit (parallels
    // `collectClassLikeMembers`'s `seen` and the type-alias decl-set guard)
    const seen = visited ?? new Set();
    if (seen.has(classPath.node)) return null;
    seen.add(classPath.node);
    const parentPath = resolveSuperClassPath(classPath);
    if (!parentPath) return null;
    const parentSubst = buildParentClassSubst(classPath, parentPath, classSubst);
    return findClassMember({ classPath: parentPath, name, isStatic, classSubst: parentSubst, depth: depth + 1, visited: seen });
  }

  // single returned expression as a path - used to resolve getters like properties
  function resolveBodyReturnValue(fnPath) {
    const body = fnPath.get('body');
    if (!t.isBlockStatement(body.node)) return resolveRuntimeExpression(body);
    let result = null;
    let resultType; // lazy: only resolved once, on first cross-node compare
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      if (!arg.node) return null;
      const value = resolveRuntimeExpression(arg);
      if (!value) return null;
      if (result === null || result.node === value.node) {
        result = value;
        continue;
      }
      // distinct nodes - accept only on matching resolved type (e.g. two `return [1,2,3]`)
      if (resultType === undefined) resultType = resolveNodeType(result);
      if (!resultType) return null;
      const valueType = resolveNodeType(value);
      if (!valueType || !typesEqual(resultType, valueType)) return null;
    }
    return result;
  }

  function resolveClassMember({ classPath, name, isStatic, callPath, receiverArgs, viaThis }) {
    const classSubst = buildSubstMap(classPath.node.typeParameters?.params, receiverArgs);
    const found = findClassMember({ classPath, name, isStatic, classSubst });
    if (found) {
      // `this.<member>` resolves against the lexical class, but an inherited method / getter
      // runs with `this` bound to the calling subclass (static side) or subclass instance
      // (instance side). when a subclass can override the member with an incompatible runtime
      // value - widened to `any`, or a method / accessor / field of a different shape - a narrow
      // off the lexical declaration would emit an element-specialized polyfill that throws on
      // the subclass value in engines lacking the native method. bail to the general variant
      // only when such a shadow is reachable: covers static fields AND static getters / methods
      // (staticFieldShadowable matches any static slot) plus the whole instance side
      // (instanceMemberShadowable). explicit `Base.<member>` / `inst.<member>` access (viaThis
      // false) reads the named type's own slot and stays narrowed
      if (viaThis && !isPrivateClassMember(found.member.node)
        && (isStatic ? staticFieldShadowable(classPath, name) : instanceMemberShadowable(classPath, name))) return null;
      return resolveClassMemberNode(found.member, callPath, found.subst);
    }
    if (!classPath.node.id?.name) return null;
    // static lookup miss: try TS declaration-merging fallback. when `namespace Foo { export
    // function bar(): T {} }` merges with `class Foo {}`, `Foo.bar` is a runtime callable
    // but doesn't appear in the class body. without this branch the resolver falls through
    // and the call's return type stays unknown, costing instance-method polyfill narrowing
    // on downstream chains like `Foo.bar([...]).map(...)`.
    // setter-only (`static set foo(v)` with no getter) own the name even though
    // `findClassMember` skips them - falling through to namespace lookup would resolve a
    // same-named merged function and emit a polyfill for a value that's actually a setter
    if (isStatic && !hasOwnAccessor({ classPath, name, isStatic })) {
      return resolveMergedNamespaceStatic({ classPath, name, callPath });
    }
    if (isStatic) return null;
    // body chain exhausted - delegate annotation-only fallback to `getTypeMembers`, which
    // walks the super chain merging interface members at each hop with proper per-hop
    // type-arg propagation. real class-body methods always win on collision (handled above)
    const synthRef = {
      type: 'TSTypeReference',
      typeName: { type: 'Identifier', name: classPath.node.id.name },
      typeParameters: receiverArgs ? { type: 'TSTypeParameterInstantiation', params: receiverArgs } : undefined,
    };
    const members = getTypeMembers({ objectType: synthRef, scope: classPath.scope });
    return resolveMemberFromMembers({ members, name, scope: classPath.scope, callPath });
  }

  // TS declaration merging: `class Foo {}` + `namespace Foo { export function bar(): T {} }`.
  // `findNamespacedFunctionPath` walks scope chain for a matching `TSModuleDeclaration` whose
  // body exports `bar`. `isFunctionOrClassDeclaration` leaf-match covers FunctionDeclaration,
  // TSDeclareFunction (ambient), and ClassDeclaration. only FunctionDeclaration-like nodes
  // carry an inferable `returnType` annotation we can resolve here - `export class Inner {}`
  // falls through silently because synthesising a TSTypeReference back to the inner class
  // would face scope-binding issues (inner names aren't bound in the outer scope) and the
  // user-class member path doesn't over-inject without that signal. `export const x = ...`
  // and other VariableDeclaration shapes don't match the leaf at all - not common in real
  // TS code for class-namespace merging.
  //
  // walks the parent-class chain (visited-set guards cycles) so `class Child extends Base`
  // sees `Base`'s merged namespace exports as inherited statics. mirrors `findClassMember`'s
  // super-walk semantics for class body
  function resolveMergedNamespaceStatic({ classPath, name, callPath, depth = 0, visited }) {
    if (!callPath || depth > MAX_DEPTH) return null;
    if (!findNamespacedFunctionPath) return null;
    if (!classPath.node.id?.name) return null;
    const found = findNamespacedFunctionPath([classPath.node.id.name, name], classPath.scope);
    if (found) {
      // matched in THIS class's namespace - own export wins. route through
      // `resolveReturnType` which handles BOTH annotated returns (with type-param subst
      // from call-site args - `identity<T>(item: T): T` + `Box.identity('hello')` -> T=string)
      // AND body-return inference (`function build() { return [1,2,3] }` -> Array).
      // ClassDeclaration leaves (`export class Inner {}`) miss the visitor list and fall
      // through to null - synthesising a TSTypeReference back to the inner class would
      // face scope-binding issues and the user-class member path doesn't over-inject
      // without that signal. bail on null result instead of falling through to the
      // parent walk: parent's same-name export has a different return type, and
      // returning its annotation would emit the wrong polyfill family for the runtime
      // value of the child override
      const fnPath = nodePathInScope(found.node, found.scope, NAMESPACE_FN_PATH_TYPES);
      return fnPath ? resolveReturnType(fnPath, callPath, null) : null;
    }
    const seen = visited ?? new Set();
    if (seen.has(classPath.node)) return null;
    seen.add(classPath.node);
    const parentPath = resolveSuperClassPath(classPath);
    if (!parentPath) return null;
    return resolveMergedNamespaceStatic({ classPath: parentPath, name, callPath, depth: depth + 1, visited: seen });
  }

  // ESTree MethodDefinition / ObjectMethod wrap the function in `.value`; babel ClassMethod /
  // ClassPrivateMethod carry body and params directly on the member. caller pre-filters to
  // method shapes; helper just picks the path that owns the function body
  function methodFnPath(memberPath) {
    const value = memberPath.get('value');
    return value?.node ? value : memberPath;
  }

  // peel TSTypeAnnotation wrapper if present, then apply class type-arg subst when set.
  // returns the inner type (or null) - downstream consumers either feed it back to
  // `resolveTypeAnnotation` (which itself peels, idempotent on inner) or use it directly
  function classSubstInner(annotation, subst) {
    const inner = unwrapTypeAnnotation(annotation);
    return inner ? applySubst(inner, subst) : inner;
  }

  // dispatch for "calling a method-shaped or getter member": for a regular method, resolve
  // its return type at the call site; for a getter, resolve the body's returned value
  // and (when callable) invoke. shared between class member resolution (with `classSubst`
  // for type-arg substitution) and object member resolution (no subst). returns null when
  // neither path produces a type, letting the caller fall through to other strategies
  function resolveMethodOrGetterCallReturn({ methodFn, kind, callPath, classSubst }) {
    if (kind !== 'get') return resolveReturnType(methodFn, callPath, classSubst);
    const value = resolveBodyReturnValue(methodFn);
    if (t.isFunction(value?.node)) return resolveReturnType(value, callPath, classSubst);
    return null;
  }

  function resolveClassMemberNode(member, callPath, classSubst) {
    const methodFn = isMethodMember(member.node) ? methodFnPath(member) : null;
    // TSDeclareMethod (ambient `declare class` body) has no body - only the return-type
    // annotation is available for resolution
    const declaredReturn = member.node.type === 'TSDeclareMethod' ? member.node.returnType : null;
    if (callPath) {
      if (methodFn) {
        const r = resolveMethodOrGetterCallReturn({ methodFn, kind: member.node.kind, callPath, classSubst });
        if (r) return r;
      } else if (declaredReturn) {
        // TSDeclareMethod (ambient method, no body) exposes `params` / `returnType` /
        // `typeParameters` directly on its node, the same shape `resolveReturnType` reads
        // from. routing through it picks up method-level type-args from `<T>(...)` plus
        // call-site `<string>` so `static make<T>(): T[]` with `Box.make<string>()`
        // resolves to `string[]` instead of leaking the bare type-param T (which loses
        // precision and degrades `_atMaybeArray` to generic `_at`)
        return resolveReturnType(member, callPath, classSubst);
      } else if (isPropertyMember(member.node)) {
        const value = resolveRuntimeExpression(member.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath, classSubst);
      }
      return null;
    }
    // property access: foo.bar or foo.#bar
    if (isPropertyMember(member.node)) {
      if (member.node.typeAnnotation) {
        const inner = classSubstInner(member.node.typeAnnotation, classSubst);
        const resolved = resolveTypeAnnotation(inner, member.scope);
        if (resolved) return resolved;
        // open keyword annotation (`any` / `unknown` / `object` / Flow mixed) lets the
        // RHS-write flow scan still pin a concrete runtime type
        if (isOpenKeywordAnnotation(unwrapTypeAnnotation(inner))) return resolveClassFieldType(member);
        return null;
      }
      return resolveClassFieldType(member);
    }
    // method: getter returns its return type, regular method returns Function
    if (methodFn) return member.node.kind === 'get' ? resolveReturnType(methodFn, undefined, classSubst) : new $Object('Function');
    if (declaredReturn) return new $Object('Function');
    return null;
  }

  // clone a TSTypeReference with each typeParameters arg substituted via `subst`. used to
  // compose an outer subst into a `Base<T>` ref before passing to `buildParentSubst` -
  // otherwise the parent's decl-param map binds raw `T` instead of the substituted concrete
  function applySubstToTypeRefArgs(typeRef, subst) {
    if (!subst) return typeRef;
    // mirror getTypeArgs: babel uses `typeParameters`, oxc/ESTree uses `typeArguments`.
    // reading only `typeParameters` would silently no-op subst on oxc-built parentRefs
    const argsKey = typeRef?.typeParameters ? 'typeParameters' : 'typeArguments';
    const args = typeRef?.[argsKey];
    if (!args?.params?.length) return typeRef;
    return {
      ...typeRef,
      [argsKey]: { ...args, params: args.params.map(a => applyAliasSubstDeep(a, subst)) },
    };
  }

  function resolveMemberFromMembers({ members, name, scope, callPath }) {
    if (!members) return null;
    for (const member of members) {
      if (member.computed) continue;
      if (!keyMatchesName(member.key, name)) continue;
      // method-shaped members: a TS method signature, or a Flow object-type method /
      // function-valued property (its `value` is a FunctionTypeAnnotation). a call resolves the
      // return type; a bare access yields Function. handled before the generic property branch
      // so a Flow method isn't mis-resolved to the function type itself, which would lose the
      // narrow on `obj.m().at(...)`
      const isTsMethod = member.type === 'TSMethodSignature';
      const isFlowMethod = member.type === 'ObjectTypeProperty' && member.value?.type === 'FunctionTypeAnnotation';
      if (isTsMethod || isFlowMethod) {
        if (!callPath) return new $Object('Function');
        const returnType = isTsMethod ? (member.returnType ?? member.typeAnnotation) : member.value.returnType;
        return returnType ? resolveTypeAnnotation(returnType, scope) : null;
      }
      if (member.type === 'TSPropertySignature' || member.type === 'ObjectTypeProperty') {
        const annotation = member.typeAnnotation ?? member.value;
        return annotation ? resolveTypeAnnotation(annotation, scope) : null;
      }
    }
    return null;
  }

  function findObjectMember(objectPath, name) {
    const properties = objectPath.get('properties');
    for (let i = properties.length - 1; i >= 0; i--) {
      const prop = properties[i];
      if (t.isSpreadElement(prop.node)) return null;
      if (prop.node.kind === 'set') continue;
      if (memberKeyMatches(prop.node.key, prop.node.computed, name)) return prop;
    }
    return null;
  }

  function resolveObjectMember(objectPath, name, callPath) {
    const prop = findObjectMember(objectPath, name);
    if (!prop) return null;
    // method call: obj.foo()
    const propFn = t.isObjectMethod(prop.node) ? methodFnPath(prop) : null;
    if (callPath) {
      if (propFn) {
        const r = resolveMethodOrGetterCallReturn({ methodFn: propFn, kind: prop.node.kind, callPath });
        if (r) return r;
      } else if (t.isObjectProperty(prop.node)) {
        const value = resolveRuntimeExpression(prop.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath);
      }
      return null;
    }
    // property access: obj.foo
    if (t.isObjectProperty(prop.node)) return resolveNodeType(prop.get('value'));
    // method: getter returns its return type, regular method returns Function
    if (propFn) return prop.node.kind === 'get' ? resolveReturnType(propFn) : new $Object('Function');
    return null;
  }

  // cluster-private (consumed only by other cluster functions, never reach the factory
  // surface): `resolveClassMemberNode` / `resolveMethodOrGetterCallReturn` /
  // `resolveBodyReturnValue` / `resolveMemberFromMembers`
  return {
    findClassMember,
    resolveClassMember,
    methodFnPath,
    classSubstInner,
    findObjectMember,
    resolveObjectMember,
    applySubstToTypeRefArgs,
    isMethodMember,
    isPropertyMember,
  };
}
