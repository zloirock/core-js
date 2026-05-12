// Function return type resolution. covers four call shapes:
//   - inferred from explicit `<...>` call-site args / param-position generics
//   - declared via the function's `returnType` annotation
//   - generator / async generator: `Generator<TYield>` / `AsyncGenerator<TYield>` ->
//     `Iterator<inner>` / `AsyncIterator<inner>` (yield-type extraction)
//   - body-fold: `return` statements walked, commonType-aggregated, async wrapped in Promise
//
// Public surface:
//   resolveReturnType(fnPath, callPath, classSubst)  - main entry
//   resolveBodyReturnType(fnPath, callPath)          - body-return fold (used by awaited
//                                                       cluster's `resolveAwaitedFromCallBody`)
//   getTypeParamArgPath(typeParamMap, paramName)     - look up the call arg's NodePath for a
//                                                       bound type param (used by
//                                                       `resolveIndexAccessHit` to peek into
//                                                       the actual ObjectExpression literal
//                                                       past the declared T[K] constraint)
//   reset()                                          - reset the sidecar arg-path WeakMap
//
// `hasTypeParamReference`, `innerTypeParamName`, `buildTypeParamMap`, `resolveParamType`,
// `resolveBodyExpr`, `collectReturnPaths` are private closures - they don't show up in the
// service object's return.
import { MAX_DEPTH, SINGLE_ELEMENT_COLLECTIONS, $Object, $Primitive } from './base.js';
import { typeRefName } from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';

export function createReturnType({
  t,
  babelNodeType,
  unwrapTypeAnnotation,
  effectiveParam,
  typeParamName,
  tupleElements,
  mappedTypeConstraint,
  resolveNodeType,
  resolvePath,
  resolveInnerType,
  resolveTypeAnnotation,
  substituteTypeParams,
  generatorTypeParams,
  classSubstInner,
  isNullableOrNever,
  commonType,
}) {
  // sidecar map (typeParamMap -> paramName -> arg NodePath) so indexed-access resolution
  // can inspect the actual call arg - the declared constraint is usually broader.
  // WeakMap auto-clears and avoids a banned custom property on `Map.prototype`
  let typeParamArgPaths = new WeakMap();

  function getTypeParamArgPath(typeParamMap, paramName) {
    return typeParamArgPaths.get(typeParamMap)?.get(paramName);
  }

  function reset() {
    typeParamArgPaths = new WeakMap();
  }

  // resolve parameter type from call-site argument, default value, or rest-element shape
  function resolveParamType(binding, fnPath, callPath) {
    const { params } = fnPath.node;
    const args = callPath.get('arguments');
    for (let i = 0; i < params.length; i++) {
      if (params[i].type === 'RestElement') {
        if (params[i] === binding.path.node) return new $Object('Array');
        continue;
      }
      if (params[i] !== binding.path.node) continue;
      // argument provided at call site - resolve its type
      if (i < args.length) return resolveNodeType(args[i]);
      // no argument - resolve from the default value
      if (params[i].type === 'AssignmentPattern') return resolveNodeType(fnPath.get('params')[i].get('right'));
      return null;
    }
    return null;
  }

  // resolve expression type within a function body, with fallback to call-site parameter inference
  function resolveBodyExpr(path, fnPath, callPath) {
    const type = resolveNodeType(path);
    if (type) return type;
    if (!callPath) return null;
    const resolved = resolvePath(path);
    if (!t.isIdentifier(resolved.node)) return null;
    const binding = resolved.scope?.getBinding(resolved.node.name);
    if (!binding || binding.constantViolations?.length) return null;
    return resolveParamType(binding, fnPath, callPath);
  }

  // collect return statement paths from a block body, skipping nested functions
  // per JS spec, `return` in `finally` always overrides `return` in the try/catch
  // of the same TryStatement - this is handled per-TryStatement, not globally,
  // so returns outside a try-finally are unaffected
  function collectReturnPaths(blockPath) {
    const getChildren = (path, key) => Array.isArray(path.node[key]) ? path.get(key) : [path.get(key)];
    const collect = (path, depth = 0) => {
      if (depth > MAX_DEPTH || !path.node || t.isFunction(path.node)) return [];
      if (t.isReturnStatement(path.node)) return [path];
      const { node } = path;
      // TryStatement: if finally has returns, they override try/catch returns
      if (node.type === 'TryStatement') {
        const finalizerReturns = node.finalizer ? collect(path.get('finalizer'), depth + 1) : [];
        if (finalizerReturns.length) return finalizerReturns;
        const result = [];
        if (node.block) for (const r of collect(path.get('block'), depth + 1)) result.push(r);
        if (node.handler) for (const r of collect(path.get('handler'), depth + 1)) result.push(r);
        return result;
      }
      // recurse into block/control-flow children
      const result = [];
      if (node.body) for (const p of getChildren(path, 'body')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.consequent) for (const p of getChildren(path, 'consequent')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.alternate) for (const r of collect(path.get('alternate'), depth + 1)) result.push(r);
      if (node.cases) for (const p of path.get('cases')) for (const r of collect(p, depth + 1)) result.push(r);
      return result;
    };
    const result = [];
    for (const stmt of blockPath.get('body')) for (const r of collect(stmt)) result.push(r);
    return result;
  }

  function resolveBodyReturnType(fnPath, callPath) {
    const body = fnPath.get('body');
    // arrow with expression body: () => [1, 2, 3]
    if (!t.isBlockStatement(body.node)) return resolveBodyExpr(body, fnPath, callPath);
    // block body: collect return statements, skip nested functions
    let result = null;
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      const type = arg.node ? resolveBodyExpr(arg, fnPath, callPath) : new $Primitive('undefined');
      if (!type) return null;
      // skip nullable/never returns - common in catch bail-outs like `catch { return; }`
      // consistent with how resolveConditionalBranches handles `never` branches
      if (isNullableOrNever(type)) continue;
      const merged = commonType(result, type);
      if (result && !merged) return null;
      result = merged;
    }
    return result ?? new $Primitive('undefined');
  }

  // check whether a type annotation AST node references any type parameter from the given set
  function hasTypeParamReference(node, typeParamNames, depth) {
    if (depth > MAX_DEPTH) return false;
    node = unwrapTypeAnnotation(node);
    if (!node) return false;
    switch (babelNodeType(node)) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (name && typeParamNames.has(name)) return true;
        const params = getTypeArgs(node)?.params;
        if (params) for (const param of params) {
          if (hasTypeParamReference(param, typeParamNames, depth + 1)) return true;
        }
        return false;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation':
        for (const member of node.types) {
          if (hasTypeParamReference(member, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSTupleType':
      case 'TupleTypeAnnotation':
        for (const element of tupleElements(node) ?? []) {
          const actual = element.type === 'TSNamedTupleMember' ? element.elementType : element;
          if (hasTypeParamReference(actual, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSConditionalType':
        return hasTypeParamReference(node.checkType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.extendsType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.trueType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.falseType, typeParamNames, depth + 1);
      case 'TSNamedTupleMember':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSIndexedAccessType':
        return hasTypeParamReference(node.objectType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.indexType, typeParamNames, depth + 1);
      case 'TSTypeOperator':
      case 'TSRestType':
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      case 'TSTypeLiteral':
        for (const member of node.members) {
          if (hasTypeParamReference(member.typeAnnotation, typeParamNames, depth + 1)) return true;
          if (hasTypeParamReference(member.returnType, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        return hasTypeParamReference(node.returnType ?? node.typeAnnotation, typeParamNames, depth + 1);
      // mapped type carries the constraint (`K in keyof T`) and body (`T[K]`); both can
      // reference type params. without this branch an outer function returning a raw
      // mapped type (not wrapped in TSTypeReference) skips substitution and loses inner
      case 'TSMappedType':
        // `mappedTypeConstraint` covers both parser shapes (babel nests; oxc flattens) so
        // a mapped type returned from oxc parser doesn't skip subst on its constraint slot
        return hasTypeParamReference(mappedTypeConstraint(node), typeParamNames, depth + 1)
          || hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      // `typeof x` references the type of a value binding; when x itself is typed by
      // a type param (rare: `declare const x: T; typeof x`), substitution is needed
      case 'TSTypeQuery':
        return typeof node.exprName?.name === 'string' && typeParamNames.has(node.exprName.name);
    }
    return false;
  }

  // extract inner type parameter name from a container annotation: T[] -> T, Array<T> -> T, Set<T> -> T, Promise<T> -> T, etc.
  function innerTypeParamName(annotation, refName) {
    // T[] syntax
    if (annotation.type === 'TSArrayType' || annotation.type === 'ArrayTypeAnnotation') {
      return typeRefName(annotation.elementType);
    }
    // Container<T>: Set<T>, Promise<T>, Iterator<T>, Array<T>, ReadonlyArray<T>, etc.
    if (refName && (SINGLE_ELEMENT_COLLECTIONS.has(refName) || refName === 'Promise')) {
      const typeArgs = getTypeArgs(annotation)?.params;
      if (typeArgs?.length >= 1) return typeRefName(typeArgs[0]);
    }
    return null;
  }

  // Map<string, Type> of type parameter bindings inferred from call-site arguments
  function buildTypeParamMap(typeParamNames, fnPath, callPath) {
    const typeParamMap = new Map();
    const argPaths = new Map();
    typeParamArgPaths.set(typeParamMap, argPaths);
    // phase 0: explicit type arguments at call site: foo<string>(...)
    const callTypeArgs = getTypeArgs(callPath.node)?.params;
    if (callTypeArgs) {
      const fnTypeParams = fnPath.node.typeParameters?.params;
      if (!fnTypeParams) return typeParamMap;
      for (let i = 0; i < fnTypeParams.length && i < callTypeArgs.length; i++) {
        const name = typeParamName(fnTypeParams[i]);
        if (!typeParamMap.has(name)) {
          const resolved = resolveTypeAnnotation(callTypeArgs[i], callPath.scope);
          if (resolved) typeParamMap.set(name, resolved);
        }
      }
    }
    const args = callPath.get('arguments');
    const { params } = fnPath.node;
    // phase 1: match param annotations against type parameter names
    for (let i = 0; i < params.length && i < args.length; i++) {
      const { param, isRest } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param.typeAnnotation);
      if (!paramAnnotation) continue;
      const name = typeRefName(paramAnnotation);
      // rest-only generic `function fn<T>(...xs: T[])` - annotation is T[] or Array<T>, bind T
      // to the element type of the first rest-arg. spread-call `fn(...arr)` passes `args[0]`
      // as a SpreadElement whose overall type IS the array - unwrap once to get the element.
      // no more params possible after rest, so break regardless
      if (isRest) {
        const elementParamName = innerTypeParamName(paramAnnotation, name);
        if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
          const arg = args[i];
          const isSpread = arg.node?.type === 'SpreadElement';
          const resolved = isSpread ? resolveInnerType(resolveNodeType(arg.get('argument'))) : resolveNodeType(arg);
          if (resolved) typeParamMap.set(elementParamName, resolved);
        }
        break;
      }
      // direct: param type is exactly T
      if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
        const resolved = resolveNodeType(args[i]);
        if (resolved) {
          typeParamMap.set(name, resolved);
          argPaths.set(name, args[i]);
        }
        continue;
      }
      // container wrapper: param type is T[], Array<T>, Set<T>, Promise<T>, etc.
      const elementParamName = innerTypeParamName(paramAnnotation, name);
      if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
        const elementType = resolveInnerType(resolveNodeType(args[i]));
        if (elementType) typeParamMap.set(elementParamName, elementType);
      }
    }
    // phase 2: default / constraint fallback for unresolved type params (TS binds to `default`
    // when call-site omits a type arg; constraint is only the upper bound, usually over-broad).
    // route through `substituteTypeParams` (not bare `resolveTypeAnnotation`) so a default that
    // references an earlier type param picks up the already-resolved binding, e.g.
    // `function f<T = string, U = T>(t: T): U` called as `f<number[]>(...)` resolves U to
    // number[] (T's user-supplied value) instead of T.default=string. order matters: phase 1
    // populates T from the explicit arg before phase 2 fills U
    for (const typeParam of fnPath.node.typeParameters.params) {
      const name = typeParamName(typeParam);
      if (typeParamMap.has(name)) continue;
      const annotation = typeParam.default ?? typeParam.constraint;
      if (annotation) {
        const resolved = substituteTypeParams(annotation, typeParamMap, fnPath.scope, 0);
        if (resolved) typeParamMap.set(name, resolved);
      }
    }
    return typeParamMap;
  }

  // resolve return type of a function, inferring generic type parameters from call-site arguments
  function resolveReturnType(fnPath, callPath, classSubst) {
    // generator functions return iterators, async generators return async iterators
    // yield type is extracted from Generator<TYield>/AsyncGenerator<TYield> annotation if present
    if (fnPath.node.generator) {
      const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
      // class type-arg subst applies upfront so method-level subst below sees substituted shape
      const yieldType = classSubstInner(params?.[0], classSubst);
      let inner = yieldType ? resolveTypeAnnotation(yieldType, fnPath.scope) : null;
      // substitute generic type parameters from call site into the yield type
      if (!inner && yieldType && callPath && fnPath.node.typeParameters?.params?.length) {
        const typeParamNames = new Set();
        for (const p of fnPath.node.typeParameters.params) typeParamNames.add(typeParamName(p));
        if (hasTypeParamReference(yieldType, typeParamNames, 0)) {
          const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
          if (typeParamMap.size > 0) inner = substituteTypeParams(yieldType, typeParamMap, fnPath.scope, 0);
        }
      }
      return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // peel TSTypeAnnotation + apply class subst upfront. `returnInner` is the peeled type
    // node (or null) used for both method-level subst and direct annotation resolution
    const returnInner = classSubstInner(fnPath.node.returnType, classSubst);
    const { typeParameters } = fnPath.node;
    // infer generic type parameters and substitute into return type
    if (returnInner && callPath && typeParameters?.params?.length) {
      const typeParamNames = new Set();
      for (const p of typeParameters.params) typeParamNames.add(typeParamName(p));
      if (hasTypeParamReference(returnInner, typeParamNames, 0)) {
        const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
        if (typeParamMap.size > 0) {
          const substituted = substituteTypeParams(returnInner, typeParamMap, fnPath.scope, 0);
          if (substituted) {
            if (fnPath.node.async && substituted.constructor !== 'Promise') return new $Object('Promise', substituted);
            return substituted;
          }
        }
      }
    }
    // try return type annotation
    if (returnInner) {
      const resolved = resolveTypeAnnotation(returnInner, fnPath.scope);
      if (resolved) {
        // Flow allows async functions with non-Promise return annotations (e.g. async function(): string)
        if (fnPath.node.async && resolved.constructor !== 'Promise') return new $Object('Promise', resolved);
        return resolved;
      }
    }
    // fallback: analyze return statements in the function body
    const bodyType = resolveBodyReturnType(fnPath, callPath);
    // async functions always return a Promise, even if body return type is unresolvable
    if (fnPath.node.async) {
      if (!bodyType) return new $Object('Promise');
      if (bodyType.constructor !== 'Promise') return new $Object('Promise', bodyType);
    }
    return bodyType;
  }

  return {
    resolveReturnType,
    resolveBodyReturnType,
    collectReturnPaths,
    getTypeParamArgPath,
    reset,
  };
}
