// babel-specific AST primitives + optional-chain handling. covers ref memoization,
// optional-chain deoptionalization, instance-method replacement strategies, TS-wrapper
// peeling. destructure emission moved out to `internals/destructure-emitter.js`.
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage';
import {
  createTypeAnnotationChecker,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers';

export default function (t, { getInjector, typeResolvers } = {}) {
  const { resolveNodeType, toHint } = typeResolvers ?? {};

  const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

  function reset() {
    isInTypeAnnotation.reset();
  }

  // identifiers and `this` are safe to double-evaluate. TS wrappers are deliberately NOT
  // peeled here - keeping them in the check keeps babel's `_ref` emission in sync with
  // unplugin's source-text regex, especially inside optional chains
  const isSafeToReuse = node => t.isIdentifier(node) || t.isThisExpression(node);

  const generateRef = scope => getInjector().generateDeclaredRef(scope);
  const generateLocalRef = scope => getInjector().generateLocalRef(scope);
  const generateUnusedId = () => t.identifier(getInjector().generateUnusedName());

  function memoize(node, scope) {
    if (isSafeToReuse(node)) return [t.cloneNode(node), t.cloneNode(node)];
    const ref = generateRef(scope);
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  // resolve the expression's type hint - no-op when the factory was constructed without
  // typeResolvers (tooling that uses this module for raw AST rewrite only). `null` on
  // unresolvable types, cheaper on repeat calls thanks to resolveCache
  function pathTypeHint(p) {
    return resolveNodeType && toHint ? toHint(resolveNodeType(p)) : null;
  }

  // tokens that are safe as a statement-leading token (no ASI hazard with the previous statement)
  const isLeadingIdentLike = node => t.isIdentifier(node) || t.isThisExpression(node) || t.isSuper(node);

  function wrapConditional(check, result) {
    // place `null` first when `check` doesn't start with an identifier-like token (typically
    // an AssignmentExpression `(_ref = X)`). This guarantees ASI safety when the replacement
    // is embedded in raw source and matches the unplugin output. For identifier-like tokens
    // there is no ASI hazard, so keep the more readable `x == null` form
    const NULL = t.nullLiteral();
    const test = isLeadingIdentLike(check)
      ? t.binaryExpression('==', check, NULL)
      : t.binaryExpression('==', NULL, check);
    return t.conditionalExpression(test, t.unaryExpression('void', t.numericLiteral(0)), result);
  }

  function buildMethodCall(id, object, scope, args, optionalCall) {
    const [assign, ref] = memoize(object, scope);
    // clone args: originals may belong to a parent being replaced (stale Babel path containers)
    const callArgs = [t.cloneNode(ref), ...args.map(a => t.cloneNode(a))];
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, callArgs, false)
      : t.callExpression(callMember, callArgs);
  }

  function deoptionalizeNode(path) {
    const type = path.isOptionalMemberExpression() ? 'MemberExpression' : 'CallExpression';
    path.node.type = type;
    path.type = type;
    delete path.node.optional;
  }

  // strip Optional{Member,Call}Expression wrappers above a replaced node
  // stripFirstOptional: also deoptionalize the first user-written ?. in the chain
  // (used when the replacement is always defined, e.g., polyfill imports)
  // is `child` the operand slot (object/callee) of an optional expression,
  // possibly through TS wrappers?
  function isOptionalOperand(child, parent) {
    const slot = parent.isOptionalMemberExpression() ? 'object'
      : parent.isOptionalCallExpression() ? 'callee' : null;
    if (!slot) return false;
    let cur = parent.node[slot];
    while (cur && TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
    return cur === child.node;
  }

  function normalizeOptionalChain(path, stripFirstOptional) {
    let { parentPath } = path;
    // walk past TS wrappers (satisfies, as, !) between the replaced node and the optional chain
    while (parentPath && TS_EXPR_WRAPPERS.has(parentPath.node?.type)) ({ parentPath } = parentPath);
    if (!parentPath || !isOptionalOperand(path, parentPath)) return null;
    let topPath = null;
    let seenOptional = false;
    const isOptional = p => p.isOptionalMemberExpression() || p.isOptionalCallExpression();
    // eslint-disable-next-line no-unmodified-loop-condition -- safe
    while (isOptional(parentPath) && (!parentPath.node.optional || stripFirstOptional && !seenOptional)) {
      if (parentPath.node.optional) seenOptional = true;
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      ({ parentPath } = parentPath);
    }
    return topPath;
  }

  function extractCheck(path, skipOptional) {
    const { node } = path;
    if (node.optional) {
      if (skipOptional?.(node, path.scope)) return [null, node.object];
      return memoize(node.object, path.scope);
    }
    if (!path.isOptionalMemberExpression()) return [null, node.object];
    let chainStart = null;
    let current = path.get('object');
    // skip TS wrappers (as, satisfies, !) that sit between the member and the inner chain
    const throughTS = current.node && TS_EXPR_WRAPPERS.has(current.node.type);
    while (current.node && TS_EXPR_WRAPPERS.has(current.node.type)) current = current.get('expression');
    while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      current = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
    }
    if (!chainStart) return [null, node.object];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`).
    // reassigning `chainStart.node[key]` swaps the receiver / callee with the memoized ref —
    // computed property nodes (`.property`) and call arguments (`.arguments`) on the same chainStart
    // remain untouched, so computed-property bootstrapping isn't disturbed
    let check = null;
    if (!skipOptional?.(chainStart.node, path.scope)) {
      const memoHint = pathTypeHint(chainStart.get(key));
      let ref;
      [check, ref] = memoize(chainStart.node[key], path.scope);
      // stash the memoized value's type hint on the AST-embedded clone so the synthesized
      // `_ref` identifier (replacing chainStart's receiver/callee) resolves back to the
      // memoized value's type via the universal `coreJSResolvedType` short-circuit in
      // resolveNodeType. without this, `?.at` (optional chain trigger) loses its receiver's
      // hint once extractCheck rewrites M2.object to the ref: `resolveBindingType` can't
      // recover it because the generated `_ref` identifier has no source-start position,
      // so `findLastStraightLineAssignment` bails on the ordering check and enhanceMeta
      // falls through to the generic `common` variant instead of the `array` variant
      const refClone = t.cloneNode(ref);
      if (memoHint) refClone.coreJSResolvedType = memoHint;
      chainStart.node[key] = refClone;
    }
    deoptionalizeNode(chainStart);
    // `p && p !== path` guard: on orphaned paths parentPath chain can bottom out at null
    // before reaching `path`, which would infinite-loop the original `p !== path` test
    for (let p = chainStart.parentPath; p && p !== path; p = p.parentPath) {
      if (p.isOptionalMemberExpression() || p.isOptionalCallExpression()) deoptionalizeNode(p);
    }
    return [check, node.object, throughTS];
  }

  function replaceAndWrap(replacePath, result, check, embedGuard) {
    // when check came through a TS wrapper (arr?.at(-1)!.includes), embed the guard
    // directly - Babel's path references become stale after replaceWith and the two-step
    // replace-then-wrap approach loses the guard. for normal chains (no TS wrapper),
    // use the two-step approach so normalizeOptionalChain correctly lifts the guard
    // past chain continuations like .valueOf()
    if (embedGuard) {
      replacePath.replaceWith(wrapConditional(check, result));
      normalizeOptionalChain(replacePath);
    } else {
      replacePath.replaceWith(result);
      const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
      if (check) wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
    }
  }

  // walk past TS expression wrappers between a member expression and its enclosing call -
  // needed when @babel/plugin-transform-typescript runs after us so `arr.includes!(1)` is
  // not misclassified as non-call (which would emit `_includes(arr)` with broken `this`)
  function unwrapTSExpressionParent(path) {
    let current = path;
    while (current.parentPath && TS_EXPR_WRAPPERS.has(current.parentPath.node?.type)) {
      current = current.parentPath;
    }
    return current;
  }

  // wrap a result expression in a SequenceExpression preserving side effects collected
  // from the receiver / computed-key. noop when sideEffects is empty - callers can pass
  // unconditionally. mirrors babel-plugin/index.js `withSideEffects` (kept here to avoid
  // a back-edge import; same one-line shape)
  function withSideEffects(result, sideEffects) {
    return sideEffects?.length
      ? t.sequenceExpression([...sideEffects.map(e => t.cloneNode(e)), result])
      : result;
  }

  function replaceInstanceLike(path, id, skipOptional, sideEffects) {
    // (arr?.includes)(1) - parenthesized optional callee breaks the chain.
    // replace only the member expression, keep the original call site.
    // only for optional chains - non-optional (arr.includes)(1) at runtime is
    // `arr.includes.call(undefined, 1)` (detached `this`), which polyfill emission would
    // "fix" to `_includes.call(arr, 1)` with `this=arr`. changing a broken-runtime case
    // to a working one silently is design-dilemma: conservative path preserves the non-
    // optional shape verbatim, users who rely on the parenthesized detach get a lint
    if ((path.node.extra?.parenthesized || unwrapTSExpressionParent(path).node.extra?.parenthesized)
      && path.isOptionalMemberExpression()) {
      const [check, object, embed] = extractCheck(path, skipOptional);
      const lookup = t.callExpression(id, [t.cloneNode(object)]);
      replaceAndWrap(path, withSideEffects(lookup, sideEffects), check, embed);
      return;
    }
    const callerPath = unwrapTSExpressionParent(path);
    const { parent } = callerPath;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent))
      && parent.callee === callerPath.node;
    const [check, object, embed] = extractCheck(path, skipOptional);
    const result = isCall
      ? buildMethodCall(id, object, path.scope, parent.arguments, parent.optional)
      : t.callExpression(id, [t.cloneNode(object)]);
    replaceAndWrap(isCall ? callerPath.parentPath : path, withSideEffects(result, sideEffects), check, embed);
  }

  function replaceCallWithSimple(path, id, skipOptional) {
    const [check, object, embed] = extractCheck(path, skipOptional);
    // peel TS wrappers so the call (and not its `as X` / `!` envelope) is what we replace
    const callerPath = unwrapTSExpressionParent(path);
    replaceAndWrap(callerPath.parentPath, t.callExpression(id, [t.cloneNode(object)]), check, embed);
  }

  // Babel-style OR-chain for `(recv)?.inner?.(ia).outer(oa)`: runs outer directly on
  // `_m.call(_a, ia)` so value-undef (e.g. `[].at(99)`) reaches `_outer()` and throws
  // like native, while each `?.` contributes its own `null == ...` test.
  // caller (findInnerPolyChain) guarantees outer is a call expression.
  // unplugin duplicates this as a text-level rewrite (see plugin.js `replaceInstanceChainCombined`);
  // unification blocked by AST vs text emission asymmetry - the output shape must match bit-for-bit
  function replaceInstanceChainCombined(outerPath, outerId, { innerCallee, innerArgs, innerId }) {
    const callerPath = unwrapTSExpressionParent(outerPath);
    const outerCall = callerPath.parent;
    const { scope } = outerPath;
    const nullTest = expr => t.binaryExpression('==', t.nullLiteral(), expr);
    const assign = (ref, value) => t.assignmentExpression('=', t.cloneNode(ref), value);

    const [anAssign, aRef] = memoize(innerCallee.object, scope);
    const mRef = generateRef(scope);
    const mCall = t.callExpression(
      t.memberExpression(t.cloneNode(mRef), t.identifier('call')),
      [t.cloneNode(aRef), ...innerArgs.map(a => t.cloneNode(a))]);

    const tests = [nullTest(anAssign),
      nullTest(assign(mRef, t.callExpression(t.cloneNode(innerId), [t.cloneNode(aRef)])))];
    let outerObject = mCall;
    // `?.method` as outer: nullish inner result must short-circuit the outer call too
    if (outerPath.node.optional) {
      const vRef = generateRef(scope);
      tests.push(nullTest(assign(vRef, mCall)));
      outerObject = t.cloneNode(vRef);
    }
    const testOr = tests.reduce((a, b) => t.logicalExpression('||', a, b));

    const replacement = buildMethodCall(outerId, outerObject, scope, outerCall.arguments, outerCall.optional);
    const conditional = t.conditionalExpression(testOr,
      t.unaryExpression('void', t.numericLiteral(0)), replacement);
    // chained outer calls read the hint off the result node; relocate the pre-combine
    // `annotateCallReturnType` stamp onto the wrapping conditional so they still resolve
    if (outerCall.coreJSResolvedType) conditional.coreJSResolvedType = outerCall.coreJSResolvedType;
    callerPath.parentPath.replaceWith(conditional);
  }

  return {
    isInTypeAnnotation,
    deoptionalizeNode,
    generateRef,
    generateLocalRef,
    generateUnusedId,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    unwrapTSExpressionParent,
    withSideEffects,
    reset,
  };
}
