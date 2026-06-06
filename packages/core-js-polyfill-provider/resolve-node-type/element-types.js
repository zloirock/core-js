// Collection element-type extraction. given a TS annotation that names a collection
// (`T[]`, `Array<T>`, `Set<T>`, `Map<K,V>`, `Iterable<T>`, tuples, unions, transparent
// wrappers, user aliases extending these), returns either the RESOLVED element type
// (`resolveElementType`) or the RAW annotation node (`extractElementAnnotation`) so the
// caller can substitute through type-parameter maps before final resolution.
//
// Public surface:
//   resolveElementType(node, scope, depth)       - $Primitive / $Object | null
//   extractElementAnnotation(node, scope, depth) - raw AST element annotation | null
//
// Service object passes the cross-cluster resolvers (`resolveTypeAnnotation`,
// `findTypeDeclaration`, `tupleElements`, etc.) plus the babel-types adapter and a few
// pure helpers (`commonType`, `isNullableOrNever`). User-type aliases recurse through a
// shared `resolveUserTypeElement` that's parametrized by the per-direction resolver
// (raw-AST vs resolved-Type), keeping the alias/interface-extends walk identical for both
// flavors.
import { $Object, $Primitive, MAX_DEPTH, SINGLE_ELEMENT_COLLECTIONS } from './base.js';
import {
  isInterfaceDeclaration,
  isTypeAlias,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefName,
} from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

export function createElementTypes({
  babelNodeType,
  unwrapTypeAnnotation,
  resolveTypeAnnotation,
  tupleElements,
  resolveTupleInner,
  commonType,
  isNullableOrNever,
  findTypeDeclaration,
  applyAliasSubstDeep,
  buildSubstMap,
}) {
  // resolve the element type of a collection from its type annotation. `seen` is a per-
  // resolution decl-cycle guard threaded through `resolveUserTypeElement`
  function resolveElementType(node, scope, depth, seen) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // string[] -> element type
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return resolveTypeAnnotation(node.elementType, scope, depth + 1);
      // [string, number] -> common element type if all same
      case 'TSTupleType':
      case 'TupleTypeAnnotation': {
        const elements = tupleElements(node);
        return elements?.length
          ? resolveTupleInner(elements, e => resolveTypeAnnotation(e, scope, depth + 1))
          : null;
      }
      // Array<T>, Set<T>, Map<K,V>, Iterable<T>, Generator<T>, user type aliases
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        const params = getTypeArgs(node)?.params;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ? resolveTypeAnnotation(params[0], scope, depth + 1) : null;
        if (name === 'Map' || name === 'ReadonlyMap') return new $Object('Array');
        return resolveUserTypeElement({ name, typeArgs: params, scope, depth, resolver: resolveElementType, seen });
      }
      // iterating a string yields characters (strings)
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
        return new $Primitive('string');
      // union: strip null/undefined, check remaining
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          const elemType = resolveElementType(member, scope, depth + 1);
          if (!elemType) return null;
          result = commonType(result, elemType);
          if (!result) return null;
        }
        return result;
      }
      // transparent wrappers: readonly T[], (T[])
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? resolveElementType(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveElementType(node.typeAnnotation, scope, depth + 1);
    }
    return null;
  }

  // follow user-defined type aliases and interface extends chain using a parameterized resolver.
  // `typeArgs` are the caller's usage args (`MyArr<string>` -> `[string]`); without subst, the
  // alias body / parent ref retains the declaration-side type-parameter refs (`T`), which
  // resolve to null in the caller's scope and bail the user-type element resolution. mirrors
  // the `resolveUserDefinedType` -> `resolveTypeArgs` propagation in user-type-resolve.js.
  // `applyAliasSubstDeep` is a no-op when `subst` is null, so unparameterized aliases /
  // interfaces flow through unchanged without an explicit guard
  function resolveUserTypeElement({ name, typeArgs, scope, depth, resolver, seen }) {
    const decl = findTypeDeclaration(name, scope);
    if (!decl) return null;
    // cycle guard: `type Rec = Rec[]` / `interface A extends B; interface B extends A`
    // would otherwise burn MAX_DEPTH hops before bottoming out (the alias / interface
    // branches both recurse through resolver). visited as a per-resolution Set keyed on
    // decl identity short-circuits the second visit. depth fallback stays for safety
    const visited = seen ?? new Set();
    if (visited.has(decl)) return null;
    visited.add(decl);
    const subst = buildSubstMap(decl.typeParameters?.params, typeArgs, scope);
    if (isTypeAlias(decl)) return resolver(applyAliasSubstDeep(typeAliasBody(decl), subst), scope, depth + 1, visited);
    if (!isInterfaceDeclaration(decl) || !decl.extends?.length) return null;
    for (const parent of decl.extends) {
      const baseRef = synthInterfaceExtendsRef(parent);
      // `resolveElementType` / `extractElementAnnotation` look up the parent's name via
      // `typeRefName` (single-segment only), so qualified-name refs would bail anyway -
      // skip them here to avoid an unproductive recursive call
      if (!baseRef || baseRef.typeName.type !== 'Identifier') continue;
      const result = resolver(applyAliasSubstDeep(baseRef, subst), scope, depth + 1, visited);
      if (result) return result;
    }
    return null;
  }

  // extract the raw element annotation node (not resolved) from a collection type.
  // `seen` flows through `resolveUserTypeElement`'s decl-cycle short-circuit when alias /
  // interface bodies re-reference an ancestor declaration
  function extractElementAnnotation(node, scope, depth, seen) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return node.elementType;
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        const params = getTypeArgs(node)?.params;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ?? null;
        // Map/ReadonlyMap iterate as [K, V] - synthesize a TSTupleType so `findTupleElement`
        // can pick up K or V by index
        if (name === 'Map' || name === 'ReadonlyMap') {
          return params?.length >= 2 ? { type: 'TSTupleType', elementTypes: [params[0], params[1]] } : null;
        }
        return resolveUserTypeElement({ name, typeArgs: params, scope, depth, resolver: extractElementAnnotation, seen });
      }
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? extractElementAnnotation(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return extractElementAnnotation(node.typeAnnotation, scope, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          if (result) return null; // multiple non-null collection members -> ambiguous
          result = extractElementAnnotation(member, scope, depth + 1);
          if (!result) return null;
        }
        return result;
      }
    }
    return null;
  }

  return { resolveElementType, extractElementAnnotation };
}
