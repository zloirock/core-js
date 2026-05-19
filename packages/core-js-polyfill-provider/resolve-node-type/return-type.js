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
// Private closures (not in the service object's return): `hasTypeParamReference`,
// `innerTypeParamName`, `bindTypeParam`, `buildTypeParamMap`, `resolveCallArgType`,
// `resolveDirectParam`, `resolvePatternParam`, `resolveParamType`, `resolveBodyExpr`,
// `wrapAsyncPromise`, `applyCallSiteSubst`.
import { MAX_DEPTH, SINGLE_ELEMENT_COLLECTIONS, $Object, $Primitive } from './base.js';
import { typeRefName } from './ast-shapes.js';
import { getTypeArgs } from '../helpers/ast-patterns.js';
import { nodeAlwaysExits } from './exit-analysis.js';

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
  findPatternKeyPath,
  resolveDestructuredMember,
  resolveObjectMemberPath,
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

  // spread-aware call-arg type. `resolveNodeType(SpreadElement)` returns null (the
  // spread node isn't in the expression dispatch), so for `fn(...arr)` against a
  // positional `t: T` slot the iterable's element type is what fills T. mirrors the
  // rest-param spread handling and is shared by `resolveParamType` and
  // `buildTypeParamMap`'s phase-1 direct/rest paths
  function resolveCallArgType(arg) {
    return arg.node?.type === 'SpreadElement'
      ? resolveInnerType(resolveNodeType(arg.get('argument')))
      : resolveNodeType(arg);
  }

  // direct named param (`function f(x)` / `function f(x: T = 0)`): return the call
  // arg at this position (spread-aware), the default's type when no arg was passed,
  // or null when neither source applies
  function resolveDirectParam(param, i, args, fnPath) {
    if (i < args.length) return resolveCallArgType(args[i]);
    if (param.type === 'AssignmentPattern') return resolveNodeType(fnPath.get('params')[i].get('right'));
    return null;
  }

  // destructure pattern param body. invoked AFTER `keyPath` is resolved (caller
  // owns the path lookup so the "name not in pattern" case stays in the loop).
  // spread arg would require double-unwrap through the spread iterable's first
  // element - conservative bail. when no call arg is passed, an outer
  // AssignmentPattern default (`function f({a} = {a: [1,2,3]})` called as `f()`)
  // is the fallback
  function resolvePatternParam(param, keyPath, i, args, fnPath) {
    if (i < args.length) {
      const arg = args[i];
      if (arg.node?.type === 'SpreadElement') return null;
      return resolveDestructuredMember(arg, keyPath);
    }
    if (param.type === 'AssignmentPattern') {
      return resolveObjectMemberPath(fnPath.get('params')[i].get('right'), keyPath);
    }
    return null;
  }

  // resolve parameter type from call-site argument, default value, or rest-element shape.
  // dispatch by param shape (Identifier vs pattern) using NAME match - babel sets
  // `binding.path.node` to the param container (the ObjectPattern itself for destructure),
  // so identity equality conflates direct and destructured cases
  function resolveParamType(binding, fnPath, callPath) {
    const { params } = fnPath.node;
    const args = callPath.get('arguments');
    const targetName = binding.identifier?.name ?? binding.name ?? null;
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      if (param.type === 'RestElement') {
        if (param === binding.path.node) return new $Object('Array');
        continue;
      }
      // peel outer AssignmentPattern wrapper (`function f(x = 0)` / `function f({a} = {})`)
      const patternParam = param.type === 'AssignmentPattern' ? param.left : param;
      if (patternParam?.type === 'Identifier' && patternParam.name === targetName) {
        return resolveDirectParam(param, i, args, fnPath);
      }
      if (!targetName || !findPatternKeyPath) continue;
      if (patternParam?.type !== 'ObjectPattern' && patternParam?.type !== 'ArrayPattern') continue;
      // findPatternKeyPath returns null when the target name isn't in this pattern
      // (continue scanning sibling params); a non-null keyPath is definitive - either
      // resolution succeeds or fails AT this param, no later param can match
      const keyPath = findPatternKeyPath(patternParam, targetName, binding.scope ?? fnPath.scope);
      if (!keyPath) continue;
      return resolvePatternParam(param, keyPath, i, args, fnPath);
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
  // per JS spec, `return` in `finally` overrides `return` in the try/catch of the
  // same TryStatement ONLY when the finalizer terminates unconditionally on every
  // path. a conditional finalizer (`finally { if (cond) return ... }`) may fall
  // through, so its branches must merge with try/catch returns rather than
  // shadow them. this is handled per-TryStatement, not globally - returns outside
  // a try-finally are unaffected
  function collectReturnPaths(blockPath) {
    const getChildren = (path, key) => Array.isArray(path.node[key]) ? path.get(key) : [path.get(key)];
    const collect = (path, depth = 0) => {
      if (depth > MAX_DEPTH || !path.node || t.isFunction(path.node)) return [];
      if (t.isReturnStatement(path.node)) return [path];
      const { node } = path;
      if (node.type === 'TryStatement') {
        const finalizerReturns = node.finalizer ? collect(path.get('finalizer'), depth + 1) : [];
        // finalizer always exits - try/catch returns can't be observed (caller sees
        // the finalizer's completion). throw / break / continue exits count too:
        // their abrupt completions also discard try/catch returns. when no return
        // is present (only throws), finalizerReturns is empty and the function
        // contributes no return type from this try, which is correct
        if (node.finalizer && nodeAlwaysExits(node.finalizer)) return finalizerReturns;
        const result = [];
        if (node.block) for (const r of collect(path.get('block'), depth + 1)) result.push(r);
        if (node.handler) for (const r of collect(path.get('handler'), depth + 1)) result.push(r);
        // conditional finalizer returns join the union - both try/catch paths and
        // finalizer's conditional `return` branches can produce the function's value
        for (const r of finalizerReturns) result.push(r);
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
    // generator bodies use `return X` for the iterator-completion value (TReturn),
    // not for the function's runtime result - the function itself returns a
    // Generator instance. callers awaiting `gen()` should fall back to the declared
    // annotation path (`resolveReturnType` handles the generator branch upfront);
    // only `resolveAwaitedFromCallBody` reaches here for generators
    if (fnPath.node.generator) return null;
    const body = fnPath.get('body');
    // arrow with expression body: () => [1, 2, 3]
    if (!t.isBlockStatement(body.node)) return resolveBodyExpr(body, fnPath, callPath);
    // block body: collect return statements, skip nested functions. nullable-typed
    // branches stay out of the commonType merge (so `if(x) return null; return arr;`
    // narrows to Array rather than null|Array which commonType folds to null), but an
    // EXPLICIT nullable - `return null` / `return undefined` - is captured separately
    // as a fallback. when no non-nullable branch contributes, the fallback wins instead
    // of the implicit `undefined` literal that would otherwise wrap as `Promise<undefined>`
    let result = null;
    let nullableFallback = null;
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      const isBareReturn = !arg.node;
      const type = isBareReturn ? new $Primitive('undefined') : resolveBodyExpr(arg, fnPath, callPath);
      if (!type) return null;
      // skip bare `return;` (implicit undefined, common in `catch { return; }`
      // bail-outs) and `never`-typed returns (consistent with how
      // resolveConditionalBranches handles never branches)
      if (isBareReturn || type.type === 'never') continue;
      if (isNullableOrNever(type)) {
        nullableFallback ??= type;
        continue;
      }
      const merged = commonType(result, type);
      if (result && !merged) return null;
      result = merged;
    }
    return result ?? nullableFallback ?? new $Primitive('undefined');
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

  // commit a phase-1 type-param binding when the name is in the target set, unbound,
  // and a non-null resolution exists. returns whether the binding was actually written
  // (caller uses the bool to gate side records like `argPaths`)
  function bindTypeParam(name, typeParamNames, typeParamMap, resolved) {
    if (!name || !typeParamNames.has(name) || typeParamMap.has(name) || !resolved) return false;
    typeParamMap.set(name, resolved);
    return true;
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
      // as a SpreadElement whose overall type IS the array - `resolveCallArgType` unwraps
      // once to get the element. no more params possible after rest, so break regardless
      if (isRest) {
        bindTypeParam(innerTypeParamName(paramAnnotation, name), typeParamNames, typeParamMap, resolveCallArgType(args[i]));
        break;
      }
      // direct: param type is exactly T. for `fn(...arr)` against `t: T`, T binds
      // to the iterable element (handled inside `resolveCallArgType`). without that
      // path, T falls through to phase 2's default/constraint and loses precision.
      // argPath records the actual call arg for `getTypeParamArgPath` consumers;
      // SpreadElement isn't a single-value path that indexed-access peek can inspect
      const arg = args[i];
      if (bindTypeParam(name, typeParamNames, typeParamMap, resolveCallArgType(arg))) {
        if (arg.node?.type !== 'SpreadElement') argPaths.set(name, arg);
        continue;
      }
      // container wrapper: param type is T[], Array<T>, Set<T>, Promise<T>, etc.
      bindTypeParam(innerTypeParamName(paramAnnotation, name), typeParamNames, typeParamMap, resolveInnerType(resolveNodeType(arg)));
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

  // wrap a resolved return type in `Promise<...>` for async functions when it's not
  // already a Promise. Flow allows `async function(): T` for non-Promise T at the
  // annotation level - this normalizes the runtime view to `Promise<T>`. null type
  // pre-Promise stays null; caller handles the bare-Promise fallback
  function wrapAsyncPromise(type, isAsync) {
    if (!isAsync || !type || type.constructor === 'Promise') return type;
    return new $Object('Promise', type);
  }

  // call-site generic substitution into a return-type slot (yield type for
  // generators, or the function's `returnType` annotation otherwise). returns the
  // substituted type or null when the annotation has no type-param references,
  // the call-site map is empty, or substitution itself fails. shared between
  // the generator and direct-annotation paths of `resolveReturnType`
  function applyCallSiteSubst(annotationNode, fnPath, callPath) {
    const typeParams = fnPath.node.typeParameters?.params;
    if (!typeParams?.length) return null;
    const typeParamNames = new Set();
    for (const p of typeParams) typeParamNames.add(typeParamName(p));
    if (!hasTypeParamReference(annotationNode, typeParamNames, 0)) return null;
    const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
    if (typeParamMap.size === 0) return null;
    return substituteTypeParams(annotationNode, typeParamMap, fnPath.scope, 0);
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
      if (!inner && yieldType && callPath) inner = applyCallSiteSubst(yieldType, fnPath, callPath);
      return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // peel TSTypeAnnotation + apply class subst upfront. `returnInner` is the peeled type
    // node (or null) used for both method-level subst and direct annotation resolution
    const returnInner = classSubstInner(fnPath.node.returnType, classSubst);
    const isAsync = fnPath.node.async;
    // infer generic type parameters and substitute into return type
    if (returnInner && callPath) {
      const substituted = applyCallSiteSubst(returnInner, fnPath, callPath);
      if (substituted) return wrapAsyncPromise(substituted, isAsync);
    }
    // try return type annotation
    if (returnInner) {
      const resolved = resolveTypeAnnotation(returnInner, fnPath.scope);
      if (resolved) return wrapAsyncPromise(resolved, isAsync);
    }
    // fallback: analyze return statements in the function body
    const bodyType = resolveBodyReturnType(fnPath, callPath);
    // async functions always return a Promise, even if body return type is unresolvable
    if (isAsync) return wrapAsyncPromise(bodyType, isAsync) ?? new $Object('Promise');
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
