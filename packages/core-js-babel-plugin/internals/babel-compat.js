// babel-specific AST primitives + optional-chain handling. covers ref memoization,
// optional-chain deoptionalization, instance-method replacement strategies, TS-wrapper
// peeling. destructure emission moved out to `internals/destructure-emitter.js`.
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  claimReceiverEvaluationMayThrow,
  classifyReceiverSE, descendToChainRoot, keySideEffectsOnly, maximalProxyGlobalPrefix,
  guardTailPullCount,
  navHasUnresolvableProxyHop,
  peelChainAssignment, peelReceiverSequenceTail, inlineCallProxyGlobalRoot, planProvenNavGuardCollapse,
  proxyReceiverValueCanBeUndefined, sealedChainBoundary,
  resolveObjectName, vestigialNavOptionals,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { proxyGlobalRootName } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  createTypeAnnotationChecker,
  isReusableReceiver,
  memberKeyName,
  memberProxyHopName,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverCarriesLiveOptional,
  reEvaluationObservable,
  migratableClaimSe,
  SKIPPABLE_WRAPPER_TYPES,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';

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

// the resolver-facing options (`getAdapter` / `resolvePureGlobalEntry` / `injectPureGlobal`) are
// genuinely optional: the unit harness constructs the helpers with the injector alone to isolate
// AST-shape behaviour from resolver wiring, so every consumer of them must gate as a family
// restore the source parens around a tagged template's TAG once the tail above the render carries
// a `?.`: the chain must end at the parens, both to stay legal (a bare optional chain is not a
// valid tag) and to keep the tag a REFERENCE, so the call still binds `this` to the last read
function reparenthesizeTaggedTag(t, fromPath) {
  for (let step = fromPath; step?.node; step = step.parentPath) {
    const parent = step.parentPath;
    if (parent?.isTaggedTemplateExpression() && parent.node.tag === step.node) {
      step.replaceWith(t.parenthesizedExpression(step.node));
      return;
    }
    if (!parent?.isMemberExpression() && !parent?.isOptionalMemberExpression()) return;
  }
}

export default function (t, { getInjector, getAdapter, typeResolvers, resolvePureGlobalEntry, injectPureGlobal } = {}) {
  const { resolveNodeType, resolvedType } = typeResolvers ?? {};

  const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

  function reset() {
    isInTypeAnnotation.reset();
    pendingKeptNavCollapses.length = 0;
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
    const assign = t.assignmentExpression('=', t.cloneNode(ref), node);
    // register the synthetic write so a RE-VISIT of the memo body can follow the ref back to
    // its value (the assignment never appears in scope constantViolations)
    getInjector?.()?.recordMemoWrite?.(ref.name, assign);
    return [assign, ref];
  }

  // resolve the expression's Type object - no-op when the factory was constructed without
  // typeResolvers (tooling that uses this module for raw AST rewrite only). `null` on
  // unresolvable types, cheaper on repeat calls thanks to resolveCache. Type cached in
  // the typeResolvers' WeakMap (via `resolvedType.set`) - canonical constructor form is
  // preserved for downstream `KNOWN_*_RETURN_TYPES` lookups, no AST-property pollution
  function pathType(p) {
    return resolveNodeType ? resolveNodeType(p) : null;
  }

  // clone a memoized `_ref` and, when its Type is known, seed it on the SAME clone that goes into
  // the AST so `resolveNodeType`'s WeakMap short-circuit resolves the synthesized (position-less)
  // ref back - keying a separate clone loses the type and enhanceMeta falls to the generic variant.
  // `resolvedType` may be undefined when wired without typeResolvers (raw AST-rewrite tooling)
  function seededRefClone(ref, type) {
    const clone = t.cloneNode(ref);
    if (type) resolvedType?.set(clone, type);
    return clone;
  }

  // tokens that are safe as a statement-leading token (no ASI hazard with the previous statement).
  // only Identifier / this can reach here: `isReusableReceiver` admits nothing else as a memo-free
  // receiver, and a bare `super` cannot head an optional chain (SyntaxError)
  function isLeadingIdentLike(node) {
    return t.isIdentifier(node) || t.isThisExpression(node);
  }

  // guarded claims minted by the static erase-refusal (`null == root ? void 0 : <claim>`).
  // identity-tracked so an OUTER instance wrapper can re-hang the guard above itself instead of
  // wrapping the whole ternary (which would hand `void 0` to the helper - a throw where native
  // short-circuits). a USER-written ternary of the same shape must NOT re-hang: there the
  // wrapper legitimately consumes the branch value.
  // parenTerminated: chain barriers recorded at replace time (see markGuardedClaim's caller);
  // pendingKeptNavCollapses: kept nav-collapse renders awaiting their host-exit flush
  // throwingExtractions: helper-GET calls minted for DESTRUCTURE extractions -
  // native destructuring of undefined THROWS, so an erase-refusal guard must stay INSIDE the
  // helper argument (the helper then throws on the short-circuited void 0 exactly like native)
  // instead of climbing above it
  // hops a nav-collapse render emitted above its ponyfill leaf (`_self.window`): the hop-drop
  // canon must not re-run on them, or the same source yields a different chain per traversal
  // chains whose tail feeds a TAGGED template: the source parens end the chain there, so the
  // lift that re-creates a short-circuit would swallow the throw the source performs
  const taggedTemplateTails = new WeakSet(),
        renderedPlanTails = new WeakSet(),
        guardedClaims = new WeakSet(),
        pluginSeqWraps = new WeakSet(),
        parenTerminated = new WeakSet(),
        pendingKeptNavCollapses = [],
        throwingExtractions = new WeakSet(),
        rebuiltSourceCalls = new WeakSet();
  function markThrowingExtraction(node) {
    throwingExtractions.add(node);
    return node;
  }
  function markGuardedClaim(node) {
    guardedClaims.add(node);
    return node;
  }
  // record the chain barrier when the replaced path sat inside user parens / a TS cast: the
  // barrier survives on the replacement so guard hoists (climb tail steps AND the instance
  // wrapper rebuild) stop at it - native throws past the barrier where the chain would
  // short-circuit, and a hoisted guard would swallow that throw
  function markParenTerminatedIfWrapped(path, replacement) {
    if (isWrappedInParens(path) || TS_EXPR_WRAPPERS.has(path.parentPath?.node?.type)) {
      parenTerminated.add(replacement);
    }
    return replacement;
  }

  // guarded-claim emission for the static erase-refusal (a live `?.` over an unresolvable
  // proxy hop): the claim re-hangs INSIDE the preserved guard - `null == (b = _globalThis
  // .window) ? void 0 : _Array$from(x)` - short-circuit intact. OUTER instance wrappers may
  // have consumed the member before the refusal fires, so the guard CLIMBS above the whole
  // plugin-built stack (helper wrap, its memoized twin, the `.call` dispatch, the surviving
  // optional-chain tail); ONLY plugin-minted wrappers and provable chain tails lift - a user
  // consumer of the member legitimately receives `void 0`, and user parens / TS casts
  // terminate the chain (native throws past them, so the guard must stay inside)
  function isHelperCall(callNode, argNode) {
    // SYNTHESIZED only: a plugin-built wrapper carries no source range. a call the SOURCE wrote
    // around the claim (`Array.of(<nav>)`) wears an injected callee too once its own static
    // resolves, but it is a polyfill in its own right - lifting a guard over it turns the
    // argument's short-circuit into the whole call's
    // a plugin HELPER wraps the claim and stays undefined-tolerant, so a guard may lift over it -
    // the text emitter hangs it outside too. a call the SOURCE wrote around the claim is a
    // polyfill in its own right, whether it still carries its source range or an outer claim has
    // already rebuilt it: lifting past it turns the argument's short-circuit into the whole call's
    return typeof callNode.start !== 'number' && !rebuiltSourceCalls.has(callNode)
      && callNode.arguments.length === 1
      && callNode.arguments[0] === argNode && callNode.callee.type === 'Identifier'
      && getInjector().getBindingInfo(callNode.callee.name)?.source;
  }

  // replace every read of the plugin-minted ref inside a detached clone (allocator names are
  // file-unique, so a bare name match cannot hit user code)
  function traverseNodeReplaceIdent(node, name, replacement) {
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          const c = child[i];
          if (!c || typeof c.type !== 'string') continue;
          if (c.type === 'Identifier' && c.name === name) child[i] = t.cloneNode(replacement);
          else traverseNodeReplaceIdent(c, name, replacement);
        }
      } else if (child && typeof child.type === 'string') {
        if (child.type === 'Identifier' && child.name === name) node[key] = t.cloneNode(replacement);
        else traverseNodeReplaceIdent(child, name, replacement);
      }
    }
  }

  function liftThroughWrapper(basePath, body, prevKind) {
    // user parens / a TS cast on the climbed node TERMINATE the chain: native throws past
    // them where the chain would short-circuit, so the guard must stay INSIDE (the wrapping
    // helper then throws on the short-circuited void 0 exactly like native)
    if (basePath.node?.extra?.parenthesized) return null;
    const p = basePath.parentPath;
    if (!p) return null;
    if (p.isCallExpression() && isHelperCall(p.node, basePath.node)) {
      if (throwingExtractions.has(p.node)) return null;
      return [p, t.callExpression(t.cloneNode(p.node.callee), [body]), 'helper'];
    }
    if (p.isAssignmentExpression() && p.node.operator === '='
      && p.node.right === basePath.node && p.node.left.type === 'Identifier') {
      const gp = p.parentPath;
      if (gp?.isCallExpression() && isHelperCall(gp.node, p.node)) {
        if (throwingExtractions.has(gp.node)) return null;
        return [gp, t.callExpression(t.cloneNode(gp.node.callee),
          [t.assignmentExpression('=', t.cloneNode(p.node.left), body)]), 'helper'];
      }
      // memo assign leading a plugin-built SE wrap (`(_ref = <member>, keySE, helper(_ref))`):
      // the whole sequence lifts - its key SE legally moves into the guard's non-null branch
      // (native evaluates the key only when the chain does not short-circuit). a bare-
      // Identifier claim needs no memo at all - inline it over the ref reads and drop the
      // assign (the text emitter folds the same shape memo-free)
      if (gp?.isSequenceExpression() && pluginSeqWraps.has(gp.node)
        && gp.node.expressions[0] === p.node) {
        if (body.type === 'Identifier') {
          const refName = p.node.left.name;
          const inlined = gp.node.expressions.slice(1).map(e => {
            const clone = t.cloneNode(e, true);
            traverseNodeReplaceIdent(clone, refName, body);
            return clone.type === 'Identifier' && clone.name === refName ? t.cloneNode(body) : clone;
          });
          return [gp, inlined.length === 1 ? inlined[0] : t.sequenceExpression(inlined), 'helper'];
        }
        return [gp, t.sequenceExpression([
          t.assignmentExpression('=', t.cloneNode(p.node.left), body),
          ...gp.node.expressions.slice(1).map(e => t.cloneNode(e)),
        ]), 'helper'];
      }
      return null;
    }
    if (prevKind === 'helper' && (p.isMemberExpression() || p.isOptionalMemberExpression())
      && p.node.object === basePath.node && !p.node.computed && p.node.property.name === 'call') {
      const cp = p.parentPath;
      if ((cp?.isCallExpression() || cp?.isOptionalCallExpression()) && cp.node.callee === p.node) {
        const callMember = p.isOptionalMemberExpression()
          ? t.optionalMemberExpression(body, t.identifier('call'), false, true)
          : t.memberExpression(body, t.identifier('call'));
        const rebuiltArgs = cp.node.arguments.map(a => t.cloneNode(a));
        return [cp, cp.isOptionalCallExpression()
          ? t.optionalCallExpression(callMember, rebuiltArgs, false)
          : t.callExpression(callMember, rebuiltArgs), 'helper'];
      }
    }
    // the surviving OPTIONAL-chain tail over the claim (`<claim>.userM?.()` / `<helper-wrap>
    // .length`): the guard hoists over the whole tail - buried under a raw member read it
    // would throw on the short-circuited void 0 where native yields undefined. an Optional*
    // node type proves the chain by itself; a PLAIN member counts only past a plugin wrapper
    // or tail step (a sibling transform deoptionalized it) - never directly over the claim,
    // where a user-written consumer of the ternary is indistinguishable. rebuilt plain when
    // the link is non-optional (an Optional* node over a non-chain body fails babel's chain
    // invariant); an optional CALL directly over the claim keeps the visible-deopt spelling
    // (`(guard ? void 0 : _from)?.(x)`), so the call step needs a prior step
    const tailMember = p.node.object === basePath.node && !parenTerminated.has(basePath.node)
      && (p.isOptionalMemberExpression() || (p.isMemberExpression() && prevKind !== 'claim'));
    if (tailMember) {
      return [p, p.node.optional
        ? t.optionalMemberExpression(body, t.cloneNode(p.node.property), p.node.computed, true)
        : t.memberExpression(body, t.cloneNode(p.node.property), p.node.computed), 'tail'];
    }
    const tailCall = p.node.callee === basePath.node && prevKind === 'tail'
      && (p.isOptionalCallExpression() || p.isCallExpression());
    if (tailCall) {
      const rebuiltArgs = p.node.arguments.map(a => t.cloneNode(a));
      return [p, p.node.optional
        ? t.optionalCallExpression(body, rebuiltArgs, true)
        : t.callExpression(body, rebuiltArgs), 'tail'];
    }
    return null;
  }

  function emitGuardedClaim({ path, replacePath, id, sideEffects, receiverEffectCount, guardObject, substituteGlobal = null }) {
    if (!guardObject) return;
    // a kept chain-assign VALUE with collapsible pony hops spells through the shared plan
    // (`v = _globalThis.self.window` -> `v = _self.window`) before the test freezes it
    collapseKeptNavValueNode(guardObject, path);
    const migratedSe = migratableClaimSe({
      sideEffects, receiverEffectCount, rootNode: guardObject, end: path.node.end,
    });
    if (!migratedSe) return;
    // user parens on a mid-chain node TERMINATE the chain there: a PLAIN read above the seal
    // throws natively where the sealed chain would short-circuit, so a whole-chain guarded
    // claim would swallow that throw. a seal consumed by a live `?.` has no such read - its
    // short-circuit case IS the guard's void-0 case, so the claim proceeds (`(nav)?.X`)
    let sealConsumer = path.node;
    for (let n = path.node.object; n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression'; n = n.object) {
      if (n.extra?.parenthesized && !sealConsumer.optional) return;
      sealConsumer = n;
    }
    // the guard tests the OBJECT of the `?.` hop that guards the undefinable value (resolved by the
    // caller via `undefinableOptionalGuard`): `globalThis.window?.self.X` -> `globalThis.window`, a
    // hop the always-defined descended root does not cover. left in the AST so the identifier visitor
    // substitutes its proxy-global root in place (`_globalThis.window`)
    let rootNode = guardObject;
    // the kept test still holds the chain's ROOT proxy-global (a bare `globalThis.window`
    // prefix or one BURIED in an inline-provable call arg): the member visitor's subtree-skip
    // means the identifier visitor never reaches it, and the claim freezes the kept text - a
    // raw `globalThis` would ReferenceError on ie:11. no tree walk: the canonical spine
    // descent + inline proof land on the ONE identifier, substituted by name in place. its own
    // `?.` spelling is the shared verdict below, applied once for every root shape
    if (substituteGlobal) {
      const { root } = descendToChainRoot(guardObject, true);
      const buried = root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression'
        ? inlineCallProxyGlobalRoot({ callNode: root, scope: path.scope, adapter: getAdapter?.(), path })
        : root?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(root.name) ? root : null;
      // `noGlobals` - the built-in globals registry would report `globalThis` itself as
      // bound; only a REAL binding (param / var / destructured pattern) shadows
      if (buried && !path.scope.hasBinding(buried.name, true)) {
        const sub = substituteGlobal(buried.name);
        if (sub) buried.name = sub.name;
      }
    }
    rootNode = navGuardTestNode(rootNode, path);
    // a transparent wrapper on the ROOT gets explicit parens in the guard test: babel prints
    // `null == <cast> ? ...` cast-on-boolean (precedence drift) where the text emitter keeps
    // the wrapped root grouped - `null == ((c = gw) as any) ? ...`
    if (SKIPPABLE_WRAPPER_TYPES.has(rootNode.type)) rootNode = t.parenthesizedExpression(rootNode);
    const invokeParent = replacePath.parentPath;
    const isInvoke = (invokeParent?.isCallExpression() || invokeParent?.isOptionalCallExpression())
      && invokeParent.node.callee === replacePath.node && !invokeParent.node.optional;
    let target = isInvoke ? invokeParent : replacePath;
    let claimBody = isInvoke
      ? t.callExpression(t.cloneNode(id), invokeParent.node.arguments.map(a => t.cloneNode(a)))
      : t.cloneNode(id);
    // the rebuild loses the source range, but the call is still the one the SOURCE wrote
    if (isInvoke) rebuiltSourceCalls.add(claimBody);
    if (migratedSe.length) {
      claimBody = t.sequenceExpression([...migratedSe.map(se => t.cloneNode(se)), claimBody]);
    }
    let climbedHelper = false;
    for (let lifted = liftThroughWrapper(target, claimBody, 'claim'); lifted;
      lifted = liftThroughWrapper(target, claimBody, lifted[2])) {
      climbedHelper ||= lifted[2] === 'helper';
      [target, claimBody] = lifted;
    }
    // a guard re-hung above climbed HELPER wrappers memoizes its root: the text emitter's
    // guard builder (which owns those shapes there) always allocates the memo ref, and the
    // pre-claim kept-canon does too - an unmemoized test would split the emitters on every
    // wrapped claim byte-for-byte. unwrapped claims, pure tail climbs and claims landing
    // inside an OUTER guard test keep the memo-free spelling (the text emitter's
    // slot-hoisted prefix carries no memo either - the locked H1 / combined canon)
    let landing = target.parentPath;
    while (landing?.isAssignmentExpression()) landing = landing.parentPath;
    const inOuterGuardTest = !!landing?.isBinaryExpression()
      && landing.node.operator === '=='
      && (landing.node.left?.type === 'NullLiteral' || landing.node.right?.type === 'NullLiteral');
    const test = climbedHelper && !inOuterGuardTest
      ? t.assignmentExpression('=', t.cloneNode(generateRef(path.scope, path.node)), rootNode)
      : rootNode;
    // a `delete` above the climbed tail needs a REFERENCE: a member absorbed into the
    // ternary alternate evaluates and deletes nothing. re-hang the LAST climbed member
    // OUTSIDE the guard behind `?.` - the claim binding is always defined, so the `?.`
    // only re-creates the source short-circuit on the guarded branch
    let deleteWalk = target.parentPath;
    while (deleteWalk && (TS_EXPR_WRAPPERS.has(deleteWalk.node?.type)
      || deleteWalk.node?.type === 'ParenthesizedExpression')) deleteWalk = deleteWalk.parentPath;
    const deleteTail = !!deleteWalk?.isUnaryExpression() && deleteWalk.node.operator === 'delete'
      && (claimBody.type === 'MemberExpression' || claimBody.type === 'OptionalMemberExpression');
    if (deleteTail) {
      const guard = markGuardedClaim(t.conditionalExpression(
        t.binaryExpression('==', t.nullLiteral(), test),
        t.unaryExpression('void', t.numericLiteral(0)),
        claimBody.object,
      ));
      target.replaceWith(t.optionalMemberExpression(
        guard, t.cloneNode(claimBody.property), claimBody.computed, true));
      return;
    }
    const claimResult = markGuardedClaim(t.conditionalExpression(
      t.binaryExpression('==', t.nullLiteral(), test),
      t.unaryExpression('void', t.numericLiteral(0)),
      claimBody,
    ));
    markParenTerminatedIfWrapped(target, claimResult);
    target.replaceWith(claimResult);
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
      // a receiver carrying its OWN live `?.` short-circuits the whole chain, so reading the
      // method off its memo must short-circuit too - otherwise the guard test throws where
      // native yields undefined
      if (receiverCarriesLiveOptional(receiverNode)) {
        methodNode.type = 'OptionalMemberExpression';
        methodNode.optional = true;
      }
    }
    const [methodMemo, methodRef] = memoize(methodNode, scope, chainStart.node);
    chainStart.node.callee = t.memberExpression(seededRefClone(methodRef, memoType), t.identifier('call'));
    chainStart.node.arguments = [callReceiver, ...chainStart.node.arguments.map(arg => t.cloneNode(arg))];
    // when recv is memoized, fold its assignment ahead of the method memo so it runs first
    return receiverMemo ? t.sequenceExpression([receiverMemo, methodMemo]) : methodMemo;
  }

  // a memoized NON-identifier optional root that RESOLVES to a proxy-global (an IIFE / call returning
  // globalThis, `(() => globalThis)()`) loses its provenance once it becomes a synthetic `_ref`: the tail's
  // redundant `.self` hop then survives (`_ref.self.X` reads undefined off-engine) and a static ctor method
  // stays native (`_ref.Array.from`, not collapsed to `_Array$from`). tag the minted ref with its resolved
  // proxy-global root so the natural hop / static-dispatch collapse recognises `_ref` when the replacement is
  // re-traversed. that collapse CONSUMES the receiver (a static is receiver-independent), so `_ref` survives
  // only in the null-guard afterwards, where the bare-read tag has no member access to rewrite. an identifier
  // root already carries provenance (the natural rewrite handles it); `inlineCallReturnExpression` no-ops for
  // a non-call root, so this only fires for the call/IIFE roots the natural collapse could not reach
  function tagProxyGlobalMemoRef(ref, rootNode, scope) {
    const adapter = getAdapter?.();
    if (!adapter || !scope || !ref?.name) return;
    let name = null;
    if (rootNode?.type === 'CallExpression' || rootNode?.type === 'OptionalCallExpression') {
      // a bare call / IIFE root: inline its return and recognise the proxy-global it yields
      const rootId = inlineCallProxyGlobalRoot({ callNode: rootNode, scope, adapter, path: null });
      name = rootId && proxyGlobalRootName({ node: rootId, scope, adapter, path: null });
    } else if (rootNode?.type === 'MemberExpression' || rootNode?.type === 'OptionalMemberExpression') {
      // the same provenance loss with the call BURIED under pristine proxy hops (`f()?.window`):
      // the canonical receiver resolution walks the hops and the inline call in one go, and a
      // non-proxy result stays untagged (an identifier root keeps its provenance naturally).
      // an SE-carrying sequence at the chain root tags too - the memo assignment runs the
      // effect exactly once in the guard test, so the tagged ref is safe in the branch
      const resolved = resolveObjectName({ objectNode: rootNode, scope, adapter, path: null });
      name = resolved && POSSIBLE_GLOBAL_OBJECTS.has(resolved) ? resolved : null;
    }
    if (name) getInjector().registerGlobalAlias(ref.name, name, { minted: true, trusted: true });
  }

  // THE guard-test spelling, shared by every channel that builds a `null == <test>` guard: the
  // vestigial-`?.` verdict of the provider (a `?.` over the proven root is dead text the text
  // emitter drops too; one over a genuine probe is load-bearing and stays). deopts a CLONE - the
  // source node may still be read by another channel - and keeps node identity when nothing is
  // dead, so channels relying on the live subtree are untouched
  // channels holding a PATH pass it (the resolve context is rebuilt from it); the plan's own
  // render passes the context the plan resolved with
  function navGuardTestNode(node, anchorPath, plan = null) {
    const adapter = getAdapter?.();
    if (!node || !adapter || !resolvePureGlobalEntry) return node;
    const resolvePure = plan ? plan.resolvePure : ({ name }) => resolvePureGlobalEntry(name, anchorPath);
    const ctx = plan ? plan.ctx : { scope: anchorPath?.scope, adapter, path: anchorPath };
    if (!ctx?.scope) return node;
    const clone = t.cloneNode(node, true);
    const dead = vestigialNavOptionals(clone, resolvePure, ctx);
    if (!dead.length) return node;
    for (const hop of dead) {
      hop.type = 'MemberExpression';
      delete hop.optional;
    }
    return clone;
  }

  // the AST spelling of a nav-collapse plan (mirrors the text emitter's forms byte-for-byte)
  function renderNavCollapseAst(plan, pureId) {
    const keySeExprs = plan.keySeExprs.map(se => t.cloneNode(se));
    const leaf = keySeExprs.length ? t.sequenceExpression([...keySeExprs, t.cloneNode(pureId)]) : t.cloneNode(pureId);
    // the TAIL hangs off the leaf INSIDE the guarded alternate (`null == X ? void 0 : _self
    // .window`) - hung off the whole ternary it would read `.window` off the short-circuited
    // void 0. the sequence / bare spellings keep the tail outside (`(dh(), _self).window`)
    function withTail(base) {
      let out = base;
      for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
        out = hop.liveOptional
          ? t.optionalMemberExpression(out, t.identifier(hop.name), false, true)
          : t.memberExpression(out, t.identifier(hop.name));
        // the render already decided this hop's fate; re-entering the traversal it would look
        // like a fresh redundant hop and collapse against a receiver the plan never chose
        renderedPlanTails.add(out);
      }
      return out;
    }
    function keptPrefix(node) {
      return navGuardTestNode(node, null, plan);
    }
    if (plan.kind === 'nested') {
      return t.conditionalExpression(
        t.binaryExpression('==', t.nullLiteral(), keptPrefix(plan.hops[plan.lastUnresolvableIdx].node)),
        t.unaryExpression('void', t.numericLiteral(0)), withTail(leaf),
      );
    }
    if (plan.kind === 'sequence') {
      const rootValue = keptPrefix(plan.rootValueNode);
      const parts = keySeExprs.length ? [rootValue, ...keySeExprs, t.cloneNode(pureId)]
        : [rootValue, t.cloneNode(pureId)];
      return withTail(t.sequenceExpression(parts));
    }
    return withTail(leaf);
  }

  // node-level twin of `collapseProvenNavPath` for channels that hold a NODE, not a path (the
  // static claim's guard test): a kept chain-assign VALUE collapses in place by mutating the
  // assignment's right slot - the node is live in the tree, so the spelling lands in the test
  // KEPT chain-assign values only: bare / call-rooted shapes collapse through the claim +
  // guard channels (with the stronger static-in-branch substitution). the plan resolves NOW
  // (live scopes), but the right-slot mutation DEFERS to program exit: an early rewrite hid
  // the member chain from every claim resolver still due to visit it (`(n = X)?.Array.of(...)`
  // lost its static claim), while the assignment node itself stays live through any memoize,
  // so the deferred mutation lands in whatever emit captured it
  function collapseKeptNavValueNode(rootNode, anchorPath) {
    const adapter = getAdapter?.();
    // the whole resolver-option family or nothing: this one omitted `injectPureGlobal` while
    // calling it at the tail, so a harness wired with only some of them would TypeError there
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return;
    const plan = planProvenNavGuardCollapse({
      rootNode, scope: anchorPath.scope, adapter, path: anchorPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, anchorPath),
    });
    if (!plan?.topAssign) return;
    const { leafPure: pure } = plan;
    // snapshot a render source NOW (pre-lowering) by deep-cloning it: the flush lands at program
    // exit, AFTER the optional-chain lowering pass visited the tree, so a LIVE node reference may
    // by then have been moved into the lowering's own memo and the render would strand a dangling
    // `_refN`. the snapshot does NOT drop optionals - only the VESTIGIAL ones die, at render time,
    // in the kept-prefix / guard-test spelling; a load-bearing `?.` survives into the emitted node
    // and relies on the flush re-queueing it (`replaceWith`) so the ES5 lowering still sees it.
    // call ARGUMENTS stay untouched - user optionals inside them lower normally in place. null
    // when the spine holds a `?.()` (it may be conditionally proven - a REAL short-circuit the
    // plan may not flush-render; the raw memo fallback stays faithful)
    function snapshotNavRenderNode(node) {
      if (!node) return node;
      for (let spine = node; spine;) {
        switch (spine.type) {
          case 'OptionalMemberExpression':
          case 'MemberExpression':
            spine = spine.object;
            break;
          case 'OptionalCallExpression':
            return null;
          case 'CallExpression':
            spine = spine.callee;
            break;
          default:
            spine = null;
        }
      }
      return t.cloneNode(node, true);
    }
    if (plan.kind === 'nested') {
      const hop = plan.hops[plan.lastUnresolvableIdx];
      const testNode = snapshotNavRenderNode(hop.node);
      if (!testNode) return;
      plan.hops[plan.lastUnresolvableIdx] = { ...hop, node: testNode };
    } else if (plan.kind === 'sequence') {
      const rootValue = snapshotNavRenderNode(plan.rootValueNode);
      if (!rootValue) return;
      plan.rootValueNode = rootValue;
    }
    plan.keySeExprs = plan.keySeExprs.map(se => t.cloneNode(se, true));
    pendingKeptNavCollapses.push({ plan, pureId: injectPureGlobal(pure.entry, pure.hintName) });
  }

  // a CLAIM-LESS kept nav whose VALUE can short-circuit, in a chain-END value-use position
  // (`globalThis.window?.[(c++, 'self')]?.Array` as a class-field / export init): no claim
  // channel owns it and the hop collapse refuses the erase - but leaving it RAW reads the
  // polyfillable hop key raw off a defined receiver (`window['self']`, undefined on the
  // web.self target class where the ponyfill must serve it). render the shared kept-nav plan
  // in place: guard on the probe, key SE migrated once, ponyfill leaf. immediate (not the
  // deferred flush): the chain-end gate means no later claim resolver reads this chain, and
  // the replacement re-enters traversal so the root substitutes and the ES5 lowering sees it
  function collapseShortCircuitNavInPlace(memberPath) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return false;
    const parent = memberPath.parentPath;
    // a MEMBER consumer means this is not the chain end (the caller climbs there); a CALL
    // consumer is fine - claims over the chain ran before the drive (they sit above the root
    // in traversal order), so a surviving call tail is claimless and rides the chain's own
    // short-circuit outside the render
    if ((parent?.isMemberExpression() || parent?.isOptionalMemberExpression())
      && parent.node.object === memberPath.node) return false;
    // a chain-END member that is ITSELF a pristine proxy hop (`navAlias = globalThis.window
    // ?.self.window` - the nav extends into the end member) belongs to the alias / kept canons
    if (memberProxyHopName(memberPath.node)) return false;
    // TS wrappers on the object erase in the render (`nav!.X`, `(nav as any).X`); the seal
    // distinction lives in the MEMBER's own node type - a paren boundary parses the member
    // above it PLAIN, and the plain/optional render split keeps the source semantics
    function peelWrapperNodes(node) {
      let cur = node;
      while (cur && TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
      return cur;
    }
    function planFor(rawObject) {
      const navNode = peelWrapperNodes(rawObject);
      if (navNode?.type !== 'MemberExpression' && navNode?.type !== 'OptionalMemberExpression') return null;
      const plan = planProvenNavGuardCollapse({
        rootNode: navNode, scope: memberPath.scope, adapter, path: memberPath,
        resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath),
      });
      return plan && !plan.topAssign && plan.kind === 'nested' ? plan : null;
    }

    // hops the plan does NOT cover (a non-proxy name - `...?.self?.chrome`) read off the value
    // the render produces. while that value is provably defined they belong INSIDE the guarded
    // alternate (`null == test ? void 0 : _self.chrome`, the text emitter's shape): hung off
    // the ternary instead, each one needs a `?.` the ES5 lowering then has to memoize. the
    // FIRST hop reads the always-defined ponyfill leaf, so it pulls in whatever its own
    // spelling; past it the value can be absent, so only PLAIN hops keep pulling and the first
    // live `?.` stays outside, where the ternary's own short-circuit already covers it.
    // gated on a nested plan with no tail of its own (a planned tail can be absent - the hop
    // above it genuinely guards) and on chain membership (a SEALED member keeps its throw)
    function pullUnplannedTail(pullFrom, plan, rendered) {
      if (plan.kind !== 'nested') return false;
      // collect the chain steps leaf-outwards, then let the shared rule say how many ride inside
      const paths = [];
      for (let hop = pullFrom; hop?.node;) {
        // a hop the guard channel already lifted into a ternary alternate answers from its OLD
        // slot: the node moved without a path replace, so the cached path has no container left.
        // the chain ends there - the lifted spelling owns everything above it
        if (!hop.container) break;
        const isCall = hop.isOptionalCallExpression() || hop.isCallExpression();
        if (!isCall && !hop.isOptionalMemberExpression()) break;
        if (isCall && hop.node.callee !== paths.at(-1)?.node) break;
        // PARENS between the callee and its call keep the chain's REFERENCE (`(w?.self.fn)()`
        // still binds `this`), while ending the short-circuit: folding either the call or the
        // member it reads leaves the callee with a bare value. hand the whole tail back to the
        // lifted spelling, which preserves both
        if (isCall && hop.node.callee.extra?.parenthesized) return false;
        paths.push(hop);
        const up = hop.parentPath;
        hop = up?.node && (up.node.object === hop.node || up.node.callee === hop.node) ? up : null;
      }
      // no `foreign` step here: the AST emitter re-queues what it pulls, so a claim inside the
      // tail still gets its own rewrite (the text emitter cannot, and gates on it instead)
      const steps = paths.map(path => ({
        optional: !!path.node.optional,
        isCall: path.isOptionalCallExpression() || path.isCallExpression(),
        // no key gate here: a computed key - opaque or effect-bearing - evaluates INSIDE the
        // alternate exactly where the source evaluates it, and the shared `allPlain` rule
        // already keeps an optional step over an absent-able value outside the fold
      }));
      const definedAtLeaf = plan.hops.length === plan.collapseIdx + 1;
      let taken = guardTailPullCount(steps, definedAtLeaf);
      // `delete` needs the MEMBER itself, not its value: pulled into the alternate the ternary
      // evaluates and deletes nothing, and a tail left outside reads off the guard's `void 0`.
      // hand the WHOLE chain back to the lifted spelling, where the `?.` re-creates the source
      // short-circuit (`delete` on a short-circuited chain is a no-op `true`).
      // (`new` reads only the VALUE, so it pulls freely)
      for (let step = paths.at(-1)?.parentPath; step?.node; step = step.parentPath) {
        if (TS_EXPR_WRAPPERS.has(step.node.type)) continue;
        if (step.isUnaryExpression({ operator: 'delete' })) taken = 0;
        if (!step.isOptionalMemberExpression() && !step.isMemberExpression()
          && !step.isOptionalCallExpression() && !step.isCallExpression()) break;
      }
      // a TAGGED template reads its tag as a REFERENCE (`(w?.self.tag)`x`` binds `this`), so a
      // folded tail hands it a bare value - the receiver is lost exactly as under a
      // parenthesized callee. leave the whole tail outside and PLAIN: the source parens ended
      // the chain, so the read off `void 0` throws exactly where the source does
      if (paths.some(path => path.parentPath?.isTaggedTemplateExpression())) {
        taggedTemplateTails.add(paths[0].node);
        return false;
      }
      if (!taken) return false;
      // whatever stays outside reads off the guard value - lift it so the short-circuit holds
      const outside = paths[taken];
      if (outside?.isOptionalMemberExpression() && !outside.node.optional) outside.node.optional = true;
      let value = rendered.alternate;
      // once a step carries a live `?.` every step above it stays IN the chain: a plain member
      // there ends the chain (the printer parenthesizes it), so the source's short-circuit
      // would turn into a read off `undefined`
      let inChain = false;
      for (const [index, path] of paths.slice(0, taken).entries()) {
        // the FIRST step reads the always-defined leaf, so its `?.` is the vestigial one the
        // shared verdict drops; every later optional guards a value that can be absent
        const optional = !!path.node.optional && !(index === 0 && definedAtLeaf);
        if (steps[index].isCall) {
          // an OPTIONAL call keeps its `?.(` inside the alternate: hung off the ternary the
          // callee reads as a bare value and `this` binds to undefined where the source binds
          // the member it was read from
          const args = path.node.arguments.map(argument => t.cloneNode(argument));
          value = optional || inChain ? t.optionalCallExpression(value, args, optional) : t.callExpression(value, args);
        } else {
          const property = path.node.computed ? t.cloneNode(path.node.property) : t.identifier(path.node.property.name);
          value = optional || inChain
            ? t.optionalMemberExpression(value, property, path.node.computed, optional)
            : t.memberExpression(value, property, path.node.computed);
        }
        inChain ||= optional;
      }
      rendered.alternate = value;
      paths[taken - 1].replaceWith(rendered);
      return true;
    }

    // the chain end may sit several NON-proxy hops above the collapsible nav prefix
    // (`window?.self.Array.prototype.customX`): descend member-by-member until the object
    // is the pure proxy-nav - the render lands there, and the plain hops above ride the
    // chain's own short-circuit
    function peelWrappers(path) {
      let cur = path;
      while (cur && TS_EXPR_WRAPPERS.has(cur.node?.type)) cur = cur.get('expression');
      return cur;
    }
    let target = memberPath;
    let plan = planFor(target.node.object);
    while (!plan) {
      const objPath = peelWrappers(target.get('object'));
      if (!objPath?.isMemberExpression() && !objPath?.isOptionalMemberExpression()) return false;
      target = objPath;
      if (memberProxyHopName(target.node)) return false;
      plan = planFor(target.node.object);
    }
    const { leafPure: pure } = plan;
    const rendered = renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName));
    if (pullUnplannedTail(target, plan, rendered)) return true;
    // parens directly around the RENDERED nav end the chain there, so the read above them is the
    // source's own throw. parens further out (around a tagged template's whole tag) do not - the
    // short-circuit still reaches them, and a plain read would throw before the template's own
    // substitutions ever run
    const sealedObject = !!peelWrappers(target.get('object'))?.node?.extra?.parenthesized;
    target.get('object').replaceWith(rendered);
    // a PLAIN hop above the render would strand outside the guard as an unconditional read -
    // a throw on the very branch the guard proved absent, where the source short-circuits.
    // the ponyfill leaf is always defined, so lifting the hop to `?.` only re-creates the
    // source short-circuit. a SEALED member (plain MemberExpression over the paren boundary)
    // keeps the source's own throw semantics and stays plain
    if (target.isOptionalMemberExpression() && !target.node.optional
      && !(taggedTemplateTails.has(target.node) && sealedObject)) {
      target.node.optional = true;
      // a TAG that is an optional chain is a SyntaxError bare - the source's own parens are what
      // make it legal, and they must survive the lift (the printer re-derives parens from
      // precedence and drops the ones `extra.parenthesized` recorded)
      if (taggedTemplateTails.has(target.node)) reparenthesizeTaggedTag(t, target);
    }
    return true;
  }

  // guard-value render of a bare undefinable probe nav (`globalThis.window?.self` and its
  // sealed spelling) as a NODE: the shared plan's 'nested' collapse (`null == _globalThis
  // .window ? void 0 : _self`), for channels re-emitting a discarded probed nav - the
  // anchored destructure residual base. null when the plan does not resolve this shape
  // (no ponyfillable leaf / assign-wrapped / SE hop key) - callers keep their defined-nav
  // renders there
  function probedNavGuardValueNode(rootNode, anchorPath) {
    const adapter = getAdapter?.();
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const plan = planProvenNavGuardCollapse({
      rootNode, scope: anchorPath.scope, adapter, path: anchorPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, anchorPath),
    });
    if (!plan || plan.topAssign || plan.kind !== 'nested' || plan.keySeExprs.length) return null;
    const { leafPure: pure } = plan;
    // CLONE the guard-test prefix and PRE-substitute its proxy root: the caller discards
    // (skip-seeds) the original init subtree and may insert this render only at program
    // exit, so neither the live node nor the clone ever meets the natural identifier
    // rewrite - a raw `globalThis` would ride into the test (ie11 ReferenceError). an
    // ALIAS root is the user's own binding and stays verbatim
    const hop = plan.hops[plan.lastUnresolvableIdx];
    const cloned = t.cloneNode(hop.node, true);
    for (let spine = cloned; spine?.type === 'MemberExpression' || spine?.type === 'OptionalMemberExpression';) {
      let obj = spine.object;
      while (obj && TS_EXPR_WRAPPERS.has(obj.type)) obj = obj.expression;
      if (obj?.type === 'Identifier') {
        const rootPure = POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? resolvePureGlobalEntry(obj.name, anchorPath) : null;
        if (rootPure) spine.object = t.cloneNode(injectPureGlobal(rootPure.entry, rootPure.hintName));
        break;
      }
      spine = obj;
    }
    plan.hops[plan.lastUnresolvableIdx] = { ...hop, node: cloned };
    // the render runs an effect-bearing CALL root exactly once inside the test - report it
    // so destructure replay channels filter it out instead of re-running it
    return { node: renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName)), rootEffectCall: plan.rootEffectCall ?? null };
  }

  // a RECEIVERLESS static erase over a SEALED probe nav loses the read the source performs
  // on the sealed VALUE (`(globalThis.window?.self.window).Array.of(6)` - an absent `window`
  // throws at `.Array` where the erased claim just runs). build that read back as a THROW
  // PROBE the erase re-emits ahead of the claim: the sealed value renders through the shared
  // guard plan (probe test, ponyfill leaf), the member key re-spells the source read. an
  // SE-bearing computed key stays with its own migration canon (a re-read would double its
  // effect), and a defined sealed value (all-plain nav) has no throw to reproduce - both bail
  function sealedClaimThrowProbeNode(memberPath, probeNode = null) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const boundary = sealedChainBoundary(probeNode ?? memberPath.node);
    if (!boundary) return null;
    const key = memberKeyName(boundary.member);
    if (key === null) return null;
    const aliasCtx = { scope: memberPath.scope, adapter, path: memberPath };
    if (!proxyReceiverValueCanBeUndefined(boundary.inner,
      ({ name }) => resolvePureGlobalEntry(name, memberPath), aliasCtx)) return null;
    const plan = planProvenNavGuardCollapse({
      rootNode: boundary.inner, scope: memberPath.scope, adapter, path: memberPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath),
    });
    if (!plan || plan.topAssign || plan.kind !== 'nested') return null;
    const { leafPure: pure } = plan;
    const rendered = renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName));
    // the probe CARRIES the nav's key SE (native order: test, key effect, read) - hand the
    // plan's SE nodes back so the claim's own SE channel does not re-run them
    return {
      // the guard test runs an effect-bearing CALL root exactly once - carry it like a key
      // SE so every consumer's identity filter keeps other channels from re-running it
      keySeExprs: plan.rootEffectCall ? [...plan.keySeExprs, plan.rootEffectCall] : plan.keySeExprs,
      node: boundary.member.computed
        ? t.memberExpression(rendered, t.stringLiteral(key), true)
        : t.memberExpression(rendered, t.identifier(key)),
    };
  }

  // flush THIS assignment's kept nav-collapse at its own EXIT: every claim resolver over the
  // chain ran during the subtree traversal (the reason the rewrite is deferred at all), and
  // `replaceWith` REQUEUES the render, so every remaining merged pass - the ES5 lowerings
  // included - still visits what it carries. nothing is ever inserted behind the lowering's
  // back (a Program-exit slot mutation froze an unlowered arrow from a kept call argument
  // into the ie11 output)
  function flushKeptNavCollapseAt(assignPath) {
    for (let i = 0; i < pendingKeptNavCollapses.length; i++) {
      const { plan, pureId } = pendingKeptNavCollapses[i];
      if (plan.topAssign !== assignPath.node) continue;
      pendingKeptNavCollapses.splice(i, 1);
      assignPath.get('right').replaceWith(renderNavCollapseAst(plan, pureId));
      return;
    }
  }

  // Program-exit backstop for a host whose exit hook never fired (a drain-cloned subtree
  // re-planned outside the main walk); the in-tree hosts all flushed at their own exit
  function flushKeptNavCollapses() {
    for (const { plan, pureId } of pendingKeptNavCollapses) {
      plan.topAssign.right = renderNavCollapseAst(plan, pureId);
    }
    pendingKeptNavCollapses.length = 0;
  }

  // a guard target that is PURE PROXY NAVIGATION over a chain-assign root: the memo must
  // bind the ROOT (the assignment result - the one value that can be undefined), not the hop
  // nav. memoizing the nav lets the natural rewrite self-collapse the memo RHS into an
  // always-defined ponyfill (`(n = w, _self)`) - the guard then never fires (silent wrong
  // value, worse than the sealed throw). the hops re-hang RAW off the ref and their `?.`
  // folds into the root guard - the proxy-collapse assumption (`self` is a realm-local
  // self-reference), the text emitter's canon for the same shape. returns the check or null
  // when the target is not this shape (caller falls back to the plain memoize)
  function memoizeProxyNavRoot(navNode, scope, ownerNode, anchorPath = null) {
    const adapter = getAdapter?.();
    if (!adapter || !scope) return null;
    if (navNode.type !== 'MemberExpression' && navNode.type !== 'OptionalMemberExpression') return null;
    // `anchorPath` feeds the alias-aware walk: an ALIAS chain-assign value (`const w = globalThis
    // .window; (a = w)?...`) resolves only through a path-anchored binding lookup - with a null
    // path the prefix test misses the alias shape and the kept-swap plan drops the root guard
    if (maximalProxyGlobalPrefix(navNode, { scope, adapter, path: anchorPath },
      { allowSideEffectKeys: true, throughChainAssign: true }) !== navNode) return null;
    // the hop fold holds only while the hops are ALWAYS DEFINED (a realm self-reference, a
    // ponyfilled forwarder). an UNRESOLVABLE hop is the environment probe itself - the one
    // value the guard exists for - so folding it out of the test leaves an always-defined
    // root under the null-check and runs the branch where the source short-circuits. keep
    // the whole nav in the memo there (the caller's plain memoize), like the text emitter
    if (resolvePureGlobalEntry && navHasUnresolvableProxyHop(navNode,
      ({ name }) => resolvePureGlobalEntry(name, anchorPath))) return null;
    // descend the object spine to the root (the maximal-prefix check proved pure-nav shape);
    // `holder` keeps the member whose object slot receives the ref - a transparent wrapper
    // between it and the root is dropped with the swap (the same tradeoff as the optional
    // method-call rewrite)
    const spine = [];
    let holder = null;
    let root = navNode;
    while (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression') {
      spine.push(root);
      holder = root;
      root = root.object;
      while (root && SKIPPABLE_WRAPPER_TYPES.has(root.type)) root = root.expression;
    }
    // a SEQUENCE root (`(sc++, n = gw)`) memoizes WHOLE - its prefix SE then runs exactly
    // once inside the memo, the text emitter's canon; the assign is its tail
    if (peelReceiverSequenceTail(root)?.type !== 'AssignmentExpression') return null;
    // memoize the holder's OBJECT (wrappers included): a transparent wrapper between the last
    // hop and the root rides INSIDE the memo (`_ref = (v = gw) as any`) - the text emitter
    // keeps it verbatim there, and dropping it desynced the spelling. the shape gates above
    // ran on the PEELED root, so the wrapped memo target is the same value
    const [check, ref] = memoize(holder.object, scope, ownerNode);
    holder.object = t.cloneNode(ref);
    // node-level deoptionalize (the spine holds raw nodes, not paths): the hops ride the
    // root guard now, and a member spine never carries optional CALLS (pure-nav shape).
    // the rebuilt nav re-enters detection naturally: a mutated-landing guard-ref nav is
    // kept raw by the drive-site gate, a resolvable one collapses as usual
    for (const hop of spine) {
      hop.type = 'MemberExpression';
      delete hop.optional;
    }
    return check;
  }

  function extractCheck(path, skipOptional) {
    // a KEPT guard memo whose RHS is a SE-harvested SEQUENCE misses the natural proxy-root
    // rewrite (the harvest re-emit skips the original subtree) - a raw `globalThis` rides
    // into the emitted test (ie11 ReferenceError). substitute the seq tail's nav ROOT
    // identifier in place (the standdown-root canon; plain navs keep the natural rewrite)
    function substituteKeptSeqProbeRoot(navNode, anchorPath) {
      if (!anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return;
      let core = peelChainAssignment(navNode).value ?? navNode;
      while (core && SKIPPABLE_WRAPPER_TYPES.has(core.type)) core = core.expression;
      if (core?.type !== 'SequenceExpression' || core.expressions.length < 2) return;
      let root = core.expressions[core.expressions.length - 1];
      while (root && (SKIPPABLE_WRAPPER_TYPES.has(root.type)
        || root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression')) {
        root = SKIPPABLE_WRAPPER_TYPES.has(root.type) ? root.expression : root.object;
      }
      if (root?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(root.name)
        || anchorPath.scope.hasBinding(root.name, true)) return;
      const pure = resolvePureGlobalEntry(root.name, anchorPath);
      if (pure) root.name = injectPureGlobal(pure.entry, pure.hintName).name;
    }
    const { node } = path;
    if (node.optional) {
      // pass `path` as third arg so `skipPolyfillableOptional` can anchor TS-runtime
      // shadow detection at the reference site (path-aware `adapter.hasBinding`)
      if (skipOptional?.(node, path.scope, path)) return [null, node.object, false];
      collapseKeptNavValueNode(node.object, path);
      const navCheck = memoizeProxyNavRoot(node.object, path.scope, node, path);
      if (navCheck) return [navCheck, node.object, false];
      const [memoCheck, memoRef] = memoize(node.object, path.scope, node);
      // a proven-nav memo RHS renders through the shared kept-nav plan (the memo assignment IS
      // the topAssign shape): the raw spelling would read `.self` off a defined receiver where
      // the ponyfill must back the read - the deferred flush swaps in the nested test. a nav
      // carrying its OWN chain-assign already planned through the entry call above - planning
      // the memo assign too would render over the user's write (the peel sees through both)
      if (!peelChainAssignment(node.object).outer) collapseKeptNavValueNode(memoCheck, path);
      substituteKeptSeqProbeRoot(node.object, path);
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
      collapseKeptNavValueNode(chainStart.node[key], chainStart);
      const memoType = pathType(chainStart.get(key));
      check = rewriteOptionalMethodCall(chainStart, key, path.scope, memoType);
      if (check === null) check = memoizeProxyNavRoot(chainStart.node[key], path.scope, chainStart.node, chainStart);
      if (check === null) {
        let ref;
        const rootNode = chainStart.node[key];
        [check, ref] = memoize(rootNode, path.scope, chainStart.node);
        chainStart.node[key] = seededRefClone(ref, memoType);
        tagProxyGlobalMemoRef(ref, rootNode, path.scope);
        // proven-nav memo RHS: render the nested test via the shared kept-nav plan (see the
        // optional-node arm above) instead of keeping the raw `.self`-reading spelling; an
        // own-chain-assign nav is owned by the entry call's plan
        if (!peelChainAssignment(rootNode).outer) collapseKeptNavValueNode(check, chainStart);
        substituteKeptSeqProbeRoot(rootNode, chainStart);
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
    // user parens around the replaced expression terminate an optional chain (native throws
    // past them where the chain would short-circuit) - the paren info dies with the replaced
    // node, so record it on the replacement: the erase-refusal's guard climb must NOT hoist
    // a guard past this boundary (it would swallow the user-visible throw)
    if (isWrappedInParens(replacePath)) parenTerminated.add(result);
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
      // optional CALL) leaves a trailing chain continuation (`...?.().next()` / `...?.().length`)
      // as an in-chain OptionalMember/Call straight from the parse - it must STAY optional to
      // short-circuit with the new `?.`. normalizeOptionalChain would deoptionalize the trailing
      // to a PLAIN member, and babel codegen then parenthesizes the optional result off it
      // (`(_X?.call(recv)).next()`), severing the trailing from the chain so it throws on the
      // short-circuit path where native yields void 0 (matches unplugin once skipped)
      if (result.type === 'OptionalCallExpression') {
        if (check) {
          // a receiver-level guard must wrap the whole SURVIVING chain: climb the NON-optional
          // in-chain continuations (`.x` / `[k]` / a call pairing with the climbed member) and
          // put the ternary around the tip, leaving the trailing links optional-typed inside it
          // so the live `?.` still short-circuits past them. a genuine `?.x` continuation
          // re-guards the ternary RESULT and stays outside; parens / casts end the chain at
          // parse, so the climb stops there and their native throw-past-boundary survives
          let tip = replacePath;
          for (;;) {
            const par = tip.parentPath;
            if ((par?.isOptionalMemberExpression() && !par.node.optional && par.node.object === tip.node)
              || (par?.isOptionalCallExpression() && par.node.callee === tip.node)) {
              tip = par;
              continue;
            }
            break;
          }
          tip.replaceWith(wrapConditional(check, tip.node));
          return;
        }
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
      if (check) {
        wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
      }
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
    if (!sideEffects?.length) return result;
    // marked so the erase-refusal's guard climb can lift THROUGH a plugin-built SE wrap (its
    // leading memo assign + harvested key SE legally move into the guard's non-null branch);
    // a user-written sequence must never lift
    const seq = t.sequenceExpression([...sideEffects.map(e => t.cloneNode(e)), result]);
    pluginSeqWraps.add(seq);
    return seq;
  }

  // SE-receiver + key-SE reorder guard: a non-optional (`check` null) side-effecting receiver memo
  // would otherwise be built INSIDE the body, after the prepended key SE, running the key before
  // the receiver. memoize the receiver and prepend its assignment to the SE list so it evaluates
  // first (native order). returns `[receiverNode, sideEffects]` - the receiver ref to emit and the
  // reordered SE list. no-op for optional (receiver already memoized in the guard) / SE-free receivers
  function hoistReceiverSE(object, sideEffects, check, scope, seMode, receiverEffectCount = 0, anchorHostPath = null) {
    // skip the peel case: there the receiver-SE is already replayed in the SE list, and `object`
    // is the peeled tail - hoisting it would reorder the peeled prefix vs the tail (matches the
    // unplugin `seMode !== 'peel'` gate). a CHECK skips the hoist only when receiver-borne SE
    // exists (the guard's own memoize replays it); a KEY-only SE list still hoists - the
    // receiver must evaluate BEFORE the key effects, like native member-call evaluation order
    // optional guard with a side-effecting receiver: the guard's `null == (_ref = receiver) ? ...`
    // memoize already RAN the receiver-SE, so the body wrap must carry ONLY the key-SE. `suppress`
    // (optional MEMBER access) already reduced `sideEffects` to key-SE upstream, so pass it through;
    // otherwise the receiver-SE is still present (a deeper `?.` left `.X` non-optional, so suppress
    // missed it) and must be dropped here - else a chain-root call `(call)?.self.X` double-runs
    if (check && receiverEffectCount > 0) {
      return [object, seMode === 'suppress' ? sideEffects : keySideEffectsOnly(receiverEffectCount, sideEffects)];
    }
    if (seMode === 'peel' || !sideEffects?.length) return [object, sideEffects];
    // a receiver whose EVALUATION may throw (its member get reads off a nullish-able probe
    // value) hoists like a side-effecting one: the plain SE prepend would run the key effect
    // on the branch where native throws before it (ECMA receiver-before-key). probed only once
    // the cheap bails are past - it resolves aliases through the provider canon
    function receiverMayThrow() {
      const adapter = getAdapter?.();
      return !!adapter && !!scope && !!resolvePureGlobalEntry && !!anchorHostPath
        && claimReceiverEvaluationMayThrow(object,
          ({ name }) => resolvePureGlobalEntry(name, anchorHostPath), { scope, adapter, path: anchorHostPath });
    }
    // ECMA evaluates the receiver BEFORE the key, and a member GET runs user code whenever the
    // property is an accessor - so the plain side-effect answer is not enough to leave the receiver
    // in place. that is exactly the superset `reEvaluationObservable` already computes
    if (!reEvaluationObservable(object) && !receiverMayThrow()) return [object, sideEffects];
    const [memoAssign, ref] = memoize(object, scope);
    // the memo `_ref = object` already evaluates the receiver's OWN side effects (a buried chain-root call
    // or hop-key SE the resolver also listed lives inside `object`), so re-emitting the receiver-SE prefix
    // would double-run it. append only the KEY SE (past receiverEffectCount); the memo owns the receiver SE
    return [ref, [memoAssign, ...sideEffects.slice(receiverEffectCount)]];
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
      // null, ...)` defense in `replaceAndWrap`.
      // when a nullish guard IS present, the receiver-derived SE (e.g. a computed key) must fire
      // only on the non-null branch - native short-circuits `?.` before evaluating the key. fold
      // the SE INTO the conditional alternate (`check==null ? void 0 : (SE, lookup)`); prepending
      // it to the whole result would fire it even on the short-circuit. no guard -> SE stays outside
      const wrappedCallee = check ? wrapConditional(check, withSideEffects(lookup, effectiveSE)) : lookup;
      const callArgs = [t.cloneNode(objRef), ...parent.arguments.map(a => t.cloneNode(a))];
      const result = t.callExpression(t.memberExpression(wrappedCallee, t.identifier('call')), callArgs);
      callerPath.parentPath.replaceWith(check ? result : withSideEffects(result, effectiveSE));
      return;
    }
    // a receiver already rendered as a plugin-minted guarded claim keeps its short-circuit
    // OUTSIDE the wrapper, and any key SE INSIDE the guard's non-null branch (native evaluates
    // a computed key only when the chain does not short-circuit). detected BEFORE the SE hoist:
    // the hoist would memoize the whole ternary and run the SE unconditionally, handing the
    // memoized `void 0` to the helper - a throw exactly where native short-circuits
    // hoist only over a DIRECT un-wrapped receiver: a TS cast / user parens between the claim
    // and this wrapper terminate the chain (native throws there), so the guard stays inside
    const rawObject = path.node.object;
    const guardedRecv = !check && guardedClaims.has(object) && !parenTerminated.has(object)
      && rawObject === object && !rawObject?.extra?.parenthesized ? object : null;
    const [recvNode, hoistedSE] = guardedRecv
      ? [guardedRecv.alternate, null]
      : hoistReceiverSE(object, effectiveSE, check, path.scope, seMode, receiverEffectCount, path);
    const built = isCall
      ? buildMethodCall({
        id, object: recvNode, scope: path.scope, args: parent.arguments, optionalCall: parent.optional, anchorNode: parent,
      })
      : t.callExpression(id, [t.cloneNode(recvNode)]);
    const result = guardedRecv
      ? markGuardedClaim(t.conditionalExpression(guardedRecv.test, guardedRecv.consequent, withSideEffects(built, effectiveSE)))
      : built;
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
      if (!effectiveSE?.length) {
        callerPath.parentPath.replaceWith(t.callExpression(id, [t.cloneNode(path.node.object)]));
        return;
      }
      // the receiver is optional (parens terminate the `?.`), so the receiver-derived SE (a computed
      // key) must fire only when the receiver is non-null - native short-circuits before evaluating
      // it. guard the SE behind the receiver's nullishness (the polyfill still throws on null);
      // prepending it to the whole call would fire it on the short-circuit too
      const [memoAssign, memoRef] = memoize(path.node.object, path.scope);
      const guardedSE = wrapConditional(memoAssign,
        withSideEffects(t.unaryExpression('void', t.numericLiteral(0)), effectiveSE));
      callerPath.parentPath.replaceWith(
        t.sequenceExpression([guardedSE, t.callExpression(id, [t.cloneNode(memoRef)])]),
      );
      return;
    }
    const [check, object, embed] = extractCheck(path, skipOptional);
    const [recvNode, hoistedSE] = hoistReceiverSE(object, effectiveSE, check, path.scope, seMode, receiverEffectCount, path);
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

  function nullTest(expr) {
    return t.binaryExpression('==', t.nullLiteral(), expr);
  }
  function assignTo(ref, value) {
    return t.assignmentExpression('=', t.cloneNode(ref), value);
  }

  function replaceInstanceChainCombined(outerPath, outerId, { innerCallee, innerArgs, innerId, chainStartNode, hasHops, sideEffects }) {
    const callerPath = unwrapTSExpressionParent(outerPath);
    const outerCall = callerPath.parent;
    const { scope } = outerPath;

    // a receiver carrying a LIVE `?.` short-circuits the WHOLE chain natively, so it must be
    // TESTED before the (nullish-intolerant) maybe-helper reads its member - the same shape an
    // optional method access already produces. a receiver WITHOUT one keeps the testless form:
    // `arr.flat?.()` must throw on the `.flat` read like native
    const receiverShortCircuits = receiverCarriesLiveOptional(innerCallee.object);
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
    const testsReceiver = innerCallee.optional || receiverShortCircuits;
    const methodGet = t.callExpression(t.cloneNode(innerId),
      [testsReceiver ? t.cloneNode(aRef) : anAssign]);
    const tests = testsReceiver
      ? [nullTest(anAssign), nullTest(assignTo(mRef, methodGet))]
      : [nullTest(assignTo(mRef, methodGet))];
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
      tests.push(nullTest(assignTo(vRef, outerObject)));
      outerObject = t.cloneNode(vRef);
    }
    const testOr = tests.reduce((a, b) => t.logicalExpression('||', a, b));

    // outer-key computed SE (e.g. `arr?.at?.(0)?.[(fn(), 'map')](x => x)`) attaches to
    // `meta.sideEffects` during detection. fold it into the alternate (not around the whole
    // conditional) so it fires only when the chain does NOT short-circuit - native skips the
    // computed-key eval on a nullish receiver; prepending it would run `fn()` unconditionally
    // ECMA evaluates the receiver before the computed key: hoist the threaded receiver's memo
    // AHEAD of the folded key SE and dispatch on the ref (the optional-outer path already
    // memoized into the test's vRef, so the hoist no-ops there on a pure identifier)
    const [outerRecv, foldedSE] = hoistReceiverSE(outerObject, sideEffects, null, scope);
    const replacement = withSideEffects(buildMethodCall({
      id: outerId, object: outerRecv, scope, args: outerCall.arguments, optionalCall: outerCall.optional,
      anchorNode: outerPath.node,
    }), foldedSE);
    // trailing NON-optional in-chain continuations (`...flat?.()?.at(0).length`) ride the
    // SUCCESS branch: native short-circuit skips them, while links left outside would apply
    // to the ternary result and throw on the void 0 path where native yields undefined. a
    // surviving optional continuation (`?.x`) guards the ternary RESULT and stays outside;
    // parens / casts end the chain at parse (plain Member parent), so the climb stops there
    // and their native throw-past-boundary semantics survive
    let tipPath = callerPath.parentPath;
    for (;;) {
      const par = tipPath.parentPath;
      // a CALL continuation climbs even when ITS `?.(` is genuine: the call pairs with the
      // climbed member callee (severing them would strand `this` / sever later links), and
      // inside the alternate its own `?.` still short-circuits the rest of the chain
      if ((par?.isOptionalMemberExpression() && !par.node.optional && par.node.object === tipPath.node)
        || (par?.isOptionalCallExpression() && par.node.callee === tipPath.node)) {
        tipPath = par;
        continue;
      }
      break;
    }
    let alternate = replacement;
    if (tipPath.node !== outerCall) {
      alternate = spliceChainInner(tipPath.node, outerCall, replacement);
      // over a PLAIN dispatch root the spliced trailing links are DEAD Optional*-typed -
      // retype them plain, else babel codegen parenthesizes the chain boundary. over a LIVE
      // `?.call` root (optional outer call) they stay Optional*: they are genuine chain
      // members and the retype would sever them from the short-circuit
      if (replacement.type !== 'OptionalCallExpression') {
        for (let link = alternate; link && link !== replacement; link = link.object ?? link.callee) {
          if (link.type === 'OptionalMemberExpression') link.type = 'MemberExpression';
          else if (link.type === 'OptionalCallExpression') link.type = 'CallExpression';
          else break;
          delete link.optional;
        }
      }
    }
    const conditional = t.conditionalExpression(testOr,
      t.unaryExpression('void', t.numericLiteral(0)), alternate);
    // chained outer calls read the hint off the result node; relocate the pre-combine
    // `annotateCallReturnType` stamp onto the wrapping conditional so they still resolve.
    // the stamp is placed by the visitor's own `annotateCallReturnType` on the CALL node - the
    // fixture corpus happens not to reach a combined chain whose result is read again, which is
    // why the unit suite carries the case instead
    const outerCallType = resolvedType?.get(outerCall);
    if (outerCallType) resolvedType.set(conditional, outerCallType);
    tipPath.replaceWith(conditional);
  }

  return {
    isInTypeAnnotation,
    deoptionalizeNode,
    emitGuardedClaim,
    navGuardTestNode,
    isRenderedPlanTail: node => renderedPlanTails.has(node),
    collapseShortCircuitNavInPlace,
    probedNavGuardValueNode,
    sealedClaimThrowProbeNode,
    flushKeptNavCollapseAt,
    flushKeptNavCollapses,
    markThrowingExtraction,
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
