// polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
// instance-method member-call rewrites (with optional-chain handling, Symbol.iterator special
// path, receiver-polyfill substitution, chain composition), global / static member rewrites
// (shorthand / export / super-call / TS-wrapper / optional-chain deoptimization), and `in`
// expression rewrites (Symbol.X / generic key probe -> `true`). factory captures closure deps
// from the outer transform context (code / scopeTracker / transforms / injector / Sets /
// resolver hooks).
import {
  isReusableReceiver,
  mayHaveSideEffects,
  peelMemoizeWrappers,
  peelNestedSequenceExpressions,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { planInExpression } from '@core-js/polyfill-provider/helpers/in-expression';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { POSSIBLE_GLOBAL_OBJECTS } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  resolveKey,
  resolveObjectName,
  classifyReceiverSE,
  findProxyGlobal,
  keySideEffectsOnly,
  peelChainAssignment,
  peelReceiverSequenceTail,
  prependChainAssignmentEffect,
  receiverSideEffectsOnly,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { resolveSymbolIteratorEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { createRewriteHint, deoptionalizeNeedleAtPositions } from './transform-queue.js';
import {
  isCallee,
  isCalleeWrappedInParens,
  unwrapNode,
} from './emit-utils.js';
import { skipGap, walkAstNodes } from './plugin-helpers.js';

// true when the chain from `outerObject` down to `innerCall` is made of plain (non-call)
// member hops only - the `.x.y[0]` between an optional call and the outer member in
// `recv.m?.().x.y[0].at(0)`. such a tail is pure source text with no nested transform, so it
// can be spliced verbatim onto the `_ref.call(recv)` body. a call hop (`.foo()`) could itself
// be polyfilled and would queue its own overlapping transform, so those bail
function isPlainMemberHopChain(outerObject, innerCall) {
  let cur = outerObject;
  while (cur && cur !== innerCall) {
    if (cur.type !== 'MemberExpression' && cur.type !== 'OptionalMemberExpression') return false;
    cur = cur.object;
  }
  return cur === innerCall;
}

// the polyfill fallback for a static-context `super.X` resolving to an inherited STATIC, or null.
// resolvers are injected (they close over the per-file injector); module-level so the emitter
// factory stays under its statement budget
function inheritedStaticFallback(superCalleePath, methodName, resolveStaticInherited, resolveFallback) {
  const meta = resolveStaticInherited(superCalleePath, methodName);
  return meta ? resolveFallback(meta, superCalleePath).result : null;
}

// rebuild a substituted SE-tail receiver: the verbatim leading effects, then an already-injected pure
// binding, parenthesized so the sequence still evaluates left-to-right. the caller injects (and so may
// rebind the tail to a deeper static), keeping a discarded alternative from registering a dead import
function buildSeTailSrc(prefixSrcs, pureBinding) {
  return `(${ [...prefixSrcs, pureBinding].join(', ') })`;
}

// find the hop of a proxy-global member chain that names a real polyfillable global static, so the
// whole `<forwarder-chain>.Static` prefix collapses to the static's pure ctor in one step
// (`globalThis.self.Map` -> `_Map`, not the inner `_self.Map`). `resolveObjectName` is the canonical
// name resolver - it bottoms a hop's receiver out on a proxy-global root and follows aliases/computed
// keys, so the OUTERMOST hop it resolves to a polyfillable global is that prefix. returns
// `{ staticHop, staticPure, staticIdx }` or null. module-level so the emitter factory stays in budget
function findProxyGlobalStaticHop(hops, ctx, resolveGlobalPolyfill) {
  for (let i = 0; i < hops.length; i++) {
    const name = resolveObjectName({ objectNode: hops[i], ...ctx });
    const staticPure = name && resolveGlobalPolyfill(name);
    if (staticPure) return { staticHop: hops[i], staticPure, staticIdx: i };
  }
  return null;
}

export function createPolyfillEmitter({
  canFuseWithOpenParen,
  code,
  estreeAdapter,
  injectPureImport,
  isEntryNeeded,
  isInStaticContext,
  NEEDS_GUARD_PARENS,
  enclosingExpressionStatementPath,
  isBodylessStatementBody,
  resolveGlobalPolyfill,
  resolvePureOrGlobalFallback,
  resolveStaticInheritedMember,
  scopeTracker,
  skippedNodes,
  transforms,
}) {
  // bare-Identifier shape (`globalThis`, `_Promise`, `$X`); excludes member chains, parens,
  // operators. used to gate guard emission - bare-Identifier roots use `X == null`, anything
  // else captures into a `_ref` first to avoid double-evaluating side effects
  const BARE_IDENTIFIER_REGEX = /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u;

  function isBareIdentifier(src) {
    return typeof src === 'string' && BARE_IDENTIFIER_REGEX.test(src);
  }

  function nodeSrc(n) {
    return code.slice(n.start, n.end);
  }

  // wrap a polyfill binding in a source-level SequenceExpression carrying any side
  // effects collected from the receiver / computed-key. noop when empty - callers can
  // invoke unconditionally. mirrors `withSideEffects` in babel-plugin, text-based
  function wrapSideEffects(binding, sideEffects, leadingMemo = null) {
    // leadingMemo (`_ref = recv`) is emitted BEFORE the key side effects so a side-effecting
    // receiver evaluates ahead of the key, matching native order
    const parts = leadingMemo ? [leadingMemo] : [];
    if (sideEffects?.length) for (const e of sideEffects) parts.push(nodeSrc(e));
    return parts.length ? `(${ parts.join(', ') }, ${ binding })` : binding;
  }

  // leading `, ...` separator for trailing call args - empty when there are none, so it appends
  // straight after a receiver (`.call(recv${ commaArgs(args) })`)
  function commaArgs(args) {
    return args ? `, ${ args }` : '';
  }

  // a `(`-leading replacement at a statement-leading slot can fuse with the previous
  // line into a call (`a\n(...)` -> `a(...)`); inject `;` only when all conditions hit.
  // an unbraced control body (`if (x) (...)`) is excluded: there the leading `(` can't fuse
  // with the control header, and a prepended `;` would empty the body - hoisting the
  // polyfilled call out of the conditional / loop to run unconditionally
  function asiGuardLeadingParen(replacement, metaPath, start) {
    if (replacement[0] !== '(') return replacement;
    const stmtPath = enclosingExpressionStatementPath(metaPath);
    if (stmtPath?.node?.start !== start || isBodylessStatementBody(stmtPath)) return replacement;
    return canFuseWithOpenParen(code, start) ? `;${ replacement }` : replacement;
  }

  // source of `node` with its outer `ParenthesizedExpression` wrapper dropped - except
  // when the inner is a `SequenceExpression` (dropping the parens changes semantics)
  function unwrapParensSrc(node) {
    return nodeSrc(node.type === 'ParenthesizedExpression'
      && node.expression.type !== 'SequenceExpression' ? node.expression : node);
  }

  // strip `?.` at known absolute positions within a source slice - the same operation the
  // compose layer applies to a needle, so reuse its single implementation
  const stripOptionalDots = deoptionalizeNeedleAtPositions;

  // single descent step through chain shapes: MemberExpression.object / CallExpression.callee /
  // TS expression wrapper unwrap. used by all chain-walking helpers (findChainRoot,
  // hasOptionalChainSegment) so the descent contract stays in one place
  function chainChild(n) {
    return n.object || n.callee || (TS_EXPR_WRAPPERS.has(n.type) ? n.expression : null);
  }

  // detect any optional segment inside a chain. complementary to `findChainRoot` (which
  // also finds non-polyfillable roots); this is a bare predicate for "is this node a
  // continuation of an optional chain". necessary because ESTree continuation members
  // carry `optional=false` even inside an optional chain (only the optional-introducing
  // segment itself flags `optional=true`)
  function hasOptionalChainSegment(node) {
    let cur = chainChild(node);
    while (cur && typeof cur === 'object') {
      if (cur.optional) return true;
      cur = chainChild(cur);
    }
    return false;
  }

  // `(arr?.member)()` shape: a paren-wrapped optional member as callee of a NON-optional outer
  // call. parens terminate the optional chain, so a nullish receiver must throw at the call
  // rather than short-circuit to void 0. `node.optional || hasOptionalChainSegment` catches
  // both the introducing `?.` and a mid-chain one (`(a?.b.member)()`). shared by
  // `replaceInstance` (.call shape) and `handleSymbolIterator` (bare get-iterator shape)
  function isParenLookupOnlyCall(node, parent) {
    return isCallee(node, parent) && isCalleeWrappedInParens(parent, node)
      && (node.optional || hasOptionalChainSegment(node)) && !parent.optional;
  }

  // walk the chain to find the first non-polyfillable optional, skipping TS wrappers
  function findChainRoot(node, scope, metaPath) {
    function makeResult(optionalNode) {
      const rootNode = optionalNode.object || optionalNode.callee;
      const deoptPositions = [];
      let cur = chainChild(node);
      while (cur && typeof cur === 'object') {
        if (cur.optional) {
          const pos = cur.object?.end ?? cur.callee?.end;
          if (pos !== undefined) deoptPositions.push(pos);
        }
        if (cur === optionalNode) break;
        cur = chainChild(cur);
      }
      return { root: unwrapParensSrc(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode, optionalNode };
    }

    function isPoly(n) {
      // when the optional's polyfillable static / global is always defined post-rewrite the `?.`
      // is dead, so the root deopts (root:null) rather than emitting a guard over the bare callee
      // that overlaps the static visitor's `?.`-inclusive rewrite range and trips the "could not
      // locate inner needle" composition invariant (`isPolyfillableOptional` unwraps a call callee)
      // `metaPath` (the trailing instance member's path) anchors super/this-static resolution: it
      // shares the enclosing static method + scope with the optional `super.X` callee, and the key is
      // read off the callee node, so an explicit-key resolve recognizes `super.from?.()` as deoptable
      return isPolyfillableOptional({
        node: n, scope, adapter: estreeAdapter, resolve: resolveBuiltIn,
        path: metaPath, resolveSuperStatic: resolveStaticInheritedMember,
      });
    }

    let current = node.optional ? node : chainChild(node);
    while (current && typeof current === 'object') {
      if (current.optional) {
        return isPoly(current) ? { root: null } : makeResult(current);
      }
      current = chainChild(current);
    }
    return { root: null };
  }

  // build the emit recipe for an optional method call (`recv.m?.()`), or null when this isn't one.
  // when the optional node is the call and the guarded root is its member callee, memoizing the
  // callee into `_ref` and emitting `_ref()` would invoke with `this === undefined`; the body must
  // route through `_ref.call(recv)`. recv is bound to `this` for `super`, re-read for a safe
  // receiver, and memoized first when side-effecting (its ref precedes the method ref, matching
  // babel). `methodTail` keeps any inner `?.` for short-circuit
  function resolveMethodCall({ optionalRoot, optionalNode, rootNode, outerObject, deoptPositions, metaPath }) {
    if (!optionalRoot || !optionalNode
      || (optionalNode.type !== 'CallExpression' && optionalNode.type !== 'OptionalCallExpression')) return null;
    // peel transparent wrappers (parens, chain, TS as/!/satisfies) off the callee so a wrapped
    // method `(obj.m as any)?.()` is still recognized as a method call - `methodSrc`/`methodTail`
    // come from the peeled member, so the type-only wrapper drops out and babel/unplugin agree
    let callee = rootNode;
    while (callee && (callee.type === 'ParenthesizedExpression' || callee.type === 'ChainExpression'
      || TS_EXPR_WRAPPERS.has(callee.type))) callee = callee.expression;
    if (callee?.type !== 'MemberExpression' && callee?.type !== 'OptionalMemberExpression') return null;
    // a side-effecting computed key (`arr[(eff(), 'flat')]`) makes a polyfilled callee compose
    // into the call BODY (so the key's SE rides along) instead of the guard slot; rewriting the
    // body to `_ref.call(recv)` would strand that composition. leave such callees on the default
    // path - the inner `?.call(recv)` from that composition already preserves `this`. peel the
    // parser-preserved paren wrapper (oxc keeps `(...)`, babel strips it) before the SE check
    let keyNode = callee.computed ? callee.property : null;
    while (keyNode?.type === 'ParenthesizedExpression') keyNode = keyNode.expression;
    if (keyNode?.type === 'SequenceExpression') return null;
    const receiverNode = callee.object;
    const isSuper = receiverNode.type === 'Super';
    const receiverSafe = receiverNode.type === 'Identifier' || receiverNode.type === 'ThisExpression';
    // intermediate plain-member hops between the optional call and the outer member
    // (`recv.m?.().x.at(0)` - the `.x`): the methodCall body collapses to `_ref.call(recv)`, which
    // would otherwise drop the tail and read the polyfill off the bare call result. splice the
    // deoptionalized source tail back on, only for a pure member chain with no nested transform
    // queued in it (a call hop is left to the combined-chain path)
    const tail = outerObject && outerObject !== optionalNode && outerObject.end > optionalNode.end
      && isPlainMemberHopChain(outerObject, optionalNode)
      && !transforms.hasTransformWithin(optionalNode.end, outerObject.end)
      ? stripOptionalDots(code.slice(optionalNode.end, outerObject.end), optionalNode.end, deoptPositions)
      : '';
    // a polyfillable-global receiver (`Promise.m?.()`) must substitute to its pure binding in the
    // `this`-arg too, matching the natural visitor's substitution of the guarded receiver - else
    // `.call(Promise)` references the raw global and ReferenceErrors on engines without it. a
    // user-bound or non-global receiver keeps its verbatim source (resolveReceiverPolyfill returns
    // null for a shadowed name). only the reuse path needs this; the recvRef memo path is not safe
    const directPolyfill = receiverSafe && !isSuper ? resolveReceiverPolyfill(receiverNode, metaPath) : null;
    return {
      isSuper,
      receiverSafe,
      recvRef: !isSuper && !receiverSafe ? scopeTracker.genRef() : null,
      receiverText: directPolyfill
        ? injectPureImport(directPolyfill.entry, directPolyfill.hintName)
        : nodeSrc(receiverNode),
      methodSrc: nodeSrc(callee),
      methodTail: code.slice(receiverNode.end, callee.end),
      argsText: sliceBetweenParens(optionalNode),
      tail,
    };
  }

  // allocate a `_ref` memoization slot for the call's receiver when bodyObj is non-trivial
  // and not already a guard-allocated ref. returns the receiver text for both the
  // memoize-and-pass site (`firstArg`) and the reuse site (`obj`). bare Identifiers and
  // pre-allocated guardRef bypass allocation - text is reused verbatim. shared between
  // standard and parenLookupOnly emit paths so `_ref` policy stays in one place
  function allocCallObj(bodyObj, isNonIdent, guardRef) {
    const needsRef = isNonIdent && bodyObj !== guardRef;
    const ref = needsRef ? scopeTracker.genRef() : null;
    return {
      obj: ref || bodyObj,
      firstArg: ref ? `${ ref } = ${ bodyObj }` : bodyObj,
    };
  }

  // dispatch classifier for `buildReplacement` - selects body-builder strategy by emit shape.
  // mutually-exclusive ladder (isNew -> bareMember -> parenLookup -> call); `call` is the
  // default for `obj.method(args)` instance-call shape
  function classifyEmitStrategy(opts) {
    if (opts.isNew) return 'new';
    if (!opts.isCall) return 'bareMember';
    if (opts.parenLookupOnly) return 'parenLookup';
    return 'call';
  }

  // shared `.call(this, args)` shape components for `parenLookup` / `call` strategies:
  // `firstArg` is the polyfill's first arg slot (memoized to `_ref = bodyObj` when
  // chain receiver isn't a bare ident); `obj` is the `this` slot (reuses memoized ref
  // when allocated). `argsPart` is the leading `, ...args` separator handled here so
  // empty / non-empty cases don't litter the strategy emit
  function buildCallParts({ bodyObj, isNonIdent, guardRef, args }) {
    const { obj, firstArg } = allocCallObj(bodyObj, isNonIdent, guardRef);
    const argsPart = commaArgs(args);
    return { obj, firstArg, argsPart };
  }

  // per-strategy body builders. each receives the resolved `ctx` (opts + computed `bodyObj`
  // / `guard` / `guardRef`) and returns `{ body, clearGuard?, split? }`:
  //   - `clearGuard: true` signals the outer concat must drop `guard` (NewExpression and
  //     parenLookup already absorbed it into their own emit slot)
  //   - `split: { prefix, suffix }` enables compose-time inner-chain substitution; only
  //     `call` strategy with no guard / no SE-prefix can support it (other strategies
  //     interleave content that breaks substring boundaries)
  const BODY_STRATEGIES = {
    new: ({ binding, bodyObj, guard, args }) => ({
      // NewExpression with optional inner: babel-plugin's `normalizeOptionalChain` lifts
      // the conditional guard into the new's callee slot (`new (CONDITIONAL)(args)`), not
      // around the whole expression. inject guard inside the `new (...)` callee bracket
      // so shape matches babel - and compose's rootRaw substitution lands at the right slot
      body: `new (${ guard }${ binding }(${ bodyObj }))(${ args || '' })`,
      clearGuard: true,
    }),
    bareMember: ({ binding, bodyObj }) => ({
      body: `${ binding }(${ bodyObj })`,
    }),
    parenLookup: ({ binding, bodyObj, isNonIdent, guardRef, guard, args }) => {
      // `(arr?.method)(args)`: parens preserve Reference Type so native binds `this=arr` on
      // success; on nullish the outer non-optional call throws (chain ends at `?.`). emit
      // `(arr == null ? void 0 : binding(_ref = arr.b)).call(_ref, args)`:
      //   - `(undefined).call(...)` throws on nullish (matches native throw semantics)
      //   - success path preserves `this` via memoized ref
      //   - bodyObj evaluated ONCE (deep-chain `arr.b` would re-eval in outer .call otherwise)
      // bare receiver `arr` and pre-allocated guardRef cases skip memoize - already trivially safe
      const { obj, firstArg, argsPart } = buildCallParts({ bodyObj, isNonIdent, guardRef, args });
      return {
        body: `(${ guard }${ binding }(${ firstArg })).call(${ obj }${ argsPart })`,
        clearGuard: true,
      };
    },
    call: ({ binding, bodyObj, isNonIdent, guardRef, optionalCall, args, guard, sideEffects }) => {
      const { obj, firstArg, argsPart } = buildCallParts({ bodyObj, isNonIdent, guardRef, args });
      const dot = optionalCall ? '?.' : '.';
      const prefix = `${ binding }(${ firstArg })`;
      const suffix = `${ dot }call(${ obj }${ argsPart })`;
      return {
        body: `${ prefix }${ suffix }`,
        split: !guard && !sideEffects?.length ? { prefix, suffix } : null,
      };
    },
  };

  // build the replacement text for an instance method or Symbol.iterator transform.
  // splits into (a) guard-computation prologue + (b) strategy-dispatched body builder +
  // (c) final guard/SE wrap. strategy registry isolates the 4 emit shapes
  // re-anchor the body chain on `guardRef` after the optional-root capture in guard text.
  // three cases, in priority order:
  //   1. `substituted && rootIsReceiver`: bodyObj IS the substituted root (no tail) -
  //      collapse to bare `guardRef`. slicing by raw rootRaw length leaves a substring
  //      tail (`_globalThis.foo`.slice(`globalThis.foo`.length) = `o` -> `_refo`)
  //   2. `substituted` with rootNode deeper than receiver (`(globalThis?.X)?.Y.flat?.()`):
  //      raw rootRaw length drifts from substituted prefix length by the binding-name
  //      delta, so bodyObj-slice corrupts the tail. pull the tail straight from source
  //      (rebuild path emits property names verbatim, so source-tail is the right text)
  //   3. neither - bodyObj is source-aligned, slice by raw rootRaw length works
  function rebindBodyOnGuard({ bodyObj, guardRef, rootRaw, substituted, rootIsReceiver,
    rootNodeEnd, receiverEnd, deoptPositions, objectStart }) {
    if (substituted && rootIsReceiver) return guardRef;
    if (substituted && rootNodeEnd !== undefined && receiverEnd !== undefined) {
      return guardRef + stripOptionalDots(code.slice(rootNodeEnd, receiverEnd), rootNodeEnd, deoptPositions);
    }
    return guardRef + bodyObj.slice(stripOptionalDots(rootRaw, objectStart ?? 0, deoptPositions).length);
  }

  function buildReplacement(binding, objectSrc, opts) {
    const { optionalRoot, rootRaw, deoptPositions, objectStart, preAllocatedGuardRef,
      substituted, rootIsReceiver, sideEffects, rootNodeEnd, receiverEnd, methodCall,
      isNonIdent, seMode, receiverHasSE } = opts;

    let bodyObj = deoptPositions?.length ? stripOptionalDots(objectSrc, objectStart ?? 0, deoptPositions) : objectSrc;
    let guard = '';
    let guardRef = null;
    // hoist a side-effecting, non-peeled receiver memo ahead of the key SE so it evaluates first
    let leadingMemo = null;
    let bodyIsNonIdent = isNonIdent;
    if (!optionalRoot && seMode !== 'peel' && sideEffects?.length && bodyIsNonIdent && receiverHasSE) {
      const recvRef = scopeTracker.genRef();
      leadingMemo = `${ recvRef } = ${ bodyObj }`;
      bodyObj = recvRef;
      bodyIsNonIdent = false;
    }

    if (optionalRoot) {
      if (isBareIdentifier(optionalRoot)) {
        guard = `${ optionalRoot } == null ? void 0 : `;
      } else if (methodCall) {
        guardRef = preAllocatedGuardRef ?? scopeTracker.genRef();
        const callReceiver = methodCall.isSuper ? 'this'
          : methodCall.receiverSafe ? methodCall.receiverText : methodCall.recvRef;
        guard = methodCall.recvRef
          // side-effecting receiver: memoize it first, then read the method off the memo so the
          // receiver evaluates exactly once (the tail keeps any inner `?.` for short-circuit)
          ? `null == (${ methodCall.recvRef } = ${ methodCall.receiverText }, ${ guardRef } = ${ methodCall.recvRef }${ methodCall.methodTail }) ? void 0 : `
          // `methodSrc` is the peeled member (drops any TS/paren wrapper), so a wrapped callee
          // `(obj.m as any)?.()` memoizes the bare method - matching babel
          : `null == (${ guardRef } = ${ methodCall.methodSrc }) ? void 0 : `;
        // splice the intermediate plain-member hop tail (`.x.y`) back onto the call result so
        // the outer polyfill reads off the right value instead of the bare call return
        bodyObj = `${ guardRef }.call(${ callReceiver }${ commaArgs(methodCall.argsText) })${ methodCall.tail ?? '' }`;
      } else {
        guardRef = preAllocatedGuardRef ?? scopeTracker.genRef();
        guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
        bodyObj = rebindBodyOnGuard({
          bodyObj, guardRef, rootRaw, substituted, rootIsReceiver,
          rootNodeEnd, receiverEnd, deoptPositions, objectStart,
        });
      }
    }

    const ctx = { ...opts, isNonIdent: bodyIsNonIdent, binding, bodyObj, guard, guardRef };
    const { body, clearGuard = false, split = null } = BODY_STRATEGIES[classifyEmitStrategy(opts)](ctx);
    if (clearGuard) guard = '';

    return {
      replacement: `${ guard }${ wrapSideEffects(body, sideEffects, leadingMemo) }`,
      split,
    };
  }

  // position past optional `?.` token after pos, skipping whitespace and comments
  function afterOptional(pos, keepDot) {
    const p = skipGap(code, pos);
    return code[p] === '?' && code[p + 1] === '.' ? (keepDot ? p + 1 : p + 2) : pos;
  }

  function skipProxyGlobal(node) {
    const proxy = findProxyGlobal(node);
    if (proxy) skippedNodes.add(proxy);
  }

  // mark a node and its transparent wrappers (parens, ChainExpression, TS wrappers) as skipped
  function skipWrappedNode(node) {
    let cur = node;
    while (cur) {
      skippedNodes.add(cur);
      if (cur.type === 'ParenthesizedExpression' || cur.type === 'ChainExpression'
          || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
      else break;
    }
  }

  // resolve optional root + skip redundant guard when nested inside an outer transform
  function resolveOptionalRoot({ node, parent, isCall, scope, metaPath }) {
    let { root, rootRaw, deoptPositions, rootNode, optionalNode } = findChainRoot(node, scope, metaPath);
    if (root) {
      const start = isCall ? parent.start : node.start;
      const end = isCall ? parent.end : node.end;
      if (transforms.hasGuardFor(start, end, rootNode)) root = null;
    }
    return { optionalRoot: root, rootRaw, deoptPositions, rootNode, optionalNode };
  }

  // slice the original source between a call expression's parentheses, preserving every byte
  function sliceBetweenParens(callNode) {
    if (callNode.callee?.end === undefined || callNode.end === undefined) return null;
    const closeParen = callNode.end - 1;
    if (code[closeParen] !== ')') return null;
    const afterCallee = callNode.typeArguments?.end ?? callNode.callee.end;
    const openParen = skipGap(code, afterOptional(afterCallee, false));
    if (code[openParen] !== '(') return null;
    return code.slice(openParen + 1, closeParen);
  }

  // does guard ternary need () to preserve correct precedence?
  // walks past `ChainExpression` (transparent) and `TS_EXPR_WRAPPERS` (`as` / `satisfies`
  // / `!` / parens) to find the semantic outer context. four wrap-triggering conditions:
  //   1. crossed a TS wrapper AND chain was terminated (different / no enclosing
  //      ChainExpression vs metaPath's) - TS suffix binds tighter than `?:`, so without
  //      parens `cond ? a : b as T` would apply the wrapper to the falsy branch only.
  //      same-chain skip: `arr?.b!.m()` keeps `.m()` inside the chain, wrapping would
  //      prematurely terminate it
  //   2. outer parent (after walk-past) needs guard parens by precedence table
  //      (binary / logical / unary / etc.) - listed in `NEEDS_GUARD_PARENS`
  //   3. outer is a ConditionalExpression test slot - parens isolate the ternary from
  //      the surrounding `?:`
  //   4. source has `?.` continuation right after the replaced span - parens prevent
  //      runaway chain extension into the replacement
  // returns { needsParens, tipEnd }. the four documented cases wrap just the transformed span
  // [start, end]; a FIFTH case (the gap they miss) handles a TERMINAL non-optional member / call
  // tail the guard ternary spans (`a?.at(-1).x ** 2`) sitting beneath an OPERATOR - the wrap must
  // reach `tipEnd` (the tail's end) so the operator binds the whole guarded value, not just the tail
  function resolveGuardWrap({ metaPath, isCall, start, end }) {
    let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
    let throughTS = false;
    while (outer?.node && (outer.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(outer.node.type))) {
      if (TS_EXPR_WRAPPERS.has(outer.node.type)) throughTS = true;
      outer = outer.parentPath;
    }
    if ((throughTS && !sharesChainExpression(metaPath, outer))
      || NEEDS_GUARD_PARENS.has(outer?.node?.type)
      || (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end)) {
      return { needsParens: true, tipEnd: end };
    }
    const p = skipGap(code, end);
    if (code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end)) {
      return { needsParens: true, tipEnd: end };
    }
    // fifth case: step past Chain / TS wrappers AND member / call tails sharing the chain start
    // (the guarded ternary spans them - the trailing `.x` sits UNDER its ChainExpression, so the
    // walk above stops short of the operator), tracking the tail tip. a NON-optional tail extends
    // `tipEnd` (the wrap reaches over it). a SURVIVING optional continuation (`?.y`) keeps its own
    // short-circuit guard and stays OUTSIDE the parens (matching babel's `(guard.x)?.y` shape), so
    // peel past it WITHOUT extending `tipEnd` and keep climbing to find the real operator parent
    let tipEnd = end;
    let chainEnd = end;
    while (outer?.node) {
      const tn = outer.node.type;
      if (tn === 'ChainExpression' || TS_EXPR_WRAPPERS.has(tn)) {
        outer = outer.parentPath;
        continue;
      }
      if ((tn === 'MemberExpression' || tn === 'CallExpression') && outer.node.start === start) {
        // only a non-optional tail is absorbed into the wrap (`tipEnd`); the surviving optional
        // continuation is left verbatim after the closing paren, so its end must not move `tipEnd`.
        // `chainEnd` tracks the FULL guarded chain end (incl. the surviving optional) so the
        // ConditionalExpression-test check below recognises the chain when an optional suffix
        // extends the test past `tipEnd`
        if (!outer.node.optional && outer.node.end > tipEnd) tipEnd = outer.node.end;
        if (outer.node.end > chainEnd) chainEnd = outer.node.end;
        outer = outer.parentPath;
        continue;
      }
      break;
    }
    // past the tail, the real parent needs grouping by the SAME rules as the four cases above, now
    // measured at `tipEnd`: an operator (NEEDS_GUARD_PARENS) OR a ConditionalExpression whose test is
    // the whole guarded chain (`a?.at(-1).x ? 1 : 2` -> `(guard) ? 1 : 2`, else the `? :` binds to the
    // success branch only; the test ends at `chainEnd`, which trails `tipEnd` when an optional `?.y`
    // continuation survives). throughTS / `?.`-continuation stay anchored at `end` (handled above) -
    // a trailing tail never introduces those
    if (tipEnd > end && (NEEDS_GUARD_PARENS.has(outer?.node?.type)
      || (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === chainEnd))) {
      return { needsParens: true, tipEnd };
    }
    return { needsParens: false, tipEnd: end };
  }

  // splice a guard ternary into its paren wrap, extending over a trailing source tail (`.x` / `[k]`)
  // when one pushes the chain past the transformed span so a parent operator binds the whole guarded
  // value (`(a?.at(-1).x) ** 2`, not `a?.at(-1).x ** 2`). returns the [possibly extended] emit end;
  // a tail carrying its own nested transforms falls back to the plain wrap (range stays [.., end])
  function wrapGuardOverTail(replacement, start, end, tipEnd) {
    if (tipEnd > end && !transforms.hasTransformWithin(end, tipEnd)) {
      return { replacement: `(${ replacement }${ code.slice(end, tipEnd) })`, end: tipEnd };
    }
    return { replacement: `(${ replacement })`, end };
  }

  // two paths share a ChainExpression iff their closest enclosing ChainExpression
  // ancestor is the SAME AST node. used to decide whether a TS-wrapper crossing breaks
  // the optional-chain semantics or sits within it. paren-terminated chains have no
  // enclosing ChainExpression on the outer side; multi-chain shapes (`(... as T)?.b`)
  // have different ChainExpression ancestors for inner and outer
  function sharesChainExpression(a, b) {
    const chainA = findEnclosingChainExpression(a);
    return chainA !== null && chainA === findEnclosingChainExpression(b);
  }

  // walk up the ancestry looking for the closest enclosing `ChainExpression` AST node.
  // returns the node (not the path) for identity comparison via `sharesChainExpression`
  function findEnclosingChainExpression(path) {
    let cur = path?.parentPath;
    while (cur?.node) {
      if (cur.node.type === 'ChainExpression') return cur.node;
      cur = cur.parentPath;
    }
    return null;
  }

  // SequenceExpression-receiver double-emit guard. `classifyReceiverSE` (shared with
  // babel-compat) decides between `peel` + prepend (non-optional) and `suppress` (SE folded
  // into the memoize for the optional case). it detects SE through transparent wrappers so
  // oxc's ParenthesizedExpression(SE) shape resolves identically to babel's bare SE.
  // `node.object?.type === 'ChainExpression'` is defensive for non-oxc AST shapes - oxc-parser
  // never emits a ChainExpression in receiver position (it inlines optional markers), but
  // estree-style trees do; the check stays for parser-agnostic robustness.
  //
  // `peel` applies to the bare (`binding(receiver)`) shape too: the resolver collects the
  // receiver's own SE into `sideEffects` ordered before the computed-key SE (see members.js),
  // so peeling the receiver to its SE tail and re-supplying the whole prefix via the prepended
  // SequenceExpression keeps `(a(), arr)[Symbol[(b(), 'iterator')]]()` -> `(a(), b(),
  // _getIterator(arr))` in source eval order rather than duplicating / reordering the receiver SE
  function resolveReceiverSeMode({ node, sideEffects }) {
    // member-access optionality ONLY (mirror babel-compat's `classifyReceiverSE` call): a
    // non-optional access under an optional CALL (`(a(), arr)[(k(), 'flat')]?.()`) must still
    // 'peel' and prepend the FULL ordered receiver-then-key SE list. folding the parent call's
    // `?.` in here flipped it to 'suppress', emitting the key SE ahead of the receiver SE (`k, a`
    // instead of native `a, k`)
    const isOptional = node.optional || node.object?.type === 'ChainExpression';
    return classifyReceiverSE(node.object, isOptional, sideEffects);
  }

  // build replacement, wrap guard if needed, add to transform queue
  function addInstanceTransform({
    binding, node, parent, metaPath, isCall, replacementIsCall = isCall,
    sideEffects = null, receiverEffectCount = 0, parenLookupOnly = false,
  }) {
    const seMode = resolveReceiverSeMode({ node, sideEffects });
    // `peel` (non-optional): peel the receiver to its SE tail; the prepended SequenceExpression
    // replays the full receiver-SE + key-SE the resolver collected. `suppress` (optional): leave
    // the receiver intact - its SE runs inside the null-guard memoize (`_ref = recv`) - and fold
    // only the trailing key-SE into the guard's alternate (`null == (_ref = recv) ? void 0 :
    // (keySE, body)`), so the memoized receiver-SE isn't emitted twice
    const receiverObj = seMode === 'peel' ? peelReceiverSequenceTail(node.object) : node.object;
    if (seMode === 'suppress') sideEffects = keySideEffectsOnly(receiverEffectCount, sideEffects);
    const recv = resolveReceiverSource(receiverObj, metaPath);
    let { src: objectSrc, isNonIdent } = recv;
    const { optionalRoot: resolvedRoot, rootRaw, deoptPositions, rootNode, optionalNode } = resolveOptionalRoot({
      node, parent, isCall, scope: metaPath?.scope, metaPath,
    });
    // bare paren-lookup (`(arr?.[Symbol.iterator])()` -> `_getIterator(arr)`): the receiver is
    // passed verbatim as the sole call arg, so BOTH the null-guard and the receiver's `?.`
    // deoptionalization must be dropped. the guard would swallow the throw into `void 0`; the
    // deopt would rewrite `x?.y` -> `x.y` and throw eagerly on null `x` instead of short-
    // circuiting to undefined like native (and babel emits `_getIterator(x?.y)`). only the
    // bare (non-`.call`) shape needs this - the instance-method `.call` paren-lookup absorbs
    // the guard into `(guard binding(_ref)).call(...)`, which still throws via the `.call`
    // access on `void 0`, so it keeps its root and deopt
    const bareParenLookup = parenLookupOnly && !replacementIsCall;
    let optionalRoot = bareParenLookup ? null : resolvedRoot;
    // resolved before the guard-root block so it can skip itself when the method-call branch owns the
    // guard (the block's collapse would be unused AND its `walkAstNodes` skip would strip the receiver
    // identifiers the method-call guard's natural-visitor substitution needs, e.g. a chain-assign root)
    const methodCall = resolveMethodCall({ optionalRoot, optionalNode, rootNode, outerObject: node.object, deoptPositions, metaPath });
    // proxy-global guard root: when the receiver path did NOT already substitute the leaf
    // (`recv.substituted` false - e.g. a CALL receiver `globalThis.list?.flat().m()` hides the
    // proxy-global below a call), the optionalRoot is raw source AND `skipProxyGlobal(node)` below
    // suppresses the Identifier visitor that would otherwise rewrite it - so the guard emits raw
    // `globalThis` and IE11 ReferenceErrors on the lookup. resolve the guard text through the
    // proxy-global resolver here (the body already binds the memoized `_ref`, and rootRaw stays raw
    // so the body-tail slice math against the raw receiver source still holds). SKIP for a method call
    // with a non-bare-Identifier root: the method-call branch rebuilds the guard from the receiver via
    // the natural visitor, so this value is unused and its skip would strip the receiver's identifiers
    if (optionalRoot && !recv.substituted && rootNode && !(methodCall && !isBareIdentifier(optionalRoot))) {
      const rootLeaf = unwrapNode(rootNode);
      const directRoot = rootLeaf?.type === 'Identifier' ? resolveReceiverPolyfill(rootLeaf, metaPath) : null;
      const chainRoot = directRoot ? null : resolveProxyGlobalChainSrc(rootNode, metaPath);
      if (directRoot) optionalRoot = injectPureImport(directRoot.entry, directRoot.hintName);
      else if (chainRoot) optionalRoot = chainRoot.src;
    }
    const effectiveDeopt = bareParenLookup ? null : deoptPositions;
    const rootIsReceiver = rootNode === node.object;
    const optionalRootCapturesIntoRef = optionalRoot && !isBareIdentifier(optionalRoot);
    const isProxyGlobalLeaf = recv.skipNode?.type === 'Identifier'
      && POSSIBLE_GLOBAL_OBJECTS.has(recv.skipNode.name);
    // proxy-global leaf in chain-receiver path with non-bare-Identifier optionalRoot: leave
    // the Identifier visitor live so its `globalThis?` -> `_globalThis` substitution composes
    // into the outer guard's rootRaw slot. resolver's POSSIBLE_GLOBAL_OBJECTS gate skips the
    // per-member fallback path for proxy globals (Promise/Map go through that path instead),
    // so without this leg the guard emits raw `globalThis?.foo` and IE11 ReferenceErrors on
    // the implicit lookup. all OTHER paths (non-proxy leaf, non-optional outer, bare-Identifier
    // optionalRoot) keep the skip - body uses `guardRef` directly (rootIsReceiver) or stitches
    // raw `code.slice(rootNode.end, receiver.end)` tail onto `guardRef` (mid-chain rootNode)
    // - both shapes never contain the substituted leaf, so compose's substring guard can't
    // double-match it (word-boundary rejection rules out `_globalThis` substring poisoning)
    const composeSafeForInnerLeaf = optionalRootCapturesIntoRef;
    if (recv.skipNode && !(isProxyGlobalLeaf && composeSafeForInnerLeaf)) {
      skippedNodes.add(recv.skipNode);
    }
    let reusedOuterRef = null;
    if (!optionalRoot && rootNode) {
      const outerRef = transforms.findOuterGuardRef(rootNode);
      if (outerRef) {
        if (rootIsReceiver) {
          // root IS the receiver: reuse the memoized ref verbatim (bare ident, no further memo)
          objectSrc = outerRef;
          isNonIdent = false;
        } else {
          // root is a strict sub-node of the receiver (`a.b?.c` hop with root `a.b`, or
          // `getO()?.p`): reuse the outer guard ref for the root and stitch the receiver tail so
          // this hop reads `_ref.c` instead of re-evaluating the raw root - the latter double-evals
          // a side-effecting root and reads through a now-nullish prefix. isNonIdent stays true so
          // the body memoizes the stitched `_ref.c` for its own `.call(...)` receiver
          objectSrc = outerRef + stripOptionalDots(
            code.slice(rootNode.end, node.object.end), rootNode.end, deoptPositions,
          );
        }
        reusedOuterRef = outerRef;
      }
    }
    const argsSrc = isCall ? sliceBetweenParens(parent) : null;
    const start = isCall ? parent.start : node.start;
    let end = isCall ? parent.end : node.end;
    const isNew = parent?.type === 'NewExpression';
    // `methodCall` (optional method call `recv.m?.()` - keep `this` via `_ref.call(recv)`) is resolved
    // earlier, above the proxy-global guard-root block, so the memoized receiver ref precedes the guard ref
    const preAllocatedGuardRef = optionalRootCapturesIntoRef ? scopeTracker.genRef() : null;

    const built = buildReplacement(binding, objectSrc, {
      isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions: effectiveDeopt,
      optionalCall: isCall && parent.optional, args: argsSrc,
      objectStart: node.object.start,
      preAllocatedGuardRef, sideEffects,
      // SE-receiver + key-SE reorder guard: when a side-effecting receiver is not peeled into the SE
      // list (a call receiver `getObj()[(k(), 'at')]()`), buildReplacement hoists its memo ahead of
      // the key SE so the receiver evaluates first (native order)
      seMode, receiverHasSE: mayHaveSideEffects(node.object),
      substituted: recv.substituted,
      // rootRaw spans the entire receiver iff `node` is itself optional (then findChainRoot
      // returns rootNode === node.object); guard text must come from the substituted bodyObj
      // in that case (see buildReplacement comment)
      rootIsReceiver,
      // rootNode.end + receiver.end let `buildReplacement` lift the receiver-tail straight
      // from source when `substituted` collapses bodyObj's prefix to a shorter polyfill
      // binding. source-slice math on rootRaw against substituted bodyObj otherwise drifts
      // by the binding-length delta and corrupts the tail (e.g. `.Y` -> `Y`)
      rootNodeEnd: rootNode?.end,
      receiverEnd: node.object.end,
      parenLookupOnly, methodCall,
    });
    let { replacement } = built;
    const { split } = built;
    if (optionalRoot) {
      const { needsParens, tipEnd } = resolveGuardWrap({ metaPath, isCall, start, end });
      if (needsParens) ({ replacement, end } = wrapGuardOverTail(replacement, start, end, tipEnd));
    }
    // ASI guard runs UNCONDITIONALLY for any `(`-leading replacement -- covers both the
    // optionalRoot-wrap above and the bare SE-wrap path (`(sideEffect, _at(obj).call(obj,
    // 0))` produced when computed-key carries SE, e.g. `arr[(bar(), 'at')](0)`). without
    // this, a replacement at statement-leading slot after an unterminated predecessor
    // would fuse into a call (`prev\n(SE,_at(obj).call(obj,0))` -> `prev(SE,...)`).
    // `asiGuardLeadingParen` is a no-op for non-`(`-leading replacements
    replacement = asiGuardLeadingParen(replacement, metaPath, start);
    const hint = createRewriteHint({
      rootRaw,
      guardRef: preAllocatedGuardRef ?? reusedOuterRef,
      deoptPositions: effectiveDeopt,
      objectStart: node.object.start,
      absorbsRoot: !!reusedOuterRef,
    });
    const splitPoint = node.object.end;
    const canSplit = split && !optionalRoot && !recv.substituted && !reusedOuterRef
      && !rootNode
      && splitPoint > start && splitPoint < end;
    if (canSplit) {
      transforms.addSplit(start, splitPoint, end, split.prefix, split.suffix, null, hint);
    } else {
      transforms.add(start, end, replacement, optionalRoot ? rootNode : null, hint);
    }
    if (isCall) skippedNodes.add(parent);
    // proxy-global leaves in chain-receiver path stay live - their identifier visitor
    // emits the substitution that compose folds into outer's rootRaw/guard slot. for
    // non-chain paths the chain.src embed already carries the substituted form so the
    // identifier visit would only queue a needle compose drops, but harmless to allow
    if (!recv.substituted) skipProxyGlobal(node);
  }

  function handleSymbolIterator({ node, parent, metaPath, sideEffects = null, receiverEffectCount = 0 }) {
    if (node.object?.type === 'Super') return;
    // computed key carrying a side effect (`obj[(fn(), Symbol.iterator)]`, nested sequences too):
    // meta.sideEffects already carries the prefix, so the getIterator / getIteratorMethod rewrite
    // preserves it as `(fn(), _getIterator(obj))`; a side-effecting receiver is hoisted ahead of the
    // key by addInstanceTransform so order holds. skip the SequenceExpression TAIL (the
    // Symbol.iterator member) below so it is not also polyfilled in place; the prefix expressions
    // stay visitable so a polyfillable call inside them is still rewritten
    const keyTail = node.computed ? peelNestedSequenceExpressions(node.property).tail : node.property;
    const isCallParent = isCallee(node, parent);
    // oxc has no OptionalCallExpression (optional calls are CallExpression + `optional`), and `new`
    // must not take the direct-iterator form - so the plain-call test is the dialect-specific input
    const entry = resolveSymbolIteratorEntry(node, parent, isCallParent && parent.type === 'CallExpression');
    if (!isEntryNeeded(entry)) return;
    const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
    // `(arr?.[Symbol.iterator])()`: parens terminate the chain, so native evaluates
    // `(undefined)()` on nullish receiver and throws TypeError. mark parenLookupOnly so the
    // bare `_getIterator(recv)` emit drops the `recv == null ? void 0 :` guard that would
    // otherwise swallow the throw into `void 0` - unlike the instance-method `.call` shape
    // there is no trailing `.call` to re-trigger it. restores the throw, not the exact error
    // (native `is not a function` vs polyfill `is not iterable`); exact-message parity would
    // lose the `this=recv` binding, so both-TypeError is the accepted tradeoff
    const parenLookupOnly = isParenLookupOnlyCall(node, parent);
    // `sideEffects` carries computed-key SE prefixes peeled by `resolveComputedSymbolKey`
    // (`recv[Symbol[(fn(), 'iterator')]]`). without the carry, the rewrite would discard the
    // whole `Symbol[...]` subtree and silently drop `fn()`. `addInstanceTransform` re-emits
    // via SequenceExpression wrap; outer paren and ASI guards already handle the wrap shape
    addInstanceTransform({
      binding, node, parent, metaPath, isCall: isCallParent,
      replacementIsCall: isCallParent && (parent.arguments.length > 0 || parent.optional),
      sideEffects, receiverEffectCount, parenLookupOnly,
    });
    if (keyTail) skipWrappedNode(keyTail);
  }

  // direct-Identifier polyfillable receiver (`Array.prototype.X`, `globalThis.foo` where
  // `globalThis` itself is the receiver). chain receivers (`globalThis?.X.Y`) go through
  // `resolveProxyGlobalChainSrc` instead. caller (`resolveReceiverSource`) peels wrappers
  // up-front so wrapped shapes (`(globalThis).flat?.()`) reach this entry as a bare Identifier
  function resolveReceiverPolyfill(obj, metaPath) {
    if (obj?.type !== 'Identifier') return null;
    if (metaPath?.scope?.hasBinding?.(obj.name)) return null;
    return resolveGlobalPolyfill(obj.name);
  }

  // single-level SE-tail proxy-global substitution, shared by the direct-SE receiver
  // (`(eff(), globalThis).flat()`) and the SE-rooted member chain (`(eff(), globalThis).list.at()`):
  // resolve the tail proxy-global to its pure meta, keeping the prefix verbatim ahead of it in eval
  // order. returns `{ leaf, prefixSrcs, pure }` (leaf = the tail Identifier to skip; pure = the tail's
  // polyfill meta, NOT yet injected - the caller may rebind to a deeper static and inject that instead)
  // or null. a non-Identifier tail (nested SE `(a, (b, X))`) returns null - it drops the inner effects
  function seTailProxyGlobalSubst(node, metaPath) {
    if (node?.type !== 'SequenceExpression' || !(node.expressions?.length >= 2)) return null;
    const leaf = unwrapNode(node.expressions.at(-1));
    if (leaf?.type !== 'Identifier' || metaPath?.scope?.hasBinding?.(leaf.name)) return null;
    const pure = resolveGlobalPolyfill(leaf.name);
    if (!pure) return null;
    return { leaf, pure, prefixSrcs: node.expressions.slice(0, -1).map(expr => nodeSrc(expr)) };
  }

  // member-chain receiver rooted at a polyfillable global Identifier (`globalThis?.X.Y`,
  // `(globalThis as any)?.X.Y`, `(globalThis?.X).Y`). substitute the leaf with its polyfill
  // binding so the receiver doesn't reference the raw global (engines without `globalThis`
  // ReferenceError on it). descends through transparent wrappers (Paren / TS) BOTH around
  // the leaf and mid-chain. bare-chain case uses original text-slice (preserves source
  // verbatim, cheap). wrapped case rebuilds chain inner-to-outer: drops wrapper boundaries
  // and collapses optional `?.` since the substituted leaf is always defined
  function resolveProxyGlobalChainSrc(receiverObj, metaPath) {
    if (receiverObj?.type !== 'MemberExpression' && receiverObj?.type !== 'OptionalMemberExpression') return null;
    const hops = [];
    let hasMidChainWrappers = false;
    let cur = receiverObj;
    while (cur && (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression')) {
      hops.push(cur);
      let next = cur.object;
      // peel transparent wrappers between hops: ParenthesizedExpression (oxc emits for `(...)`),
      // ChainExpression (oxc wraps the inside of a paren'd optional chain to scope the `?.`),
      // and TS expression wrappers (`as` / `satisfies` / `!`)
      while (next && (next.type === 'ParenthesizedExpression' || next.type === 'ChainExpression'
          || TS_EXPR_WRAPPERS.has(next.type))) {
        hasMidChainWrappers = true;
        next = next.expression;
      }
      cur = next;
    }
    const wrappedLeaf = hops.at(-1).object;
    const unwrappedLeaf = unwrapNode(wrappedLeaf);
    // SE-tail leaf: a member chain rooted at a sequence with a polyfillable proxy-global tail
    // (`(eff(), globalThis).list.at(0)`). without it the chain walk bottoms at the SequenceExpression
    // and bails, leaving the raw proxy-global while `skipProxyGlobal` (SE-aware) suppresses the
    // fallback -> ReferenceError ie:11. shares the single-level subst with the direct-SE branch
    const seTail = seTailProxyGlobalSubst(unwrappedLeaf, metaPath);
    // collapse a proxy-global static receiver to its pure ctor (`globalThis.Map` -> `_Map`, and a
    // nested-forwarder chain `globalThis.self.Map` -> `_Map` in one step), matching the provider/babel.
    // resolution is side-effect free until `injectPureImport`, so computing it before a later bail is fine
    const { staticHop, staticPure, staticIdx } = findProxyGlobalStaticHop(
      hops, { scope: metaPath?.scope, adapter: estreeAdapter, path: metaPath }, resolveGlobalPolyfill,
    ) ?? { staticHop: null, staticPure: null, staticIdx: -1 };
    // a proxy-global ctor-static consumed by an OUTER hop (`globalThis.Map.list.at(0)` - the `.list` reads
    // off the collapsed `_Map`, staticIdx > 0) must NOT be collapsed into this instance receiver: the
    // `globalThis.Map -> _Map` static member is rewritten independently and composes INSIDE this receiver
    // text. collapsing it here too leaves the outer content as `_Map.list`, so that inner needle can no
    // longer be located -> compose crash. defer to the natural visitor, which nests the two rewrites
    if (staticPure && staticIdx > 0) return null;
    let leafBoundary = wrappedLeaf;
    let leaf, polyfillBinding, skipNode;
    if (seTail) {
      leaf = seTail.leaf;
      skipNode = leaf;
      if (staticPure) {
        // rebind the SE tail to the static, keeping the prefix effects ahead of it in eval order:
        // `(eff(), globalThis).Map` -> `(eff(), _Map)`. the SE-object member never reaches the static
        // visitor, so skipping the tail identifier alone avoids a dead `_globalThis` import
        polyfillBinding = buildSeTailSrc(seTail.prefixSrcs, injectPureImport(staticPure.entry, staticPure.hintName));
        leafBoundary = staticHop;
        hops.length = staticIdx;
      } else polyfillBinding = buildSeTailSrc(seTail.prefixSrcs, injectPureImport(seTail.pure.entry, seTail.pure.hintName));
    } else if (staticPure) {
      // a proxy-global static collapses even when the leaf is an ALIAS binding (`const g = globalThis;
      // g.Map`): resolveObjectName followed the binding to confirm the static, so a bound leaf is fine
      // here (unlike the verbatim leaf-swap below, which needs an unbound proxy-global)
      const { value: caRhs, outer: chainAssign } = peelChainAssignment(staticHop.object);
      // a chain-assign receiver carries an observable assignment the collapse must not drop. a DIRECT
      // one (`(a = globalThis).Map`) is preserved as a sequence ahead of the static value; one buried
      // under another SE wrapper (`(eff(), a = globalThis).Map`) can't be rebuilt here, so defer the
      // whole receiver to the natural visitor (which composes its chain-assign effects)
      if (!chainAssign && prependChainAssignmentEffect(staticHop, []).length) return null;
      const staticBinding = injectPureImport(staticPure.entry, staticPure.hintName);
      // `(a = globalThis).Map` -> `(a = _globalThis, _Map)`: the assignment root renders like any
      // receiver (`_globalThis` unbound / verbatim alias), the static is the sequence value
      polyfillBinding = chainAssign
        ? `(${ code.slice(chainAssign.start, caRhs.start) }${ resolveReceiverSource(caRhs, metaPath).src }, ${ staticBinding })`
        : staticBinding;
      // skip the whole consumed `proxy-chain.Static` subtree so the visitors don't re-collapse it
      leafBoundary = staticHop;
      skipNode = staticHop;
      walkAstNodes({ root: staticHop, visit: n => skippedNodes.add(n) });
      hops.length = staticIdx;
    } else {
      leaf = unwrappedLeaf;
      if (leaf?.type !== 'Identifier') return null;
      if (metaPath?.scope?.hasBinding?.(leaf.name)) return null;
      const pure = resolveGlobalPolyfill(leaf.name);
      if (!pure) return null;
      polyfillBinding = injectPureImport(pure.entry, pure.hintName);
      skipNode = leaf;
    }
    if (!hasMidChainWrappers) {
      const tailStart = afterOptional(leafBoundary.end, !(hops.at(-1)?.computed ?? false));
      return { src: polyfillBinding + code.slice(tailStart, receiverObj.end), leafNode: skipNode };
    }
    // wrapped case: rebuild chain inner-to-outer. each hop emits its own property accessor;
    // wrapper tokens (parens, ChainExpression) between hops are dropped. leaf-adjacent hop
    // collapses `?.` to `.` (polyfilled leaf is always defined); mid-chain hops preserve their
    // original optionality (`(globalThis?.X)?.Y` keeps `?.Y` since `_globalThis.X` may still be null)
    let src = polyfillBinding;
    for (let i = hops.length - 1; i >= 0; i--) {
      const hop = hops[i];
      const propText = code.slice(hop.property.start, hop.property.end);
      const useOptional = i !== hops.length - 1 && hop.optional;
      if (hop.computed) src += useOptional ? `?.[${ propText }]` : `[${ propText }]`;
      else src += useOptional ? `?.${ propText }` : `.${ propText }`;
    }
    return { src, leafNode: skipNode };
  }

  // unified receiver-source resolution for instance-call emission. tries (a) direct
  // Identifier polyfill, (b) chain-rooted polyfillable leaf, (c) verbatim source. exposes
  // one shape `{src, isNonIdent, skipNode, substituted}` so call sites stay shallow:
  // - `src` text inserted into the polyfill call template
  // - `isNonIdent` whether `_ref` capture is needed (false for direct-pure binding,
  //   true for chain subst, computed via `isReusableReceiver` for verbatim)
  // - `skipNode` AST node to skip from inner Identifier visitor (avoid orphan transforms
  //   redundant with the outer call rewrite)
  // - `substituted` whether `src` diverges from the original AST source (gates `canSplit`:
  //   substituted text can't be split at original positions)
  function resolveReceiverSource(receiverObj, metaPath) {
    // top-level peel: receiver may be wrapped in Paren / Chain / TS (`(globalThis).flat?.()`,
    // `(globalThis?.X.Y).flat?.()`, `(globalThis as any).flat?.()`). without peel the direct-
    // Identifier and chain-Member resolvers reject the wrapper at their type gates and the
    // proxy-global leaf falls through to less precise substitution paths (raw `globalThis`
    // survives into the emit, IE11 ReferenceError). skipNode targets the unwrapped node so
    // the inner Identifier visitor doesn't double-substitute against the outer's content
    const unwrapped = unwrapNode(receiverObj);
    const direct = resolveReceiverPolyfill(unwrapped, metaPath);
    if (direct) return {
      src: injectPureImport(direct.entry, direct.hintName),
      // direct-pure-binding receiver is always a global Identifier here (never `this`), so this
      // gate stays Identifier-only rather than delegating to the shared Identifier-or-`this`
      // predicate; the memo wrapper-set (Paren / Chain, not TS) is the shared one
      isNonIdent: peelMemoizeWrappers(receiverObj).type !== 'Identifier',
      skipNode: unwrapped,
      substituted: true,
    };
    const chain = resolveProxyGlobalChainSrc(unwrapped, metaPath);
    if (chain) return {
      src: chain.src,
      isNonIdent: true,
      skipNode: chain.leafNode,
      substituted: true,
    };
    // SE-tail proxy-global receiver: `(0, globalThis).flat?.(...)` - direct SequenceExpression whose
    // single-level tail is a polyfillable proxy-global. shares `seTailProxyGlobalSubst` with the
    // SE-rooted member chain; nested-SE `(a, (b, X))` stays out of scope (helper bails)
    const seTail = seTailProxyGlobalSubst(unwrapped, metaPath);
    if (seTail) return {
      src: buildSeTailSrc(seTail.prefixSrcs, injectPureImport(seTail.pure.entry, seTail.pure.hintName)),
      isNonIdent: true,
      skipNode: seTail.leaf,
      substituted: true,
    };
    return {
      src: unwrapParensSrc(receiverObj),
      isNonIdent: !isReusableReceiver(receiverObj),
      skipNode: null,
      substituted: false,
    };
  }

  // peel Paren / Chain / TS wrappers off a (node, path) pair in lockstep, keeping chain descent
  // and polyfill resolution aligned on the unwrapped node. returns `null` when a
  // `ParenthesizedExpression` is crossed: a paren above an optional sub-chain is a chain
  // TERMINATOR (`(arr.flat?.()).includes` ends the chain at the `)`), so the chain-combine
  // descent must refuse to fold across it - the outer access becomes a fresh non-optional
  // access on the chain RESULT, which must throw on a nullish value rather than short-circuit.
  // every chain-descent peel wants this bail, so it lives here instead of at each call site.
  // parens around the INNERMOST receiver (`(arr).flat?.()`) sit below the optional node, off
  // this descent path, and never reach here - so they keep combining
  function peelChainStep(node, path) {
    while (node && (node.type === 'ParenthesizedExpression'
        || node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(node.type))) {
      if (node.type === 'ParenthesizedExpression') return null;
      node = node.expression;
      path = path.get('expression');
    }
    return [node, path];
  }

  // text-based Babel-style OR-chain (see babel-compat.js replaceInstanceChainCombined).
  // strictly call-only: babel-plugin's analogue gates on `isCallExpression || isOptionalCallExpression`,
  // so NewExpression must fall through to `addInstanceTransform` (which emits the `isNew` branch
  // `new (binding(obj))(args)`). without this gate the chain emit drops the `new` keyword and
  // rewrites to `binding(...).call(_ref, args)` - silent semantic break (a regular call where
  // the user wrote a constructor invocation)
  function findInnerPolyChain(node, parent, metaPath) {
    // computed-key outer (`?.[k](...)`) combines too: the method is resolved upstream into
    // `binding`, so the emit needs no key text. bailing forced the standalone fallback, which
    // drops the receiver for an optional inner (`_ref()` not `_ref.call(recv)`) - a runtime throw
    if (!isCallee(node, parent) || node.type !== 'MemberExpression') return null;
    if (parent.type !== 'CallExpression') return null;
    // any descent peel that crosses a chain-terminating paren bails the combine; babel's gate
    // rejects the same shape, and the OR-short-circuit emit would otherwise swallow the
    // resulting non-optional throw into `void 0`
    let step = peelChainStep(node.object, metaPath.get('object'));
    if (!step) return null;
    let [current, currentPath] = step;
    // collect non-optional intermediate hops (`.map(...)` / `.slice(...)` / `.x`) between the outer
    // call and the optional inner. the combine threads them onto the memoized inner result so they
    // survive instead of being dropped (value corruption) - mirrors babel-compat.js spliceChainInner.
    // hops are always non-optional here: the descent breaks at the first `?.`, which becomes chainStart
    const hops = [];
    while (current && (current.type === 'MemberExpression' || current.type === 'CallExpression')) {
      if (current.optional) break;
      if (current.type === 'CallExpression') {
        const calleeStep = peelChainStep(current.callee, currentPath.get('callee'));
        if (!calleeStep) return null;
        const [hopCallee, hopCalleePath] = calleeStep;
        if (hopCallee?.type !== 'MemberExpression' || hopCallee.object?.type === 'Super') return null;
        // the hop key matters only for the hop's own POLYFILL lookup, resolved through the
        // SAME detection canon every member meta uses (literals, templates, const-bound
        // identifier chains); a dynamic key threads as a NON-poly hop - its raw text
        // re-emits verbatim. an SE prefix on the key (`[(eff(), 'map')](...)`) is collected
        // so the poly emission can replay it - the resolved name alone would drop the effect
        let hopKeyNode = hopCallee.property;
        let hopKeySE = [];
        if (hopCallee.computed) {
          const { prefix, tail } = peelNestedSequenceExpressions(hopCallee.property);
          hopKeyNode = tail;
          hopKeySE = prefix.filter(mayHaveSideEffects).map(e => code.slice(e.start, e.end));
        }
        const hopKey = resolveKey({
          node: hopKeyNode, computed: hopCallee.computed,
          scope: hopCalleePath.scope, adapter: estreeAdapter, path: hopCalleePath,
        });
        let hopResult = null;
        if (hopKey !== null) {
          ({ result: hopResult } = resolvePureOrGlobalFallback(
            { kind: 'property', object: null, key: hopKey, placement: 'prototype' }, hopCalleePath));
        }
        hops.push({
          poly: hopResult?.kind === 'instance' ? hopResult : null,
          keySE: hopKeySE,
          args: sliceBetweenParens(current) ?? '',
          rawSrc: code.slice(hopCallee.object.end, current.end),
          // member-optional call hop (`recv?.m(...)`): a nullish receiver short-circuits the whole chain
          optional: hopCallee.optional,
        });
        step = peelChainStep(hopCallee.object, hopCalleePath.get('object'));
      } else {
        hops.push({ poly: null, args: null, rawSrc: code.slice(current.object.end, current.end) });
        step = peelChainStep(current.object, currentPath.get('object'));
      }
      if (!step) return null;
      [current, currentPath] = step;
    }
    if (current?.type !== 'CallExpression' || !current.optional) return null;
    const { callee } = current;
    if (callee?.type !== 'MemberExpression') return null;
    // resolve the method name + key side effects. a plain `.flat` uses the Identifier name; a
    // computed key `[(eff(), 'flat')]` peels its SequenceExpression to a static string key and folds
    // the prefix SE into the inner method-get so it evaluates once (instead of being duplicated by a
    // separate computed-key transform). the detection canon also resolves const-bound keys
    // (`const k = 'flat'; arr[k]?.()`); a truly dynamic key bails to the standalone path
    let innerKeySE = [];
    let innerMethodName;
    if (callee.computed) {
      const { prefix, tail } = peelNestedSequenceExpressions(callee.property);
      innerMethodName = resolveKey({
        node: tail, computed: true, scope: currentPath.scope, adapter: estreeAdapter, path: currentPath,
      });
      if (innerMethodName === null) return null;
      innerKeySE = prefix.filter(mayHaveSideEffects);
    } else if (callee.property?.type === 'Identifier') {
      innerMethodName = callee.property.name;
    } else return null;
    const meta = { kind: 'property', object: null, key: innerMethodName, placement: 'prototype' };
    const { result } = resolvePureOrGlobalFallback(meta, currentPath.get('callee'));
    if (result && result.kind !== 'instance') return null;
    // a `super.X?.()` chainStart is NOT polyfilled (the parent's method is used via `_ref.call(this)`,
    // mirroring the standalone super-call path): treat it as a non-poly inner so the combine memoizes
    // the method-GET `super.X` instead of the receiver `super` (which can't be assigned into a `_ref`).
    // this is exactly what lets the combine subsume `super.flat?.().map().at()` into ONE guard instead
    // of falling to overlapping standalones (the "could not locate inner needle" crash)
    const isSuper = callee.object?.type === 'Super';
    // a super method is taken over by the combine (memoized as the method-GET `super.X`, called with
    // `this`) UNLESS it resolves to a polyfillable inherited STATIC: that one the standalone path
    // DEOPTIMIZES (always-defined -> no guard, `_Array$of.call(this)`), and keeping it there preserves
    // deopt parity. consult the canonical static-inheritance resolver, NOT the coarse enclosing-method
    // static-ness: a static-context super to the parent's OWN static (`super.custom`, no core-js
    // polyfill) resolves to no meta, so it must be combined like an instance super - bailing it left
    // >=2 trailing instance polys as overlapping standalones (the "could not locate inner needle"
    // crash). only `super.of` / `super.from` (a needed inherited-static fallback) keeps bailing
    if (isSuper && isInStaticContext(currentPath) && inheritedStaticFallback(
      currentPath.get('callee'), innerMethodName, resolveStaticInheritedMember, resolvePureOrGlobalFallback,
    )) return null;
    const effectiveResult = isSuper ? null : result;
    // non-poly inner (effectiveResult null): the standalone path already handles a single trailing poly,
    // member-only hops, and static / global inner calls (always-defined -> deopts to no-guard
    // compose) correctly. only take over when MULTIPLE trailing polys are present - each would
    // otherwise queue a standalone transform overlapping the shared optional call (composition
    // crash). exclude always-defined-optional inners so `Array.from?.().flat().at()` keeps its
    // deopt + compose shape rather than emitting a raw guarded `Array.from`
    if (!effectiveResult && (!hops.some(h => h.poly)
      || isPolyfillableOptional({ node: current, scope: metaPath.scope, adapter: estreeAdapter, resolve: resolveBuiltIn }))) return null;
    return { chainStart: current, innerCallee: callee, innerResult: effectiveResult, hops, innerKeySE, innerMethodName };
  }

  // mark every intermediate hop between the outer callee's receiver and `chainStart` as
  // skipped. visitor walks each polyfilled MemberExpression along the chain (`.map`
  // between `.filter` and `.flat?.()` in `arr.flat?.().map(x=>x).filter?.().some(...)`);
  // without this seed each intermediate re-matches findInnerPolyChain with the SAME inner
  // `.flat?.()` and queues a duplicate chain emit. overlapping chain emits collide in
  // compose (different shapes share the same inner-source range)
  function markIntermediateChainHops(start, chainStart) {
    // peel transparent wrappers at each step (mirrors `peelChainStep`, the detection-side
    // descent that located `chainStart`): a mid-chain `!` / `as` (TS wrapper) or ESTree
    // ChainExpression between hops would otherwise leave `chainHopChild` looking at a non-
    // Member/Call node, terminate the walk early, and leave the trailing poly hops UNMARKED -
    // the visitor then re-matches the same inner chain and queues an overlapping transform
    // ("could not locate inner needle" crash). ParenthesizedExpression is a chain terminator
    // in `peelChainStep` (it bails there, so no combine reaches here across a paren); left
    // unpeeled it naturally ends this walk too
    for (let hop = peelChainHopWrappers(start); hop && hop !== chainStart; hop = peelChainHopWrappers(chainHopChild(hop))) {
      skippedNodes.add(hop);
    }
  }

  function peelChainHopWrappers(node) {
    while (node && (node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(node.type))) node = node.expression;
    return node;
  }

  // descend one level along the inner-receiver chain. MemberExpression carries the next
  // step on `.object`; CallExpression / OptionalCallExpression on `.callee`. anything else
  // terminates the walk. wrappers are peeled by the caller (`peelChainHopWrappers`)
  function chainHopChild(node) {
    if (node.type === 'MemberExpression') return node.object;
    if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') return node.callee;
    return null;
  }

  // chain emit needs paren-wrap when (a) parent context demands grouping (BinaryExpression
  // / UnaryExpression / etc. via `resolveGuardWrap`), or (b) `.X` / `[X]` trails the chain
  // emit - the conditional `cond ? a : b` would otherwise bind the access to the success
  // branch only, stranding `void 0` in the null path. babel emits the wrap so trailing
  // accesses target the ternary result (restoring native TypeError semantics). discriminator
  // checks `.` (not `..` for rest/spread) and `[` for computed-member access
  function chainEmitWrapInfo(metaPath, parent) {
    const guard = resolveGuardWrap({ metaPath, isCall: true, start: parent.start, end: parent.end });
    // operator parent (case a): wrap, extending over any trailing tail to `tipEnd`
    if (guard.needsParens) return { needsWrap: true, tipEnd: guard.tipEnd };
    // trailing `.X` / `[X]` (case b): wrap so the access targets the ternary result (native
    // TypeError on the null path), but do NOT extend - the access stays raw source after the wrap
    if (transforms.containsRange(parent.start, parent.end)) return { needsWrap: false, tipEnd: parent.end };
    const after = skipGap(code, parent.end);
    const c = code[after];
    return { needsWrap: (c === '.' && code[after + 1] !== '.') || c === '[', tipEnd: parent.end };
  }

  // thread collected hops onto the inner result. polyfillable hops re-emit inline
  // (`binding(_ref = prev).call(_ref, args)`) so the receiver binds; non-poly hops append their
  // verbatim source. a member-optional call hop (`recv?.m(...)`) lifts a `null == (_ref = recv)`
  // guard into `extraTests`: a nullish receiver short-circuits the WHOLE chain to void 0, not just
  // the `.m` access, so the hop threads on the guarded ref and its verbatim source is deoptionalized
  // (the guard already covers the nullish case). `innermostGuardFolded` (set when the caller folds the
  // call-optional chainStart into a `?.call` test): the chainStart-adjacent hop's short-circuit is
  // already covered by that folded `null == mRef`, so it skips its own guard AND reuses the memoized
  // result `mRef` verbatim instead of a redundant memo - matching babel's `_at(_ref).call(_ref)`.
  // non-poly-hop refs allocate OUTERMOST-first (hops array order, after the caller's mRef / outerRef),
  // receiver built INNERMOST-first
  function buildThreadedReceiver(innerCall, hops, { innermostGuardFolded = false, verbatimHops = false } = {}) {
    const innermost = hops.length - 1;
    const slots = hops.map((hop, i) => hop.poly && !(innermostGuardFolded && i === innermost)
      ? { ref: scopeTracker.genRef(), binding: injectPureImport(hop.poly.entry, hop.poly.hintName) }
      : null);
    const extraTests = [];
    let acc = innerCall;
    for (let i = innermost; i >= 0; i--) {
      const slot = slots[i];
      const hop = hops[i];
      const guardFolded = innermostGuardFolded && i === innermost;
      // `verbatimHops` (every hop non-poly + optional OUTER test): hops re-emit verbatim with
      // their own `?.` - the chain short-circuits natively and the single outer test covers
      // it, matching the babel emission. otherwise an optional hop lifts a guard: a nullish
      // prefix must short-circuit the WHOLE chain, not flow into a downstream poly dispatch
      if (hop.optional && !guardFolded && !verbatimHops) {
        const guardRef = scopeTracker.genRef();
        extraTests.push(`null == (${ guardRef } = ${ acc })`);
        acc = guardRef;
      }
      if (slot) {
        // key SE replays between the receiver memo and the helper call - source order
        // (receiver, key effects, dispatch), mirroring the babel emission
        acc = hop.keySE?.length
          ? `(${ slot.ref } = ${ acc }, ${ hop.keySE.join(', ') }, ${ slot.binding }(${ slot.ref }).call(${ slot.ref }${ commaArgs(hop.args) }))`
          : `${ slot.binding }(${ slot.ref } = ${ acc }).call(${ slot.ref }${ commaArgs(hop.args) })`;
      } else if (hop.poly) {
        // folded innermost poly hop: `acc` is the memoized chainStart result (mRef), safe to reuse
        // verbatim rather than allocate a redundant `_refN = mRef` memo (mirrors babel).
        // key SE replays ahead of the dispatch, like the slotted branch
        const binding = injectPureImport(hop.poly.entry, hop.poly.hintName);
        const dispatch = `${ binding }(${ acc }).call(${ acc }${ commaArgs(hop.args) })`;
        acc = hop.keySE?.length ? `(${ hop.keySE.join(', ') }, ${ dispatch })` : dispatch;
      } else {
        // non-poly hops: verbatim mode keeps the `?.`; a guarded one deopts its connector
        // (`?.m` -> `.m`, `?.[k]` -> `[k]` - a dot before a bracket is a syntax error)
        acc = `${ acc }${ hop.optional && !verbatimHops
          ? hop.rawSrc.replace(/^\s*\?\.(?<bracket>\s*\[)?/, (m, bracket) => bracket ?? '.')
          : hop.rawSrc }`;
      }
    }
    return { threaded: acc, extraTests };
  }

  function replaceInstanceChainCombined({ outerBinding, node, parent, metaPath, chain, sideEffects }) {
    const { chainStart, innerCallee, innerResult, hops, innerKeySE = [], innerMethodName } = chain;
    // `super.m?.()` chainStart: memoize the method-GET `super.m` (assignable) instead of the receiver
    // `super` (not a primary expression - `_ref = super` is invalid JS), and call it with `this`
    // (`_ref.call(this)`). the super method itself is left native (not polyfilled), mirroring the
    // standalone super-call path; only the trailing hops / outer poly are rewritten
    const isSuper = innerCallee.object?.type === 'Super';
    // poly inner: the method-get is the polyfill call `_binding(receiver)`. non-poly inner
    // (innerResult null): the method-get is the raw member access `receiver.method`, guarded the
    // same way so a nullish `recv.m` short-circuits the chain to void 0 like native. a computed-key
    // inner (`recv[(eff(), 'flat')]?.()`) folds its key side effects into the method-get once
    const innerBinding = innerResult ? injectPureImport(innerResult.entry, innerResult.hintName) : null;
    function methodGet(arg) {
      // super: the method-get is the verbatim `super.m` (already includes any computed key + its SE,
      // which the single memo evaluates once); the receiver `arg` (`this`) is only the `.call` target
      if (isSuper) return nodeSrc(innerCallee);
      // poly inner -> `_binding(arg)`; non-poly inner -> `arg.method` (parenthesize an assignment
      // arg so `.method` binds to the assignment result). a computed-key inner folds its key SE in
      // front so the effect runs exactly once: `(eff(), _binding(arg))`.
      // when `arg` carries the receiver memo (`aRef = receiver`, the non-optional non-safe case) AND a
      // computed-key SE precedes the method, the memo MUST run before that key SE: per ECMA the object
      // evaluates before the computed key, so emit `(aRef = receiver, keySE, _binding(aRef))` rather
      // than `(keySE, _binding(aRef = receiver))`. without a key SE the order is unobservable, so the
      // embedded form is kept (matches babel, no churn). aRef resolves at call time (set below)
      if (innerKeySE.length && arg !== aRef) {
        const core = innerBinding ? `${ innerBinding }(${ aRef })` : `${ aRef }.${ innerMethodName }`;
        return `(${ arg }, ${ innerKeySE.map(nodeSrc).join(', ') }, ${ core })`;
      }
      const core = innerBinding
        ? `${ innerBinding }(${ arg })`
        : `${ arg.includes('=') ? `(${ arg })` : arg }.${ innerMethodName }`;
      return innerKeySE.length ? `(${ innerKeySE.map(nodeSrc).join(', ') }, ${ core })` : core;
    }
    // resolve the receiver to substituted text BEFORE template construction: the OR-chain
    // references it in multiple slots (`null == X`, `null == (_ref = inner(X))`, `_ref.call(X, ...)`),
    // so a raw proxy-global leaf would survive into every text-only slot (visitor substitution
    // patches only the single AST-anchored occurrence) -> ReferenceError on engines lacking it.
    // delegate to the canonical single-call resolver: it peels Paren / Chain / TS wrappers, then
    // tries direct-Identifier / chain-rooted / SE-tail substitution, falling back to verbatim.
    // shared with the non-combined path so a TS-cast bare proxy-global (`(globalThis as any).flat?.()`)
    // collapses the SAME way it does there, instead of being kept verbatim and leaking the cast
    // super: the `.call` receiver is `this` (a reusable primary), and the method-get `super.m` is
    // memoized via the chainStart test, so no receiver substitution is needed
    const { src: receiver, skipNode } = isSuper
      ? { src: 'this', skipNode: null }
      : resolveReceiverSource(innerCallee.object, metaPath);
    if (skipNode) skippedNodes.add(skipNode);
    // shared `isReusableReceiver` gate (also drives babel's `memoize`): a side-effect-free
    // Identifier / ThisExpression receiver can appear verbatim in every slot without `_ref = X`.
    // skipping the redundant memo aligns the chain-combined emit byte-for-byte with the
    // AST runner (e.g. `arr.flat?.().map(y => y)` -> `null == arr || ...` instead of
    // `null == (_ref = arr) || ...`), saving one allocated `_ref` and matching parity.
    // super's `this` receiver is always reusable
    const isReceiverSafe = isSuper || isReusableReceiver(innerCallee.object);
    const aRef = isReceiverSafe ? receiver : scopeTracker.genRef();
    const anAssign = isReceiverSafe ? receiver : `(${ aRef } = ${ receiver })`;
    const innerArgs = sliceBetweenParens(chainStart) ?? '';
    const outerArgs = sliceBetweenParens(parent) ?? '';

    // `recv.method?.()`: the `?.` guards the CALL, not the `.method` access - a nullish recv must
    // throw on the `.method` read like native, so omit the `null == recv` test (it would swallow
    // the throw into void 0). keep it only when the receiver access is itself optional
    // (`recv?.method?.()`). the method-get assigns mRef either way; in the non-optional non-safe
    // case it also carries the receiver assignment so a side-effecting receiver evaluates once.
    // mirrors babel-compat.js's `replaceInstanceChainCombined`
    const methodArg = innerCallee.optional || isReceiverSafe ? aRef : `${ aRef } = ${ receiver }`;
    // byte-parity with babel for `recv.m?.()?.hop...` (call-optional chainStart + member-optional
    // ADJACENT hop): babel folds the inner call into the chainStart test via `?.call`, so mRef holds
    // the call RESULT and a single `null == mRef` covers BOTH the `m?.()` short-circuit (the `?.call`)
    // and the adjacent `?.hop` short-circuit; the hop then threads on the memoized result. every other
    // chainStart keeps the method-test form (which already matches babel's output)
    // every hop NON-poly: the whole chain stays a single `?.`-connected expression (the
    // chainStart folds to `helper(recv)?.call(recv)`, hops re-emit verbatim) and the OUTER
    // test alone covers the short-circuit - matching the babel emission, which never breaks
    // such a chain apart
    const allHopsNonPoly = !innerCallee.optional && hops.length > 0 && hops.every(h => !h.poly)
      && hops.at(-1).optional && node.optional;
    const foldInnerCall = !allHopsNonPoly && !innerCallee.optional && hops.length > 0 && hops.at(-1).optional;
    // no chainStart test exists on the all-non-poly path - skipping the ref keeps the
    // allocation order (and so the `_refN` numbering) aligned with the babel emission
    const mRef = allHopsNonPoly ? null : scopeTracker.genRef();
    const outerRef = scopeTracker.genRef();
    const innerCall = allHopsNonPoly
      ? `${ methodGet(methodArg) }?.call(${ aRef }${ commaArgs(innerArgs) })`
      : foldInnerCall ? mRef : `${ mRef }.call(${ aRef }${ commaArgs(innerArgs) })`;
    const { threaded, extraTests } = buildThreadedReceiver(innerCall, hops, {
      innermostGuardFolded: foldInnerCall, verbatimHops: allHopsNonPoly,
    });

    const tests = allHopsNonPoly ? [] : innerCallee.optional ? [
      `null == ${ anAssign }`,
      `null == (${ mRef } = ${ methodGet(aRef) })`,
    ] : foldInnerCall ? [
      `null == (${ mRef } = ${ methodGet(methodArg) }?.call(${ aRef }${ commaArgs(innerArgs) }))`,
    ] : !innerBinding && !isReceiverSafe ? [
      // non-poly inner with a side-effecting receiver: comma-split the receiver memo and the raw
      // method-get (`_ref = recv(), _ref2 = _ref.m`) instead of nesting the assignment inside the
      // member access, matching babel - a polyfilled inner instead carries the receiver inside its
      // own call argument, so it keeps the nested methodArg form
      `null == (${ aRef } = ${ receiver }, ${ mRef } = ${ methodGet(aRef) })`,
    ] : [
      `null == (${ mRef } = ${ methodGet(methodArg) })`,
    ];
    // member-optional hop guards sit between the chainStart tests and the outer-optional test,
    // innermost-first - matching native left-to-right short-circuit order
    tests.push(...extraTests);
    let outerObj;
    if (node.optional) {
      tests.push(`null == (${ outerRef } = ${ threaded })`);
      outerObj = outerRef;
    } else {
      outerObj = `${ outerRef } = ${ threaded }`;
    }
    const dot = parent.optional ? '?.' : '.';
    const suffix = commaArgs(outerArgs);
    // fold outer computed-key side effects into the alternate so they fire only when the chain
    // does not short-circuit (native skips a computed-key eval on a nullish receiver) - matches
    // babel-compat.js, which folds the same SE into its conditional alternate
    const alternate = wrapSideEffects(`${ outerBinding }(${ outerObj })${ dot }call(${ outerRef }${ suffix })`, sideEffects);
    let replacement = `${ tests.join(' || ') } ? void 0 : ${ alternate }`;
    let emitEnd = parent.end;
    const { needsWrap, tipEnd } = chainEmitWrapInfo(metaPath, parent);
    if (needsWrap) {
      ({ replacement, end: emitEnd } = wrapGuardOverTail(replacement, parent.start, parent.end, tipEnd));
      replacement = asiGuardLeadingParen(replacement, metaPath, parent.start);
    }

    transforms.add(parent.start, emitEnd, replacement);
    skippedNodes.add(innerCallee);
    skippedNodes.add(parent);
    skipProxyGlobal(node);
    markIntermediateChainHops(node.object, chainStart);
  }

  // parenthesized optional member followed by NON-optional outer call: `(arr?.includes)(1)`,
  // or deep-chain continuation `(arr?.b.includes)(1)` where `.includes` itself is non-optional
  // but an inner `?.` exists. native semantics: chain ends at the optional, outer `()` is
  // non-optional - on nullish throws TypeError; on success Reference Type preserves
  // `this=arr` through parens (verified empirically: `([1,2]?.at)(0) === 1`). emit
  // `(arr == null ? void 0 : binding(_ref = arr.b)).call(_ref, args)`: nullish path throws
  // via `.call` access on undefined; success path preserves `this`. parity with babel-side
  // requires walking the chain (not just `node.optional` flag) since ESTree continuation
  // members carry optional=false even within an optional chain

  function replaceInstance({ binding, node, parent, metaPath, sideEffects, receiverEffectCount }) {
    if (isParenLookupOnlyCall(node, parent)) {
      addInstanceTransform({
        binding, node, parent, metaPath, isCall: true, replacementIsCall: true, sideEffects, receiverEffectCount, parenLookupOnly: true,
      });
      return;
    }
    const chain = findInnerPolyChain(node, parent, metaPath);
    // outer computed-key side effects fold into the combine's conditional alternate (see
    // replaceInstanceChainCombined), so the chain emit now carries them - no need to fall through
    // to addInstanceTransform, whose standalone shape drops the inner receiver for a computed outer
    if (chain) {
      return replaceInstanceChainCombined({ outerBinding: binding, node, parent, metaPath, chain, sideEffects });
    }
    const isCall = isCallee(node, parent);
    addInstanceTransform({ binding, node, parent, metaPath, isCall, replacementIsCall: isCall, sideEffects, receiverEffectCount });
  }

  // split-emit for `super.foo(args)` -> `binding.call(this, args)`. prefix replaces
  // `super.foo(` (with optional SE wrapper); args stay VERBATIM at their source positions
  // (preserves source-map column precision - breakpoints / stack traces resolve to the
  // original arg slot instead of collapsing to super's start). closing `)` is overwritten
  // only when sideEffects need the extra `))` wrap. `sep` branches on AST arity so
  // a no-arg inherited-static call (`super.foo(/* c */)` / `this.foo(/* c */)`, comment
  // round-trips inside source) doesn't get a dangling leading comma. SE-wrap leads with `(`
  // at a statement-leading slot - the ASI guard injects `;` (no-op for empty sideEffects)
  function emitInheritedStaticCallSplit({ binding, parent, sideEffects, metaPath }) {
    const args = parent.arguments;
    // splitPoint: position after `(` - first arg's start, or one before `)` for no-args.
    // closingParen at parent.end - 1 holds the source `)` token; preserving it keeps the
    // closing-paren's column mapping intact for the no-SE path
    const closingParen = parent.end - 1;
    const splitPoint = args[0]?.start ?? closingParen;
    const sep = args.length ? ', ' : '';
    const seParts = sideEffects?.length ? sideEffects.map(e => nodeSrc(e)) : null;
    const callOpen = `${ binding }.call(this${ sep }`;
    const prefix = seParts ? `(${ seParts.join(', ') }, ${ callOpen }` : callOpen;
    transforms.add(parent.start, splitPoint, asiGuardLeadingParen(prefix, metaPath, parent.start));
    // SE wrap closes both the call's `)` (verbatim slot) and the wrapping `(SE, ...)`
    // sequence - overwrite `)` with `))` so MagicString emits the extra closing token
    if (seParts) transforms.add(closingParen, parent.end, '))');
  }

  // replace global identifier or static member with polyfill import binding. the
  // shorthand / export / super early-returns don't carry side effects (Identifier /
  // Super can't host a SequenceExpression); only the final MemberExpression replacement
  // wraps with `sideEffects` from the receiver / computed-key
  function replaceGlobalOrStatic({ binding, node, parent, metaPath, sideEffects, receiverEffectCount, inheritedStatic }) {
    // oxc emits two Identifier nodes (key + value, or local + exported) sharing the
    // same source range for shorthand `{ Promise }` and bare `export { Promise }`
    const directParent = metaPath.parent;
    if (node.type === 'Identifier' && directParent?.type === 'Property' && directParent.shorthand
        && directParent.value === node && metaPath.parentPath?.parent?.type === 'ObjectExpression') {
      return transforms.add(node.start, node.end, `${ node.name }: ${ binding }`);
    }
    // shorthand `export { Promise }` - ESTree sets `local === exported` by reference;
    // `local === exported` identity is the canonical shorthand test (range-only match
    // would also pass for `export { Promise as Promise }`, which is a valid distinction)
    if (node.type === 'Identifier' && directParent?.type === 'ExportSpecifier'
        && directParent.local === node && directParent.exported === node) {
      return transforms.add(node.start, node.end, `${ binding } as ${ node.name }`);
    }
    // inherited-static dispatch -> binding.call(this, args) to preserve the this-binding:
    // super.method(args) AND this.method(args) in static ctx (this = subclass ctor); a dropped
    // receiver downgrades the pure static result to the base class
    if ((node.object?.type === 'Super' || inheritedStatic) && parent?.type === 'CallExpression' && isCallee(node, parent)) {
      emitInheritedStaticCallSplit({ binding, parent, sideEffects, metaPath });
      return;
    }
    // strip TS wrappers (satisfies, as, !) - meaningless after polyfill replacement
    let { start, end } = node;
    let wrapperPath = metaPath.parentPath;
    while (wrapperPath?.node && (TS_EXPR_WRAPPERS.has(wrapperPath.node.type)
        || wrapperPath.node.type === 'ParenthesizedExpression')) {
      ({ start, end } = wrapperPath.node);
      wrapperPath = wrapperPath.parentPath;
    }
    // deoptionalize `?.` - polyfill import is always defined
    if (parent?.type === 'CallExpression' && parent.optional && isCallee(node, parent)) {
      start = parent.callee.start;
      end = afterOptional(parent.callee.end, false);
    } else if (parent?.type === 'MemberExpression' && parent.optional && unwrapNode(parent.object) === node) {
      start = parent.object.start;
      end = afterOptional(parent.object.end, !parent.computed);
    }
    // chain-assignment receiver `(a = Array).from(args)` / `(a = b = Array).from(args)`:
    // outermost assignment would be lost when receiver is dropped. shared composer below
    // peels `=` chain via `prependChainAssignmentEffect` and prepends the outermost
    // assignment to side effects so emit becomes `(a = Array, _Array$from)(args)`.
    // instance dispatch never reaches here (routes through replaceInstance), so no risk of
    // duplicating with memoize-captured form
    transforms.add(start, end,
      composeBindingReplacement({ binding, receiverObj: node.object, sideEffects, insertAt: receiverEffectCount, metaPath, start }));
  }

  // compose the binding's text replacement with receiver-side effects + ASI guard.
  // `start` anchors the ASI-fuse heuristic against the source position the replacement
  // takes over from. shared by `replaceGlobalOrStatic` (whole-MemberExpression rewrite)
  // and `replaceStaticFallback` (object-slot-only rewrite) - both compute
  // `prependChainAssignmentEffect(unwrapNode(receiverObj), sideEffects)` to absorb
  // chain-assignment receivers + the `meta.sideEffects` captured by detect-usage. `insertAt`
  // (the receiver/key boundary) places the chain-assign before the computed-key SE per ECMA
  // receiver-before-key; the fallback path passes receiver-only effects so it omits it (appends)
  function composeBindingReplacement({ binding, receiverObj, sideEffects, insertAt, metaPath, start }) {
    const allEffects = prependChainAssignmentEffect(unwrapNode(receiverObj), sideEffects, insertAt);
    return asiGuardLeadingParen(wrapSideEffects(binding, allEffects), metaPath, start);
  }

  // fallback static-rewrite (member name not in the known statics whitelist): the rewrite
  // replaces just the `.object` text with the polyfill identifier rather than the whole
  // MemberExpression. preserves the original `?.` (the polyfill id never null, but parity
  // with babel-plugin's `_Promise?.foo` emit shape is intentional). mirrors the babel-plugin
  // `replaceWith(withSideEffects(id, allEffects))` shape: receiver chain-assignment +
  // `meta.sideEffects` (computed-key SE captured by detect-usage) compose into the
  // replacement so `called++` in `(called++, Promise).noSuchStatic` doesn't drop
  function replaceStaticFallback({ binding, node, metaPath, sideEffects, receiverEffectCount }) {
    // receiver-only swap: the computed `[key]` property survives and re-runs its own SE, so prepend
    // only the receiver-SE (drop the trailing computed-key SE) to avoid double-evaluating it
    transforms.add(node.object.start, node.object.end, composeBindingReplacement({
      binding, receiverObj: node.object, metaPath, start: node.object.start,
      sideEffects: receiverSideEffectsOnly(receiverEffectCount, sideEffects),
    }));
  }

  // `key in obj` rewrite. The branch decision and side-effect harvest live in the shared
  // planInExpression; here we render the chosen shape into source text and, since this is a text
  // emitter (not an AST mutation), mark the discarded operand skipped so child visitors do not
  // emit spurious polyfills for code the replacement dropped
  function handleInExpression(meta, metaPath) {
    const { node } = metaPath;
    const plan = planInExpression({
      meta,
      left: node.left,
      right: node.right,
      isEntryNeeded,
      resolveFallback: m => resolvePureOrGlobalFallback(m, metaPath),
    });
    if (plan.kind === 'noop') return;
    // queue a whole-node text replacement, re-prepending the harvested SE via comma so it still
    // evaluates; the ASI guard stops a leading `(` fusing into the previous unterminated line
    function emitReplacement(core) {
      const parts = plan.leadingSe.map(e => nodeSrc(e));
      const replacement = parts.length ? `(${ parts.join(', ') }, ${ core })` : core;
      transforms.add(node.start, node.end, asiGuardLeadingParen(replacement, metaPath, node.start));
    }
    if (plan.kind === 'symbol') {
      const binding = injectPureImport(plan.entry, plan.hint);
      emitReplacement(plan.call ? `${ binding }(${ nodeSrc(plan.right) })` : `${ binding } in ${ nodeSrc(plan.right) }`);
    } else {
      // fold: the polyfill is always defined, so the membership test is constantly true
      emitReplacement('true');
    }
    // mark each discarded operand (provider-named per kind: symbol drops the LHS, fold drops both) so a
    // child visitor does not re-emit for a subtree the splice dropped - a polyfillable LHS key
    // (`(globalThis, Symbol.iterator) in x`) otherwise queued a rewrite with no target -> compose crash.
    // subtrees rescued into leadingSe are EXCLUDED even when buried in a discarded operand: their source
    // is re-emitted by the replacement, so their inner rewrites must stay queued for the compose splice
    if (plan.skip) {
      const rescued = new Set();
      for (const effect of plan.leadingSe) walkAstNodes({ root: effect, visit: n => rescued.add(n) });
      for (const operand of plan.skip) {
        walkAstNodes({ root: operand, visit: n => { if (!rescued.has(n)) skippedNodes.add(n); } });
        skipProxyGlobal(operand);
      }
    }
  }

  return {
    addInstanceTransform,
    afterOptional,
    asiGuardLeadingParen,
    handleInExpression,
    handleSymbolIterator,
    nodeSrc,
    replaceGlobalOrStatic,
    replaceInstance,
    replaceInstanceChainCombined,
    replaceStaticFallback,
    resolveReceiverPolyfill,
    skipProxyGlobal,
    skipWrappedNode,
    sliceBetweenParens,
    unwrapParensSrc,
    wrapSideEffects,
  };
}
