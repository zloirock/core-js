// babel-specific AST primitives + optional-chain handling. covers ref memoization,
// optional-chain deoptionalization, instance-method replacement strategies, TS-wrapper
// peeling. destructure emission moved out to `internals/destructure-emitter.js`.
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import { classifyReceiverSE, keySideEffectsOnly, peelReceiverSequenceTail } from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  createTypeAnnotationChecker,
  isReusableReceiver,
  mayHaveSideEffects,
  SKIPPABLE_WRAPPER_TYPES,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';

export default function (t, { getInjector, typeResolvers } = {}) {
  const { resolveNodeType, resolvedType } = typeResolvers ?? {};

  const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

  function reset() {
    isInTypeAnnotation.reset();
  }

  // useNode (optional) - the source node at the use site, so generateDeclaredRef can place a
  // loop-header memo `var` before the loop (not inside a block-converted bodyless body)
  function generateRef(scope, useNode) {
    return getInjector().generateDeclaredRef(scope, useNode);
  }

  function generateLocalRef(scope) {
    return getInjector().generateLocalRef(scope);
  }

  function generateUnusedId() {
    return t.identifier(getInjector().generateUnusedName());
  }

  // `anchorNode` - a RANGE-BEARING node at the use site for `var _ref` placement. defaults
  // to `node`, but callers memoizing a CLONE or a synthesized subtree (optional-method-call
  // methodNode, combined-chain spliced receivers) must pass the live source node instead: a
  // range-less useNode fails the param/loop-header escape check and strands the `var` in the
  // function body, unreachable from a parameter-default use (ReferenceError at call time for
  // a TS parameter-property default)
  function memoize(node, scope, anchorNode = node) {
    if (isReusableReceiver(node)) return [t.cloneNode(node), t.cloneNode(node)];
    const ref = generateRef(scope, anchorNode);
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  // resolve the expression's Type object - no-op when the factory was constructed without
  // typeResolvers (tooling that uses this module for raw AST rewrite only). `null` on
  // unresolvable types, cheaper on repeat calls thanks to resolveCache. Type cached in
  // the typeResolvers' WeakMap (via `cacheResolvedType`) - canonical constructor form is
  // preserved for downstream `KNOWN_*_RETURN_TYPES` lookups, no AST-property pollution
  function pathType(p) {
    return resolveNodeType ? resolveNodeType(p) : null;
  }

  // tokens that are safe as a statement-leading token (no ASI hazard with the previous statement)
  function isLeadingIdentLike(node) {
    return t.isIdentifier(node) || t.isThisExpression(node) || t.isSuper(node);
  }

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

  function buildMethodCall({ id, object, scope, args, optionalCall, anchorNode }) {
    const [assign, ref] = memoize(object, scope, anchorNode ?? object);
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
  // possibly through TS wrappers OR explicit ParenthesizedExpression?
  // default babel parser strips parens (records via `extra.parenthesized`); under
  // `parserOpts.createParenthesizedExpressions: true` parens become real AST nodes
  // and would block the match without an explicit peel
  function isOptionalOperand(child, parent) {
    const slot = parent.isOptionalMemberExpression() ? 'object'
      : parent.isOptionalCallExpression() ? 'callee' : null;
    if (!slot) return false;
    let cur = parent.node[slot];
    while (cur && TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type)) {
      cur = cur.expression;
    }
    return cur === child.node;
  }

  function normalizeOptionalChain(path, stripFirstOptional) {
    let { parentPath } = path;
    // walk past TS / Paren / Chain wrappers between the replaced node and the optional
    // chain. without these peels, `(arr.includes)?.(1)` / ESTree-wrapped chains wouldn't
    // deopt. symmetric with `peelTransparentChildPath` (extractCheck's child-walk)
    while (parentPath && SKIPPABLE_WRAPPER_TYPES.has(parentPath.node?.type)) {
      ({ parentPath } = parentPath);
    }
    if (!parentPath || !isOptionalOperand(path, parentPath)) return null;
    let topPath = null;
    let seenOptional = false;
    function isOptional(p) {
      return p.isOptionalMemberExpression() || p.isOptionalCallExpression();
    }
    // eslint-disable-next-line no-unmodified-loop-condition -- safe
    while (isOptional(parentPath) && (!parentPath.node.optional || stripFirstOptional && !seenOptional)) {
      if (parentPath.node.optional) seenOptional = true;
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      ({ parentPath } = parentPath);
    }
    // trailing optional CALL whose callee is the just-deoptionalized member (`x.includes?.(2)`):
    // enclose it in the wrap WITHOUT deoptionalizing (the `?.()` genuinely guards `.includes`).
    // otherwise wrapping at `.includes` lifts it into the conditional and strands the `?.()`
    // with `this === undefined` (`(c ? void 0 : (...).includes)?.(2)` throws where native works)
    if (topPath && parentPath?.isOptionalCallExpression() && parentPath.node.optional
      && isOptionalOperand(topPath, parentPath)) {
      topPath = parentPath;
    }
    return topPath;
  }

  // peel transparent wrappers (TS / Paren / Chain) from an immediate child path.
  // returns the peeled path; callers that need the boolean "did we peel anything" can
  // compare against the original. extracted so the chain-descent loop can re-peel at
  // every hop (TS `!` mid-chain between optional links would otherwise abort detection)
  function peelTransparentChildPath(p) {
    let cur = p;
    while (cur.node && SKIPPABLE_WRAPPER_TYPES.has(cur.node.type)) {
      cur = cur.get('expression');
    }
    return cur;
  }

  // optional method call (`recv.m?.()`): the callee is a member, so memoizing it into `_ref` and
  // rebinding the call to `_ref()` would invoke with `this === undefined` and break the receiver
  // binding. instead null-guard the method but keep the receiver: rewrite chainStart's call to
  // `_ref.call(recv)` and return the guard `check`. recv is bound to `this` for `super` (the call
  // arg cannot be `super`), re-read for a safe Identifier/this receiver, and memoized first when
  // side-effecting so it evaluates once. transparent wrappers (TS as/!/satisfies, parens, chain)
  // are peeled so `(obj.m as any)?.()` still counts as a method call - memoizing the peeled member
  // drops the type-only wrapper. returns null when chainStart's callee isn't a method member (a
  // free function `fn?.()` or a receiver-key chainStart), leaving the caller's plain-memo path
  function rewriteOptionalMethodCall(chainStart, key, scope, memoType) {
    const calleePath = key === 'callee' ? peelTransparentChildPath(chainStart.get(key)) : null;
    if (!calleePath || (!calleePath.isMemberExpression() && !calleePath.isOptionalMemberExpression())) return null;
    const receiverNode = calleePath.node.object;
    const methodNode = t.cloneNode(calleePath.node);
    let callReceiver;
    let receiverMemo = null;
    if (t.isSuper(receiverNode)) {
      callReceiver = t.thisExpression();
    } else if (isReusableReceiver(receiverNode)) {
      callReceiver = t.cloneNode(receiverNode);
    } else {
      const [assign, receiverRef] = memoize(receiverNode, scope, chainStart.node);
      receiverMemo = assign;
      callReceiver = t.cloneNode(receiverRef);
      // rebind the method's receiver to the memoized ref so it (and any inner `?.`) evaluates once
      methodNode.object = t.cloneNode(receiverRef);
    }
    const [methodMemo, methodRef] = memoize(methodNode, scope, chainStart.node);
    if (memoType) resolvedType?.set(t.cloneNode(methodRef), memoType);
    chainStart.node.callee = t.memberExpression(t.cloneNode(methodRef), t.identifier('call'));
    chainStart.node.arguments = [callReceiver, ...chainStart.node.arguments.map(arg => t.cloneNode(arg))];
    // when recv is memoized, fold its assignment ahead of the method memo so it runs first
    return receiverMemo ? t.sequenceExpression([receiverMemo, methodMemo]) : methodMemo;
  }

  function extractCheck(path, skipOptional) {
    const { node } = path;
    if (node.optional) {
      // pass `path` as third arg so `skipPolyfillableOptional` can anchor TS-runtime
      // shadow detection at the reference site (path-aware `adapter.hasBinding`)
      if (skipOptional?.(node, path.scope, path)) return [null, node.object, false];
      const [memoCheck, memoRef] = memoize(node.object, path.scope, node);
      return [memoCheck, memoRef, false];
    }
    if (!path.isOptionalMemberExpression()) return [null, node.object, false];
    let chainStart = null;
    // symmetric with `normalizeOptionalChain`'s parent-walk above. `throughTS` flag tracks
    // whether the INITIAL receiver was wrapped - signals `replaceAndWrap` to embed the
    // guard directly (path references would otherwise go stale on the two-step replace)
    let current = path.get('object');
    const throughTS = current.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(current.node.type);
    current = peelTransparentChildPath(current);
    while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      const next = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
      // re-peel transparent wrappers at every hop. mid-chain `!` (TSNonNullExpression)
      // between optional links (`arr?.b!.c.d.includes(2)`) would otherwise abort the
      // chain detection, emit without the null-check guard, and throw TypeError on null
      // arr where native short-circuits the entire chain to undefined
      current = peelTransparentChildPath(next);
    }
    if (!chainStart) return [null, node.object, throughTS];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`).
    // reassigning `chainStart.node[key]` swaps the receiver / callee with the memoized ref -
    // computed property nodes (`.property`) and call arguments (`.arguments`) on the same chainStart
    // remain untouched, so computed-property bootstrapping isn't disturbed
    let check = null;
    if (!skipOptional?.(chainStart.node, path.scope, chainStart)) {
      const memoType = pathType(chainStart.get(key));
      check = rewriteOptionalMethodCall(chainStart, key, path.scope, memoType);
      if (check === null) {
        let ref;
        [check, ref] = memoize(chainStart.node[key], path.scope, chainStart.node);
        // cache the memoized value's Type keyed on the cloned `_ref` so the synthesized ref
        // (replacing chainStart's receiver/callee) resolves back to the memoized value's type via
        // `resolveNodeType`'s WeakMap short-circuit - the generated `_ref` has no source position,
        // so without this the receiver's type is lost and enhanceMeta falls to the generic variant.
        // `resolvedType` may be undefined when wired without typeResolvers (raw AST-rewrite tooling)
        const refClone = t.cloneNode(ref);
        if (memoType) resolvedType?.set(refClone, memoType);
        chainStart.node[key] = refClone;
      }
    }
    deoptionalizeNode(chainStart);
    // `p && p !== path` guard: on orphaned paths parentPath chain can bottom out at null
    // before reaching `path`, which would infinite-loop the original `p !== path` test
    for (let p = chainStart.parentPath; p && p !== path; p = p.parentPath) {
      if (p.isOptionalMemberExpression() || p.isOptionalCallExpression()) deoptionalizeNode(p);
    }
    return [check, node.object, throughTS];
  }

  function replaceAndWrap({ replacePath, result, check, embedGuard }) {
    // when check came through a TS wrapper (arr?.at(-1)!.includes), embed the guard
    // directly - Babel's path references become stale after replaceWith and the two-step
    // replace-then-wrap approach loses the guard. for normal chains (no TS wrapper),
    // use the two-step approach so normalizeOptionalChain correctly lifts the guard
    // past chain continuations like .valueOf(). `embedGuard` may pair with `check=null`
    // when `extractCheck` peeled a TS wrapper but `skipOptional` skipped the chainStart
    // (no memoize, no check) - emit plain `result` to avoid `wrapConditional(null,...)`
    // synthesising an invalid `null == null` BinaryExpression
    if (embedGuard) {
      replacePath.replaceWith(check ? wrapConditional(check, result) : result);
      normalizeOptionalChain(replacePath);
    } else {
      replacePath.replaceWith(result);
      // a replacement that introduced its OWN optional (`_X(recv)?.call(recv)` from an `arr.flat?.()`
      // optional CALL, with no receiver-level guard) leaves a trailing chain continuation
      // (`...?.().next()` / `...?.().length`) as an in-chain OptionalMember/Call straight from the
      // parse - it must STAY optional to short-circuit with the new `?.`. normalizeOptionalChain
      // would deoptionalize the trailing to a PLAIN member, and babel codegen then parenthesizes the
      // optional result off it (`(_X?.call(recv)).next()`), severing the trailing from the chain so
      // it throws on the short-circuit path where native yields void 0 (matches unplugin once skipped)
      if (!check && result.type === 'OptionalCallExpression') {
        // an OptionalCallExpression standing in NewExpression.callee (`new (arr.flat?.())(z)`)
        // mis-prints without parens under babel codegen: `new _X(arr)?.call(arr)(z)` round-trips
        // to CONSTRUCT the helper instead of calling it. force the grouping so `new` applies to
        // the call's result (oxc/unplugin preserves the source parens, so this is babel-only)
        if (replacePath.parentPath?.isNewExpression()
          && replacePath.parentPath.node.callee === replacePath.node) {
          replacePath.replaceWith(t.parenthesizedExpression(replacePath.node));
        }
        return;
      }
      const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
      if (check) wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
    }
  }

  // walk past transparent runtime wrappers between a member expression and its enclosing
  // call. covers TS expression wrappers (`as`, `satisfies`, `!`, ...) needed when
  // @babel/plugin-transform-typescript runs after us, AND `ParenthesizedExpression`
  // preserved by parser when `createParenthesizedExpressions: true` - without parens-peeling
  // `(arr.includes)(1)` resolves callerPath.parent to ParenthesizedExpression instead of
  // the outer CallExpression, isCall flips to false, and the polyfill emit drops `.call(arr)`
  // (broken `this`). default-parser path keeps the same shape via `extra.parenthesized`
  // flag, so peeling parens here aligns createParens=true with default-parser behavior.
  // shared `TRANSPARENT_EXPR_WRAPPER_TYPES` keeps this in lockstep with `peelTransparentPath`
  // in synth-swap-emitter.js (parent-up vs expression-down walks of the same wrapper set)
  function unwrapTSExpressionParent(path) {
    let current = path;
    while (current.parentPath && TRANSPARENT_EXPR_WRAPPER_TYPES.has(current.parentPath.node?.type)) {
      current = current.parentPath;
    }
    return current;
  }

  // detect `(path)` shape across both parser configs:
  //   default parser: `extra.parenthesized` flag on the path itself or any TS-wrapped form
  //   createParens=true: `ParenthesizedExpression` node above the path / TS-wrapped form
  function isWrappedInParens(path) {
    if (path.node?.extra?.parenthesized) return true;
    let current = path;
    while (current.parentPath && TS_EXPR_WRAPPERS.has(current.parentPath.node?.type)) {
      current = current.parentPath;
      if (current.node.extra?.parenthesized) return true;
    }
    return current.parentPath?.node?.type === 'ParenthesizedExpression';
  }

  // wrap a result expression in a SequenceExpression preserving side effects collected
  // from the receiver / computed-key. noop when sideEffects is empty - callers can pass
  // unconditionally. single source of truth: index.js imports this off the compat factory
  // (destructured at plugin top-level), it has no own copy
  function withSideEffects(result, sideEffects) {
    return sideEffects?.length
      ? t.sequenceExpression([...sideEffects.map(e => t.cloneNode(e)), result])
      : result;
  }

  // SE-receiver + key-SE reorder guard: a non-optional (`check` null) side-effecting receiver memo
  // would otherwise be built INSIDE the body, after the prepended key SE, running the key before
  // the receiver. memoize the receiver and prepend its assignment to the SE list so it evaluates
  // first (native order). returns `[receiverNode, sideEffects]` - the receiver ref to emit and the
  // reordered SE list. no-op for optional (receiver already memoized in the guard) / SE-free receivers
  function hoistReceiverSE(object, sideEffects, check, scope, seMode) {
    // skip the peel case: there the receiver-SE is already replayed in the SE list, and `object`
    // is the peeled tail - hoisting it would reorder the peeled prefix vs the tail (matches the
    // unplugin `seMode !== 'peel'` gate)
    if (check || seMode === 'peel' || !sideEffects?.length || !mayHaveSideEffects(object)) return [object, sideEffects];
    const [memoAssign, ref] = memoize(object, scope);
    return [ref, [memoAssign, ...sideEffects]];
  }

  // classify a (possibly TS-wrapped) member path's relationship to its enclosing call:
  //   - `callerPath`: the path past transparent TS / paren wrappers (the real callee)
  //   - `parent`: that caller path's parent node
  //   - `isCall`: whether `callerPath` is the callee of an enclosing call expression
  //   - `isParenLookupOnly`: the `(arr?.member)()` shape - a parenthesized optional member as
  //     callee of a NON-optional outer call. parens terminate the optional chain, so a nullish
  //     receiver must throw at the outer call instead of short-circuiting to void 0. shared by
  //     `replaceInstanceLike` (.call shape) and `replaceCallWithSimple` (bare get-iterator shape)
  function classifyCallerContext(path) {
    const callerPath = unwrapTSExpressionParent(path);
    const { parent } = callerPath;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent))
      && parent.callee === callerPath.node;
    const isParenLookupOnly = isCall && !t.isOptionalCallExpression(parent)
      && isWrappedInParens(path) && path.isOptionalMemberExpression();
    return { callerPath, parent, isCall, isParenLookupOnly };
  }

  // SequenceExpression-receiver double-emit guard (see `classifyReceiverSE` doc). mutates
  // `path.node.object` for `peel` (non-optional): peel the receiver to its SE tail; the
  // prepended `sideEffects` replay the full prefix the resolver collected. returns the side
  // effects to emit - the whole list for `peel` / no-SE, only the trailing key-SE for
  // `suppress` (optional - the receiver-SE stays in extractCheck's null-guard memoize, so
  // prepending it too would double-eval). shared by `replaceInstanceLike` + `replaceCallWithSimple`
  function applyReceiverSeMode(path, sideEffects, receiverEffectCount) {
    const seMode = classifyReceiverSE(path.node.object,
      path.node.optional || path.isOptionalMemberExpression(), sideEffects);
    if (seMode === 'peel') {
      const peeled = peelReceiverSequenceTail(path.node.object);
      if (peeled !== path.node.object) path.node.object = peeled;
    }
    const effectiveSE = seMode === 'suppress' ? keySideEffectsOnly(receiverEffectCount, sideEffects) : sideEffects;
    return { seMode, effectiveSE };
  }

  // parenthesized optional member followed by a NON-optional outer call: `(arr?.includes)(1)`.
  // native semantics:
  //   - arr nullish: `(undefined)(1)` -> TypeError ("not a function") - chain ENDS at `?.`,
  //     outer `()` is non-optional call on void 0
  //   - arr non-nullish: Reference Type preserves `this=arr` through parens (per ECMAScript
  //     spec on GroupingOperator, verified empirically: `([1,2]?.at)(0) === 1`)
  // emit `(arr == null ? void 0 : _includes(arr)).call(arr, 1)`:
  //   - nullish path: `(undefined).call(...)` accesses `.call` on undefined -> TypeError
  //     (matches native throw shape; "Cannot read properties of undefined" rather than "not
  //     a function" - both are TypeError, error message differs)
  //   - success path: `_includes(arr).call(arr, 1)` preserves `this=arr` (matches native)
  // args eval order: nullish path skips arg evaluation where native evaluates them. minor
  // divergence acceptable - the throw still fires; literal args (the common case) are
  // semantically identical
  // optional outer call `(arr?.at)?.(0)` goes through the standard buildMethodCall path
  // since Reference Type preserves through parens and short-circuits properly on nullish
  function replaceInstanceLike({ path, id, skipOptional, sideEffects, receiverEffectCount }) {
    const { seMode, effectiveSE } = applyReceiverSeMode(path, sideEffects, receiverEffectCount);
    const { callerPath, parent, isCall, isParenLookupOnly } = classifyCallerContext(path);
    const [check, object, embed] = extractCheck(path, skipOptional);
    if (isParenLookupOnly) {
      // build `(check == null ? void 0 : _id(_ref = obj)).call(_ref, ...args)` so:
      //   - throw-on-nullish preserved: ternary -> void 0, `.call` access on undefined throws
      //   - `this`-binding-on-success preserved: `_ref` captures obj, `.call(_ref, ...)` binds it
      //   - obj evaluated ONCE: deep chains `(arr?.b.includes)(1)` would otherwise re-eval
      //     `arr.b` in callArgs (single-eval matters for receivers with side effects)
      // memoize unconditionally - bare Identifier hits `isReusableReceiver` and inlines without _ref
      const [objAssign, objRef] = memoize(object, path.scope, path.node);
      const lookup = t.callExpression(id, [objAssign]);
      // check=null path: extractCheck saw a polyfillable optional and skipped the null-guard
      // memo (replacement consumes `?.`). drop the ternary wrap to avoid synthesising an
      // invalid `null == null ? ...` BinaryExpression - mirrors the same `wrapConditional(
      // null, ...)` defense in `replaceAndWrap`
      const wrappedCallee = check ? wrapConditional(check, lookup) : lookup;
      const callArgs = [t.cloneNode(objRef), ...parent.arguments.map(a => t.cloneNode(a))];
      const result = t.callExpression(t.memberExpression(wrappedCallee, t.identifier('call')), callArgs);
      callerPath.parentPath.replaceWith(withSideEffects(result, effectiveSE));
      return;
    }
    const [recvNode, hoistedSE] = hoistReceiverSE(object, effectiveSE, check, path.scope, seMode);
    const result = isCall
      ? buildMethodCall({
        id, object: recvNode, scope: path.scope, args: parent.arguments, optionalCall: parent.optional, anchorNode: parent,
      })
      : t.callExpression(id, [t.cloneNode(recvNode)]);
    replaceAndWrap({
      replacePath: isCall ? callerPath.parentPath : path,
      result: withSideEffects(result, hoistedSE), check, embedGuard: embed,
    });
  }

  function replaceCallWithSimple(path, id, skipOptional, sideEffects, receiverEffectCount) {
    // peel TS wrappers so the call (and not its `as X` / `!` envelope) is what we replace
    const { callerPath, isParenLookupOnly } = classifyCallerContext(path);
    const { seMode, effectiveSE } = applyReceiverSeMode(path, sideEffects, receiverEffectCount);
    // `(arr?.[Symbol.iterator])()`: parens terminate the optional chain, so on nullish `arr`
    // native evaluates `(undefined)()` and throws TypeError - the standard `check == null ?
    // void 0 : _id(arr)` ternary would instead yield `void 0` and swallow the throw (unlike
    // `replaceInstanceLike`'s sibling case, there is no trailing `.call` to re-trigger the
    // throw on the void 0). emit the bare `_id(receiver)` so the polyfill call throws on
    // nullish. caveat: this restores the throw, not the exact error - native throws a
    // call-time `is not a function`, `getIterator(null)` throws `is not iterable`. exact-
    // message parity is unreachable: the only emit matching native's message calls the bare
    // method without `.call`, which drops the `this=receiver` binding the parens preserve and
    // breaks the success case. both are TypeError - same accepted tradeoff as the instance-
    // method paren-lookup. receiver is the sole arg (evaluated once), inner `?.` stays intact,
    // so no memoization / null-guard is needed
    if (isParenLookupOnly) {
      callerPath.parentPath.replaceWith(
        withSideEffects(t.callExpression(id, [t.cloneNode(path.node.object)]), effectiveSE),
      );
      return;
    }
    const [check, object, embed] = extractCheck(path, skipOptional);
    const [recvNode, hoistedSE] = hoistReceiverSE(object, effectiveSE, check, path.scope, seMode);
    replaceAndWrap({
      replacePath: callerPath.parentPath,
      // wrap with the caller's accumulated side effects (e.g. computed-key SE from
      // detect-usage) so they don't drop when the original call is fully replaced
      result: withSideEffects(t.callExpression(id, [t.cloneNode(recvNode)]), hoistedSE),
      check, embedGuard: embed,
    });
  }

  // Babel-style OR-chain for `(recv)?.inner?.(ia).outer(oa)`: runs outer directly on
  // `_m.call(_a, ia)` so value-undef (e.g. `[].at(99)`) reaches `_outer()` and throws
  // like native, while each `?.` contributes its own `null == ...` test.
  // caller (findInnerPolyChain) guarantees outer is a call expression.
  // unplugin re-implements this combined-chain logic as a text-level rewrite. the two emit
  // differently - babel rebuilds the AST recursively (stacked optional-poly hops nest naturally),
  // unplugin emits one flat OR-chain in a single pass; semantically identical, and where the
  // textual shape diverges the unplugin fixture carries an output-unplugin.mjs sidecar
  // rebuild a receiver sub-chain with the inner optional call (`target`) spliced out for
  // `replacement` (the memoized inner result). deep-clones each hop so siblings - call args /
  // computed keys - are fresh, then overrides the chain-child with the recursively-spliced node
  function spliceChainInner(node, target, replacement) {
    if (node === target) return replacement;
    const clone = t.cloneNode(node, true);
    if (node.object) clone.object = spliceChainInner(node.object, target, replacement);
    else if (node.callee) clone.callee = spliceChainInner(node.callee, target, replacement);
    else if (node.expression) clone.expression = spliceChainInner(node.expression, target, replacement);
    return clone;
  }

  function replaceInstanceChainCombined(outerPath, outerId, { innerCallee, innerArgs, innerId, chainStartNode, hasHops, sideEffects }) {
    const callerPath = unwrapTSExpressionParent(outerPath);
    const outerCall = callerPath.parent;
    const { scope } = outerPath;
    function nullTest(expr) {
      return t.binaryExpression('==', t.nullLiteral(), expr);
    }
    function assign(ref, value) {
      return t.assignmentExpression('=', t.cloneNode(ref), value);
    }

    const [anAssign, aRef] = memoize(innerCallee.object, scope, outerPath.node);
    const mRef = generateRef(scope, outerPath.node);
    const mCall = t.callExpression(
      t.memberExpression(t.cloneNode(mRef), t.identifier('call')),
      [t.cloneNode(aRef), ...innerArgs.map(a => t.cloneNode(a))]);

    // `arr.flat?.()`: the `?.` guards the CALL, not the `.flat` access - reading `.flat` on a
    // nullish `arr` must THROW like native, so emit NO `null == receiver` test (it would swallow
    // the throw into void 0). guard the receiver only when ITS access is optional too
    // (`arr?.flat?.()`). either way the method-get assigns `mRef`; fold the receiver assignment
    // into it in the non-optional case so a non-bare receiver still evaluates exactly once
    const methodGet = t.callExpression(t.cloneNode(innerId),
      [innerCallee.optional ? t.cloneNode(aRef) : anAssign]);
    const tests = innerCallee.optional
      ? [nullTest(anAssign), nullTest(assign(mRef, methodGet))]
      : [nullTest(assign(mRef, methodGet))];
    // thread surviving non-optional hops (`.map(...)` between inner `flat?.()` and outer
    // `filter?.()`): splice the memoized inner result into the outer receiver sub-chain so the
    // hops re-emit (own pass polyfills them on the inner result) rather than being dropped
    let outerObject = hasHops ? spliceChainInner(outerPath.node.object, chainStartNode, mCall) : mCall;
    // `?.method` as outer: nullish receiver of the outer call must short-circuit it. capture
    // the hop-spliced `outerObject` (inner result + surviving non-optional hops), NOT the bare
    // `mCall` - testing/binding `mCall` would discard the hops (`arr.flat?.().map(f)?.at(0)`
    // would drop `.map(f)` and call `.at` on the flat() result). with no hops outerObject === mCall
    if (outerPath.node.optional) {
      const vRef = generateRef(scope, outerPath.node);
      tests.push(nullTest(assign(vRef, outerObject)));
      outerObject = t.cloneNode(vRef);
    }
    const testOr = tests.reduce((a, b) => t.logicalExpression('||', a, b));

    // outer-key computed SE (e.g. `arr?.at?.(0)?.[(fn(), 'map')](x => x)`) attaches to
    // `meta.sideEffects` during detection. fold it into the alternate (not around the whole
    // conditional) so it fires only when the chain does NOT short-circuit - native skips the
    // computed-key eval on a nullish receiver; prepending it would run `fn()` unconditionally
    const replacement = withSideEffects(buildMethodCall({
      id: outerId, object: outerObject, scope, args: outerCall.arguments, optionalCall: outerCall.optional,
      anchorNode: outerPath.node,
    }), sideEffects);
    const conditional = t.conditionalExpression(testOr,
      t.unaryExpression('void', t.numericLiteral(0)), replacement);
    // chained outer calls read the hint off the result node; relocate the pre-combine
    // `annotateCallReturnType` stamp onto the wrapping conditional so they still resolve
    const outerCallType = resolvedType?.get(outerCall);
    if (outerCallType) resolvedType.set(conditional, outerCallType);
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
