// Type-object substitution dispatch: walks an AST node tree binding `Map<string,
// ResolvedType>` typeParam refs to their resolved Type objects. produces $Primitive /
// $Object instances (or null when a slot can't be resolved). parallels the AST->AST
// dispatch in `type-subst.js` (`applyAliasSubstDeep`) but builds Type objects rather
// than reconstructed AST, so the two clusters can't share a walker - each handler
// builds a fundamentally different output domain.
//
// Public surface:
//   substituteTypeParams(node, typeParamMap, scope, depth, seen) - the entry walker
//
// `typeParamMap` is the Type-object-valued binding map built by `resolveTypeArgs`.
// `typeParamMap = null` degrades to plain `resolveTypeAnnotation` so recursive entry
// points like `resolveInferElementPattern` with null ctx don't crash on `.has()`.
//
// Service object collects factory helpers + the two `type-expansion` cluster outputs
// (`unwrapMappedTypePassthrough`, `evaluateConditionalType`) the handlers call into.
import { $Object, MAX_DEPTH } from './base.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

// shared accessor for the first type-arg slot on a TS/Flow ref node. `getTypeArgs` returns
// a wrapper carrying `.params` or null when the ref carries no `<...>`; `firstTypeArg`
// folds the wrapper + array indexing into one call so the dispatch handlers can read
// position-0 without re-typing the optional-chain pattern at each site
function firstTypeArg(node) {
  return getTypeArgs(node)?.params?.[0] ?? null;
}

export function createTypeResolveDispatch({
  typeRefSegments,
  resolveKnownConstructor,
  resolveKnownContainerType,
  resolveUserDefinedType,
  resolveNamedType,
  safeInnerType,
  tupleAsArrayType,
  foldUnionTypes,
  foldIntersectionTypes,
  resolveTypeAnnotation,
  resolveIndexedAccessSubst,
  unwrapTypeAnnotation,
  unwrapMappedTypePassthrough,
  evaluateConditionalType,
}) {
  // recurse helper - closes over (typeParamMap, scope, depth, seen) for handlers that
  // descend into a sibling slot. extra args sail through unchanged
  function substRecurse({ node, typeParamMap, scope, depth, seen }) {
    return substituteTypeParams(node, typeParamMap, scope, depth + 1, seen);
  }

  // direct typeparam ref: `T` -> map.get('T'). non-typeparam ref: container substitution
  // (Array<T>, Promise<T>, etc.) via `resolveKnownContainerType`, then user-alias /
  // utility-type chain through `resolveUserDefinedType` / `resolveNamedType`.
  // dotted refs (`NS.Foo<T>` / TSQualifiedName) keep the segment path joined - downstream
  // resolveNamedType / findTypeDeclaration re-split on dispatch. typeparam binding gates
  // on single-segment refs since `NS.T` is never a typeparam binding key
  function substTypeRefAsType(node, typeParamMap, scope, depth, seen) {
    const segments = typeRefSegments(node);
    if (!segments?.length) return null;
    const name = segments.join('.');
    if (segments.length === 1 && typeParamMap.has(name)) {
      return applyHigherKindedArgs({ bound: typeParamMap.get(name), node, typeParamMap, scope, depth, seen });
    }
    const ctor = resolveKnownConstructor(name);
    const known = resolveKnownContainerType({
      name, base: ctor, node, innerResolver: p => substRecurse({ node: p, typeParamMap, scope, depth, seen }),
    });
    if (known) return known;
    return resolveUserDefinedType({ name, node, scope, depth, typeParamMap, seen })
      ?? resolveNamedType({ name, node, scope, depth, typeParamMap, seen });
  }

  // HKT apply for typeparam-bound named containers (`Wrap<F, X> = F<X>` with F=Array,
  // X=string). gate skips non-container ($Primitive, bare $Object(null)) and already-
  // applied bindings - mirrors the AST-side `withSubstitutedTypeArgs` path so both
  // dispatch lanes give matching element-precision
  function applyHigherKindedArgs({ bound, node, typeParamMap, scope, depth, seen }) {
    const firstArg = firstTypeArg(node);
    if (!firstArg || !(bound instanceof $Object) || !bound.constructor || bound.inner !== null) return bound;
    const inner = substRecurse({ node: firstArg, typeParamMap, scope, depth, seen });
    return new $Object(bound.constructor, safeInnerType(inner));
  }

  // T[] / Array<T> -> $Object('Array', inner) with substituted element type
  function substArrayAsType(node, typeParamMap, scope, depth, seen) {
    const inner = substRecurse({ node: node.elementType, typeParamMap, scope, depth, seen });
    return new $Object('Array', safeInnerType(inner));
  }

  // [T, U] -> Array<commonInner> per-element folded via shared `tupleAsArrayType`
  function substTupleAsType(node, typeParamMap, scope, depth, seen) {
    return tupleAsArrayType(node, e => substRecurse({ node: e, typeParamMap, scope, depth, seen }));
  }

  // mapped type: passthrough body recurses with subst preserved; non-passthrough opaque
  function substMappedAsType(node, typeParamMap, scope, depth, seen) {
    const passthrough = unwrapMappedTypePassthrough(node);
    if (passthrough) return substRecurse({ node: passthrough, typeParamMap, scope, depth, seen });
    return new $Object(null);
  }

  // TSTypeOperator: `keyof T` opaque, other operators (e.g. `readonly`) transparent
  function substTypeOperatorAsType(node, typeParamMap, scope, depth, seen) {
    if (node.operator === 'keyof') return resolveTypeAnnotation(node, scope, depth);
    return substRecurse({ node: node.typeAnnotation, typeParamMap, scope, depth, seen });
  }

  // transparent wrapper: TSOptionalType / TSParenthesizedType / NullableTypeAnnotation
  function substTransparentWrapperAsType(node, typeParamMap, scope, depth, seen) {
    return substRecurse({ node: node.typeAnnotation, typeParamMap, scope, depth, seen });
  }

  // union / intersection fold-as-Type
  function substUnionAsType(node, typeParamMap, scope, depth, seen) {
    return foldUnionTypes(node.types, m => substRecurse({ node: m, typeParamMap, scope, depth, seen }));
  }
  function substIntersectionAsType(node, typeParamMap, scope, depth, seen) {
    return foldIntersectionTypes(node.types, m => substRecurse({ node: m, typeParamMap, scope, depth, seen }));
  }

  // function-types collapse to a plain Function regardless of typeparams - shared handler
  function substFunctionTypeAsType() {
    return new $Object('Function');
  }

  // dispatch table: AST shape -> Type-object construction. parallels `applyAliasSubstDeepInner`'s
  // `SUBST_DISPATCH` (AST->AST) - structural symmetry over the same node-type set, different
  // output domain (Type Object vs AST). cannot unify via shared walker - each handler builds
  // a fundamentally different result (Type construction vs AST reconstruction)
  const SUBST_TYPE_DISPATCH = {
    TSTypeReference: substTypeRefAsType,
    GenericTypeAnnotation: substTypeRefAsType,
    TSUnionType: substUnionAsType,
    UnionTypeAnnotation: substUnionAsType,
    TSIntersectionType: substIntersectionAsType,
    IntersectionTypeAnnotation: substIntersectionAsType,
    TSOptionalType: substTransparentWrapperAsType,
    TSParenthesizedType: substTransparentWrapperAsType,
    NullableTypeAnnotation: substTransparentWrapperAsType,
    TSTypeOperator: substTypeOperatorAsType,
    TSConditionalType: evaluateConditionalType,
    TSArrayType: substArrayAsType,
    ArrayTypeAnnotation: substArrayAsType,
    TSTupleType: substTupleAsType,
    TupleTypeAnnotation: substTupleAsType,
    TSIndexedAccessType: resolveIndexedAccessSubst,
    TSFunctionType: substFunctionTypeAsType,
    TSConstructorType: substFunctionTypeAsType,
    FunctionTypeAnnotation: substFunctionTypeAsType,
    TSMappedType: substMappedAsType,
  };

  function substituteTypeParams(node, typeParamMap, scope, depth, seen) {
    if (depth > MAX_DEPTH) return null;
    if (!typeParamMap) return resolveTypeAnnotation(node, scope, depth);
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    const handler = SUBST_TYPE_DISPATCH[node.type];
    return handler ? handler(node, typeParamMap, scope, depth, seen) : resolveTypeAnnotation(node, scope, depth);
  }

  return { substituteTypeParams };
}
