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
// Merging removes one cluster boundary the factory had to chase: runtime `member-dispatch`
// previously consumed `resolveTypedMember` / `resolveIndexSignatureMember` from typed
// `member-resolution`. Both now live in the same closure.
//
// `findExpressionAnnotation` / `substituteTypeParams` / `applySubst` / `applyAliasSubstDeep` /
// `functionTypeReturnAnnotation` thunk through forward-decl `let` bindings
import { MAX_DEPTH, $Primitive, nodePathInScope } from './base.js';
import { collectQualifiedSegments, isQualifiedNameNode, peelTSParenthesized, typeRefName } from './ast-shapes.js';
import { isAmbientFunctionNode } from './name-resolution.js';
import { getTypeArgs, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
import { memberKeyName } from '../helpers/class-walk.js';

const CLASS_PATH_TYPES = ['ClassDeclaration'];

export function createMemberResolve({
  t,
  isLiteralOf,
  unwrapTypeAnnotation,
  getTypeMembers,
  keyMatchesName,
  findBindingAnnotation,
  findExpressionAnnotation,
  functionTypeReturnAnnotation,
  applyAliasSubstDeep,
  foldUnionTypes,
  followTypeAliasChain,
  applySubst,
  isNullableOrNeverAnnotation,
  commonType,
  narrowDiscriminatedUnion,
  swapAliasToTSTypeQueryWithSubst,
  resolveTypeQueryBinding,
  resolveObjectMember,
  resolveClassContext,
  resolveClassMember,
  resolveAnnotatedMember,
  buildDefaultTypeParamMap,
  substituteTypeParams,
  resolveTypeAnnotation,
  findTypeMember,
  findTypeDeclaration,
  findTypeParameter,
  isKeyofTargeting,
  resolveIndexSignatureValue,
  resolveMemberPropertyName,
  resolveRuntimeExpression,
  resolveThisObject,
  resolveObjectFieldFlow,
  findAmbientClassPath,
  resolveArrayLiteralElement,
  findEnumDeclaration,
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
    const binding = scope.getBinding(node.name);
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

  // extract the return type annotation from a method/property call signature
  function memberCallReturnAnnotation(member) {
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

  // resolve a method call's return type from a single (non-union) annotation by walking
  // its members and folding the return types of all matching overloads
  //   1. Skip overloads with unresolvable return types (don't bail the entire merge)
  //   2. Try lenient `foldUnionTypes` over the resolved set
  //   3. If that fails (divergent primitives etc.), fall back to the FIRST resolved overload.
  //      Interface signatures are tried in declaration order; TS picks the first matching one,
  //      so falling back to "first" is a reasonable approximation when we can't run full
  //      argument-type-based overload selection
  function resolveMemberCallReturnFromAnnotation({ annotation, name, scope, resolve, depth, subst }) {
    const members = getTypeMembers({ objectType: annotation, scope, depth });
    if (!members) return null;
    const resolvedReturns = [];
    for (const member of members) {
      if (!keyMatchesName(member.key, name)) continue;
      const returnAnnotation = memberCallReturnAnnotation(member);
      if (!returnAnnotation) continue;
      // apply subst so generic alias method returns (`type Box<T> = { get(): T[] }`) bind T
      // through every nested shape (arrays/tuples/unions), not just top-level references
      const substituted = subst ? applyAliasSubstDeep(unwrapTypeAnnotation(returnAnnotation), subst) : returnAnnotation;
      const resolved = resolve(substituted);
      if (resolved) resolvedReturns.push(resolved);
    }
    if (!resolvedReturns.length) return null;
    if (resolvedReturns.length === 1) return resolvedReturns[0];
    return foldUnionTypes(resolvedReturns, r => r) ?? resolvedReturns[0];
  }

  // union/intersection method calls - for `x: A | B` or `x: A & B` calling `x.foo()`,
  // resolve in each branch. union folds per-branch return types; intersection picks the
  // first branch that resolves (intersection members are additive, so any match is valid).
  // mirrors findTypeMember's handling for properties
  function resolveMemberCallReturn({ annotation, name, scope, resolve, depth = 0 }) {
    if (depth > MAX_DEPTH) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    // peel TSParenthesizedType so a method call on a parenthesized union / intersection branch
    // (`(A | B).m()`, `A & (B)`) resolves through the branch instead of bailing on the wrapper
    const peelBranch = branch => applySubst(peelTSParenthesized(unwrapTypeAnnotation(branch)), subst);
    const recurse = peeled => resolveMemberCallReturn({ annotation: peeled, name, scope, resolve, depth: depth + 1 });
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
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
      annotation: aliased ?? annotation, name, scope, resolve, depth, subst,
    });
  }

  // --- Typed-member dispatcher ---

  function resolveTypedMember(objectPath, name, callPath) {
    let annotation, scope;
    if (t.isIdentifier(objectPath.node)) {
      const binding = objectPath.scope?.getBinding(objectPath.node.name);
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
    // lazily resolve default type parameter map for generic types used without explicit type arguments
    let defaultMap;
    const resolve = p => {
      if (defaultMap === undefined) defaultMap = buildDefaultTypeParamMap(annotation, scope);
      return defaultMap ? substituteTypeParams(p, defaultMap, scope, 0) : resolveTypeAnnotation(p, scope);
    };
    // property access (not a call): delegate to findTypeMember
    if (!callPath) {
      const memberType = findTypeMember({ objectType: annotation, key: name, scope });
      return memberType ? resolve(memberType) : null;
    }
    // method call: merge return types across overloads, recursing into union branches
    return resolveMemberCallReturn({ annotation, name, scope, resolve });
  }

  // resolve `TSTypeReference { typeName: X }` to a NodePath of `class X { ... }` in scope,
  // or null if the reference points at an ambient / interface / non-class. bare Identifier
  // uses O(1) scope-binding lookup; qualified `NS.Cls` / `A.B.Cls` walks AST via
  // `findTypeDeclaration` then recovers the NodePath via `classNodePathInScope` (rare slow
  // path: babel doesn't bind TS `namespace` declarations as scope values)
  function findClassPathForTypeReference(annotation, scope) {
    if (annotation?.type !== 'TSTypeReference') return null;
    const { typeName } = annotation;
    if (typeName?.type === 'Identifier') {
      const binding = scope?.getBinding(typeName.name);
      return binding && t.isClassDeclaration(binding.path.node) ? binding.path : null;
    }
    const segments = isQualifiedNameNode(typeName) ? collectQualifiedSegments(typeName) : null;
    const decl = segments && findTypeDeclaration(segments, scope);
    return decl && t.isClassDeclaration(decl) ? nodePathInScope(decl, scope, CLASS_PATH_TYPES) : null;
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
    const valueAnnotations = members
      .map(m => m.typeAnnotation ?? m.returnType)
      .filter(Boolean);
    if (!valueAnnotations.length) return null;
    return foldUnionTypes(valueAnnotations, p => resolveTypeAnnotation(p, param.scope));
  }

  // computed dynamic-key member access via TSIndexSignature: `obj[k]` where
  // `obj: { [key: string]: V }` resolves to V. unions are peeled (skip null/undefined),
  // first remaining branch's index signature wins. returns Type Object or null
  function resolveIndexSignatureMember(path) {
    const objInfo = findExpressionAnnotation(path.get('object'));
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const lookup = typeNode => resolveIndexSignatureValue(typeNode, objInfo.scope, subst);
    const info = (target.type === 'TSUnionType' || target.type === 'UnionTypeAnnotation')
      ? target.types
        .map(b => applySubst(unwrapTypeAnnotation(b), subst))
        .filter(b => !isNullableOrNeverAnnotation(b))
        .map(lookup)
        .find(Boolean)
      : lookup(target);
    if (info) return resolveTypeAnnotation(info.annotation, info.scope);
    return resolveKeyofSelfMemberViaTypeParam(path, unwrapped, objInfo.scope);
  }

  // --- Runtime dispatch (receiver-aware MemberExpression) ---

  function resolveFromMemberExpression(path, callPath) {
    const name = resolveMemberPropertyName(path);
    if (!name) {
      // computed access without a statically-resolvable key (`obj[k]` where k is a
      // dynamic Identifier): if obj has a TSIndexSignature, resolve to its value type.
      // routed via the same annotation-based path as named member access for symmetry
      if (path.node.computed) return resolveIndexSignatureMember(path);
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
    return resolveTypedMember(objectPath, name, callPath)
      || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
  }

  // arr[0], arr[1] - numeric index access on array literals
  function resolveArrayIndexAccess(path) {
    if (!path.node.computed) return null;
    const resolvedProp = resolveRuntimeExpression(path.get('property'));
    if (!isLiteralOf(resolvedProp.node, 'Numeric')) return null;
    const index = resolvedProp.node.value;
    if (!Number.isInteger(index) || index < 0) return null;
    const objectPath = resolveRuntimeExpression(path.get('object'));
    if (!t.isArrayExpression(objectPath.node)) return null;
    return resolveArrayLiteralElement(objectPath, index);
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
  // namespace-qualified receiver: `findEnumDeclaration` accepts segment-array form to walk
  // through TSModuleDeclaration anchors so `namespace N { export enum E {...} }` resolves
  function resolveEnumMemberAccess(path) {
    const segments = collectMemberSegments(path.node.object);
    if (!segments) return null;
    // findEnumDeclaration accepts both string and segment array - single-segment arrays
    // cache through the same key as their joined-string form (`['E'].join('.') === 'E'`)
    const enumDecl = findEnumDeclaration(segments, path.scope);
    if (!enumDecl) return null;
    // `E.A` (Identifier) / `E['A']` (computed StringLiteral / ESTree Literal) / `` E[`A`] ``
    // - all look up the same member; numeric keys fall through to the reverse-map fallback
    const memberName = memberKeyName(path.node);
    if (memberName !== null) return resolveEnumMemberType(enumDecl, memberName);
    // `E[E.A]` numeric reverse-map: numeric enum + numeric-typed computed key -> string
    if (!path.node.computed) return null;
    if (resolveEnumType(enumDecl)?.type !== 'number') return null;
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
