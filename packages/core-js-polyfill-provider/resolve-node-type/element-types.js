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
import { $Object, $Primitive, MAX_DEPTH, SINGLE_ELEMENT_COLLECTIONS, canonicalArrayIndex, literalNodeValue } from './base.js';
import {
  isInterfaceDeclaration,
  isTypeAlias,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefName,
} from './ast-shapes.js';
import { getTypeArgs, peelTSParenthesized } from '../helpers/ast-patterns.js';

// Numeric data properties can constrain an indexed read but cannot supply an iterator.
function intersectionElementSource({ types }) {
  const sources = types.filter(arm => {
    const members = arm.type === 'TSTypeLiteral' ? arm.members
      : arm.type === 'ObjectTypeAnnotation' && !arm.indexers?.length ? arm.properties : null;
    return !members || members.some(property => property.computed
      || (property.type !== 'TSPropertySignature' && property.type !== 'ObjectTypeProperty')
      || canonicalArrayIndex(literalNodeValue(property.key)) === null);
  });
  return sources.length === 1 ? sources[0] : null;
}

export function createElementTypes({
  withTypeReferenceScope,
  typeAnswer,
  typeGuardHas,
  babelNodeType,
  unwrapTypeAnnotation,
  resolveTypeAnnotation,
  tupleElements,
  resolveTupleInner,
  commonType,
  isNullableOrNever,
  findTypeDeclaration,
  isGlobalTypeName,
  declarationPath,
  withLookupPath,
  applyAliasSubstDeep,
  buildSubstMap,
}) {
  function builtinCollection(name, scope) {
    return (SINGLE_ELEMENT_COLLECTIONS.has(name) || name === 'Map' || name === 'ReadonlyMap')
      && isGlobalTypeName(name, scope);
  }

  // resolve the element type of a collection from its type annotation. `seen` is a per-
  // resolution decl-cycle guard threaded through `resolveUserTypeElement`
  function resolveElementType(node, scope, depth, seen) {
    function resolveItem(item) {
      return withTypeReferenceScope(item, scope, at => resolveTypeAnnotation(item, at, depth + 1));
    }
    while (true) {
      if (depth > MAX_DEPTH) return null;
      node = unwrapTypeAnnotation(node);
      if (!node) return null;
      switch (babelNodeType(node)) {
        case 'TSIntersectionType':
        case 'IntersectionTypeAnnotation':
          node = intersectionElementSource(node);
          depth += 1;
          continue;
        // string[] -> element type
        case 'TSArrayType':
        case 'ArrayTypeAnnotation':
          return resolveItem(node.elementType);
        // [string, number] -> common element type if all same
        case 'TSTupleType':
        case 'TupleTypeAnnotation': {
          const elements = tupleElements(node);
          return elements?.length ? resolveTupleInner(elements, resolveItem) : null;
        }
        // Array<T>, Set<T>, Map<K,V>, Iterable<T>, Generator<T>, user type aliases
        case 'TSTypeReference':
        case 'GenericTypeAnnotation': {
          const name = typeRefName(node);
          if (!name) return null;
          const params = getTypeArgs(node)?.params;
          if (!builtinCollection(name, scope)) {
            return resolveUserTypeElement({ name, typeArgs: params, scope, depth, resolver: resolveElementType, seen });
          }
          if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ? resolveItem(params[0]) : null;
          return new $Object('Array');
        }
        // iterating a string yields characters (strings)
        case 'TSStringKeyword':
        case 'StringTypeAnnotation':
          return new $Primitive('string');
        // union: strip null/undefined, check remaining
        case 'TSUnionType':
        case 'UnionTypeAnnotation': return typeAnswer(resolveElementType, node, { scope, depth, seen, guarded: true }, () => {
          const { types } = node;
          if (!types?.length) return null;
          let result = null;
          for (const member of types) {
            const resolved = resolveTypeAnnotation(member, scope, depth + 1);
            if (!resolved) return null;
            if (isNullableOrNever(resolved)) continue;
            const elemType = resolveElementType(member, scope, depth + 1, seen);
            if (!elemType) return null;
            result = commonType(result, elemType);
            if (!result) return null;
          }
          return result;
        });
        // transparent wrappers: readonly T[], (T[])
        case 'TSTypeOperator':
          return node.operator !== 'keyof' ? resolveElementType(node.typeAnnotation, scope, depth + 1, seen) : null;
        case 'TSOptionalType':
        case 'TSParenthesizedType':
        case 'NullableTypeAnnotation':
          node = node.typeAnnotation;
          depth += 1;
          continue;
      }
      return null;
    }
  }

  // follow user-defined type aliases and interface extends chain using a parameterized resolver.
  // `typeArgs` are the caller's usage args (`MyArr<string>` -> `[string]`); without subst, the
  // alias body / parent ref retains the declaration-side type-parameter refs (`T`), which
  // resolve to null in the caller's scope and bail the user-type element resolution. mirrors
  // the `resolveUserDefinedType` -> `resolveTypeArgs` propagation in user-type-resolve.js.
  // `applyAliasSubstDeep` is a no-op when `subst` is null, so unparameterized aliases /
  // interfaces flow through unchanged without an explicit guard
  function resolveUserTypeElement({ name, typeArgs, scope, depth, resolver, seen, decl = findTypeDeclaration(name, scope) }) {
    if (!decl) return null;
    // cycle guard: `type Rec = Rec[]` / `interface A extends B; interface B extends A`
    // would otherwise burn MAX_DEPTH hops before bottoming out (the alias / interface
    // branches both recurse through resolver). visited as a per-resolution Set keyed on
    // decl identity short-circuits the second visit. depth fallback stays for safety.
    // scoped to the CURRENT descent, like the canonical user-type walk: the mark answers
    // "is this decl already open ABOVE me", and a set that only grows lets the first arm of
    // a union read its siblings' repeat reference as a cycle and fold the whole union to null
    const visited = seen ?? new Set();
    if (typeGuardHas(visited, decl)) return null;
    visited.add(decl);
    try {
      const subst = buildSubstMap(decl.typeParameters?.params, typeArgs, scope);
      const path = declarationPath(decl, scope);
      return withLookupPath(path, () => {
        scope = path?.scope ?? scope;
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
      });
    } finally {
      visited.delete(decl);
    }
  }

  // extract the raw element annotation node (not resolved) from a collection type.
  // `seen` flows through `resolveUserTypeElement`'s decl-cycle short-circuit when alias /
  // interface bodies re-reference an ancestor declaration
  function extractElementAnnotation(node, scope, depth, seen) {
    while (true) {
      if (depth > MAX_DEPTH) return null;
      node = unwrapTypeAnnotation(node);
      if (!node) return null;
      switch (babelNodeType(node)) {
        case 'TSIntersectionType':
        case 'IntersectionTypeAnnotation':
          node = intersectionElementSource(node);
          depth += 1;
          continue;
        case 'TSArrayType':
        case 'ArrayTypeAnnotation':
          return node.elementType;
        case 'TSTypeReference':
        case 'GenericTypeAnnotation': {
          const name = typeRefName(node);
          if (!name) return null;
          const params = getTypeArgs(node)?.params;
          if (!builtinCollection(name, scope)) {
            return resolveUserTypeElement({ name, typeArgs: params, scope, depth, resolver: extractElementAnnotation, seen });
          }
          if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ?? null;
          // Map/ReadonlyMap iterate as [K, V] - synthesize a TSTupleType so `findTupleElement`
          // can pick up K or V by index
          return params?.length >= 2 ? { type: 'TSTupleType', elementTypes: [params[0], params[1]] } : null;
        }
        case 'TSTypeOperator':
          return node.operator !== 'keyof' ? extractElementAnnotation(node.typeAnnotation, scope, depth + 1, seen) : null;
        case 'TSOptionalType':
        case 'TSParenthesizedType':
        case 'NullableTypeAnnotation':
          node = node.typeAnnotation;
          depth += 1;
          continue;
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
            result = extractElementAnnotation(member, scope, depth + 1, seen);
            if (!result) return null;
          }
          return result;
        }
      }
      return null;
    }
  }

  // Preserve explicit fields on the raw iterator value. Only a plain global Promise
  // promises its payload shape; transparent aliases resolve where they were declared.
  function declaredAsyncElement(annotation, scope, depth = 0, seen = undefined) {
    const node = peelTSParenthesized(unwrapTypeAnnotation(annotation));
    if (!node || depth > MAX_DEPTH) return null;
    const name = typeRefName(node);
    const typeArgs = getTypeArgs(node)?.params;
    if (name === 'Promise' && isGlobalTypeName(name, scope)) return { annotation: node, scope, payload: typeArgs?.[0] };
    const decl = name && findTypeDeclaration(name, scope);
    return isTypeAlias(decl)
      ? resolveUserTypeElement({ decl, typeArgs, scope, depth, resolver: declaredAsyncElement, seen })
      : { annotation: node, scope };
  }

  // Async iterators hand over IteratorResult.value as written. Only a sync
  // iterator adapted by for-await assimilates that value. A mixed source can do either.
  function iterationProtocol(annotation, scope, depth = 0, seen = undefined) {
    let node = unwrapTypeAnnotation(annotation);
    while (node?.type === 'TSParenthesizedType' || node?.type === 'TSTypeOperator' && node.operator === 'readonly') {
      node = unwrapTypeAnnotation(node.typeAnnotation);
    }
    if (!node || depth > MAX_DEPTH) return null;
    const name = typeRefName(node);
    if (name && builtinCollection(name, scope)) {
      if (name === 'ArrayLike' || name === 'Iterator' || name === 'AsyncIterator') return null;
      return name.startsWith('Async') ? 'async' : 'sync';
    }
    const decl = name && findTypeDeclaration(name, scope);
    // A custom iterator member or a second parent can provide the other protocol.
    const inherited = isInterfaceDeclaration(decl) && decl.extends?.length === 1
      && !decl.body?.body?.length && !decl.body?.properties?.length;
    if (isTypeAlias(decl) || inherited) {
      return resolveUserTypeElement({ name, typeArgs: getTypeArgs(node)?.params, scope, depth, resolver: iterationProtocol, seen });
    }
    switch (node.type) {
      case 'TSArrayType': case 'ArrayTypeAnnotation': case 'TSTupleType': case 'TupleTypeAnnotation':
      case 'TSStringKeyword': case 'StringTypeAnnotation': return 'sync';
      case 'TSUnionType':
      case 'UnionTypeAnnotation': return typeAnswer(iterationProtocol, node, { scope, depth, seen, guarded: true }, () => {
        let protocol;
        for (const arm of node.types) {
          const next = iterationProtocol(arm, scope, depth + 1, seen);
          if (!next || protocol && protocol !== next) return null;
          protocol = next;
        }
        return protocol;
      });
      default: return null;
    }
  }

  return { resolveElementType, extractElementAnnotation, iterationProtocol, declaredAsyncElement };
}
