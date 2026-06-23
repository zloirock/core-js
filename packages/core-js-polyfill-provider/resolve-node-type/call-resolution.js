// Call-expression return type + expression annotation resolution. consolidates two tightly
// coupled walkers:
//   - call-return: dispatches `foo()` / `obj.method()` / aliased static / typeof-binding calls
//     to a return type. handles four callee shapes (method / direct / indirect / static alias /
//     typeof-binding) and bottoms out via `resolveCallReturnTypeFromAnnotation` when runtime
//     resolution fails (cast-on-callee `(fn as () => T)()`, `declare const f: () => T`, ...)
//   - expression-annotation: finds the raw TS / Flow annotation of an arbitrary expression
//     path. peels TS wrappers (TSAsExpression / TSSatisfiesExpression / TSTypeAssertion /
//     TSNonNullExpression / TSInstantiationExpression / TypeCastExpression /
//     ParenthesizedExpression / ChainExpression), follows Identifier bindings through const
//     chains, resolves MemberExpressions through the object's annotation, and walks Call /
//     OptionalCall callees to their declared return annotation with call-site type-arg subst
//
// kept in one cluster because the two walkers cross-reference each other:
// `findExpressionAnnotation` consults `functionTypeReturnAnnotation` on call-callee
// annotations; `resolveCallReturnTypeFromAnnotation` consults `findExpressionAnnotation` on
// the callee path. co-location avoids forward-decl thunks between the two walkers.
//
// Public surface:
//   resolveCallReturnType(callee)                     - main call-return entry
//   resolveCallReturnTypeFromAnnotation(callee)       - fallback for callees with no runtime
//                                                       resolution (cast / ambient / typeof)
//   functionTypeReturnAnnotation(node)                - cross-dialect return-slot extractor
//   staticPairFromDestructure(scope, name)            - destructure-alias static resolver
//   findExpressionAnnotation(path, depth?)            - { annotation, scope } | null
//   resolveMemberAnnotation(path, depth)              - obj.prop annotation resolution
//   resolveMemberInTypeMembers({ typeNode, propName, scope, subst }) - member-by-name lookup
//   resolveIndexSignatureValue(typeNode, scope, subst) - TSIndexSignature member resolution
//   buildCallSiteSubst(fnNode, callNode)              - explicit `<...>` args -> subst Map
//   inferCallSiteSubst(fnNode, callPath, depth)       - implicit T inference from arg annot
//
// `staticPairFromPolyfillEntry` stays in the factory because it's consumed by the
// binding-analysis cluster instantiated upstream (factory function declaration is hoisted;
// moving it here would force a cluster-instantiation-order rework)
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';
import { MAX_DEPTH, dropLeadingThisParam } from './base.js';
import { isUnionType, primitiveTypeKind, selectOverloadByArgKinds, typeRefName } from './ast-shapes.js';
import { getTypeArgs, isCleanDestructureAliasBinding } from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

export function createCallResolution({
  t,
  babelNodeType,
  getScopeBinding,
  babelBindingAdapter,
  isMemberLike,
  isMutatedStatic = () => false,
  isFunctionLike,
  isNullableOrNever,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveReturnType,
  findAmbientFunctionPath,
  findAmbientFunctionPaths,
  resolveFromMemberExpression,
  resolveKnownStaticReturnType,
  resolveStaticReturnFromHint,
  resolveKnownInstanceMember,
  KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  staticPairFromPolyfillEntry,
  lookupNested,
  KNOWN_STATIC_METHOD_RETURN_TYPES,
  findDestructuredKeyPath,
  swapAliasToTSTypeQueryWithSubst,
  resolveReturnTypeFromTypeQuery,
  resolveTypeAnnotation,
  unwrapTypeAnnotation,
  getMemberProperty,
  followTypeAliasChain,
  applySubst,
  applyAliasSubstDeep,
  isNullableOrNeverAnnotation,
  getTypeMembers,
  keyMatchesName,
  findBindingAnnotation,
  narrowUnionByAssignmentLiteral,
  buildSubstMap,
  typeParamName,
  effectiveParam,
  resolveIndexedAccessMemberAnnotationAST,
}) {
  // --- Call-return dispatch ---

  function resolveMemberCallType(memberPath, callPath) {
    return resolveFromMemberExpression(memberPath, callPath)
      || resolveKnownStaticReturnType(memberPath, callPath)
      || resolveKnownInstanceMember(memberPath, KNOWN_INSTANCE_METHOD_RETURN_TYPES);
  }

  function resolveCallReturnType(callee, signatureKind = 'call') {
    // method call: obj.method() or obj?.method()
    if (isMemberLike(callee)) {
      // receiver is statically undefined/null/never -> chain is broken at runtime; propagate
      // the same to downstream so `fn(){}; fn().at(0).includes(1)` doesn't half-polyfill
      const receiverType = resolveNodeType(callee.get('object'));
      if (receiverType && isNullableOrNever(receiverType)) return receiverType;
      return resolveMemberCallType(callee, callee.parentPath);
    }
    // direct call: foo() / IIFE: (() => expr)() / ambient TSDeclareFunction follow-through
    const resolved = resolveRuntimeExpression(callee);
    if (isFunctionLike(resolved.node)) return resolveReturnType(resolved, callee.parentPath);
    // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
    if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
    // aliased static-method call. probe callee user-facing name first (injector alias
    // covers post-rewrite `const from = _Array$from` / destructure / default-with-fallback
    // shapes), then walked-resolved Identifier as fallback when alias-map missed
    if (t.isIdentifier(callee.node)) {
      const aliased = resolveAliasedStaticReturn(callee, callee.parentPath);
      if (aliased) return aliased;
    }
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const aliased = resolveAliasedStaticReturn(resolved, callee.parentPath);
      if (aliased) return aliased;
    }
    // ambient `declare function` (not in scope.bindings) keyed by Identifier name. cast-on-
    // callee shapes (`(fn as () => T)()`, `fn!()`) hit `findExpressionAnnotation` below
    if (t.isIdentifier(callee.node)) {
      const ambient = selectAmbientFunctionOverload(callee.node.name, callee.scope, callee.parentPath);
      if (ambient) return resolveReturnType(ambient, callee.parentPath);
    }
    // chained alias `const f = getArr; f()`: ambient probe by callee name 'f' missed; retry
    // against walked Identifier so the ambient return type reaches downstream member chains
    if (resolved.node?.type === 'Identifier' && resolved.node !== callee.node) {
      const ambient = selectAmbientFunctionOverload(resolved.node.name, resolved.scope, callee.parentPath);
      if (ambient) return resolveReturnType(ambient, callee.parentPath);
    }
    return resolveCallReturnTypeFromAnnotation(callee, signatureKind);
  }

  // ambient `declare function` overloads are arg-discriminated like interface method overloads: pick the
  // overload whose params match the call args (shared `selectOverloadByArgKinds`), else the first declared.
  // a single declaration returns itself; the call return then comes from the SELECTED overload, not always
  // the first (`declare function parse(x: string): string[]; parse(x: number): string` on `parse(123)`)
  function selectAmbientFunctionOverload(name, scope, callPath) {
    const paths = findAmbientFunctionPaths(name, scope);
    if (!paths.length) return null;
    const argPaths = callPath?.get('arguments') ?? [];
    const argKinds = argPaths.map(a => primitiveTypeKind(resolveNodeType(a)?.type));
    return selectOverloadByArgKinds(paths, p => p.node.params, argKinds) ?? paths[0];
  }

  // resolve aliased static-method call return type. tries each alias shape's extractor
  // until one yields a (constructor, method) pair, then runs the shared registry lookup.
  // both extractors return null for non-matching shapes so the caller order doesn't
  // matter for correctness - polyfilled-entry first only because it's the cheaper probe
  function resolveAliasedStaticReturn(callee, callPath) {
    const pair = staticPairFromPolyfillEntry(callee.scope, callee.node.name)
      ?? staticPairFromDestructure(callee.scope, callee.node.name, callee);
    if (!pair) return null;
    // aliased patched static (`const af = Array.from` after `Array.from = ...`) - same drop to generic
    if (isMutatedStatic(pair.constructor, pair.method)) return null;
    const retHint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, pair.constructor, pair.method);
    // delegate to the shared hint resolver so an aliased `freeze(a)` honors `returnsArgument` /
    // Promise.resolve arg-inference exactly like the direct `Object.freeze(a)` - not just the
    // declared hint, which would drop the array narrow to the generic 'Object'
    return retHint ? resolveStaticReturnFromHint({ objectName: pair.constructor, memberName: pair.method, hint: retHint, callPath }) : null;
  }

  // resolve `const { from } = Array` / nested `const { a: { from } } = wrapper` patterns
  // to a (constructor, method) pair. `findDestructuredKeyPath` peels shorthand / rename /
  // AssignmentPattern wrappers; init walk delegated to `walkStaticReceiverChain`.
  // reassigned bindings bail (current value may differ from pattern-init), except the
  // single-violation `let x; ({x} = Source)` shape which routes to `pairFromAssignmentDestructure`
  function staticPairFromDestructure(scope, name, path = null) {
    const binding = getScopeBinding(scope, name, path);
    if (!binding?.path) return null;
    if (binding.constantViolations?.length) {
      // same clean-alias gate the injector's `registerBodyExtractAlias` applies, so the value-flow
      // route and the alias-entry route agree on which assignment-destructures resolve to a static
      if (!isCleanDestructureAliasBinding(binding)) return null;
      // normalize the violation up to its enclosing AssignmentExpression: babel reports the AE
      // itself, but estree-toolkit reports the LHS Identifier (walk up Property / ObjectPattern).
      // without this the assignment-destructure aliased-static return resolves on babel but null
      // on unplugin - asymmetric injection for identical source
      const assignment = violationToAssignment(binding.constantViolations[0]);
      return assignment ? pairFromAssignmentDestructure(assignment, name, binding.scope) : null;
    }
    return pairFromDeclaratorDestructure(binding, name);
  }

  // walk a constant-violation NodePath up to its enclosing AssignmentExpression (babel: the
  // violation already IS the AE; estree: it is the LHS Identifier nested in Property/ObjectPattern)
  function violationToAssignment(violation) {
    let p = violation;
    for (let i = 0; i < MAX_DEPTH && p; i++) {
      const type = babelNodeType(p.node);
      if (type === 'AssignmentExpression') return p;
      if (type === 'ExpressionStatement' || type === 'Program') return null;
      p = p.parentPath;
    }
    return null;
  }

  function pairFromDeclaratorDestructure(binding, name) {
    let declarator = binding.path;
    while (declarator && !t.isVariableDeclarator(declarator.node)) declarator = declarator.parentPath;
    if (!declarator) return null;
    const { id, init } = declarator.node;
    if (id?.type !== 'ObjectPattern' || !init) return null;
    return pairFromPatternAndSource({ pattern: id, source: init, name, scope: declarator.scope, path: declarator });
  }

  // `let x; ({x} = Source)` style: violationPath is the AssignmentExpression containing
  // the destructure pattern. only `=` operator counts (`x ??= ...` / `x ||= ...` would
  // narrow only when Source matches the operator's discharge condition - skip for safety)
  function pairFromAssignmentDestructure(violationPath, name, scope) {
    const node = violationPath?.node;
    if (node?.type !== 'AssignmentExpression' || node.operator !== '=') return null;
    if (node.left?.type !== 'ObjectPattern' || !node.right) return null;
    return pairFromPatternAndSource({ pattern: node.left, source: node.right, name, scope, path: violationPath });
  }

  function pairFromPatternAndSource({ pattern, source, name, scope, path = null }) {
    const keyPath = findDestructuredKeyPath(pattern, name, scope);
    if (!keyPath?.length) return null;
    // thread the anchor `path` so the estree adapter resolves a function-scope-hoisted var
    // source (`if (c) { var G = Array } const { from } = G`) the same way babel does; without
    // it the static-receiver walk loses the source binding and the narrow diverges
    const constructor = walkStaticReceiverChain({
      receiverNode: source, walkPath: keyPath.slice(0, -1), scope, adapter: babelBindingAdapter, path,
    });
    if (!constructor || !hasOwn(KNOWN_STATIC_METHOD_RETURN_TYPES, constructor)) return null;
    return { constructor, method: keyPath.at(-1) };
  }

  // a callable / constructable object type (`{ (): T }` / `{ new (): T }`, or the same shapes in
  // an interface body) carries its signature as a member rather than as a bare TSFunctionType /
  // TSConstructorType; pick the LAST matching member (overloads resolve to the last ambient
  // signature) so the shared return-extraction treats it like `() => T` / `new () => T`
  function lastSignature(members, signatureType) {
    let sig = null;
    for (const member of members || []) if (member.type === signatureType) sig = member;
    return sig;
  }

  // both babel and oxc store the return type on `.returnType` for TSFunctionType /
  // TSConstructorType / TSMethodSignature / TSDeclareMethod / ClassMethod / ClassPrivateMethod
  // (Flow FunctionTypeAnnotation too); the `node.typeAnnotation ??` arm below is defensive and
  // currently never populated for these kinds on either parser.
  // ESTree MethodDefinition and its abstract sibling TSAbstractMethodDefinition wrap the function
  // in `.value` so the return type lives one level deeper (oxc emits `abstract m(): T` as the
  // latter). consumers (e.g. ReturnType<typeof X.method>) call into this when `findTypeMember`
  // returns the raw signature instead of a synthetic stub. call / construct signatures peeled out
  // of an object type (`{ (): T }` / `{ new (): T }`) by the caller also land on the sig-node arm
  function functionTypeReturnAnnotation(node) {
    if (!node) return null;
    switch (node.type) {
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'TSMethodSignature':
      case 'TSDeclareMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSCallSignatureDeclaration':
      case 'TSConstructSignatureDeclaration':
        return node.typeAnnotation ?? node.returnType;
      case 'MethodDefinition':
      case 'TSAbstractMethodDefinition':
        return node.value?.returnType ?? node.value?.typeAnnotation;
      case 'FunctionTypeAnnotation':
        return node.returnType;
      default:
        return null;
    }
  }

  // extract return type from a binding's function-type annotation:
  //   `declare const f: () => T` / `const f: (x: X) => T = ...` / Flow `(x: X) => T` /
  //   `const f: typeof other` (follow TSTypeQuery to referenced function's return) /
  //   `type M = T['method']; declare const f: M` (peel TSIndexedAccessType to method node)
  function resolveCallReturnTypeFromAnnotation(callee, signatureKind = 'call') {
    const info = findExpressionAnnotation(callee);
    if (!info) return null;
    let annotation = unwrapTypeAnnotation(info.annotation);
    if (!annotation) return null;
    // follow alias chain to TSTypeQuery: `type Q<T> = typeof fn<T>` (TS 4.7+ instantiation
    // wrapped in generic alias). without the swap, downstream `functionTypeReturnAnnotation`
    // treats Q<...> as a TSTypeReference and returns null
    annotation = swapAliasToTSTypeQueryWithSubst(annotation, info.scope);
    if (annotation?.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(annotation, info.scope);
    // TSIndexedAccessType callee annotation (`T['method']` directly OR via alias `type M =
    // T['method']`). follow the alias chain to surface the indexed-access body, then peel
    // through findTypeMember. method-shape detection (Layer 2) returns the full signature,
    // not just its return, so functionTypeReturnAnnotation below extracts the substituted
    // return slot. without the peel, indexed-access aliases bypass call narrowing entirely
    // follow the alias chain (carrying generic subst) BEFORE extracting the return, so a fn-type
    // alias (`type F = () => number[]`) or generic one (`type Mk<T> = () => T[]; f: Mk<number>`)
    // surfaces its TSFunctionType - the bare TSTypeReference is not a function-type node, so
    // `functionTypeReturnAnnotation` would bail to the generic helper. an indexed-access alias still
    // peels through `findTypeMember` first; a non-function alias yields null (generic), as before
    const aliased = followTypeAliasChain(annotation, info.scope);
    let target = aliased.subst ? applyAliasSubstDeep(aliased.node, aliased.subst) : aliased.node;
    if (target?.type === 'TSIndexedAccessType') {
      const peeled = resolveIndexedAccessMemberAnnotationAST(target, info.scope, 0);
      if (peeled) target = peeled;
    }
    let ret = functionTypeReturnAnnotation(target);
    // a callable / constructable object type or interface (`{ (): T }` / `interface C { new (): T }`)
    // carries its signature as a member, not a bare function-type node. resolve the type's members
    // (getTypeMembers handles inline literals, interface merge / extends, and generic-arg subst) and
    // peel the signature matching the context - a CALL narrows through the call signature, a `new`
    // through the construct signature, so the two never cross-resolve (`new` on a call-only type
    // stays unresolved instead of narrowing to the call return)
    if (!ret) {
      const sigType = signatureKind === 'construct' ? 'TSConstructSignatureDeclaration' : 'TSCallSignatureDeclaration';
      const sig = lastSignature(getTypeMembers({ objectType: target, scope: info.scope }), sigType);
      if (sig) ret = functionTypeReturnAnnotation(sig);
    }
    return ret ? resolveTypeAnnotation(ret, info.scope) : null;
  }

  // --- Expression annotation walker ---

  // resolve obj.prop annotation by chaining through the object's type, applying generic subst.
  // unions like `Foo | null` peel null/undefined/never branches and resolve member in the
  // first remaining branch (mirrors the `member-resolve` cluster's union handling); without
  // this peel, deep optional chains `arr?.b.c.includes(1)` lose receiver type narrowing past
  // the second hop because `arr` annotation `{b:...}|null` makes `getTypeMembers` bail.
  // computed access without statically-known name (`obj[k]` where k isn't a literal) falls
  // back to TSIndexSignature lookup via `resolveIndexSignatureValue`
  function resolveMemberAnnotation(path, depth) {
    const propName = getMemberProperty(path.node);
    const objInfo = findExpressionAnnotation(path.get('object'), depth + 1);
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const keyKind = propName === null ? indexAccessKeyKind(path) : null;
    const lookup = typeNode => propName === null
      ? resolveIndexSignatureValue(typeNode, objInfo.scope, subst, keyKind)
      : resolveMemberInTypeMembers({ typeNode, propName, scope: objInfo.scope, subst });
    if (isUnionType(target)) {
      for (const branch of target.types) {
        const peeled = applySubst(unwrapTypeAnnotation(branch), subst);
        if (isNullableOrNeverAnnotation(peeled)) continue;
        const result = lookup(peeled);
        if (result) return result;
      }
      return null;
    }
    return lookup(target);
  }

  // member-by-name lookup against a single (non-union) type's structural members.
  // TSMethodSignature non-getter members yield the SIGNATURE itself - `obj.method` is a
  // function value; callers chain into `functionTypeReturnAnnotation` to peel the return.
  // Flow's `ObjectTypeProperty` stores the type in `m.value` (covers both property shape
  // AND method shape where value is a FunctionTypeAnnotation); fallback after the TS slots
  function resolveMemberInTypeMembers({ typeNode, propName, scope, subst }) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    for (const m of members) {
      if (!keyMatchesName(m.key, propName)) continue;
      // honor accessor kind like findTypeMember: a setter is write-only - skip to a paired getter
      // (else its signature is mis-read as the readable member type); a getter falls through to its
      // RETURN type; a plain method yields the full signature
      if (m.type === 'TSMethodSignature' && m.kind === 'set') continue;
      const isMethodProper = m.type === 'TSMethodSignature' && m.kind !== 'get';
      const raw = isMethodProper ? m : (m.typeAnnotation ?? m.returnType ?? m.value);
      if (!raw) continue;
      return { annotation: applySubst(raw, subst), scope };
    }
    return null;
  }

  // classify the dynamic key of a computed member access (`obj[k]`) as 'string' | 'number' |
  // 'symbol' so the matching index signature is selected; null when the key type is unresolvable
  function indexAccessKeyKind(memberPath) {
    const kind = resolveNodeType(memberPath.get('property'))?.type;
    return kind === 'string' || kind === 'number' || kind === 'symbol' ? kind : null;
  }

  // `obj[k]` where `obj: { [key: K]: V }` - resolve to V via TSIndexSignature member, selecting
  // the signature whose key type matches the access-key kind: a symbol key picks only a symbol
  // signature, a number key prefers number then string (numeric keys coerce to string), a string
  // key never picks number/symbol. an unresolvable key falls back to the first signature; null on
  // miss. mirrors the static-key `pickIndexSignature` (type-members) which the dynamic path bypassed
  function resolveIndexSignatureValue(typeNode, scope, subst, keyKind) {
    const members = typeNode ? getTypeMembers({ objectType: typeNode, scope }) : null;
    if (!members) return null;
    let numberSig = null;
    let stringSig = null;
    let symbolSig = null;
    let firstSig = null;
    for (const m of members) {
      if (m.type !== 'TSIndexSignature' || !m.typeAnnotation) continue;
      firstSig ??= m.typeAnnotation;
      const sigKey = unwrapTypeAnnotation(m.parameters?.[0]?.typeAnnotation)?.type;
      if (sigKey === 'TSNumberKeyword') numberSig ??= m.typeAnnotation;
      else if (sigKey === 'TSSymbolKeyword') symbolSig ??= m.typeAnnotation;
      else stringSig ??= m.typeAnnotation;
    }
    let picked;
    switch (keyKind) {
      case 'symbol': picked = symbolSig; break;
      case 'number': picked = numberSig ?? stringSig; break;
      case 'string': picked = stringSig; break;
      default: picked = firstSig;
    }
    return picked ? { annotation: applySubst(picked, subst), scope } : null;
  }

  // find the raw type annotation of an expression (follows bindings and const chains).
  // memoized by path.node identity - `resolveFromMemberExpression` invokes this twice when
  // the resolved and original object paths differ, and recursive descents revisit common
  // ancestors; cache amortises the per-call O(chain-length) walk to a single pass per node
  let expressionAnnotationCache = new WeakMap();
  function findExpressionAnnotation(path, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    if (!path?.node) return null;
    const cached = expressionAnnotationCache.get(path.node);
    if (cached !== undefined) return cached;
    const result = computeExpressionAnnotation(path, depth);
    expressionAnnotationCache.set(path.node, result);
    return result;
  }

  function resetExpressionAnnotationCache() {
    expressionAnnotationCache = new WeakMap();
  }

  function computeExpressionAnnotation(path, depth) {
    // path.node may be null on orphaned paths or stub slots - bail safely instead of
    // crashing on `.type` access. matches the defensive shape used elsewhere
    // ESTree preserves ParenthesizedExpression - unwrap
    if (path.node.type === 'ParenthesizedExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    // ESTree wraps optional chains in ChainExpression (babel inlines); peel so the
    // inner MemberExpression hits its own branch below and resolves through the object
    if (path.node.type === 'ChainExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
      || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
      return { annotation: path.node.typeAnnotation, scope: path.scope };
    }
    if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
      return findExpressionAnnotation(path.get('expression'), depth + 1);
    }
    if (t.isIdentifier(path.node)) {
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) return null;
      const annotation = findBindingAnnotation(binding.path);
      if (annotation) {
        // narrow declared union via the last straight-line assignment's literal-property
        // shape: TS treats `let f: Foo = init; f = { kind: 'b', ... }` as narrowing `f`
        // to FooB after the assignment. without this `f.data` after the assignment
        // resolves on the declared union and emits the generic polyfill
        const narrowed = narrowUnionByAssignmentLiteral(path, annotation, binding.path.scope);
        return { annotation: narrowed ?? annotation, scope: binding.path.scope };
      }
      if (!binding.constantViolations?.length && t.isVariableDeclarator(binding.path.node)) {
        const init = binding.path.get('init');
        if (init.node) return findExpressionAnnotation(init, depth + 1);
      }
    }
    // obj.prop / obj?.prop - resolve property type through the object's annotation chain,
    // carrying generic substitutions so `Wrapper<string>.inner.value()` resolves T -> string.
    // `resolveMemberAnnotation` self-guards on shape; null fall-through to the call branch below
    const memberResult = resolveMemberAnnotation(path, depth);
    if (memberResult) return memberResult;
    // direct `f()`: pull the callee's declared return type and substitute explicit call-site
    // type args (`makeBox<number>()`) so downstream member lookups see concrete types
    const callType = babelNodeType(path.node);
    if (callType === 'CallExpression' || callType === 'OptionalCallExpression') {
      let fnPath = resolveRuntimeExpression(path.get('callee'));
      // ambient `declare function f<T>(...): R` - babel doesn't bind the name, so
      // resolveRuntimeExpression returns the bare Identifier. fall back to ambient lookup
      // (mirrors `resolveCallReturnType`'s ambient branch) so call-return annotations on
      // ambient generic fns get the same call-site subst as runtime fns
      if (t.isIdentifier(fnPath.node) && !isFunctionLike(fnPath.node)) {
        const ambient = findAmbientFunctionPath(fnPath.node.name, fnPath.scope);
        if (ambient) fnPath = ambient;
      }
      if (isFunctionLike(fnPath.node) && fnPath.node.returnType) {
        // explicit `<...>` args; argument inference fallback (`makeBox(arr)` lifts arr's
        // annotation onto T). without subst, generic return `{value: T}` leaks unsubstituted
        const subst = inferCallSiteSubst(fnPath.node, path, depth) ?? buildCallSiteSubst(fnPath.node, path.node, path.scope);
        const rawReturn = unwrapTypeAnnotation(fnPath.node.returnType);
        const annotation = subst ? applyAliasSubstDeep(rawReturn, subst) : rawReturn;
        return { annotation, scope: fnPath.scope };
      }
      // typed method call `w.inner.value()`: only function-shaped annotations produce a
      // return type. non-function property annotations bail to keep downstream chains sound
      const callee = path.get('callee');
      if (callee.node.type === 'MemberExpression' || callee.node.type === 'OptionalMemberExpression') {
        const memberInfo = findExpressionAnnotation(callee, depth + 1);
        if (memberInfo) {
          const unwrappedMember = unwrapTypeAnnotation(memberInfo.annotation);
          const ret = functionTypeReturnAnnotation(unwrappedMember);
          if (ret) return { annotation: ret, scope: memberInfo.scope };
        }
      }
      // function-typed const callee: `declare const f: () => T; f().X` - extract returnType
      // from the binding's annotation. without this, `getObj()?.a.includes(...)` loses
      // receiver narrowing past the call hop because findExpressionAnnotation falls through
      if (callee.node.type === 'Identifier') {
        const calleeInfo = findExpressionAnnotation(callee, depth + 1);
        const calleeAnnot = calleeInfo?.annotation && unwrapTypeAnnotation(calleeInfo.annotation);
        const ret = functionTypeReturnAnnotation(calleeAnnot);
        if (ret) return { annotation: ret, scope: calleeInfo.scope };
      }
    }
    return null;
  }

  // call-site explicit type args (`makeBox<number>()`) -> {paramName -> argNode}
  // `scope` threads to buildSubstMap's capture-avoidance: an explicit instantiation arg that is a
  // bare reference colliding with a function type-param name (`fn<T, U>` called `<X, T>`) is resolved
  // to its declaration body so the transitive subst can't recapture it (`U -> T -> X`)
  function buildCallSiteSubst(fnNode, callNode, scope) {
    return buildSubstMap(fnNode.typeParameters?.params, getTypeArgs(callNode)?.params, scope);
  }

  // infer T -> argAnnotation from runtime arg annotations when caller omits `<...>`
  // (`makeBox(arr)` with `function makeBox<T>(t: T)`). limited to direct `T` param shapes
  // (no container wrappers); SpreadElement bails whole inference since positional mapping breaks
  function inferCallSiteSubst(fnNode, callPath, depth) {
    if (getTypeArgs(callPath.node)?.params?.length) return null;
    const fnTypeParams = fnNode.typeParameters?.params;
    if (!fnTypeParams?.length) return null;
    const paramNames = new Set(fnTypeParams.map(typeParamName).filter(Boolean));
    const args = callPath.get('arguments');
    if (args.some(a => a.node?.type === 'SpreadElement')) return null;
    // drop the leading `this` pseudo-param so param annotations align with the call args
    const params = dropLeadingThisParam(fnNode.params);
    const subst = new Map();
    const limit = Math.min(params.length, args.length);
    for (let i = 0; i < limit; i++) {
      if (!params[i] || !args[i]) continue;
      const { param } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param?.typeAnnotation);
      const name = paramAnnotation && typeRefName(paramAnnotation);
      if (!name || !paramNames.has(name) || subst.has(name)) continue;
      const argInfo = findExpressionAnnotation(args[i], depth + 1);
      const argAnnot = argInfo?.annotation && unwrapTypeAnnotation(argInfo.annotation);
      if (argAnnot) subst.set(name, argAnnot);
    }
    if (!subst.size) return null;
    // fill un-inferred params from their declared defaults so a partial inference doesn't
    // shadow `f<T, U = T[]>(t: T)` defaults at the call site. without this the `??` to
    // `buildCallSiteSubst` is skipped (subst is non-null) and U's default never propagates;
    // downstream typeparam-scope lookup recovers U as TSTypeReference but loses the inferred
    // T binding when walking through U's default (T's scope-lookup has no value)
    for (const p of fnTypeParams) {
      const name = typeParamName(p);
      if (name && !subst.has(name) && p.default) subst.set(name, p.default);
    }
    return subst;
  }

  // cluster-private: `resolveMemberAnnotation` / `resolveMemberInTypeMembers` /
  // `inferCallSiteSubst` (consumed only by `findExpressionAnnotation` / `resolveCallReturnType`
  // internally)
  return {
    resolveCallReturnType,
    resolveCallReturnTypeFromAnnotation,
    functionTypeReturnAnnotation,
    staticPairFromDestructure,
    findExpressionAnnotation,
    resolveIndexSignatureValue,
    indexAccessKeyKind,
    buildCallSiteSubst,
    resetExpressionAnnotationCache,
  };
}
