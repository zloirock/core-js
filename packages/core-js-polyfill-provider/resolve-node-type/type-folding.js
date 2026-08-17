// Type-fold + tuple-resolution helpers. consolidates:
//   - tuple structural ops (`unwrapTupleMember` / `isTupleRestElement` / `tupleElements` /
//     `rebuildTupleElements` / `tupleAsArrayType` / `resolveParametersParams` /
//     `findTupleElement`) - cross-dialect tuple AST traversal + Parameters / ConstructorParameters
//     dispatch
//   - type equality + commonType fold (`typesEqual` / `innersEqual` / `commonType`) - outer
//     constructor match + inner equality probe; commonType strips inner on mismatch
//   - nullable / never predicates (`isNullableOrNever` / `isNullableOrNeverAnnotation`)
//   - unified fold (`foldTypes` / `foldUnionTypes` / `foldIntersectionTypes`) - union / inter-
//     section / tuple member folding with classify-based BAIL / SKIP / FOLD semantics
//   - resolved-side tuple folding (`resolveTupleInner`) - tuple elements -> common inner via
//     the unified fold path with `isTupleRestElement` distribution
//   - annotation-context resolvers (`resolveAnnotationInContext` /
//     `resolveNonNullableAnnotation`) - utility-type aware annotation resolution that honours
//     the caller's type-param map; the non-nullable variant strips null / undefined / never
//
// Cluster is instantiated early (between known-globals and type-expansion) so its outputs
// flow into every downstream cluster as direct destructure refs. forward-declared let
// thunks cover late cluster outputs (`extractElementAnnotation` from element-types,
// `resolveTypeQueryBinding` from type-query, `peelStructurePreservingWrapper` from awaited)
// and the factory `let` chain (`resolveTypeAnnotation` / `substituteTypeParams` /
// `applySubst` / `applyAliasSubstDeep`).
import {
  MAX_DEPTH,
  NULLABLE_NEVER_ANNOTATIONS,
  $Object,
  $Primitive,
  dropLeadingThisParam,
  hasLeadingThisParam,
} from './base.js';
import {
  composeModifierDeltas, isUnionType, modifierWrapperDelta, typeRefName, withMemberModifiers,
} from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeFolding({
  t,
  resolveRuntimeExpression,
  effectiveParam,
  resolveInnerType,
  substituteTypeParams,
  applySubst,
  applyAliasSubstDeep,
  peelStructurePreservingWrapper,
  followTypeAliasChain,
  extractElementAnnotation,
  resolveTypeQueryBinding,
  pickLastAmbientOverload,
  findClassPathForTypeReference,
  peelTSParenthesized,
  unwrapTypeAnnotation,
}) {
  function unwrapTupleMember(element) {
    let node = element;
    // peel TSNamedTupleMember and TSRestType wrappers in any order:
    // [name: string] -> TSNamedTupleMember -> elementType
    // [...number[]] -> TSRestType -> typeAnnotation
    // [...rest: string[]] -> TSRestType -> TSNamedTupleMember -> elementType
    for (let i = 0; i < 2; i++) {
      if (node.type === 'TSNamedTupleMember') node = node.elementType;
      else if (node.type === 'TSRestType') node = node.typeAnnotation;
      else break;
    }
    return node;
  }

  function isTupleRestElement(element) {
    const unwrapped = element.type === 'TSNamedTupleMember' ? element.elementType : element;
    return unwrapped.type === 'TSRestType';
  }

  // get tuple element list: TS uses elementTypes, Flow uses types
  function tupleElements(node) {
    return node.elementTypes || node.types;
  }

  // rebuild tuple AST with elements mapped through `mapper`. preserves the dialect's element
  // slot name (TS: elementTypes, Flow: types) so downstream consumers see the same shape
  function rebuildTupleElements(node, mapper) {
    const slot = node.elementTypes ? 'elementTypes' : 'types';
    return { ...node, [slot]: node[slot].map(mapper) };
  }

  // collapse TSTupleType / TupleTypeAnnotation to Array<commonInner> via resolveTupleInner.
  // empty tuple -> Array<null> (no inner). shared by resolveTypeAnnotation,
  // substituteTypeParams, resolveAwaitedAnnotation - same shape, different per-element resolver
  function tupleAsArrayType(node, resolver) {
    const elements = tupleElements(node);
    return new $Object('Array', elements?.length ? resolveTupleInner(elements, resolver) : null);
  }

  // params list of the function/class referenced by `Parameters<typeof fn>` /
  // `ConstructorParameters<typeof Cls>`. classes without an own constructor inherit - walk
  // `extends` chain until own params (plain function) or a `constructor` method surface
  // the signature a signature-reading utility's first argument NAMES, plus the binding its alias hop
  // carries. `Parameters` / `ConstructorParameters` / `ThisParameterType` all begin here and differ
  // only in which slot they take afterwards - holding the walk in one place is what stops them
  // drifting apart about which spellings they understand, which they already did once
  function utilityArgumentSignature(typeRef, scope) {
    const arg = getTypeArgs(typeRef)?.params?.[0];
    const peeled = peelTSParenthesized(unwrapTypeAnnotation(arg));
    const { node: aliased, subst } = followTypeAliasChain(peeled, scope);
    return { arg, signature: aliased ? peelTSParenthesized(aliased) : peeled, subst };
  }

  function resolveParametersParams(typeRef, scope) {
    const name = typeRefName(typeRef);
    if (name !== 'Parameters' && name !== 'ConstructorParameters') return null;
    // an INLINE signature - or an alias to one - carries its params right here; the `typeof` lane
    // below is the indirection, not the requirement. each name takes the signature kind it is
    // defined over (`Parameters` a CALL signature, `ConstructorParameters` a construct one), so a
    // crossed spelling stays unresolved instead of answering off the wrong shape
    const { arg, signature: inline, subst: aliasSubst } = utilityArgumentSignature(typeRef, scope);
    const inlineKind = name === 'Parameters' ? 'TSFunctionType' : 'TSConstructorType';
    if (inline?.type === inlineKind || (name === 'Parameters' && inline?.type === 'FunctionTypeAnnotation')) {
      const params = dropLeadingThisParam(inline.params ?? null);
      // a GENERIC alias binds its own parameters on the hop (`type F<T> = (a: T) => void`), so the
      // binding is carried into each parameter's ANNOTATION - the list elements are parameter nodes,
      // and a deep-subst handed the node itself leaves the free `T` sitting inside untouched
      if (!params || !aliasSubst) return params;
      return params.map(param => param?.typeAnnotation
        ? { ...param, typeAnnotation: applyAliasSubstDeep(param.typeAnnotation, aliasSubst) } : param);
    }
    if (arg?.type !== 'TSTypeQuery') return null;
    // overloaded `typeof fn`: select the LAST ambient head's params (TS canonical signature),
    // matching ReturnType's selection. no-op for classes / non-overloaded subjects
    let current = pickLastAmbientOverload(resolveTypeQueryBinding(arg, scope), arg, scope);
    let depth = MAX_DEPTH;
    while (depth-- && current?.node) {
      // `Parameters<typeof fn>` drops the leading `this` pseudo-param (TS-level), so the tuple index
      // aligns with the runtime params - return the this-dropped list (no-op for ctors, which can't
      // declare `this`)
      if (current.node.params) return dropLeadingThisParam(current.node.params);
      const ctor = current.node.body?.body?.find(m => m?.kind === 'constructor');
      // babel: ClassMethod.params; oxc: MethodDefinition.value.params (FunctionExpression)
      if (ctor) return dropLeadingThisParam(ctor.params ?? ctor.value?.params ?? null);
      if (!t.isClass(current.node) || !current.node.superClass) return null;
      const superClassPath = current.get('superClass');
      const superNode = superClassPath.node;
      // an ambient `declare class` parent has no runtime value: babel's `resolveRuntimeExpression`
      // hands back the bare `extends` identifier UNRESOLVED (oxc resolves it to the class). when the
      // runtime lookup doesn't reach an actual class, recover the ambient parent via a TYPE-level
      // lookup of the bare identifier so the ConstructorParameters element type stays parser-consistent
      const runtimeSuper = resolveRuntimeExpression(superClassPath);
      if (runtimeSuper && t.isClass(runtimeSuper.node)) current = runtimeSuper;
      else if (superNode?.type === 'Identifier') {
        // anchor the TYPE lookup at the CLASS's own scope, like the runtime lookup one line above:
        // the caller's `scope` is the `ConstructorParameters<>` reference site, where the super name
        // may be shadowed by an unrelated declaration
        current = findClassPathForTypeReference(
          { type: 'TSTypeReference', typeName: superNode }, superClassPath.scope ?? scope);
      } else current = runtimeSuper;
    }
    return null;
  }

  // the `this` pseudo-param TYPE annotation node of the function `ThisParameterType<typeof fn>` targets,
  // or null when the subject declares no explicit `this`. mirrors resolveParametersParams' typeof ->
  // function-node resolution (same last-ambient-overload selection) but KEEPS the leading `this` slot
  // instead of dropping it, so the receiver type (`function f(this: number[])` -> `number[]`) resolves
  function resolveThisParamAnnotation(typeRef, scope) {
    if (typeRefName(typeRef) !== 'ThisParameterType') return null;
    // the same walk the parameter-list twin above runs - shared so the two cannot disagree about
    // which spellings they understand
    const { arg, signature, subst: aliasSubst } = utilityArgumentSignature(typeRef, scope);
    if (signature?.type === 'TSFunctionType' || signature?.type === 'FunctionTypeAnnotation') {
      const thisParam = hasLeadingThisParam(signature.params) ? signature.params[0] : null;
      const annotation = thisParam?.typeAnnotation ?? null;
      return annotation && aliasSubst ? applyAliasSubstDeep(annotation, aliasSubst) : annotation;
    }
    if (arg?.type !== 'TSTypeQuery') return null;
    const current = pickLastAmbientOverload(resolveTypeQueryBinding(arg, scope), arg, scope);
    const params = current?.node?.params;
    return hasLeadingThisParam(params) ? params[0].typeAnnotation ?? null : null;
  }

  // a tuple slot's own `?` already arrives as a source-level TSOptionalType, so an ABSENT wrapper
  // delta must leave the annotation alone - only an explicit `Partial<>` / `Required<>` speaks
  function withTupleElementDelta(annotation, modifiers) {
    return modifiers?.optional === undefined
      ? annotation : withMemberModifiers(annotation, { optional: modifiers.optional });
  }

  function findTupleElement(objectType, index, scope, depth = 0) {
    // a modifier wrapper over a TUPLE changes its elements' optionality exactly as it changes an
    // object's members (`Partial<[A, B]>` is `[A?, B?]`), and both peels below make the wrapper
    // invisible - accumulate the delta the same way the member walk does
    let modifiers = null;
    while (true) {
      // self-recursive alias behind a structure-preserving wrapper (`type R<T> = Readonly<R<T>>;
      // R<number>[0]`) re-enters with a FRESH followTypeAliasChain on each peel, escaping that
      // function's own cycle guard - cap depth here so it bails to null instead of overflowing
      if (index < 0 || depth > MAX_DEPTH) return null;
      // peel BEFORE alias chain catches direct `Readonly<[T, U]>` indexing. mirrors
      // `findTypeMember`'s peel-then-follow-then-peel pattern
      const peeledBefore = peelStructurePreservingWrapper(objectType, scope);
      if (peeledBefore) {
        modifiers = composeModifierDeltas(modifiers, modifierWrapperDelta(objectType));
        objectType = peeledBefore;
        depth += 1;
        continue;
      }
      // follow alias chain BEFORE the Parameters check so `type P = Parameters<typeof fn>;
      // P[0]` reaches the Parameters branch - `resolveParametersParams` matches by typeRefName
      // and would see "P" instead of "Parameters" without the alias walk
      const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
      const target = aliased ?? objectType;
      // `Parameters<typeof fn>[N]` / `ConstructorParameters<typeof Cls>[N]` - N-th param's
      // annotation; rest param unwraps `T[]` -> T and covers every index >= its position.
      // alias subst applies if the resolved annotation references type-params of the alias.
      // `applyAliasSubstDeep` is a no-op when `subst` is null, so direct call covers both
      // alias-walked and direct-Parameters cases without a guard
      const params = resolveParametersParams(target, scope);
      if (params) {
        for (let i = 0; i < params.length; i++) {
          const { param, isRest } = effectiveParam(params[i]);
          // `Parameters<typeof f>[N]` of an optional param is `T | undefined` - the flag sits on
          // the param node, so the tuple element has to carry it forward like a member does
          const annotation = withMemberModifiers(param?.typeAnnotation?.typeAnnotation,
            { optional: Boolean(param?.optional) });
          if (!isRest && i === index) return withTupleElementDelta(applyAliasSubstDeep(annotation, subst) ?? null, modifiers);
          if (isRest) {
            return i <= index
              ? withTupleElementDelta(applyAliasSubstDeep(extractElementAnnotation(annotation, scope, 0), subst) ?? null, modifiers)
              : null;
          }
        }
        return null;
      }
      // peel AFTER follow handles `type X = Readonly<[T, U]>; X[0]` (wrapper hidden one
      // level deeper through the alias). without the second peel numeric indexing falls
      // through to generic `_at`
      const peeledAfter = peelStructurePreservingWrapper(target, scope);
      if (peeledAfter) {
        modifiers = composeModifierDeltas(modifiers, modifierWrapperDelta(target));
        objectType = applySubst(peeledAfter, subst);
        depth += 1;
        continue;
      }
      if (target.type !== 'TSTupleType' && target.type !== 'TupleTypeAnnotation') return null;
      const elements = tupleElements(target);
      if (!elements?.length) return null;
      // direct hit: [string, ...number[]][0] -> string, [string, ...number[]][1] -> number.
      // rest element NOT at the last position (`[...string[], number][1]` leading;
      // `[string, ...number[], boolean][2]` middle) makes positional indexing semantically
      // ambiguous - the rest's runtime length is unknown, so any index at or past the rest
      // position could be either the rest's element type or a later fixed element. bail to
      // the generic path so dispatch widens. trailing rest stays positional: indices before
      // the rest hit fixed slots, indices at-or-past extend the rest's element type
      const restIndex = elements.findIndex(isTupleRestElement);
      if (restIndex !== -1 && restIndex !== elements.length - 1 && index >= restIndex) return null;
      const element = index < elements.length ? elements[index]
        // beyond tuple length: fall back to rest element if present - [string, ...number[]][5] -> number
        : isTupleRestElement(elements.at(-1)) ? elements.at(-1) : null;
      if (!element) return null;
      const memberNode = isTupleRestElement(element)
        ? extractElementAnnotation(unwrapTupleMember(element), scope, 0) : unwrapTupleMember(element);
      if (!memberNode) return null;
      // deep subst so generic args reach nested shapes: `Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`
      return withTupleElementDelta(applyAliasSubstDeep(memberNode, subst), modifiers);
    }
  }

  // resolve a type-arg annotation honoring the caller's generic-substitution map when present,
  // so utility-type params (`Awaited<T>`, `Extract<T,U>`, etc.) and deep union members bind
  // against the caller's T/U instead of collapsing to null on raw parameter refs. the absent-map
  // degrade belongs to the substitution lane itself, which hands the decl-cycle guard on rather
  // than restarting it empty - a second copy of that fork here dropped the guard at every hop
  function resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen }) {
    return substituteTypeParams(node, typeParamMap, scope, depth + 1, seen);
  }

  function typesEqual(a, b) {
    return a.type === b.type && a.constructor === b.constructor;
  }

  // deep equality of inner type hints (string hints or type objects)
  function innersEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return typesEqual(a, b) && innersEqual(a.inner, b.inner);
  }

  // merge two types into a common type: returns null if outer types differ,
  // strips inner if outer types match but inner types disagree.
  // marker propagation over the (possibly rebuilt / identity-returned) result, so every
  // merge caller gets it for free instead of re-marking by hand: a merged value may be
  // EITHER input at runtime, so mayBeNullish propagates from either side (may-union),
  // while readonly requires BOTH (a readonly | mutable merge is not readonly-certain)
  function commonType(existing, incoming) {
    let merged = commonTypeInner(existing, incoming);
    if (!merged) return merged;
    if (existing?.mayBeNullish || incoming.mayBeNullish) merged = merged.mark('mayBeNullish');
    // topObject is a MAY-union like mayBeNullish: assignability to a union target holds
    // when ANY arm accepts, so `object | Object` accepts primitives regardless of arm
    // order (the identity-returned fold otherwise dropped the marker order-dependently)
    if (existing?.topObject || incoming.topObject) merged = merged.mark('topObject');
    // enforced symmetrically: the inner fold may return `existing` by IDENTITY with its
    // readonly marker already set, which made `readonly | mutable` readonly-certain in one
    // arm order but not the other - so the single-readonly merge STRIPS, not just skips-add
    if (existing && existing.readonly && incoming.readonly) merged = merged.mark('readonly');
    else if (existing && merged.readonly) merged = merged.unmark('readonly');
    return merged;
  }

  function commonTypeInner(existing, incoming) {
    if (!existing) return incoming;
    if (!typesEqual(existing, incoming)) return null;
    // two primitives of the same family with distinct literal stamps fold to a literal UNION (`'a' | 'b'`):
    // still a string for member dispatch, but a conditional check against a literal must stay undecidable
    // (some members extend it, others do not). keeping `existing.literal` would mis-fire the branch-picker's
    // both-literal rule (`('a' | 'b') extends 'a'` wrongly TRUE); clearing it to a bare family would mis-fire
    // its wide-vs-literal rule (wrongly FALSE). mark `literalUnion` so the picker folds both branches instead.
    // a single shared literal is kept; a bare-keyword member on either side absorbs the literals into the family
    if (existing.primitive) {
      if (existing.literal === incoming.literal && !existing.literalUnion && !incoming.literalUnion) return existing;
      const merged = new $Primitive(existing.type);
      const existingHasLiteral = existing.literal !== undefined || existing.literalUnion;
      const incomingHasLiteral = incoming.literal !== undefined || incoming.literalUnion;
      return existingHasLiteral && incomingHasLiteral ? merged.mark('literalUnion') : merged;
    }
    if (innersEqual(existing.inner, incoming.inner)) return existing;
    return new $Object(existing.constructor);
  }

  function isNullableOrNever(resolved) {
    return resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never';
  }

  function isNullableOrNeverAnnotation(node) {
    return !!node && NULLABLE_NEVER_ANNOTATIONS.has(node.type);
  }

  // unified fold: resolve each member, classify via `classify(resolved)`:
  //   FOLD (2) - contribute to commonType
  //   SKIP (1) - skip member, track as fallback for all-skipped case
  //   BAIL (0) - abort, return null
  function foldTypes(members, resolve, classify) {
    let result = null;
    let skipped = null;
    for (const member of members) {
      const resolved = resolve(member);
      const action = classify(resolved);
      if (action === 0) return null; // BAIL
      if (action === 1) { // SKIP
        if (resolved) skipped ??= resolved;
        continue;
      }
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result ?? skipped;
  }

  // fold union members: unresolvable -> bail, nullable/never -> skip, rest -> fold.
  // a SKIPped null / undefined arm still exists at runtime, so the folded value shape is
  // marked mayBeNullish - receiver narrowing ignores the marker (nullish receivers throw
  // either way), the logical truthy-fold must not (`T | null` is not always-truthy).
  // a dropped `never` arm carries no runtime value and does not mark
  function foldUnionTypes(types, resolve) {
    let droppedNullish = false;
    const result = foldTypes(types, resolve, r => {
      if (!r) return 0;
      if (isNullableOrNever(r)) {
        if (r.type !== 'never') droppedNullish = true;
        return 1;
      }
      return 2;
    });
    return droppedNullish && result && !isNullableOrNever(result) ? result.mark('mayBeNullish') : result;
  }

  // a "weak" intersection constituent carries no useful instance-method narrow: null / unresolvable,
  // a bare object (`{}`), or a Function value (a method-typed member such as `(() => T) & C[]`). a
  // concrete container present in the intersection governs member dispatch, so weak members are
  // SKIPped and must not block it from folding in
  function isWeakIntersectionMember(resolved) {
    if (!resolved) return true;
    if (resolved.primitive) return false;
    return !resolved.constructor || resolved.constructor === 'Object' || resolved.constructor === 'Function';
  }

  // fold intersection members: weak constituent -> skip, rest -> fold
  function foldIntersectionTypes(types, resolve) {
    return foldTypes(types, resolve, r => isWeakIntersectionMember(r) ? 1 : 2);
  }

  // compute common inner type from tuple elements using a parameterized resolver
  // returns the common type if all non-nullable elements agree, null otherwise
  function resolveTupleInner(elements, resolver) {
    const result = foldTypes(elements, elem => {
      // rest element: ...string[] or ...Array<string> - resolve the collection type, use its inner
      if (isTupleRestElement(elem)) return resolveInnerType(resolver(unwrapTupleMember(elem)));
      return resolver(unwrapTupleMember(elem));
    }, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
    // all-nullable tuples: return null (unknown inner), not the nullable fallback
    return result && isNullableOrNever(result) ? null : result;
  }

  // resolve a type annotation, returning null for nullable/never types (not useful as inner types).
  // `mayBeNullish` records "a null / undefined arm was dropped from this union" - which is exactly
  // what `NonNullable<T>` removes, so the marker must not outlive the strip. leaving it on made
  // MORE type information produce a WIDER answer: `NonNullable<I['a']>` stayed generic where the
  // bare `I['a']` it is derived from would have narrowed
  function resolveNonNullableAnnotation({ node, scope, depth, typeParamMap, seen }) {
    if (!node) return null;
    const resolved = safeInnerType(resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen }));
    return resolved?.mayBeNullish ? resolved.unmark('mayBeNullish') : resolved;
  }

  // collapse a resolved inner-Type to null when it is nullable / never / falsy - or not a
  // Type at all: a cyclic type-param default (`Self<T = T[]>`) leaks the raw default
  // ANNOTATION through the subst map as a "resolved" value (the G-WRONGMAYBE-DEFAULT-LEAK
  // class), and an AST node in the inner slot poisons every downstream reader (innersEqual /
  // toHint / markers). used at `new $Object(ctor, inner)` build sites where carrying a
  // nullable inner would mis-narrow downstream member dispatch (a `Promise<null>` shape
  // leaks the `null` into element-narrow queries that expect a useful inner). single source
  // of truth so the build sites (HKT apply, array-as-type, generator return-type) can't drift
  function safeInnerType(inner) {
    return inner && typeof inner.primitive === 'boolean' && !isNullableOrNever(inner) ? inner : null;
  }

  // cluster-private: `foldTypes` (generic fold engine; only `foldUnionTypes` /
  // `foldIntersectionTypes` / `resolveTupleInner` invoke it), `isTupleRestElement` /
  // `unwrapTupleMember` (only `tupleAsArrayType` / `resolveTupleInner` / `findTupleElement`
  // consume them)
  // fold the per-arm answers of a union whose arms are ALTERNATIVES OF ONE VALUE - a callee that
  // is one of several signatures, and so on. nullish arms drop out; an arm nothing can resolve
  // sinks the whole answer; the survivors must converge, because the value could be any of them
  // and a narrow that holds for only one arm dispatches the rest through a wrong-family Maybe.
  // a non-union node is simply its own single arm
  function foldUnionArmTypes(node, resolveArm) {
    if (!isUnionType(node)) return resolveArm(node);
    // nullish arms drop on the ANNOTATION, not after resolution as the sibling value-union fold
    // does, and nothing here marks the result nullish: these arms are alternative CALLEES, so a
    // nullish one contributes no return at all - it throws - rather than a nullish return
    const arms = node.types
      .map(arm => peelTSParenthesized(unwrapTypeAnnotation(arm)))
      .filter(arm => !isNullableOrNeverAnnotation(arm));
    return foldTypes(arms, resolveArm, resolved => resolved ? 2 : 0);
  }

  return {
    tupleElements,
    rebuildTupleElements,
    tupleAsArrayType,
    resolveParametersParams,
    resolveThisParamAnnotation,
    findTupleElement,
    resolveAnnotationInContext,
    typesEqual,
    innersEqual,
    commonType,
    isNullableOrNever,
    isNullableOrNeverAnnotation,
    foldUnionTypes,
    foldUnionArmTypes,
    foldIntersectionTypes,
    resolveTupleInner,
    resolveNonNullableAnnotation,
    safeInnerType,
  };
}
