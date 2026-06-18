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
import { MAX_DEPTH, SINGLE_ELEMENT_COLLECTIONS, $Object, $Primitive, peelAssignmentPattern } from './base.js';
import { isBareUndefinedIdentifier, isTypeQueryOverImportType, peelTSParenthesized, typeRefName } from './ast-shapes.js';
import { getTypeArgs, spreadAtOrBefore } from '../helpers/ast-patterns.js';
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
  safeInnerType,
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
  // arg at this position (spread-aware via canonical spreadAtOrBefore), the default's
  // type when no arg was passed, or null when neither source applies
  function resolveDirectParam(param, i, args, fnPath) {
    if (spreadAtOrBefore(args, i)) return null;
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
      // a spread at OR before this slot shifts the arg->param mapping (sibling resolveDirectParam
      // uses the same guard); `args[i]` is then not the value that reaches this pattern param
      if (spreadAtOrBefore(args, i)) return null;
      return resolveDestructuredMember(args[i], keyPath);
    }
    if (param.type === 'AssignmentPattern') {
      return resolveObjectMemberPath(fnPath.get('params')[i].get('right'), keyPath);
    }
    return null;
  }

  // locate the param that binds `targetName` - direct Identifier (`x` / `x = D`), destructure
  // pattern (`{a}` / `[a]`, possibly defaulted), or rest (`...args`). returns { index, param,
  // keyPath } or null. `param` keeps the outer AssignmentPattern wrapper intact so callers can
  // test for a default; `keyPath` is non-null only for destructure-pattern matches. NAME match
  // (not identity) - babel sets `binding.path.node` to the ObjectPattern container for
  // destructure, conflating direct and destructured cases. shared by resolveParamType +
  // paramHasOverridingArg so both agree on the binding-to-param mapping
  function findBindingParam(binding, fnPath) {
    const targetName = binding.identifier?.name ?? binding.name ?? null;
    const { params } = fnPath.node;
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      if (param.type === 'RestElement') {
        if (param === binding.path.node) return { index: i, param, keyPath: null };
        continue;
      }
      // peel outer AssignmentPattern wrapper (`function f(x = 0)` / `function f({a} = {})`)
      const patternParam = peelAssignmentPattern(param);
      if (patternParam?.type === 'Identifier' && patternParam.name === targetName) {
        return { index: i, param, keyPath: null };
      }
      if (!targetName || !findPatternKeyPath) continue;
      if (patternParam?.type !== 'ObjectPattern' && patternParam?.type !== 'ArrayPattern') continue;
      // findPatternKeyPath returns null when the target name isn't in this pattern (continue
      // scanning siblings); a non-null keyPath is definitive - resolution succeeds or fails AT
      // this param, no later param can match
      const keyPath = findPatternKeyPath(patternParam, targetName, binding.scope ?? fnPath.scope);
      if (keyPath) return { index: i, param, keyPath };
    }
    return null;
  }

  // resolve parameter type from call-site argument, default value, or rest-element shape
  function resolveParamType(binding, fnPath, callPath) {
    const found = findBindingParam(binding, fnPath);
    if (!found) return null;
    const { index, param, keyPath } = found;
    if (param.type === 'RestElement') return new $Object('Array');
    const args = callPath.get('arguments');
    return keyPath
      ? resolvePatternParam(param, keyPath, index, args, fnPath)
      : resolveDirectParam(param, index, args, fnPath);
  }

  // a positional call arg overrides the binding's param DEFAULT (`f(x = D) { return x } f(arg)`):
  // only an AssignmentPattern param with an arg at its position qualifies; a bare annotation
  // (`x: T`) carries no default, so its declared type stays the authoritative narrow
  function paramHasOverridingArg(binding, fnPath, callPath) {
    const found = findBindingParam(binding, fnPath);
    if (!found || found.param.type !== 'AssignmentPattern') return false;
    const args = callPath.node.arguments;
    // a spread arg at/before this slot makes the default possibly overridden: treat as overridden
    // (return true) so the caller bails rather than narrowing the param to its default type
    if (spreadAtOrBefore(args, found.index)) return true;
    const arg = args?.[found.index];
    if (!arg) return false;
    // an explicit `undefined` / `void <x>` arg TRIGGERS the param default rather than overriding
    // it (JS coerces `undefined` at a defaulted param to the default), so the default's declared
    // type stays authoritative - narrowing to the arg's `undefined` would drop the polyfill. any
    // `void <x>` yields undefined; bare `undefined` only when unshadowed (it's a writable global)
    if (arg.type === 'UnaryExpression' && arg.operator === 'void') return false;
    if (isBareUndefinedIdentifier(arg) && !callPath.scope?.getBinding?.('undefined')) return false;
    return true;
  }

  // resolve expression type within a function body, with fallback to call-site parameter inference
  function resolveBodyExpr(path, fnPath, callPath) {
    const resolved = callPath ? resolvePath(path) : null;
    const refBinding = resolved && t.isIdentifier(resolved.node)
      ? resolved.scope?.getBinding(resolved.node.name) : null;
    const validBinding = refBinding && !refBinding.constantViolations?.length ? refBinding : null;
    // a positional arg overrides a param's default - prefer the arg over the body-local type,
    // which would surface the default and mask the argument. `validBinding` is null for a param
    // reassigned in the body (its constantViolations), so the body-local `resolveNodeType` below
    // still wins there. when the override's type can't be determined (e.g. a spread arg of unknown
    // length supplies this slot) we BAIL rather than fall through to the default, which is unsound
    if (validBinding && paramHasOverridingArg(validBinding, fnPath, callPath)) {
      return resolveParamType(validBinding, fnPath, callPath);
    }
    const type = resolveNodeType(path);
    if (type) return type;
    return validBinding ? resolveParamType(validBinding, fnPath, callPath) : null;
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

  // probe a function-like param's annotation for a type-param reference. handles plain
  // Identifier params (`x: T`) and RestElement (`...args: T[]`) - the pinned parsers place the
  // rest annotation on the RestElement's own `typeAnnotation`; `.argument.typeAnnotation` is a
  // defensive fallback for the alternate ESTree shape. AssignmentPattern default (`x: T = v`)
  // carries its annotation on `.left.typeAnnotation`
  function hasParamTypeRef(param, typeParamNames, depth) {
    if (!param) return false;
    if (hasTypeParamReference(param.typeAnnotation, typeParamNames, depth)) return true;
    if (param.type === 'RestElement' && param.argument
      && hasTypeParamReference(param.argument.typeAnnotation, typeParamNames, depth)) return true;
    if (param.type === 'AssignmentPattern' && param.left
      && hasTypeParamReference(param.left.typeAnnotation, typeParamNames, depth)) return true;
    return false;
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
          // method signatures carry params (`{ foo(x: T): U }`); a T in param must propagate
          // so call-site subst captures it. babel@8 renamed the slot `parameters`->`params`
          // (oxc/babel@7 use `parameters`); property signatures have neither, skipped
          const memberParams = member.params ?? member.parameters;
          if (memberParams) for (const param of memberParams) {
            if (hasParamTypeRef(param, typeParamNames, depth + 1)) return true;
          }
        }
        return false;
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        // function-type params (`(x: T) => U`) - T in param slot or `...rest: T[]` must
        // count as referenced so outer-fn subst captures it. each param's annotation is
        // walked (RestElement carries it via `.argument.typeAnnotation` on babel; oxc
        // hoists to top-level - `hasParamTypeRef` handles both shapes)
        if (node.params) for (const param of node.params) {
          if (hasParamTypeRef(param, typeParamNames, depth + 1)) return true;
        }
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
      return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator', safeInnerType(inner));
    }
    // peel TSTypeAnnotation + apply class subst upfront. `returnInner` is the peeled type
    // node (or null) used for both method-level subst and direct annotation resolution
    const returnInner = classSubstInner(fnPath.node.returnType, classSubst);
    const isAsync = fnPath.node.async;
    // async normalization: wrap non-Promise results, fall back to bare Promise on null
    function wrap(type) { return wrapAsyncPromise(type, isAsync); }
    const asyncFallback = isAsync ? new $Object('Promise') : null;
    // infer generic type parameters and substitute into return type
    if (returnInner && callPath) {
      const substituted = applyCallSiteSubst(returnInner, fnPath, callPath);
      if (substituted) return wrap(substituted);
    }
    if (returnInner) {
      const resolved = resolveTypeAnnotation(returnInner, fnPath.scope);
      if (resolved) return wrap(resolved);
      // structural shape - body inference would clobber the declared annotation with a
      // scalar Type. bail so callers route through `findExpressionAnnotation` which
      // preserves the structural shape for member lookups. see isStructuralAnnotation
      if (isStructuralAnnotation(returnInner)) return asyncFallback;
    }
    // fallback: analyze return statements in the function body
    return wrap(resolveBodyReturnType(fnPath, callPath)) ?? asyncFallback;
  }

  // type annotations whose value-level shape requires annotation-level member lookup -
  // body inference would clobber them with a scalar `$Primitive('null')` (from
  // `return null as any` stubs) and drop every narrow on the receiver chain.
  // intersection enters only when ALL branches are structural (a scalar branch would have
  // made `resolveTypeAnnotation` non-null via the fold). `TSImportType` is cross-module
  // opaque. union is INTENTIONALLY excluded: `T | null` body-returning `null` is a correct
  // narrow that the polyfill detector turns into a no-polyfill emission; bailing would
  // over-inject Maybe-* variants. wide-open keywords (any / unknown / mixed) similarly
  // benefit from body inference and are excluded
  const STRUCTURAL_ANNOTATION_TYPES = new Set([
    'TSTypeLiteral',
    'ObjectTypeAnnotation',
    'TSIntersectionType',
    'IntersectionTypeAnnotation',
    'TSImportType',
  ]);

  // peel `(T)` first so wrapped structurals on the oxc parser path don't leak; `unwrap-
  // TypeAnnotation` only strips the outer `TSTypeAnnotation`. `typeof import(...).X` is
  // an extra nesting (`TSTypeQuery` over `TSImportType`) that the flat set can't express,
  // routed through the shared `isTypeQueryOverImportType` predicate
  function isStructuralAnnotation(annotation) {
    const peeled = peelTSParenthesized(annotation);
    return STRUCTURAL_ANNOTATION_TYPES.has(peeled?.type) || isTypeQueryOverImportType(peeled);
  }

  return {
    resolveReturnType,
    resolveBodyReturnType,
    collectReturnPaths,
    getTypeParamArgPath,
    reset,
  };
}
