// Member resolution end-to-end: walking typed receivers + dispatching runtime member-access.
// Consolidates two halves of the same pipeline:
//
//   Typed side (annotation-based):
//     resolveMemberCallChain        - walks `obj.a.b.c` to leaf member preserving raw signature
//     resolveBindingReturnInfo      - callee identifier -> { fnNode, returnType }
//     memberCallReturnAnnotation    - cross-dialect return-slot extractor
//     resolveTypedMember            - typeof binding / class type / generic alias subst dispatch
//     findClassPathForTypeReference - `Cls` ref -> ClassDeclaration NodePath
//     resolveIndexSignatureMember   - `obj[k]` -> `{[key:string]:V}` -> V
//
//   Runtime side (receiver-aware dispatch):
//     resolveFromMemberExpression   - main member access entry; tries this-in-ObjectMethod,
//                                     ObjectExpression, class context, ambient class, then
//                                     typed-member as final fallback
//     resolveArrayIndexAccess       - `arr[0]` on ArrayExpression literals
//     resolveEnumMemberAccess       - `E.A` / `N.E.A` / `E[E.A]` enum dispatch
//
// Cluster-private helpers (not in service-object return):
//   resolveMemberCallReturnFromAnnotation - per-annotation overload fold
//   resolveMemberCallReturn               - union / intersection / alias-chain aware dispatch
//   collectMemberSegments                 - runtime MemberExpression chain -> segment array
//
// runtime `member-dispatch` and typed `member-resolution` share one closure, so the dispatch
// consumes `resolveTypedMember` / `resolveIndexSignatureMember` directly without a thunk.
//
// `findExpressionAnnotation` / `substituteTypeParams` / `applySubst` / `applyAliasSubstDeep` /
// `functionTypeReturnAnnotation` thunk through forward-decl `let` bindings
import { MAX_DEPTH, $Primitive, nodePathInScope } from './base.js';
import {
  collectQualifiedSegments, isMethodShapeMember, isQualifiedNameNode, isUnionType, peelTSParenthesized,
  typeRefName,
} from './ast-shapes.js';
import { isAmbientFunctionNode } from './name-resolution.js';
import { getTypeArgs, isMemberWriteHost, memberKeyName, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
import { staticMemberKeyName } from '../helpers/class-walk.js';

const CLASS_PATH_TYPES = ['ClassDeclaration'];

export function createMemberResolve({
  t,
  getScopeBinding,
  isLiteralOf,
  unwrapTypeAnnotation,
  getTypeMembers,
  keyMatchesName,
  KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  findBindingAnnotation,
  findExpressionAnnotation,
  functionTypeReturnAnnotation,
  applyAliasSubstDeep,
  shadowMethodTypeParams,
  foldUnionTypes,
  foldOverloadReturns,
  followTypeAliasChain,
  applySubst,
  isNullableOrNever,
  isNullableOrNeverAnnotation,
  commonType,
  narrowDiscriminatedUnion,
  swapAliasToTSTypeQueryWithSubst,
  resolveTypeQueryBinding,
  resolveObjectMember,
  resolveClassContext,
  resolveClassMember,
  resolveAnnotatedMember,
  substituteTypeParams,
  resolveTypeAnnotation,
  findTypeMember,
  findAnnotationGuard,
  findTypeDeclaration,
  findTypeParameter,
  isKeyofTargeting,
  resolveIndexSignatureValue,
  indexAccessKeyKind,
  resolveMemberPropertyName,
  resolveRuntimeExpression,
  resolveInnerType,
  collectBindingReferences,
  resolveThisObject,
  resolveObjectFieldFlow,
  findAmbientClassPath,
  resolveArrayLiteralElement,
  findAllEnumDeclarations,
  resolveEnumMemberType,
  resolveEnumType,
  resolveNodeType,
}) {
  // --- Member-chain walker (predicate-guards integration) ---

  // walk a (possibly nested) `obj.a.b.c` member-chain to its leaf member node. for each
  // intermediate hop we step into the carried annotation via `getTypeMembers` + match;
  // the leaf member is returned raw (not its typeAnnotation) so the caller can inspect
  // a method's full TSMethodSignature - `findTypeMember` would synth a stub there and
  // lose return-type info (e.g. TSTypePredicate). returns null on any non-Identifier link,
  // missing root binding, or unresolvable intermediate hop
  function resolveMemberCallChain(callee, scope) {
    const props = [];
    // peel ESTree `ChainExpression` / TS wrappers / parens at entry; intermediate hops
    // need explicit handling - both `MemberExpression` and babel's `OptionalMemberExpression`
    // share `object`/`property`/`computed` slots and resolve to the same member chain
    let node = unwrapRuntimeExpr(callee);
    while ((node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
      && !node.computed && node.property?.type === 'Identifier') {
      props.push(node.property.name);
      // peel after each step so intermediate ChainExpression / paren / TS wrappers
      // (`(a?.b).at(0)` - ESTree wraps optional-tail in ChainExpression on `.object`) don't
      // bail the walk. babel's OptionalMemberExpression keeps the chain flat at this slot,
      // oxc embeds the ChainExpression; peel symmetrically across parsers
      node = unwrapRuntimeExpr(node.object);
    }
    if (node?.type !== 'Identifier' || !props.length) return null;
    const binding = getScopeBinding(scope, node.name);
    if (!binding) return null;
    let annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
    const scopeRef = binding.path.scope;
    // props collected leaf-first; consume from the end to walk root-down. last entry stays
    // for the leaf-member lookup below (its raw signature is what callers need).
    // intermediate hops delegate to `findTypeMember` which handles alias-chain follow,
    // union/intersection per-branch fold, mapped-type passthrough, and method-vs-property
    // unwrap in one dispatch. methods surface as a synthetic Function-stub annotation -
    // next iteration's lookup on Function returns null, matching the prior bail behavior
    // (`obj.fn.x` reads `.x` on the function value, not on the method's return type)
    for (let i = props.length - 1; i > 0; i--) {
      if (!annotation) return null;
      annotation = unwrapTypeAnnotation(findTypeMember({ objectType: annotation, key: props[i], scope: scopeRef }));
    }
    if (!annotation) return null;
    // leaf: need the RAW member node (caller inspects signature shape - method vs property
    // vs getter - to decide call-vs-read dispatch). `findTypeMember` returns the resolved
    // annotation only, which loses the signature shape, so leaf stays at members+find
    const members = getTypeMembers({ objectType: annotation, scope: scopeRef });
    const member = members?.find(m => keyMatchesName(m.key, props[0]));
    return member ? { member, scope: scopeRef } : null;
  }

  // resolve a callee identifier to its function-like decl: returns {fnNode, returnType}
  // where fnNode carries the param list (`params` for FunctionDeclaration / arrow / TSDeclare,
  // `parameters` on a TSFunctionType binding-annotation) and returnType is the unwrapped
  // declared return annotation. unifies the four shapes a function-like binding can take so
  // callers can map a `TSTypePredicate.parameterName` to a positional call-arg uniformly:
  //   function isStr(x): x is T { ... }      -> FunctionDeclaration / TSDeclareFunction
  //   const isStr = (x): x is T => ...       -> VariableDeclarator + init ArrowFunctionExpression
  //   const isStr: (x) => x is T = impl      -> VariableDeclarator + TSFunctionType annotation
  // babel quirk: TSFunctionType stores the return type under `.typeAnnotation`, not `.returnType`
  function resolveBindingReturnInfo(declNode) {
    if (t.isFunction(declNode) || isAmbientFunctionNode(declNode)) {
      return { fnNode: declNode, returnType: unwrapTypeAnnotation(declNode.returnType) };
    }
    if (!t.isVariableDeclarator(declNode)) return null;
    // inline annotation on init wins (`const f = (x): x is T => ...`); fall through to the
    // binding-annotation form (`const f: (x) => x is T = impl`) when init is annotation-less,
    // including the common `const f: T = otherFn` shape where the predicate lives on the
    // binding annotation
    if (declNode.init && t.isFunction(declNode.init)) {
      const inlineReturn = unwrapTypeAnnotation(declNode.init.returnType);
      if (inlineReturn) return { fnNode: declNode.init, returnType: inlineReturn };
    }
    const bindingAnnotation = unwrapTypeAnnotation(declNode.id?.typeAnnotation);
    if (bindingAnnotation?.type !== 'TSFunctionType') return null;
    return {
      fnNode: bindingAnnotation,
      returnType: unwrapTypeAnnotation(bindingAnnotation.typeAnnotation ?? bindingAnnotation.returnType),
    };
  }

  // --- Method-call return resolver ---

  // callable member SHAPE, annotation presence NOT required: an implicit-any overload
  // (`parse(x: number);`) must stay in the overload set so the fold's widen sees it -
  // gating membership on the return annotation drops it before arg-discrimination and
  // lets a surviving annotated arm narrow a call TS types as `any`. function-typed
  // properties always carry a return in the grammar, so their shape check IS the
  // annotation check
  function isCallableMemberShape(member) {
    if (member.kind === 'get' || member.kind === 'set') return false;
    switch (member.type) {
      case 'TSMethodSignature':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return true;
      case 'MethodDefinition':
        return !!member.value;
      case 'TSPropertySignature':
        return !!functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      case 'ObjectTypeProperty':
        return !!functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return false;
  }

  // extract the return type annotation from a method/property call signature
  function memberCallReturnAnnotation(member) {
    // a getter (or setter) signature is not callable as a method - narrowing the CALL to the
    // getter's value type produced an un-callable narrow
    if (member.kind === 'get' || member.kind === 'set') return null;
    switch (member.type) {
      // Babel: TSMethodSignature.typeAnnotation; ESTree: TSMethodSignature.returnType
      case 'TSMethodSignature':
        return member.typeAnnotation ?? member.returnType;
      // class methods and declared methods carry returnType directly
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return member.returnType;
      // ESTree class method: function lives on `.value` (FunctionExpression)
      case 'MethodDefinition':
        return member.value?.returnType;
      // property with a function-type annotation: extract its return type
      case 'TSPropertySignature':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      // Flow: ObjectTypeProperty with FunctionTypeAnnotation value
      case 'ObjectTypeProperty':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return null;
  }

  // the callable member's signature-local `<T>` type-parameters (parallel to memberCallReturnAnnotation). a
  // METHOD signature (`take<T>(): T`) carries them on the member; a PROPERTY whose type is a function
  // (`take: <T>(x: T) => T`) carries them on the FUNCTION TYPE annotation, not the member - so shadowing
  // `member.typeParameters` alone misses the fn-type-property shape
  function memberCallTypeParameters(member) {
    switch (member.type) {
      case 'TSMethodSignature':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return member.typeParameters;
      case 'MethodDefinition':
        return member.value?.typeParameters;
      case 'TSPropertySignature':
        return unwrapTypeAnnotation(member.typeAnnotation)?.typeParameters;
      case 'ObjectTypeProperty':
        return unwrapTypeAnnotation(member.value)?.typeParameters;
    }
    return null;
  }

  // resolve a method call's return type from a single (non-union) annotation by walking its members
  //   1. ARGUMENT-MATCH first: TS picks the FIRST overload whose params accept the call args, so
  //      `p.parse(123)` (number) selects `parse(x: number): string`, NOT the declaration-first
  //      `parse(x: string): string[]`. matching by args keeps the precise type-specific helper
  //      (`_atMaybeString`) on a string value instead of the wrong `_atMaybeArray` (ie:11 throw)
  //   2. no arg-match (unresolvable args / no param accepts them) -> fold the resolved returns of all
  //      matching overloads; convergent -> one type, divergent -> null (generic) - a type-specific
  //      Maybe picked off one arm would throw on a foreign return
  function resolveMemberCallReturnFromAnnotation({ annotation, name, scope, resolve, depth, subst, callPath }) {
    const members = getTypeMembers({ objectType: annotation, scope, depth });
    if (!members) return null;
    const matchingMembers = members.filter(m => keyMatchesName(m.key, name) && isCallableMemberShape(m));
    // apply subst so generic alias method returns (`type Box<T> = { get(): T[] }`) bind T
    // through every nested shape (arrays/tuples/unions), not just top-level references. but a method
    // that declares its OWN `<T>` shadows the outer alias's `T`: remap those signature-local params
    // to `unknown` first (shadowMethodTypeParams) so the outer subst can't capture them
    // (`Box<number[]>.get<T>(): T` must stay generic, not resolve the method's T to number[] ->
    // `_atMaybeArray` on the real foreign return, ie:11 throw). dropping instead of shadowing would
    // re-bind the bare `T` to the receiver arg via scope lookup - the same capture.
    // the canon's nullable check runs on the SUBSTITUTED annotation, so it sees the same
    // shape `resolve` failed on; an annotation-less (implicit-any) arm yields null here and
    // the canon widens the whole set to generic
    function substitutedReturn(member) {
      const returnAnnotation = memberCallReturnAnnotation(member);
      if (!returnAnnotation) return null;
      const memberSubst = subst ? shadowMethodTypeParams(memberCallTypeParameters(member), subst) : null;
      return memberSubst ? applyAliasSubstDeep(unwrapTypeAnnotation(returnAnnotation), memberSubst) : returnAnnotation;
    }
    return foldOverloadReturns(matchingMembers, m => m.parameters ?? m.params, member => {
      const substituted = substitutedReturn(member);
      return substituted ? resolve(substituted) : null;
    }, substitutedReturn, callPath);
  }

  // union/intersection method calls - for `x: A | B` or `x: A & B` calling `x.foo()`,
  // resolve in each branch. union folds per-branch return types; intersection picks the
  // first branch that resolves (intersection members are additive, so any match is valid).
  // mirrors findTypeMember's handling for properties
  function resolveMemberCallReturn({ annotation, name, scope, resolve, depth = 0, callPath }) {
    if (depth > MAX_DEPTH) return null;
    // peel a leading TSParenthesizedType (`(A | B).m()`) so followTypeAliasChain sees the raw
    // union / intersection instead of bailing on the wrapper (branch-level peel is peelBranch)
    annotation = peelTSParenthesized(annotation);
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    // peel TSParenthesizedType so a method call on a parenthesized union / intersection branch
    // (`(A | B).m()`, `A & (B)`) resolves through the branch instead of bailing on the wrapper
    function peelBranch(branch) {
      return applySubst(peelTSParenthesized(unwrapTypeAnnotation(branch)), subst);
    }
    function recurse(peeled) {
      return resolveMemberCallReturn({ annotation: peeled, name, scope, resolve, depth: depth + 1, callPath });
    }
    if (isUnionType(aliased)) {
      let result = null;
      for (const branch of aliased.types) {
        const peeled = peelBranch(branch);
        // skip nullable / never branches - they contribute nothing to method-call
        // dispatch (null/undefined have no methods; never is unreachable). without
        // skip, every `Foo | null` shape bails the whole union when the null branch
        // lookup returns null. mirrors `findTypeMember`'s union filter
        if (isNullableOrNeverAnnotation(peeled)) continue;
        const branchResult = recurse(peeled);
        if (!branchResult) return null;
        result = commonType(result, branchResult);
        if (!result) return null;
      }
      return result;
    }
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const branch of aliased.types) {
        const branchResult = recurse(peelBranch(branch));
        if (branchResult) return branchResult;
      }
      return null;
    }
    // generic alias body landing on `T[keyof T]` (or similar computed shape) - getTypeMembers
    // doesn't handle the shape directly. expand manually: get T's structural members, build
    // a synthetic TSUnionType of their value annotations, then recurse self so union dispatch
    // fires per branch. covers `Pick<T> = T[keyof T]` style aliases
    return resolveMemberCallReturnFromAnnotation({
      annotation: aliased ?? annotation, name, scope, resolve, depth, subst, callPath,
    });
  }

  // --- Typed-member dispatcher ---

  function resolveTypedMember(objectPath, name, callPath) {
    let annotation, scope;
    if (t.isIdentifier(objectPath.node)) {
      const binding = getScopeBinding(objectPath.scope, objectPath.node.name, objectPath);
      if (!binding) return null;
      annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
      scope = binding.path.scope;
      // identifier without explicit annotation: route through findExpressionAnnotation so
      // binding init chains get traversed (`const obj = wrap('a')` -> wrap's substituted
      // return -> TSTypeLiteral). without this, `obj.foo()` where obj has no `: T` annotation
      // bails even though the init resolves to a member-bearing type
      if (!annotation) {
        const info = findExpressionAnnotation(objectPath);
        if (info) {
          annotation = unwrapTypeAnnotation(info.annotation);
          scope = info.scope;
        }
      }
    } else {
      // delegate to findExpressionAnnotation for non-identifier shapes so that
      // TS wrappers, call expressions with return annotations, and chain expressions
      // all route through the same annotation lookup (incl. call-site generic subst)
      const info = findExpressionAnnotation(objectPath);
      if (info) {
        annotation = unwrapTypeAnnotation(info.annotation);
        scope = info.scope;
      }
    }
    if (!annotation) return null;
    return resolveMemberOnAnnotation({ annotation, scope, objectPath, name, callPath });
  }

  // the annotation-rooted half of `resolveTypedMember`, split out so a predicate-guard
  // annotation (structural interface target) routes through the SAME machinery as a
  // declared annotation - generics, class refs, method call returns and all
  function resolveMemberOnAnnotation({ annotation, scope, objectPath, name, callPath }) {
    // a bare type-parameter that SHADOWS a same-named class/interface (`function f<Box extends Strs>`
    // over an outer `class Box`) is NOT that declaration: its apparent type is the CONSTRAINT. resolve
    // through the constraint so members come from `Strs`, not the unrelated shadowed `Box`. gated on an
    // actual shadowing decl so non-colliding type-params keep their existing constraint-fallback path
    if (annotation.type === 'TSTypeReference' && annotation.typeName?.type === 'Identifier') {
      const typeParam = findTypeParameter(annotation.typeName.name, scope);
      if (typeParam && findTypeDeclaration([annotation.typeName.name], scope)) {
        if (!typeParam.constraint) return null;
        annotation = typeParam.constraint;
      }
    }
    // discriminated union narrowing: `if (x.kind === 'a') { x.data }` - restrict Foo
    // to the `{ kind:'a'; data: T }` branch. works for any serialisable LHS path
    // (Identifier / `this.x` / `obj.a.b`); computed / call-expression paths bail
    annotation = narrowDiscriminatedUnion(objectPath, annotation, scope) ?? annotation;
    // peel type-alias chain ONLY when it ends in TSTypeQuery (`type Q = typeof X;
    // declare const m: Q`) so the typeof branch below dispatches. peeling unconditionally
    // would break generic alias resolution (`Box<string[]>` -> `{val: T}` loses subst)
    annotation = swapAliasToTSTypeQueryWithSubst(annotation, scope);
    // `x: typeof obj` / `x: typeof fn` - follow TSTypeQuery to runtime binding, delegate there
    if (annotation.type === 'TSTypeQuery') {
      const resolved = resolveTypeQueryBinding(annotation, scope);
      if (resolved?.node) {
        if (t.isObjectExpression(resolved.node)) {
          const result = resolveObjectMember(resolved, name, callPath);
          if (result) return result;
        }
        const ctx = resolveClassContext(resolved);
        if (ctx) return resolveClassMember({ classPath: ctx.classPath, name, isStatic: ctx.isStatic, callPath });
        return null;
      }
      // TSEnumDeclaration has no runtime binding path in `resolveTypeQueryBinding`; route
      // through `resolveAnnotatedMember` so `typeof Enum` member access hits the enum branch
      return resolveAnnotatedMember(annotation, name, scope);
    }
    // `x: Cls` where `Cls` is a real `class` declaration in scope - route method calls through
    // `resolveClassMember` (path-based, body-inference-capable) instead of annotation-only lookup,
    // so unannotated methods like `test() { return this.getStr(); }` still resolve their return type.
    // class type-args from the annotation (`Cls<string>`) propagate as classSubst so method
    // return types referring to class type-params resolve concretely
    if (callPath) {
      const classPath = findClassPathForTypeReference(annotation, scope);
      if (classPath) {
        const result = resolveClassMember({
          classPath, name, isStatic: false, callPath, receiverArgs: getTypeArgs(annotation)?.params,
        });
        if (result) return result;
      }
    }
    // lazily resolve the type-param subst for a generic receiver used without explicit args. follow
    // the alias CHAIN (not just the top alias): a member of `Outer<string>` where `type Outer<A> =
    // Inner<A>` belongs to Inner, so the map must key Inner's params (`{X:string}`), not Outer's
    // (`{A:string}`). keying the top alias lets Outer's `A` binding capture an inner default that
    // lexically references an unrelated outer `type A` - the chain builder is capture-avoiding and
    // gates defaults, so the member type's own default resolves in its decl scope instead
    let defaultMap;
    function resolve(p) {
      if (defaultMap === undefined) defaultMap = followTypeAliasChain(annotation, scope).subst;
      return defaultMap ? substituteTypeParams(p, defaultMap, scope, 0) : resolveTypeAnnotation(p, scope);
    }
    // property access (not a call): delegate to findTypeMember
    if (!callPath) {
      const memberType = findTypeMember({ objectType: annotation, key: name, scope });
      return memberType ? resolve(memberType) : null;
    }
    // method call: merge return types across overloads, recursing into union branches
    return resolveMemberCallReturn({ annotation, name, scope, resolve, callPath });
  }

  // recover a class NodePath from a type-declaration scan: locates the decl by name (bare) or
  // segments (qualified), then lifts the raw node to a real path. covers an ambient `declare class`
  // and namespace-nested classes that babel doesn't bind as scope values; null when not a class
  function classPathFromTypeDeclaration(nameOrSegments, scope) {
    const decl = nameOrSegments && findTypeDeclaration(nameOrSegments, scope);
    return t.isClassDeclaration(decl) ? nodePathInScope(decl, scope, CLASS_PATH_TYPES) : null;
  }

  // resolve `TSTypeReference { typeName: X }` to a NodePath of `class X { ... }` in scope, or null
  // if it points at an interface / non-class. a bare Identifier tries the O(1) value binding first,
  // then falls back to the type-declaration scan for an ambient `declare class` (which babel doesn't
  // bind as a value); a qualified `NS.Cls` / `A.B.Cls` goes straight to that scan
  function findClassPathForTypeReference(annotation, scope) {
    if (annotation?.type !== 'TSTypeReference') return null;
    const { typeName } = annotation;
    if (typeName?.type === 'Identifier') {
      // a type parameter shadowing an outer `class` of the same name (`function f<Box extends ...>`)
      // is NOT that class: babel registers no value binding for the type-param, so getBinding would
      // wrongly return the outer class. bail so the caller resolves the type-param via its constraint
      if (findTypeParameter(typeName.name, scope)) return null;
      const binding = getScopeBinding(scope, typeName.name);
      if (binding) return t.isClassDeclaration(binding.path.node) ? binding.path : null;
      // no value binding -> an ambient `declare class` (oxc binds it, babel doesn't); recover it
      // through the same scan the qualified branch uses so the element type stays parser-consistent
      return classPathFromTypeDeclaration(typeName.name, scope);
    }
    const segments = isQualifiedNameNode(typeName) ? collectQualifiedSegments(typeName) : null;
    return classPathFromTypeDeclaration(segments, scope);
  }

  // runtime analogue of `resolveKeyofSelfValueUnion`: `obj[k]` where `obj: T` (a typeparam)
  // and `k: keyof T` (direct or constrained) folds T's constraint members into a value-union
  function resolveKeyofSelfMemberViaTypeParam(path, objAnnotation, objScope) {
    if (objAnnotation.type !== 'TSTypeReference') return null;
    const name = typeRefName(objAnnotation);
    if (!name) return null;
    const param = findTypeParameter(name, objScope);
    if (!param?.constraint) return null;
    const propInfo = findExpressionAnnotation(path.get('property'));
    const propAnnotation = propInfo && unwrapTypeAnnotation(propInfo.annotation);
    if (!propAnnotation) return null;
    if (!isKeyofTargeting(propAnnotation, objAnnotation, propInfo.scope)) return null;
    const members = getTypeMembers({ objectType: unwrapTypeAnnotation(param.constraint), scope: param.scope });
    if (!members?.length) return null;
    // `obj[k]` (k: keyof T) is a member VALUE. a data property / index value yields its annotation,
    // and a GETTER (`kind === 'get'`) yields its return on access - both readable. but a regular
    // METHOD's value is the function itself (not its return), and a SETTER yields nothing - so a
    // method-shaped member that isn't a getter makes `obj[k]` a Function / undefined, which the
    // readable-value union below can't represent. narrowing then would mis-dispatch (e.g.
    // `_atMaybeArray` on a method that returns an array). bail to the generic helper (sound)
    if (members.some(m => isMethodShapeMember(m.type) && m.kind !== 'get')) return null;
    const valueAnnotations = [];
    for (const m of members) {
      const annotation = m.typeAnnotation ?? m.returnType;
      // an untyped (implicit-any) member makes the union `any` - mirrors the annotation-side
      // keyof-self fold: no surviving-member narrow is sound
      if (!annotation) return null;
      valueAnnotations.push(annotation);
    }
    if (!valueAnnotations.length) return null;
    return foldUnionTypes(valueAnnotations, p => resolveTypeAnnotation(p, param.scope));
  }

  // computed dynamic-key member access via TSIndexSignature: `obj[k]` where
  // `obj: { [key: string]: V }` resolves to V. unions are peeled (skip null/undefined),
  // first remaining branch's index signature wins. returns Type Object or null
  function resolveIndexSignatureMember(path, callPath) {
    const objInfo = findExpressionAnnotation(path.get('object'));
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const keyKind = indexAccessKeyKind(path);
    function lookup(typeNode) {
      return resolveIndexSignatureValue(typeNode, objInfo.scope, subst, keyKind);
    }
    // resolve one index-signature value (`{ annotation, scope }`) to a type. a CALL through the index
    // (`d[k]()`) yields the value's RETURN, not the value itself; a non-function value isn't statically
    // callable (`number[]()` throws at runtime) -> null (generic helper), not the non-callable value type
    function resolveIndexValue(found) {
      if (!found) return null;
      if (callPath) {
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(found.annotation));
        return ret ? resolveTypeAnnotation(ret, found.scope) : null;
      }
      return resolveTypeAnnotation(found.annotation, found.scope);
    }
    if (isUnionType(target)) {
      // WIDEN across the union's per-branch index values (`{ [k]: number[] } | { [k]: string }`): fold them
      // - convergent / compatible containers -> the widened type, DIVERGENT -> null (generic), NOT the first
      // arm (a value matching a later branch would hit a type-specific Maybe and throw at ie:11)
      const infos = target.types
        .map(b => applySubst(unwrapTypeAnnotation(b), subst))
        .filter(b => !isNullableOrNeverAnnotation(b))
        .map(lookup)
        .filter(Boolean);
      if (!infos.length) return resolveKeyofSelfMemberViaTypeParam(path, unwrapped, objInfo.scope);
      const vals = [];
      for (const info of infos) {
        const v = resolveIndexValue(info);
        if (v) {
          vals.push(v);
          continue;
        }
        // an index whose value is a non-nullable type we couldn't resolve makes the union uncertain ->
        // widen rather than collapse to the branches that resolved (a nullable value stays skippable).
        // the CALL case widens identically: a callable arm whose RETURN fails to resolve (or is void)
        // yields null here too, and dropping it would over-narrow the surviving arms into a wrong
        // Maybe - matching the sibling call-return union widens
        if (!isNullableOrNeverAnnotation(unwrapTypeAnnotation(info.annotation))) return null;
      }
      return vals.length ? foldUnionTypes(vals, r => r) : null;
    }
    const info = lookup(target);
    if (info) return resolveIndexValue(info);
    return resolveKeyofSelfMemberViaTypeParam(path, unwrapped, objInfo.scope);
  }

  // --- Runtime dispatch (receiver-aware MemberExpression) ---

  // can any `?.` hop in this member spine short-circuit? walks DOWN the object / callee
  // links: a `?.` hop whose receiver may be nullish (marked / nullable / unresolvable)
  // makes the WHOLE enclosing chain result possibly-undefined. babel encodes hops as
  // dedicated Optional* node types, ESTree as plain member / call hops with `optional`
  // flags - both carry `optional: true` on the `?.` hop itself, so the same walk serves
  // both. ChainExpression (an ESTree wrapper an inner spine link may carry) passes
  // through - babel cannot represent the paren boundary distinctly, so both parsers
  // over-mark the parenthesized `(o?.a).b` form identically (degrade-safe)
  function chainMayShortCircuit(path) {
    for (let cur = path; cur;) {
      const type = cur.node?.type;
      if (type === 'ChainExpression') {
        cur = cur.get('expression');
        continue;
      }
      if (type !== 'MemberExpression' && type !== 'OptionalMemberExpression'
        && type !== 'CallExpression' && type !== 'OptionalCallExpression') return false;
      const next = type === 'CallExpression' || type === 'OptionalCallExpression' ? cur.get('callee') : cur.get('object');
      if (cur.node.optional === true) {
        const receiver = resolveNodeType(next);
        if (!receiver || receiver.mayBeNullish || isNullableOrNever(receiver)) return true;
      }
      cur = next;
    }
    return false;
  }

  // an optional chain short-circuits to undefined instead of throwing, so a member / call
  // result inside one may be undefined at runtime whenever some `?.` hop's receiver may
  // be nullish. plain (non-chain) access on a nullish receiver throws transformed or not,
  // so it stays unmarked (throw parity keeps the receiver narrow sound)
  function resolveFromMemberExpression(path, callPath) {
    const result = resolveFromMemberExpressionInner(path, callPath);
    if (!result || result.mayBeNullish) return result;
    // an optional CALL (`o.m?.()`) short-circuits on a nullish member VALUE (an optional
    // method) - a possibility the receiver spine below the member cannot see, so the
    // `?.()` flag marks the return directly (a required member under `?.()` over-marks,
    // which only degrades a logical fold to generic - safe)
    if (callPath?.node.optional === true) return result.mark('mayBeNullish');
    return chainMayShortCircuit(path) ? result.mark('mayBeNullish') : result;
  }

  function resolveFromMemberExpressionInner(path, callPath) {
    const name = resolveMemberPropertyName(path);
    // empty-string keys (`obj[""]`) are valid static names - only a NULL result means the
    // key is dynamic (a truthiness guard dropped them into the index-signature branch)
    if (name === null || name === undefined) {
      // computed access without a statically-resolvable key (`obj[k]` where k is a
      // dynamic Identifier): if obj has a TSIndexSignature, resolve to its value type.
      // routed via the same annotation-based path as named member access for symmetry
      if (path.node.computed) return resolveIndexSignatureMember(path, callPath);
      return null;
    }
    const originalObjectPath = path.get('object');
    const objectPath = resolveRuntimeExpression(originalObjectPath);
    // `this.X` inside an object-method (possibly through arrow nesting): resolve `this`
    // to the parent ObjectExpression and route through the flow-aware field resolver.
    // mutually exclusive with the class-`this` path - `resolveThisObject` returns null when
    // a closer ClassBody wraps. without this branch, `(() => this.arr)().at(0)` inside an
    // ObjectMethod degrades to generic `_at` even when the literal owns `arr: [...]`
    if (t.isThisExpression(objectPath.node)) {
      const objAnchor = resolveThisObject(originalObjectPath);
      if (objAnchor) {
        const result = resolveObjectFieldFlow(objAnchor, name, callPath);
        if (result) return result;
      }
    }
    if (t.isObjectExpression(objectPath.node)) {
      // resolveObjectFieldFlow is the flow-aware superset of resolveObjectMember: it delegates
      // method / getter / function-valued props to resolveObjectMember, but for a plain data
      // property it folds the init type with every reachable reassignment (`o.data = "s"`) and
      // inside-method `this.data = ...` write, and also covers the missing-property external-write
      // case. routing it FIRST (instead of resolveObjectMember, which returns the init type and
      // is blind to later reassignments) keeps the narrow sound; a null result means an unknown /
      // ambiguous writer set, so we do NOT fall back to the init-type-only path
      const flowResult = resolveObjectFieldFlow(objectPath, name, callPath);
      if (flowResult) return flowResult;
    }
    const ctx = resolveClassContext(objectPath);
    if (ctx) {
      // `viaThis` marks a `this`-rooted static read: the runtime receiver can be a subclass,
      // so a static-field narrow must verify no subclass shadow is reachable
      const result = resolveClassMember({
        classPath: ctx.classPath, name, isStatic: ctx.isStatic, callPath, viaThis: t.isThisExpression(objectPath.node),
      });
      if (result) return result;
    }
    // ambient `declare class X { static make() }` - X reference has no scope binding in babel
    // so `resolveClassContext(objectPath)` misses. fall back to ambient-decl lookup keyed by
    // identifier name; reuses the same class-member resolution path so method-level type-arg
    // substitution (`X.make<string>()`) works the same as for runtime `class X`
    if (objectPath.node?.type === 'Identifier') {
      const ambientClass = findAmbientClassPath(objectPath.node.name, objectPath.scope);
      if (ambientClass) {
        const result = resolveClassMember({ classPath: ambientClass, name, isStatic: true, callPath });
        if (result) return result;
      }
    }
    // try typed member on resolved path first, then on original path (in case resolvePath lost annotation)
    const typed = resolveTypedMember(objectPath, name, callPath)
      || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
    if (typed) return typed;
    // structural predicate narrow: `isF(v)` proves `v` matches interface F inside the
    // guarded branch, but F is structural - no $-Type carries its members, so the typed
    // walks above can't see them. route the predicate's annotation through the same
    // machinery a declared annotation takes (generics / class refs / method call returns)
    if (originalObjectPath.node?.type === 'Identifier') {
      const guard = findAnnotationGuard(originalObjectPath);
      if (guard) {
        return resolveMemberOnAnnotation({
          annotation: unwrapTypeAnnotation(guard.annotation),
          scope: guard.scope,
          objectPath: originalObjectPath,
          name,
          callPath,
        });
      }
    }
    return null;
  }

  // arr[0], arr[1] - numeric index access on array literals
  // element-type precision is only sound while nothing can RETYPE the elements between
  // the array's creation and the read: an element write (`a[0] = "x"`), a mutating method
  // (`a.unshift(v)` / `a.fill(v)`), or ANY escape of the binding (call argument, alias,
  // spread - the holder may write elements) invalidates it. whitelist: a reference is safe
  // only as a member-access READ off the binding with a non-mutating key. the object-field
  // twin consults its external-write fold the same way; destructure-time element reads
  // (`const [x] = a`) copy the value at execution and stay exempt.
  // which methods mutate is registry data (`mutatesElements` markers), not local knowledge;
  // the safe direction is a WHITELIST of known non-mutating methods - a method the registry
  // does not know may be any mutator at runtime, so it bails like a dynamic key
  const ARRAY_METHOD_HINTS = KNOWN_INSTANCE_METHOD_RETURN_TYPES.Array ?? {};
  const ELEMENT_SAFE_METHODS = new Set(Object.entries(ARRAY_METHOD_HINTS)
    .filter(([, hint]) => !hint.mutatesElements).map(([key]) => key));

  // does `parent` still physically hold `node` in one of its slots? an in-place rewrite
  // (a folded call, an optional-chain lowering) reuses parent nodes and swaps their slots,
  // leaving cached reference chains pointing at parents that no longer contain the member
  function nodeHoldsChild(parent, node) {
    for (const slot of Object.values(parent)) {
      if (slot === node) return true;
      if (Array.isArray(slot) && slot.includes(node)) return true;
    }
    return false;
  }

  function arrayElementsMayBeRetyped(objectPath, anchorPath) {
    if (!t.isIdentifier(objectPath.node)) return false;
    const binding = getScopeBinding(objectPath.scope, objectPath.node.name, objectPath);
    if (!binding) return true;
    for (const ref of collectBindingReferences(binding, anchorPath) ?? []) {
      const member = ref.parentPath;
      const memberNode = member?.node;
      // a WHOLE-binding write (plain reassign / update / for-x head) is the FLOW layer's
      // domain: it replaces the value the element read resolves from, so it is not an
      // element retype - a conditional / undominated form already bails upstream, and a
      // dominating one IS the value source (treating it as unsafe over-bailed
      // `x = [[9]]; x[0].at(0)`)
      if (memberNode?.type === 'AssignmentExpression' && memberNode.left === ref.node) continue;
      if (memberNode?.type === 'UpdateExpression' && memberNode.argument === ref.node) continue;
      if ((memberNode?.type === 'ForOfStatement' || memberNode?.type === 'ForInStatement')
        && memberNode.left === ref.node) continue;
      // NON-RETENTIVE reads never leak the reference to a potential writer: a typeof /
      // void / logical-not (any unary but `delete`), a binary comparison / arithmetic
      // (boolean / primitive result), and a bare condition slot (`if (x)`, `c ? ... :`,
      // `switch (x)`). a logical / conditional BRANCH position forwards the reference
      // and stays an escape
      if (memberNode?.type === 'UnaryExpression' && memberNode.operator !== 'delete') continue;
      if (memberNode?.type === 'BinaryExpression') continue;
      if ((memberNode?.type === 'IfStatement' || memberNode?.type === 'WhileStatement'
        || memberNode?.type === 'DoWhileStatement' || memberNode?.type === 'ConditionalExpression')
        && memberNode.test === ref.node) continue;
      if (memberNode?.type === 'SwitchStatement' && memberNode.discriminant === ref.node) continue;
      const isMemberRead = (memberNode?.type === 'MemberExpression' || memberNode?.type === 'OptionalMemberExpression')
        && memberNode.object === ref.node;
      if (!isMemberRead) return true;
      if (isMemberWriteHost(member)) return true;
      // canonical key extraction so a computed-literal spelling (`a["unshift"]`) hits the
      // registry exactly like the dotted form; a CALL through an UNRESOLVED dynamic key
      // (`a[m]("x")`) may be any mutator at runtime, so it bails too - a dynamic-key pure
      // READ stays safe (reading cannot retype)
      const parentOfMember = member.parentPath?.node;
      const calleeOfParent = (parentOfMember?.type === 'CallExpression'
        || parentOfMember?.type === 'OptionalCallExpression')
        && parentOfMember.callee === memberNode;
      // a parent that no longer HOLDS the member was REWIRED by an earlier in-place rewrite
      // (a folded call reuses the CallExpression node and swaps its callee; an optional-chain
      // fold rewires into non-call shapes too). the detached member keeps its original key
      // and the original shape was a use of that member, so a rewired parent classifies
      // exactly like a live callee position. a text-emit pipeline never mutates the tree,
      // so rewired parents cannot occur there
      const rewiredParent = !calleeOfParent && parentOfMember
        && !nodeHoldsChild(parentOfMember, memberNode);
      const key = memberKeyName(memberNode);
      if (calleeOfParent || rewiredParent) {
        if (key === null || key === undefined || !ELEMENT_SAFE_METHODS.has(key)) return true;
      } else if (key !== null && key !== undefined && Object.hasOwn(ARRAY_METHOD_HINTS, key)) {
        // a registry METHOD read OUTSIDE a call position extracts the function value
        // (`const m = a.fill; m(v)` / `use(a.splice)`) - its later call is untrackable,
        // so any known method value leaving the member position bails. non-method keys
        // (element reads, `length`, user data props) stay plain reads
        return true;
      }
    }
    return false;
  }

  function resolveArrayIndexAccess(path) {
    if (!path.node.computed) return null;
    const resolvedProp = resolveRuntimeExpression(path.get('property'));
    if (!isLiteralOf(resolvedProp.node, 'Numeric')) return null;
    const index = resolvedProp.node.value;
    if (!Number.isInteger(index) || index < 0) return null;
    const rawObject = path.get('object');
    const objectPath = resolveRuntimeExpression(rawObject);
    if (arrayElementsMayBeRetyped(rawObject, path)) return null;
    if (t.isArrayExpression(objectPath.node)) return resolveArrayLiteralElement(objectPath, index);
    // a receiver whose RESOLVED type carries an element type (a rest-slice, an inner-typed
    // binding) yields it for a non-negative integer index: the value route above needs a
    // literal array node, but the element family is already proven by the receiver's type
    const objectType = resolveNodeType(objectPath);
    return objectType?.constructor === 'Array' ? resolveInnerType(objectType) : null;
  }

  // collect runtime member-expression segments: bare `E` -> ['E'], non-computed dotted chain
  // `N.E` -> ['N', 'E'], deeper `N.M.E` -> ['N', 'M', 'E']. computed / non-Identifier links
  // bail to null. parallel to type-level `collectQualifiedSegments` (which walks
  // TSQualifiedName) - this one walks runtime MemberExpression chains.
  // `unwrapRuntimeExpr` peels ChainExpression / ParenthesizedExpression / TS_EXPR_WRAPPERS
  // so optional-chained (`N?.E.A`) and cast-wrapped (`(N as typeof N).E.A`) shapes resolve
  // through the enum lookup. OptionalMemberExpression (babel-typed optional chain shape)
  // handled alongside MemberExpression below. without the peels,
  // `resolveEnumMemberAccess` for `N?.E.A` bails on the first hop because `path.node.object`
  // is a ChainExpression / OptionalMember wrapping the chain
  function collectMemberSegments(node) {
    node = unwrapRuntimeExpr(node);
    if (node?.type === 'Identifier') return [node.name];
    if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
    if (node.computed) return null;
    const left = collectMemberSegments(node.object);
    if (!left || node.property?.type !== 'Identifier') return null;
    left.push(node.property.name);
    return left;
  }

  // member access on a TSEnumDeclaration receiver. covers two shapes:
  //   - non-computed `E.A` / `N.E.A` -> enum value-kind primitive (the member's resolved
  //     kind via `resolveEnumMemberKind`, defaulting to number for implicit auto-numbered)
  //   - computed `E[<number-key>]` / `N.E[N.E.A]` -> string (numeric enum reverse mapping).
  //     TS auto-generates `E[E.A] === 'A'` at runtime for numeric enums; without this branch
  //     `v` in `const v = E[E.A]; v.includes('A')` falls back to a generic `_includes`
  //     instead of the string-narrowed variant. computed access with non-numeric key
  //     (forward `E['A']` / index by user expr) bails - those resolve through other paths.
  // namespace-qualified receiver: `findAllEnumDeclarations` accepts segment-array form to walk
  // through TSModuleDeclaration anchors so `namespace N { export enum E {...} }` resolves
  function resolveEnumMemberAccess(path) {
    const segments = collectMemberSegments(path.node.object);
    if (!segments) return null;
    // findAllEnumDeclarations accepts both string and segment array. TS merges multiple `enum E {}`
    // blocks, so a member may live in any block - search them all (a single-block enum yields one)
    const enumDecls = findAllEnumDeclarations(segments, path.scope);
    if (!enumDecls.length) return null;
    // `E.A` (Identifier) / `E['A']` (computed StringLiteral / ESTree Literal) / `` E[`A`] `` / a
    // SE-bearing key `E[(c++, 'A')]` - all look up the same member (staticMemberKeyName folds the SE
    // tail); numeric / dynamic keys fall through to the reverse-map fallback below
    const memberName = staticMemberKeyName(path.node);
    if (memberName !== null) {
      for (const decl of enumDecls) {
        const memberType = resolveEnumMemberType(decl, memberName);
        if (memberType) return memberType;
      }
      return null;
    }
    // `E[E.A]` numeric reverse-map: numeric enum + numeric-typed computed key -> string
    if (!path.node.computed) return null;
    if (enumDecls.some(decl => resolveEnumType(decl)?.type !== 'number')) return null;
    return resolveNodeType(path.get('property'))?.type === 'number' ? new $Primitive('string') : null;
  }

  return {
    resolveMemberCallChain,
    resolveBindingReturnInfo,
    memberCallReturnAnnotation,
    resolveTypedMember,
    findClassPathForTypeReference,
    resolveIndexSignatureMember,
    resolveFromMemberExpression,
    resolveArrayIndexAccess,
    resolveEnumMemberAccess,
  };
}
