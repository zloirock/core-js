// the proxy-spine channel of the usage-pure emitter: possible-global claims over pristine
// hop runs - the spine climbs, the fold/keep/stand-down verdicts, the guard renders and the
// root/hop claim emissions. created per transform over the factory's shared context
import {
  findProxyGlobal,
  navValueCanShortCircuit,
  discardRescueNodes,
  navGuardTestBase,
  navHasUnresolvableProxyHop,
  peelChainAssignmentDeep,
  peelReceiverSequenceTail,
  planProvenNavGuardCollapse,
  prependChainAssignmentEffect,
  proxyReceiverValueCanBeUndefined,
  resolveKey,
  resolveObjectName,
  aliasRootedReadMayThrow,
  deleteGuardKeepingHop,
  callValueCanBeUndefined,
  inlineCallHasObservableEffects,
  inlineCallProxyGlobalRoot,
  storedUserAssignmentOf,
  storeReadHopOptional,
  vestigialNavOptionals,
  proxyNavSpellsClaimPure,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  planGuardedDestructureNarrow,
  planGuardedStaticNarrow,
} from '@core-js/polyfill-provider/detect-usage/members';
import { renameSplitPropsToSentinels } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  chainValueCarrier,
  CHAIN_HOP_WRAPPER_TYPES,
  climbTransparentWrapperPath,
  deleteHostAboveChain,
  isDestructurePattern,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  mayHaveSideEffects,
  nestedSequenceValueSpelling,
  migratableClaimSe,
  peelParenAndTSParentPath,
  peelParenAndTSSlotChild,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverCarriesLiveOptional,
  SKIPPABLE_WRAPPER_TYPES,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
  subtreeContainsNode,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  assignmentExpression,
  chainExpression,
  cloneNode,
  identifier,
  literal,
  memberExpression,
  sequenceExpression,
  nullFirstGuardTest,
  renderBoundRawBranch,
  renderCtorIdentityNarrow,
  renderNavCollapseLeaf,
  renderNavCollapseTail,
  renderNavGuardTestBase,
} from './builders.js';
import {
  proxyStoreIsSpellable,
  receiverCarriesOptional,
  replaceNodeInTree,
  withSideEffects,
} from './emit-shared.js';
import {
  descendIntoOwnGuard,
  guardProbeUndefinable,
  optionalMemberStaysGuarded,
  probeSpelling,
  replaceGuardedHop,
  sealedClaimThrowProbe,
  sealedLayerAbove,
  sealedPristineHopCollapse,
  sealedThrowRidesTheClaim,
} from './claim-guards.js';
import {
  assignmentHoldsValue,
  foldTailPristineProxyHops,
  emitNestedGuardNavValue,
  foldRealmHopOverCarriedValue,
  foldUnbackedRealmHopsAbove,
  insideMemoClone,
  instanceTailMemoTest,
  isDeleteOperand,
  markSubtreeSkipped,
  memberIsWriteTarget,
  navRootIsProxyIdentifier,
  navigatedMemberAbove,
  noteMutatedCtorHopDestructure,
  peelPristineProxyHops,
  plainProxyHopRunAbove,
  plainRunReadOptionally,
  probeHopInValue,
  probeValueIsInvoked,
  reReadKeptWriteValue,
  respellKeptHop,
  sequenceTailRunAbove,
  sourceSpanKey,
  spineHoldsKeptWrite,
  stepOverKeptWrite,
  swallowDeadSeqWrapper,
  unbackedProxyHopKey,
  unbackedTailRidesAbove,
  valueObservingDestructureSource,
} from './nav-spine.js';
import { effectsPastThrowProbe } from './se-dispatch.js';

// the value a chain of CARRIERS hands on, effects and all: the fold leaves a kept write and a
// re-emitted effect prefix around the binding it landed, and what a member above them reads is
// what they pass through. the peels next door stop at an effect-bearing prefix because their
// callers DROP the span they peel; this one only reads it
function carriedValue(node) {
  let cur = unwrapRuntimeExpr(node);
  for (let next = cur?.expressions?.at(-1) ?? cur?.right; next && chainValueCarrier(cur, next);) {
    cur = unwrapRuntimeExpr(next);
    next = cur?.expressions?.at(-1) ?? cur?.right;
  }
  return cur;
}

export default function createProxySpineChannel(ctx) {
  const {
    adapter,
    deleteHostedSpines,
    destructureEmit,
    hopPeelCtx,
    injectPureImport,
    markRewrite,
    memoValueClones,
    nestedGuardCtx,
    probeTestClones,
    resolveGlobalPolyfill,
    resolvePure,
    resolvedClaimNodes,
    stagedFallbackHosts,
    seKeyReadCtx,
    sealedProbeCtx,
    skippedNodes,
  } = ctx;

  // a postfix `!` is chain-TRANSPARENT (`a?.b!.c` keeps one short-circuit): the split sees
  // through it, and the rebuilt receiver puts the wrapper back on the spine
  function peelNonNullWraps(object) {
    let splitSource = object;
    const nonNullWraps = [];
    while (splitSource.type === 'TSNonNullExpression') {
      nonNullWraps.push(splitSource);
      splitSource = splitSource.expression;
    }
    function rewrapNonNull(receiver) {
      let wrapped = receiver;
      for (let i = nonNullWraps.length - 1; i >= 0; i--) wrapped = { ...nonNullWraps[i], expression: wrapped };
      return wrapped;
    }
    return { splitSource, rewrapNonNull };
  }

  // one guard branch per candidate ctor, innermost-last - both legs chain the same plan list
  function guardChainNode(plan, rawBranch) {
    return renderCtorIdentityNarrow(plan, rawBranch, {
      injectImport: injectPureImport, spellRecv: () => identifier(plan.recvIdent.name),
    });
  }

  // runtime ctor guard render: the DECISION is the shared provider plan,
  // this only composes nodes - `M === _Map ? _Map$groupBy : M.groupBy`, a callee raw branch
  // binding `this` via `.bind(M)`
  function emitGuardedStaticNarrow(meta, metaPath, parent) {
    const memberNode = metaPath.node;
    const plan = planGuardedStaticNarrow({ memberNode, parent, meta, path: metaPath, resolvePure });
    if (!plan) return false;
    if (plan.bail) return true;
    // an effectful sequence prefix on the receiver runs ONCE, ahead of the test - the raw
    // branch reads off the bare identifier
    const memberClone = plan.seqPrefix.length
      ? { ...cloneNode(memberNode), object: identifier(plan.recvIdent.name) }
      : cloneNode(memberNode);
    const rawBranch = plan.isCallee
      ? renderBoundRawBranch(memberClone, identifier(plan.recvIdent.name))
      : memberClone.optional || receiverCarriesOptional(memberClone) ? chainExpression(memberClone) : memberClone;
    let replacement = guardChainNode(plan, rawBranch);
    if (plan.seqPrefix.length) replacement = sequenceExpression([...plan.seqPrefix.map(expr => cloneNode(expr)), replacement]);
    // the source `?.` arrived wrapped in a ChainExpression; the conditional replaces the whole
    // wrapper, the raw branch carries its own
    let target = metaPath;
    if (target.parentPath?.node?.type === 'ChainExpression' && target.parentPath.node.expression === memberNode) {
      target = target.parentPath;
    }
    const consumed = target.node;
    markRewrite();
    target.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    // the WHOLE replacement: the raw branch respells the member, and a revisit re-claiming
    // it would guard the guard
    markSubtreeSkipped(skippedNodes, replacement);
    return true;
  }

  // the DESTRUCTURED spelling of the same read (`const { groupBy: g } = M`): the guard renders
  // as the declarator's value - on a nullish receiver the raw branch dereferences it exactly as
  // the pattern would. only the receiver identifier slot is swapped, so a sequence prefix
  // around it keeps its own claims
  function emitGuardedDestructureNarrow(meta, metaPath) {
    const prop = metaPath.node;
    const pattern = metaPath.parentPath?.node;
    const hostPath = metaPath.parentPath?.parentPath;
    // the statement question is this leg's own: oxc keeps parens as nodes, so the climb peels
    // them before asking whether the assignment's value is discarded
    let stmtUp = hostPath?.parentPath;
    while (stmtUp?.node && unwrapRuntimeExpr(stmtUp.node) !== stmtUp.node) stmtUp = stmtUp.parentPath;
    const admitted = planGuardedDestructureNarrow({
      propNode: prop,
      patternNode: pattern,
      hostNode: hostPath?.node,
      hostInStatement: stmtUp?.node?.type === 'ExpressionStatement',
      meta,
      path: metaPath,
      resolvePure,
    });
    if (!admitted) return false;
    const { plan, split, restResidual, bindingName, hostKind } = admitted;
    const host = hostPath.node;
    const chain = guardChainNode(plan, memberExpression(identifier(plan.recvIdent.name), identifier(meta.key)));
    markRewrite();
    markSubtreeSkipped(skippedNodes, pattern);
    markSubtreeSkipped(skippedNodes, chain);
    // a MULTI-prop pattern becomes one read per prop, in source order, each taking its own guard:
    // the plan answered for all of them, so nothing here waits on a later visit - which is what lets
    // this leg render it at all, its walk never re-entering what it splices
    if (split) {
      const reads = split.map(item => {
        const read = guardChainNode(item.plan,
          memberExpression(identifier(item.plan.recvIdent.name), identifier(item.key)));
        markSubtreeSkipped(skippedNodes, read);
        return read;
      });
      if (hostKind === 'declarator') {
        const declaration = hostPath.parentPath.node;
        declaration.declarations.splice(declaration.declarations.indexOf(host), 1,
          ...split.map((item, index) => ({
            type: 'VariableDeclarator', id: identifier(item.name), init: reads[index],
          })),
          // the REST reads the same receiver BEHIND the reads, with every consumed key renamed to a
          // sentinel so it still gathers exactly what the source left it
          ...restResidual ? [restResidualDeclarator(pattern, plan)] : []);
        return true;
      }
      replaceNodeInTree(hostPath.parentPath.node, host, sequenceExpression(
        split.map((item, index) => assignmentExpression('=', identifier(item.name), reads[index]))));
      return true;
    }
    if (hostKind === 'declarator') {
      host.id = identifier(bindingName);
      if (host.init === plan.recvIdent) host.init = chain;
      else replaceNodeInTree(host.init, plan.recvIdent, chain);
      return true;
    }
    host.left = identifier(bindingName);
    if (host.right === plan.recvIdent) host.right = chain;
    else replaceNodeInTree(host.right, plan.recvIdent, chain);
    // the VALUE-CONSUMING host keeps its native value - the RHS object - as a sequence tail
    if (hostKind === 'assignment-value') {
      const tail = identifier(plan.recvIdent.name);
      markSubtreeSkipped(skippedNodes, tail);
      replaceNodeInTree(hostPath.parentPath.node, host, sequenceExpression([host, tail]));
    }
    return true;
  }

  // the residual the shared rename yields, in this leg's declarator - marked handled whole, since
  // the source's own props are gone from it
  function restResidualDeclarator(patternNode, plan) {
    const id = renameSplitPropsToSentinels(patternNode, destructureEmit.mintUnusedName);
    const residual = { type: 'VariableDeclarator', id, init: identifier(plan.recvIdent.name) };
    markSubtreeSkipped(skippedNodes, residual);
    return residual;
  }

  // a chain-assignment splice point inside the harvested SE: the static claim interleaves
  // it through the canonical prepend; every other arm stays staged on it
  // walk a proxy-hop member spine down to its root: every hop must be a plain (or
  // string-literal computed) POSSIBLE-GLOBAL key, the root a POSSIBLE-GLOBAL identifier
  // with a pure binding. computed-key sequence prefixes are the hops' effects, collected
  // per hop and re-ordered to evaluation order (inner hop first)
  // one hop's key view: the POSSIBLE-GLOBAL name plus the computed-key sequence prefix
  // (its effects); null when the hop is not a pristine proxy step
  function proxyHopKey(node, { allowOptional = false, metaPath = null } = {}) {
    if (node.type !== 'MemberExpression' || (node.optional && !allowOptional)) return null;
    if (!node.computed) {
      const keyName = node.property?.name;
      return keyName && isPristineProxyGlobal(adapter, keyName) ? { keyName, effects: [] } : null;
    }
    let key = unwrapRuntimeExpr(node.property);
    const effects = [];
    // sequence levels NEST (`[(f++, (g++, 'window'))]`): every prefix is an effect of this
    // hop's key, so the peel runs to the quiet tail
    while (key?.type === 'SequenceExpression') {
      effects.push(...key.expressions.slice(0, -1));
      key = unwrapRuntimeExpr(key.expressions.at(-1));
    }
    if (key?.type === 'Literal' && typeof key.value === 'string' && isPristineProxyGlobal(adapter, key.value)) {
      return { keyName: key.value, effects };
    }
    // a VARIABLE key folding to a proxy-global name (`g[k]`, `const k = "self"`) is the
    // same pristine hop - the fold is pure, so no extra effects join
    if (metaPath && key && key.type !== 'Literal' && !effects.length && !mayHaveSideEffects(key)) {
      const folded = resolveKey({ node: key, computed: true, scope: metaPath.scope, adapter, path: metaPath });
      if (typeof folded === 'string' && isPristineProxyGlobal(adapter, folded)) return { keyName: folded, effects };
    }
    return null;
  }

  function collapseProxyHopSpine(node, metaPath, { allowOptional = false, provenCallRoot = false } = {}) {
    const hopEffects = [];
    // sequence PREFIXES on the object spine harvest in evaluation order - the root (and
    // any seq around it) evaluates before every hop key (`(eff(), globalThis).self` ->
    // `(eff(), _globalThis)`); collected top-down, which IS that order
    const rootPrefix = [];
    let cur = node;
    // a kept WRITE inside the spine re-emits WHOLE as an effect and the walk continues
    // through its STORED value to find the root (`(q = globalThis).self` -> `(q =
    // _globalThis, _self)`); only the outermost one is collected - everything below it is
    // already spelled inside its own text, so effects there would run twice
    let keptWrite = null;
    while (cur.type === 'MemberExpression') {
      const hop = proxyHopKey(cur, { metaPath, allowOptional });
      if (!hop) return null;
      if (!keptWrite) hopEffects.push(hop.effects);
      cur = unwrapRuntimeExpr(cur.object);
      for (;;) {
        if (cur?.type === 'SequenceExpression') {
          // observable elements only - a dead prefix (`(0, globalThis)`) re-emits nothing,
          // exactly what the other leg's fold spells
          if (!keptWrite) rootPrefix.push(...cur.expressions.slice(0, -1).filter(mayHaveSideEffects));
          cur = unwrapRuntimeExpr(cur.expressions.at(-1));
          continue;
        }
        if (cur?.type === 'AssignmentExpression' && cur.operator === '=') {
          keptWrite ??= cur;
          cur = unwrapRuntimeExpr(cur.right);
          continue;
        }
        break;
      }
    }
    const keyEffects = hopEffects.toReversed().flat();
    const effects = [...rootPrefix, ...keptWrite ? [keptWrite] : [], ...keyEffects];
    // a proven CALL root with a DEFINED yield collapses like the identifier spelling of the
    // global it yields (DEFINED-yield -> ROOT ponyfill, the claimless-call canon): the value
    // canon keeps the probe-yield twin out - its value never reached the root - and an
    // effect-bearing call re-emits ahead of the hop keys, where the source runs it. never
    // through a kept WRITE (the store canon owns that base), and OPT-IN per consumer: the
    // plain value-read claims and the `delete` fold take it (the delete reaches its slot off
    // the ROOT binding, the base the identifier spelling lands on) - the guard/memo channels
    // keep their own canons. an optional hop declines unless the consumer already ruled every
    // `?.` in the spine dead (the delete fold, the vestigial verdict) - the hops were vetted
    if (cur?.type === 'CallExpression' && metaPath && !keptWrite && provenCallRoot) {
      // a `?.` in the spine declines unless the consumer ruled it dead (`allowOptional`) AND
      // the value under it is proven defined: a LIVE short-circuit reaches what stands above,
      // and the guard channels own that render (the locked `ut()?.window?.self?.x` family)
      for (let scan = node; scan?.type === 'MemberExpression';
        scan = unwrapRuntimeExpr(peelReceiverSequenceTail(scan.object))) {
        if (scan.optional && (!allowOptional || proxyReceiverValueCanBeUndefined(
          unwrapRuntimeExpr(peelReceiverSequenceTail(scan.object)), m => resolvePure(m, metaPath),
          { scope: metaPath.scope, adapter, path: metaPath }))) return null;
      }
      const callCtx = { scope: metaPath.scope, adapter, path: metaPath };
      const rootId = inlineCallProxyGlobalRoot({ callNode: cur, ...callCtx, rejectConditional: true });
      if (!rootId || callValueCanBeUndefined(cur, callCtx, m => resolvePure(m, metaPath))) return null;
      // an effect-bearing call keeps the leaf collapse both legs already spell - the other
      // leg's claimless channel has no slot to replay what the call DID on the way
      if (inlineCallHasObservableEffects({ callNode: cur, ...callCtx })) return null;
      const rootName = POSSIBLE_GLOBAL_OBJECTS.has(rootId.name) ? rootId.name
        : resolveObjectName({ objectNode: rootId, scope: metaPath.scope, adapter, path: metaPath });
      const pure = rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName) && resolveGlobalPolyfill(rootName);
      if (!pure) return null;
      return {
        entry: pure.entry,
        hintName: pure.hintName,
        effects: [...rootPrefix, ...keyEffects],
        keyEffects,
        writeStoreSpellable: true,
      };
    }
    if (cur?.type !== 'Identifier') return null;
    // can the STORED value spell a pure of its own? a spine ending on a backed hop can
    // (`q = globalThis.self` holds `_self`), a window-terminated one cannot - and there the
    // navigation keeps the WRITE as its base instead of re-reading the root
    const writeStoreSpellable = !keptWrite || proxyStoreIsSpellable(keptWrite.right, resolveGlobalPolyfill);
    if (!POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) {
      // an ALIAS of the surface (`const g = globalThis; g.self.Array`) collapses the hops
      // onto the alias itself - the local binding stays spelled, nothing injects (`g.Array`)
      // a MINTED root (`_globalThis` inside an emitted guard test) is not an alias to
      // collapse onto - its hops are the emission's own live reads (the probe semantics)
      if (metaPath && adapter.getBinding(metaPath.scope, cur.name)?.polyfillHint) return null;
      const aliased = metaPath && resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
      if (aliased && POSSIBLE_GLOBAL_OBJECTS.has(aliased) && isPristineProxyGlobal(adapter, aliased)) {
        // the kept write travels with the alias arm too: its stored value decides the base
        // exactly as it does off a pure root (`(t = g.window).self.Array` reads off the write).
        // a write storing the ALIAS ITSELF spells that name, so the base re-reads it instead
        // (`(d = g).self.Atomics` -> `(d = g, g).Atomics`)
        return {
          aliasRoot: cur,
          effects,
          keyEffects,
          keptWrite,
          writeStoreSpellable: writeStoreSpellable || unwrapRuntimeExpr(keptWrite?.right) === cur,
        };
      }
      return null;
    }
    const pure = resolveGlobalPolyfill(cur.name);
    // a root pure cannot back (`window` - there is no `_window`) collapses to nothing: the
    // shape is still known, so the caller decides by POSITION (a value resolves its own
    // claim, a navigation stays raw)
    if (!pure) return { unbackedRoot: cur, effects, keyEffects };
    return { entry: pure.entry, hintName: pure.hintName, effects, keyEffects, keptWrite, writeStoreSpellable };
  }

  // the delete-deciding guard question: the canon's LIVE verdict (`deleteGuardKeepingHop`)
  // union this leg's locked syntactic half - a `?.` whose OWN key is the unresolvable hop
  // keeps its guard here whatever the value below (the ut-family locks). both halves are
  // CALL-root only: an identifier or alias root folds whole (its own claim drives the fold)
  function probeKeyedOptionalIn(node, metaPath) {
    let root = unwrapRuntimeExpr(node);
    while (root?.type === 'MemberExpression') root = unwrapRuntimeExpr(peelReceiverSequenceTail(root.object));
    if (root?.type !== 'CallExpression' && root?.type !== 'OptionalCallExpression') return false;
    for (let cur = unwrapRuntimeExpr(node); cur?.type === 'MemberExpression';
      cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) {
      if (cur.optional && unbackedProxyHopKey(cur, m => resolvePure(m, metaPath))) return true;
    }
    return !!deleteGuardKeepingHop(node, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath });
  }

  // the delete verdict for THIS claim: the live climb while the chain above is still the
  // source's, the spine mark once an earlier emit has rebuilt it
  // `forFold` asks the second half: may that consumer FOLD the navigation's guards? a `delete`
  // reads nothing, so the canon takes the whole nav - EXCEPT where a live `?.` guards the
  // ENVIRONMENT PROBE read itself. that guard is not over a read, it is over whether the delete
  // HAPPENS, and folding it removes a slot off the ponyfill the source never touches
  // (`delete ut()?.window?.self?.chrome` leaves `globalThis.chrome` alone on a realm with no
  // `window`; the folded spelling deletes it). a `?.` over a hop pure CAN spell reads an
  // always-defined ponyfill and folds like its plain twin (`(globalThis.window).self?.Array`)
  function deleteHostForClaim(metaPath, node, { forFold = false, canonOnly = false } = {}) {
    if (!(deleteHostedSpines.has(sourceSpanKey(node))
      || deleteHostAboveChain(metaPath, node, unwrapRuntimeExpr))) return false;
    if (!forFold) return true;
    // the FOLD-BASE arms ask the canon alone (a syntactic own-key `?.` whose value is proven
    // defined is dead and must not demote the root fold to the leaf); the guard stand-downs
    // keep the union below - each half covers the other's blind anchor
    if (canonOnly) {
      return !deleteGuardKeepingHop(node, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath });
    }
    // the keeping-guard question spans the WHOLE deleted navigation: a live `?.` ABOVE this
    // claim still decides whether the delete happens, so the scan anchors at the chain end
    // under the delete - a per-claim anchor let the window hop fold the spine out from under
    // the very guard the `?.self` above it keeps
    let top = metaPath;
    for (let up = top.parentPath; up?.node; up = top.parentPath) {
      const upType = up.node.type;
      const topCore = top.node.type === 'ChainExpression' ? top.node.expression : top.node;
      const climbs = upType === 'ChainExpression' || TRANSPARENT_EXPR_WRAPPER_TYPES.has(upType)
        || (upType === 'MemberExpression' && unwrapRuntimeExpr(up.node.object) === topCore);
      if (!climbs) break;
      top = up;
    }
    const topNode = top.node.type === 'ChainExpression' ? top.node.expression : top.node;
    return !probeKeyedOptionalIn(topNode, metaPath);
  }

  // the kept-root hop collapse first, then the plain static / global claim swap
  // a static / global claim whose receiver navigates a LIVE `?.` over an environment
  // probe (`(held = globalThis)?.window?.self.Array.of(5)`): the erase would drop the
  // source's short-circuit, so the claim rides a guard - the plan's probe read as the
  // test, the substituted binding (with its consumed plain tail) as the alternate
  // the claim's own `?.` over a genuinely undefinable probe renders as a guard
  // (`(w = gw)?.Map` -> `null == (w = gw) ? void 0 : _Map`) - but only TERMINAL: a
  // continuation above owns the render (`...?.self.box.list?.at(0)` rides the later
  // dispatch whole), and a shape the guard routes cannot spell stays raw either
  function emitOwnOptionalGuardedClaim({ meta, metaPath, node, parent, kind, entry, hintName }) {
    // the consumer is found by CLIMBING the path through transparent wrappers - the
    // semantic-parent helper answers a different question and misses a chain-wrapped hop
    const child = peelParenAndTSSlotChild(metaPath, SKIPPABLE_WRAPPER_TYPES) ?? node;
    const up = peelParenAndTSParentPath(metaPath, SKIPPABLE_WRAPPER_TYPES);
    const host = up?.node ?? parent;
    // ... and over an OPAQUE root only a RESOLVED consumer consumes: an unresolvable read
    // above renders nothing, so the guard belongs to this claim (`nr().window?.self
    // .navBox.list` -> `null == nr().window ? void 0 : _self.navBox.list`). over a proxy
    // IDENTIFIER root the collapse family owns the whole nav and this arm stands down
    const proxyRootName = navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName: true });
    const rootIsProxyIdentifier = typeof proxyRootName === 'string'
      ? !!resolveGlobalPolyfill(proxyRootName) : proxyRootName;
    // ... and a CALL of this claim is not a consumer at all: it INVOKES the binding the
    // claim substitutes and renders nothing of its own, so standing down there shipped the
    // static raw (`(globalThis.window?.self)?.Array?.of(5)`). only a call the resolution
    // already claimed owns a render
    // ... and a consumer whose own ctor-fallback swap STAGED renders nothing, so it owns
    // nothing either: standing down for it ships the ctor raw
    // ... and over that root only the nav's OWN hops: the collapse family renders the
    // navigation, never a ctor claim standing above it, so standing down for one leaves it
    // rendered by nobody and its guard lost with it
    const consumedAbove = (rootIsProxyIdentifier && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
      || resolvedClaimNodes.has(host))
      && !stagedFallbackHosts.has(host)
      && ((host?.type === 'MemberExpression'
      && (host.object === child || unwrapRuntimeExpr(host.object) === node))
      || (host?.type === 'CallExpression' && resolvedClaimNodes.has(host)
        && (host.callee === child || unwrapRuntimeExpr(host.callee) === node)));
    if (kind === 'instance' || consumedAbove) return true;
    // a `delete` whose whole navigation folds has no short-circuit for this arm to reproduce -
    // the canon's erase verdict - and the ordinary routes own the folded spelling
    if (deleteHostForClaim(metaPath, node, { forFold: true })) return false;
    if (emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return true;
    // both guard renders declining is not a verdict to ship the claim RAW: the ordinary swap
    // owns those shapes (`delete f?.()?.Map.groupBy` - a `delete` reads nothing over the nav,
    // so the call rides as a discarded prefix and the ctor still substitutes)
    return !!emitLiveOptionalProbeGuard({
      metaPath,
      node,
      entry,
      hintName,
      effects: meta.sideEffects,
      receiverEffectCount: meta.receiverEffectCount,
    });
  }

  function emitStaticOverGuardedNav({
    meta = null,
    metaPath,
    node,
    entry,
    hintName,
    planNode = null,
    declineValueProbe = false,
    sealedRead = false,
    deleteHost = false,
  }) {
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    function resolveHere(m) {
      return resolvePure(m, metaPath);
    }
    // the plan models PROXY hops - claim-adjacent keys (`.Array` under `.of`) peel off
    // first; the claim's own substitution consumes their spelling. a possible-global HOP
    // claim (`.self`) plans over its own node - the claimed hop is the plan's leaf
    let navRoot = planNode ?? node.object;
    let plan;
    for (;;) {
      plan = planProvenNavGuardCollapse({
        rootNode: navRoot,
        scope: metaPath.scope,
        adapter,
        path: metaPath,
        resolvePure: resolveHere,
        throughKeptAssign: true,
        // the guard's test spells the probe hop's own source slice, so a sequence buried at
        // the nav root rides INSIDE it (`null == (e++, ut()).window`) - the staged-corners
        // gate below holds the acceptance to exactly that render
        allowSequenceRoot: true,
      });
      if (plan) break;
      if (navRoot?.type !== 'MemberExpression' || navRoot.computed
        || navRoot.property?.type !== 'Identifier' || navRoot.optional) return false;
      navRoot = unwrapRuntimeExpr(navRoot.object);
    }
    if (plan.kind !== 'nested') return false;
    // undefinability living in the KEPT VALUE belongs to the root route's in-place drop -
    // but only for the claimless HOP entry; a REAL static claim keeps its guard
    if (declineValueProbe && probeHopInValue(plan, plan.hops[plan.lastUnresolvableIdx])) return false;
    // a provably-defined probe stands the whole guard down (babel erases it and rescues
    // the kept write as a comma prefix instead - the plain-swap tail renders that)
    {
      let probe = node.optional ? node.object : null;
      for (let cur = probe ? null : unwrapRuntimeExpr(node.object); cur?.type === 'MemberExpression';
        cur = unwrapRuntimeExpr(cur.object)) {
        if (cur.optional) {
          probe = cur.object;
          break;
        }
      }
      if (probe && !guardProbeUndefinable(probe,
        { metaPath, adapter, resolvePure, observableRead: sealedRead })) return false;
    }
    // staged corners: sequence wrappers, multi-step chain assigns. a ROOT sequence is not
    // one - but only while the test renders as the probe hop's SOURCE SLICE, which carries
    // the prefix inside it (`null == (e++, ut()).window`); a rebuilt base
    // (`navGuardTestBase`) spells the probe from imports and would drop it
    if (plan.seqAroundPrefix?.length || (plan.seqRoot && navGuardTestBase(plan))
      || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) return false;
    // harvested claim effects must be the plan's own (its key SE, its kept write, its root
    // sequence's prefix - spelled once inside the test) - an effect the render has no slot
    // for would be dropped
    if (meta?.sideEffects?.length) {
      const seqPrefix = plan.seqRoot ? plan.rootValueNode.expressions.slice(0, -1) : [];
      const planOwned = new Set([...plan.keySeExprs, plan.rootAssign, ...seqPrefix].filter(Boolean));
      if (meta.sideEffects.some(effect => !planOwned.has(effect))) return false;
    }
    let test = buildNavGuardTest(plan, { metaPath, aliasCtx, resolveHere });
    test = instanceTailMemoTest(test, metaPath, node, seKeyReadCtx);
    const id = injectPureImport(entry, hintName);
    markRewrite();
    replaceGuardedHop({
      hopPath: metaPath,
      test: nullFirstGuardTest(test),
      built: identifier(id),
      skippedNodes,
      alwaysDefined: true,
      deleteHostTail: deleteHost,
      // the ORIGINAL key-effect nodes ride by IDENTITY: a claim inside them fires later in
      // the walk and lands in place (the keep-live carve above the consumed mark)
      leafKeySe: plan.liveKeySeExprs().slice(plan.testKeySeCount),
      resolveHere,
    });
    return true;
  }

  // the guard TEST of a nav plan: the resolvable-base probe read when one exists, else the
  // probe hop's source spelling - root substituted, dead `?.` dropped (the shared
  // vestigial verdict: a hop over the always-defined ponyfill reads plainly)
  function buildNavGuardTest(plan, { aliasCtx, resolveHere }) {
    const base = navGuardTestBase(plan);
    if (base) {
      const test = renderNavGuardTestBase(base, { rootAssign: plan.rootAssign, injectImport: injectPureImport });
      if (plan.rootAssign) substituteProbeProxyRoot(test);
      return test;
    }
    // an UNDEFINABLE call below the probe hop is the deeper source: its own value is
    // what the `?.` tests, and the hop above drops from the test (`(() => globalThis
    // .window?.self)()?.window?...` tests `null == <call>` alone)
    let probeNode = plan.hops[plan.lastUnresolvableIdx].node;
    const probeBelow = unwrapRuntimeExpr(probeNode.object);
    // ... but a call whose OWN `?.()` is the undefinable part is not that source: its spelling
    // already carries that test, and the hop above is the environment probe the source asked
    // for (`oc?.()?.window?.self.Array.of` tests `oc?.()?.window`) - the same exclusion the
    // live-probe descent makes
    if (probeBelow?.type === 'CallExpression' && !probeBelow.optional) {
      // the body may already be REWRITTEN into its guard ternary - that shape is the
      // undefinability proof itself
      const probeCalleeFn = unwrapRuntimeExpr(probeBelow.callee);
      const fnBody = (probeCalleeFn?.type === 'ArrowFunctionExpression' && probeCalleeFn.expression)
        ? unwrapRuntimeExpr(probeCalleeFn.body) : null;
      const guardShapedBody = fnBody?.type === 'ConditionalExpression'
        && fnBody.consequent?.type === 'UnaryExpression' && fnBody.consequent.operator === 'void';
      if (guardShapedBody || proxyReceiverValueCanBeUndefined(
        probeBelow, resolveHere, aliasCtx, { throughChainAssign: true })) {
        probeNode = probeBelow;
      }
    }
    let probe = probeSpelling(probeNode,
      { resolveHere, aliasCtx, substituteProbeProxyRoot, keepLive: skippedNodes.keepLive });
    // a kept write WRAPPING the probe hop rebuilds around the test (`(fh = _globalThis.window)`)
    if (plan.assignWrap) {
      probe = assignmentExpression(plan.assignWrap.operator, cloneNode(plan.assignWrap.left), probe);
    }
    // the probe is a FINISHED spelling: a re-visited claim on it must not re-collapse the
    // load-bearing read (`null == g.window` keeps its hop) - only the kept computed keys'
    // effect claims stay live and land in place
    markSubtreeSkipped(skippedNodes, probe, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    return probe;
  }

  // the ROOT identifier claim of a proxy-hop chain that navigates a LIVE `?.` over an
  // environment probe (`globalThis.window?.self.assignBox.n`): the climb finds the deepest
  // all-proxy member, the plan guards it, and the leaf ponyfill rides the alternate with
  // the plain tail (`null == _globalThis.window ? void 0 : _self.assignBox.n`)
  function emitRootGuardedNavCollapse(metaPath) {
    const climbed = [];
    let cursor = metaPath;
    for (let up = metaPath.parentPath; up?.node; up = up.parentPath) {
      const upNode = up.node;
      // step through the kept write and its wrappers (`(held = globalThis)?.window`):
      // the plan's chain-assign dig owns the store, the climb only finds the leaf
      if ((upNode.type === 'ParenthesizedExpression' && upNode.expression === cursor.node)
        || (upNode.type === 'AssignmentExpression' && upNode.right === cursor.node)) {
        cursor = up;
        continue;
      }
      // a computed hop climbs too (`[(c++, 'self')]`) - the plan's own key resolution
      // validates the fold; a hop it rejects falls back to a shallower leaf below
      if (upNode.type === 'MemberExpression'
        && (upNode.object === cursor.node || unwrapRuntimeExpr(upNode.object) === cursor.node)
        && (upNode.computed || POSSIBLE_GLOBAL_OBJECTS.has(upNode.property?.name))) {
        climbed.push(up);
        cursor = up;
        continue;
      }
      break;
    }
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    function resolveHere(m) {
      return resolvePure(m, metaPath);
    }
    // deepest leaf first; a plan the leaf's key spelling rejects retries one hop down
    for (let at = climbed.length - 1; at >= 0; at--) {
      const leafPath = climbed[at];
      if (!leafPath.node.optional && !receiverCarriesOptional(leafPath.node)) continue;
      const plan = planProvenNavGuardCollapse({
        rootNode: leafPath.node,
        scope: metaPath.scope,
        adapter,
        path: metaPath,
        resolvePure: resolveHere,
        throughKeptAssign: true,
      });
      if (!plan || plan.kind !== 'nested' || !plan.leafPure) continue;
      if (plan.seqAroundPrefix?.length || plan.seqRoot
        || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) continue;
      // undefinability living in the KEPT VALUE (not in a nav hop): the source `?.` already
      // guards it - drop the pristine hop in place and transfer the `?.` to the surviving
      // read (`(r = globalThis.window)?.self.Array...` -> `(r = _globalThis.window)?.Array...`);
      // the root identifier keeps its own ordinary swap
      const probeHop = plan.hops[plan.lastUnresolvableIdx];
      // ... except where that value is INVOKED: the source short-circuits the call away on
      // a nullish root, so the hop's read must survive as the callee and the guard renders
      if (probeHopInValue(plan, probeHop) && !probeValueIsInvoked(leafPath)) {
        dropValueProbeNavHops(plan, climbed);
        return false;
      }
      const test = buildNavGuardTest(plan, { aliasCtx, resolveHere });
      // the leaf's key effects wrap the PURE binding, the absorbed tail hangs outside
      // (`(c++, _self).Array` - the nav-collapse leaf shape); nav hops ABOVE the collapse
      // hang back on in their SOURCE spelling (`_self['window']`, a raw `.window` read)
      const leaf = renderNavCollapseLeaf(plan,
        identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName)), { cloneHost: cloneNode });
      const built = renderNavCollapseTail(plan, leaf, { cloneHost: cloneNode });
      markRewrite();
      replaceGuardedHop({
        hopPath: leafPath,
        test: nullFirstGuardTest(test),
        built,
        skippedNodes,
        alwaysDefined: true,
        resolveHere: m => resolvePure(m, metaPath),
      });
      return true;
    }
    return false;
  }

  // undefinability living in the KEPT VALUE: the source `?.` already guards it - drop the
  // pristine nav hops in place, transfer the `?.` to the surviving read, MIGRATE dropped SE
  // key effects into its key (`?.[(c++, 'self')]?.Array` -> `?.[c++, "Array"]`); the root
  // identifier keeps its own ordinary swap - it renders nothing itself
  function dropValueProbeNavHops(plan, climbed) {
    const outside = climbed.filter(path => !(Number.isInteger(path.node.start)
      && path.node.start >= plan.rootAssign.start && path.node.end <= plan.rootAssign.end));
    // the climb reaches PAST the proxy run (a computed hop rides along for the plan's own
    // key resolution): only the leading run of real proxy hops drops, the first read the
    // fold rejects is the SURVIVOR (`?.self["Array"]` -> `?.["Array"]`)
    const effects = [];
    const navClimbed = [];
    for (const path of outside) {
      const hop = proxyHopKey(path.node, { allowOptional: true });
      if (!hop) break;
      effects.push(...hop.effects);
      navClimbed.push(path);
    }
    if (!navClimbed.length) return;
    // a TS wrapper on the dropped span is consumed with it (`((d = gw)?.self as any).Array`
    // -> `(d = _globalThis.window).Array`) - the substituted spelling needs no assertion
    let top = navClimbed.at(-1);
    // a SEAL (parens, a TS wrapper) ends the chain: the read above it is unconditional, so
    // the dropped hop's `?.` does NOT travel to the survivor - the wrapper itself is
    // consumed with the span it sealed (`((d = gw)?.self as any).Array` -> `(d =
    // _globalThis.window).Array`)
    let crossedSeal = false;
    while (top.parentPath?.node?.expression === top.node
      && SKIPPABLE_WRAPPER_TYPES.has(top.parentPath.node.type)) {
      crossedSeal ||= top.parentPath.node.type !== 'ChainExpression';
      top = top.parentPath;
    }
    const above = top.parentPath?.node;
    // the survivor takes the migrated key effects in either spelling: a dotted key becomes the
    // literal the sequence ends on, a COMPUTED one keeps its own expression there
    // (`?.[(c++, 'self')]['Array']` -> `?.[c++, 'Array']`)
    const survivorTakesKey = above?.type === 'MemberExpression'
      && (above.computed ? !!above.property : above.property?.type === 'Identifier');
    if (effects.length && !survivorTakesKey) return;
    const wasOptional = !crossedSeal && navClimbed.some(path => path.node.optional);
    markRewrite();
    top.replaceWith(navClimbed[0].node.object);
    if (above?.type === 'MemberExpression' && wasOptional) above.optional = true;
    if (effects.length) {
      above.property = sequenceExpression([...effects.map(expr => cloneNode(expr)),
        above.computed ? above.property : literal(above.property.name)]);
      above.computed = true;
    }
  }

  // substitute the pristine proxy root inside a cloned guard test - the clone detaches
  // from the walk before its own claim would land
  function substituteProbeProxyRoot(root) {
    let spine = root;
    while (spine && typeof spine === 'object') {
      if (spine.type === 'AssignmentExpression') {
        spine = unwrapRuntimeExpr(spine.right);
        continue;
      }
      if (spine.type === 'MemberExpression') {
        spine = unwrapRuntimeExpr(spine.object);
        continue;
      }
      if (spine.type === 'SequenceExpression') {
        spine = unwrapRuntimeExpr(spine.expressions.at(-1));
        continue;
      }
      // an IIFE ROOT spells its proxy global inside the body the call yields - the probe is a
      // finished clone the walk never revisits, so the root must substitute here or a raw
      // `globalThis` reaches the output (`(() => globalThis)()?.window` tests the ponyfill)
      if (spine.type === 'CallExpression' && !spine.optional) {
        const callee = unwrapRuntimeExpr(spine.callee);
        if (callee?.type === 'ArrowFunctionExpression' && callee.expression) {
          spine = unwrapRuntimeExpr(callee.body);
          continue;
        }
      }
      break;
    }
    if (spine?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(spine.name)
      && isPristineProxyGlobal(adapter, spine.name)) {
      const pure = resolveGlobalPolyfill(spine.name);
      if (pure) spine.name = injectPureImport(pure.entry, pure.hintName);
    }
  }

  // the live-`?.` probe guard of the generic static claim, extracted for its size; true
  // when the guard rendered (the caller returns)
  // eslint-disable-next-line max-statements -- sequential emission steps of one probe guard
  function emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount }) {
    // the collapse owns the shape wherever a `delete` may still fold it
    if (deleteHostForClaim(metaPath, node, { forFold: true })) return false;
    let cur = unwrapRuntimeExpr(node.object);
    let plainHops = true;
    // the claim's OWN `?.` probes its object directly (`(w = gw)?.Map` -> the write is
    // the probe); otherwise the deepest optional hop inside the receiver carries it
    let probe = node.optional ? node.object : null;
    while (!probe && cur?.type === 'MemberExpression') {
      if (cur.optional) {
        probe = cur.object;
        break;
      }
      // a LITERAL STRING key is the same plain read in its computed spelling
      // (`...?.self['Array'].from` folds like `.Array` - the guard survives either)
      const literalKey = cur.computed && unwrapRuntimeExpr(cur.property)?.type === 'Literal'
        && typeof unwrapRuntimeExpr(cur.property).value === 'string';
      if (!literalKey && (cur.computed || cur.property?.type !== 'Identifier')) plainHops = false;
      cur = unwrapRuntimeExpr(cur.object);
    }
    if (!probe && cur?.type === 'CallExpression' && cur.optional) probe = cur;
    // a claim NAVIGATED further reads a value THROUGH the probe, and a nested sequence
    // leaves that value unproven (`(d++, (c++, globalThis))?.Map.name` keeps its guard);
    // a whole-swap leaf reads nothing through it (`....Array.of` erases)
    const navigatedAbove = metaPath.parentPath?.node?.type === 'MemberExpression'
            && unwrapRuntimeExpr(metaPath.parentPath.node.object) === node;
    // ... and a BARE call value stays unproven for an INSTANCE dispatch reading it: that
    // dispatch takes the value THROUGH its receiver, so babel memoizes the call into the
    // guard test (`(call)?.self.Map.name` keeps `null == (_ref = call())`)
    const instanceReadAbove = navigatedAbove && unwrapRuntimeExpr(probe)?.type === 'CallExpression'
            && !unwrapRuntimeExpr(probe).optional
            && resolvePure({
              kind: 'property', object: 'function', placement: 'prototype',
              key: metaPath.parentPath.node.computed ? null : metaPath.parentPath.node.property?.name,
            }, metaPath)?.kind === 'instance';
    const probeUndefinable = !!probe && (instanceReadAbove || guardProbeUndefinable(probe,
      { metaPath, adapter, resolvePure, nestedSeqUnproven: navigatedAbove }));
    // a deeper `?.` under a CTOR-keyed hop is the real source - the ctor key is not a
    // probe (`(globalThis.window.self)?.Promise?.resolve(1)` tests the seal's own read);
    // the claim's OWN ctor key descends too (`...self?.Array?.of` - `Array` has no pure
    // ctor entry but IS the claim's object)
    const claimCtor = hintName?.includes('$') ? hintName.split('$', 1)[0] : null;
    // a hop whose OBJECT is an undefinable CALL descends - there the call is the source and
    // the test reads it alone (`<short-circuit call>?.window?...`). a MEMBER object stays:
    // the plan canon tests the DEEPER PREFIX (`lastUnresolvableIdx`'s own node), so stacked
    // unresolvable hops keep the source's `?.` inside the test (`_globalThis.window?.window`,
    // babel's spelling) instead of descending to the bottom probe
    function deeperSourceUndefinable(objNode) {
      const objValue = unwrapRuntimeExpr(objNode);
      if (objValue?.type !== 'CallExpression' || objValue.optional) return false;
      const fnCallee = unwrapRuntimeExpr(objValue.callee);
      const fnBody = (fnCallee?.type === 'ArrowFunctionExpression' && fnCallee.expression)
        ? unwrapRuntimeExpr(fnCallee.body) : null;
      if (fnBody?.type === 'ConditionalExpression'
        && fnBody.consequent?.type === 'UnaryExpression' && fnBody.consequent.operator === 'void') return true;
      return proxyReceiverValueCanBeUndefined(objValue, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }, { throughChainAssign: true });
    }
    for (let inner = probe && unwrapRuntimeExpr(probe);
      inner?.type === 'MemberExpression' && inner.optional && !inner.computed
        && (resolveGlobalPolyfill(inner.property?.name) || inner.property?.name === claimCtor
          || deeperSourceUndefinable(inner.object));
      inner = unwrapRuntimeExpr(probe)) {
      probe = inner.object;
    }
    // a PAREN-SEALED probe renders as a guard of its OWN, and the test reads that guard's
    // source - the inner `?.`'s object - not the whole rendered value
    // (`(globalThis.window?.self.window)?.Array.of(9)` tests `_globalThis.window`)
    const descended = descendIntoOwnGuard(probe, { metaPath, adapter, resolvePure });
    const sealedDescent = !!descended;
    if (descended) probe = descended;
    // the harvested receiver effect may BE the probe (the chain-root call detection
    // collected) - it moves into the test, not a seq prefix
    // the claim-SE migration canon positions every harvested effect against the FINAL probe
    // (post-descent: an inner `?.` hop or a seal moves it, and the outer wrapper's prefix must
    // not swallow a leading effect): one BEFORE it (a receiver prefix) runs ahead of the whole
    // ternary, one BETWEEN the probe and the claim - a dropped hop's computed key
    // (`W?.[(n++, 'Array')].from`) as much as the claim's own key - runs INSIDE the alternate,
    // where native reaches it only past the short-circuit. the local split by the claim's own
    // key was blind to the dropped-hop key and ran it on the nullish path; an effect INSIDE the
    // probe stays with the cloned test spelling. a position-less input (a rebuilt subtree)
    // cannot be placed - stand down to the raw claim
    const migration = probe
      ? migratableClaimSe({ sideEffects: effects ?? [], receiverEffectCount, rootNode: probe, end: node.end })
      : { leading: effects ?? [], migrated: [] };
    if (!migration && effects?.length) return false;
    const keySe = migration?.migrated?.length ? migration.migrated : null;
    const navSe = migration ? migration.leading : effects;
    const effectsAreProbe = !navSe?.length
            || (navSe.length === 1
              && (navSe[0] === probe || unwrapRuntimeExpr(navSe[0]) === unwrapRuntimeExpr(probe ?? {})));
    if (probe && probeUndefinable && plainHops && (!keySe || keySe.length)) {
      const id = injectPureImport(entry, hintName);
      markRewrite();
      // the memoized probe respells bare: parens and TS wrappers around the write drop
      // (`((a = gw) as any)?.self...` -> `null == (_ref = a = _globalThis.window)`);
      // trailing ERASABLE hops drop too - the test reads at most the probe hop itself
      let probeSource = unwrapRuntimeExpr(probe);
      // a KEPT WRITE anchors the prefix: the sequence stays whole inside the test beside it
      // (`null == (eff(), t = _self.window) ? void 0 : ...`, the kept-root canon). without
      // one the harvested prefix was lifted and the clone reads the quiet tail
      const probeSeqTail = probeSource?.type === 'SequenceExpression'
        ? unwrapRuntimeExpr(probeSource.expressions.at(-1)) : null;
      // ... except where the probe was reached by descending INTO a SEAL: the seal renders its
      // own value, and the prefix it carried runs ahead of the whole guard there
      // ... and a NESTED sequence keeps its whole spelling too: the value canon stopped there,
      // so the test reads what the source wrote (`(d++, (c++, globalThis))?.Map.name`)
      const keepSeqInTest = !sealedDescent
              && (probeSeqTail?.type === 'AssignmentExpression' || nestedSequenceValueSpelling(probeSource));
      const droppedSeqPrefix = [];
      for (;;) {
        if (probeSource?.type === 'SequenceExpression' && !keepSeqInTest) {
          droppedSeqPrefix.push(...probeSource.expressions.slice(0, -1));
          probeSource = unwrapRuntimeExpr(probeSource.expressions.at(-1));
          continue;
        }
        const peeled = peelPristineProxyHops(probeSource, hopPeelCtx);
        if (peeled !== probeSource) {
          probeSource = peeled;
          continue;
        }
        break;
      }
      // the un-memoized probe respells its DEAD `?.` plain - a proven root subsumes the
      // hop's own nullish check into the test (`null == ignores(1).window`, babel's
      // spelling); the split's memoized probe keeps the source `?.` instead
      // effects that are NOT the probe still have a slot: they prefix the WHOLE ternary
      // (`(n++, null == _globalThis.window ? void 0 : _Promise$resolve(1))`, babel's
      // wrap) - unless the probe's own spelling CARRIES them (a root call with an
      // effectful argument reads once in the test; a prefix would run it twice)
      // effects the probe's FINAL spelling carries stay with it - a prefix would run them
      // twice (a root call with an effectful argument reads once in the test)
      const prefixSe = [
        ...!effectsAreProbe && navSe?.length
          && navSe.some(effect => !subtreeContainsNode(probeSource, effect)) ? navSe : [],
        // a sequence prefix the test peeled away has no other slot: it runs ahead of the guard,
        // where the source ran it - before the probe read. a QUIET one observes nothing and
        // dies with the spelling it prefixed (`(1, globalThis.window)`)
        ...droppedSeqPrefix.filter(effect => mayHaveSideEffects(effect) && !(navSe ?? []).includes(effect)),
      ];
      const probeInner = cloneNode(probeSource);
      // a sequence KEPT whole still navigates: a tail the peel erases whole folds onto its
      // outermost hop's own ponyfill (`(c++, globalThis.self)` tests `_self` - the realm-fold
      // canon, the spelling the babel leg's plan lands too), a probe stopping the peel takes
      // the guarded value render the fold owns
      if (keepSeqInTest) {
        foldTailPristineProxyHops(probeInner, {
          ...hopPeelCtx,
          injectPureImport,
          aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
          // the clone IS the guard test - a VALUE position, where an alias root's kept value
          // folds to the leaf ponyfill like the direct twin
        });
      }
      // the clone IS the guard test: a claim re-visited inside it renders the read the test
      // performs, so an unbacked hop in it stays load-bearing instead of folding away
      probeTestClones.add(probeInner);
      for (const hop of vestigialNavOptionals(probeInner, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath })) hop.optional = false;
      const probeClone = receiverCarriesOptional(probeInner) || probeInner.optional === true
        ? chainExpression(probeInner) : probeInner;
      const test = nullFirstGuardTest(instanceTailMemoTest(probeClone, metaPath, node, seKeyReadCtx));
      const tailAbove = climbTransparentWrapperPath(metaPath).parentPath?.node;
      replaceGuardedHop({
        hopPath: metaPath,
        test,
        built: identifier(id),
        skippedNodes,
        // the NAV route: the alternate is the claim's own pure over the collapsed spine, and the
        // source read THROUGH it - so an optional tail rides the branch with its `?.` kept
        // (`p()?.window?.Promise.resolve(4)?.then?.(f)`), exactly as a plain tail already does
        navAlternate: true,
        // the deleted member rides OUTSIDE the ternary behind a `?.` of its own (the
        // delete-guard canon) - absorbed into the alternate the ternary evaluates a read
        // and the delete deletes nothing
        deleteHostTail: deleteHostForClaim(metaPath, node),
        resolveHere: m => resolvePure(m, metaPath),
        prefixSe: prefixSe.length ? prefixSe.map(effect => cloneNode(effect)) : null,
        leafKeySe: keySe?.length ? keySe.map(effect => cloneNode(effect)) : null,
      });
      // ... and that tail answers the shared vestigial verdict like every other read off an
      // always-defined leaf: the source's `?.` over the ponyfill the alternate landed is dead text
      if (tailAbove?.type === 'MemberExpression') {
        for (const hop of vestigialNavOptionals(tailAbove, m => resolvePure(m, metaPath),
          { scope: metaPath.scope, adapter, path: metaPath })) hop.optional = false;
      }
      // a realm hop reading the guarded value THROUGH a store keeps the probe but not the hop:
      // the defined branch is the ponyfill the hop folds onto, and the void branch still
      // short-circuits on the `?.` that slides one member up, whichever spelling roots the probe
      // (`(v = ga.window?.self)?.window.X` -> `(v = <guard>)?.X`); the fold's own climb gates on
      // the kept store
      foldRealmHopOverCarriedValue(metaPath, { adapter, resolvePure: m => resolvePure(m, metaPath) });
      return true;
    }
    return false;
  }

  // is a proxy spine NAVIGATED further (a claim key above - `globalThis.self.Array` - or a
  // destructure pattern reading a spine the value canon calls DEFINED)? then it folds onto the
  // ROOT binding, babel's nav collapse; wrappers and sequence TAILS are transparent to the
  // question (`(n++, globalThis.self)[k]` navigates). every other consumer - an argument slot, a write's
  // right side, a bare statement, a clean-spine pattern init - holds the VALUE and spells
  // the claim's own pure. the same verdict decides an unbacked root: a value resolves it,
  // a navigation stays raw
  // the positional verdict: `navigated` decides root-vs-value, `mutatedAbove` says the read
  // above must reach the user's patch and so keeps the NEAREST surface as its base
  function spineIsNavigated(targetPath, keptTail = [], keptWrite = null, { deadOptional = false } = {}) {
    let child = targetPath.node;
    let navHost = targetPath.parentPath;
    while (navHost?.node) {
      const wrap = navHost.node;
      const transparent = SKIPPABLE_WRAPPER_TYPES.has(wrap.type)
        || (wrap.type === 'SequenceExpression' && wrap.expressions.at(-1) === child);
      if (!transparent) break;
      child = wrap;
      navHost = navHost.parentPath;
    }
    const host = navHost?.node;
    // a DESTRUCTURE reads slots off the spine: with unresolvable hops KEPT it must fold to
    // the root (`const { x } = globalThis.self.window` - a value render would read
    // `.window` off the ponyfill)
    const patternHost = (host?.type === 'VariableDeclarator' && host.init === child
      && isDestructurePattern(host.id))
      || (host?.type === 'AssignmentExpression' && host.right === child
        && isDestructurePattern(host.left));
    // a MUTATED slot READ above keeps the VALUE spelling: the read must reach the user's
    // patch through the nearest proxy hop's ponyfill (`globalThis.self.Set.name` ->
    // `_self.Set`, the mutated-static receiver canon). under a `delete` the canon has spoken
    // for the whole navigation - asked of the OPERAND alone it answered per node shape, so
    // one tail step above it (`delete nav.Promise[k]`) flipped the surface the same source
    // lands on everywhere else, and both spellings name the one object either way
    // ... and only where the slot is POLYFILLABLE: substituting there would answer the
    // ponyfill instead of the patch. a plain user key has no ponyfill to lose, so its nav
    // folds to the root like any other read
    // the WRITE TARGET arm is computed first: a write does not READ the patched slot, so
    // the mutated rule never applies to it (same reasoning as `delete`)
    const writeTargetAbove = host?.type === 'MemberExpression' && host.object === child
      && memberIsWriteTarget(navHost);
    // the slot the mutation sits on decides how far the `delete` carve-out reaches. an ORDINARY
    // global is READ off whichever surface the fold lands, and both name the one object, so the
    // whole-navigation verdict holds one tail step above the operator too (`delete nav.Promise[k]`).
    // a mutated PROXY HOP holds the user's replacement instead of the surface, so only the delete
    // of that slot ITSELF - which reads nothing - may fold past it
    const deleteFoldsTheRead = POSSIBLE_GLOBAL_OBJECTS.has(host?.property?.name)
      ? isDeleteOperand(navHost) : deleteHostAboveChain(navHost, host, unwrapRuntimeExpr);
    const mutatedAbove = host?.type === 'MemberExpression' && host.object === child && !host.computed
      && isMutatedGlobalSlot(adapter, host.property?.name) && !!resolveGlobalPolyfill(host.property.name)
      && !deleteFoldsTheRead && !writeTargetAbove;
    // a `delete` performs no read, so its nav collapses whole; with a kept WRITE spelled
    // in the way, the surface after it is the claim's OWN pure rather than a root re-read
    // (`delete (d = globalThis.window).self.k` -> `delete (d = _globalThis.window, _self).k`)
    // ... but only where the STORE holds a navigation of its OWN: `(v = globalThis)` hands on the
    // very surface the root binding spells, so re-reading it there is the plain fold
    // ... and only while nothing stands ABOVE the store: a kept REALM tail over it is a read the
    // delete performs nothing through, so the whole navigation folds and the base is the root the
    // collapse landed (`delete (g = globalThis, v = g.self)?.window.X` deletes off `g`)
    if (keptWrite && isDeleteOperand(navHost) && !keptTail.length
      && unwrapRuntimeExpr(keptWrite.right)?.type !== 'Identifier') return { navigated: false, mutatedAbove: false };
    // a WRITE TARGET keeps the VALUE spelling - except over a KEPT TAIL, which the value
    // render would respell off the ponyfill (`_self.window.WeakSet = f` reads `.window` on
    // an engine that has none): there it folds to the root like any read
    // a LIVE `?.` above reads the KEPT TAIL's own value - that read is the environment probe
    // the source wrote (`globalThis.self.window?.WeakRef` tests `_self.window`), so the tail
    // stays spelled and this is not a plain fold
    // ... unless the guards are already DEAD (a `delete` reads nothing over its navigation):
    // there the tail folds away like any other hop (`delete globalThis.window?.frames.k`)
    const optionalOverKeptTail = !deadOptional && !!keptTail.length && host?.type === 'MemberExpression'
      && host.object === child && host.optional;
    // ... and a WRITE TARGET over a nav that FOLDED HOPS and kept nothing - no tail to respell, no
    // write of its own to read the slot off - addresses it on the ROOT the fold landed, the base its
    // `delete` twin already takes (`(globalThis.self.window?.self).Box = v` -> `_globalThis.Box = v`).
    // a nav whose LEAF is the claim folded nothing and keeps its own value spelling
    // (`globalThis.self[Symbol.iterator]++` writes `_self`)
    // ... a PATTERN over a value the canon calls absent-able is the environment PROBE: the
    // always-defined root would destructure where native throws, so the init keeps the VALUE
    // spelling with its raw kept hop (`= _globalThis.window`, babel's kept shape); only a
    // DEFINED spine (a deep hop is a realm self-reference) folds under the pattern
    const navigated = (host?.type === 'MemberExpression' && host.object === child
      && !writeTargetAbove && !mutatedAbove && !optionalOverKeptTail)
      || (!!keptTail.length && ((patternHost && deadOptional) || writeTargetAbove))
      || (writeTargetAbove && !keptTail.length && !mutatedAbove && deadOptional
        && unwrapRuntimeExpr(unwrapRuntimeExpr(targetPath.node)?.object)?.type === 'MemberExpression');
    // the two positional flags stay INTERNAL: they are terms of `navigated`, and the one consumer
    // that read them separately weighed them against the key spelling - the canon owns that now
    return { navigated, mutatedAbove };
  }

  // the extension stepped over a kept WRITE: the write re-emits carrying the spine's own
  // VALUE spelling, and the base beside it is the outer run's own verdict
  function renderCollapseOverKeptWrite({
    target,
    consumed,
    writeStep,
    innerKeptTail,
    keptTail,
    outerHopName,
    outerEffects,
    seqPrefixEffects = [],
    collapsed,
    entry,
    hintName,
    navigated,
  }) {
    // a NAVIGATED render folds the tail away - its key effects still run, joining the outer set
    if (navigated) for (const kept of keptTail) outerEffects.push(...kept.keySe);
    const innerBase = innerKeptTail.reduce(respellKeptHop, identifier(injectPureImport(entry, hintName)));
    const outerPure = resolveGlobalPolyfill(navigated || !outerHopName ? collapsed.hintName : outerHopName);
    // an ALIAS root spells the base with its own binding, exactly as the write-less collapse does
    // (`(g = globalThis, v = g.self)?.window.X` re-reads `g`); a base neither the alias nor the pure
    // build can spell has no render here, and the ordinary claim swap owns that shape
    // ... and only where the stored value carries NO effects of its own: with one in it the source
    // sequence is what runs them, and re-reading the root beside it is a second spelling of the
    // same run - THERE the store itself stays the value the source hands on: the folded hop drops
    // in place, the sequence's own tail keeps the read, and the dropped hop's probe rides onto the
    // consumer above (`(g = globalThis, v = g[(eff(), 'window')].self)?.window.X` ->
    // `(g = _globalThis, v = (eff(), _self))?.X` - the other emitter's spelling of this fold).
    // a folded KEY effect has no slot in this shape and keeps the ordinary decline
    if (navigated && collapsed.aliasRoot && collapsed.effects?.length && !outerEffects.length) {
      const consumer = target.parentPath?.node;
      if (consumer?.type !== 'MemberExpression' || unwrapRuntimeExpr(consumer.object) !== target.node) return false;
      if (target.node.optional) consumer.optional = true;
      const inPlaceWrite = assignmentExpression('=',
        cloneNode(writeStep.left), withSideEffects(innerBase, collapsed.effects));
      // the sequence prefix is CARRIED, not cloned: this render replaces the source subtree, and a
      // cloned kept write (`g = globalThis`) is a node the write-origin census never saw - the
      // alias's later reads then lost their agreement and the twin of this very source kept its hop
      target.replaceWith(sequenceExpression([...seqPrefixEffects, inPlaceWrite]));
      markSubtreeSkipped(skippedNodes, consumed);
      skippedNodes.add(target.node);
      return true;
    }
    const outerBase = collapsed.aliasRoot && !collapsed.effects?.length ? cloneNode(collapsed.aliasRoot)
      : outerPure && identifier(injectPureImport(outerPure.entry, outerPure.hintName));
    if (!outerBase) return false;
    // an unresolvable tail respells over the base only in VALUE position - a navigation
    // folds it away, exactly as the plain (write-less) collapse does
    const base = (navigated ? [] : keptTail).reduce(respellKeptHop, outerBase);
    const write = assignmentExpression('=', cloneNode(writeStep.left), withSideEffects(innerBase, collapsed.effects));
    // an unbacked TAIL in VALUE position reads off the WRITE itself: re-reading it off the
    // ponyfill root would spell a `.window` the engine may not have, and the value the source
    // yields is the one the write stored (`(k = globalThis.self).window` -> `(k = _self).window`)
    const readsOffWrite = !navigated && keptTail.length && !outerEffects.length;
    // a SEQUENCE the climb stepped over is replaced WHOLE, so its prefix re-emits ahead of the
    // write - where the source ran it
    const prefix = seqPrefixEffects.map(effect => cloneNode(effect));
    const rendered = readsOffWrite
      ? keptTail.reduce(respellKeptHop, withSideEffects(write, prefix))
      : sequenceExpression([...prefix, write, ...outerEffects.map(effect => cloneNode(effect)), base]);
    target.replaceWith(rendered);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(rendered);
    // the sequence hands its TAIL on, and a re-read base is the always-defined root binding - a
    // `?.` reading it guards nothing (`(c = _self, _globalThis)?.Box` reads plainly, babel's
    // spelling); a respelled unbacked tail is not that shape and the erase arm skips it itself
    if (!readsOffWrite) {
      deoptionalizeOverSubstituted({ metaPath: target, node: consumed, replacement: rendered, proxyRoot: true });
    }
  }

  // the collapse render of a possible-global hop claim, extracted for its size: the
  // upward extension, the navigation verdict and the base spelling live here

  // a `?.` the shared vestigial verdict calls DEAD reads the always-defined binding this claim
  // substitutes, so the run over it is the plain twin. ONE reading for every collapse route - the
  // root claim's own run and the hop claim's spine ask it the same way
  function deadOptionalHopAt(metaPath) {
    return hop => vestigialNavOptionals(hop, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath }).includes(hop);
  }

  // the collapse EXTENDS UP through enclosing pristine hops and, once, over a kept WRITE:
  // it returns the widened target plus what the climb collected
  function extendCollapseUpward(metaPath, { allowOptional, deadOptionalHop = null }) {
    let target = metaPath;
    const outerEffects = [];
    // an enclosing SEQUENCE whose TAIL the spine is: its prefix evaluates ahead of everything
    // the spine spells, so it leads the rebuilt effects. the climb walks OUTWARD, so each
    // level unshifts in front of the ones already collected (`(c++, (d++, globalThis.self))
    // .window` runs `c++` first)
    const seqPrefixEffects = [];
    // hops pure cannot back (`window`) are swallowed too, but remembered: in VALUE
    // position they respell over the collapsed base, in navigation they fold away
    let keptTail = [];
    // a kept WRITE between the collapsed spine and further proxy hops: the write keeps the
    // spine's own VALUE spelling and the hops above it fold on around it
    // (`delete (d = globalThis.window)?.self.k` -> `delete (d = _globalThis.window, _self).k`)
    let writeStep = null;
    let innerKeptTail = null;
    let outerHopName = null;
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      if (!writeStep) {
        const over = stepOverKeptWrite(up, target, { allowOptional, metaPath, proxyHopKey, deadOptionalHop });
        if (over) {
          writeStep = up.node;
          innerKeptTail = keptTail;
          keptTail = [];
          target = over;
          continue;
        }
      }
      // the estree CHAIN marker is not a layer the source wrote - it is how this dialect spells the
      // very `?.` the climb is already reading. stepped over only where the canon has already spoken
      // for the whole navigation (a folding `delete`): elsewhere the marker ends what this collapse owns
      if (allowOptional && up.node.type === 'ChainExpression' && up.node.expression === target.node) {
        target = up;
        continue;
      }
      // a TRANSPARENT wrapper sitting on the collapsed span is consumed WITH it - the substituted
      // spelling needs neither the assertion nor the paren (`((d = globalThis.window)?.self as any)
      // .Array` -> `(d = _globalThis.window).Array`), the same rule the plain claim swap follows.
      // the paren is the half only this dialect has a node for, and stopping the climb on it left
      // the run half-folded where the bare twin folds whole (`(globalThis.window.self)?.window.X`)
      if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(up.node.type) && up.node.expression === target.node) {
        // only a fully SUBSTITUTED span consumes its wrapper: with an unresolvable hop still
        // respelled from source below it, the assertion is about that source read and stays
        // (`(k = globalThis.window!)` keeps its `!`, `((d = gw)?.self as any).Array` does not)
        if (keptTail.length) break;
        // ... and a wrapper the KEPT WRITE holds belongs to the STORED spelling this collapse
        // re-emits as its own effect (`(k = globalThis.self as any).Math.trunc(1)` keeps the cast)
        if (assignmentHoldsValue(up)) break;
        target = up;
        continue;
      }
      // ... and only where a proxy hop actually reads the run: without one there is no collapse
      // to extend, and consuming the span would respell it for nothing
      if (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === target.node) {
        const run = sequenceTailRunAbove(up);
        if (!run || !proxyHopKey(run.member, { allowOptional: true, metaPath })) break;
        seqPrefixEffects.unshift(...run.prefixes, ...up.node.expressions.slice(0, -1));
        target = run.top;
        continue;
      }
      if (up.node.object !== target.node) break;
      // a `?.` over the ALWAYS-DEFINED collapsed prefix is vestigial and erases with the
      // respell (`(k = globalThis.self?.window)` -> `k = _self`); once a kept
      // unresolvable hop sits below, the base is undefinable and the `?.` stands
      const hop = proxyHopKey(up.node, { allowOptional: allowOptional || !keptTail.length });
      if (!hop) break;
      if (!resolveGlobalPolyfill(hop.keyName)) {
        // an UNBACKED hop (`window` - no `_window`) joins the kept tail WITH its own key
        // effects: a backed hop above clears it (the deep-nav realm collapse folds the hop,
        // effects and all), and a tail that survives TERMINAL respells over the base with
        // the effects in its key (`globalThis[eff(), 'window']` -> `_globalThis[eff(),
        // 'window']`, babel's spelling) - folding it would hand the read an always-defined
        // ponyfill where the source discriminates the realm
        keptTail.push({ keyName: hop.keyName, keySe: hop.effects });
      } else {
        for (const kept of keptTail) outerEffects.push(...kept.keySe);
        keptTail = [];
        outerEffects.push(...hop.effects);
        if (writeStep) outerHopName = hop.keyName;
      }
      target = up;
    }
    return { target, outerEffects, seqPrefixEffects, keptTail, writeStep, innerKeptTail, outerHopName };
  }

  function renderProxySpineCollapse({
    metaPath,
    collapsed,
    entry,
    hintName,
    allowOptional = false,
    deadOptionalHop = null,
  }) {
    // the collapse EXTENDS UP through enclosing pristine hops: an outer `['window']`
    // step has no pure claim of its own, yet its key effect folds into the same root
    // sequence, after the inner ones (evaluation order)
    const { target, outerEffects, seqPrefixEffects, keptTail, writeStep, innerKeptTail, outerHopName } =
      extendCollapseUpward(metaPath, { allowOptional, deadOptionalHop });
    // a `?.` the VALUE canon calls dead is dead here too: over a nav whose value cannot be absent,
    // the kept tail folds exactly as it does under a `delete` - one rule, not a delete-only
    // exception (`globalThis.self.window?.WeakRef` IS the realm's read), and the `?.` the fold
    // leaves over the substituted binding is vestigial for the same reason
    // the question is the VALUE, not the short-circuit: a nav with no `?.` of its own still ends on
    // the environment probe (`(eff(), globalThis.window)`), and asking whether it can SHORT-CIRCUIT
    // answered no and folded the probe read away - the guard above it then ran where the source
    // short-circuits
    // ... and only over a PROVEN root: the value canon speaks for proxy-rooted navs, and an opaque
    // call root (`ut()?.window?.self`) is undefinable by its own canon - reading the fold verdict
    // there dropped the call itself along with the guard
    const navAliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    const deadOptional = allowOptional
      || (!!findProxyGlobal(target.node, navAliasCtx, true)
        && !proxyReceiverValueCanBeUndefined(target.node, m => resolvePure(m, metaPath), navAliasCtx));
    const { navigated, mutatedAbove } = spineIsNavigated(
      target, keptTail, collapsed.keptWrite ?? writeStep, { deadOptional });

    // a NAVIGATION rebuilds from the root, so a dead prefix has nothing to carry and drops
    // (`(0, globalThis.window).Promise = f` -> `_globalThis.Promise = f`); a VALUE keeps the
    // source spelling whole (`(0, globalThis.self).Map = f` -> `(0, _self).Map = f`)
    const collectedEffects = [...seqPrefixEffects, ...collapsed.effects, ...outerEffects];
    // in NAVIGATION the root binding spells the base; a VALUE position substitutes the claim's OWN
    // pure, the swallowed hops a fold does not take respelled above it (`(v = globalThis[(e++,
    // 'self')].window)`). the canon owns the question - the key SPELLING is not part of it, so a
    // folded key's effects ride ahead of the binding here exactly as they do for a quiet twin
    const foldedKeyEffects = [...collapsed.keyEffects, ...outerEffects];
    const valuePosition = proxyNavSpellsClaimPure({ navigated });
    // an UN-NAVIGATED spine whose kept tail SURVIVES declines the collapse WHOLE: the
    // reference emitters keep every hop below an unbacked terminal spelled
    // (`(v = globalThis.self.window)` stays `_globalThis.self.window`) - folding the backed
    // run under it would erase the throw a self-less realm owes the read. the ordinary
    // root swap takes the claim instead; the kept-root canon keeps only BACKED-terminal
    // spines (`globalThis[(eff(), 'self')]` -> `(eff(), _globalThis)`, its tail empty)
    // ... and never over a KEPT WRITE: the store canon deliberately lands the ponyfill in
    // the assignment (`(k = globalThis.self).window` -> `(k = _self).window`, runtime-locked
    // in a self-less Node) - the tail there reads off the STORE, not the realm
    if (!writeStep && !collapsed.keptWrite && !navigated && keptTail.length) return false;
    markRewrite();
    const consumed = target.node;
    // a tail the render DROPS (navigation, a key-folded read) still owes its key effects -
    // they join both folds, after the outer run they climbed past
    if (!valuePosition) {
      for (const kept of keptTail) {
        collectedEffects.push(...kept.keySe);
        foldedKeyEffects.push(...kept.keySe);
      }
    }
    const foldedEffects = navigated
      ? collectedEffects.filter(effect => mayHaveSideEffects(effect)) : collectedEffects;
    // an ALIAS root follows the same positional canon: a NAVIGATION keeps the local
    // binding spelled (`g.self.Array` -> `g.Array`, nothing injects), a VALUE spells the
    // claim's own pure (`(k = g.window.self)` -> `k = _self`). folded KEY effects push a
    // READ onto the root (the kept-root canon), but a WRITE TARGET addresses the slot on
    // the surface it named (`globalThis[(e++, 'self')].Set = f` -> `(e++, _self).Set = f`)
    // ... and a DESTRUCTURE PATTERN addresses slots on the surface it named exactly as a write
    // target does (`const { other } = globalThis[(d++, 'self')]` reads `(d++, _self)`)
    if (writeStep) {
      return renderCollapseOverKeptWrite({
        target,
        consumed,
        writeStep,
        innerKeptTail,
        keptTail,
        outerHopName,
        outerEffects,
        seqPrefixEffects,
        collapsed,
        entry,
        hintName,
        navigated,
      });
    }
    // a NAVIGATED spine whose kept write stores an UNSPELLABLE surface keeps the write
    // itself as the base - the stored value IS the surface, so re-reading the root would
    // only respell it (`(q = globalThis.window).self.self.Array` -> `(q =
    // _globalThis.window).Array`, the hops dropping around it)
    if (navigated && collapsed.keptWrite && !collapsed.writeStoreSpellable) {
      const writeBase = cloneNode(collapsed.keptWrite);
      // the fold hands the store's raw value to the member above, so that member takes the
      // `?.` of the hop that READ the store (the store-fold verdict): an optional hop slides
      // its probe up, a plain one erases the `?.` there - a void store then throws on that
      // member exactly where the source threw on the hop. the vestigial verdict cannot speak
      // here - the store keeps its probe value, so definedness never erases it
      const carried = climbTransparentWrapperPath(target);
      const consumer = carried.parentPath?.node;
      if (consumer?.type === 'MemberExpression'
        && unwrapRuntimeExpr(consumer.object) === unwrapRuntimeExpr(carried.node)) {
        consumer.optional = storeReadHopOptional(consumed);
      }
      // the dropped hop's KEY effect runs after the write, so it rides the key that SURVIVES
      // above it, not a prefix ahead of the write - which would run it first
      // (`(u = _globalThis.window)[c++, 'Array']`, babel's key fold)
      const keyHost = foldedKeyEffects.length ? target.parentPath?.node : null;
      if (keyHost?.type === 'MemberExpression' && unwrapRuntimeExpr(keyHost.object) === target.node
        && (keyHost.computed || keyHost.property?.type === 'Identifier')) {
        keyHost.property = sequenceExpression([
          ...foldedKeyEffects.map(effect => cloneNode(effect)),
          keyHost.computed ? keyHost.property : literal(keyHost.property.name),
        ]);
        keyHost.computed = true;
        target.replaceWith(writeBase);
      } else target.replaceWith(withSideEffects(writeBase, foldedKeyEffects));
      markSubtreeSkipped(skippedNodes, consumed);
      skippedNodes.add(target.node);
      return;
    }
    // a MUTATED read above keeps the NEAREST surface as its base: the alias binding when
    // the spine has one (`_l.self.Set` -> `_l.Set`), else this claim's own pure. inside a
    // guard MEMO the alias stays too - the memo holds the value, this is not the source's
    // own value position
    // ... but a SOURCE store the clone CARRIES holds the value itself, so a claim in its value slot
    // IS the source's value position and spells the claim's pure (`(v = g.window.self)?.X` ->
    // `v = _self`). the MINTED memo's own assignment sits ABOVE the clone, so it never reads as one
    const carriedStore = assignmentHoldsValue(metaPath) && insideMemoClone(metaPath.parentPath, memoValueClones);
    const sourceValuePosition = valuePosition && !mutatedAbove
      && (carriedStore || !insideMemoClone(metaPath, memoValueClones));
    const rootSpelling = collapsed.aliasRoot && !sourceValuePosition
      ? cloneNode(collapsed.aliasRoot)
      : identifier(valuePosition || mutatedAbove ? injectPureImport(entry, hintName)
        : injectPureImport(collapsed.entry, collapsed.hintName));
    // the harvested effects wrap the ROOT, and a tail the fold does not take respells OVER that
    // wrap (`(q = (eff(), globalThis).self.window)` -> `q = (eff(), _self)`): the read
    // happens past the effects either way, and this is the spelling babel prints
    let replacement = withSideEffects(rootSpelling, foldedEffects);
    if (valuePosition) {
      for (const kept of keptTail) replacement = respellKeptHop(replacement, kept);
    }
    const replaceAt = navigated && !collapsed.aliasRoot ? swallowDeadSeqWrapper(target) : target;
    replaceAt.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(replaceAt.node);
    // the substituted binding is always defined: a `?.` the fold left reading directly off
    // it is vestigial (`delete globalThis.window?.frames?.customZ` -> `_globalThis.frames
    // ?.customZ`) - only where no guard was owed, which is what allowOptional marks
    if (deadOptional && rootSpelling.type === 'Identifier' && !foldedEffects.length) {
      deoptionalizeOverSubstituted({ metaPath: target, node: consumed, replacement: rootSpelling, proxyRoot: true });
    }
    // a VALUE render landing inside a kept store hands the always-defined ponyfill on through it:
    // a realm hop reading the store folds onto that value, its `?.` sliding one member up
    // (`(v = globalThis.self?.window?.self)?.window.X` -> `(v = _self)?.X`); the fold's own
    // climb gates on the crossed store
    if (valuePosition) {
      foldRealmHopOverCarriedValue(replaceAt, { adapter, resolvePure: m => resolvePure(m, metaPath) });
    }
  }

  // the POSSIBLE-GLOBAL hop claim over a pristine proxy spine: it collapses to the spine's
  // ROOT binding, the hops' computed-key effects folding in evaluation order - the
  // kept-root canon (`globalThis[(eff(), 'self')]` -> `(eff(), _globalThis)`). true when
  // this arm rendered
  function emitProxyHopClaim({ meta, metaPath, node, entry, hintName }) {
    // a MUTATED possible-global slot read DIRECTLY above keeps this hop's own claim (the
    // seal: the read observes the user's replacement through the closest surface binding)
    // through the wrappers a source PAREN (and the chain wrapper its `?.` wears) puts between
    // the hop and its consumer: every verdict below is about what READS this hop, and
    // `(g.window?.self)?.Array` reads it exactly like the bare twin
    const above = climbTransparentWrapperPath(metaPath).parentPath?.node;
    const aboveKey = above?.type === 'MemberExpression' && unwrapRuntimeExpr(above.object) === node
      && !above.computed ? above.property?.name : null;
    const sealedAbove = !!aboveKey && POSSIBLE_GLOBAL_OBJECTS.has(aboveKey) && !isPristineProxyGlobal(adapter, aboveKey);
    // a `delete` consumer performs no READ, so no `?.` over its navigation is load-bearing
    // (the canon's own verdict): the hops fold with their guards
    const deleteTail = deleteHostForClaim(metaPath, node);
    const deleteHost = deleteHostForClaim(metaPath, node, { forFold: true });
    // a DEAD `?.` on this hop (its probe provably defined) is no barrier to the spine
    // collapse - the vestigial verdict, so the run folds onto its root exactly like the
    // plain twin (`globalThis.self.window?.self.Box` -> `_globalThis.Box`)
    // ... but a probe living BELOW a kept value is the in-place drop's own shape - the write
    // must survive, and folding the run onto the root would drop it. the write standing AS
    // the probe is the other shape: its value is what the test reads, and the collapse
    // re-emits it as the sequence prefix (`(w = globalThis)?.self[0]` -> `(w = _globalThis,
    // _globalThis)[0]`, exactly the plain twin's render)
    // a SEAL makes the read observable only where it HIDES a short-circuit: over a nav whose value
    // cannot take one it hides nothing the value canon does not already answer, and the run folds
    // like its unsealed twin (`(globalThis.self.window?.self).Array` IS the realm's read)
    const sealedRead = (sealedLayerAbove(metaPath, node)
      && navValueCanShortCircuit(node, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath }))
      || !!storedUserAssignmentOf(metaPath);
    const probeIsKeptWrite = unwrapRuntimeExpr(node.object)?.type === 'AssignmentExpression';
    const deadOwnOptional = node.optional && (probeIsKeptWrite || !spineHoldsKeptWrite(node.object))
            && !optionalMemberStaysGuarded(node,
              { metaPath, adapter, resolvePure, observableRead: sealedRead });
    // a nav rendered INSIDE a guard test is the read that test performs: folding an UNBACKED
    // hop away there would test a value the source never reads (`(m = globalThis.window.self)
    // ?.x` stores `null == _globalThis.window ? void 0 : _self`, not a bare `_self`)
    const probeTestUnbackedHop = insideMemoClone(metaPath, probeTestClones)
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath));
    if (probeTestUnbackedHop
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName, planNode: node })) return true;
    let collapsed = sealedAbove ? null
      : collapseProxyHopSpine(node, metaPath,
        { allowOptional: deleteHost || deadOwnOptional,
          provenCallRoot: deleteHostForClaim(metaPath, node, { forFold: true, canonOnly: true }) || !deleteTail });
    if (collapsed?.unbackedRoot) {
      // navigated over a root pure cannot back: substituting here would read the ponyfill
      // off a host the engine may not have (`window.self.Array` stays raw)
      if (spineIsNavigated(metaPath).navigated) return true;
      collapsed = null;
    }
    // an OPTIONAL member above will split and absorb this hop with its own guard - a
    // standalone render here would nest a second test inside that split's memo
    // (`(dw = gw)?.self?.[k]...` folds to ONE probe in babel)
    // ... but only a claim ABOVE can absorb it. with an ENVIRONMENT PROBE below this hop and
    // no claim above to carry it, standing down here erases the short-circuit outright
    // (`ut()?.window?.self?.chrome.foo` - nothing claims `chrome`)
    const probedReceiver = !deleteHost && receiverCarriesLiveOptional(node.object)
      && navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath));
    const optionalAbove = above?.type === 'MemberExpression'
      && unwrapRuntimeExpr(above.object) === node && above.optional && !probedReceiver;
    // a `delete` consumer reads nothing over its navigation, so no `?.` in it is load-bearing
    // and the guarded render owes nothing (`delete dl()?.window?.self.missing` -> `delete
    // _self.missing`) - the same verdict the spine collapse takes through `allowOptional`
    // harvested effects ride along when the PLAN owns them (its own key SE) - the render
    // decides that, so a claim carrying one is not turned away here
    // (`ckr()?.window?.[(k++, 'self')]?.a` keeps `null == ckr().window ? void 0 : (k++, _self).a`)
    // an ERASABLE hop whose own `?.` probes a KEPT-WRITE UNDEFINABLE value - and that no
    // claim above absorbs - drops in place: the stored surface IS the hop's surface when
    // present, so the read above keeps the short-circuit and no import lands
    // (`(se(), t = gw)?.self.Array.prototype.some...` -> `(se(), t = _gw)?.Array...`,
    // babel's fold)
    if (!collapsed && !sealedAbove && !optionalAbove && !deleteHost && node.optional
      && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && resolveGlobalPolyfill(hintName)
      && above?.type === 'MemberExpression' && unwrapRuntimeExpr(above.object) === node) {
      let probeStore = unwrapRuntimeExpr(node.object);
      if (probeStore?.type === 'SequenceExpression') probeStore = unwrapRuntimeExpr(probeStore.expressions.at(-1));
      const storeValue = unwrapRuntimeExpr(peelChainAssignmentDeep(probeStore));
      const storeUndefinable = peelChainAssignmentDeep(probeStore) !== probeStore
        && storeValue?.type === 'MemberExpression' && !storeValue.computed
        && POSSIBLE_GLOBAL_OBJECTS.has(storeValue.property?.name)
        && !resolveGlobalPolyfill(storeValue.property?.name);
      if (storeUndefinable) {
        markRewrite();
        above.optional = true;
        replaceNodeInTree(above, above.object, node.object);
        skippedNodes.add(node);
        return true;
      }
    }
    // a `?.` that guards NOTHING asks for no render here: the own optional has the canon's
    // verdict already (`deadOwnOptional`), and a syntactic one inside the receiver is judged by
    // the value canon - over an always-defined read it folds with the rest of the run instead of
    // earning a probe guard (`(v = globalThis.self?.window?.self).X` IS the realm)
    const guardedReceiver = (node.optional && !deadOwnOptional)
      || probeKeyedOptionalIn(node.object, metaPath)
      || (receiverCarriesLiveOptional(node.object)
        && navValueCanShortCircuit(node.object, m => resolvePure(m, metaPath),
          { scope: metaPath.scope, adapter, path: metaPath }));
    if (!collapsed && !sealedAbove && !optionalAbove && !deleteHost && guardedReceiver
      && emitStaticOverGuardedNav({
        meta,
        metaPath,
        node,
        entry,
        hintName,
        planNode: node,
        declineValueProbe: true,
        sealedRead,
        deleteHost: deleteTail,
      })) {
      return true;
    }
    // ... and the same verdict where the `?.` sits ABOVE a plain run - but only where that `?.`
    // is LIVE: asked by hop presence the arm guarded a read of a value the collapse assumption
    // defines (a deeper unbacked hop is a realm self-reference), where the run folds whole
    if (collapsed && !deleteHost && !sealedAbove
      && navValueCanShortCircuit(metaPath.parentPath?.node ?? node, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath })
      && plainRunReadOptionally(metaPath, node, proxyHopKey)
      && emitStaticOverGuardedNav({
        meta,
        metaPath,
        node,
        entry,
        hintName,
        planNode: node,
        deleteHost: deleteTail,
      })) return true;
    if (!collapsed) return false;
    // ... and a DESTRUCTURE source under a value-observing carrier keeps the hops the source
    // wrote - but only where the run harvests NOTHING: an effect-bearing one has no other slot
    // to re-emit from, so it collapses like any other (`(c++, globalThis)[(e++, 'self')].X`)
    if (!collapsed.effects.length && !collapsed.keyEffects.length
      && valueObservingDestructureSource(metaPath, destructureEmit)) return true;
    const aboveScope = metaPath.scope;
    // under a FOLDED `delete` the connector may sit above a CARRIER the fold left in the way (a
    // re-emitted effect prefix): the member reading the folded value is the one past it, and the
    // canon has spoken for the whole navigation there. every other position keeps the direct read
    let connector = above;
    if (deleteHost && above && above.type !== 'MemberExpression') {
      let carried = climbTransparentWrapperPath(metaPath);
      let connectorPath = carried.parentPath;
      while (connectorPath?.node && chainValueCarrier(connectorPath.node, carried.node)) {
        carried = climbTransparentWrapperPath(connectorPath);
        connectorPath = carried.parentPath;
      }
      connector = connectorPath?.node ?? above;
    }
    if (renderProxySpineCollapse({
      metaPath,
      collapsed,
      entry,
      hintName,
      allowOptional: deleteHost,
      deadOptionalHop: deadOptionalHopAt(metaPath),
    }) === false) {
      return false;
    }
    // the collapse lands the root's own binding, so a `?.` left standing on the SURVIVING
    // connector is vestigial - the root rewrite spells the `.` itself (`globalThis?.self
    // ?.Array` -> `_globalThis.Array`). the canonical judge decides per hop, so a probe
    // whose value can still be undefined keeps its guard
    if (connector?.type === 'MemberExpression') {
      // under a FOLDED `delete` the canon has spoken for the whole navigation: the collapse
      // landed the root binding, and a `?.` over it guards a read that never happens
      if (deleteHost && connector.optional) connector.optional = false;
      for (const hop of vestigialNavOptionals(connector, m => resolvePure(m, metaPath),
        { scope: aboveScope, adapter, path: metaPath })) hop.optional = false;
    }
    return true;
  }

  // the span a claim SWAP consumes: a TS wrapper (a cast, a non-null, their paren skins) around the
  // claimed spelling goes with it - the substituted binding needs no assertion (`(Map as any)` ->
  // `_Map`). a BARE paren stops the climb: that seal is load-bearing here (the read it makes
  // observable rides back as a throw probe), unlike the spine collapse's own climb
  function climbSubstitutedSpan(metaPath) {
    let target = metaPath;
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      const upType = up.node.type;
      // NOT `TSInstantiationExpression`: its type args are value-adjacent source text babel
      // keeps on the substituted binding (`new (Map<string, number>)()` -> `new _Map<string, number>()`)
      if (upType === 'TSInstantiationExpression') break;
      // the estree CHAIN marker between the claim and the wrapper above it is not a layer the source
      // wrote - the other dialect has no node there at all, so stopping on it left the wrapper standing
      // over a substituted binding the reference emitter consumes it with (`(nav?.self as any)?.X`).
      // read only where a wrapper the climb would take anyway sits above: elsewhere the marker ends
      // the span this swap owns
      if (upType === 'ChainExpression' && up.node.expression === target.node
        && TRANSPARENT_EXPR_WRAPPER_TYPES.has(up.parentPath?.node?.type)) {
        target = up;
        continue;
      }
      if (!TS_EXPR_WRAPPERS.has(upType)
        && !(upType === 'ParenthesizedExpression' && TS_EXPR_WRAPPERS.has(up.parentPath?.node?.type))) break;
      target = up;
    }
    return target;
  }

  function emitStaticGlobalClaim({ meta, metaPath, node, kind, entry, hintName }) {
    // a `delete` whose whole navigation folds has no short-circuit for a guard render to
    // reproduce, and a guard built there hands `delete` a conditional, which deletes nothing
    const foldsUnderDelete = deleteHostForClaim(metaPath, node, { forFold: true });
    // a POSSIBLE-GLOBAL hop claim under a TERMINAL unbacked tail stands down whole - the
    // root identifier's own swap spells the base, every hop stays a real read. NOT inside a
    // kept-write VALUE though: the store canon deliberately lands the ponyfill there
    // (`(k = globalThis.self.window)` stores `_self`, runtime-locked without self)
    // ... nor where a PROBE stands below the claim: the nav has a guarded collapse to render, whose
    // alternate is the ponyfill, and the realm hops above it fold onto that - there is no raw read
    // left for the stand-down to preserve (`(rt()?.window?.self.window).X`)
    if (node.type === 'MemberExpression' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
      && !storedUserAssignmentOf(metaPath)
      && !navHasUnresolvableProxyHop(node.object, m => resolvePure(m, metaPath))
      && unbackedTailRidesAbove(metaPath, resolveGlobalPolyfill)) return;
    // a POSSIBLE-GLOBAL hop claim over a pristine proxy spine collapses to the spine's
    // ROOT binding, the hops' computed-key effects folding in evaluation order - the
    // kept-root canon (`globalThis[(eff(), 'self')]` -> `(eff(), _globalThis)`)
    if (node.type === 'MemberExpression' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)) {
      // ... unless an unresolvable hop sits BELOW the collapse point: the spine render spells the
      // leaf unconditionally, where the source's own read short-circuits
      if (emitNestedGuardNavValue(metaPath, node, nestedGuardCtx)) return;
      const hopArm = emitProxyHopClaim({ meta, metaPath, node, entry, hintName });
      if (hopArm) return;
    }
    // an OPTIONAL member above will split and absorb this claim - see the hop branch;
    // found by climbing through transparent wrappers (a chain wrapper sits between)
    const omaChild = peelParenAndTSSlotChild(metaPath, SKIPPABLE_WRAPPER_TYPES) ?? node;
    const omaUp = peelParenAndTSParentPath(metaPath, SKIPPABLE_WRAPPER_TYPES);
    const optionalMemberAbove = omaUp?.node?.type === 'MemberExpression'
      && omaUp.node.object === omaChild && omaUp.node.optional;
    if (node.type === 'MemberExpression' && !optionalMemberAbove
      && (node.optional || receiverCarriesLiveOptional(node.object))
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && !foldsUnderDelete
      && emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return;
    if (node.type === 'Identifier' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
      && !meta.sideEffects?.length) {
      // a destructure off this surface whose sole hop is a MUTATED ctor has no claim of
      // its own to drive the flatten - note the host so the drain re-anchors its residual
      noteMutatedCtorHopDestructure(metaPath, node, { adapter, destructureEmit });
      // a `delete` reads nothing over its navigation, so the guarded route stands down and
      // the hops fold with their `?.` (`delete globalThis.window?.self.k` -> `delete
      // _globalThis.k`) - the canon's erase verdict, spelled here
      const rootDeleteHost = deleteHostForClaim(metaPath, node);
      if (!rootDeleteHost && emitRootGuardedNavCollapse(metaPath)) return;
      // a bare ROOT navigated through PLAIN hops pure cannot back takes the same spine
      // render: the hops fold away under navigation and respell in value position
      // (`globalThis.window.Array` -> `_globalThis.Array`, `globalThis.window` kept). a
      // LIVE `?.` anywhere in that run keeps every hop - it IS the environment probe the
      // source asked for, and folding it away would drop the test; a `?.` the vestigial
      // verdict calls dead guards the substituted binding and leaves the run plain
      const deadOptionalHop = deadOptionalHopAt(metaPath);
      const proxyRun = plainProxyHopRunAbove(metaPath, proxyHopKey, { allowOptional: rootDeleteHost, deadOptionalHop });
      // ... and the same stand-down as the hop claim's: a value-observing carrier over a
      // destructure source keeps every hop the source wrote
      if (proxyRun && !valueObservingDestructureSource(metaPath, destructureEmit)
        && renderProxySpineCollapse({
          metaPath,
          collapsed: { entry, hintName, effects: [], keyEffects: [] },
          entry,
          hintName,
          allowOptional: rootDeleteHost,
          deadOptionalHop,
        }) !== false) {
        // ... and no `?.` on the read ABOVE the run is load-bearing either - but only where the
        // collapse landed the ROOT BINDING itself. an UNBACKED hop left spelled off it
        // (`_globalThis.window`, a sealed run's stop) is still the environment probe, and the
        // read above it keeps its guard
        if (rootDeleteHost && proxyRun.consumer?.type === 'MemberExpression'
          && carriedValue(proxyRun.consumer.object)?.type === 'Identifier') proxyRun.consumer.optional = false;
        return;
      }
    }
    // static / global claim: the member (or bare identifier) becomes the import binding;
    // harvested SE (a computed key, a sequence receiver) re-runs ahead of it in source order.
    // with nothing harvested the swap still ERASES the receiver spelling - the canonical
    // discard rescue keeps what that would observably drop (a chain-assignment rescued
    // whole, an SE-bearing root call), and a provably pure root call falls away
    let effects = meta.sideEffects;
    // a receiver whose spine carries a LIVE `?.` gates the claim: the probe (the deepest
    // optional hop's own spelling) becomes the null test, the claim rides the alternate
    // (`condFn?.()?.Array.of(12)` -> `null == condFn?.() ? void 0 : _Array$of(12)`) - a
    // seq rescue would erase the short-circuit
    if (node.type === 'MemberExpression' && !optionalMemberAbove
      && (node.optional || receiverCarriesLiveOptional(node.object))
      && !sealedThrowRidesTheClaim(node, metaPath, sealedProbeCtx)
      && emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount: meta.receiverEffectCount })) return;
    if (!effects?.length && sealedPristineHopCollapse(metaPath, node, { adapter, resolvePure, markRewrite })) return;
    if (node.type === 'MemberExpression') {
      if (!effects?.length) {
        effects = discardRescueNodes({ node: node.object, scope: metaPath.scope, adapter, path: metaPath });
        // the discard rescue owns the chain-assigns already; the canonical prepend below is
        // for the harvested-SE shape only
      } else {
        // the swap erases the receiver spelling: its chain-assignments splice into the SE
        // prelude at the recorded receiver/key boundary - ECMA receiver-before-key
        effects = prependChainAssignmentEffect(node.object, effects, meta.chainAssignInsertAt ?? meta.receiverEffectCount);
      }
    }
    // a pristine hop reading a KEPT-WRITE surface re-reads the ROOT after the write
    // (`(a = _globalThis).self` -> `(a = _globalThis, _globalThis)`, babel's re-read canon)
    // - but only TERMINAL: navigated further, the hop keeps its OWN pure
    // (`(p = _globalThis).self.Set` -> `(p = _globalThis, _self).Set`)
    const navigatedAbove = navigatedMemberAbove(metaPath);
    let redirected = null;
    // a folded computed KEY's effects under NAVIGATION keep the ROOT binding - the
    // kept-root canon (`globalThis[(eff(), 'se') + 'lf'].Array` -> `(eff(),
    // _globalThis).Array`); `proxyHopKey` cannot see a concat fold, so the spine
    // collapse never ran and the swap re-roots here
    // ... and never a hop a `?.` PROBES: the guard's test must keep READING the hop (`g[(k,
    // 'window')]?.self` tests the window slot - folding it to the root erases the probe)
    const probedAbove = metaPath.parentPath?.node?.type === 'MemberExpression'
      && metaPath.parentPath.node.object === node && metaPath.parentPath.node.optional;
    if (!redirected && navigatedAbove && !probedAbove && kind === 'global'
      && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
      && node.type === 'MemberExpression' && node.computed && effects?.length) {
      const rootName = resolveObjectName({ objectNode: node.object, scope: metaPath.scope, adapter, path: metaPath });
      if (rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName) && isPristineProxyGlobal(adapter, rootName)) {
        redirected = resolveGlobalPolyfill(rootName);
      }
    }
    // the read a load-bearing SEAL made observable is the source's own - the swap erases it,
    // so it rides back as a throw probe ahead of the ponyfill
    const throwProbe = node.type === 'MemberExpression'
      ? sealedClaimThrowProbe(node, metaPath, sealedProbeCtx) : null;
    // a swap that OWES a probe but cannot spell one (an SE computed key in the run - respelling
    // would double its effect) stands down whole: the raw read keeps the throw the erase loses
    if (!throwProbe && node.type === 'MemberExpression' && !node.optional
      && aliasRootedReadMayThrow(node.object, m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath })) return;
    const id = injectPureImport(redirected?.entry ?? entry, redirected?.hintName ?? hintName);
    markRewrite();
    const target = climbSubstitutedSpan(metaPath);
    const consumed = target.node;
    // the harvested effects run where the source runs them - ahead of the read the probe
    // reproduces (`(seq++, <probe>, _Array$of)(11)`); one the probe already spells drops
    // the probe node rides UNCLONED - it carries its own skip mark, and a copy would be
    // re-visited and claimed into the very ponyfill it stands ahead of
    // ... and one the probe's RENDER already spells runs there: a prefix copy would evaluate it
    // twice (`(dheCombo(), (null == dheCombo().window ? ...).Array, _Array$of)`). the render holds
    // clones, which carry their source spans - the span is what identifies the effect in it
    const replacement = throwProbe
      ? sequenceExpression([
        ...effectsPastThrowProbe(effects, throwProbe).map(effect => cloneNode(effect)),
        throwProbe.node, identifier(id),
      ])
      : withSideEffects(identifier(id), effects);
    target.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(replacement);
    // a nav route that BAILED leaves the source's realm hops standing over the ponyfill this swap
    // put in (`delete <dead probe>?.self?.window.X` claims `self` alone) - they fold here, where
    // the plan's own render would have truncated them.
    // only over a HOP claim: a bare root spelling is the nav's own beginning, and the read above it
    // is the environment PROBE the collapse tests (`_globalThis.window` in a guard) - folding that
    // would erase the very question the guard asks
    if (node.type === 'MemberExpression' && POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName)) {
      foldUnbackedRealmHopsAbove(target, replacement, { adapter, resolvePure: m => resolvePure(m, metaPath) });
    }
    // ... and BEFORE the `?.` verdict below: that one drops the chain wrapper the folded hop still
    // sits under, and a path whose container it detached writes into nothing
    // walk up from TARGET: a consumed TS wrapper sat between the claim and its `?.` parent
    // (`(Map as any)?.()` - the call reads the replacement directly after the climb)
    deoptionalizeOverSubstituted({
      metaPath: target,
      node,
      replacement,
      proxyRoot: kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName),
    });
    // the PROXY-global family has its own collapse canon (the spine render decides where
    // the root re-reads); this one serves a substituted CTOR binding
    if (!POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName)) {
      reReadKeptWriteValue(target, id, replacement, { adapter, resolveGlobalPolyfill, skippedNodes });
    }
  }

  // the substituted binding is always defined: a `?.` reading directly off it collapses to
  // `.`, an optional call of it loses its `?.()`, and the chain wrapper drops once no `?.`
  // survives inside
  function deoptionalizeOverSubstituted({ metaPath, node, replacement, proxyRoot = false }) {
    // surviving transparent wrappers (a paren skin the climb could not consume) sit between
    // the replacement and its `?.` parent - peel upward before testing it
    let upPath = metaPath.parentPath;
    while (upPath?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(upPath.node.type)) {
      upPath = upPath.parentPath;
    }
    const upNode = upPath?.node;
    let chainDropped = false;
    function dropChainAt(chainPath) {
      if (chainDropped || chainPath?.node?.type !== 'ChainExpression'
        || receiverCarriesOptional(chainPath.node)) return;
      chainDropped = true;
      chainPath.replaceWith(chainPath.node.expression);
    }
    // a harvested effect prefix does not revive the `?.`: the sequence hands its TAIL on, and
    // that tail is the always-defined binding (`(n++, _Symbol)?.iterator` reads plainly)
    const substituted = replacement.type === 'SequenceExpression'
      ? unwrapRuntimeExpr(replacement.expressions.at(-1)) : replacement;
    // a kept WRITE hands its VALUE on, so a `?.` reading the write reads the substituted binding and
    // is as vestigial as one reading it directly (`(v = _self)?.window`) - the same rule the
    // sequence arm below spells for a prefix
    if (upNode?.type === 'MemberExpression' && upNode.optional && unwrapRuntimeExpr(upNode.object) === replacement
      && substituted?.type === 'Identifier') {
      // a SEAL below a live `?.` keeps the memo's source spelling whole - the dead `?.`
      // rides it un-erased (`(Promise?.foo)?.bar` memoizes `_ref = _Promise?.foo`); the
      // unsealed chain erases the root-adjacent `?.` as usual (`globalThis?.foo?.bar` ->
      // `_globalThis.foo?.bar`)
      let liveAbove = false;
      let sawSeal = false;
      for (let livePath = upPath.parentPath; livePath?.node; livePath = livePath.parentPath) {
        const liveNode = livePath.node;
        if (liveNode.type === 'ParenthesizedExpression') {
          // a seal shields a CTOR substitution only: the proxy-global nav collapses like
          // its unsealed twin (`((globalThis?.X)?.Y)` respells `_globalThis.X?.Y`)
          sawSeal = !proxyRoot;
          continue;
        }
        if (CHAIN_HOP_WRAPPER_TYPES.has(liveNode.type)) continue;
        if (liveNode.type !== 'MemberExpression' && liveNode.type !== 'CallExpression') break;
        if (liveNode.optional) {
          liveAbove = sawSeal;
          break;
        }
      }
      if (!liveAbove) {
        upNode.optional = false;
        dropChainAt(upPath.parentPath);
      }
    }
    // the same rule for an optional CALL of the substituted binding (`_Map?.()` -> `_Map()`)
    if (upNode?.type === 'CallExpression' && upNode.optional && unwrapRuntimeExpr(upNode.callee) === replacement) {
      upNode.optional = false;
      dropChainAt(upPath.parentPath);
    }
    // a SEQUENCE the source wrote around the substituted span hands its TAIL on, so a `?.` reading
    // that sequence reads the substituted binding and is as vestigial as one reading it directly.
    // the arm above compares the member's object against the REPLACEMENT and cannot see through the
    // prefix (`(eff(), globalThis.window.self)?.Number` kept a `?.` over `(eff(), _globalThis)`)
    // ... and only where a NAVIGATION was folded away: a bare root swap inside the sequence
    // (`(0, globalThis)?.flat`) substitutes what the source already read directly, and the `?.` there
    // is the source's own - the reference emitter keeps it
    if (!chainDropped && substituted?.type === 'Identifier'
      && (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')) {
      const seqPath = metaPath.parentPath;
      const seqNode = seqPath?.node;
      // the sequence's own TAIL is asked, not the path's node: the path can still hold the member the
      // replacement swapped out, while the tree already carries the substitution
      const seqTail = seqNode?.type === 'SequenceExpression'
        ? unwrapRuntimeExpr(seqNode.expressions.at(-1)) : null;
      // the printer wrappers the source wrote around the sequence sit between it and the `?.`
      let overPath = seqPath?.parentPath;
      while (overPath?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(overPath.node.type)) {
        overPath = overPath.parentPath;
      }
      const overSeq = seqTail && (seqTail === substituted || seqTail === replacement)
        ? overPath?.node : null;
      if (overSeq?.type === 'MemberExpression' && overSeq.optional
        && unwrapRuntimeExpr(overSeq.object) === seqNode) {
        overSeq.optional = false;
        dropChainAt(overPath?.parentPath);
      }
    }
    // the substitution consumed the member's own `?.` (`X.Promise?.resolve` erased with the
    // member); the chain wrapper drops once no `?.` survives inside
    if (node.optional && !chainDropped) {
      let chainPath = metaPath.parentPath;
      while (chainPath?.node && chainPath.node.type !== 'ChainExpression') chainPath = chainPath.parentPath;
      dropChainAt(chainPath);
    }
  }

  return {
    buildNavGuardTest,
    collapseProxyHopSpine,
    deleteHostForClaim,
    deoptionalizeOverSubstituted,
    emitGuardedDestructureNarrow,
    emitGuardedStaticNarrow,
    emitLiveOptionalProbeGuard,
    emitOwnOptionalGuardedClaim,
    emitProxyHopClaim,
    emitRootGuardedNavCollapse,
    emitStaticGlobalClaim,
    emitStaticOverGuardedNav,
    peelNonNullWraps,
    proxyHopKey,
    spineIsNavigated,
    substituteProbeProxyRoot,
  };
}
