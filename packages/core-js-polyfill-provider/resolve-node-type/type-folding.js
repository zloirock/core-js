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
} from './base.js';
import { typeRefName } from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

export function createTypeFolding({
  t,
  resolveRuntimeExpression,
  effectiveParam,
  resolveInnerType,
  resolveTypeAnnotation,
  substituteTypeParams,
  applySubst,
  applyAliasSubstDeep,
  peelStructurePreservingWrapper,
  followTypeAliasChain,
  extractElementAnnotation,
  resolveTypeQueryBinding,
  pickLastAmbientOverload,
  findClassPathForTypeReference,
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
  function resolveParametersParams(typeRef, scope) {
    const name = typeRefName(typeRef);
    if (name !== 'Parameters' && name !== 'ConstructorParameters') return null;
    const arg = getTypeArgs(typeRef)?.params[0];
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
        current = findClassPathForTypeReference({ type: 'TSTypeReference', typeName: superNode }, scope);
      } else current = runtimeSuper;
    }
    return null;
  }

  function findTupleElement(objectType, index, scope, depth = 0) {
    // self-recursive alias behind a structure-preserving wrapper (`type R<T> = Readonly<R<T>>;
    // R<number>[0]`) re-enters with a FRESH followTypeAliasChain on each peel, escaping that
    // function's own cycle guard - cap depth here so it bails to null instead of overflowing
    if (index < 0 || depth > MAX_DEPTH) return null;
    // peel BEFORE alias chain catches direct `Readonly<[T, U]>` indexing. mirrors
    // `findTypeMember`'s peel-then-follow-then-peel pattern
    const peeledBefore = peelStructurePreservingWrapper(objectType);
    if (peeledBefore) return findTupleElement(peeledBefore, index, scope, depth + 1);
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
        const annotation = param?.typeAnnotation?.typeAnnotation;
        if (!isRest && i === index) return applyAliasSubstDeep(annotation, subst) ?? null;
        if (isRest) {
          return i <= index
            ? applyAliasSubstDeep(extractElementAnnotation(annotation, scope, 0), subst) ?? null
            : null;
        }
      }
      return null;
    }
    // peel AFTER follow handles `type X = Readonly<[T, U]>; X[0]` (wrapper hidden one
    // level deeper through the alias). without the second peel numeric indexing falls
    // through to generic `_at`
    const peeledAfter = peelStructurePreservingWrapper(target);
    if (peeledAfter) {
      const substituted = applySubst(peeledAfter, subst);
      return findTupleElement(substituted, index, scope, depth + 1);
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
    return applyAliasSubstDeep(memberNode, subst);
  }

  // resolve a type-arg annotation honoring the caller's generic-substitution map when present,
  // so utility-type params (`Awaited<T>`, `Extract<T,U>`, etc.) and deep union members bind
  // against the caller's T/U instead of collapsing to null on raw parameter refs
  function resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen }) {
    return typeParamMap
      ? substituteTypeParams(node, typeParamMap, scope, depth + 1, seen)
      : resolveTypeAnnotation(node, scope, depth + 1);
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
  // strips inner if outer types match but inner types disagree
  function commonType(existing, incoming) {
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
      if (existingHasLiteral && incomingHasLiteral) merged.literalUnion = true;
      return merged;
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

  // fold union members: unresolvable -> bail, nullable/never -> skip, rest -> fold
  function foldUnionTypes(types, resolve) {
    return foldTypes(types, resolve, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
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

  // resolve a type annotation, returning null for nullable/never types (not useful as inner types)
  function resolveNonNullableAnnotation({ node, scope, depth, typeParamMap, seen }) {
    if (!node) return null;
    const resolved = resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen });
    return safeInnerType(resolved);
  }

  // collapse a resolved inner-Type to null when it is nullable / never / falsy. used at
  // `new $Object(ctor, inner)` build sites where carrying a nullable inner would mis-narrow
  // downstream member dispatch (a `Promise<null>` shape leaks the `null` into element-narrow
  // queries that expect a useful inner). single source of truth so the three legitimate
  // build sites (HKT apply, array-as-type, generator return-type) can't drift in subtlety
  function safeInnerType(inner) {
    return inner && !isNullableOrNever(inner) ? inner : null;
  }

  // cluster-private: `foldTypes` (generic fold engine; only `foldUnionTypes` /
  // `foldIntersectionTypes` / `resolveTupleInner` invoke it), `isTupleRestElement` /
  // `unwrapTupleMember` (only `tupleAsArrayType` / `resolveTupleInner` / `findTupleElement`
  // consume them)
  return {
    tupleElements,
    rebuildTupleElements,
    tupleAsArrayType,
    resolveParametersParams,
    findTupleElement,
    resolveAnnotationInContext,
    typesEqual,
    innersEqual,
    commonType,
    isNullableOrNever,
    isNullableOrNeverAnnotation,
    foldUnionTypes,
    foldIntersectionTypes,
    resolveTupleInner,
    resolveNonNullableAnnotation,
    safeInnerType,
  };
}
