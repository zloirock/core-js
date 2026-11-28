// Function return type resolution. covers four call shapes:
//   - inferred from explicit `<...>` call-site args / param-position generics
//   - declared via the function's `returnType` annotation
//   - generator / async generator: `Generator<TYield>` / `AsyncGenerator<TYield>` ->
//     `Iterator<inner>` / `AsyncIterator<inner>` (yield-type extraction)
//   - body-fold: `return` statements walked, commonType-aggregated, async wrapped in Promise
//
// Public surface:
//   resolveReturnType(fnPath, callPath, classSubst)  - main entry
//   resolveReturnUnionHints(fnPath, callPath)        - reachable return families when no Type fits
//   resolveBodyReturnType(fnPath, callPath, awaitResult?) - body-return fold (used by awaited
//                                                       cluster's `resolveAwaitedFromCallBody`)
//   collectReturnPaths(blockPath)                    - the `return` statements a body-fold walks
//                                                       (also drives the class-member cluster's
//                                                       method / getter return resolution)
//   getTypeParamArgPath(typeParamMap, paramName)     - look up the call arg's NodePath for a
//                                                       bound type param (peeks into the actual
//                                                       ObjectExpression literal past the
//                                                       declared T[K] constraint, for both the
//                                                       index-access hit and the arg-literal
//                                                       index in the factory)
//   hasParamTypeRef(param, typeParamNames, depth)    - does this param's annotation mention one
//                                                       of the type params? (the call-resolution
//                                                       cluster's inference gate)
//   reset()                                          - reset the sidecar arg-path WeakMap
//
// Private closures (not in the service object's return): `hasTypeParamReference`,
// `innerTypeParamName`, `buildTypeParamMap`,
// `resolveDirectParam`, `resolvePatternParam`, `resolveParamType`, `resolveBodyExpr`,
// `wrapAsyncPromise`, `applyCallSiteSubst`, `findBindingParam`, `paramHasOverridingArg`,
// `hasAnyParamTypeRef`, `isStructuralAnnotation`.
import {
  MAX_DEPTH, firstTypeParamIsInner, $Object, $Primitive,
  argIndexForParam, callArgumentPaths, canonicalArrayIndex,
} from './base.js';
import { isTypeQueryOverImportType, isUnionType, typeRefName } from './ast-shapes.js';
import {
  argumentOverridesSlot,
  effectiveArgsLength,
  getCallSiteTypeArgs,
  getTypeArgs,
  isTupleRestElement,
  unwrapTupleMember,
  patternSlotTarget,
  patternSlotHasDefault,
  pathIsInside,
  positionalPathAt,
  peelSkippableWrapperPath,
  peelTSParenthesized,
  propertyInstallsPrototype,
  varInitStaleByRedecl,
} from '../helpers/ast-patterns.js';
import { EXIT_STATEMENTS, nodeAlwaysExits } from './exit-analysis.js';

export function createReturnType({
  visitInferenceArguments,
  argumentSkipsDefault,
  settleValue,
  getScopeBinding,
  t,
  babelNodeType,
  unwrapTypeAnnotation,
  effectiveParam,
  inferredLiteralAnnotation,
  functionTypeParams,
  typeParamName,
  tupleElements,
  mappedTypeConstraint,
  resolveNodeType,
  resolvePath,
  resolveInnerType,
  resolveCallArgType,
  resolveTypeAnnotation,
  substituteTypeParams,
  buildCallSiteSubst,
  withTypeReferenceScope,
  generatorTypeParams,
  classSubstInner,
  shadowMethodTypeParams,
  dropTypeParamSubst,
  isNullableOrNever,
  isNullableOrNeverAnnotation,
  elementContainerType,
  commonType,
  foldUnionTypes,
  mergeArmHints,
  annotationUnionHints,
  findPatternKeyPath,
  foldWithPatternDefault,
  resolveDestructuredMember,
  resolveObjectMemberPath,
  walkObjectLiteralPropertyPath,
  decidedLiveKey,
  isMutatedStatic = () => false,
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

  // direct named param (`function f(x)` / `function f(x: T = 0)`): return the call
  // arg at this position (the positional read, an inline-array spread expanded), the default's
  // type when no arg or a proven undefined was passed. A nullish-capable argument also
  // admits the default; fold both before choosing a return family.
  function resolveDirectParam(param, i, args, fnPath, unionHints = false, depth = 0) {
    // dual index: align `args` on the this-dropped `argIndex`, keep the raw `i` for the AST params
    // path (the AssignmentPattern default lookup below)
    const argIndex = argIndexForParam(fnPath.node.params, i);
    const nodes = args.map(a => a.node);
    const arg = positionalPathAt(args, argIndex, isMutatedStatic);
    const length = effectiveArgsLength(nodes, isMutatedStatic);
    if (length === null && !arg) return null;
    if (arg || argIndex < length) {
      const type = arg ? resolveCallArgType(arg) : null;
      if (unionHints) {
        if (!arg) return null;
        const arms = [arg];
        if (param.type === 'AssignmentPattern' && (!type || type.mayBeNullish || type.type === 'undefined')) {
          arms.push(fnPath.get('params')[i].get('right'));
        }
        return mergeArmHints(arms, depth);
      }
      if (param.type === 'AssignmentPattern' && type?.mayBeNullish) {
        const fallback = resolveNodeType(fnPath.get('params')[i].get('right'));
        return fallback ? foldUnionTypes([type, fallback], value => value) : null;
      }
      if (param.type !== 'AssignmentPattern' || type?.type !== 'undefined') return type;
    }
    if (param.type === 'AssignmentPattern') {
      const fallback = fnPath.get('params')[i].get('right');
      return unionHints ? mergeArmHints([fallback], depth) : resolveNodeType(fallback);
    }
    return null;
  }

  // destructure pattern param body. invoked AFTER `keyPath` is resolved (caller
  // owns the path lookup so the "name not in pattern" case stays in the loop).
  // spread arg would require double-unwrap through the spread iterable's first
  // element - conservative bail. when no call arg is passed, an outer
  // AssignmentPattern default (`function f({a} = {a: [1,2,3]})` called as `f()` or `f(undefined)`)
  // is the fallback
  function resolvePatternParam(param, keyPath, i, args, fnPath, name, unionHints = false) {
    // dual index, like resolveDirectParam: `argIndex` aligns the call args past a leading `this`, raw
    // `i` keeps the AST `params` path on the real slot
    const argIndex = argIndexForParam(fnPath.node.params, i);
    const nodes = args.map(a => a.node);
    const arg = positionalPathAt(args, argIndex, isMutatedStatic);
    const length = effectiveArgsLength(nodes, isMutatedStatic);
    if (length === null && !arg) return null;
    if ((arg || argIndex < length) && (param.type !== 'AssignmentPattern' || !arg || resolveCallArgType(arg)?.type !== 'undefined')) {
      // A plain one-field pattern captures a fresh data slot before the callee body
      // can mutate its argument. No sibling getter, key/default work or prototype install
      // can replace that slot on this shape; other arguments keep the closure proof.
      const pattern = patternSlotTarget(param);
      const literal = arg && peelSkippableWrapperPath(arg);
      const property = pattern?.type === 'ObjectPattern' && pattern.properties.length === 1
          ? pattern.properties[0] : null;
      if (unionHints && keyPath.length === 1 && property && !property.computed && property.value?.type === 'Identifier'
          && t.isObjectExpression(literal?.node) && literal.node.properties.length === 1
          && t.isObjectProperty(literal.node.properties[0]) && !propertyInstallsPrototype(literal.node.properties[0])) {
        const value = walkObjectLiteralPropertyPath(literal, keyPath[0]);
        return value ? mergeArmHints([value], 0) : null;
      }
      if (!arg) return null;
      if (!patternSlotHasDefault(pattern, name)) return resolveDestructuredMember(arg, keyPath, unionHints);
      const type = foldWithPatternDefault(resolveDestructuredMember(arg, keyPath), pattern, name, fnPath.get('params')[i], arg);
      return unionHints ? type && mergeArmHints([arg], 0, () => type) : type;
    }
    if (param.type === 'AssignmentPattern') {
      return resolveObjectMemberPath(fnPath.get('params')[i].get('right'), keyPath, null, unionHints);
    }
    return null;
  }

  function parameterIndexAt(site, fnPath) {
    while (site?.parentPath && site.parentPath.node !== fnPath.node) site = site.parentPath;
    return fnPath.node.params.indexOf(site?.node);
  }

  // Use the declaration site: a catch or nested function may bind the same spelling.
  function findBindingParam(binding, fnPath) {
    if (binding.kind !== 'param') return null;
    const index = parameterIndexAt(binding.path, fnPath);
    if (index === -1) return null;
    const param = fnPath.node.params[index];
    const name = binding.identifier?.name ?? binding.name;
    const pattern = patternSlotTarget(param.type === 'RestElement' ? param.argument : param);
    if (pattern?.type === 'Identifier') return pattern.name === name ? { index, param, name } : null;
    const keyPath = findPatternKeyPath(pattern, name, binding.scope ?? fnPath.scope);
    return keyPath ? { index, param, name, keyPath } : null;
  }

  // resolve parameter type from call-site argument, default value, or rest-element shape.
  // takes the binding-to-param record rather than the binding: the caller has to run the scan
  // anyway to decide whether the override lane applies, and the scan walks every ObjectPattern /
  // ArrayPattern param through `findPatternKeyPath` once per collected return of the body
  function resolveParamType({ index, param, name, keyPath }, fnPath, callPath, unionHints = false, depth = 0) {
    const args = callArgumentPaths(callPath);
    if (param.type === 'RestElement') {
      if (!keyPath) return unionHints ? new Set(['array']) : new $Object('Array');
      const [slot, ...keys] = keyPath;
      const offset = canonicalArrayIndex(slot);
      if (offset === null) return null;
      const arg = positionalPathAt(args, argIndexForParam(fnPath.node.params, index) + offset, isMutatedStatic);
      if (!arg) return null;
      if (keys.length) return resolveDestructuredMember(arg, keys, unionHints);
      return unionHints ? mergeArmHints([arg], depth) : resolveCallArgType(arg);
    }
    return keyPath
      ? unionHints
        ? mergeArmHints([fnPath], depth,
          () => resolvePatternParam(param, keyPath, index, args, fnPath, name),
          () => resolvePatternParam(param, keyPath, index, args, fnPath, name, true))
        : resolvePatternParam(param, keyPath, index, args, fnPath, name)
      : resolveDirectParam(param, index, args, fnPath, unionHints, depth);
  }

  // a positional call arg overrides the binding's param DEFAULT (`f(x = D) { return x } f(arg)`):
  // only an AssignmentPattern param with an arg at its position qualifies; a bare annotation
  // (`x: T`) carries no default, so its declared type stays the authoritative narrow
  function paramHasOverridingArg(found, fnPath, callPath) {
    if (found.param.type !== 'AssignmentPattern') return false;
    const args = callArgumentPaths(callPath).map(a => a.node);
    // align the call arg past a leading `this` pseudo-param (raw `found.index` indexes the AST params);
    // the slot itself is the shared rule's (a spread no position survives, an `undefined` / `void`
    // argument that runs the default - narrowing to it would drop the polyfill)
    return argumentOverridesSlot(args, argIndexForParam(fnPath.node.params, found.index),
      () => !!getScopeBinding({ scope: callPath.scope, name: 'undefined' }), isMutatedStatic);
  }

  // resolve expression type within a function body, with fallback to call-site parameter inference
  function resolveBodyExpr(path, fnPath, callPath, unionHints = false, depth = 0) {
    const resolved = callPath ? resolvePath(path) : null;
    const refBinding = resolved && t.isIdentifier(resolved.node)
      ? getScopeBinding({ scope: resolved.scope, name: resolved.node.name, path: resolved }) : null;
    const validBinding = refBinding && !refBinding.constantViolations?.length ? refBinding : null;
    // one scan for all three readers below
    const found = validBinding && findBindingParam(validBinding, fnPath);
    if (found && varInitStaleByRedecl({ binding: validBinding, usagePath: path, name: found.name })) return null;
    // a positional arg overrides a param's default - prefer the arg over the body-local type,
    // which would surface the default and mask the argument. `validBinding` is null for a param
    // reassigned in the body (its constantViolations), so the body-local `resolveNodeType` below
    // still wins there. when the override's type can't be determined (e.g. a spread arg of unknown
    // length supplies this slot) we BAIL rather than fall through to the default, which is unsound
    if (found && paramHasOverridingArg(found, fnPath, callPath)) {
      return resolveParamType(found, fnPath, callPath, unionHints, depth);
    }
    const type = unionHints ? mergeArmHints([path], depth) : resolveNodeType(path);
    if (type) return type;
    return found ? resolveParamType(found, fnPath, callPath, unionHints, depth) : null;
  }

  // Project the same return expressions and call-site parameter pairing to dispatch families.
  // An opaque signature or return keeps the whole set unknown; nullable returns dispatch nothing.
  function resolveReturnUnionHints(fnPath, callPath, depth = 0) {
    const annotation = unwrapTypeAnnotation(fnPath.node.returnType);
    if (annotation) return annotationUnionHints(annotation, fnPath.scope);
    const body = fnPath.get('body');
    if (!body.node || fnPath.node.declare || fnPath.node.async || fnPath.node.generator) return null;
    if (!t.isBlockStatement(body.node)) return resolveBodyExpr(body, fnPath, callPath, true, depth);
    const returns = collectReturnPaths(body).map(path => path.get('argument')).filter(path => path.node);
    return mergeArmHints(returns, depth, () => null,
      (path, nextDepth) => resolveBodyExpr(path, fnPath, callPath, true, nextDepth));
  }

  // does the statement at `path` always leave the list it stands in, so no statement after it runs: a
  // return, throw, break or continue, a block holding one that does, an `if` whose every arm does - the
  // arm this build always takes alone where it decides the test (`decidedLiveKey`). any other statement
  // answers false: a loop may not run, and a label or a switch catches a break that resumes after it
  function alwaysLeavesList(path, depth = 0) {
    const { node } = path;
    if (depth > MAX_DEPTH) return false;
    if (EXIT_STATEMENTS.has(node.type)) return true;
    if (node.type === 'BlockStatement') return path.get('body').some(child => alwaysLeavesList(child, depth + 1));
    if (node.type !== 'IfStatement') return false;
    const live = decidedLiveKey(node, path);
    if (live === 'consequent' || live === 'alternate') return !!node[live] && alwaysLeavesList(path.get(live), depth + 1);
    return !!node.alternate && alwaysLeavesList(path.get('consequent'), depth + 1) && alwaysLeavesList(path.get('alternate'), depth + 1);
  }

  // collect return statement paths from a block body, skipping nested functions
  // per JS spec, `return` in `finally` overrides `return` in the try/catch of the
  // same TryStatement ONLY when the finalizer terminates unconditionally on every
  // path. a conditional finalizer (`finally { if (cond) return ... }`) may fall
  // through, so its branches must merge with try/catch returns rather than
  // shadow them. this is handled per-TryStatement, not globally - returns outside
  // a try-finally are unaffected. a return the build never reaches is none: one in
  // the dead arm of an `if` it decides, or after a statement that always leaves its list
  function collectReturnPaths(blockPath, onDepthLimit) {
    function getChildren(path, key) {
      return Array.isArray(path.node[key]) ? path.get(key) : [path.get(key)];
    }
    // the returns of a statement list, up to the first statement that always leaves it
    function collectList(paths, depth) {
      const result = [];
      for (const [index, p] of paths.entries()) {
        for (const r of collect(p, depth)) result.push(r);
        if (index < paths.length - 1 && alwaysLeavesList(p)) break;
      }
      return result;
    }
    function collect(path, depth = 0) {
      if (depth > MAX_DEPTH) {
        onDepthLimit?.();
        return [];
      }
      if (!path.node || t.isFunction(path.node)) return [];
      if (t.isReturnStatement(path.node)) return [path];
      const { node } = path;
      if (node.type === 'TryStatement') {
        const finalizerReturns = node.finalizer ? collect(path.get('finalizer'), depth + 1) : [];
        // finalizer always exits - try/catch returns can't be observed (caller sees
        // the finalizer's completion). throw / break / continue exits count too:
        // their abrupt completions also discard try/catch returns. when no return
        // is present (only throws), finalizerReturns is empty and the function
        // contributes no return type from this try, which is correct
        if (node.finalizer && (nodeAlwaysExits(node.finalizer) || alwaysLeavesList(path.get('finalizer')))) return finalizerReturns;
        const result = [];
        if (node.block) for (const r of collect(path.get('block'), depth + 1)) result.push(r);
        if (node.handler) for (const r of collect(path.get('handler'), depth + 1)) result.push(r);
        // conditional finalizer returns join the union - both try/catch paths and
        // finalizer's conditional `return` branches can produce the function's value
        for (const r of finalizerReturns) result.push(r);
        return result;
      }
      // an `if` this build decides runs its live arm alone
      const live = node.type === 'IfStatement' ? decidedLiveKey(node, path) : null;
      if (live === 'consequent' || live === 'alternate') return node[live] ? collect(path.get(live), depth + 1) : [];
      // recurse into block/control-flow children
      const result = [];
      if (node.body) for (const r of collectList(getChildren(path, 'body'), depth + 1)) result.push(r);
      if (node.consequent) for (const r of collectList(getChildren(path, 'consequent'), depth + 1)) result.push(r);
      if (node.alternate) for (const r of collect(path.get('alternate'), depth + 1)) result.push(r);
      if (node.cases) for (const p of path.get('cases')) for (const r of collect(p, depth + 1)) result.push(r);
      return result;
    }
    return collectList(blockPath.get('body'), 0);
  }

  function resolveBodyReturnType(fnPath, callPath, awaitResult = fnPath.node.async) {
    // generator bodies use `return X` for the iterator-completion value (TReturn),
    // not for the function's runtime result - the function itself returns a
    // Generator instance. callers awaiting `gen()` should fall back to the declared
    // annotation path (`resolveReturnType` handles the generator branch upfront);
    // only `resolveAwaitedFromCallBody` reaches here for generators
    if (fnPath.node.generator) return null;
    const body = fnPath.get('body');
    // an ambient / overload HEAD carries no return evidence to fold - babel leaves its
    // body slot empty, oxc emits an EMPTY BlockStatement with `declare: true` (which the
    // empty-body rule below would read as an implicit-undefined return). yield null
    // instead of fabricating a type (a fabricated `undefined` receiver suppressed
    // injection entirely downstream; the estree adapter binds ambient names, so a
    // bodyless head genuinely reaches this fold)
    if (!body.node || fnPath.node.declare) return null;
    function returned(path) {
      const type = resolveBodyExpr(path, fnPath, callPath);
      return awaitResult ? settleValue(path, type) : type;
    }
    if (!t.isBlockStatement(body.node)) return returned(body);
    // block body: collect return statements, skip nested functions. nullable-typed
    // branches stay out of the commonType merge (so `if(x) return null; return arr;`
    // narrows to Array rather than null|Array which commonType folds to null), but an
    // EXPLICIT nullable - `return null` / `return undefined` - is captured separately
    // as a fallback. when no non-nullable branch contributes, the fallback wins instead
    // of the implicit `undefined` literal that would otherwise wrap as `Promise<undefined>`
    let result = null;
    let nullableFallback = null;
    let droppedNullish = false;
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      const isBareReturn = !arg.node;
      const type = isBareReturn ? new $Primitive('undefined') : returned(arg);
      if (!type) return null;
      // skip bare `return;` (implicit undefined, common in `catch { return; }`
      // bail-outs) and `never`-typed returns (consistent with how
      // the conditional fold strips never branches)
      if (isBareReturn || type.type === 'never') {
        droppedNullish ||= isBareReturn;
        continue;
      }
      if (isNullableOrNever(type)) {
        nullableFallback ??= type;
        droppedNullish = true;
        continue;
      }
      const merged = commonType(result, type);
      if (result && !merged) return null;
      result = merged;
    }
    // a body that can FALL OFF THE END returns implicit undefined - same nullish arm as an
    // explicit bare `return`, just without a ReturnStatement to collect; without this the
    // conditionally-returning body (`if (c) return [1, 2];`) yields its survivor unmarked
    if (!nodeAlwaysExits(body.node) && !alwaysLeavesList(body)) droppedNullish = true;
    // a dropped nullable / bare-return arm still returns at runtime, so the fold survivor
    // is not always-truthy: mark it so an enclosing logical fold keeps the two-operand
    // union (`f() ?? 'x'` may yield 'x'). mirrors foldUnionTypes / the `?:` branch fold
    if (result && droppedNullish) result = result.mark('mayBeNullish');
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
    // no `AssignmentPattern` arm: every caller pre-peels the default wrapper, and the remaining
    // sites are type-position params, where an initializer is a syntax error
    return false;
  }

  // any param in a signature's param list references a type param from the given set
  function hasAnyParamTypeRef(params, typeParamNames, depth) {
    if (params) for (const param of params) {
      if (hasParamTypeRef(param, typeParamNames, depth)) return true;
    }
    return false;
  }

  // check whether a type annotation AST node references any type parameter from the given set
  function hasTypeParamReference(node, typeParamNames, depth) {
    while (true) {
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
        case 'TSNamedTupleMember':
          node = node.elementType;
          depth += 1;
          continue;
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
          // no `TSNamedTupleMember` peel here - the recursion re-enters this switch, whose own
          // named-member case performs it
          for (const element of tupleElements(node) ?? []) {
            if (hasTypeParamReference(element, typeParamNames, depth + 1)) return true;
          }
          return false;
        case 'TSConditionalType':
          return hasTypeParamReference(node.checkType, typeParamNames, depth + 1)
            || hasTypeParamReference(node.extendsType, typeParamNames, depth + 1)
            || hasTypeParamReference(node.trueType, typeParamNames, depth + 1)
            || hasTypeParamReference(node.falseType, typeParamNames, depth + 1);
        case 'TSIndexedAccessType':
          return hasTypeParamReference(node.objectType, typeParamNames, depth + 1)
            || hasTypeParamReference(node.indexType, typeParamNames, depth + 1);
        case 'TSTypeOperator':
        case 'TSRestType':
        case 'TSOptionalType':
        case 'TSParenthesizedType':
        case 'NullableTypeAnnotation':
          node = node.typeAnnotation;
          depth += 1;
          continue;
        case 'TSTypeLiteral':
          for (const member of node.members) {
            if (hasTypeParamReference(member.typeAnnotation, typeParamNames, depth + 1)) return true;
            if (hasTypeParamReference(member.returnType, typeParamNames, depth + 1)) return true;
            // method signatures carry params (`{ foo(x: T): U }`); a T in param must propagate
            // so call-site subst captures it. babel@8 renamed the slot `parameters`->`params`
            // (oxc/babel@7 use `parameters`); property signatures have neither, skipped
            const memberParams = member.params ?? member.parameters;
            if (hasAnyParamTypeRef(memberParams, typeParamNames, depth + 1)) return true;
          }
          return false;
        case 'TSFunctionType':
        case 'TSConstructorType':
        case 'FunctionTypeAnnotation':
          // function-type params (`(x: T) => U`) - T in param slot or `...rest: T[]` must
          // count as referenced so outer-fn subst captures it. each param's annotation is
          // walked (RestElement carries it via `.argument.typeAnnotation` on babel; oxc
          // hoists to top-level - `hasParamTypeRef` handles both shapes)
          {
            // babel@8 renamed the slot `parameters` -> `params`; oxc/babel@7 use `parameters`
            const fnParams = functionTypeParams(node);
            if (hasAnyParamTypeRef(fnParams, typeParamNames, depth + 1)) return true;
          }
          node = node.returnType ?? node.typeAnnotation;
          depth += 1;
          continue;
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
  }

  // extract inner type parameter name from a container annotation: T[] -> T, Array<T> -> T, Set<T> -> T, Promise<T> -> T, etc.
  function innerTypeParamName(annotation, refName) {
    // T[] syntax
    if (annotation.type === 'TSArrayType' || annotation.type === 'ArrayTypeAnnotation') {
      return typeRefName(annotation.elementType);
    }
    // A homogeneous tuple also infers its single parameter from the argument's element type.
    const elements = annotation.type === 'TSTupleType' || annotation.type === 'TupleTypeAnnotation' ? tupleElements(annotation) : null;
    if (elements?.length) {
      const names = elements.map(element => {
        const member = unwrapTupleMember(element);
        return typeRefName(isTupleRestElement(element) ? member.elementType ?? getTypeArgs(member)?.params?.[0] : member);
      });
      return names.every(name => name === names[0]) ? names[0] : null;
    }
    // Container<T>: Set<T>, Promise<T>, Iterator<T>, Array<T>, ReadonlyArray<T>, etc.
    if (refName && firstTypeParamIsInner(refName)) {
      const typeArgs = getTypeArgs(annotation)?.params;
      if (typeArgs?.length >= 1) return typeRefName(typeArgs[0]);
    }
    return null;
  }

  // Map<string, Type> of type parameter bindings inferred from call-site arguments
  function buildTypeParamMap(paramsByName, fnPath, callPath) {
    const typeParamMap = new Map();
    const argPaths = new Map();
    typeParamArgPaths.set(typeParamMap, argPaths);
    function bind(name, resolved, arg) {
      if (!name || !paramsByName.has(name)) return;
      if (typeParamMap.has(name)) {
        // The result can come from either argument. A property or tuple-slot projection
        // cannot use just the first path, even when both values have the same family.
        const previous = typeParamMap.get(name);
        typeParamMap.set(name, previous && resolved ? commonType(previous, resolved) : null);
        argPaths.delete(name);
      } else {
        typeParamMap.set(name, resolved);
        if (arg?.node && arg.node.type !== 'SpreadElement') argPaths.set(name, arg);
      }
    }
    const { supplied, uncertain } = visitInferenceArguments(fnPath.node, callPath, (annotation, arg, isRest, possible) => {
      const arms = isUnionType(annotation) ? annotation.types.filter(arm => !isNullableOrNeverAnnotation(arm)) : null;
      const direct = arms?.length === 1 ? arms[0] : annotation;
      const name = typeRefName(direct);
      const innerName = innerTypeParamName(direct, name);
      if (isRest) {
        if (!paramsByName.has(innerName)) return false;
        bind(innerName, resolveCallArgType(arg));
      } else if (paramsByName.has(name)) {
        const declared = paramsByName.get(name);
        const literal = inferredLiteralAnnotation(declared, arg, fnPath.scope);
        bind(name, literal ? resolveTypeAnnotation(literal, callPath.scope) : arg ? resolveCallArgType(arg) : possible, arg);
      } else if (paramsByName.has(innerName)) {
        bind(innerName, resolveInnerType(arg?.node ? resolveNodeType(arg) : possible));
      } else return false;
      return true;
    });
    // A supplied argument may mention a parameter inside a nested annotation. If inference
    // could not bind it, its declaration default cannot stand in for the runtime argument.
    for (const name of paramsByName.keys()) {
      const slots = typeParamMap.has(name) ? uncertain : supplied;
      if (slots.length === 0) continue;
      const singleName = new Set([name]);
      if (slots.some(slot => hasParamTypeRef(effectiveParam(slot).param, singleName, 0))) {
        typeParamMap.set(name, null);
        argPaths.delete(name);
      }
    }
    // phase 2: default / constraint fallback for unresolved type params (TS binds to `default`
    // when call-site omits a type arg; constraint is only the upper bound, usually over-broad).
    // route through `substituteTypeParams` (not bare `resolveTypeAnnotation`) so a default that
    // references an earlier type param picks up the already-resolved binding, e.g.
    // `function f<T = string, U = T>(t: T): U` called as `f<number[]>(...)` resolves U to
    // number[] (T's user-supplied value) instead of T.default=string. order matters: phase 1
    // populates T from the explicit arg before phase 2 fills U. a consulted default binds
    // even on failure (an opaque dependency): the null binding blocks the type-param-
    // declaration fallback from re-deriving the SAME default downstream
    for (const typeParam of fnPath.node.typeParameters.params) {
      const name = typeParamName(typeParam);
      if (!name || typeParamMap.has(name)) continue;
      const annotation = typeParam.default ?? typeParam.constraint;
      if (annotation) {
        typeParamMap.set(name, substituteTypeParams(annotation, typeParamMap, fnPath.scope, 0) ?? null);
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
  // generator returns, declared returns and calls through an indexed method signature
  function applyCallSiteSubst(annotationNode, fnPath, callPath) {
    const typeParams = fnPath.node.typeParameters?.params;
    if (!typeParams?.length) return null;
    const paramsByName = new Map();
    for (const p of typeParams) paramsByName.set(typeParamName(p), p);
    if (!hasTypeParamReference(annotationNode, paramsByName, 0)) return null;
    if (getCallSiteTypeArgs(callPath.node)?.params?.length) {
      // Keep the spelled type tree: a mixed union may have no single family until Extract
      // or an indexed access projects it. Value arguments cannot replace an explicit type.
      const subst = buildCallSiteSubst(fnPath.node, callPath.node, callPath.scope);
      const instantiated = classSubstInner(annotationNode, subst);
      return withTypeReferenceScope(instantiated, fnPath.scope, at => resolveTypeAnnotation(instantiated, at));
    }
    const typeParamMap = buildTypeParamMap(paramsByName, fnPath, callPath);
    if (typeParamMap.size === 0) return null;
    return substituteTypeParams(annotationNode, typeParamMap, fnPath.scope, 0);
  }

  // A supplied, definitely defined argument skips its default, including writes to an earlier parameter.
  function parameterUnchangedAtCall(binding, fnPath, callPath) {
    if (binding.constant) return true;
    if (!callPath || !binding.constantViolations?.length) return false;
    const args = callArgumentPaths(callPath);
    const params = fnPath.get('params');
    return binding.constantViolations.every(write => {
      const index = parameterIndexAt(write, fnPath);
      const param = params[index];
      if (param?.node.type !== 'AssignmentPattern' || !pathIsInside(write, param.get('right'))) return false;
      const arg = positionalPathAt(args, argIndexForParam(fnPath.node.params, index), isMutatedStatic);
      return arg && argumentSkipsDefault(arg);
    });
  }

  // Resolve a function return, inferring generics from call arguments. A virtual receiver
  // uses declaredOnly: an unresolved declared return cannot be replaced by the base body.
  function resolveReturnType(fnPath, callPath, classSubst, depth = 0, declaredOnly = false) {
    // A method's own type parameters bind at the call even inside Generator<T>; the
    // surrounding class can substitute only names that the method did not redeclare.
    const methodTypeParams = fnPath.node.typeParameters;
    const outer = dropTypeParamSubst(methodTypeParams, classSubst);
    if (fnPath.node.generator) {
      const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
      let element = params?.[0];
      if (!fnPath.node.returnType && !fnPath.node.async && !declaredOnly && fnPath.node.body?.body?.length === 1) {
        // A single direct yield can use the declared type of an unchanged parameter.
        // Delegation and async yielding can change the value that the consumer receives.
        const [statement] = fnPath.node.body.body;
        const yielded = statement.type === 'ExpressionStatement' && statement.expression;
        if (yielded?.type === 'YieldExpression' && !yielded.delegate && yielded.argument?.type === 'Identifier') {
          const { name } = yielded.argument;
          const binding = getScopeBinding({ scope: fnPath.scope, name, path: fnPath });
          const parameter = binding && findBindingParam(binding, fnPath)?.param;
          if (parameter?.type === 'Identifier' && parameterUnchangedAtCall(binding, fnPath, callPath)) {
            element = unwrapTypeAnnotation(parameter.typeAnnotation);
          }
        }
      }
      const yieldType = classSubstInner(element, outer);
      const inferred = yieldType && callPath && applyCallSiteSubst(yieldType, fnPath, callPath);
      const declared = classSubstInner(element, shadowMethodTypeParams(methodTypeParams, classSubst));
      const inner = inferred || (declared && resolveTypeAnnotation(declared, fnPath.scope, depth + 1));
      return elementContainerType(new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator'), yieldType, inner);
    }
    const callSiteInner = classSubstInner(fnPath.node.returnType, outer);
    const isAsync = fnPath.node.async;
    // async normalization: wrap non-Promise results, fall back to bare Promise on null
    function wrap(type) { return wrapAsyncPromise(type, isAsync); }
    const asyncFallback = isAsync ? new $Object('Promise') : null;
    // infer generic type parameters and substitute into return type
    if (callSiteInner && callPath) {
      const substituted = applyCallSiteSubst(callSiteInner, fnPath, callPath);
      if (substituted) return wrap(substituted);
    }
    // no call-site binding (no call / unresolvable args): remap the method's own `<T>` to `unknown` so a bare
    // T doesn't re-bind to the class's concrete type-arg via scope lookup. non-generic methods are unaffected
    // (drop / shadow are identity when the signature declares no own type-params, so this matches the old path)
    const returnInner = classSubstInner(fnPath.node.returnType, shadowMethodTypeParams(methodTypeParams, classSubst));
    if (returnInner) {
      const resolved = resolveTypeAnnotation(returnInner, fnPath.scope, depth + 1);
      if (resolved) return wrap(resolved);
      // structural shape - body inference would clobber the declared annotation with a
      // scalar Type. bail so callers route through `findExpressionAnnotation` which
      // preserves the structural shape for member lookups. see isStructuralAnnotation
      // A class-typed receiver can dispatch to an override: its declared return stays authoritative.
      if (declaredOnly || isStructuralAnnotation(returnInner)) return asyncFallback;
    }
    // a return REFERENCING a method type-param the call-site couldn't bind (`T`, `T | null`, `T | string`, ...)
    // OR a CLASS-level type-param whose instantiation arg the resolver couldn't type (the class
    // subst spliced the arg node, but its resolution failed above) is generic - T is opaque.
    // the body fold would CLOBBER the declared-but-opaque annotation with a stub return's
    // concrete type: `return null as any` -> a null-primitive receiver that suppresses
    // injection entirely, `return [] as any` -> an array-specific Maybe on a foreign
    // runtime receiver (an ie:11 throw). stay generic. (`T[]` / `Promise<T>` already
    // resolved above to a concrete container, so a STILL-unresolved return here means the
    // param leaked through unbound)
    const opaqueReturnParamNames = new Set((methodTypeParams?.params ?? []).map(typeParamName));
    for (const name of classSubst?.keys() ?? []) opaqueReturnParamNames.add(name);
    const returnAnno = unwrapTypeAnnotation(fnPath.node.returnType);
    if (opaqueReturnParamNames.size && returnAnno && hasTypeParamReference(returnAnno, opaqueReturnParamNames, 0)) {
      return asyncFallback;
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
    applyCallSiteSubst,
    resolveReturnType,
    resolveReturnUnionHints,
    resolveBodyReturnType,
    collectReturnPaths,
    getTypeParamArgPath,
    hasParamTypeRef,
    reset,
  };
}
