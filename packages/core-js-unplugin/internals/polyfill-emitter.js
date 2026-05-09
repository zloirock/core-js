// polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
// instance-method member-call rewrites (with optional-chain handling, Symbol.iterator special
// path, receiver-polyfill substitution, chain composition), global / static member rewrites
// (shorthand / export / super-call / TS-wrapper / optional-chain deoptimization), and `in`
// expression rewrites (Symbol.X / generic key probe -> `true`). factory captures closure deps
// from the outer transform context (code / scopeTracker / transforms / injector / Sets /
// resolver hooks).
import {
  hasSideEffectfulSequencePrefix,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { POSSIBLE_GLOBAL_OBJECTS } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  findProxyGlobal,
  peelReceiverSequenceTail,
  prependChainAssignmentEffect,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { resolveSymbolInEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { createRewriteHint } from './transform-queue.js';
import {
  isCallee,
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
  resolveGlobalPolyfill,
  resolvePureOrGlobalFallback,
  scopeTracker,
  skippedNodes,
  startsEnclosingStatement,
  transforms,
}) {
  // bare-Identifier shape (`globalThis`, `_Promise`, `$X`); excludes member chains, parens,
  // operators. used to gate guard emission - bare-Identifier roots use `X == null`, anything
  // else captures into a `_ref` first to avoid double-evaluating side effects
  const BARE_IDENTIFIER_REGEX = /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u;
  const isBareIdentifier = src => typeof src === 'string' && BARE_IDENTIFIER_REGEX.test(src);

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

  // a `(`-leading replacement at a statement-leading slot can fuse with the previous
  // line into a call (`a\n(...)` -> `a(...)`); inject `;` only when both conditions hit
  function asiGuardLeadingParen(replacement, metaPath, start) {
    return replacement[0] === '('
      && startsEnclosingStatement(metaPath, start)
      && canFuseWithOpenParen(code, start)
      ? `;${ replacement }`
      : replacement;
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

  // walk the chain to find the first non-polyfillable optional, skipping TS wrappers
  function findChainRoot(node, scope) {
    function chainChild(n) {
      return n.object || n.callee || (TS_EXPR_WRAPPERS.has(n.type) ? n.expression : null);
    }
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
    const isPoly = n => isPolyfillableOptional(n, scope, estreeAdapter, resolveBuiltIn);
    let current = node.optional ? node : chainChild(node);
    while (current && typeof current === 'object') {
      if (current.optional) {
        return isPoly(current) ? { root: null } : makeResult(current);
      }
      current = chainChild(current);
    }
    return { root: null };
  }

  // build the replacement text for an instance method or Symbol.iterator transform
  function buildReplacement(binding, objectSrc, opts) {
    const {
      isCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
      optionalCall, args, objectStart, preAllocatedGuardRef, sideEffects,
      substituted, rootIsReceiver, parenLookupOnly,
    } = opts;
    const strip = src => stripOptionalDots(src, objectStart ?? 0, deoptPositions);
    let bodyObj = deoptPositions?.length ? strip(objectSrc) : objectSrc;
    let guard = '';
    let guardRef = null;

    if (optionalRoot) {
      if (isBareIdentifier(optionalRoot)) {
        guard = `${ optionalRoot } == null ? void 0 : `;
      } else {
        guardRef = preAllocatedGuardRef ?? scopeTracker.genRef();
        guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
        // when receiver is chain-substituted (`globalThis?.foo` -> `_globalThis.foo`) and
        // rootNode equals receiverObj, the entire bodyObj IS the substituted root; slicing
        // by `strip(rootRaw).length` would leave a substring tail (`_globalThis.foo`.slice
        // (`globalThis.foo`.length) = `o`), corrupting bodyObj into `_refo`. compose layer
        // later re-substitutes the original `optionalRoot` in guard text via inner-needle
        // matching, so leaving bodyObj as bare `guardRef` here keeps both layers consistent
        bodyObj = substituted && rootIsReceiver
          ? guardRef
          : guardRef + bodyObj.slice(strip(rootRaw).length);
      }
    }

    let split = null;
    let body;
    if (isNew) {
      // NewExpression with optional inner: babel-plugin's `normalizeOptionalChain` lifts
      // the conditional guard into the new's callee slot (`new (CONDITIONAL)(args)`),
      // not around the whole expression. inject guard inside the `new (...)` callee bracket
      // so the shape matches babel - and so compose's rootRaw substitution lands at the
      // right slot. clear `guard` to prevent the outer concat from double-emitting.
      body = `new (${ guard }${ binding }(${ bodyObj }))(${ args || '' })`;
      guard = '';
    } else if (!isCall) {
      body = `${ binding }(${ bodyObj })`;
    } else if (parenLookupOnly) {
      // `(arr?.method)(args)`: parens preserve Reference Type so native binds `this=arr` on
      // success; on nullish the outer non-optional call throws (chain ends at `?.`). emit
      // `(arr == null ? void 0 : binding(arr)).call(arr, args)` - `(undefined).call(...)`
      // throws on nullish, success path preserves `this`. wrap the whole guard+lookup in
      // parens so `.call` binds outside the ternary. bodyObj is already memoized when
      // the receiver is non-bare (guard pre-assigns it to a ref)
      const argsPart = args ? `, ${ args }` : '';
      body = `(${ guard }${ binding }(${ bodyObj })).call(${ bodyObj }${ argsPart })`;
      guard = '';
    } else {
      const ref = isNonIdent && bodyObj !== guardRef ? scopeTracker.genRef() : null;
      const obj = ref || bodyObj;
      const firstArg = ref ? `${ ref } = ${ bodyObj }` : bodyObj;
      const dot = optionalCall ? '?.' : '.';
      const argsPart = args ? `, ${ args }` : '';
      const prefix = `${ binding }(${ firstArg })`;
      const suffix = `${ dot }call(${ obj }${ argsPart })`;
      body = `${ prefix }${ suffix }`;
      if (!guard && !sideEffects?.length) split = { prefix, suffix };
    }
    const replacement = `${ guard }${ wrapSideEffects(body, sideEffects) }`;
    return { replacement, split };
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
  function resolveOptionalRoot(node, parent, isCall, scope) {
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
  function guardNeedsParens(metaPath, isCall, start, end) {
    let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
    while (outer?.node && (outer.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(outer.node.type))) {
      outer = outer.parentPath;
    }
    if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
    if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
    const p = skipGap(code, end);
    return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
  }

  // build replacement, wrap guard if needed, add to transform queue
  function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall,
    sideEffects = null, parenLookupOnly = false) {
    // SequenceExpression-receiver double-emit guard: `(fn(), arr).at(0)` arrives with
    // `sideEffects = [fn()]` (collected upstream in members.js). without peeling the AST
    // receiver to the SE tail, memoize would capture `_ref = (fn(), arr)` AND wrapSideEffects
    // would prepend fn() again, running fn() twice. peel ONLY when sideEffects has content
    // (non-meta callers don't carry the prepend contract; their SE receivers stay verbatim)
    const receiverObj = sideEffects?.length ? peelReceiverSequenceTail(node.object) : node.object;
    const recv = resolveReceiverSource(receiverObj, metaPath);
    let { src: objectSrc, isNonIdent } = recv;
    const { optionalRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot(node, parent, isCall, metaPath?.scope);
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
    // optionalRoot) keep the skip - outer's body / guard already carries the substituted form
    // via chain.src and compose substring-matching would poison it (e.g. needle `globalThis`
    // substring-matches inside `_globalThis` -> `__globalThis` corruption)
    const composeSafeForInnerLeaf = optionalRootCapturesIntoRef && rootIsReceiver;
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
      isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
      optionalCall: isCall && parent.optional, args: argsSrc,
      objectStart: node.object.start,
      preAllocatedGuardRef, sideEffects,
      substituted: recv.substituted,
      // rootRaw spans the entire receiver iff `node` is itself optional (then findChainRoot
      // returns rootNode === node.object); guard text must come from the substituted bodyObj
      // in that case (see buildReplacement comment)
      rootIsReceiver,
      parenLookupOnly,
    });
    let { replacement } = built;
    const { split } = built;
    if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
      replacement = asiGuardLeadingParen(`(${ replacement })`, metaPath, start);
    }
    const hint = createRewriteHint({
      rootRaw,
      guardRef: preAllocatedGuardRef ?? reusedOuterRef,
      deoptPositions,
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

  function handleSymbolIterator(meta, node, parent, metaPath) {
    if (node.object?.type === 'Super') return;
    if (node.computed && hasSideEffectfulSequencePrefix(node.property)) return;
    const isCallParent = isCallee(node, parent);
    const isPlainCall = isCallParent && parent.type === 'CallExpression';
    const entry = isPlainCall && parent.arguments.length === 0 && !parent.optional
        ? 'get-iterator' : 'get-iterator-method';
    if (!isEntryNeeded(entry)) return;
    const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
    addInstanceTransform(binding, node, parent, metaPath, isCallParent,
      isCallParent && (parent.arguments.length > 0 || parent.optional));
    if (node.property) skipWrappedNode(node.property);
  }

  // direct-Identifier polyfillable receiver (`Array.prototype.X`, `globalThis.foo` where
  // `globalThis` itself is the receiver). chain receivers (`globalThis?.X.Y`) go through
  // `resolveProxyGlobalChainSrc` instead
  function resolveReceiverPolyfill(obj, metaPath) {
    if (obj?.type !== 'Identifier') return null;
    if (metaPath?.scope?.hasBinding?.(obj.name)) return null;
    return resolveGlobalPolyfill(obj.name);
  }

  // member-chain receiver rooted at a polyfillable global Identifier (`globalThis?.X.Y`,
  // `(globalThis as any)?.X.Y`). substitute the leaf with its polyfill binding and consume
  // any immediately following `?.`: every leaf returned by `resolveGlobalPolyfill` is
  // always-defined post-rewrite, so the receiver null-check is redundant. without this the
  // outer instance-call transform emits `_X(_ref = globalThis?.X.Y).call(_ref, ...)`
  // verbatim and engines without a native `globalThis` (ie11) TypeError on the implicit
  // `globalThis.X` lookup.
  // peels parens / TS wrappers AROUND the leaf only - wrappers further up the chain (e.g.
  // `(globalThis?.X).Y`) bail to avoid src-splice breakage (closing wrapper would land in
  // the tail slice as syntactic garbage). deeper `?.` past the leaf hop is preserved as-is:
  // we only know the leaf substitution is always-defined, not intermediate lookups
  function resolveProxyGlobalChainSrc(receiverObj, metaPath) {
    if (receiverObj?.type !== 'MemberExpression' && receiverObj?.type !== 'OptionalMemberExpression') return null;
    // descend strictly through bare member hops (no wrapper peel here - wrappers in the
    // middle of the chain make the tail slice unsafe). track the immediate parent so we
    // can read `.computed` for the `?.` consume decision and use the wrapped-leaf's end
    // (covers `?.` peel AND any leaf-side wrapper closing token like `)` / `as any`)
    let leafParent = receiverObj;
    while (leafParent.object?.type === 'MemberExpression' || leafParent.object?.type === 'OptionalMemberExpression') {
      leafParent = leafParent.object;
    }
    const wrappedLeaf = leafParent.object;
    const leaf = unwrapNode(wrappedLeaf);
    if (leaf?.type !== 'Identifier') return null;
    if (metaPath?.scope?.hasBinding?.(leaf.name)) return null;
    const pure = resolveGlobalPolyfill(leaf.name);
    if (!pure) return null;
    const polyfillBinding = injectPureImport(pure.entry, pure.hintName);
    const tailStart = afterOptional(wrappedLeaf.end, !leafParent.computed);
    return { src: polyfillBinding + code.slice(tailStart, receiverObj.end), leafNode: leaf };
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
    const direct = resolveReceiverPolyfill(receiverObj, metaPath);
    if (direct) return {
      src: injectPureImport(direct.entry, direct.hintName),
      isNonIdent: false,
      skipNode: receiverObj,
      substituted: true,
    };
    const chain = resolveProxyGlobalChainSrc(receiverObj, metaPath);
    if (chain) return {
      src: chain.src,
      isNonIdent: true,
      skipNode: chain.leafNode,
      substituted: true,
    };
    return {
      src: unwrapParensSrc(receiverObj),
      isNonIdent: !NO_REF_NEEDED.has(unwrapNodeForMemoize(receiverObj).type),
      skipNode: null,
      substituted: false,
    };
  }

  // text-based Babel-style OR-chain (see babel-compat.js replaceInstanceChainCombined).
  // strictly call-only: babel-plugin's analogue gates on `isCallExpression || isOptionalCallExpression`,
  // so NewExpression must fall through to `addInstanceTransform` (which emits the `isNew` branch
  // `new (binding(obj))(args)`). without this gate the chain emit drops the `new` keyword and
  // rewrites to `binding(...).call(_ref, args)` - silent semantic break (a regular call where
  // the user wrote a constructor invocation)
  function findInnerPolyChain(node, parent, metaPath) {
    if (!isCallee(node, parent) || node.type !== 'MemberExpression' || node.computed) return null;
    if (parent.type !== 'CallExpression') return null;
    let current = node.object;
    while (current && (current.type === 'ParenthesizedExpression'
        || current.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(current.type))) {
      current = current.expression;
    }
    while (current && (current.type === 'MemberExpression' || current.type === 'CallExpression')) {
      if (current.optional) break;
      current = current.type === 'MemberExpression' ? current.object : current.callee;
    }
    if (current?.type !== 'CallExpression' || !current.optional) return null;
    const { callee } = current;
    if (callee?.type !== 'MemberExpression' || callee.computed) return null;
    if (callee.property?.type !== 'Identifier') return null;
    const meta = { kind: 'property', object: null, key: callee.property.name, placement: 'prototype' };
    const { result } = resolvePureOrGlobalFallback(meta, metaPath.get('object').get('callee'));
    if (result?.kind !== 'instance') return null;
    return { chainStart: current, innerCallee: callee, innerResult: result };
  }

  function replaceInstanceChainCombined(outerBinding, node, parent, metaPath, chain) {
    const { chainStart, innerCallee, innerResult } = chain;
    const innerBinding = injectPureImport(innerResult.entry, innerResult.hintName);
    // chain-rooted polyfillable receiver: without substituting the leaf, OR-chain emit
    // would carry `globalThis?.X` etc. verbatim into every `null == ...` slot of the
    // template. direct-Identifier polyfill is intentionally NOT folded in here -
    // existing OR-chain semantics for bare globals stay verbatim
    const chainSubst = resolveProxyGlobalChainSrc(innerCallee.object, metaPath);
    const receiver = chainSubst?.src ?? unwrapParensSrc(innerCallee.object);
    if (chainSubst) skippedNodes.add(chainSubst.leafNode);
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
    const innerCall = `${ mRef }.call(${ aRef }${ innerArgs ? `, ${ innerArgs }` : '' })`;

    const tests = [
      `null == ${ anAssign }`,
      `null == (${ mRef } = ${ innerBinding }(${ aRef }))`,
    ];
    let outerObj;
    if (node.optional) {
      tests.push(`null == (${ outerRef } = ${ innerCall })`);
      outerObj = outerRef;
    } else {
      outerObj = `${ outerRef } = ${ innerCall }`;
    }
    const dot = parent.optional ? '?.' : '.';
    const suffix = outerArgs ? `, ${ outerArgs }` : '';
    let replacement = `${ tests.join(' || ') } ? void 0 : ${ outerBinding }(${ outerObj })${ dot }call(${ outerRef }${ suffix })`;
    // paren-wrap when context demands grouping (BinaryExpression/UnaryExpression/etc.).
    // also guard against ASI fusion: a `(`-leading replacement at a statement-leading slot
    // can fuse with the preceding statement (`prev\n(_at(...)...)` -> `prev(...)`),
    // triggering a TypeError at runtime. mirrors `addInstanceTransform`'s ASI guard
    if (guardNeedsParens(metaPath, true, parent.start, parent.end)) {
      replacement = asiGuardLeadingParen(`(${ replacement })`, metaPath, parent.start);
    }

    transforms.add(parent.start, parent.end, replacement);
    skippedNodes.add(innerCallee);
    skippedNodes.add(parent);
    skipProxyGlobal(node);
  }

  // parenthesized optional member followed by NON-optional outer call: `(arr?.includes)(1)`.
  // native semantics: chain ends at `?.`, outer `()` is non-optional - on nullish throws
  // TypeError; on success Reference Type preserves `this=arr` through parens (verified
  // empirically: `([1,2]?.at)(0) === 1`). emit `(arr == null ? void 0 : binding(arr)).call
  // (arr, args)`: nullish path throws via `.call` access on undefined; success path
  // preserves `this`. parenLookupOnly flag routes through buildReplacement's special form.
  // optional outer call `(arr?.at)?.(0)` falls through to standard path - Reference Type
  // preserves through parens and short-circuits properly on nullish
  function replaceInstance(binding, node, parent, metaPath, sideEffects) {
    const isParenLookupOnly = isCallee(node, parent) && parent.callee !== node
      && parent.callee?.type === 'ParenthesizedExpression'
      && node.optional && !parent.optional;
    if (isParenLookupOnly) {
      addInstanceTransform(binding, node, parent, metaPath, true, true, sideEffects, true);
      return;
    }
    const chain = findInnerPolyChain(node, parent, metaPath);
    if (chain) return replaceInstanceChainCombined(binding, node, parent, metaPath, chain);
    const isCall = isCallee(node, parent);
    addInstanceTransform(binding, node, parent, metaPath, isCall, isCall, sideEffects);
  }

  // replace global identifier or static member with polyfill import binding. the
  // shorthand / export / super early-returns don't carry side effects (Identifier /
  // Super can't host a SequenceExpression); only the final MemberExpression replacement
  // wraps with `sideEffects` from the receiver / computed-key
  function replaceGlobalOrStatic(binding, node, parent, metaPath, sideEffects) {
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
    // super.method(args) -> binding.call(this, args) to preserve this-binding.
    // `sliceBetweenParens` keeps every byte between `(` and `)` (comments, whitespace,
    // trailing commas); `sep` branches on AST arity so `super.foo(/* c */)` (no real args,
    // comment still round-trips inside argsSrc) doesn't get a dangling leading comma
    if (node.object?.type === 'Super' && parent?.type === 'CallExpression' && isCallee(node, parent)) {
      const argsSrc = sliceBetweenParens(parent) ?? '';
      const sep = parent.arguments.length ? ', ' : '';
      return transforms.add(parent.start, parent.end, `${ binding }.call(this${ sep }${ argsSrc })`);
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
    // outermost assignment would be lost when receiver is dropped. unwrap parens / TS /
    // ChainExpression via `unwrapNode`, then shared `prependChainAssignmentEffect` peels
    // `=` chain and prepends the outermost assignment to side effects so emit becomes
    // `(a = Array, _Array$from)(args)`. instance dispatch never reaches here (routes
    // through replaceInstance), so no risk of duplicating with memoize-captured form
    const allEffects = prependChainAssignmentEffect(unwrapNode(node.object), sideEffects);
    transforms.add(start, end, asiGuardLeadingParen(wrapSideEffects(binding, allEffects), metaPath, start));
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
      if (meta.key === 'Symbol.iterator') {
        transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
        skipWrappedNode(node.left);
      } else {
        transforms.add(node.left.start, node.left.end, binding);
      }
    } else if (meta.object) {
      // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
      const resolved = resolvePureOrGlobalFallback(meta, metaPath);
      if (resolved.result) {
        transforms.add(node.start, node.end, 'true');
        // marking only `node.right` leaves nested identifiers (`foo.bar.baz` -> `foo`)
        // visible to child visitors, which would emit spurious polyfill imports for
        // code the `'true'` replacement has already discarded
        walkAstNodes(node.right, n => skippedNodes.add(n));
        skipProxyGlobal(node.right);
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
    resolveReceiverPolyfill,
    skipProxyGlobal,
    skipWrappedNode,
    sliceBetweenParens,
    unwrapParensSrc,
    wrapSideEffects,
  };
}
