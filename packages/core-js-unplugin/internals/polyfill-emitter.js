// polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
// instance-method member-call rewrites (with optional-chain handling, Symbol.iterator special
// path, receiver-polyfill substitution, chain composition), global / static member rewrites
// (shorthand / export / super-call / TS-wrapper / optional-chain deoptimization), and `in`
// expression rewrites (Symbol.X / generic key probe -> `true`). factory captures closure deps
// from the outer transform context (code / scopeTracker / transforms / injector / Sets /
// resolver hooks).
import {
  hasSideEffectfulSequencePrefix,
  mayHaveSideEffects,
  TS_EXPR_WRAPPERS,
  visitSymbolInLhsSe,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { POSSIBLE_GLOBAL_OBJECTS } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  classifyReceiverSE,
  findProxyGlobal,
  keySideEffectsOnly,
  peelReceiverSequenceTail,
  prependChainAssignmentEffect,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { resolveSymbolInEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { createRewriteHint } from './transform-queue.js';
import {
  isCallee,
  isCalleeWrappedInParens,
  unwrapNode,
  unwrapNodeForMemoize,
} from './emit-utils.js';
import { skipGap, walkAstNodes } from './plugin-helpers.js';

export function createPolyfillEmitter({
  canFuseWithOpenParen,
  code,
  estreeAdapter,
  injectPureImport,
  isEntryNeeded,
  NEEDS_GUARD_PARENS,
  NO_REF_NEEDED,
  enclosingExpressionStatementPath,
  isBodylessStatementBody,
  resolveGlobalPolyfill,
  resolvePureOrGlobalFallback,
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
  function wrapSideEffects(binding, sideEffects) {
    return sideEffects?.length
      ? `(${ sideEffects.map(e => nodeSrc(e)).join(', ') }, ${ binding })`
      : binding;
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

  // strip `?.` at known absolute positions within a source slice
  function stripOptionalDots(src, baseOffset, positions) {
    if (!positions?.length) return src;
    const sorted = [...positions].sort((a, b) => a - b);
    let result = '';
    let prev = 0;
    for (const absPos of sorted) {
      let rel = absPos - baseOffset;
      if (rel < 0 || rel >= src.length) continue;
      rel = skipGap(src, rel);
      if (rel >= src.length || src[rel] !== '?' || src[rel + 1] !== '.') continue;
      result += src.slice(prev, rel);
      const afterQ = skipGap(src, rel + 2);
      prev = (src[afterQ] === '[' || src[afterQ] === '(') ? rel + 2 : rel + 1;
    }
    return result + src.slice(prev);
  }

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
  function findChainRoot(node, scope) {
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
      return { root: unwrapParensSrc(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode };
    }

    function isPoly(n) {
      // when the optional's polyfillable static / global is always defined post-rewrite the `?.`
      // is dead, so the root deopts (root:null) rather than emitting a guard over the bare callee
      // that overlaps the static visitor's `?.`-inclusive rewrite range and trips the "could not
      // locate inner needle" composition invariant (`isPolyfillableOptional` unwraps a call callee)
      return isPolyfillableOptional({ node: n, scope, adapter: estreeAdapter, resolve: resolveBuiltIn });
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
  // mutually-exclusive ladder (isNew → bareMember → parenLookup → call); `call` is the
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
      substituted, rootIsReceiver, sideEffects, rootNodeEnd, receiverEnd } = opts;

    let bodyObj = deoptPositions?.length ? stripOptionalDots(objectSrc, objectStart ?? 0, deoptPositions) : objectSrc;
    let guard = '';
    let guardRef = null;

    if (optionalRoot) {
      if (isBareIdentifier(optionalRoot)) {
        guard = `${ optionalRoot } == null ? void 0 : `;
      } else {
        guardRef = preAllocatedGuardRef ?? scopeTracker.genRef();
        guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
        bodyObj = rebindBodyOnGuard({
          bodyObj, guardRef, rootRaw, substituted, rootIsReceiver,
          rootNodeEnd, receiverEnd, deoptPositions, objectStart,
        });
      }
    }

    const ctx = { ...opts, binding, bodyObj, guard, guardRef };
    const { body, clearGuard = false, split = null } = BODY_STRATEGIES[classifyEmitStrategy(opts)](ctx);
    if (clearGuard) guard = '';

    return {
      replacement: `${ guard }${ wrapSideEffects(body, sideEffects) }`,
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
  function resolveOptionalRoot({ node, parent, isCall, scope }) {
    let { root, rootRaw, deoptPositions, rootNode } = findChainRoot(node, scope);
    if (root) {
      const start = isCall ? parent.start : node.start;
      const end = isCall ? parent.end : node.end;
      if (transforms.hasGuardFor(start, end, rootNode)) root = null;
    }
    return { optionalRoot: root, rootRaw, deoptPositions, rootNode };
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
  function guardNeedsParens({ metaPath, isCall, start, end }) {
    let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
    let throughTS = false;
    while (outer?.node && (outer.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(outer.node.type))) {
      if (TS_EXPR_WRAPPERS.has(outer.node.type)) throughTS = true;
      outer = outer.parentPath;
    }
    if (throughTS && !sharesChainExpression(metaPath, outer)) return true;
    if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
    if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
    const p = skipGap(code, end);
    return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
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
    sideEffects = null, parenLookupOnly = false,
  }) {
    const seMode = resolveReceiverSeMode({ node, sideEffects });
    // `peel` (non-optional): peel the receiver to its SE tail; the prepended SequenceExpression
    // replays the full receiver-SE + key-SE the resolver collected. `suppress` (optional): leave
    // the receiver intact - its SE runs inside the null-guard memoize (`_ref = recv`) - and fold
    // only the trailing key-SE into the guard's alternate (`null == (_ref = recv) ? void 0 :
    // (keySE, body)`), so the memoized receiver-SE isn't emitted twice
    const receiverObj = seMode === 'peel' ? peelReceiverSequenceTail(node.object) : node.object;
    if (seMode === 'suppress') sideEffects = keySideEffectsOnly(node.object, sideEffects);
    const recv = resolveReceiverSource(receiverObj, metaPath);
    let { src: objectSrc, isNonIdent } = recv;
    const { optionalRoot: resolvedRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot({
      node, parent, isCall, scope: metaPath?.scope,
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
    // proxy-global guard root: when the receiver path did NOT already substitute the leaf
    // (`recv.substituted` false - e.g. a CALL receiver `globalThis.list?.flat().m()` hides the
    // proxy-global below a call), the optionalRoot is raw source AND `skipProxyGlobal(node)` below
    // suppresses the Identifier visitor that would otherwise rewrite it - so the guard emits raw
    // `globalThis` and IE11 ReferenceErrors on the lookup. resolve the guard text through the
    // proxy-global resolver here (the body already binds the memoized `_ref`, and rootRaw stays raw
    // so the body-tail slice math against the raw receiver source still holds)
    if (optionalRoot && !recv.substituted && rootNode) {
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
    if (!optionalRoot && rootNode && rootIsReceiver) {
      const outerRef = transforms.findOuterGuardRef(rootNode);
      if (outerRef) {
        objectSrc = outerRef;
        isNonIdent = false;
        reusedOuterRef = outerRef;
      }
    }
    const argsSrc = isCall ? sliceBetweenParens(parent) : null;
    const start = isCall ? parent.start : node.start;
    const end = isCall ? parent.end : node.end;
    const isNew = parent?.type === 'NewExpression';
    const preAllocatedGuardRef = optionalRootCapturesIntoRef ? scopeTracker.genRef() : null;

    const built = buildReplacement(binding, objectSrc, {
      isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions: effectiveDeopt,
      optionalCall: isCall && parent.optional, args: argsSrc,
      objectStart: node.object.start,
      preAllocatedGuardRef, sideEffects,
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
      parenLookupOnly,
    });
    let { replacement } = built;
    const { split } = built;
    if (optionalRoot && guardNeedsParens({ metaPath, isCall, start, end })) {
      replacement = `(${ replacement })`;
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

  function handleSymbolIterator({ node, parent, metaPath, sideEffects = null }) {
    if (node.object?.type === 'Super') return;
    if (node.computed && hasSideEffectfulSequencePrefix(node.property)) return;
    const isCallParent = isCallee(node, parent);
    const isPlainCall = isCallParent && parent.type === 'CallExpression';
    const entry = isPlainCall && parent.arguments.length === 0 && !parent.optional
        ? 'get-iterator' : 'get-iterator-method';
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
      sideEffects, parenLookupOnly,
    });
    if (node.property) skipWrappedNode(node.property);
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
    const leaf = unwrapNode(wrappedLeaf);
    if (leaf?.type !== 'Identifier') return null;
    if (metaPath?.scope?.hasBinding?.(leaf.name)) return null;
    const pure = resolveGlobalPolyfill(leaf.name);
    if (!pure) return null;
    const polyfillBinding = injectPureImport(pure.entry, pure.hintName);
    if (!hasMidChainWrappers) {
      const tailStart = afterOptional(wrappedLeaf.end, !hops.at(-1).computed);
      return { src: polyfillBinding + code.slice(tailStart, receiverObj.end), leafNode: leaf };
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
    return { src, leafNode: leaf };
  }

  // unified receiver-source resolution for instance-call emission. tries (a) direct
  // Identifier polyfill, (b) chain-rooted polyfillable leaf, (c) verbatim source. exposes
  // one shape `{src, isNonIdent, skipNode, substituted}` so call sites stay shallow:
  // - `src` text inserted into the polyfill call template
  // - `isNonIdent` whether `_ref` capture is needed (false for direct-pure binding,
  //   true for chain subst, computed via `NO_REF_NEEDED` for verbatim)
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
      // isNonIdent mirrors babel's `isSafeToReuse` gate (Sticky: `unwrapNodeForMemoize no
      // TS wrappers - intentional consistency`). Paren / Chain wrappers around bare
      // Identifier are safe-to-reuse (no memo); TS wrappers (`as` / `satisfies` / `!`) keep
      // the babel-shape memo `(_ref = _polyfill)` so cross-plugin output stays aligned
      isNonIdent: unwrapNodeForMemoize(receiverObj).type !== 'Identifier',
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
    // SE-tail proxy-global: `(0, globalThis).flat?.(...)` - receiver is a
    // SequenceExpression whose DIRECT tail is a polyfillable Identifier. resolve the
    // tail via the same Identifier-polyfill path and rebuild src preserving the SE
    // wrapping. checking `expressions.at(-1)` directly (not peeling recursively) keeps
    // nested-SE shapes `(a, (b, X))` out of scope - reconstruction would otherwise drop
    // the inner SE's prefix and lose side-effects
    if (unwrapped?.type === 'SequenceExpression' && unwrapped.expressions?.length >= 2) {
      const tailNode = unwrapped.expressions.at(-1);
      const tailDirect = resolveReceiverPolyfill(tailNode, metaPath);
      if (tailDirect) {
        const tailSrc = injectPureImport(tailDirect.entry, tailDirect.hintName);
        const prefixSrcs = unwrapped.expressions.slice(0, -1).map(e => nodeSrc(e));
        return {
          src: `(${ [...prefixSrcs, tailSrc].join(', ') })`,
          isNonIdent: true,
          skipNode: tailNode,
          substituted: true,
        };
      }
    }
    return {
      src: unwrapParensSrc(receiverObj),
      isNonIdent: !NO_REF_NEEDED.has(unwrapNodeForMemoize(receiverObj).type),
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
        // un-threadable hop callee shapes (computed / non-Identifier / `super`): bail rather than
        // risk a malformed thread. matches the inner-chainStart gate below
        if (hopCallee?.type !== 'MemberExpression' || hopCallee.computed
          || hopCallee.property?.type !== 'Identifier' || hopCallee.object?.type === 'Super') return null;
        const hopMeta = { kind: 'property', object: null, key: hopCallee.property.name, placement: 'prototype' };
        const { result: hopResult } = resolvePureOrGlobalFallback(hopMeta, hopCalleePath);
        hops.push({
          poly: hopResult?.kind === 'instance' ? hopResult : null,
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
    if (callee?.type !== 'MemberExpression' || callee.computed) return null;
    if (callee.property?.type !== 'Identifier') return null;
    // `super.X?.().Y(args)` would lift `super` into a `(_ref = super)` memo on the
    // OR-chain template, but `super` is not a primary expression and the codegen
    // produces invalid JS. let `super` chains fall through to addInstanceTransform's
    // dedicated super-call handling instead
    if (callee.object?.type === 'Super') return null;
    const meta = { kind: 'property', object: null, key: callee.property.name, placement: 'prototype' };
    const { result } = resolvePureOrGlobalFallback(meta, currentPath.get('callee'));
    if (result?.kind !== 'instance') return null;
    return { chainStart: current, innerCallee: callee, innerResult: result, hops };
  }

  // suppress the inner proxy-global of a TS / Paren wrapped chain receiver. chain emit
  // keeps the wrapper verbatim (mirroring babel's `_ref = X as any` memo shape) so the
  // Identifier visitor would otherwise queue a parallel global-rewrite whose needle range
  // (the wrapped Paren / TS form) wouldn't compose into the verbatim text - silent throw
  function markWrappedProxyGlobalSkipped(receiverObj, metaPath) {
    let n = receiverObj;
    while (n && (n.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(n.type))) {
      n = n.expression;
    }
    if (n?.type === 'Identifier' && resolveReceiverPolyfill(n, metaPath)) skippedNodes.add(n);
  }

  // mark every intermediate hop between the outer callee's receiver and `chainStart` as
  // skipped. visitor walks each polyfilled MemberExpression along the chain (`.map`
  // between `.filter` and `.flat?.()` in `arr.flat?.().map(x=>x).filter?.().some(...)`);
  // without this seed each intermediate re-matches findInnerPolyChain with the SAME inner
  // `.flat?.()` and queues a duplicate chain emit. overlapping chain emits collide in
  // compose (different shapes share the same inner-source range)
  function markIntermediateChainHops(start, chainStart) {
    for (let hop = start; hop && hop !== chainStart; hop = chainHopChild(hop)) {
      skippedNodes.add(hop);
    }
  }

  // descend one level along the inner-receiver chain. MemberExpression carries the next
  // step on `.object`; CallExpression / OptionalCallExpression on `.callee`. anything else
  // terminates the walk
  function chainHopChild(node) {
    if (node.type === 'MemberExpression') return node.object;
    if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') return node.callee;
    return null;
  }

  // chain emit needs paren-wrap when (a) parent context demands grouping (BinaryExpression
  // / UnaryExpression / etc. via `guardNeedsParens`), or (b) `.X` / `[X]` trails the chain
  // emit - the conditional `cond ? a : b` would otherwise bind the access to the success
  // branch only, stranding `void 0` in the null path. babel emits the wrap so trailing
  // accesses target the ternary result (restoring native TypeError semantics). discriminator
  // checks `.` (not `..` for rest/spread) and `[` for computed-member access
  function chainEmitNeedsWrap(metaPath, parent) {
    if (guardNeedsParens({ metaPath, isCall: true, start: parent.start, end: parent.end })) return true;
    if (transforms.containsRange(parent.start, parent.end)) return false;
    const after = skipGap(code, parent.end);
    const c = code[after];
    return (c === '.' && code[after + 1] !== '.') || c === '[';
  }

  // peel Paren wrappers to the inner Identifier for chain receiver substitution. Paren is
  // transparent for proxy-global substitution (`(globalThis)` is semantically equivalent
  // to bare `globalThis`); TS wrappers (`as` / `satisfies` / `!`) stay opaque since babel
  // preserves them in the memo source `_ref = X as any`. returns null when no bare or
  // Paren-wrapped Identifier is found
  function peelParenForDirectSubst(node) {
    let n = node;
    while (n?.type === 'ParenthesizedExpression') n = n.expression;
    return n?.type === 'Identifier' ? n : null;
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
  function buildThreadedReceiver(innerCall, hops, { innermostGuardFolded = false } = {}) {
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
      if (hop.optional && !guardFolded) {
        const guardRef = scopeTracker.genRef();
        extraTests.push(`null == (${ guardRef } = ${ acc })`);
        acc = guardRef;
      }
      if (slot) {
        acc = `${ slot.binding }(${ slot.ref } = ${ acc }).call(${ slot.ref }${ commaArgs(hop.args) })`;
      } else if (hop.poly) {
        // folded innermost poly hop: `acc` is the memoized chainStart result (mRef), safe to reuse
        // verbatim rather than allocate a redundant `_refN = mRef` memo (mirrors babel)
        const binding = injectPureImport(hop.poly.entry, hop.poly.hintName);
        acc = `${ binding }(${ acc }).call(${ acc }${ commaArgs(hop.args) })`;
      } else {
        acc = `${ acc }${ hop.optional ? hop.rawSrc.replace(/^\s*\?\./, '.') : hop.rawSrc }`;
      }
    }
    return { threaded: acc, extraTests };
  }

  function replaceInstanceChainCombined({ outerBinding, node, parent, metaPath, chain, sideEffects }) {
    const { chainStart, innerCallee, innerResult, hops } = chain;
    const innerBinding = injectPureImport(innerResult.entry, innerResult.hintName);
    // chain-rooted polyfillable receiver: without substituting the leaf, OR-chain emit
    // would carry `globalThis?.X` etc. verbatim into every `null == ...` slot of the
    // template. direct-Identifier polyfill is intentionally NOT folded in here -
    // existing OR-chain semantics for bare globals stay verbatim
    // resolve the chain receiver to substituted text BEFORE template construction:
    // the OR-chain template references the receiver text in multiple slots (`null == X`,
    // `null == (_ref = inner(X))`, `_ref.call(X, ...)`). leaving the receiver raw lets
    // visitor-driven Identifier substitution patch only the AST-anchored occurrence (the
    // direct identifier), stranding the duplicated text-only occurrences. also covers
    // bare-Identifier proxy-globals (`globalThis.flat?.()...`) which the chain resolver
    // alone rejects since it requires a MemberExpression receiver
    const chainSubst = resolveProxyGlobalChainSrc(innerCallee.object, metaPath);
    // direct-Identifier substitution fires for bare AND Paren-wrapped proxy-globals
    // (`(globalThis)` is semantically transparent). TS / non-null casts stay opaque to
    // match babel's `_ref = X as any` memo shape - babel substitutes through Paren but
    // preserves TS wrappers in the source. peeled-to-Identifier shapes get full receiver
    // substitution; wrapped shapes fall through to verbatim emission
    const directLeaf = !chainSubst ? peelParenForDirectSubst(innerCallee.object) : null;
    const directSubst = directLeaf ? resolveReceiverPolyfill(directLeaf, metaPath) : null;
    let receiver;
    let substLeafNode = null;
    if (chainSubst) {
      receiver = chainSubst.src;
      substLeafNode = chainSubst.leafNode;
    } else if (directSubst) {
      receiver = injectPureImport(directSubst.entry, directSubst.hintName);
      substLeafNode = directLeaf;
    } else {
      receiver = unwrapParensSrc(innerCallee.object);
    }
    if (substLeafNode) skippedNodes.add(substLeafNode);
    else markWrappedProxyGlobalSkipped(innerCallee.object, metaPath);
    // mirror babel-compat.js `memoize` (`isSafeToReuse`): a side-effect-free Identifier /
    // ThisExpression receiver can appear verbatim in every slot without `_ref = X` capture.
    // skipping the redundant memo aligns the chain-combined emit byte-for-byte with the
    // AST runner (e.g. `arr.flat?.().map(y => y)` -> `null == arr || ...` instead of
    // `null == (_ref = arr) || ...`), saving one allocated `_ref` and matching parity
    const isReceiverSafe = NO_REF_NEEDED.has(unwrapNodeForMemoize(innerCallee.object).type);
    const aRef = isReceiverSafe ? receiver : scopeTracker.genRef();
    const anAssign = isReceiverSafe ? receiver : `(${ aRef } = ${ receiver })`;
    const mRef = scopeTracker.genRef();
    const outerRef = scopeTracker.genRef();
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
    const foldInnerCall = !innerCallee.optional && hops.length > 0 && hops.at(-1).optional;
    const innerCall = foldInnerCall ? mRef : `${ mRef }.call(${ aRef }${ commaArgs(innerArgs) })`;
    const { threaded, extraTests } = buildThreadedReceiver(innerCall, hops, { innermostGuardFolded: foldInnerCall });

    const tests = innerCallee.optional ? [
      `null == ${ anAssign }`,
      `null == (${ mRef } = ${ innerBinding }(${ aRef }))`,
    ] : foldInnerCall ? [
      `null == (${ mRef } = ${ innerBinding }(${ methodArg })?.call(${ aRef }${ commaArgs(innerArgs) }))`,
    ] : [
      `null == (${ mRef } = ${ innerBinding }(${ methodArg }))`,
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
    if (chainEmitNeedsWrap(metaPath, parent)) {
      replacement = asiGuardLeadingParen(`(${ replacement })`, metaPath, parent.start);
    }

    transforms.add(parent.start, parent.end, replacement);
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

  function replaceInstance({ binding, node, parent, metaPath, sideEffects }) {
    if (isParenLookupOnlyCall(node, parent)) {
      addInstanceTransform({
        binding, node, parent, metaPath, isCall: true, replacementIsCall: true, sideEffects, parenLookupOnly: true,
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
    addInstanceTransform({ binding, node, parent, metaPath, isCall, replacementIsCall: isCall, sideEffects });
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
  function replaceGlobalOrStatic({ binding, node, parent, metaPath, sideEffects, inheritedStatic }) {
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
      composeBindingReplacement({ binding, receiverObj: node.object, sideEffects, metaPath, start }));
  }

  // compose the binding's text replacement with receiver-side effects + ASI guard.
  // `start` anchors the ASI-fuse heuristic against the source position the replacement
  // takes over from. shared by `replaceGlobalOrStatic` (whole-MemberExpression rewrite)
  // and `replaceStaticFallback` (object-slot-only rewrite) - both compute
  // `prependChainAssignmentEffect(unwrapNode(receiverObj), sideEffects)` to absorb
  // chain-assignment receivers + the `meta.sideEffects` captured by detect-usage
  function composeBindingReplacement({ binding, receiverObj, sideEffects, metaPath, start }) {
    const allEffects = prependChainAssignmentEffect(unwrapNode(receiverObj), sideEffects);
    return asiGuardLeadingParen(wrapSideEffects(binding, allEffects), metaPath, start);
  }

  // fallback static-rewrite (member name not in the known statics whitelist): the rewrite
  // replaces just the `.object` text with the polyfill identifier rather than the whole
  // MemberExpression. preserves the original `?.` (the polyfill id never null, but parity
  // with babel-plugin's `_Promise?.foo` emit shape is intentional). mirrors the babel-plugin
  // `replaceWith(withSideEffects(id, allEffects))` shape: receiver chain-assignment +
  // `meta.sideEffects` (computed-key SE captured by detect-usage) compose into the
  // replacement so `called++` in `(called++, Promise).noSuchStatic` doesn't drop
  function replaceStaticFallback({ binding, node, metaPath, sideEffects }) {
    transforms.add(node.object.start, node.object.end,
      composeBindingReplacement({ binding, receiverObj: node.object, sideEffects, metaPath, start: node.object.start }));
  }

  // peel a SequenceExpression's preceding elements when at least one carries an observable
  // side-effect; the trailing tail is the value used by the in-expression. returns null
  // when not a sequence or when no preceding element has side-effects (cheap drop)
  function sequencePrefixWithSideEffects(expr) {
    if (expr?.type !== 'SequenceExpression' || expr.expressions.length < 2) return null;
    const prefix = expr.expressions.slice(0, -1);
    return prefix.some(e => mayHaveSideEffects(e)) ? prefix : null;
  }

  // `key in obj` rewrite: Symbol-sourced LHS (`Symbol.X in obj`) takes the symbol-in
  // polyfill path; bare-name LHS with statically-known polyfilled key (`'from' in Array`)
  // folds the whole expression to `true` (polyfill is always defined). string-keyed Symbol
  // (`'Symbol.X' in Obj`) falls through to the bare-name branch via its string key
  function handleInExpression(meta, metaPath) {
    const { node } = metaPath;
    const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
    if (symbolIn && isEntryNeeded(symbolIn.entry)) {
      const binding = injectPureImport(symbolIn.entry, symbolIn.hint);
      // preserve SE that the rewrite would otherwise drop - computed-key SequenceExpression
      // (`Symbol[(fn(), 'iterator')]`) or wrapped receiver SE
      const lhsSe = [];
      visitSymbolInLhsSe(node.left, e => lhsSe.push(nodeSrc(e)));
      if (meta.key === 'Symbol.iterator') {
        const call = `${ binding }(${ nodeSrc(node.right) })`;
        const replacement = lhsSe.length ? `(${ lhsSe.join(', ') }, ${ call })` : call;
        transforms.add(node.start, node.end, asiGuardLeadingParen(replacement, metaPath, node.start));
        skipWrappedNode(node.left);
      } else {
        const tail = `${ binding } in ${ nodeSrc(node.right) }`;
        const replacement = lhsSe.length ? `(${ lhsSe.join(', ') }, ${ tail })` : tail;
        transforms.add(node.start, node.end, asiGuardLeadingParen(replacement, metaPath, node.start));
        skipWrappedNode(node.left);
      }
    } else if (meta.object) {
      // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable.
      // BOTH sides preserve SE: `(bar(), 'from') in Array` and `'k' in (fn(), Array)`
      // evaluate their respective SE even when the in-check folds to a constant. shapes:
      //   SequenceExpression: keep SE-bearing prefix, drop the tail (used by in-check)
      //   AssignmentExpression on RHS: wrap whole RHS as a sequence prefix (rescues both
      //   the assignment side-effect AND the binding update)
      // CallExpression rhs intentionally NOT rescued - inline-call analysis upstream
      // filters out SE-bearing IIFEs separately
      const resolved = resolvePureOrGlobalFallback(meta, metaPath);
      if (resolved.result) {
        // oxc preserves ParenthesizedExpression around the operands; peel via unwrapNode
        // so SE-shape detection works the same as on babel-stripped form
        const lhs = unwrapNode(node.left);
        const rhs = unwrapNode(node.right);
        const seParts = [];
        const lhsSeqPrefix = sequencePrefixWithSideEffects(lhs);
        if (lhsSeqPrefix) seParts.push(...lhsSeqPrefix.map(e => nodeSrc(e)));
        const rhsSeqPrefix = sequencePrefixWithSideEffects(rhs);
        if (rhsSeqPrefix) seParts.push(...rhsSeqPrefix.map(e => nodeSrc(e)));
        else if (rhs?.type === 'AssignmentExpression') seParts.push(nodeSrc(rhs));
        const replacement = seParts.length ? `(${ seParts.join(', ') }, true)` : 'true';
        // SE-rescue / assign-wrap replacements lead with `(`; at a statement-leading slot
        // (the in-expression IS the whole ExpressionStatement) the ASI rule fuses the
        // previous unterminated line into the new `(...)` as a call. `'true'` bare path
        // is no-op for the guard
        transforms.add(node.start, node.end, asiGuardLeadingParen(replacement, metaPath, node.start));
        // marking nested identifiers (`foo.bar.baz` -> `foo`) as skipped prevents child
        // visitors from emitting spurious polyfill imports for code the `'true'` replacement
        // has discarded. EXCEPT when RHS is an AssignmentExpression rescue: the entire RHS
        // text is preserved verbatim in the replacement (`(y = Map, true)`), so inner
        // polyfills there must still emit (`Map` -> `_Map`). skipping the RHS subtree in
        // that case strands raw proxy-globals in the replacement
        if (rhs?.type !== 'AssignmentExpression') {
          walkAstNodes({ root: node.right, visit: n => skippedNodes.add(n) });
          skipProxyGlobal(node.right);
        }
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
