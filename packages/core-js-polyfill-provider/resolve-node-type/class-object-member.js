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
import { $Object, MAX_DEPTH } from './base.js';
import { createClassMemberShape } from './class-member-shapes.js';

export function createClassObjectMember({
  t,
  keyMatchesName,
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
  getTypeMembers,
}) {
  // babel splits public/private/accessor into distinct types; ESTree uses MethodDefinition /
  // PropertyDefinition with a PrivateIdentifier key. shared `./class-member-shapes.js`
  // collapses both shapes so `resolveClassMemberNode` doesn't miss private members
  const { isMethodMember, isPropertyMember } = createClassMemberShape({ t });

  function findClassMember({ classPath, name, isStatic, classSubst, depth = 0, visited = undefined }) {
    if (depth > MAX_DEPTH) return null;
    // walk in reverse: in JS, duplicate method names are legal and the runtime uses the last definition
    // `findObjectMember` does the same; both must agree.
    const members = classPath.get('body').get('body');
    for (let i = members.length - 1; i >= 0; i--) {
      const member = members[i];
      // computed-key members with statically-known names (`['from']` / `[`a-${"b"}`]`) are
      // resolvable - keyMatchesName drives literalKeyValue / single-quasi extraction. only
      // truly dynamic computed keys (no static value) are unresolvable; those naturally
      // fail keyMatchesName below
      if (!keyMatchesName(member.node.key, name)) continue;
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

  function resolveClassMember({ classPath, name, isStatic, callPath, receiverArgs }) {
    const classSubst = buildSubstMap(classPath.node.typeParameters?.params, receiverArgs);
    const found = findClassMember({ classPath, name, isStatic, classSubst });
    if (found) return resolveClassMemberNode(found.member, callPath, found.subst);
    if (isStatic || !classPath.node.id?.name) return null;
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
        return resolveTypeAnnotation(classSubstInner(member.node.typeAnnotation, classSubst), member.scope);
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
      if (member.type === 'TSMethodSignature') {
        if (callPath) {
          const returnType = member.returnType ?? member.typeAnnotation;
          return returnType ? resolveTypeAnnotation(returnType, scope) : null;
        }
        return new $Object('Function');
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
      if (!prop.node.computed && prop.node.kind !== 'set' && keyMatchesName(prop.node.key, name)) return prop;
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
  // `resolveBodyReturnValue` / `resolveMemberFromMembers` / `isPropertyMember`
  return {
    findClassMember,
    resolveClassMember,
    methodFnPath,
    classSubstInner,
    findObjectMember,
    resolveObjectMember,
    applySubstToTypeRefArgs,
    isMethodMember,
  };
}
