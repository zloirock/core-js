// `Awaited<T>` resolution + `await` expression handler. Two parallel surfaces share the
// peel sequence but emit different outputs:
//   - AST walker (`peelAwaitedArgument` / `peelAwaitedCommonSteps`) - preserves shape past
//     `Promise<>` wrappers and union / intersection distribution so callers like
//     `findTypeMember` can recurse into the inner AST and inspect its members directly.
//   - Type walker (`resolveAwaitedAnnotation`) - folds via `commonType` / `foldUnionTypes`
//     and lands in `resolveAnnotationInContext` at terminal. drives
//     `resolveAwaitExpressionType` (await semantics) and the findTypeMember resolved path.
//
// kept in one cluster because the two walkers cross-reference each other: the AST walker uses the
// Type walker's `pickAwaitedConditionalBranch`, and the Type walker uses the AST walker's
// `peelAwaitedCommonSteps`. co-locating them avoids the forward-decl thunks a split would need to
// break the cycle.
//
// Public surface:
//   peelStructurePreservingWrapper(node)
//   unwrapPassthroughWrapper(node, scope)
//   passthroughModifierDelta(node, scope) - the member-flag delta ONE such hop crosses
//   resolveAwaitedAnnotation({ node, scope, depth, typeParamMap, seen })
//   resolveAwaitExpressionType(path)
//   functionTypeParams(node)
//   resolveIndexedAccessMemberAnnotationAST(peeled, scope, depth)
//
// `functionTypeParams` is here because the cluster's local callback-param extractors consume
// it; the factory only forward-declares the name and rebinds it to this cluster's export, so
// this is the sole declaration.
import { MAX_DEPTH, STRUCTURE_PRESERVING_WRAPPERS, dropLeadingThisParam } from './base.js';
import {
  composeModifierDeltas,
  isFunctionTypeNode,
  isMethodShapeMember,
  isObjectTypeLiteral,
  isTypeReferenceNode,
  isUnionType,
  modifierWrapperDelta,
  typeRefSegments,
} from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';
import { createClassMemberShape } from './class-member-shapes.js';

export function createAwaited({
  t,
  babelNodeType,
  findTypeDeclaration,
  unwrapTypeAnnotation,
  peelTSParenthesized,
  indexedAccessKey,
  findTypeMember,
  followTypeAliasChain,
  applySubst,
  unwrapMappedTypePassthrough,
  foldUnionTypes,
  foldIntersectionTypes,
  promiseRefInner,
  unwrapPromise,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveBodyReturnType,
  resolveAnnotationInContext,
  isFunctionLike,
  findClassPathForTypeReference,
  buildSubstMap,
  findClassMember,
  getTypeMembers,
  keyMatchesName,
  findExpressionAnnotation,
  pickConditionalBranchVia,
  isUnconstrainedTypeShape,
}) {
  // same source as every other consumer of these two shape predicates - built from `t` here
  // rather than threaded in, so the cluster does not need a factory thunk for a pure predicate
  const { isMethodMember, isPropertyMember } = createClassMemberShape({ t });

  // --- AST walker (structure-preserving) ---

  // extract the single typeArg of a type-reference whose head is one of the wrapper names
  // accepted by `namePredicate`. shared between `peelStructurePreservingWrapper` (Pick / Omit
  // / Readonly / ...) and `peelAwaitedWrapper` (Awaited<X>) - both unwrap a single-segment
  // TypeReference to its first generic arg, differ only in name predicate and post-extract
  // transform of the arg
  function getSingleTypeRefArg(node, namePredicate) {
    if (!isTypeReferenceNode(node)) return null;
    const segments = typeRefSegments(node);
    if (segments?.length !== 1 || !namePredicate(segments[0])) return null;
    return getTypeArgs(node)?.params?.[0] ?? null;
  }

  // `scope`, when the caller has one, keeps a USER declaration of a wrapper-shaped name from being
  // peeled: `interface Pick<T> { picked: number[] }` is not the global `Pick`, and peeling it hands
  // back the type ARGUMENT in place of the declared shape, so the member lookup lands on the wrong
  // receiver entirely. scope-less callers keep the name-only behaviour
  function peelStructurePreservingWrapper(objectType, scope = null) {
    // `readonly [T, U]` / `readonly T[]` (TSTypeOperator) is a type-level no-op for runtime type
    // resolution - a readonly tuple / array is still a tuple / Array. peel it like the generic
    // `Readonly<...>` wrapper so tuple-index / element resolution treats both spellings identically
    if (objectType?.type === 'TSTypeOperator' && objectType.operator === 'readonly') {
      return unwrapTypeAnnotation(objectType.typeAnnotation);
    }
    const arg = getSingleTypeRefArg(objectType, n => STRUCTURE_PRESERVING_WRAPPERS.has(n)
      && !(scope && findTypeDeclaration([n], scope)));
    return arg ? unwrapTypeAnnotation(arg) : null;
  }

  // apply Awaited semantics at AST level: recursively peel Promise / PromiseLike wrappers,
  // distribute over union / intersection, follow type-alias hops. resolveAwaitedAnnotation
  // returns a Type object (not AST), but callers like findTypeMember need a substituted AST
  // to recurse into - so this helper runs the same peel structurally and returns AST.
  // depth bound matches `followTypeAliasChain`'s budget; cycle prevention via the depth cap.
  // AST walker carries no substitution context: its only entry (`peelAwaitedWrapper`) runs the
  // peel structurally with no typeParamMap. type-param substitution is applied OUTSIDE this
  // walker by findTypeMember at the call site (with the proper alias subst); the Type walker
  // (`resolveAwaitedAnnotation`) is the surface that threads typeParamMap / seen
  function peelAwaitedArgument({ arg, scope, depth }) {
    if (!arg || depth > MAX_DEPTH) return arg;
    const peeled = peelTSParenthesized(unwrapTypeAnnotation(arg));
    function recurse(next) {
      return peelAwaitedArgument({ arg: next, scope, depth: depth + 1 });
    }
    // distribute Awaited over union / intersection. filter null members - a nested
    // union / intersection that collapses to empty `types[]` returns null; carrying
    // nulls into the parent's `.types` crashes findTypeMember's member-walk. drop
    // nulls so surviving branches still narrow.
    // INTENTIONAL DIVERGENCE from `resolveAwaitedAnnotation`'s intersection path: the AST
    // walker only filters null members; the resolved-type walker (`foldIntersectionTypes`)
    // additionally drops plain-Object via `commonType`. different output formats justify the
    // asymmetry - but adding a new intersection-distribution rule MUST update both call sites
    if (peeled.type === 'TSUnionType' || peeled.type === 'UnionTypeAnnotation'
        || peeled.type === 'TSIntersectionType' || peeled.type === 'IntersectionTypeAnnotation') {
      const nextTypes = peeled.types.map(recurse).filter(Boolean);
      return nextTypes.length ? { ...peeled, types: nextTypes } : null;
    }
    // NO tuple arm: `Awaited<T>` unwraps only what `await` unwraps - an object with a callable
    // `then` - and a tuple has none, so `Awaited<[Promise<A>, Promise<B>]>` IS that tuple, elements
    // still promises. distributing it read element 0 as `A` and handed an A-specific helper a
    // Promise. the union arm above is the real distribution: a conditional type distributes over a
    // naked union, which is why `Awaited<Promise<A> | Promise<B>>` does peel and this does not
    // nested `Awaited<Awaited<X>>` - inner Awaited reaches here as a TSTypeReference whose
    // name fails Promise / wrapper / alias-chain checks. peel once so recursion sees the
    // inner X. unique to AST walker - resolveAwaitedAnnotation routes through
    // resolveAnnotationInContext at terminal which handles nested Awaited natively
    const awaitedInner = getSingleTypeRefArg(peeled, n => n === 'Awaited');
    if (awaitedInner) return recurse(awaitedInner);
    // conditional reached via post-subst alias body: pick firing branch (AST-level for
    // literal precision, then resolved-type for primitive disjoint check sides) and recurse
    // on the chosen branch's AST so member-lookup callers see the picked shape directly.
    // undecidable -> return AST as-is so findTypeMember's TSConditionalType branch can try
    // its own AST-only pick downstream. INTENTIONAL DIVERGENCE: resolveAwaitedAnnotation
    // folds both branches via foldUnionTypes instead since it produces a Type Object output
    if (peeled.type === 'TSConditionalType') {
      const branch = pickAwaitedConditionalBranch({ node: peeled, scope, depth });
      if (branch !== null) return recurse(branch ? peeled.trueType : peeled.falseType);
      return peeled;
    }
    const next = peelAwaitedCommonSteps(peeled, scope, depth);
    return next ? recurse(next) : peeled;
  }

  // shared peel sequence between peelAwaitedArgument (AST walker) and resolveAwaitedAnnotation
  // (Type walker): structure-preserving wrapper -> Promise inner -> indexed-access ->
  // type-alias chain. returns next AST node to recurse on, or null when none of these
  // steps fires. callers handle union/intersection/tuple distribution upfront and the
  // TSConditionalType case specially (different fold strategies per output format)
  function peelAwaitedCommonSteps(peeled, scope, depth) {
    const passthrough = peelStructurePreservingWrapper(peeled, scope);
    if (passthrough) return passthrough;
    const promiseInner = promiseRefInner(peeled);
    if (promiseInner) return promiseInner;
    const indexedAST = resolveIndexedAccessMemberAnnotationAST(peeled, scope, depth);
    if (indexedAST) return indexedAST;
    const aliased = followTypeAliasChain(peeled, scope);
    if (aliased?.node && aliased.node !== peeled) return applySubst(aliased.node, aliased.subst);
    return null;
  }

  // shared helper: when `peeled` is TSIndexedAccessType, resolve its member's annotation
  // AST (returns null otherwise). enables Awaited / structure-preserving wrappers that
  // wrap an indexed access to peel down to the member's underlying shape without bouncing
  // through a Type Object intermediate. method-shape members surface the FULL signature
  // (TS spec: `T['method']` = `() => V`, NOT `V`) so downstream consumers can call
  // functionTypeReturnAnnotation / treat as $Object('Function'); without the method probe,
  // babel (member.typeAnnotation = return) and oxc (member.value path) diverge and both
  // misroute - babel emits V as the indexed-access type, oxc emits the method node
  function resolveIndexedAccessMemberAnnotationAST(peeled, scope, depth) {
    if (peeled?.type !== 'TSIndexedAccessType' && peeled?.type !== 'IndexedAccessType') return null;
    const key = indexedAccessKey(peeled.indexType);
    if (key === null) return null;
    const member = findTypeMember({ objectType: peeled.objectType, key, scope, depth: depth + 1 });
    if (!member) return null;
    // a member that IS a function type (Flow keeps the signature on the property's `value`, so the
    // lookup hands back the FunctionTypeAnnotation itself) surfaces whole for the same reason a
    // method signature does - peeling it to `.returnType` below would hand the caller the RESULT
    // where TS hands it the signature, and the caller's own return read then finds nothing
    if (isMethodShapeMember(member.type) || isFunctionTypeNode(member)) return member;
    const annotation = unwrapTypeAnnotation(member.typeAnnotation ?? member.returnType ?? member);
    return annotation && annotation !== peeled ? annotation : null;
  }

  // `Awaited<X>` wrapper: returns the peeled inner X (with Promise / union / intersection
  // distribution applied per Awaited semantics) when `node` is a TSTypeReference to Awaited;
  // null for any other shape. used by findTypeMember so member access through `Awaited<T>`
  // walks T's members directly (TS spec: Awaited<T> = T when T is not Promise-like).
  // findTypeMember reaches Awaited<T> member-access through here; the AST-level pick + alias
  // chase resolve the inner shape with no substitution context (substitution is applied by the
  // caller). the conditional-branch resolved-fallback only fires when AST + alias miss
  function peelAwaitedWrapper(node, scope, depth = 0) {
    const arg = getSingleTypeRefArg(node, n => n === 'Awaited');
    return arg ? peelAwaitedArgument({ arg, scope, depth }) : null;
  }

  // unified passthrough detection: structure-preserving wrapper (`Readonly<T>`, `Partial<T>`,
  // ...), `Awaited<T>` (Promise peel + distribute), OR trivial mapped-type passthrough
  // (`{ [K in keyof T]: T[K] }`). all are structurally identical to their inner type for
  // property-lookup purposes; callers recurse findTypeMember on the unwrapped inner with
  // accumulated subst applied
  // `depth` is the caller's remaining budget: this peel and the member lookup that drives it
  // recurse into each other, so a wrapper reached at depth D must continue from D - restarting
  // the count here gave the pair a fresh budget on every hop and no termination guarantee
  function unwrapPassthroughWrapper(node, scope, depth = 0) {
    return peelStructurePreservingWrapper(node, scope)
      ?? peelAwaitedWrapper(node, scope, depth)
      ?? (node?.type === 'TSMappedType' ? unwrapMappedTypePassthrough(node) : null);
  }

  // the member-flag delta ONE `unwrapPassthroughWrapper` hop crosses. it is not always the
  // outermost wrapper's: the `Awaited<T>` walker peels through structure-preserving wrappers,
  // Promise layers, indexed accesses and alias hops on its own, so `Awaited<Promise<Partial<I>>>`
  // loses every layer in a single hop and a top-level read answers for none of them. walk the
  // walker's OWN steps - outermost first, so an inner `Required<>` cannot override the
  // `Partial<>` above it - and stop exactly where the peel stopped.
  // `endpoint` is what the peel answered: a walk that does not land on it took a different route,
  // and deltas it collected were never crossed, so the outermost read is all we can honestly
  // claim there. without that bound `Partial<Promise<Required<I>>>` would apply the `Required<>`
  // the peel never reached
  function passthroughModifierDelta(node, scope, endpoint, depth = 0) {
    let delta = null;
    for (let cur = node, hops = 0; cur && hops <= MAX_DEPTH; hops++) {
      if (cur === endpoint) return delta;
      delta = composeModifierDeltas(delta, modifierWrapperDelta(cur));
      const next = peelAwaitedCommonSteps(cur, scope, depth)
        ?? getSingleTypeRefArg(cur, n => n === 'Awaited')
        ?? (cur.type === 'TSMappedType' ? unwrapMappedTypePassthrough(cur) : null);
      if (!next) break;
      cur = unwrapTypeAnnotation(next);
    }
    return modifierWrapperDelta(node);
  }

  // --- Type walker (resolved-type fold) ---

  // `Awaited<T>` semantics mirror TS's distributive recursive conditional:
  //   - `Awaited<Promise<U>>` -> `Awaited<U>` (peel one layer, recurse)
  //   - `Awaited<A | B>`      -> `Awaited<A> | Awaited<B>` (distribute, fold members)
  //   - `Awaited<A & B>`      -> `Awaited<A> & Awaited<B>` (distribute, fold intersection).
  //     `Promise<X> & {tag: 'X'}` peels Promise via the recursion + foldIntersectionTypes
  //     drops the plain Object branch, leaving X. without this, `Awaited<Promise<X> & Y>`
  //     bottoms out via `resolveAnnotationInContext` which folds intersection AFTER both
  //     branches resolve - Promise<X> survives as a Promise object (not peeled to X).
  //     INTENTIONAL DIVERGENCE from `peelAwaitedArgument`'s AST intersection path which
  //     only drops null members: resolved-type fold here additionally drops plain-Object
  //     via `commonType`. different output formats justify the asymmetry - update both
  //     sites when adding new intersection-distribution semantics
  //   - `Awaited<C ? T : F>`  -> pick branch when statically decidable, recurse on picked
  //     so Awaited semantics applies post-pick. without this, multi-hop alias chains whose
  //     body is a conditional (`type A<X> = X extends string ? never : Promise<X[]>`) bottom
  //     out via `resolveAnnotationInContext` which evaluates the conditional but loses the
  //     outer Awaited wrapper - falseBranch resolves to `Promise<X[]>` instead of `X[]`
  //   - `Awaited<TypeAlias>`  -> follow the alias chain, retry
  //   - otherwise              -> resolve T as-is
  // distributing at the AST stage preserves union/intersection shape past `Promise<>`
  // wrappers - resolved-type fold collapses `Promise<T> | U` / `Promise<T> & U` because
  // Promise's `constructor` differs from U's; distributing first turns into `T | U` /
  // `T & U` which CAN fold (when T and U share a constructor for unions, or when
  // intersection's plain-Object branch is dropped). depth + cycle bounds match
  // `followTypeAliasChain`'s budget
  function resolveAwaitedAnnotation({ node, scope, depth, typeParamMap, seen }) {
    if (!node || depth > MAX_DEPTH) return null;
    // oxc preserves `(T)` as TSParenthesizedType (babel strips); must peel before the
    // union / intersection / Promise check or distribution misses the inner shape
    const peeled = peelTSParenthesized(unwrapTypeAnnotation(node));
    function recurse(next) {
      return resolveAwaitedAnnotation({ node: next, scope, depth: depth + 1, typeParamMap, seen });
    }

    if (isUnionType(peeled)) {
      return foldUnionTypes(peeled.types, recurse);
    }
    if (peeled.type === 'TSIntersectionType' || peeled.type === 'IntersectionTypeAnnotation') {
      return foldIntersectionTypes(peeled.types, recurse);
    }
    // NO tuple arm here either, for the reason its AST-walker twin states: a tuple has no callable
    // `then`, so `Awaited<Tuple>` IS that tuple and `p[0]` is the element as written. a tuple of
    // promises bottoming out as `Array<Promise>` is the CORRECT answer, not the miss the arm here
    // was added to repair
    // post-subst alias body landing on a conditional must be evaluated BEFORE the alias-chain
    // re-walk so Awaited<picked-branch> recurses with the chosen AST. undecidable -> fold both
    // branches under Awaited (mirrors TS's distributive widening). INTENTIONAL DIVERGENCE
    // from peelAwaitedArgument: AST walker returns peeled as-is for undecidable, Type walker
    // folds to a single Type Object output
    if (peeled.type === 'TSConditionalType') {
      const branch = pickAwaitedConditionalBranch({ node: peeled, scope, depth, typeParamMap, seen });
      if (branch !== null) return recurse(branch ? peeled.trueType : peeled.falseType);
      return foldUnionTypes([peeled.trueType, peeled.falseType], recurse);
    }
    const next = peelAwaitedCommonSteps(peeled, scope, depth);
    if (next) return recurse(next);
    const resolved = resolveAnnotationInContext({ node, scope, depth: depth + 1, typeParamMap, seen });
    // the terminal sees a FREE type-param through the caller's map, but the peel steps above
    // only fire on annotation SHAPES - a param substituted to Promise<X[]> reaches here with
    // its promise layer intact and must still be awaited (it resolved to the raw Promise and
    // dropped the member lookup)
    if (resolved?.constructor === 'Promise') return unwrapPromise(resolved);
    // `Awaited<T>` unwraps a structural thenable on exactly the contract `await` does, and the peel
    // that answers it already exists - it was wired to the await lane alone, so the annotation form
    // (`Awaited<MyThenable>`) resolved to the thenable OBJECT instead of what its `then` hands on
    return peelUserThenable(peeled, scope) ?? resolved;
  }

  // pick a conditional-type branch in Awaited contexts: prefer AST-level literal precision
  // (`'a' extends 'a'`), then resolve check / extend with caller's typeParamMap so
  // post-applySubst free type-param refs see their substitutions, then dispatch to
  // pickConditionalBranch. returns true / false / null (undecidable - caller folds /
  // returns AS-IS). shared between resolveAwaitedAnnotation and peelAwaitedArgument
  function pickAwaitedConditionalBranch({ node, scope, depth, typeParamMap, seen }) {
    return pickConditionalBranchVia({
      checkAST: node.checkType,
      extendsAST: node.extendsType,
      resolveOne: ast => resolveAnnotationInContext({ node: ast, scope, depth: depth + 1, typeParamMap, seen }),
      isUnconstrained: isUnconstrainedTypeShape(node.extendsType, typeParamMap),
    });
  }

  // best-effort `await call()` Type resolution: when the resolved type is the bare
  // `Promise<unknown>` (no annotation precision via the annotation chain), peek at the
  // callee's body to look for a concrete `return` value. relies on the existing recursive
  // body-fold but invoked only when annotation-derived narrowing has bailed - the
  // annotation path's wider distributive Awaited semantics over conditionals / generic
  // unions / undecidable conditionals collapses to null, but the body's actual return
  // statement often pins a runtime-precise type. example: `async fn(): Promise<X | string>
  // { return [1,2,3]; }` - annotation gives null (Array vs primitive disjoint); body
  // return narrows to Array<number>. resolveBodyReturnType commonType-folds multi-return
  // disagreements so this never widens beyond what TS itself would infer
  function resolveAwaitedFromCallBody(argument) {
    const type = babelNodeType(argument.node);
    if (type !== 'CallExpression' && type !== 'OptionalCallExpression') return null;
    const fnPath = resolveRuntimeExpression(argument.get('callee'));
    if (!isFunctionLike(fnPath?.node)) return null;
    const bodyType = resolveBodyReturnType(fnPath, argument);
    if (!bodyType) return null;
    return bodyType.constructor === 'Promise' ? unwrapPromise(bodyType) : bodyType;
  }

  // babel quirk: TSFunctionType / FunctionTypeAnnotation store params under `parameters`
  // (the binding-annotation shape), not `params` (which is for ClassMethod / function decls).
  // see `resolveBindingReturnInfo` for the same disambiguation. shared accessor keeps the
  // shape probe in one place; readers don't have to remember which slot applies where
  function functionTypeParams(node) {
    return node?.parameters ?? node?.params ?? null;
  }

  // peel callback's first-arg annotation. cb node may be Identifier with typeAnnotation
  // (babel ClassMethod / ESTree FunctionExpression params) - extract its function-type then
  // walk to the first arg's annotation. babel quirk: TSFunctionType uses `parameters`, not
  // `params`; `functionTypeParams` covers both. returns null when shape isn't a function-type
  function cbFirstArgAnnotation(cbNode) {
    const cbType = unwrapTypeAnnotation(cbNode?.typeAnnotation);
    if (!isFunctionTypeNode(cbType)) return null;
    return unwrapTypeAnnotation(dropLeadingThisParam(functionTypeParams(cbType))?.[0]?.typeAnnotation);
  }

  // peel a function-type annotation slot into its first parameter node. used for property-
  // form `then` whose typeAnnotation IS the function type (`then: (cb) => ...`) - the cb
  // sits at that type's first parameter slot, one extra unwrap layer beyond method-form's
  // direct `parameters[0]` access. same dialect pair as the callback peeler below it: the
  // method form is parser-agnostic already, so a narrower list here would resolve a Flow
  // `then` method but bail on the Flow property spelling of the same interface
  function firstParamOfFnTypeAnnotation(typeAnnotation) {
    const fnType = unwrapTypeAnnotation(typeAnnotation);
    if (!isFunctionTypeNode(fnType)) return null;
    return dropLeadingThisParam(functionTypeParams(fnType))?.[0];
  }

  // extract the `cb` parameter from a `then` member. covers all shapes returned by both
  // direct class-body walks and `getTypeMembers`:
  //   - TSMethodSignature  (`then(cb: ...)` in iface)   -> functionTypeParams[0]
  //   - TSPropertySignature (`then: (cb: ...) => ...`)  -> peel the fn type, [0]
  //   - ObjectTypeProperty (Flow iface / object type, method AND property spelling alike)
  //                                                     -> same peel off the `value` slot
  //   - ClassMethod / MethodDefinition (`then(cb)`)     -> ESTree node.value.params[0]
  //                                                        babel node.params[0]
  //   - ClassProperty / PropertyDefinition (`then!: (cb) => ...`) -> peel the fn type
  // class shapes appear in the fall-through path when a type alias resolves to a user
  // Thenable class - `getTypeMembers` walks the class body and returns native shapes
  function memberThenCbParam(member) {
    if (!member) return null;
    if (member.type === 'TSMethodSignature') return dropLeadingThisParam(functionTypeParams(member))?.[0];
    if (member.type === 'TSPropertySignature') return firstParamOfFnTypeAnnotation(member.typeAnnotation);
    // Flow keeps the member's type on `value` for both spellings - a `then(cb)` method in a Flow
    // interface is an ObjectTypeProperty carrying a FunctionTypeAnnotation, not a method node
    if (member.type === 'ObjectTypeProperty') return firstParamOfFnTypeAnnotation(member.value);
    if (isMethodMember(member)) return dropLeadingThisParam((member.value ?? member).params)?.[0];
    if (isPropertyMember(member)) return firstParamOfFnTypeAnnotation(member.typeAnnotation);
    return null;
  }

  // resolve a `then` cb's first-arg annotation under Awaited semantics, not flatly: a cb-arg
  // typed `Promise<X>` / `PromiseLike<X>` / nested thenable means `await x` yields X, so the
  // Awaited recursion must run or the awaited value stays typed as the inner Promise and the
  // inner element's polyfill is dropped. for plain (non-thenable) arg types this bottoms out
  // identically to a flat resolve
  function resolveThenableCbArgAwaited(valueAnn, scope) {
    return resolveAwaitedAnnotation({ node: valueAnn, scope, depth: 0 });
  }

  // structural Thenable peel: `await x` where x has `then(cb: (v: T) => ...): any`
  // resolves to T per TS Thenable contract. plugin's named-PROMISE_SYNONYMS covers Promise /
  // PromiseLike / Thenable aliases but misses user classes / interfaces with structural .then.
  // class path via `findClassMember` (handles babel + ESTree shapes); fall-through via
  // `getTypeMembers` covers type-aliases pointing to a user class - members come back in
  // their native node shape (ClassMethod / MethodDefinition / TSMethodSignature / ...),
  // unified through `memberThenCbParam`. both sides end in `cbFirstArgAnnotation`, then
  // `resolveThenableCbArgAwaited` for the recursive Awaited flatten
  function peelUserThenable(annotation, scope) {
    // accept a qualified-name TSTypeReference (`NS.MyThenable<T>`) and a structural object-literal
    // thenable (`{ then(cb: (v: T) => any): void }` or an alias resolving to one): getTypeMembers
    // handles TSTypeLiteral directly, so the structural peel below works for it. only the class-path
    // lookup is TSTypeReference-specific (findClassPathForTypeReference resolves typeRefSegments)
    if (isTypeReferenceNode(annotation)) {
      const classPath = findClassPathForTypeReference(annotation, scope);
      if (classPath) {
        const classSubst = buildSubstMap(classPath.node.typeParameters?.params, getTypeArgs(annotation)?.params, scope);
        const found = findClassMember({ classPath, name: 'then', isStatic: false, classSubst });
        if (found) {
          const valueAnn = cbFirstArgAnnotation(memberThenCbParam(found.member.node));
          // subst applied to the AST BEFORE the awaited walk so a generic cb-arg
          // (`(v: T) => any`) is concrete when the recursive Promise-peel runs
          if (valueAnn) return resolveThenableCbArgAwaited(found.subst ? applySubst(valueAnn, found.subst) : valueAnn, scope);
        }
        // class body lacks `then` - fall through to interface-path because TS
        // declaration-merging puts `then` on a merged `interface Foo {}` companion.
        // `getTypeMembers` (collectClassLikeMembers) includes merged-iface members
        // alongside class body, so the structural peel catches the merged-only shape
      }
    } else if (!isObjectTypeLiteral(annotation)) return null;
    const members = getTypeMembers({ objectType: annotation, scope });
    const thenMember = members?.find(m => keyMatchesName(m.key, 'then', scope, m.computed));
    const valueAnn = cbFirstArgAnnotation(memberThenCbParam(thenMember));
    return valueAnn ? resolveThenableCbArgAwaited(valueAnn, scope) : null;
  }

  // await expression resolution: Promise / PromiseLike / Thenable named aliases unwrap via
  // `unwrapPromise` + annotation Awaited<T> machinery; user-defined structural thenables
  // route through `peelUserThenable`; everything else stays AS-IS per `await x` semantics
  function resolveAwaitExpressionType(path) {
    const argument = path.get('argument');
    const type = resolveNodeType(argument);
    const annotationInfo = findExpressionAnnotation(argument);
    const annotation = annotationInfo && unwrapTypeAnnotation(annotationInfo.annotation);
    // structural Thenable peel (`then(cb: (v:T) => ...)`) applies whenever the receiver is not a
    // Promise: both when it resolved to a non-Promise nominal (interface / class -> Object) AND
    // when it didn't resolve to a nominal at all (an object-literal `{ then() }`, or an alias to
    // one, resolves to a null receiver type). a non-Promise type with no thenable returns unchanged
    if (type?.constructor !== 'Promise') {
      const thenable = annotation && peelUserThenable(annotation, annotationInfo.scope);
      if (thenable) return thenable;
      if (type) return type;
    }
    // recursively unwrap Promise<Promise<...T>> -> T
    const peeled = unwrapPromise(type);
    if (peeled) return peeled;
    // annotation fallback: route through `resolveAwaitedAnnotation` so multi-hop alias
    // chains (`type MyPromise<X> = Promise<X>`), conditional bodies, and union /
    // intersection distribution apply per `Awaited<T>` semantics. a bare `resolveTypeAnnotation`
    // peel only handles a direct `Promise<X>` ref, leaving aliased / conditional
    // / union shapes resolving as `$Object('Promise')` - misroutes downstream member
    // dispatch (Promise.<x> isn't in built-in definitions, so polyfill emission skipped)
    const annotated = annotation && resolveAwaitedAnnotation({ node: annotation, scope: annotationInfo.scope, depth: 0 });
    if (annotated) return annotated;
    return resolveAwaitedFromCallBody(argument);
  }

  // public surface exposes only what factory / other clusters consume; AST<->Type
  // cross-references (peelAwaitedCommonSteps, pickAwaitedConditionalBranch,
  // getSingleTypeRefArg, peelAwaitedArgument,
  // peelAwaitedWrapper, resolveAwaitedFromCallBody,
  // peelUserThenable, cbFirstArgAnnotation) live as private closures inside the cluster.
  // `resolveIndexedAccessMemberAnnotationAST` exposed so call-resolution can peel
  // `T['key']` annotations on binding callees (`type M = T['m']; declare const fn: M; fn()`)
  return {
    peelStructurePreservingWrapper,
    unwrapPassthroughWrapper,
    passthroughModifierDelta,
    resolveAwaitedAnnotation,
    resolveAwaitExpressionType,
    functionTypeParams,
    resolveIndexedAccessMemberAnnotationAST,
  };
}
