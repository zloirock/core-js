import {
  synthPropDedupKey,
  buildPatternRenderPlan,
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  wrapperElementNavPlacement,
  classifyCallBranchForSynth,
  consumedAssignmentSlotDropsHost,
  consumedAssignmentSlotPrunes,
  fallbackBranchSwapKeepsSelection,
  isConstantLiteralReceiver,
  isBuiltInSurfaceNav,
  isInstanceSurfaceNav,
  isReReadableSurfaceNav,
  isReReferenceableReceiver,
  isSeFreeMemberReceiver,
  isViableBranchForKey,
  renderSynthTree,
  resolveNestedReceiverBase,
  resolveNestedReceiverChain,
  carriedInitReceiverNode,
  receiverPerformsEveryInitEffect,
  spellsSequenceExpression,
  resolveNestedReceiverNode,
  resolvePositionalElementSlot,
  resolvePassthroughRef,
  qualifiesForParamBodyExtract,
  typedNavClaimChain,
  typedNavClaimShape,
  undefinedArmEffectiveReceiver,
  paramDefaultInstanceSynthAllowed,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import { symbolIteratorInstanceLeaf } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { registerBindinglessCtorAlias, registerDeclAliasIfSound } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  computedKeyIsWellKnownSymbol,
  discardRescueNodes,
  findProxyGlobal,
  inlineCallReturnExpression,
  isStaticPlacement,
  resolveObjectName,
  resolveSynthKeys,
  peelChainRootValue,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  forOfHeadElements,
  assignmentInStatementPosition,
  computedKeyHasSideEffects,
  computedKeysAllBound,
  getFallbackBranchSlots,
  hasRestSiblingExcept,
  isPristineProxyGlobal,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  paramsHaveInvisibleCallers,
  patternBindingCount,
  walkPatternIdentifiers,
  peelFallbackBranchInner,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  prologueEndIndex,
  propBindingIdentifier,
  relocatedHostPattern,
  relocatedCatchPropUnobservable,
  resolveFallbackReceiver,
  statementListOf,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapRuntimeExpr,
  unwrapInitValue,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { detectIifeArgReceiver, findSynthSwapReceiver } from './destructure-emit-utils.js';
import { nodeSite, stampNodeSite } from './nav-spine.js';
import { walkAstNodes } from './plugin-helpers.js';
import { discardedSequenceElement, findNodeSlot, memberFromKeyName, replaceNodeInTree } from './emit-shared.js';
import { renderInstanceDefaultGuard } from '@core-js/polyfill-provider/render';
import {
  callExpression,
  cloneNode,
  identifier,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
} from './builders.js';
import {
  allProxySelectingInit,
  applyInlineDefault,
  arrayWrapperDeclarator,
  buriedKeyClaimInit,
  classifyDeclarationHost,
  climbPatternChain,
  declinedWrapperTakesDefault,
  defaultedSoleConsumes,
  divergingSelection,
  divergingSentinelSelectorDeclines,
  duplicateReceiver,
  eagerSentinelMemoName,
  emitAssignStaticDefaultOverwrite,
  firstProxyBranch,
  guardedSlotValue,
  hasRestSibling,
  hopChainKeys,
  hostStatementOf,
  initRawKeyOnRoot,
  initSeqDirectClaim,
  initSeqRootHasKeptWrite,
  isPlainConsumableProp,
  isPureNavAfterSePrefix,
  isPureNavReceiver,
  navHopChain,
  navSpineHasCall,
  navSpineHasComputedKeyEffect,
  nodeHoldsSubtree,
  overwriteDefaultGuard,
  overwriteRebindEmitted,
  peelDeadChainMarker,
  planDiscardedInitProbe,
  planLiftedRhsPrefix,
  planLiteralRoute,
  planSealedNavProbe,
  planSentinelMemo,
  propBindingTarget,
  propLocalName,
  proxyNavSynthBase,
  proxySurfaceIdentifier,
  registerAssignmentExtractAlias,
  registerInstanceSynthSlot,
  registerSeKeyDefaultOverwrite,
  resolveArrayWrappedReceiver,
  routeSelectionMirror,
  SELECTING_INIT_TYPES,
  seCarriedHopNav,
  sinkDropsReceiver,
  staticallySelectedLeft,
  swapInlineDefaults,
  synthPlanFullyCovered,
  takesInlineDefault,
  warnConditionalFallbackUntouched,
} from './destructure-helpers.js';
import { sentinelAlreadyProcessed } from '@core-js/polyfill-provider/detect-usage/own-output';
import createDestructureDrains from './destructure-drain.js';

export default function createAstDestructureEmitter({
  adapter,
  injector,
  injectorState,
  injectPureImport,
  markRewrite,
  skippedNodes,
  markSubtreeSkipped,
  program,
  resolvePure,
  resolveGlobalPolyfill,
  mintUnusedName,
  mintRefName,
  paramDefaultNeverOverridden = null,
  resolveNodeType = null,
  resolvePropertyObjectType = null,
  resolvedType = null,
  toHint = null,
  isDisabled = null,
  getDebugOutput = null,
}) {
  // hostNode (VariableDeclaration | ExpressionStatement) -> { hostPath, jobs }
  const ledger = new Map();
  // the per-function insertion cursor keeping consecutive body-extracts in SOURCE order
  const bodyExtractInsertAt = new Map();
  // literal-route receiver memo names, shared per receiver NODE across that receiver's leaves
  const literalMemoNames = new Map();
  // a sole ctor hop the extraction never touched still flattens - over a MUTATED slot (no
  // static behind the shim resolves, so no job records) and over a PRISTINE proxy one; the
  // proxy-root claim notes the host, the drain re-anchors
  const hopHosts = new Map();
  const navMemoPlans = new Map();
  const sentinelMemoNames = new Map();
  // leaf patterns whose param-default synth already applied (every consumable prop of the
  // pattern fires its own meta, and the plan renders them all in one shot)
  const synthDone = new WeakSet();
  // the SIMPLE synth-swap ledger (a classifiable receiver, `{ from } = Array`: per-prop metas
  // register their slots; the drain renders ONE literal per pattern over the receiver)
  const synthLedger = new Map();
  // the guard canon's context, per claim path: `resolvePure` in its PROVIDER shape (one argument),
  // and the alias context every undefinable-value walk reads
  function navGuardCtx(metaPath) {
    return {
      resolvePure: m => resolvePure(m, metaPath),
      aliasCtx: metaPath?.scope ? { scope: metaPath.scope, adapter, path: metaPath } : null,
    };
  }

  const instanceSynthCtx = { adapter, resolvePure, injectPureImport, skippedNodes, resolveNodeType, toHint };
  // the per-branch mirror (`= cond ? Array : Iterator`): each viable branch collects its
  // own slots and becomes its own literal
  const pendingBranchSynths = new Map();
  // the OUTER patterns a nested mirror owns: its literal already spells every leaf, so the
  // ordinary declarator route must not extract them a second time
  const branchMirrorPatterns = new WeakSet();
  // the SEQUENCE-element assignments this drain folded back into ONE comma slot: babel
  // spelled their extractions as statements of its own, so a lift that reaches such a
  // slot splits it back per element instead of joining the whole comma
  const seqDrainedSlots = new WeakSet();
  // what the module-scope probe rebuilders need from this closure
  const probeRenderCtx = { adapter, resolvePure, resolveGlobalPolyfill, injectPureImport, keepLive: skippedNodes.keepLive };

  // the drain half rides the same per-transform state; `resolveProxyNavReceiver` is hoisted,
  // so handing it across at creation time is safe
  const drains = createDestructureDrains({
    adapter,
    hopHosts,
    injectPureImport,
    injector,
    injectorState,
    isDisabled,
    ledger,
    markRewrite,
    mintRefName,
    mintUnusedName,
    pendingBranchSynths,
    probeRenderCtx,
    program,
    resolveGlobalPolyfill,
    resolvePropertyObjectType,
    resolveProxyNavReceiver: (...args) => resolveProxyNavReceiver(...args),
    resolvePure,
    resolvedType,
    toHint,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
  });
  const { buildValue, drain, extractCatchClause, extractLoopLeft, planMemoArg, recordJob } = drains;

  // the provider-normalized nested-param synth plan rendered as NODES replacing the
  // parameter DEFAULT (the semantics - tree mirror, validation, leaf resolution - live in
  // the shared `buildNestedParamSynthPlan`; babel renders the same plan)
  function renderNestedParamSynth({ metaPath, meta, withinNode = null }) {
    const leafPattern = metaPath.parentPath;
    if (synthDone.has(leafPattern.node)) return true;
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: leafPattern, meta, resolvePure: m => resolvePure(m, metaPath), adapter,
    });
    const applied = applyNestedParamSynthPlan({
      plan,
      renderTree: (tree, recv) => renderSynthTree(tree, {
        injectImport: injectPureImport,
        ...recv,
        resolveGlobalPolyfill,
        adapter,
      }),
      replaceTarget: (targetNode, rendered) => {
        // ... and never OUTSIDE the host the caller owns: a receiver reached through an alias
        // binding belongs to that binding's own declaration, and swapping a literal in there
        // rewrites what every other reader sees (`const w3 = [globalThis]` stays)
        if (withinNode && !nodeHoldsSubtree(withinNode, targetNode)) return false;
        if (!replaceNodeInTree(program, targetNode, rendered)) return false;
        markRewrite();
        return true;
      },
      skipSubtree: targetNode => markSubtreeSkipped(skippedNodes, targetNode),
    });
    if (applied) synthDone.add(leafPattern.node);
    return applied;
  }

  // a MINTED well-known-symbol key (`[_Symbol$iterator]` - the wks swap ran before this claim)
  // has no tree binding until the import flush; the shared fold vouches for it
  function mintedKeyExempt(metaPath) {
    return keyNode => computedKeyIsWellKnownSymbol({ keyNode, scope: metaPath.scope, adapter, path: metaPath });
  }

  // one slot of the simple synth literal; the drain renders the whole pattern at once
  function registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName }) {
    // an INSTANCE slot renders `{ key: helper(receiver) }`, so the receiver is spelled once
    // per consuming slot: only a param DEFAULT whose value CONSTRUCTS (a literal) or is a
    // bare binding can carry it - every other receiver would re-run its read
    // the SYMBOL-ITERATOR triple is not a plain instance slot - its own routes own the
    // pattern, and a literal here would swap the receiver out from under them
    if (kind === 'instance') {
      // the slot's receiver is the param DEFAULT, or the IIFE ARGUMENT for a bare pattern -
      // both are the value the literal replaces, and both are read once per consuming slot
      // the canonical IIFE-arg detector answers for the bare pattern (it peels an SE tail, so
      // the prefix stays in place); the ctor-shaped `findSynthSwapReceiver` gate does not
      // apply - an instance slot dispatches on ANY value
      const instanceReceiver = hostParent?.node?.type === 'AssignmentPattern'
        ? peelTransparentExpr(hostParent.node.right)
        : peelTransparentExpr(detectIifeArgReceiver(hostParent, pattern));
      // WHICH receivers a slot may spell is the core's question - the shape rules (re-referenceable
      // root, single-prop for a member read, no raw global riding inside) live in one gate, asked by
      // both legs. a local re-eval test here let a SELECTING receiver through where babel declined
      // and the comment above already said it should not
      // ... and the slot must BIND: a nested pattern value (`{ [S]: { keys } }`) destructures
      // the dispatch result, which the flat literal has no slot for - that shape belongs to
      // the nested routes, where both legs keep it native
      return !!propBindingIdentifier(metaPath.node.value)
        && paramDefaultInstanceSynthAllowed({
          objectPatternNode: pattern,
          receiverNode: instanceReceiver,
          scope: metaPath.scope,
          adapter,
          path: metaPath,
          resolvePure: m => resolvePure(m, metaPath),
        })
        && registerInstanceSynthSlot({
          metaPath,
          pattern,
          hostParent,
          entry,
          hintName,
          receiver: instanceReceiver,
          synthLedger,
          ctx: instanceSynthCtx,
        });
    }
    if (!isSynthSimpleObjectPattern(pattern)
      || !computedKeysAllBound(pattern, metaPath.scope, mintedKeyExempt(metaPath))) return false;
    const receiver = findSynthSwapReceiver(hostParent, pattern, metaPath.scope, adapter, resolvePure);
    let baseIdent = receiver;
    let leadingEffects = null;
    let passthroughPrefix = null;
    // the SE policy decides the channel BEFORE any direct route: an SE-bearing receiver
    // (a call, a rescue-carrying member / logical left) memoizes through the IIFE param -
    // the direct swap would re-run its setup on every unresolved re-read
    const sePolicy = receiver
      ? classifyCallBranchForSynth({ inner: receiver, ...nodeSite(receiver, metaPath), adapter })
      : { callBranch: false };
    // a pure proxy-nav MEMBER receiver (`globalThis.self.Array`): the literal's passthrough
    // reads through the kept root and the surviving nav keys - an ALIAS root resolves the
    // same surface (`const g = globalThis; g.self.Map` reads `_Map` / `g.Object` per key)
    let baseIsProxy = false;
    const navBase = sePolicy.callBranch ? null
      : proxyNavSynthBase(receiver?.type === 'LogicalExpression' ? peelTransparentExpr(receiver.left) : receiver,
        { ...nodeSite(receiver, metaPath), adapter });
    // a fallback LEFT takes the nav base only when it spells NO effect of its own: an
    // SE-bearing one routes through the callBranch memo, which owns the re-emission order
    if (navBase && !(receiver?.type === 'LogicalExpression' && navBase.leadingEffects)) {
      ({ baseIdent, passthroughPrefix, leadingEffects } = navBase);
      baseIsProxy = true;
    } else if (!sePolicy.callBranch && receiver?.type === 'LogicalExpression') {
      // a fallback-shaped receiver (`(SE, Array) || Set`) collapses LEFT: the literal replaces
      // the whole logical, the left's sequence prefix re-runs ahead of it (its own claims stay
      // live), the dropped branch dies whole
      let left = peelTransparentExpr(receiver.left);
      if (left?.type === 'SequenceExpression') {
        // capture the LIVE sequence, not its elements: the walker still rewrites the prefix
        // in place, and the drain reads the current state
        leadingEffects = left;
        left = peelTransparentExpr(left.expressions.at(-1));
      }
      baseIdent = left;
    }
    // an SE-bearing / call-rooted receiver the direct swap cannot hold: the shared policy
    // routes it through the function-IIFE memo channel - the receiver runs ONCE as the
    // argument, unresolved keys read the memo param, resolved ones their polyfill
    const { callBranch } = sePolicy;
    let memoArgPlan = null;
    if (callBranch) {
      leadingEffects = null;
      // the canonical re-read target resolves on the PRISTINE tree - at drain time the
      // in-place claims would already have reshaped the spine
      memoArgPlan = planMemoArg(receiver.type === 'LogicalExpression' ? receiver.left : receiver, metaPath);
    } else if (baseIdent?.type !== 'Identifier' && baseIdent?.type !== 'ThisExpression') return false;
    const dedupKey = synthPropDedupKey(metaPath.node, { scope: metaPath.scope, path: metaPath, adapter });
    if (!dedupKey) return false;
    let pending = synthLedger.get(pattern);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
      if (!plan) return false;
      pending = {
        plan, receiver, baseName: callBranch || baseIdent.type !== 'Identifier' ? null : baseIdent.name,
        baseIsProxy,
        leadingEffects,
        passthroughPrefix,
        callBranch,
        // the provider's own verdict on whether the receiver's READ has to run: the same
        // `classifyCallBranchForSynth` answer babel's swap consumes
        rescueSe: sePolicy.rescueSe ?? null,
        // the IIFE param takes its number HERE, ahead of the claims inside the receiver: the
        // pattern is visited before its own init and babel numbers by that order
        // ... and only where the pattern will NOT be fully covered: a covered one renders the flat
        // rescue and never reads the param, and the idle mint costs the LIVE one its slot
        memoName: callBranch
          && !synthPlanFullyCovered(plan, receiver, metaPath, { adapter, resolvePure }) ? mintRefName() : null,
        // a fallback-logical memoizes its resolved LEFT (the dead right short-circuits);
        // the node stays LIVE, so the walker's in-place claims reach the memo argument
        memoReceiver: callBranch ? (receiver.type === 'LogicalExpression' ? receiver.left : receiver) : null,
        memoArgPlan,
        // ... and the SHAPE of the sealed read the swap erases, planned on the PRISTINE tree:
        // by drain time the walk has rendered that nav into its guard and the seal is gone
        sealedProbePlan: planSealedNavProbe(receiver, metaPath, probeRenderCtx),
        metaPath,
        slots: new Map(),
      };
      synthLedger.set(pattern, pending);
    }
    // the replace target must not be swapped out from under the registration by the
    // ordinary arms (the drain would miss the detached node); a collapsed logical keeps its
    // SE prefix LIVE and kills only the tail ident and the dropped branch
    // the effects the drain's rescue will RE-EMIT stay claim-live inside a marked span:
    // their claims land in place and the drain harvest picks the rewritten spelling
    function markSkippedKeepingRescues(node) {
      for (const rescue of discardRescueNodes({ node, ...nodeSite(node, metaPath), adapter })) {
        skippedNodes.keepLive?.add(rescue);
      }
      markSubtreeSkipped(skippedNodes, node, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    }
    if (callBranch) {
      if (receiver.type === 'LogicalExpression') markSubtreeSkipped(skippedNodes, receiver.right);
      // the top node must survive to the drain (a whole-member claim would detach it). a
      // canonically-planned tail is consumed whole; without a plan the inner nodes stay
      // live so the memo argument carries their in-place claims
      skippedNodes.add(receiver);
      if (memoArgPlan) markSkippedKeepingRescues(memoArgPlan.tail);
    } else if (receiver.type === 'LogicalExpression') {
      markSubtreeSkipped(skippedNodes, receiver.right);
      // a NAV left dies whole with the swap - a tail-only skip would leave a dropped
      // sequence prefix's globals visible and leak a dead import
      if (baseIsProxy) markSkippedKeepingRescues(receiver.left);
      else skippedNodes.add(baseIdent);
    } else if (receiver.type === 'MemberExpression') markSkippedKeepingRescues(receiver);
    else skippedNodes.add(receiver);
    pending.slots.set(dedupKey, injectPureImport(entry, hintName));
    return true;
  }

  // the per-branch mirror over a conditional / logical receiver: only a VIABLE branch (its
  // ctor carries a static polyfill for the key) becomes a literal; the rest keep their own
  // routing (the ctor identifier arm still swaps `Set` -> `_Set`)
  function handlePerBranch({ metaPath }) {
    const prop = metaPath.node;
    if (prop.type !== 'Property') return;
    const patternPath = metaPath.parentPath;
    const pattern = patternPath?.node;
    if (pattern?.type !== 'ObjectPattern') return;
    // the assignment's VALUE is the receiver itself: a branch swapped for a synth literal
    // would change what the expression yields, so a CONSUMED assignment declines the mirror
    // (`const host = ({ assign: a } = shim || Object)` keeps `Object`)
    if (patternPath.parentPath?.node?.type === 'AssignmentExpression'
      && !assignmentInStatementPosition(patternPath.parentPath)) return;
    // an ARRAY-WRAPPED pattern names no receiver slot of its own - the matching ELEMENT is
    // the value it destructures, and a selecting element is the same per-branch shape
    const desc = resolveFallbackReceiver(patternPath.parentPath, pattern)
      ?? (element => element ? { rhsNode: element } : null)(resolveArrayWrappedReceiver(patternPath)?.element);
    if (!desc?.rhsNode) return;
    // the SECOND way a foreign-frame receiver enters the channel (the first is the arg detector):
    // the shared resolver hands back the call-ARG plus the site it evaluates at, so the subtree
    // takes its frame stamp here too - every branch question below then answers at the call site
    if (desc.callPath) stampNodeSite(desc.rhsNode, { scope: desc.callPath.scope, path: desc.callPath });
    // a HOP prop (its value another pattern): the mirror descends into the leaf and
    // resolves each leaf slot as a static of the hop's constructor - the branch literal
    // then nests back up (`cond ? { Array: { from: _Array$from } } : userObj`)
    if (prop.value?.type === 'ObjectPattern') {
      if (prop.computed) return;
      // every outer prop a plain hop: each registers its own subtree, the drain merges
      // them into ONE branch literal (`{ Array: {...}, JSON: {...} }`)
      const mirrorable = pattern.properties.length === 1
        || pattern.properties.every(item => item.type === 'Property' && !item.computed
          && item.value?.type === 'ObjectPattern');
      const chainKeys = [];
      let hopProp = prop;
      while (hopProp.value?.type === 'ObjectPattern' && !hopProp.computed) {
        const keyName = hopProp.key?.name ?? hopProp.key?.value;
        if (typeof keyName !== 'string') return;
        chainKeys.push(keyName);
        const innerPattern = hopProp.value;
        if (innerPattern.properties.length === 1 && innerPattern.properties[0]?.value?.type === 'ObjectPattern') {
          [hopProp] = innerPattern.properties;
          continue;
        }
        if (mirrorable && registerNestedBranchMirror({
          branch: desc.rhsNode,
          leafPattern: innerPattern,
          chainKeys,
          metaPath,
          outerPattern: pattern,
        })) return;
        // the mirror declined (a `&&` / diverging shape / hop siblings): a DEFAULTED leaf
        // still takes the sound inline default - the polyfill lands only where the
        // destructured slot is undefined, whatever the receiver held
        swapInlineDefaults({
          leafPattern: innerPattern, ctorName: chainKeys.at(-1), metaPath,
          insertOnUndefaulted: peelTransparentExpr(desc.rhsNode)?.type === 'LogicalExpression'
            && peelTransparentExpr(desc.rhsNode).operator === '&&',
        }, { resolvePure, markSubtreeSkipped, skippedNodes, injectPureImport, markRewrite });
        return;
      }
      return;
    }
    if (!isSynthSimpleObjectPattern(pattern)
      || !computedKeysAllBound(pattern, metaPath.scope, mintedKeyExempt(metaPath))) return;
    const { lookupKey } = resolveSynthKeys({ node: prop, scope: metaPath.scope, adapter, path: metaPath });
    const dedupKey = synthPropDedupKey(prop, { scope: metaPath.scope, path: metaPath, adapter });
    if (!lookupKey || !dedupKey) return;
    // the winning CALL-ARG leaves the wrapper-default live on its undefined-shaped arm -
    // thread the default so the leaf substitutes it there (the shared S081-1 rule)
    const wrapperNode = patternPath.parentPath?.node;
    const undefinedArmFallback = wrapperNode?.type === 'AssignmentPattern' && desc.rhsNode !== wrapperNode.right
      ? wrapperNode.right : null;
    registerBranchTree({ branch: desc.rhsNode, key: lookupKey, dedupKey, pattern, metaPath, undefinedArmFallback });
  }

  // the nested mirror registers only on a PRISTINE proxy-root branch: leading hops must be
  // pristine proxy steps, the last one names the constructor whose statics fill the slots
  function registerNestedBranchMirror({ branch, leafPattern, chainKeys, metaPath, outerPattern = null }) {
    // the LEFT of an `&&` is the selection's TEST value, not a branch the destructure
    // consumes: its read substitutes normally and only the RIGHT mirrors
    // (`self && globalThis` -> `_self && { Array: { of: _Array$of } }`)
    {
      let host = metaPath;
      while (host?.node && host.node.type !== 'VariableDeclarator'
        && host.node.type !== 'AssignmentExpression') host = host.parentPath;
      const selecting = peelTransparentExpr(host?.node?.init ?? host?.node?.right ?? null);
      if (selecting?.type === 'LogicalExpression' && selecting.operator === '&&'
        && peelTransparentExpr(selecting.left) === branch) return false;
    }
    if (chainKeys.slice(0, -1).some(key => !isPristineProxyGlobal(adapter, key))) return false;
    if (!isSynthSimpleObjectPattern(leafPattern)
      || !computedKeysAllBound(leafPattern, metaPath.scope, mintedKeyExempt(metaPath))) return false;
    let inner = peelFallbackBranchInner(branch);
    if (!inner) return false;
    // an INLINE-resolvable CALL branch yields its own RETURN expression: the literal replaces
    // that, so the call still runs and its body's effects stay where the source wrote them
    // (`c ? (() => { hits++; return globalThis; })() : ...`, `(() => m && globalThis)()`)
    if (inner.type === 'CallExpression' && !inner.optional) {
      const returned = inlineCallReturnExpression(
        { node: inner, seen: new Set(), ctx: { ...nodeSite(inner, metaPath), adapter } }, { rejectConditional: true },
      );
      // an IDENTITY call hands back its ARGUMENT: the literal lands on that value's own tail,
      // so a sequence prefix keeps running where the source wrote it
      let value = returned && peelTransparentExpr(returned.node);
      while (value?.type === 'SequenceExpression') value = peelTransparentExpr(value.expressions.at(-1));
      // ... and only the shapes whose yield is ONE surface: a bare proxy root, or an `&&` GATE
      // whose right operand is that root (`() => m && globalThis`). a selection between two
      // different surfaces keeps its own channels - the mirror there would spell both arms
      const gatedRoot = value?.type === 'LogicalExpression' && value.operator === '&&'
        && !proxySurfaceIdentifier(peelTransparentExpr(value.left), { adapter, injectorState });
      if (value && (gatedRoot || (value.type === 'Identifier' && isPristineProxyGlobal(adapter, value.name)))) {
        inner = value;
      }
    }
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        if (!fallbackBranchSwapKeepsSelection({
          hostNode: inner, slot, branchNode: inner[slot], ...nodeSite(inner, metaPath), adapter,
        })) continue;
        if (registerNestedBranchMirror({
          branch: inner[slot], leafPattern, chainKeys, metaPath, outerPattern,
        })) any = true;
        // a FALLBACK logical is decided by its LEFT, and the mirror puts an always-truthy
        // literal there: the right can no longer run, so it stays verbatim (babel's dead-side
        // canon). a CONDITIONAL keeps both - either arm is still reachable
        if (any && inner.type === 'LogicalExpression' && inner.operator !== '&&') break;
      }
      return any;
    }
    if (inner.type !== 'Identifier' || !isPristineProxyGlobal(adapter, inner.name)) return false;
    const plan = buildPatternRenderPlan(leafPattern, { scope: metaPath.scope, path: metaPath, adapter });
    if (!plan) return false;
    const slotMap = new Map();
    for (const planEntry of plan) {
      // a wks leaf under the hop is not a static of the hop's ctor - it dispatches on the
      // VALUE, which the nested literal has no slot for. both legs keep the key-swap there
      if (planEntry.wks) return false;
      const pure = resolvePure({
        kind: 'property', object: chainKeys.at(-1), key: planEntry.lookupKey, placement: 'static',
      }, metaPath);
      if (pure?.kind === 'instance') return false;
      // an unresolvable STATIC leaf renders as a passthrough off the branch root
      // (`isArray: _globalThis.Array.isArray` beside `of: _Array$of` - babel's mixed
      // mirror); only an all-unresolvable pattern has nothing to mirror for
      if (!pure) continue;
      slotMap.set(planEntry.dedupKey, injectPureImport(pure.entry, pure.hintName));
    }
    if (!slotMap.size) return false;
    markSubtreeSkipped(skippedNodes, inner);
    let pending = pendingBranchSynths.get(inner);
    if (!pending?.nestedTrees) {
      pending = { receiver: inner, nestedTrees: [] };
      pendingBranchSynths.set(inner, pending);
    }
    // BOTH claims of a hop pair (the leaf's and the hop's own) can reach a mirror route -
    // the registry dedups by identity, or the branch literal doubles its prop
    if (pending.nestedTrees.some(tree => tree.outerPattern === outerPattern
      && tree.chainKeys.join('.') === chainKeys.join('.'))) return true;
    pending.nestedTrees.push({ plan, slots: slotMap, chainKeys: [...chainKeys], outerPattern });
    if (outerPattern) branchMirrorPatterns.add(outerPattern);
    return true;
  }

  function registerBranchTree({ branch, key, dedupKey, pattern, metaPath, undefinedArmFallback = null }) {
    const inner = peelFallbackBranchInner(branch);
    if (!inner) return false;
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        // a value-selecting operand that can be nullish must not become an always-defined
        // literal - the swap would flip which branch runs (the shared predicate's contract).
        // the undefined-shaped arm under a live PARAM DEFAULT is the one exception: the
        // shared rule substitutes the default there (same branch, same value)
        if (!undefinedArmEffectiveReceiver({ branch: inner[slot], paramDefaultNode: undefinedArmFallback })
          && !fallbackBranchSwapKeepsSelection({
            hostNode: inner, slot, branchNode: inner[slot], ...nodeSite(inner, metaPath), adapter,
          })) continue;
        if (registerBranchTree({ branch: inner[slot], key, dedupKey, pattern, metaPath, undefinedArmFallback })) any = true;
      }
      return any;
    }
    const effectiveBranch = undefinedArmEffectiveReceiver({ branch, paramDefaultNode: undefinedArmFallback }) ?? branch;
    const pure = isViableBranchForKey({
      branch: effectiveBranch, key, ...nodeSite(effectiveBranch, metaPath), adapter,
      resolvePure: m => resolvePure(m, nodeSite(effectiveBranch, metaPath).path),
    });
    if (!pure || pure.kind === 'instance') return false;
    // an SE-carrying branch (a buried effect along the spine, a call root) swaps WITH its
    // rescue through the shared callBranch drain channel - the receiver re-emits ahead of
    // the literal (`cond ? ((eff2(), _globalThis).Object, { keys: _Object$keys }) : ...`);
    // partial key coverage takes the IIFE instead, the branch value passed as its memo
    const sePolicy = inner.type === 'Identifier' ? { callBranch: false }
      : classifyCallBranchForSynth({ inner, ...nodeSite(inner, metaPath), adapter });
    if (sePolicy.callBranch) {
      let pending = pendingBranchSynths.get(inner);
      if (!pending) {
        const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
        if (!plan) return false;
        pending = {
          plan, receiver: inner, slots: new Map(), callBranch: true, branchMirror: true, metaPath,
          rescueSe: sePolicy.rescueSe ?? null,
          // partial key coverage renders the IIFE, and the branch VALUE is its argument -
          // the node itself, which the drain moves out of the tree into the call
          memoReceiver: inner,
          // ... and the sealed read this ARM erases, planned on the PRISTINE tree like the
          // flat swap's (`cond ? ((<guard>).Object, { assign: _Object$assign }) : ...`)
          sealedProbePlan: planSealedNavProbe(inner, metaPath, probeRenderCtx),
        };
        pendingBranchSynths.set(inner, pending);
      }
      // the top node survives to the drain; the spine stays LIVE so its in-place claims
      // reach the rescue clone
      skippedNodes.add(inner);
      pending.slots.set(dedupKey, injectPureImport(pure.entry, pure.hintName));
      return true;
    }
    // a MEMBER branch (a proxy-global nav) reads its unresolved keys through the
    // decomposed root + surviving hop keys (`cond ? globalThis.Array : Set` passes
    // `other` through `_globalThis.Array.other`)
    if (inner.type !== 'Identifier' && inner.type !== 'MemberExpression') return false;
    let branchBase = null;
    if (inner.type === 'MemberExpression') {
      let hopKeys = [];
      let cur = inner;
      while (cur?.type === 'MemberExpression' && !cur.computed) {
        hopKeys.unshift(cur.property?.name);
        cur = peelTransparentExpr(cur.object);
      }
      if (!hopKeys.length || hopKeys.some(hop => !hop)) return false;
      let rootName = cur?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(cur.name) ? cur.name : null;
      if (!rootName && cur) {
        // an inline-resolvable PURE root (`(() => globalThis)().Promise`, an alias): the
        // root falls away (the canonical discard keeps nothing) and the passthrough reads
        // through the resolved surface (`_Promise.baz`)
        const resolved = resolveObjectName({ objectNode: cur, ...nodeSite(cur, metaPath), adapter });
        if (resolved && POSSIBLE_GLOBAL_OBJECTS.has(resolved)
          && !discardRescueNodes({ node: cur, ...nodeSite(cur, metaPath), adapter }).length) {
          rootName = resolved;
        }
      }
      if (!rootName) return false;
      while (hopKeys.length && isPristineProxyGlobal(adapter, hopKeys[0])) hopKeys = hopKeys.slice(1);
      branchBase = { baseName: rootName, passthroughPrefix: hopKeys, baseIsProxy: true };
    }
    let pending = pendingBranchSynths.get(inner);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
      if (!plan) return false;
      // the sealed read this ARM erases, planned on the PRISTINE tree: at drain time the walk
      // has rendered that nav into its guard and the seal is no longer visible
      pending = {
        plan, receiver: inner, slots: new Map(), metaPath, ...branchBase,
        sealedProbePlan: planSealedNavProbe(inner, metaPath, probeRenderCtx),
      };
      pendingBranchSynths.set(inner, pending);
    }
    // the literal REPLACES the branch whole - a spine-skip would leave the ctor identifier
    // arm racing the swap (the same race the simple receiver mark prevents)
    markSubtreeSkipped(skippedNodes, inner);
    pending.slots.set(dedupKey, injectPureImport(pure.entry, pure.hintName));
    return true;
  }

  // the array-wrapped ASSIGNMENT twin's registration, extracted for its size - see the
  // arrayHost branch in handleObjectPropertyResult
  // is this member read rooted in a PLAIN local value? a nav into a built-in namespace is the
  // proxy / anchored machinery's shape and answers its own way - a leaf off the object those hops
  // merely REACH is a name match, not a claim - so only a member whose root is an ordinary binding
  // may be spelled once by the literal route
  function plainLocalMemberRoot(node) {
    let root = node;
    while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') root = root.object;
    return root?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(root.name)
      && !resolvePure({ kind: 'global', name: root.name }, null);
  }

  function registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath,
    symbolProp, patternPath }) {
    // a BODYLESS twin and an INSTANCE-defaulted prop both keep the raw destructure (the
    // native slot assigns first, the overwrite re-binds after), so the element is read
    // TWICE - only a re-referenceable one qualifies. a STATIC default is DEAD (the pairing
    // proved the element) and the consume drops it with the destructure, the declaration
    // route's own rule
    // ... unless the slot PRUNES: nothing ran the default then, so it neither keeps the raw slot nor
    // falls back to the binding - the default node is the one reader left
    const prunes = consumedAssignmentSlotPrunes(metaPath);
    const defaulted = prop.value.type === 'AssignmentPattern' && kind === 'instance' && !prunes;
    // ... and a MULTI-element wrapper is the third such keeper: its siblings still bind, so the
    // destructure stays whole and this claim only appends its overwrite. a FLAT static stands down
    // there - its render is the cascade REBUILD, which never descends a multi-element wrapper, so
    // claiming it here would be the only leg polyfilling that slot
    if (wrapped.multi && kind !== 'instance' && !symbolProp && !chain.length
      && !computedKeyHasSideEffects(prop)) return;
    const keepsRaw = wrapped.bodyless || wrapped.multi;
    const chainKeys = hopChainKeys(chain);
    // the dead default peels out of the VALUE only - the raw prop keeps its own binding
    const twinProp = prop.value.type === 'AssignmentPattern' ? { ...prop, value: prop.value.left } : prop;
    // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
    // wrapper pairing proved the element, and a chain reads through the literal to the
    // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
    // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
    // ... and it resolves like every other nested claim: through an SE-peeled fragment (a kept WRITE
    // is a prefix of its own) and through the nav segments the hops name. a receiver that came back
    // WITH those segments has consumed the pattern's hops, so they must not be appended twice
    // ... and where the residual dies WHOLE an effect-bearing one qualifies too: the dispatch is then
    // the only reader and performs the effects the dropped RHS would have, exactly once
    // (`([{ y: { at: v } }] = [{ y: eff() }])`)
    const twinPlainDeep = kind === 'instance' && chain.length
        ? resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true, allowNavSegments: true }) : null;
    const twinCarriedDeep = kind === 'instance' && chain.length && !twinPlainDeep
      && consumedAssignmentSlotDropsHost(metaPath)
      ? carriedInitReceiverNode({
        path: metaPath,
        initNode: wrapped.assignment?.right,
        resolveOptions: { allowSePeeledFragment: true, allowNavSegments: true },
      }) : null;
    const twinDeepReceiver = twinPlainDeep ?? twinCarriedDeep;
    const twinReceiver = twinDeepReceiver ?? wrapped.element;
    // the questions below are asked WITH the guard context, never on a PEELED marker: a receiver
    // wearing a dead chain marker is a provable nav all the same, and peeling it ahead of them
    // strips the wrapper and leaves the hop flags saying the opposite - the marked twin then shipped
    // native where the plain one extracts (`[{ Array: { from } }, zn] = [globalThis?.globalThis, 7]`)
    const twinGuardCtx = navGuardCtx(metaPath);
    // the raw slot the shapes above KEEP reads the receiver a second time, so what the dispatch
    // spells beside it must be safe to spell twice: a re-referenceable token, or a nav into the
    // built-in namespace the polyfill already models as stable - the same pair babel's own
    // overwrite gate asks, now asked of the RESOLVED receiver instead of the raw element
    // ... and a PROXY nav answers the same question through its own resolution, which is what reads
    // the `?.` hops the surface predicate cannot judge on its own (`globalThis?.globalThis`)
    // ... and the LEAF's own siblings keep that raw slot just as surely: the consumed prop leaves,
    // the pattern stays for them, and what it reads is the same hop the dispatch spells. so does a
    // REST above the hop - it keeps the hop's key in the pattern, and the key IS that read
    if ((keepsRaw || defaulted || pattern.properties?.length > 1
      || chain.some(level => level.outerRest))
      && !isReReferenceableReceiver(twinReceiver)
      && !isReReadableSurfaceNav(twinReceiver, name => !!injectorState?.getBindingInfo?.(name))
      && !resolveProxyNavReceiver(twinReceiver, twinGuardCtx)) return;
    // ... and an SE-keyed INSTANCE prop over a MEMBER receiver stands down whatever the wrapper, and
    // whether or not it is defaulted: the kept key re-reads that member in the residual and the
    // dispatch would read it again, where the source reads once - the plain assignment host's own
    // rule. asked of the RESOLVED receiver, not the raw element: a chain that resolved to a nav
    // (`[{ y: { [se()]: m } }] = [nb]` dispatches on `nb.y`) is the same member read twice
    if (kind === 'instance' && prop.computed && computedKeyHasSideEffects(prop)
      && !hasRestSibling(pattern)
      && peelTransparentExpr(twinReceiver)?.type === 'MemberExpression') return;
    // ... and a COMPUTED key over a resolved NAV stands down here whatever its effects: the plain
    // assignment host leaves that shape native on BOTH legs, and the wrapper is the same host one
    // literal further in - claiming it here would make this the only place the family rewrites.
    // the SYMBOL claim is not this shape: its computed key is the route's own subject
    if (kind === 'instance' && !symbolProp && prop.computed && chain.length) return;
    // ... and a nav into the BUILT-IN namespace must NAME the instance surface it dispatches on: a
    // leaf off the object the hops merely REACH is a name match (`[{ Array: { keys: k } }] =
    // [globalThis]`), which every other host of both legs keeps native. the RESOLVED receiver is what
    // answers, since the resolution consumed the pattern's hops
    if (kind === 'instance' && twinDeepReceiver
      && isBuiltInSurfaceNav(twinDeepReceiver) && !isInstanceSurfaceNav(twinDeepReceiver)) return;
    // the dispatch SPELLS this element, effects included, so the dead residual must not re-emit the
    // RHS beside it - the two halves disagreeing about that ran `[eff()]` twice. it is also what
    // tells the value builder to keep an SE PREFIX inside the dispatch: the peel exists to leave it
    // to the residual, and there is no residual left to run it
    // ... but an element that SPELLS A SEQUENCE stands down entirely, as the other leg does: a claim
    // INSIDE it renders by lifting its own prefix into the residual, so dropping the residual drops
    // that lift, and keeping it re-reads what the dispatch spells (`[(log.push("f"), arr).flat()]`)
    // a STATIC claim spells no receiver at all - it substitutes its own pure import - so it carries
    // nothing and the residual keeps every effect the element owes
    const carriesInit = kind === 'instance'
      && receiverPerformsEveryInitEffect(wrapped.assignment?.right, twinReceiver);
    // ... and so does an element the PEEL reduced to a sequence's TAIL: the residual keeps the whole
    // sequence while the dispatch spells that tail, so spelling it is a SECOND evaluation unless it
    // is free to re-read. a second pass over this leg's own output is where the shape appears, with
    // the prefix lifted to the top (`[(push, _flat(arr).call(arr))]`)
    if (kind === 'instance' && wrapped.elementNode?.type === 'SequenceExpression'
      && wrapped.elementNode !== wrapped.element
      && !isReReferenceableReceiver(wrapped.element)) return;
    if (carriesInit && spellsSequenceExpression(twinReceiver)) return;
    const value = buildValue({
      guardCtx: twinGuardCtx,
      kind,
      entry,
      hintName,
      receiverNode: twinReceiver,
      carriesInit,
      // the element is re-resolved at DRAIN through the same walk: a claim INSIDE it renders by
      // replacing its node, and the copy this job captured predates that. only where the walk
      // itself named the element - a resolved deep receiver keeps the spelling it resolved
      // ... a CARRIED one re-resolves through its own walk: the claim may sit INSIDE it, and rendering
      // that claim replaces the node this job captured
      liveReceiver: twinCarriedDeep
        ? () => resolveNestedReceiverNode(metaPath,
          { allowSePeeledFragment: true, allowNavSegments: true, allowInitCarriedEffects: true }) ?? twinReceiver
        : twinDeepReceiver || !patternPath ? null
          : () => resolveArrayWrappedReceiver(patternPath)?.element ?? twinReceiver,
      prop: twinProp,
      nested: !twinDeepReceiver && chain.length > 0,
      chainKeys: twinDeepReceiver ? [] : chainKeys, metaPath,
      // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
      // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
      // ... and a side-effect-free MEMBER element rides it too where the residual DIES: the gate above
      // already refused every shape that keeps a raw reader, so the dispatch is the only read and
      // spelling it once costs nothing - the plain assignment host's own rule, which is why the two
      // legs answered this element differently
      // ... and where the residual DIES the element has exactly ONE reader - the dispatch - so it may
      // be spelled whatever its shape, effects included: that is the single read native performs.
      // the gate above already refused every shape that keeps a raw reader beside it
      // ... and a CARRIED receiver is that route by construction: it only resolved because the whole
      // residual dies, so the dispatch is the single read - whatever the element's shape
      literalRoute: kind === 'instance' && (!!twinCarriedDeep
          || (!keepsRaw && !defaulted && pattern.properties?.length === 1
            && !chain.length && !(prop.computed && computedKeyHasSideEffects(prop)))
          || isConstantLiteralReceiver(peelTransparentExpr(twinReceiver))
          || (isSeFreeMemberReceiver(peelTransparentExpr(twinReceiver))
            && plainLocalMemberRoot(peelTransparentExpr(twinReceiver))
            && pattern.properties?.length === 1
            && !(prop.computed && computedKeyHasSideEffects(prop)))
          || (isReReferenceableReceiver(twinReceiver)
            && !(peelTransparentExpr(twinReceiver)?.type === 'Identifier'
              && POSSIBLE_GLOBAL_OBJECTS.has(peelTransparentExpr(twinReceiver).name)))),
    });
    if (!value) return;
    // the kept raw slot already ran the source's default exactly once, so the overwrite falls back
    // to the BINDING - a dispatch that answers undefined must not bury it
    const twinRef = defaulted || (prunes && prop.value.type === 'AssignmentPattern' && kind === 'instance')
      ? injector.generateDeclaredRef(metaPath) : null;
    const guardedValue = twinRef
      ? override => overwriteDefaultGuard({
        call: value(override),
        localName: propLocalName(prop),
        ref: twinRef,
        defaultNode: prunes ? prop.value.right : null,
      })
      : value;
    markRewrite();
    recordJob({
      hostPath: wrapped.exprStmtPath,
      job: (() => {
        const job = {
          prop,
          pattern,
          chain,
          // a rest sibling keeps the residual reading past the consumed key - the prop
          // renames to `_unused` there; without one the prop leaves and the left dies
          // ... and a computed KEY carrying an effect keeps its slot too: the key runs where it
          // stands, and a removed prop takes that effect with it
          // ... and a MULTI wrapper keeps the slot only where the shared canon says it must: a
          // consumed prop whose own hop chain may leave still leaves (`[{ a, y: { flat: m } }, zn]`
          // sheds `y` and keeps `a`), and it is the WRAPPER level that pins the flat one
          sentinel: defaulted || (wrapped.multi && !prunes) || computedKeyHasSideEffects(prop)
            || hasRestSibling(pattern) || chain.some(level => level.outerRest),
          // ... except a SYMBOL target, which has no declaration to host an extraction: the
          // destructure assigns it natively first and the overwrite rebinds it through the
          // helper, so the prop keeps its own binding (`[{ [S]: it, ...r }] = [arr]`) -
          // and a DEFAULTED one, whose default must run natively before the re-bind
          keepSentinelBinding: symbolProp || defaulted || (wrapped.multi && !prunes)
            || computedKeyHasSideEffects(prop),
          local: propLocalName(prop), value: guardedValue, prunesSlot: prunes,
          // the dispatch SPELLS this element, effects included, so the dead residual must not
          // re-emit the RHS beside it - the two halves disagreeing about that ran `[eff()]` twice.
          carriesInit,
          host: 'array-assign', assignment: wrapped.assignment, metaPath, bodyless: wrapped.bodyless,
          mintedSentinels: [],
        };
          // assignment position writes an undeclared name: the drain plants `var _unusedN`
        job.mintSentinel = () => {
          const name = mintUnusedName();
          job.mintedSentinels.push(name);
          return name;
        };
        return job;
      })(),
    });
  }

  // the ONE dead-default rule both inner-default spellings ask (the receiver-bearing route
  // through handleParamHost's declarator case and the receiver-less one in
  // handleObjectPropertyResult): when the OUTER init is TYPED and the outer key dispatches
  // an instance polyfill, the outer slot is always defined and the inner default never
  // fires - mirroring it would polyfill only the DEAD branch while the LIVE outer step
  // stays a raw read. babel answers the shape with the composed two-step extraction (the
  // guarded outer dispatch); until this leg composes that extraction too, the leaf stays
  // native rather than wrong-sided
  function innerDefaultDeadOnTypedOuter({ assignmentPattern, receiverPath, metaPath }) {
    const outerProp = assignmentPattern?.parentPath;
    const outerKeyNode = outerProp?.node?.type === 'Property' && !outerProp.node.computed ? outerProp.node.key : null;
    const outerKey = outerKeyNode?.name ?? (typeof outerKeyNode?.value === 'string' ? outerKeyNode.value : null);
    const initPath = receiverPath;
    if (!initPath?.node || typeof outerKey !== 'string') return null;
    // a STATIC outer hop composes the same two steps: the init NAMES the constructor, the key is a
    // static of it, and what the step spells is an import binding - always defined, so the drain
    // reads it in place instead of memoizing a call (`{ from: { name } = {} } = Array`)
    if (initPath.node.type === 'Identifier') {
      const outerStatic = resolvePure({
        kind: 'property', object: initPath.node.name, key: outerKey, placement: 'static',
      }, metaPath);
      if (outerStatic && outerStatic.kind !== 'instance') return outerStatic;
    }
    // an UNTYPED receiver still dispatches, generically: the surface is what the hop reads, and the
    // key names it whatever the receiver turns out to be - the same answer the FLAT twin in this
    // very host gives (`catch ({ at })` -> `_at(_ref)`). asked without a path there, since the
    // instance resolution narrows by the receiver type the path names and there is none to narrow by
    const receiverType = resolveNodeType ? resolveNodeType(initPath) : null;
    const objectHint = receiverType && toHint ? toHint(receiverType) : null;
    // ... but a receiver whose CONSTRUCTOR this pass already SUBSTITUTED carries the method on the
    // ponyfill's own prototype (`new Map()` is `new _Map()` by now, and `_Map.prototype.keys` is the
    // polyfilled one), so a second dispatch imports what nothing reads - the FLAT twin of this very
    // read is native on both legs for that reason. an instance method pure adds to a NATIVE
    // prototype (`Array`) is the other case, and it dispatches. the type's ctor is asked of the
    // INJECTOR, since by now it names the minted import rather than the global
    const receiverCtor = receiverType?.primitive ? null : receiverType?.constructor ?? null;
    if (receiverCtor && injectorState?.getBindingInfo?.(receiverCtor)) return null;
    const outerPure = resolvePure({
      kind: 'property', object: objectHint ?? undefined, key: outerKey, placement: 'prototype',
    }, objectHint ? metaPath : null);
    return outerPure?.kind === 'instance' ? outerPure : null;
  }

  // the TYPED single hop (the receiver's own type dispatches the outer key, as an instance method
  // or as a static of the constructor the receiver names) composes the two-step extraction: the hop
  // step feeds the leaf dispatch, the inner default folding through the canonical guard. it needs no
  // literal receiver, so it rides PAST the nested-instance declines, and it is what retires the
  // dead-mirror suppression for the sole-leaf shape - the babel leg composes the same steps natively
  // the value the outer key reads off, from whichever host spells it: a declarator's init and an
  // assignment's right are the same value, and the composition owes every host the same answer. a
  // host whose receiver is an ELEMENT hands that element in directly - the wrapper's own init is
  // the array AROUND it, and asking the outer key of that answers for the wrong surface
  function hostReceiverPath(host) {
    const type = host?.node?.type;
    if (type === 'VariableDeclarator') return host.get?.('init') ?? null;
    return type === 'AssignmentExpression' ? host.get?.('right') ?? null : null;
  }

  function typedHopFor({ chain, kind, entry, metaPath, receiverPath }) {
    const assignmentPattern = chain.length === 1 && metaPath.parentPath?.parentPath?.node?.type === 'AssignmentPattern'
      && metaPath.parentPath.parentPath.node.left === metaPath.parentPath.node
      ? metaPath.parentPath.parentPath : null;
    if (!assignmentPattern || kind !== 'instance' || entry === 'get-iterator-method') return { pure: null, defaultHost: null };
    return {
      pure: innerDefaultDeadOnTypedOuter({ assignmentPattern, receiverPath, metaPath }),
      // the HOST, not the node: the walk rewrites a claim inside the default IN PLACE, so the render
      // must read `.right` through the slot at drain time - a node captured here is the pre-rewrite
      // copy and ships the source read with its own polyfill lost
      defaultHost: assignmentPattern.node,
    };
  }

  // eslint-disable-next-line max-statements -- per-form prop dispatch sequence
  function handleObjectPropertyResult({ metaPath, meta, kind, entry, hintName }) {
    const prop = metaPath.node;
    // a PRISTINE proxy hop holding a nested pattern is pure NAVIGATION, not a ctor alias:
    // the flatten owns it, and an extraction here would bind the hop's OWN surface where
    // the source reads through it to the root (`{ self: { X } } = globalThis` -> `_globalThis`)
    // a guarded alias clouds the STATIC surface - WHICH object the binding holds - and that surface
    // is the guard channel's. an INSTANCE claim reads off the runtime value whatever the binding
    // turned out to hold, so it takes the ordinary dispatch here, exactly as the member spelling of
    // the same read does one dialect over
    if ((meta?.guardedAliasHint && kind !== 'instance')
      || (meta?.chainAssignInsertAt !== null && meta?.chainAssignInsertAt !== undefined)
      || (kind === 'global' && !prop.computed && prop.value?.type === 'ObjectPattern'
        && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && isPristineProxyGlobal(adapter, hintName))) return;
    // harvested effects: only pure RECEIVER effects pass (the memo path keeps the whole
    // init alive, effects included); a mixed channel stays staged. KEY effects never reach
    // the meta here - they live in the prop's own key subtree, probed directly below
    const receiverSeOnly = !!meta?.sideEffects?.length && meta.receiverEffectCount === meta.sideEffects.length;
    if ((meta?.sideEffects?.length || meta?.receiverEffectCount) && !receiverSeOnly) return;
    const symbolProp = entry === 'get-iterator-method';
    // does this leaf of an inner pattern carry a claim of ITS own? a resolving key is one, and a
    // key nothing can read - computed, an unknown spelling - is unknowable, which counts the same:
    // the leaf's own route renders that claim, and a pattern holding one is not ours to consume
    // a leaf of a pattern DEFAULT reads off the claim's RESULT, not off its receiver, so it is asked
    // WITHOUT this claim's object and without its path: the instance resolution narrows by the
    // receiver type the path names, and narrowing by THIS one answers for a surface the leaf never
    // touches - `name` off an `Array` receiver resolved to nothing, and the leaf read as claim-free
    function leafKeyMayClaim(leaf, { object, placement }) {
      if (leaf.type !== 'Property' || leaf.computed) return true;
      if (leaf.key?.type !== 'Identifier' && leaf.key?.type !== 'Literal') return true;
      return !!resolvePure({
        kind: 'property', object, key: leaf.key.name ?? leaf.key.value, placement,
      }, placement === 'prototype' ? null : metaPath);
    }
    // the ctor-pattern re-anchor serves only a pattern the FLATTEN leaves whole: one
    // resolvable leaf routes the claim through the leaf's own chain climb instead, and a
    // mixed pattern's split residual stays staged. it re-anchors the pattern VERBATIM on the
    // ponyfill, so its leaves must be plain bindings too - a rest would collect the ponyfill's
    // own properties instead of the constructor's
    const ctorPattern = kind === 'global' && prop.value?.type === 'ObjectPattern'
      && prop.value.properties.every(leaf => leaf.value?.type === 'Identifier'
        && !leafKeyMayClaim(leaf, { object: hintName, placement: 'static' }));
    // an INSTANCE pattern default becomes the extraction's own LHS, so its leaves may spell
    // anything a pattern spells - a REST included, which binds no key and so claims nothing.
    // what disqualifies it is a leaf naming a member of the RESULT: that leaf is a claim off
    // this one, and the composition is rendered by its route, not by a consume here
    const instancePatternLeft = kind === 'instance' && prop.value?.type === 'AssignmentPattern'
      && (prop.value.left?.type === 'ArrayPattern'
        || (prop.value.left?.type === 'ObjectPattern'
          && prop.value.left.properties.every(leaf => leaf.type === 'RestElement'
            || !leafKeyMayClaim(leaf, { object: undefined, placement: 'prototype' }))));
    if (!isPlainConsumableProp(prop, { symbolProp, ctorPattern, instancePatternLeft })) return;
    const patternPath = metaPath.parentPath;
    const pattern = patternPath?.node;
    // a RELOCATED catch pattern reaches this ledger as an ordinary declarator - the shared
    // liveness gate keeps a binding the catch body never reads a native read
    if (pattern?.type !== 'ObjectPattern' || relocatedCatchPropUnobservable({
      declaratorPath: patternPath.parentPath,
      propNode: prop,
      patternNode: pattern,
      localName: propLocalName(prop) ?? null, walkNode: (root, visit) => walkAstNodes({ root, visit }),
    })) return;
    // a rest sibling reads "everything the pattern did not consume": the consumed prop then
    // RENAMES to an `_unused` sentinel instead of leaving (the key keeps excluding it) - and
    // an SE computed key takes the same rename, its effect replaying in the residual
    const sentinel = hasRestSibling(pattern) || (prop.computed && computedKeyHasSideEffects(prop));
    // a sentinel-kept DEFAULTED prop retires whole (`[(se, 'at')]: _unused` - the default
    // lives on in the extraction's guard ternary); other pattern-valued props stay
    if (sentinel && prop.value.type !== 'Identifier'
      && !(prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier')
      && !(symbolProp && prop.value.type === 'ObjectPattern')) return;
    // the nested proxy flatten (`{ Array: { from } } = globalThis`): the resolution already
    // proved the hop chain (the meta resolved to the static through it), so the climb only
    // validates shape - plain non-computed hop props at every level - and records the
    // PATTERN CHAIN for the drain's emptiness cascade
    const climbed = climbPatternChain(patternPath, {
      scope: metaPath.scope,
      adapter,
      path: metaPath,
      carriesReceiver(defaultPath) {
        // a default carrying no receiver (`= {}`) has no slots to mirror
        const core = unwrapRuntimeExpr(defaultPath.node.right);
        if (core?.type !== 'Identifier' && core?.type !== 'MemberExpression') return false;
        // ... and a resolvable OUTER chain leaves its default dead: the receiver proves the hop
        // (`{ Set: { union } = Set } = globalThis` flattens), an opaque host does not
        let host = defaultPath.parentPath;
        while (host?.node && host.node.type !== 'VariableDeclarator' && host.node.type !== 'AssignmentExpression'
          && host.node.type !== 'CatchClause' && host.node.type !== 'ForOfStatement'
          && host.node.type !== 'ForInStatement') host = host.parentPath;
        const hostInit = host?.node?.init ?? host?.node?.right ?? null;
        if (!hostInit) return true;
        if (findProxyGlobal(hostInit, { scope: metaPath.scope, adapter, path: metaPath })) return false;
        // ... and a claim whose SHAPE a typed nav reaches keeps the hop without any deadness proof:
        // that route reads the nav once and folds BOTH arms through the canonical guard, where
        // mirroring the default alone polyfills the arm that may never run and leaves the live
        // read raw. the core owns the question, and it is the SOURCE shape that answers it - who
        // renders the fold (the dispatch, or the flat twin the normalization writes) is a later
        // question, and asking the OWNERSHIP one here handed an effect-keyed claim back to the
        // mirror. the synth gate stands down on this same answer
        if (kind === 'instance' && typedNavClaimShape(metaPath, { allowLeafSiblings: true })) return false;
        // the TYPED outer is the same dead rule from the other side: the outer slot is always
        // defined, so the climb keeps the hop and the composed extraction folds this default
        // through the canonical guard instead of mirroring it
        return !innerDefaultDeadOnTypedOuter({ assignmentPattern: defaultPath, receiverPath: hostReceiverPath(host), metaPath });
      },
    });
    if (!climbed) return;
    const { chain, hostPatternPath, hostParent } = climbed;
    // a pattern living in FUNCTION PARAMS (under a default / array wrapper): the
    // synth-swap family - the DEFAULT (or the classifiable receiver) is replaced by a
    // synthetic literal carrying the polyfilled slots
    // non-symbol nested instance leaves resolve through the declarator literal walk, or
    // through the ASSIGNMENT host's overwrite channel (no declaration to host a `const`,
    // so the ponyfill re-binds the local after the statement); every other host stays staged
    const nestedPlainInstance = chain.length > 0 && kind === 'instance' && entry !== 'get-iterator-method';
    // the long-hand flat shape takes its own route before the per-host branches below - the SYMBOL
    // leaf rides it too: once the declarator flattens, every claim in that leaf must read the shared
    // memo, or the hop it spells for itself is a second getter call
    if (chain.length > 0 && kind === 'instance'
      && registerFlattenLeafJob({ metaPath, prop, kind, entry, hintName })) return;
    // ... and where a REST sibling keeps the hop in the pattern, neither flatten nor extraction can
    // take it - the hop stays and would read a second time. the minted PAIR can: the hop's value
    // takes the name, the dispatch reads it, and the key stays excluding itself from rest. asked
    // only for that shape here; the array-element twin keeps its own call site in the wrapper branch
    if (chain.length > 0 && hostPatternPath?.node?.type === 'ObjectPattern'
      && hasRestSibling(hostPatternPath.node)
      && registerPositionalElementJob({ metaPath, prop, kind, entry, hintName })) return;
    // a receiver-bearing DEFAULT one level in (`{ inner: { at } = [1, 2] } = {}`): the climb sees
    // THROUGH the AssignmentPattern and lands the claim on the outer host, but the swap belongs to
    // the default - the same simple synth the parameter form takes, whatever that outer host is
    // (a declarator, an assignment, an array WRAPPER, a catch param: the host decides where the
    // residual lives, not whether the default is live - the babel twin asks nothing about it,
    // which is why this stands AHEAD of the per-host branches rather than after them).
    // ... but a DEAD default declines (`innerDefaultDeadOnTypedOuter` - the one rule both
    // inner-default spellings ask), and so does a claim whose SHAPE a typed nav reaches: there the
    // fold takes both arms off one read, where this swap would polyfill the default's arm and leave
    // the live one raw. same question, same answer, as at the other inner-default spelling
    if (chain.length > 0 && !receiverSeOnly && patternPath?.parentPath?.node?.type === 'AssignmentPattern'
      && patternPath.parentPath.node.left === patternPath.node
      && !(kind === 'instance' && typedNavClaimShape(metaPath, { allowLeafSiblings: true }))
      && !innerDefaultDeadOnTypedOuter({
        assignmentPattern: patternPath.parentPath, receiverPath: hostReceiverPath(hostParent), metaPath,
      })
      && registerSimpleSynthSlot({
        metaPath,
        pattern,
        hostParent: patternPath.parentPath,
        kind,
        entry,
        hintName,
      })) return;
    // an ARRAY-WRAPPED pattern with a literal init: the receiver is the MATCHING element;
    // the leaf renames to `_unused` (array positions cannot shrink) and the declaration
    // drops whole only when no real binding survives
    const assignHost = hostParent?.node?.type === 'AssignmentExpression'
      && hostParent.node.left === hostPatternPath.node && hostParent.node.operator === '=';
    // ... an ARRAY-WRAPPED host stays in: the wrapper branch below resolves its element and
    // the canonical nested walk reads through the literal to the dispatching receiver
    const arrayWrapHost = hostParent?.node?.type === 'ArrayPattern'
      || (hostParent?.node?.type === 'AssignmentPattern' && hostParent.parentPath?.node?.type === 'ArrayPattern');
    if (nestedPlainInstance && hostParent?.node?.type !== 'VariableDeclarator' && !assignHost
      && !arrayWrapHost) return;
    // an element DEFAULT between the pattern and its array host is transparent - the
    // matching element provably exists, so the default is dead (`[, { from } = {}]`)
    const arrayHost = hostParent?.node?.type === 'ArrayPattern'
      || (hostParent?.node?.type === 'AssignmentPattern' && hostParent.node.left === hostPatternPath.node
        && hostParent.parentPath?.node?.type === 'ArrayPattern');
    // ... a DEFAULTED slot rides this route under EVERY host: an INSTANCE claim keeps its
    // `=== void 0` guard (declaration) or the raw destructure with the overwrite re-bound
    // after (assignment - the default runs natively first), while a STATIC one extracts
    // GUARDLESS under both (the pairing proved the element, so the default arm is dead -
    // babel drops it, the assignment twin's own static rule)
    if (arrayHost) {
      // a wrapper reached through a CONST BINDING resolves like the inline literal only for a
      // claim that never RE-READS the element: a static substitutes its own pure and spells no
      // receiver, while an instance / symbol extraction would re-read a value the wrapper's own
      // statement holds (`const chain = [arr]; const [{ at }] = chain` stays native)
      const wrapped = resolveArrayWrappedReceiver(hostPatternPath,
        kind === 'instance' || symbolProp ? null : { scope: metaPath.scope, adapter, path: metaPath },
        { allowBodylessMulti: true, readsReceiver: kind === 'instance' || symbolProp });
      // a BODYLESS slot has no statement list for the array drain to splice into: the
      // element is the receiver and the shared bodyless registration owns the rewrite,
      // its own SE lift included
      if (wrapped?.host?.bodyless && wrapped.single) {
        return registerBodylessDeclJob({
          host: wrapped.host,
          kind,
          entry,
          hintName,
          prop,
          pattern,
          chain,
          sentinel,
          metaPath,
          initNode: wrapped.elementNode,
        });
      }
      // a diverging SELECTION declines only the branch-bound claims: a receiver-based one
      // (instance / symbol) reads the selected VALUE once inside its dispatch, exactly the
      // native read (`[{ at }] = [c ? a : b]` -> `at = _at(c ? a : b)` - babel's canon)
      if (receiverSeOnly || (wrapped && kind !== 'instance' && !symbolProp
        && divergingSelection(wrapped.element, { adapter, injectorState }))) return;
      if (wrapped?.assignment) {
        registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath, symbolProp,
          patternPath: metaPath.parentPath });
        return;
      }
      // a FOR-INIT wrapper has no statement list to splice into either: the loop header hosts
      // the extraction as a sibling declarator and the discarded wrapper rides the same sink
      // the plain for-init route uses, flattened out of its array. a MULTI-element wrapper
      // stays the conservative native bail - its siblings still bind
      if (!wrapped && declinedWrapperTakesDefault({
        metaPath,
        kind,
        entry,
        hintName,
        prop,
        pattern,
        chain,
        sentinel,
        hostPatternPath,
        symbolProp,
      }, {
        registerForInitWrapJob,
        injectPureImport,
        markRewrite,
        skippedNodes,
        markSubtreeSkipped,
        // ... and a DECLINED wrapper still mirrors its NESTED leaf where the shared plan reaches
        // the element: the literal replaces the element's own value and the siblings run on
        // (`[(eff('e'), { Object: { fromEntries: _Object$fromEntries } }), eff('f')]`)
        nestedSynth: () => renderNestedParamSynth({
          metaPath, meta, withinNode: arrayWrapperDeclarator(hostPatternPath)?.init ?? null,
        }),
      })) return;
      if (wrapped) {
        const chainKeys = hopChainKeys(chain);
        // the dead default peels out of the VALUE only - the job keeps the source prop, so
        // removal / rename still match by identity
        const valueProp = kind !== 'instance' && prop.value.type === 'AssignmentPattern'
          ? { ...prop, value: prop.value.left } : prop;
        // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
        // wrapper pairing proved the element, and a chain reads through the literal to the
        // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
        // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
        // ... and where the wrapper's own pattern is consumed WHOLE, an SE-free single read qualifies
        // too: no residual survives to read it again, so the dispatch is the single read the source
        // performs (`const [{ y: { at } }] = [{ y: nb.y }]` fires the `y` getter once)
        const plainDeep = kind === 'instance' && chain.length
          ? resolveNestedReceiverNode(metaPath)
            ?? (!wrapped.wrapperRest && pattern.properties?.length === 1
              ? resolveNestedReceiverNode(metaPath, { allowSeFreeSingleRead: true }) : null)
          : null;
        // ... and an EFFECT-bearing slot answers through the shared canon where the residual DIES:
        // the wrapper's sole prop is consumed whole, so nothing survives to read the slot again and
        // the dispatch performs the init's one read itself (`[{ y: { at: a } }] = [{ y: eff() }]`)
        // the residual DIES only where this claim's leaf is the wrapper's ONLY binding - a rest, an
        // SE key or a sibling prop all keep a reader of the slot alive, and spelling the slot beside
        // them is a SECOND evaluation (`[{ y: { at: a }, zz }] = [{ y: eff(), zz: 1 }]` ran `eff` twice)
        const wrapperResidualDies = wrapped.single && !wrapped.wrapperRest
          && patternBindingCount(prop.value) === patternBindingCount(hostPatternPath.node)
          && !computedKeyHasSideEffects(prop);
        const carriedSlot = kind === 'instance' && chain.length && !plainDeep
          ? carriedInitReceiverNode({ path: metaPath, initNode: wrapped.element }) : null;
        const carriedDeep = wrapperResidualDies ? carriedSlot : null;
        const resolvedDeep = plainDeep ?? carriedDeep;
        // SEVERAL claims off ONE element read it once each, and an element that is not
        // re-referenceable (a selection, a member whose getter would re-fire) cannot serve
        // that twice: it memoizes into a leading `_ref` the extractions share - the same
        // shared channel the plain declarator route uses, wired to the wrapper's element
        // an element that cannot be spelled twice - a selection, or one whose evaluation is
        // OBSERVABLE - memoizes into a leading ref the extractions read, exactly what the flat
        // whole-init memo does one level up. sound only where the memo keeps source order:
        // every element ahead of this slot must be pure (`precedingPure`)
        // a REST sibling re-reads the element in the residual, which is exactly what the memo
        // gives one identity to - both legs memoize there now
        // ... and a NESTED receiver under a wrapper whose NEIGHBOUR still binds memoizes too: the
        // extraction lands after the residual there, so spelling the read inline would run it after
        // the neighbour's own effect - the memo hoists it back to the slot the source reads it in
        const nestedSlotMemo = (resolvedDeep && kind === 'instance' && !wrapped.single
          && !isReReferenceableReceiver(resolvedDeep) && wrapped.precedingPure
          ? elementMemoFor(resolvedDeep, wrapped.declarator) : null)
          // ... and a SURVIVING residual memoizes that slot instead of spelling it: the residual and
          // the dispatch are two readers of one read, and the memo is what gives them one - the slot
          // swaps to the ref in place, exactly as the non-single route above does
          ?? (carriedSlot && !wrapperResidualDies && wrapped.precedingPure
            && !isReReferenceableReceiver(carriedSlot)
            ? elementMemoFor(carriedSlot, wrapped.declarator) : null);
        const deepReceiver = resolvedDeep ?? (nestedSlotMemo ? nestedSlotMemo.ident : null);
        // the memo is about the RECEIVER, so a DEFAULTED leaf takes it on the same terms - its guard
        // wraps the dispatch and reads the same ref (`const [{ at: m = nul }] = [arr.flat()]`)
        const memoLeafOk = prop.value.type === 'Identifier'
          || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
        const sharedElementMemo = nestedSlotMemo ?? (!deepReceiver && kind === 'instance' && chain.length === 0
          && memoLeafOk && wrapped.precedingPure
          // the residual OUTLIVES the claim here whatever the prop count: the wrapper keeps its
          // element slot, so the dispatch beside it is a SECOND evaluation - which is why a SOLE
          // prop memoizes too, giving both readers the one read the source performs
          // (`const [{ at: m }] = [eff()]` ran `eff` twice, once per reader)
          // a REST element keeps the residual whatever this prop takes, and that residual reads
          // the element again - a re-run selection could take the other branch by then
          // ... and an EFFECT-bearing element earns one on its own, since the residual re-evaluates
          // it. the drain keeps every declarator written BEFORE this one ahead of the memo, so what
          // the hoist could reorder is a LATER one carrying effects of its own - that element would
          // be read before this declarator's own key (`const [{ at }] = [p1()], [{ keys }] = [p2()]`
          // read both elements before either key)
          && (pattern.properties.length > 1 || wrapped.wrapperRest
            || (mayHaveSideEffects(wrapped.element) && (() => {
              const decls = wrapped.declarationPath?.node?.declarations ?? [];
              const at = decls.indexOf(wrapped.declarator);
              return at === -1 || decls.slice(at + 1).every(item => !mayHaveSideEffects(item.init));
            })()))
          && !isReReferenceableReceiver(wrapped.element)
          // the memo holds the element AS WRITTEN: a TS cast on it is the receiver's own spelling, and
          // memoizing the peeled view dropped it where the other leg keeps it (`_ref = arr.flat() as any`)
          ? elementMemoFor(wrapped.writtenElement ?? wrapped.element,
            wrapped.declarator ?? wrapped.assignment ?? null) : null);
        // the dispatch SPELLS the element the source wrote (its TS cast kept - the flat canon);
        // the classifiers above read the peeled view
        // a kept WRITE in the slot dispatches on what it STORES: the wrapper lift re-emits the write
        // as its own statement ahead of the extraction and leaves that value in the slot, so the
        // receiver here is the value and the write is not lost
        const writtenSlotValue = kind === 'instance' && chain.length
          && peelTransparentExpr(wrapped.element)?.type === 'AssignmentExpression'
          ? peelChainRootValue(wrapped.element) : null;
        const declReceiver = sharedElementMemo?.ident ?? deepReceiver ?? writtenSlotValue
          ?? (wrapped.writtenElement && !mayHaveSideEffects(wrapped.writtenElement)
            ? wrapped.writtenElement : wrapped.element);
        // ... and a TYPED outer hop composes off the paired ELEMENT: the wrapper's own init is
        // the array AROUND the receiver, so the element is what the outer key reads off
        const elementTyped = typedHopFor({
          chain, kind, entry, metaPath, receiverPath: { node: wrapped.element, scope: metaPath.scope },
        });
        const elementTypedHop = elementTyped.pure
          ? { pure: elementTyped.pure, defaultHost: elementTyped.defaultHost } : null;
        const value = buildValue({
          kind,
          entry,
          hintName,
          receiverNode: declReceiver,
          prop: valueProp,
          nested: !deepReceiver && chain.length > 0, chainKeys, metaPath,
          // a CARRIED slot is read LIVE: a claim inside it renders by REPLACING its node, and the
          // copy taken here predates that rewrite (`[{ k: { at } }] = [{ k: eff().slice() }]` shipped
          // the source `.slice()` and lost its own polyfill)
          liveReceiver: carriedDeep
            ? () => carriedInitReceiverNode({ path: metaPath, initNode: wrapped.element }) : null,
          typedHop: elementTypedHop,
          // ... and a TYPED user nav under the wrapper qualifies on the walk's own terms: it
          // pairs the single element and reads the hops off it (`[{ y: { flat: m } }] = [nb]`)
          typedNavChain: typedNavChainFor({ kind, entry, chain, metaPath }),
          // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
          // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
          // ... and ONLY where the receiver node ANSWERS the claim: the route spells that node
          // verbatim, so a hop the walk did not consume would silently vanish from the dispatch
          // (`[{ z: { w: { flat: m } } }] = [nb]` dispatched on `nb`, binding `nb.flat`)
          literalRoute: kind === 'instance' && (!!deepReceiver || chain.length === 0) && (!!carriedDeep
            || !!sharedElementMemo
            // a SOLE consuming prop reads the element exactly once - inside its own dispatch -
            // so an effect-FREE element may be spelled there whatever its shape (`[arr?.inner]`
            // is one read either way, which is what native performs)
            // ... but the literal route spells THE ELEMENT as the dispatch receiver, so it serves
            // only a claim the element itself answers: a NESTED one dispatches on the surface its
            // own hops name, and a possible-global element owes the substitution above
            // (`[{ Array: { prototype: { flat: m } } }] = [globalThis]` dispatched on the raw
            // `globalThis` - the wrong surface, and a bare global on a target that lacks it)
            || (patternBindingCount(prop.value) === patternBindingCount(hostPatternPath.node)
              && !mayHaveSideEffects(wrapped.element)
              && !(peelTransparentExpr(declReceiver)?.type === 'Identifier'
                && POSSIBLE_GLOBAL_OBJECTS.has(peelTransparentExpr(declReceiver).name)))
            || isConstantLiteralReceiver(peelTransparentExpr(declReceiver))
            || (isReReferenceableReceiver(declReceiver)
              && !(peelTransparentExpr(declReceiver)?.type === 'Identifier'
                && POSSIBLE_GLOBAL_OBJECTS.has(peelTransparentExpr(declReceiver).name)))
            // an SE-free diverging SELECTION consumed by the SOLE binding reads once inside
            // the dispatch (`[{ at }] = [c ? a : b]` -> `_at(c ? a : b)` - babel's canon);
            // a multi-prop selection needs the memo channel and stays declined
            || (pattern.properties.length === 1 && prop.value.type === 'Identifier'
              && divergingSelection(declReceiver, { adapter, injectorState })
              && !mayHaveSideEffects(declReceiver))),
        });
        if (!value) return;
        // the extracted alias registers with the injector so calls off it keep their
        // known return type (`const entries = _Object$entries; entries(x).at(0)` narrows)
        if (kind !== 'instance') {
          injectorState?.registerBodyExtractAlias?.(propLocalName(prop), entry,
            metaPath.scope?.getBinding?.(propLocalName(prop)));
        }
        recordJob({
          hostPath: wrapped.exported ? wrapped.declarationPath.parentPath : wrapped.declarationPath,
          job: {
            prop,
            pattern,
            chain,
            sentinel: true,
            declarator: wrapped.declarator,
            local: propLocalName(prop), value, host: 'array-decl', exported: wrapped.exported,
            kind,
            // the extraction lands AFTER the residual: an effect-bearing neighbour element runs
            // inside the array literal, and native reads the property only once every element
            // has evaluated
            extractAfterResidual: wrapped.neighbourEffect,
            // a CARRIED slot re-resolves at DRAIN: a claim INSIDE it renders by REPLACING its node,
            // so the copy taken here predates the rewrite and would ship the source read
            carriedReceiverLive: carriedDeep
              ? () => carriedInitReceiverNode({ path: metaPath, initNode: wrapped.element }) : null,
            memoRecv: sharedElementMemo,
            bodylessWrap: wrapped.host?.bodyless === true,
            bindingTarget: propBindingTarget(prop), metaPath,
            initProbePlan: planDiscardedInitProbe(wrapped.declarator.init, metaPath, { adapter, resolvePure }),
            sealedProbePlan: planSealedNavProbe(wrapped.declarator.init, metaPath,
              { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
          },
        });
        return;
      }
      // ... and where NO literal pairs the element, nothing spells it at all - the slot takes a
      // minted binding instead, which is the one route a positional segment has
      if (!wrapped && registerPositionalElementJob({ metaPath, prop, kind, entry, hintName })) return;
      // ... and a for-x HEAD holds no statement for any of these routes to land in: the mirror
      // answers in the ELEMENT instead, wrapper and all. the wrappers pair a slot, they host
      // nothing, so the walk through them ends at the same slot-less declarator
      let headHost = hostPatternPath;
      while (headHost?.node?.type === 'ArrayPattern' || headHost?.node?.type === 'ObjectPattern') {
        headHost = headHost.parentPath;
      }
      if (kind !== 'instance' && headHost?.node?.type === 'VariableDeclarator' && forOfHeadElements(headHost)
        && renderNestedParamSynth({ metaPath, meta })) return;
    }
    if (hostParent?.node?.type === 'AssignmentPattern' || hostParent?.node?.type === 'ArrayPattern') {
      if (receiverSeOnly) return;
      return handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath });
    }
    // a bare param pattern (`(({ resolve }) => ...)(Promise)`): the IIFE call-arg is the
    // receiver, the same simple-synth route (findSynthSwapReceiver resolves the arg)
    if ((hostParent?.node?.type === 'ArrowFunctionExpression' || hostParent?.node?.type === 'FunctionExpression')
      && chain.length === 0 && !receiverSeOnly
      && (hostPatternPath.listKey === 'params' || hostPatternPath.key === 'params')) {
      // ... and a DECLINED synth falls through the same fallback chain the defaulted param takes:
      // a body-extracted `let X = _polyfill;` leaves the residual to its unswappable sibling
      // (`function ({ 'of': o, [dyn]: z })` - the dynamic key is why the synth stood down)
      if (!registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName })) {
        paramExtractFallback({ metaPath, kind, entry, hintName, pattern });
      }
      return;
    }
    if (hostParent?.node?.type === 'VariableDeclarator' && hostParent.node.id === hostPatternPath.node) {
      return handleDeclaratorHost({ metaPath, meta, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent });
    }
    if (hostParent?.node?.type === 'AssignmentExpression' && hostParent.node.left === hostPatternPath.node
      && hostParent.node.operator === '=') {
      if (receiverSeOnly) return;
      return handleAssignmentHost({ metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent });
    }
  }

  function handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath }) {
    for (let from = hostPatternPath, cur = hostPatternPath.parentPath; cur; from = cur, cur = cur.parentPath) {
      const { type } = cur.node ?? {};
      if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') {
        if (from.listKey !== 'params' && from.key !== 'params') return;
        // the SIMPLE receiver swap first, the
        // nested/array-wrapped plan when it declines
        if (chain.length === 0 && hostParent.node.type === 'AssignmentPattern'
          && registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName })) return;
        if (renderNestedParamSynth({ metaPath, meta })) return;
        paramExtractFallback({ metaPath, kind, entry, hintName, pattern });
        return;
      }
      // ... a CATCH parameter binds like a declarator: the climb has to stop AT it, or it walks
      // past into the enclosing function and answers for a params list this pattern is not in
      if (type === 'VariableDeclarator' || type === 'AssignmentExpression' || type === 'CatchClause'
        || type === 'Program') {
        // a receiver-bearing default fires under exactly the condition its outer slot leaves
        // open, so the mirror is correct outside a parameter list too - the host only decides
        // where the residual lives, not whether the default is live. (the TYPED-outer dead
        // case never reaches here: `carriesReceiver` answers false there, the climb keeps
        // the hop, and the composed extraction owns the claim)
        if (chain.length === 0 && hostParent.node.type === 'AssignmentPattern') {
          registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName });
        }
        break;
      }
    }
  }

  // synth-swap and the nested mirror both bailed: body-extract `let X = _polyfill;` at the
  // function body head (the prop leaves, or renames to `_unused` under a rest sibling), or
  // the inline default `{ p = _polyfill }` when an SE computed key must stay spelled -
  // babel's fallback chain, gated by the SAME shared predicates (caller-lossiness first)
  function paramExtractFallback({ metaPath, kind, entry, hintName, pattern }) {
    const prop = metaPath.node;
    if (kind === 'instance') return;
    if (paramsHaveInvisibleCallers(metaPath, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
    const keyHasSideEffect = computedKeyHasSideEffects(prop);
    if (!keyHasSideEffect && tryBodyExtractParam({ metaPath, prop, pattern, entry, hintName })) return;
    applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
  }

  function tryBodyExtractParam({ metaPath, prop, pattern, entry, hintName }) {
    const localId = propBindingIdentifier(prop.value);
    if (!localId) return false;
    // the qualification chain (caller-lossiness containment / foreign-binding redeclare /
    // block body / param-scope reads / var-redeclare) lives in the shared provider gate so
    // both emitters bail on exactly the same shapes
    const qualified = qualifiesForParamBodyExtract({ propPath: metaPath, localId });
    if (!qualified) return false;
    const { fnPath } = qualified;
    const body = fnPath.node.body?.body;
    if (!Array.isArray(body)) return false;
    const id = injectPureImport(entry, hintName);
    markRewrite();
    injectorState.registerBodyExtractAlias(localId.name, entry, metaPath.scope?.getBinding?.(localId.name));
    // `let` (the original was a reassignable parameter binding), past the directive prologue;
    // later extracts chain AFTER earlier ones (babel's insertAfter chain, source order)
    let at = bodyExtractInsertAt.get(fnPath.node);
    if (at === undefined) at = prologueEndIndex(body);
    body.splice(at, 0, variableDeclaration('let', [variableDeclarator(identifier(localId.name), identifier(id))]));
    bodyExtractInsertAt.set(fnPath.node, at + 1);
    if (hasRestSiblingExcept(pattern.properties, prop)) {
      markSubtreeSkipped(skippedNodes, prop.value);
      prop.value = identifier(mintUnusedName());
      prop.shorthand = false;
    } else {
      pattern.properties = pattern.properties.filter(item => item !== prop);
      markSubtreeSkipped(skippedNodes, prop);
    }
    return true;
  }

  // a pattern-valued symbol prop off a NON-proxy receiver with a sibling prop keeps its
  // key in the residual as an `_unused` sentinel - the babel SE-key channel's shape; the
  // proxy receivers ride the plan tree, which drops the dead residual instead. a nested
  // NON-symbol instance leaf keeps its key the same way, except when its residual is dead.
  // a kept-key literal-route receiver that cannot survive a second read memoizes into a
  // shared `_ref`: a constant literal (re-emitting bloats) or a relaxed member / branching
  // node (getter / selection fires once at the memo); a relaxed class-bearing literal is
  // neither - babel leaves that destructure native (null = decline whole).
  // a kept-key extraction beside a MULTI-declarator host appends as a sibling declarator
  // (babel keeps the one declaration: `const z = 1, { ..._unused } = R, m = _f(recv);`)
  function planLiteralKeepKey({
    kind,
    entry,
    sentinel,
    declarator,
    declaration,
    soleBinding,
    literalReceiver,
    relaxedReceiver,
    declaratorConsumedWhole = false,
    carried = false,
    exported,
    symbolPatternResidual = false,
    allProxyInit = false,
    forInit = false,
  }) {
    // the key is kept when the residual still needs it. a SOLE binding leaves none, and
    // there the extraction may carry the init whole - including its effects, when the
    // receiver IS that init (`{ flat } = (c++, gt.self).Array.prototype || {}`)
    const carriesInitWhole = !!literalReceiver && literalReceiver === declarator.init;
    // a symbol-PATTERN sibling leaves a residual that still spells the key, so the memo
    // decision below must see the kept key - not learn about it after the fact
    // ... and a FOR-INIT host keeps the residual whatever the binding count: babel never
    // drops the loop-header declarator, the extraction appends as a sibling after it
    const keepKey = sentinel || symbolPatternResidual
      // the kept residual preserves ORDER in a MULTI-declarator - a preceding extraction could
      // TDZ-fault a receiver bound earlier in the same declaration - so a shared declaration keeps
      // it, and a for-INIT header keeps its own. unless keeping it would READ the receiver a SECOND
      // time: that is a defect, not a reorder risk, and the consumed declarator empties instead
      // (`const { y: { at } } = { y: nb.y }, zn = 1` fired the `y` getter twice). a CARRIED receiver
      // is not that case in a header - it rides the sink channel, which re-emits the discarded init
      || (kind === 'instance' && entry !== 'get-iterator-method' && !!literalReceiver
        && ((forInit && (carried || isReReferenceableReceiver(literalReceiver)))
          || !((soleBinding || (declaratorConsumedWhole && !isReReferenceableReceiver(literalReceiver)))
            && (relaxedReceiver || carriesInitWhole || !mayHaveSideEffects(declarator.init)))));
    // a MULTI-declarator host keeps the one declaration and appends the extraction as a
    // sibling declarator - the receiver is spelled twice there, so the memo never applies
    // (`const z = 1, { ..._unused } = R, m = _f(R);`)
    const siblingAppend = keepKey && !sentinel && !!literalReceiver && declaration.declarations.length > 1;
    let memoRecv = null;
    // a SENTINEL's residual re-reads its receiver, so a value-SELECTING one may not stay
    // spelled - the branch would be taken twice. the fragment memoizes and both readers take
    // the ref (`{ y: { [(k(), 'values')]: v } } = { y: c ? [1] : [] }`); an ALL-PROXY selection
    // re-reads for free and keeps its own shape
    const branchingReceiver = !allProxyInit && !!literalReceiver
      && (literalReceiver.type === 'ConditionalExpression' || literalReceiver.type === 'LogicalExpression');
    if (keepKey && (!sentinel || branchingReceiver) && literalReceiver && literalReceiver.type !== 'Identifier') {
      const relaxedMemoizable = relaxedReceiver
        && literalReceiver.type !== 'ArrayExpression' && literalReceiver.type !== 'ObjectExpression';
      const memoizable = (relaxedMemoizable || branchingReceiver
        || isConstantLiteralReceiver(literalReceiver)) && !siblingAppend && !forInit;
      // a receiver safe to SPELL TWICE duplicates instead (the identifier route's shape,
      // one level up): the extraction clones it and the residual keeps the original. the
      // clone is taken at drain time off the already-rewritten tree, so the copy carries
      // the walk's own scope-aware claims (`[Set]` -> `[_Set]` in both, a shadowed `Map`
      // raw in both)
      if (!memoizable) {
        if (!isReReferenceableReceiver(literalReceiver)) return null;
      } else {
        // shared per receiver NODE: two leaves off one receiver read the same `_ref`
        // a BRANCHING fragment defers its number to the drain, where every other whole-init
        // memo takes one: minting during the walk would run ahead of them and babel numbers
        // by its own emission order
        let memo = literalMemoNames.get(literalReceiver);
        if (!memo) {
          // the SLOT is captured while the identity still holds: the swap below writes through it,
          // so a claim rendering INSIDE this receiver cannot strand the memo
          const slot = findNodeSlot(declaration.node, literalReceiver);
          memo = branchingReceiver
            ? { ident: identifier(''), node: literalReceiver, slot, deferred: true }
            : { refName: mintRefName(), node: literalReceiver, slot };
          literalMemoNames.set(literalReceiver, memo);
        }
        memoRecv = memo;
      }
    }
    if (siblingAppend && exported) return null;
    return { keepKey, memoRecv, siblingAppend };
  }

  // a sentinel-kept declarator whose init cannot be re-read RAW (a member's getter, a
  // constant literal's bloat) memoizes into a shared leading `_ref` declarator; the for-init
  // sentinel is implementable exactly there. a PROXY-rooted member init keeps the
  // split-statement memo shape (its collapse channel owns the ordering); a plain member /
  // constant literal joins as sibling declarators
  // an OPAQUE / effect-bearing init with no direct receiver: the defaulted sole-consume
  // takes it whole, the statically selected logical LEFT extracts, everything else records
  // the whole-init memo job ('handled') or stands down
  function routeOpaqueInit({
    metaPath,
    meta,
    kind,
    entry,
    hintName,
    prop,
    pattern,
    chain,
    declarator,
    declarationPath,
    forInit,
    exported,
    soleBinding,
  }) {
    // an opaque / effect-bearing init: the WHOLE-INIT MEMO path - the init hoists into a
    // `const _ref = <init>;` the extractions read. sound only when the extraction consumes
    // the pattern whole (a residual would need the memo threaded through it - staged), so
    // the jobs are collected and the drain decides
    // a DEFAULTED sole-binding prop consumes its effectful init whole - the call moves
    // into the dispatch and the residual dies (`{ at = f } = getArr()` ->
    // `at = (_ref = _at(getArr())) === void 0 ? f : _ref`)
    // the sole-consume is per DECLARATOR: a sibling declarator in the same declaration
    // survives on its own (`const { A: { f } } = g, { at = d } = get();` - the second
    // extracts, the first keeps its route)
    const declaratorConsumed = soleBinding
      || patternBindingCount(declarator.id) === patternBindingCount(prop.value);
    if (defaultedSoleConsumes({ forInit, prop, soleBinding: declaratorConsumed, chain, kind, declarator })) {
      return { literalReceiver: declarator.init, forInitLiteral: true };
    }
    // ... and a symbol-PATTERN value takes the same guarded route: the helper result is what the
    // `=== void 0` test reads, and the extracted pattern binds off it
    const defaultedIdent = prop.value.type === 'AssignmentPattern'
      && (prop.value.left?.type === 'Identifier'
        || (prop.value.left?.type === 'ObjectPattern' && entry === 'get-iterator-method'))
      && (kind === 'instance' || kind === 'static');
    // a for-init head hosts DECLARATORS, never statements, so the whole-init memo below cannot
    // serve it - and the blanket decline that stood here left the claim to whatever the hop
    // re-anchor spelled, which in the pure flavor reads a static off a ctor that does not carry
    // it. a RECEIVERLESS claim consuming the pattern whole needs no memo at all: the discarded
    // init rides its own extraction as a sequence prefix, where the source evaluated it
    // (`for (var g = (kw = _globalThis, _Map$groupBy), i = 0;` - babel's shape)
    if (forInit) {
      // ... and a DEFAULTED leaf comes with it: a static / global claim binds a ponyfill that is
      // always defined, so the source's default is dead and the extraction spells the pure alone
      // (the instance twin keeps its `=== void 0` guard and stays out of this route)
      const flatLeaf = prop.value.type === 'Identifier'
        || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
      if (kind !== 'instance' && flatLeaf && !prop.computed) {
        const forInitValue = buildValue({
          guardCtx: navGuardCtx(metaPath),
          kind,
          entry,
          hintName,
          receiverNode: declarator.init,
          prop,
          nested: chain.length > 0,
          chainKeys: hopChainKeys(chain),
          metaPath,
        });
        if (forInitValue) {
          recordJob({
            hostPath: exported ? declarationPath.parentPath : declarationPath,
            job: {
              prop,
              pattern,
              chain,
              declarator,
              exported,
              metaPath,
              local: propLocalName(prop),
              host: 'for-init',
              readsReceiver: false,
              seKey: false,
              // the discarded init rides the extraction's own sequence, so the drain owes it no
              // second slot - and riding there is what keeps the source's order (a slot after the
              // extractions is the nested route's accepted reorder, which this shape need not take).
              // a SURVIVING residual keeps reading the init in its own declarator, so there the
              // extraction spells the pure alone and the drain's ordinary order serves
              // (`for (var g = _Map$groupBy, { other } = (kw = _globalThis), i = 0;`)
              initRidesValue: declaratorConsumed && mayHaveSideEffects(declarator.init),
              value: declaratorConsumed && mayHaveSideEffects(declarator.init)
                ? () => sequenceExpression([cloneNode(declarator.init), forInitValue()])
                : forInitValue,
            },
          });
        }
      }
      return 'handled';
    }
    // ... unless the init performs EFFECTS ahead of a provable nav and this claim is not its sole
    // reader: there the whole init memoizes (the prefix runs ONCE inside that memo) and every claim
    // dispatches off the ref, which is the same shape the receiver-less claims take one branch down.
    // without it the whole multi-claim family stayed native on this leg while the other extracted
    const seqInitTail = peelTransparentExpr(declarator.init)?.type === 'SequenceExpression'
      ? peelTransparentExpr(peelTransparentExpr(declarator.init).expressions.at(-1)) : null;
    if (chain.length > 0 && kind === 'instance' && !forInit && seqInitTail && !defaultedIdent
      && prop.value.type === 'Identifier' && entry !== 'get-iterator-method'
      && patternBindingCount(declarator.id) !== patternBindingCount(prop.value)
      && isPureNavReceiver(seqInitTail, navGuardCtx(metaPath))
      && isInstanceSurfaceNav(hopChainKeys(chain).reduce(memberFromKeyName, seqInitTail))) {
      recordJob({
        hostPath: exported ? declarationPath.parentPath : declarationPath,
        job: {
          prop,
          pattern,
          chain,
          kind,
          entry,
          hintName,
          declarator,
          local: propLocalName(prop),
          host: 'memo-decl',
          exported,
          metaPath,
        },
      });
      markRewrite();
      return 'handled';
    }
    if (chain.length > 0 && kind === 'instance' && peelTransparentExpr(declarator.init)?.type !== 'ConditionalExpression'
      && peelTransparentExpr(declarator.init)?.type !== 'LogicalExpression') return 'handled';
    // a value-SELECTING init (a conditional / logical) is the per-branch mirror's shape:
    // an unconditional extraction here would erase the other branch's semantics - EXCEPT
    // a fallback logical whose LEFT detection statically selected (the meta's object
    // resolved through it): the plain-ctor extraction stands and the dead right drops
    // with the residual (`{ from } = Array || Iterator` -> `const from = _Array$from`).
    // ordered AHEAD of the AssignmentPattern bail: a DEFAULTED leaf under a selection
    // belongs to the mirror / the statically-selected extraction exactly like its
    // undefaulted twin - the flat bail left the claim unrendered
    const selecting = peelTransparentExpr(declarator.init);
    if (selecting?.type === 'ConditionalExpression' || selecting?.type === 'LogicalExpression') {
      const left = staticallySelectedLeft({ selecting, meta, metaPath, soleBinding, chain, adapter, kind });
      if (left) {
        // the init dies with a SOLE binding, so its claims are consumed; a surviving
        // residual keeps reading it and its own claims must still render
        // ... but an init carrying OBSERVABLES keeps its claims live: the drain re-emits the
        // whole selection as a discarded statement, and that spelling is the collapsed one
        if (soleBinding && !mayHaveSideEffects(declarator.init)) {
          markSubtreeSkipped(skippedNodes, declarator.init);
        }
        return { literalReceiver: left, forInitLiteral: false };
      }
      // an INSTANCE claim reads the selecting expression ONCE inside its dispatch, so the
      // whole selection is the receiver and every branch stays live (`{ keys } = Stub ??
      // Object` -> `_keys(Stub ?? Object)`, `{ at } = c ? [1] : [2]` -> `_atMaybeArray(c ?
      // [1] : [2])`); resolution used the primary operand alone
      if (kind === 'instance' && soleBinding && !chain.length) {
        return { literalReceiver: declarator.init, forInitLiteral: false };
      }
      // a diverging LOGICAL guard under a NESTED static leaf keeps the destructure and takes
      // the sound inline default - the ponyfill fills only where the selected branch reads
      // undefined (`{ Array: { from: f } } = cond && globalThis` -> `from: f = _Array$from`);
      // the ternary mirror declines outright (the locked diverging-only rule)
      if (selecting.type === 'LogicalExpression' && selecting.operator === '&&'
        && kind !== 'instance' && chain.length && prop.value.type === 'Identifier') {
        applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
        return 'handled';
      }
      // ... and with a residual left over, the selection has TWO readers (the extraction and
      // the residual) - the whole init memoizes so the branch is taken exactly once, which is
      // the same whole-init memo the opaque route below records
      if (kind !== 'instance' || chain.length) {
        // a selection the routes above declined and the fromFallback dispatch cannot reach
        // (a non-nullish PRIMARY resolves WITHOUT the flag): the per-branch mirror still
        // owns the shape - `(d++, globalThis) || fb` mirrors the diverging tail exactly
        // like its fromFallback twins, instead of leaving the claim unrendered
        routeSelectionMirror(metaPath, handlePerBranch);
        return 'handled';
      }
    }
    if (prop.value.type === 'AssignmentPattern' && !defaultedIdent) return 'handled';
    if (chain.length > 0 && kind === 'instance') return 'handled';
    recordJob({
      hostPath: exported ? declarationPath.parentPath : declarationPath,
      job: {
        prop,
        pattern,
        chain,
        kind,
        entry,
        hintName,
        declarator,
        local: propLocalName(prop), host: 'memo-decl', exported, metaPath,
        // a symbol-PATTERN prop is an extraction, not a hop anchor: the drain's anchor filter
        // reads this flag, and without it the job drops beside a live sibling
        symbolPattern: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern',
        // ... and its SINGLE bare polyfillable leaf collapses the whole extraction the same way
        // the plain route's does (`{ [S]: { name } } = arr` -> `_nameMaybeFunction(_gim(_ref))`)
        collapseLeaf: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern'
          ? symbolIteratorInstanceLeaf({
            value: prop.value, resolvePure: m => resolvePure(m, metaPath), isDisabled: null,
            keyNameOf: leafProp => leafProp.key?.name ?? leafProp.key?.value ?? null,
          }) : null,
        // the SOURCE spine had a call root: its read is the source's own, so a full consume
        // re-emits it as a throw probe. asked here - by drain time the nav has collapsed
        callRootedInit: navSpineHasCall(declarator.init),
        seqRootWrite: initSeqRootHasKeptWrite(declarator.init),
        // ... and the same timing for a KEY effect buried in the spine: it rides the extraction's
        // own sequence, where the source ran it - inside the read, not ahead of it
        buriedKeyEffect: navSpineHasComputedKeyEffect(declarator.init),
        keyClaimInit: buriedKeyClaimInit(declarator.init),
        seqDirectClaimInit: initSeqDirectClaim(declarator.init),
        rawKeyRootInit: initRawKeyOnRoot(declarator.init),
        // ... and the same timing for the guard the discarded read renders through
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        // ... and the SEALED shape of the same read, for the same reason
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
      },
    });
    return 'handled';
  }

  // the memo each leaf-flatten shares, keyed by the DECLARATOR it rewrites
  const flattenLeafRefs = new Map();

  // a nested pattern whose LEAF level keeps siblings is the flat shape written the long way:
  // `{ y: { at, other } } = box` reads exactly what `{ at, other } = box.y` reads. the job below
  // rewrites it into that twin and hands the hop to a memo both the dispatch and the residual read,
  // which is what this emitter already prints for the flat source. sole-host only: a host sibling
  // names another key off the ROOT and would lose its binding when the declarator takes the leaf
  function registerFlattenLeafJob({ metaPath, prop, kind, entry, hintName }) {
    const defaulted = prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier';
    if (kind !== 'instance' || (prop.value.type !== 'Identifier' && !defaulted)) return false;
    const walk = resolveNestedReceiverChain(metaPath, { soleSlots: true, allowLeafSiblings: true, allowSlotDefault: true });
    // a SOLE claim needs no normalizing - the extraction owns the whole leaf - unless its own KEY
    // carries an effect: that effect runs where the source wrote it, so the leaf has to survive,
    // and a surviving leaf is a second reader of the hop. the flat twin answers both (the memo the
    // residual reads), so the shape goes there instead of being extracted past its own key
    if (!walk || !(walk.leafPattern?.node?.properties?.length > 1
      || walk.leafPattern?.node?.properties?.some(item => item.type === 'Property'
        && computedKeyHasSideEffects(item)))) return false;
    // at least one hop - a leaf with no hop above it IS the flat twin already. the count used to
    // stop at ONE, because past a hop the two legs read the flattened receiver's type differently;
    // that asymmetry was the slot read answering init-only on the nested side, and it is closed -
    // both spellings now fold the same writer set, so the deeper chains flatten like the first
    if (!walk.keys.length) return false;
    // a REST sibling gathers what the pattern did not name and cannot travel; a COMPUTED one can -
    // it keeps its key node and its position, so the key evaluates where the source evaluates it
    // a REST in the leaf travels with it: the twin keeps the leaf's own pattern, so the rest gathers
    // off the memo and the claim's key stays there as a sentinel, still excluding itself
    const declaratorPath = walk.declarator;
    // an array WRAPPER pairs the pattern with an ELEMENT of a literal, and the flat twin lives
    // there: the element takes the nav and the pattern takes the leaf. the core owns what moves -
    // the hop read lands where the literal builds - and the declaration itself STAYS, since it is
    // what holds that literal. this leg keeps the type it resolved before the rewrite; the babel
    // twin re-detects and stashes it, which is what keeps the two shipping one import
    // the walk hands back the OUTERMOST literal it descended, and the host owns whether that is its
    // own init - asked THROUGH the wrappers the source spelled, since one leg's parser keeps a paren
    // node the other drops and the identity would answer differently about the same program
    const wrapperNode = walk.wrapper
      && unwrapRuntimeExpr(declaratorPath?.node?.init) === walk.wrapperRoot ? walk.wrapper : null;
    // the core answers WHERE the twin goes under a wrapper: ahead of the literal, or trailing the
    // residual where an effect stands between (`[{ y: { at, findLast } }, zn] = [nb, eff()]`)
    const navPlacement = wrapperNode ? wrapperElementNavPlacement(walk) : null;
    // ... and either spelling REPLACES the host pattern with the leaf, so the host may hold nothing
    // but the hop: a sibling beside it binds a value that replacement drops, and the emitted code
    // then reads a name nothing declares. the flat spelling asks it of the declarator's own
    // pattern, the wrapped one of the ELEMENT that pairs with the literal
    if (wrapperNode
      ? !navPlacement || walk.hostPattern?.node?.properties?.length !== 1
      : declaratorPath?.node?.id?.type !== 'ObjectPattern'
        || declaratorPath.node.id.properties.length !== 1) return false;
    const declarationPath = declaratorPath.parentPath;
    if (declarationPath?.node?.type !== 'VariableDeclaration'
      || declarationPath.parentPath?.node?.type === 'ExportNamedDeclaration') return false;
    // a SIBLING declarator keeps the claim out: the pair splits the declaration, and a sibling that
    // another route rewrites is drained from the node this split already took apart - the two
    // rewrites then land on different trees and the memo loses its statement. the loop head is the
    // exception below, where the pair joins the declarators instead of splitting them
    // the slot the declaration stands in decides the PLACEMENT, and it is the same three the
    // positional route spells: a LOOP HEAD hosts declarators rather than statements (they evaluate
    // in order, so the memo binds before the claims read it), an unbraced control slot gets braced
    // around the pair, and anything else splices into its statement list. a declaration with
    // SIBLING declarators splits there, which is what the babel twin's own rewrite leaves behind
    const forInit = declarationPath.parentPath?.node?.type === 'ForStatement'
      && declarationPath.parentPath.node.init === declarationPath.node;
    const bodylessWrap = !forInit && !statementListOf(declarationPath.parentPath?.node);
    if (bodylessWrap && !isBodylessStatementSlot(declarationPath.parentPath?.node, declarationPath.node)) return false;
    // a SIBLING declarator is admitted only at an END of the list: the pair stands beside the
    // declaration rather than splitting it, and a declarator in the MIDDLE has no such side
    const declarators = declarationPath.node.declarations;
    const index = declarators.indexOf(declaratorPath.node);
    if (!forInit && index !== 0 && index !== declarators.length - 1) return false;
    const ref = resolveNestedReceiverBase({
      rootName: walk.root.name,
      keys: walk.keys,
      bound: !!adapter.getBinding(metaPath.scope, walk.root.name, metaPath),
      adapter,
      resolveGlobalPolyfill,
    });
    if (!ref || ref.pure) return false;
    // ONE ref per declarator: every claim in this leaf reads the same memo, which is what keeps the
    // hop a single read. minted on the first claim, reused by its siblings
    // a DEFAULT on the SLOT folds into the memo itself: what the twin destructures is the slot's own
    // value when it is defined and the default when it is not, through the same render canon.
    // mirroring the default alone polyfills the arm that may never run and leaves the live one raw
    const slotGuardRef = walk.slotDefault ? injector.generateDeclaredRef(metaPath) : null;
    // the claim's OWN default rides the canonical guard: the dispatcher answers `it.method` verbatim
    // off a surface that is not the polyfilled one, so it may be undefined and the source's default
    // has to fire. its ref mints BEFORE the memo - the order the babel twin numbers them in
    const guardRef = defaulted ? injector.generateDeclaredRef(metaPath) : null;
    let refName = flattenLeafRefs.get(declaratorPath.node);
    if (!refName) {
      refName = mintRefName();
      flattenLeafRefs.set(declaratorPath.node, refName);
    }
    const dispatch = callExpression(identifier(injectPureImport(entry, hintName)), [identifier(refName)]);
    // spelled off the RAW init, so a TS cast the source wrote survives into the memo; a SLOT default
    // folds around it, so what the memo binds is the fold rather than the bare nav
    const navSpelling = ref.path.reduce(memberFromKeyName,
      ref.pure || walk.rootSpelling?.type !== 'TSAsExpression' ? identifier(ref.name) : cloneNode(walk.rootSpelling));
    const navNode = slotGuardRef ? renderInstanceDefaultGuard({
      assignedRef: identifier(slotGuardRef),
      call: navSpelling,
      defaultValue: walk.slotDefault,
      reread: identifier(slotGuardRef),
    }) : navSpelling;
    recordJob({
      hostPath: declarationPath,
      job: {
        prop,
        pattern: null,
        chain: [],
        kind,
        host: 'flatten-leaf',
        local: propBindingIdentifier(prop.value)?.name ?? propLocalName(prop),
        metaPath,
        refName,
        navNode,
        leafPattern: walk.leafPattern.node,
        declaratorNode: declaratorPath.node,
        declarationNode: declarationPath.node,
        wrapperNode,
        // ... and a TRAILING twin leaves the element as the source spelled it: swapping it for the
        // ref would read a name the pair binds only after this declaration
        trailResidual: navPlacement === 'trail',
        elementIndex: walk.elementIndex,
        hostPatternNode: walk.hostPattern?.node ?? null,
        bodylessWrap,
        forInit,
        value: defaulted ? renderInstanceDefaultGuard({
          assignedRef: identifier(guardRef),
          call: dispatch,
          defaultValue: prop.value.right,
          reread: identifier(guardRef),
        }) : dispatch,
      },
    });
    return true;
  }

  // the POSITIONAL element slot (the babel twin's `extractPositionalElementSlot`): where an ARRAY
  // pattern element holds the claim, no member read stands for that element - the pattern PULLS
  // from an iterator - so the slot takes a minted binding, the declaration keeps its iteration and
  // its init, and the claim reads that binding in the statement after
  // every name a pattern binds, in source order - what an exported host has to keep exporting once
  // its wrapper comes off
  function collectPatternNames(patternNode) {
    const names = [];
    if (patternNode) walkPatternIdentifiers(patternNode, id => names.push(id.name));
    return names;
  }

  function registerPositionalElementJob({ metaPath, prop, kind, entry, hintName }) {
    if (kind !== 'instance' || !propBindingIdentifier(prop.value)) return false;
    const positional = resolvePositionalElementSlot(metaPath);
    if (!positional) return false;
    // the slot is an array ELEMENT, or - where a REST sibling keeps the hop in the pattern - the
    // hop PROPERTY's own value: the rename writes into whichever holds it, and everything after
    // (the minted name, the pair, its placement) is the same route
    const hopPropNode = positional.hopProp?.node ?? null;
    const arrayPattern = hopPropNode ? null : positional.slot.parentPath?.node;
    if (!hopPropNode && (arrayPattern?.elements?.indexOf(positional.slot.node) ?? -1) === -1) return false;
    // the host declaration, and a statement list to put the extraction into: a bodyless slot
    // holds one statement and this route has two
    // an ASSIGNMENT host carries no declaration for the pair: the minted name takes a hoisted `var`,
    // the statement keeps its own iteration, and the claim's binding is written right after it -
    // the babel twin's own shape on this host
    if (positional.assignment) {
      const statementPath = positional.statement;
      if (!statementPath?.node || !statementListOf(statementPath.parentPath?.node)) return false;
      const assignRef = injector.generateDeclaredRef(metaPath);
      recordJob({
        hostPath: statementPath,
        job: {
          prop,
          pattern: null,
          chain: [],
          kind,
          host: 'positional-assign',
          local: propLocalName(prop),
          metaPath,
          arrayPattern,
          hopPropNode,
          slotNode: positional.slot.node,
          refName: assignRef,
          value: callExpression(identifier(injectPureImport(entry, hintName)),
            [positional.keys.reduce(memberFromKeyName, identifier(assignRef))]),
        },
      });
      return true;
    }
    const declaratorPath = positional.declarator;
    const declarationPath = declaratorPath?.parentPath;
    if (declarationPath?.node?.type !== 'VariableDeclaration') return false;
    const exported = declarationPath.parentPath?.node?.type === 'ExportNamedDeclaration';
    const hostPath = exported ? declarationPath.parentPath : declarationPath;
    // an unbraced control slot holds ONE statement and this route emits two - the drain braces it,
    // the same wrap the array-decl kind takes there. any other slot without a statement list (a
    // loop head) has nowhere to put the extraction at all
    // ... and a LOOP HEAD hosts declarators, not statements: the extraction joins the head right
    // after the renamed one, where the binding it reads is already in scope
    const forInit = hostPath.parentPath?.node?.type === 'ForStatement'
      && hostPath.parentPath.node.init === hostPath.node;
    const bodylessWrap = !forInit && !statementListOf(hostPath.parentPath?.node);
    if (bodylessWrap && !isBodylessStatementSlot(hostPath.parentPath?.node, hostPath.node)) return false;
    // an EXPORTED host must not export the minted name, so its wrapper comes off either way: the
    // extraction carries the export the source wrote, and any SIBLING names the declaration bound
    // keep theirs through a specifier list. a MULTI-declarator export stays out - the wrapper there
    // covers declarators this route does not touch
    if (exported && declarationPath.node.declarations.length !== 1) return false;
    const exportedSiblings = exported
      ? collectPatternNames(declarationPath.node.declarations[0]?.id).filter(name => name !== propLocalName(prop))
      : [];
    const refName = mintRefName();
    const value = callExpression(identifier(injectPureImport(entry, hintName)),
      [positional.keys.reduce(memberFromKeyName, identifier(refName))]);
    recordJob({
      hostPath,
      job: {
        prop,
        pattern: null,
        chain: [],
        kind,
        host: 'positional-element',
        local: propLocalName(prop),
        metaPath,
        arrayPattern,
        hopPropNode,
        slotNode: positional.slot.node,
        // the CLAIM's own level and the hops above it: where a hop stands between the element and
        // the claim, the residual is rooted at the memo of that read rather than re-reading it
        claimPatternNode: metaPath.parentPath?.node ?? null,
        hopKeys: positional.keys,
        // ... and each OUTER level binds its own slots: what it names before the hop is read before
        // it, what it names after is read after the inner level
        levels: positional.levels ?? [],
        refName,
        value,
        exported,
        exportedSiblings,
        bodylessWrap,
        forInit,
        declarationNode: declarationPath.node,
        // the DECLARATOR by identity: a flatten sibling in the same declaration splits it, and the
        // statement this job was recorded against is gone by drain time - the declarator is not
        declaratorNode: declaratorPath.node,
      },
    });
    return true;
  }

  // the ownership answer is the core's `typedNavClaimChain`; this leg only adds what its own
  // registration knows - the hop chain it walked, whose computed level no member spelling reaches
  function typedNavChainFor({ kind, chain, metaPath }) {
    if (kind !== 'instance' || !chain.length || chain.some(level => level.hopProp.computed)) return null;
    return typedNavClaimChain(metaPath);
  }

  // the for-init array-wrap registration, extracted for its size - see the arrayHost branch
  function registerForInitWrapJob({
    metaPath,
    kind,
    entry,
    hintName,
    prop,
    pattern,
    chain,
    sentinel,
    hostPatternPath,
    symbolProp,
  }) {
    const wrap = resolveArrayWrappedReceiver(hostPatternPath,
      kind === 'instance' || symbolProp ? null : { scope: metaPath.scope, adapter, path: metaPath },
      { allowForInit: true, readsReceiver: kind === 'instance' || symbolProp });
    if (!wrap?.host?.forInit || !wrap.single || prop.value.type !== 'Identifier') return false;
    // a REST-kept prop renames to `_unused` and the residual re-reads its init in place, so
    // only a receiverless STATIC qualifies - an instance extraction would read it a second
    // time (a multi-declarator head extracts too: babel plants the sibling ahead of the
    // jobbed declarator)
    if (sentinel && kind === 'instance') return false;
    const value = buildValue({
      kind,
      entry,
      hintName,
      receiverNode: wrap.element,
      prop,
      nested: chain.length > 0, chainKeys: hopChainKeys(chain), metaPath,
    });
    if (!value) return false;
    recordJob({
      hostPath: wrap.declarationPath,
      job: {
        prop, pattern, chain, sentinel, declarator: wrap.declarator, local: propLocalName(prop), value,
        host: 'for-init', metaPath, arrayWrapSink: true, sinkKeep: mayHaveSideEffects(wrap.declarator.init),
      },
    });
    return true;
  }

  // the bodyless-slot registration, extracted for its size - see drainBodylessDeclaration
  function registerBodylessDeclJob({
    host,
    kind,
    entry,
    hintName,
    prop,
    pattern,
    chain,
    sentinel,
    metaPath,
    initNode = null,
  }) {
    // the bodyless slot extracts every resolvable prop; an INSTANCE read requires a
    // reusable receiver (the extraction re-reads it), a SENTINEL (SE key / rest) keeps
    // its renamed residual beside the extractions
    let initValue = peelTransparentExpr(initNode ?? host.declarator.init);
    // an SE SEQUENCE init lifts its prefix as block statements; only the TAIL is the
    // receiver and must be quiet (`(eff('a'), globalThis)` -> `eff('a'); var from = ...`)
    let seqPrefix = null;
    if (initValue?.type === 'SequenceExpression') {
      seqPrefix = initValue.expressions.slice(0, -1);
      initValue = peelTransparentExpr(initValue.expressions.at(-1));
    }
    // ... and a kept WRITE is a prefix of its own: the lifted statement STORES the value the nav then
    // reads, so the write survives and the receiver is what it stored (`if (c) var { Array: {
    // prototype: { flat: m } } } = (kw = globalThis)` -> `kw = _globalThis; var m = _flat(...)`)
    if (kind === 'instance' && chain.length && initValue?.type === 'AssignmentExpression'
      && initValue.operator === '=') {
      seqPrefix = [...seqPrefix ?? [], initValue];
      initValue = peelTransparentExpr(peelChainRootValue(initValue));
    }
    const reusableInit = initValue?.type === 'Identifier' || initValue?.type === 'ThisExpression';
    // a DEFAULTED prop keeps its guard here too: the slot's own `=== void 0` decides, and the
    // bodyless drain hosts the ref like every other declaration (`if (c) var { with: w = d }`)
    const defaulted = prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier';
    // an EFFECTFUL init needs a slot that evaluates it EXACTLY ONCE. two shapes give one: the
    // SE-key sentinel, whose memo both the extraction and the surviving residual read, and a SOLE
    // consume, where the dispatch spells the init itself and nothing else reads it
    // (`if (c) var at = _atMaybeArray([...xs, ...ys]);`). a claim that DISCARDS the init has
    // neither, and the effect would be lost
    const soleConsume = !sentinel
            && patternBindingCount(host.declarator.id) === patternBindingCount(prop.value);
    const initEvaluatesOnce = kind === 'instance'
            && (soleConsume || (sentinel && prop.computed && computedKeyHasSideEffects(prop)));
    // ... and a MEMO bounds any other instance shape the same way: the init evaluates in
    // the `_ref` declaration alone - the extraction dispatches on the ref, a surviving
    // residual reads the same ref (`if (c) var { at, ...rest } = getObj();` -> the block
    // memo - babel's shape)
    // a NON-instance claim reads nothing off the receiver, but a SURVIVING residual does, and the
    // block the drain opens hosts a memo for it exactly like the instance twin - so an effectful
    // init is no reason to decline here either (`if (c) var { Map: { groupBy: g }, other } = mk();`)
    const memoBoundsInit = (kind === 'instance' && !chain.length && !soleConsume)
      || (kind !== 'instance' && !soleConsume);
    // ... and an EFFECT-bearing slot answers through the shared canon here too: the effects only
    // matter while a residual survives to re-evaluate them, and a receiver that performs every
    // effect its init would leaves that residual nothing to do - the dispatch is the one read
    const plainNestedReceiver = kind === 'instance' && chain.length
      ? resolveNestedReceiverNode(metaPath) : null;
    const carriedReceiver = plainNestedReceiver || kind !== 'instance' || !chain.length || sentinel
      || patternBindingCount(host.declarator.id) !== patternBindingCount(prop.value)
      ? null
      : carriedInitReceiverNode({ path: metaPath, initNode: host.declarator.init });
    const nestedReceiver = plainNestedReceiver ?? carriedReceiver;
    // ... unless the chain NAMES a built-in surface: there the VALUE BUILDER spells the receiver by
    // NAME (`_globalThis.Array.prototype`), the way the ordinary route does one host down, and this
    // slot only has to host the guard. the leaf is handed over UNDEFAULTED - the slot's own
    // `=== void 0` is the guard, and a second one inside the value would run the default twice
    // ... and a TYPED outer hop composes under this host on the same terms as under the plain
    // declarator: the hop dispatch feeds the leaf, so the slot needs no re-readable receiver of
    // its own. the receiver is handed over as the value it IS - this host holds nodes, not paths
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost } = typedHopFor({
      chain, kind, entry, metaPath, receiverPath: { node: initValue, scope: metaPath.scope },
    });
    const surfaceLeafValue = kind === 'instance' && chain.length && !isReReferenceableReceiver(nestedReceiver)
      ? buildValue({
        kind,
        entry,
        hintName,
        receiverNode: initValue,
        prop: defaulted ? { ...prop, value: prop.value.left } : prop,
        nested: true,
        chainKeys: hopChainKeys(chain),
        metaPath,
        guardCtx: navGuardCtx(metaPath),
        typedHop: typedHopPure ? { pure: typedHopPure, defaultHost: typedHopDefaultHost } : null,
        // ... and a TYPED user nav qualifies here on the same terms as under every other host
        typedNavChain: typedNavChainFor({ kind, entry, chain, metaPath }),
      })
      : null;
    // ... and a CARRIED-INIT receiver rides past the re-readability gate: it is not re-readable, and
    // it does not need to be - the residual that would have read it a second time is dropped
    if (kind === 'instance' && chain.length && !carriedReceiver
      && !isReReferenceableReceiver(nestedReceiver) && !surfaceLeafValue) return;
    // a resolved ELEMENT living inside the init memoizes when a residual survives: the memo
    // holds the element, the kept init reads the ref in its slot, and the dispatch shares
    // the identity (`{ a, y: { flat: m } } = { a: se(), y: [3, [1, 2]] }` -> the block memo)
    const nestedMemoNode = nestedReceiver && nodeHoldsSubtree(initValue, nestedReceiver)
      && !mayHaveSideEffects(nestedReceiver) ? nestedReceiver : null;
    // ... and a DISCARDED init has a slot after all: a static / global claim reads nothing off the
    // receiver at runtime, so with the pattern consumed WHOLE the block the drain opens hosts the
    // source's own read as a statement, where the source evaluated it - the same shape the
    // ordinary route emits for `{ from } = globalThis[(eff(), 'Array')]`, one host down
    const discardedInit = kind !== 'instance' && soleConsume && mayHaveSideEffects(initValue)
      ? initValue : null;
    if ((prop.value.type !== 'Identifier' && !defaulted)
      || (mayHaveSideEffects(initValue) && !initEvaluatesOnce && !memoBoundsInit && !nestedMemoNode
        && !discardedInit)) return;
    if (discardedInit) seqPrefix = [...seqPrefix ?? [], discardedInit];
    // ... an INSTANCE read needs a receiver it can RE-READ, and the memo the drain hoists into the
    // block is one whatever the init's shape (`if (c) var { [(k(), 'at')]: a } = Array.prototype;`,
    // `= 1 ? Array.prototype : []`) - the SE-free gate above is what keeps the single evaluation
    // ... and a CHAINED instance leaf reads off the HOP, not off the declarator's init: this slot
    // dispatches on the init alone, so `{ Array: { keys } } = globalThis` would bind
    // `_keys(globalThis)` - the ordinary route owns that shape.
    // ... unless the hop RESOLVES to a node of its own: the canonical walk reads through a
    // literal init to the value the leaf's receiver actually is, and THAT is what dispatches
    // (`if (c) var { y: { flat: m } } = { y: arr }` -> `if (c) var m = _flatMaybeArray(arr);`)

    // minted EAGERLY, in registration order - a drain-time mint would renumber against the walk
    const guardRef = defaulted ? injector.generateDeclaredRef(metaPath) : null;
    const defaultNode = defaulted ? prop.value : null;
    // a LITERAL receiver memoizes (`var _ref = [1, 2, 3];` - the residual and the
    // dispatch share the one identity); a reusable identifier - or a resolved hop node, which
    // the walk proved re-referenceable - re-reads inline
    // ... and so does a SOLE consume (above): with the whole pattern gone there is no second
    // reader for the memo to serve, and the dispatch spells the init itself
    const dispatchReceiver = nestedReceiver ?? initValue;
    // ... and it is read LIVE where it IS the init: a claim INSIDE the receiver renders by REPLACING
    // its node, so a copy captured here ships the source read with its own polyfill lost. a resolved
    // hop, a lifted prefix or an array-wrapped element each name a slot of their own and keep theirs
    function liveDispatchReceiver() {
      // a CARRIED-INIT slot is re-resolved through the same walk: the claim inside it renders by
      // replacing its node, and the node this registration captured predates that rewrite
      if (carriedReceiver) {
        return carriedInitReceiverNode({ path: metaPath, initNode: host.declarator.init })
          ?? dispatchReceiver;
      }
      if (nestedReceiver || seqPrefix?.length || initNode) return dispatchReceiver;
      return peelTransparentExpr(host.declarator.init) ?? dispatchReceiver;
    }
    const needsMemo = !reusableInit && !soleConsume
            && (kind !== 'instance' || !nestedReceiver || !!nestedMemoNode);
    recordJob({
      hostPath: host.declarationPath,
      job: {
        prop,
        pattern,
        chain,
        sentinel,
        declarator: host.declarator,
        declaration: host.declaration,
        local: propLocalName(prop), host: 'bodyless-decl', needsMemo, seqPrefix, initTail: initValue,
        nestedMemoNode,
        // the ARRAY-wrapped host keeps its wrapper: the quiet tail replaces the ELEMENT,
        // not the whole init
        initHost: initNode ?? null,
        defaulted,
        value: kind !== 'instance'
          ? () => guardedSlotValue(identifier(injectPureImport(entry, hintName)), defaultNode, guardRef)
          : surfaceLeafValue
            ? () => guardedSlotValue(surfaceLeafValue(), defaultNode, guardRef)
            : needsMemo
            ? ref => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)), [identifier(ref)]), defaultNode, guardRef)
            : () => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)),
                [cloneNode(liveDispatchReceiver())]), defaultNode, guardRef),
      },
    });
  }

  // eslint-disable-next-line max-statements -- per-form host dispatch sequence
  function handleDeclaratorHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    // a pattern a per-branch mirror already owns is spelled whole by its literal - an extraction
    // here would bind the same leaf a second time and lift the branch as a bare statement
    const host = classifyDeclarationHost(hostParent);
    if (!host || chain.some(level => branchMirrorPatterns.has(level.outerPattern))) return;
    // a LOOP HEAD hosts no statement, and its declarator no init: what it destructures is an
    // ELEMENT of the iterated literal, and the shared mirror swaps that element in place inside
    // the array - read afresh on every pass. asked here because this leg's other mirror hooks sit
    // on the param and array-wrapper routes, which a head reaches neither of
    if (host.head && renderNestedParamSynth({ metaPath, meta })) return;
    if (takesInlineDefault({ host, prop, pattern, chain, kind, sentinel, adapter, injectorState })) {
      return applyInlineDefault({
        prop,
        entry,
        hintName,
        injectPureImport,
        markRewrite,
        skippedNodes,
        markSubtreeSkipped,
      });
    }
    if (host.bodyless) return registerBodylessDeclJob({
      host,
      kind,
      entry,
      hintName,
      prop,
      pattern,
      chain,
      sentinel,
      metaPath,
    });
    const { declarator, declarationPath, declaration, forInit, exported } = host;
    // the guard canon's context, asked once for this claim: the pure-nav predicates and the value
    // builder all owe the same verdict about the receiver's `?.`
    const guardCtx = navGuardCtx(metaPath);
    // a literal / wrapper receiver resolves through the shared nested walk (`{ y: { [S]: it } }
    // = { y: arr }` extracts `_gim(arr)`, the hop keys consumed positionally); the SE-free
    // single-read relaxation only where the extraction is the receiver's ONLY read - a
    // sentinel residual re-reads the init
    const allProxyInit = allProxySelectingInit(declarator.init, { adapter, injectorState });
    const symbolPatternProp = entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern';
    let { sentinelMemoEligible, memoSibling } =
      planSentinelMemo({ sentinel, declarator, metaPath, adapter, kind, allProxyInit });
    // a for-init SENTINEL needs a receiver the residual can read a second time: the memo
    // gives it one, and a bare IDENTIFIER init already is one (`{ at, ...rest } = arr` ->
    // `at = _at(arr), { at: _unused, ...rest } = arr`)
    if (forInit && sentinel && !sentinelMemoEligible && kind === 'instance'
      && peelTransparentExpr(declarator.init)?.type !== 'Identifier') return;
    // a value-SELECTING conditional init under a sentinel-kept prop: the per-branch mirror
    // owns the claim - an unconditional extraction would corrupt the non-global branch.
    // a fallback LOGICAL keeps extracting: its resolved left is the always-truthy receiver
    if (sentinel && !sentinelMemoEligible && divergingSentinelSelectorDeclines(
      { declarator, meta, metaPath, chain, kind }, { adapter, injectorState, resolveGlobalPolyfill })) return;
    // an ANCHORED symbol prop keeps its key-swap instead of extracting when the extraction
    // would change what the slot answers: a DEFAULT fires on the raw read's undefined, which
    // the helper result need not be, and an SE KEY has no slot outside the kept key
    // ... and a plain SE PREFIX ahead of the nav qualifies once the pattern consumes WHOLE:
    // the declarator empties and the lift spells the prefix as its own statement, so the
    // extraction still reads it exactly once, in source order
    const seCarried = seCarriedHopNav({ forInit, chain, declarator, prop, kind });
    // a LIFTED prefix leaves the value the nav reads: a sequence leaves its tail, a kept WRITE leaves
    // what it stores - and the lift emits the write itself, so reading its value here loses nothing
    const carriedInitValue = seCarried ? peelChainRootValue(declarator.init) : declarator.init;
    const pureNav = (forInit || seCarried
      ? isPureNavAfterSePrefix(carriedInitValue, guardCtx)
      : isPureNavReceiver(declarator.init, guardCtx))
      || allProxyInit;
    const literalRoute = planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav });
    const { soleBinding, declaratorConsumedWhole, relaxedReceiver, carriedLive } = literalRoute;
    let { literalReceiver } = literalRoute;
    // a SENTINEL-kept flat prop over a single-declarator CONSTANT literal re-reads the
    // literal directly (`{ [(se, 'flat')]: m } = [1, P]` -> `const m = _flat([1, P]);` +
    // the `_unused` residual - babel re-emits, no memo); multi-declarator keeps the memo
    if (sentinel && !literalReceiver && !pureNav && chain.length === 0 && !forInit
      && declaration.declarations.length === 1
      && (declarator.init?.type === 'ArrayExpression' || declarator.init?.type === 'ObjectExpression')
      && isReReferenceableReceiver(declarator.init)) {
      literalReceiver = declarator.init;
      sentinelMemoEligible = false;
      memoSibling = false;
    }
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost } = typedHopFor({
      chain, kind, entry, metaPath, receiverPath: hostReceiverPath(hostParent),
    });
    // an init whose HOPS name a BUILT-IN surface lets the value builder spell the nested dispatch
    // off it with no literal to descend (`{ Array: { prototype: { flat: m } } } = globalThis`
    // dispatches on `_globalThis.Array.prototype`) - without this the claim shipped native in the
    // whole declaration family while the assignment host extracted it. the question is asked of the
    // nav the pattern NAMES, through the same canon the babel leg asks, so the legs answer alike:
    // a computed hop is a claim of its own, and a chain of pristine proxy names peels away entirely
    // (`{ self: { keys } } = globalThis` reads the root itself, native on both legs)
    const surfaceInit = kind === 'instance' && chain.length > 0 && entry !== 'get-iterator-method'
      && chain.every(level => !level.hopProp.computed);
    const typedNavChain = typedNavChainFor({ kind, entry, chain, metaPath });
    // a sentinel KEEPS the declarator (and its init) alive, so the discard-safety proof is
    // not needed there; the instance value builder still bounds receiver reads on its own
    if ((chain.length > 0 && (kind === 'instance' && entry !== 'get-iterator-method' && !literalReceiver
      && !typedHopPure && !surfaceInit
      // an ANCHORED symbol prop keeps its key-swap instead of extracting when the extraction
      // would change what the slot answers: a DEFAULT off the ANCHOR fires on the raw read's
      // undefined, which the helper result need not be, and an SE KEY has no slot outside the
      // kept key. a default off a TYPED USER NAV is the other case - nothing there answers the
      // key but the dispatch, so the guard the drain renders folds it (a key swap would answer
      // `undefined` off-engine and fire the user's default where the polyfill should have won)
      // ... and a SIBLING hop makes the host an anchored residual of its own: the symbol prop
      // rides it re-keyed rather than leaving (`{ Map: { [S]: a }, Object: { fromEntries } }`)
      || (entry === 'get-iterator-method'
        && ((prop.value.type === 'AssignmentPattern' && !typedNavChain) || computedKeyHasSideEffects(prop)
          // ... and a HOST sibling keeps the pattern only where the leaf would leave a second
          // reader of its hop behind: with the hop pruned out of the residual there is none, and
          // the symbol claim extracts beside the sibling like any other (`{ inner: { [S]: it },
          // keep } = box` -> `const it = _gim(box.inner); const { keep } = box;`)
          || (declarator.id?.properties?.length > 1 && !typedNavChain)))))
      // ... and a symbol-PATTERN prop beside a SIBLING DECLARATOR stays native whatever its
      // depth: its extraction would have to split the declaration, and babel splits none -
      // the inner defaults render in place and the source destructure keeps its slot read
      || (symbolPatternProp && declaration.declarations.length > 1)) return;
    // a for-init CONSTANT-LITERAL init with a dead per-declarator residual extracts
    // single-read as a sibling declarator (`{ at } = [0]` -> `at = _atMaybeArray([0])`)
    let forInitLiteral = false;
    if (!sentinel && !literalReceiver && !pureNav && forInit && chain.length === 0
      // ... and a MULTI-prop instance pattern: each dispatch is a reader of the one init, and
      // the drain memoizes it as a sibling declarator once several readers (or a surviving
      // residual) need it
      && (patternBindingCount(declarator.id) === patternBindingCount(prop.value) || kind === 'instance')
      // an INSTANCE claim reads the init exactly once inside the dispatch, so an
      // SE-bearing call consumes too (`{ at } = getArr()` -> `at = _at(getArr())`);
      // a receiverless static would silently drop it
      && (kind === 'instance' || !mayHaveSideEffects(declarator.init))) {
      literalReceiver = declarator.init;
      forInitLiteral = true;
    }
    // a for-init FULL consume needs no statement slot: the drain keeps the init in a `_ref`
    // declarator beside the extractions (`for (const _ref = bump(), parse = _JSON$parse;`),
    // so the opaque-memo route - which hoists a STATEMENT - must not claim it
    // a TYPED-HOP composition reads the init exactly ONCE, inside its own dispatch, and the whole
    // pattern goes with it - so an opaque init needs no memo channel here, the same single-read
    // contract that lets a sole consume spell an effectful receiver in place. without this the
    // composed claim shipped native over a CALL receiver while it composed over a bare binding
    const typedHopSoleConsume = !!typedHopPure
      && patternBindingCount(declarator.id) === patternBindingCount(prop.value);
    if (!sentinel && !literalReceiver && !pureNav && !typedHopSoleConsume
      && !(forInit && chain.length === 0
        && patternBindingCount(declarator.id) === patternBindingCount(prop.value))) {
      const opaque = routeOpaqueInit({
        metaPath,
        meta,
        kind,
        entry,
        hintName,
        prop,
        pattern,
        chain,
        declarator,
        declarationPath,
        forInit,
        exported,
        soleBinding,
      });
      if (opaque === 'handled') return;
      ({ literalReceiver, forInitLiteral } = opaque);
    }
    // the ctor-alias registration is independent of the extraction: the destructured
    // local holds the surface ctor whether or not a value renders (`{ Array } = globalThis`
    // keeps the destructure, later `Array.from` still resolves through the alias)
    if (kind === 'global' && hintName && prop.value.type === 'Identifier') {
      registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath });
    }
    const literalPlan = planLiteralKeepKey({
      kind,
      entry,
      sentinel,
      declarator,
      declaration,
      soleBinding,
      forInit,
      literalReceiver: forInitLiteral ? null : literalReceiver, relaxedReceiver, exported,
      declaratorConsumedWhole,
      carried: !!carriedLive,
      // ... and an ALL-PROXY SELECTING init is re-readable the same way a bare proxy root is:
      // every branch names the same surface, so the sibling needs no kept key
      symbolPatternResidual: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern'
        && pattern.properties.length > 1 && !allProxyInit
        && !findProxyGlobal(declarator.init, { scope: metaPath.scope, adapter, path: metaPath }),
      allProxyInit,
    });
    if (!literalPlan) return;
    let { keepKey, memoRecv, siblingAppend } = literalPlan;
    memoRecv ??= planNavReceiverMemo({
      pureNav,
      sentinel,
      forInit,
      exported,
      chain,
      kind,
      entry,
      declarator,
      pattern,
      guardCtx,
    });
    // the sentinel memo's name mints HERE, ahead of the claim's own guard ref that `buildValue`
    // is about to take: babel allocates the receiver memo first and the guards read it after
    eagerSentinelMemoName({
      keepKey,
      memoRecv,
      kind,
      forInit,
      prop,
      declarator,
      allProxyInit,
      firstDeclarator: declaration?.declarations?.[0] === declarator,
    }, sentinelMemoNames, mintRefName);
    const catchBorn = !!relocatedHostPattern(hostParent);
    const chainKeys = hopChainKeys(chain);
    let value = buildValue({
      guardCtx,
      kind,
      entry,
      hintName,
      receiverNode: memoRecv ? (memoRecv.ident ?? identifier(memoRecv.refName))
        : literalReceiver ?? (allProxyInit ? firstProxyBranch(declarator.init) : carriedInitValue), prop,
      typedHop: typedHopPure ? { pure: typedHopPure, defaultHost: typedHopDefaultHost } : null,
      typedNavChain,
      nested: (!literalReceiver || !!typedHopPure) && chain.length > 0, chainKeys, metaPath,
      literalRoute: (!!literalReceiver && !memoRecv) || sentinelMemoEligible,
      // the live reader is offered whenever the receiver IS this declarator's own init - a LITERAL
      // route reads it too, since a claim inside that init renders by replacing its node and the
      // captured copy would ship the source read. an ELEMENT or a memo names a slot of its own
      liveReceiver: carriedLive ?? (memoRecv || allProxyInit
        || (literalReceiver && literalReceiver !== declarator.init) ? null : () => declarator.init),
      reusedReceiver: !!keepKey,
      // a catch-born host cannot hoist a `var` memo past its own binding: the default-guard
      // ref joins the extraction declaration as a leading declarator (`let _ref2, it = ...`)
      memoJoin: catchBorn,
    });
    if (!value) return;
    // a SINGLE bare polyfillable leaf inside a symbol pattern value collapses the whole
    // extraction (`{ [S]: { name } } = g` -> `const name = _nameMaybeFunction(_gim(g))`) -
    // the shared plan helper decides, so the two emitters cannot drift on which leaves qualify
    let collapseLeafName = null;
    if (entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern') {
      const leaf = symbolIteratorInstanceLeaf({
        value: prop.value, resolvePure: m => resolvePure(m, metaPath), isDisabled: null,
        keyNameOf: leafProp => leafProp.key?.name ?? leafProp.key?.value ?? null,
      });
      if (leaf) {
        const inner = value;
        const leafId = injectPureImport(leaf.instanceEntry, leaf.instanceHint);
        collapseLeafName = leaf.localName;
        value = ref => callExpression(identifier(leafId), [inner(ref)]);
      }
    }
    // a symbol-PATTERN sibling leaves a residual that must still SPELL the key: over a
    // memoized receiver, or an init the collapse does not own, the sentinel is what keeps
    // the source's own read of the slot in the pattern
    // ... and an ALL-PROXY SELECTING init IS owned by the collapse: every branch names the same
    // surface, so the extraction reads it off the ponyfill and the residual dies whole
    if (!keepKey && entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern'
      && pattern.properties.length > 1
      && (memoRecv || (!allProxyInit
        && !findProxyGlobal(declarator.init, { scope: metaPath.scope, adapter, path: metaPath })))) {
      keepKey = true;
    }
    markRewrite();
    // the extracted binding registers as a body-extract alias DURING the walk, so a later
    // use folds / narrows through it (`{ iterator } = globalThis.Symbol; arr[iterator]` ->
    // `_getIteratorMethod(arr)`); ctor aliases (kind global) registered above
    if (kind !== 'global') registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath });
    recordJob({
      hostPath: exported ? declarationPath.parentPath : declarationPath,
      job: {
        prop, pattern, chain, sentinel: keepKey, exported, declarator, local: propLocalName(prop), value, collapseLeafName,
        eagerMemoName: sentinelMemoNames.get(declarator) ?? null,
        metaPath, sinkDrop: forInit && sinkDropsReceiver(declarator.init, metaPath, adapter),
        sinkKeep: forInit && mayHaveSideEffects(declarator.init),
        // the sink's re-read target resolves on the PRISTINE tree, like every other memo arg -
        // asked only of a MULTI-HOP nav that survives the sink, the one shape whose root the
        // walk would otherwise respell as its own hop pure (`_self.Array` for `_globalThis.Array`)
        sinkPlan: forInit && peelTransparentExpr(peelTransparentExpr(declarator.init)?.object)?.type === 'MemberExpression'
          && !sinkDropsReceiver(declarator.init, metaPath, adapter)
          && patternBindingCount(declarator.id) === patternBindingCount(prop.value)
          ? planMemoArg(declarator.init, metaPath) : null,
        symbolPattern: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern',
        defaulted: prop.value.type === 'AssignmentPattern',
        // the shape of the read a full consume discards, planned on the PRISTINE tree: by drain
        // time the walk has collapsed the nav and the probe's own question is unanswerable
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
        seKey: prop.computed && computedKeyHasSideEffects(prop),
        readsReceiver: kind === 'instance',
        seCarried,
        // the prefix rides the extraction's own value only where the claim spells an INSTANCE
        // dispatch to hold it; a receiver-less static and the symbol leaf bind their pure directly,
        // and there both legs lift (babel's `DEFER_SE_*` strategy family does the same)
        carriesPrefix: kind === 'instance' && entry !== 'get-iterator-method',
        catchBorn,
        memoRecv,
        siblingAppend,
        memoSibling,
        // a SENTINEL chain job dispatches on the RESOLVED nested element - the memo must hold
        // THAT node, with the residual keeping the wrapper around the swapped slot
        nestedMemoNode: keepKey && chain.length && literalReceiver
          && nodeHoldsSubtree(declarator.init, literalReceiver) ? literalReceiver : null,
        // asked on the PRISTINE tree: by drain time the branches carry their minted spellings
        allProxyInit,

        host: forInit ? 'for-init' : 'declaration',
      },
    });
  }

  // ctor alias trust-register: the drain swaps the value in
  // place, and the registered hint is what lets a later read resolve through the alias
  // (`const { self: { Symbol: S } } = globalThis; obj[iterator]` folds off `S`'s hops) -
  // babel reaches the same via its in-place rewrite, which the walk-time judges then see
  // the shared memo for a wrapper ELEMENT several claims read: one deferred plan per element
  // node, its number taken at drain like every other memo this emitter plants
  function elementMemoFor(element, hostNode) {
    let memo = literalMemoNames.get(element);
    if (!memo) {
      // the SLOT is captured while the identity still holds: a claim rendering INSIDE this element
      // replaces the node, and a memo holding the old one strands itself
      memo = { ident: identifier(''), node: element, slot: findNodeSlot(hostNode, element), deferred: true };
      literalMemoNames.set(element, memo);
    }
    return memo;
  }

  // a MULTI-prop pattern whose receiver an extraction actually reads hoists the collapsed
  // nav once (`const _ref = _globalThis.Array; const it = _gim(_ref); ...` - babel's
  // shape); a single prop reads the collapsed spelling inline, and a pure-ctor leaf
  // (`_Promise`) stays reusable inline too
  function planNavReceiverMemo({ pureNav, sentinel, forInit, chain, kind, entry, declarator, pattern, guardCtx }) {
    // an EXPORTED host is no obstacle: the memo lands as its own plain declaration ahead of
    // the extractions, which keep the export wrapper each
    if (!pureNav || sentinel || forInit || chain.length !== 0) return null;
    if (kind !== 'instance' && entry !== 'get-iterator-method') return null;
    // the SHAPE questions read the nav a dead marker wraps, the resolution judges the `?.` itself:
    // a marked twin names the same surface and owes the same memo
    const initNav = peelTransparentExpr(peelDeadChainMarker(declarator.init, guardCtx));
    if (initNav?.type !== 'MemberExpression' || pattern.properties.length <= 1) return null;
    // the fallback reads the PEELED nav, like the shape question above: a raw `box?.y` arrives
    // wrapped (a chain node), and comparing the wrapper's type left the memo unplanned - the
    // dispatch then spelled the nav a second time beside the residual, firing its getter twice
    if ((resolveProxyNavReceiver(peelTransparentExpr(declarator.init), guardCtx)?.()
      ?? initNav)?.type !== 'MemberExpression') return null;
    // the ref MINTS at drain, like every other memo in this emitter: minting during the walk
    // took a number ahead of the opaque-init memos the drain plants, and babel numbers by
    // mint order. the value thunks read this identity NODE, so filling its name then reaches
    // every one of them
    let plan = navMemoPlans.get(declarator.init);
    if (!plan) {
      plan = { ident: identifier(''), node: declarator.init, deferred: true };
      navMemoPlans.set(declarator.init, plan);
    }
    return plan;
  }

  function registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath }) {
    if (kind === 'global' && hintName && prop.value.type === 'Identifier') {
      const localName = propLocalName(prop);
      const aliasBinding = adapter.getBinding(metaPath.scope, localName, metaPath);
      if (!aliasBinding?.node) {
        registerBindinglessCtorAlias({ injector: injectorState, adapter, localName, hint: hintName });
      } else {
        registerDeclAliasIfSound({
          injector: injectorState,
          adapter,
          kind: declaration.kind,
          localName,
          hint: hintName,
          stmtPath: declarationPath,
          bindingNode: aliasBinding.node,
          binding: aliasBinding,
        });
      }
    } else if (kind !== 'global' && entry
      && (prop.value.type === 'Identifier' || prop.value.type === 'AssignmentPattern')) {
      injectorState?.registerBodyExtractAlias?.(propLocalName(prop), entry, metaPath.scope?.getBinding?.(propLocalName(prop)));
    }
  }

  // eslint-disable-next-line max-statements -- per-form host dispatch sequence
  function handleAssignmentHost({ metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    // a DEFAULTED instance prop whose computed KEY carries an effect keeps the babel
    // overwrite channel: the destructure stays whole so the key runs where the source runs
    // it, and the ponyfill re-binds after. a plain key takes the `=== void 0` guard cascade
    if (prop.value.type === 'AssignmentPattern' && kind === 'instance' && computedKeyHasSideEffects(prop)) {
      return registerSeKeyDefaultOverwrite({ prop, chain, entry, hintName, hostParent },
        { injectPureImport, markRewrite, recordJob, injector });
    }
    // the RHS as the route's QUESTIONS see it: a dead chain marker is a spelling of this
    // parser's dialect, not a shape, so every shape question below reads the nav it wraps.
    // the node-carrying sites keep `hostParent.node.right`: the receiver handed to the render,
    // the lifted prefix, the liveness identity - what sits in the slot is what the emitters
    // mutate - and the two PROBE planners, whose plan re-emits the read the source performs,
    // so it owes the source's own spelling (peeling there moves neither corpus, measured)
    const guardCtx = navGuardCtx(metaPath);
    const rhs = peelDeadChainMarker(hostParent.node.right, guardCtx);
    // only a statement-position assignment whose value nobody reads: a captured result
    // (`x = ({ from } = Array)`) keeps the full object flowing - staged. oxc preserves the
    // grouping parens the spelling requires, so the climb peels them
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && TRANSPARENT_EXPR_WRAPPER_TYPES.has(exprStmtPath.node?.type)) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    const seqHostStatement = exprStmtPath?.node?.type !== 'ExpressionStatement'
            && discardedSequenceElement(hostParent) ? hostStatementOf(hostParent) : null;
    const bodyless = !seqHostStatement
            && !statementListOf(exprStmtPath?.parentPath?.node);
    if (exprStmtPath?.node?.type !== 'ExpressionStatement' && !seqHostStatement) {
      // a CAPTURED result hands its reader the receiver itself, so no channel here may
      // rewrite it - a NESTED leaf still takes the sound inline default off it
      if (chain.length > 0 && kind !== 'instance') {
        applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
      }
      return;
    }
    // a value-SELECTING RHS under a NESTED static leaf routes to the per-branch mirror,
    // the declarator host's decline (babel mirrors too; the extraction
    // route discards the selection and drags the substituted root in as a dead import)
    if (kind !== 'instance' && chain.length > 0
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(rhs)?.type)
      && !allProxySelectingInit(rhs, { adapter, injectorState })) {
      routeSelectionMirror(metaPath, handlePerBranch);
      return;
    }
    if (emitAssignStaticDefaultOverwrite({ hostParent, prop, pattern, chain, kind, entry, hintName, metaPath },
      { adapter, injectorState, injectPureImport, markRewrite, markSubtreeSkipped, skippedNodes })) return;
    // a NESTED instance leaf in a destructuring-ASSIGNMENT has no declaration to host a
    // `const`: the destructure assigns the native slot first, then an OVERWRITE statement
    // re-binds the local through the ponyfill (`({ y: { at: m } } = { y: R })` -> `m =
    // _atMaybeArray(R)` after). the receiver is DUPLICATED into that copy, so it must be
    // safe to spell twice; the clone is taken at drain time off the rewritten tree, which
    // is what makes the copy scope-aware
    if (kind === 'instance' && chain.length > 0 && entry !== 'get-iterator-method') {
      const bindingId = propBindingIdentifier(prop.value);
      // NO nav segments here: this arm resolves during the WALK and clones at drain, so a spelling
      // built over the captured root can never carry the substitution the walk performs on it
      // (`globalThis` -> `_globalThis`) - it printed the raw global beside a residual reading the
      // pure import. the consume route below spells such a receiver through the passthrough
      const copyReceiver = bindingId && resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true });
      // ... and where the HOST dies with the slot, an EFFECT-bearing receiver qualifies too: nothing
      // survives to read it a second time, so the dispatch performs the effects the dropped residual
      // would have performed, exactly once (`({ y: { at: v } } = { y: eff() })`). the second-read rule
      // below protects a residual - with none left it has nothing to protect
      // the receiver is spelled a SECOND time here (the residual keeps the source's own read), so it
      // must be a bare token: the resolution above hands out no nav, and a member-valued literal slot
      // never reaches this arm - measured, the surface allowance this once carried was dead
      const plainCopy = copyReceiver && isReReferenceableReceiver(copyReceiver) ? copyReceiver : null;
      const carriedReceiver = plainCopy || !bindingId || !consumedAssignmentSlotDropsHost(metaPath)
        ? null
        : carriedInitReceiverNode({
          path: metaPath,
          initNode: hostParent.node.right,
          resolveOptions: { allowSePeeledFragment: true },
        });
      if (plainCopy || carriedReceiver) {
        const id = injectPureImport(entry, hintName);
        // a DEFAULTED leaf keeps its guard: the pure entry answers `it.method` verbatim off a
        // receiver that is not the polyfilled surface, so the dispatch may be undefined and burying
        // what the destructure bound loses the source's default
        // (`({ y: { flat: m = null } } = { y: navigator })` bound undefined where the source binds null)
        const overwriteRef = prop.value.type === 'AssignmentPattern'
          ? injector.generateDeclaredRef(metaPath) : null;
        // the raw slot goes with the dispatch that re-spells it - the shared canon answers which slots
        // may leave, and the drain removes the prop and drops an emptied host
        const prunes = consumedAssignmentSlotPrunes(metaPath);
        markRewrite();
        recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath,
          job: { host: 'assign-overwrite', local: bindingId.name, bodyless, seqHostStatement,
            // the raw slot goes with the dispatch that re-spells it - the shared canon answers which
            // slots may leave, and the drain removes the prop and drops an emptied host
            prunesSlot: prunes,
            carriesInit: !!carriedReceiver,
            prop, pattern, chain, sentinel, assignment: hostParent.node,
            value: () => {
              // a CARRIED receiver re-resolves at drain: a claim inside it renders by REPLACING its
              // node, and the walk-time copy predates that rewrite
              const receiver = carriedReceiver
                ? resolveNestedReceiverNode(metaPath,
                  { allowSePeeledFragment: true, allowInitCarriedEffects: true }) ?? carriedReceiver
                : duplicateReceiver(copyReceiver, injector);
              const call = callExpression(identifier(id), [receiver]);
              return overwriteRef
                ? overwriteDefaultGuard({ call,
                  localName: bindingId.name,
                  ref: overwriteRef,
                  defaultNode: prunes ? prop.value.right : null })
                : call;
            } } });
        return;
      }
      // a BODYLESS slot falls through to the consume route like any other: its drain owns the slot
      // (one statement stays bare, two take a block), so the claim there is not the emitter's to
      // decline - standing down left the leg native where the other one polyfilled
    }
    // an opaque receiver still consumes when the extraction is its ONLY read: a sole
    // plain prop, instance kind (the dispatch reads once - `mapOfKept = _mapMaybeArray(X ?? {})`)
    // or an SE-free receiver a static may discard
    // an ALL-proxy selecting RHS reads like a plain proxy receiver: every LIVE branch lands
    // on the same surface, so the claim extracts off the first and the selection drops whole
    const allProxyRhs = allProxySelectingInit(rhs, { adapter, injectorState });
    const pureNavRhs = allProxyRhs || isPureNavReceiver(hostParent.node.right, guardCtx);
    // the read a full consume DISCARDS, planned on the PRISTINE tree: by drain time the
    // walk has rendered the guard and the probe's own question is unanswerable
    const initProbePlan = planDiscardedInitProbe(hostParent.node.right, metaPath, { adapter, resolvePure });
    // a BODYLESS host with an SE SEQUENCE init lifts its prefix into the wrapping block
    // (`if (x) ({ Map: { g } } = (eff(), globalThis));` -> `{ eff(); g = _Map$groupBy; }`);
    // the receiver is the quiet TAIL
    let bodylessSeqPrefix = null;
    let receiverNode = allProxyRhs ? firstProxyBranch(hostParent.node.right) : hostParent.node.right;
    // the STATEMENT host lifts the same prefix as its own statements ahead
    // (`sideEffect(); from = _Array$from;` - babel's flatten); a SENTINEL residual then
    // reads the quiet tail
    // does anything OUTSIDE this claim still read the init? asked of the HOST pattern, not of the
    // claim's own one - a nested leaf sits in a pattern of its own, and its siblings live one level up
    const residualSurvives = patternBindingCount(hostParent.node.left) !== patternBindingCount(prop.value);
    const liftPlan = pureNavRhs ? null : planLiftedRhsPrefix(hostParent.node.right, {
      anchorsInSequence: !!seqHostStatement && prop.value?.type === 'ObjectPattern',
      residualSurvives,
      guardCtx,
    });
    if (liftPlan) {
      bodylessSeqPrefix = liftPlan.prefix;
      receiverNode = liftPlan.receiver;
    }
    // an SE-carrying NAV receiver (`({ from: from2 } = (eff3(), globalThis).Array)`): a
    // SOLE full consume lifts the receiver WHOLE as its own statement - claims land in
    // place, the assign reads the pure (`(eff3(), _globalThis).Array; from2 =
    // _Array$from;`, babel's flatten); multi-prop and residual shapes stay staged
    // ... and a CALL-rooted nav takes the same lift even when the call is quiet: the classifier
    // answers about what must be RESCUED, and a receiver with nothing to rescue still owes its
    // read a slot - without one the claim had no route at all and shipped native
    // (`({ groupBy: g } = mk().Map)` -> `_Map; g = _Map$groupBy;`, babel's shape)
    // ... and a DEFAULTED leaf is flat all the same: what its default costs is a guard, not a route.
    // a STATIC claim spells an always-defined ponyfill, so the default is dead and the binding is
    // its undefaulted twin; an INSTANCE dispatch answers `it.method` verbatim off a surface that is
    // not the polyfilled one, and the value render owns that guard. the KIND question belongs to
    // the lift below, which asks it on its own - this one is about the leaf's SHAPE
    const flatAssignLeaf = prop.value.type === 'Identifier'
      || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
    if (!pureNavRhs && !bodylessSeqPrefix && !sentinel
      && pattern.properties.length === 1 && flatAssignLeaf && kind !== 'instance'
      && (navSpineHasCall(rhs) || classifyCallBranchForSynth({
        inner: peelTransparentExpr(rhs), scope: metaPath.scope, adapter, path: metaPath,
      }).callBranch)) {
      bodylessSeqPrefix = [hostParent.node.right];
    }
    const soleConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length === 1 && flatAssignLeaf
            && (kind === 'instance' || !mayHaveSideEffects(rhs));
    // a MULTI-prop instance consume rides the same literal route: several dispatches
    // (and any surviving residual) read ONE receiver, which the drain memoizes
    // (`({ at, includes } = [1, 2, 3])` -> `const _ref = [1, 2, 3]; at = _atMaybeArray(_ref); ...`)
    // ... and a REST sibling is exactly such a residual: it re-reads the receiver past the renamed
    // key, so the memo is what gives both readers one identity - the arrangement the DECLARATION
    // host already emits for the same pattern. an SE-keyed sentinel keeps its own routes below,
    // where the key's effect decides the shape rather than the receiver's re-readability
    const restSentinelOnly = sentinel && hasRestSibling(pattern)
            && !(prop.computed && computedKeyHasSideEffects(prop));
    // ... and a BODYLESS slot hosts the same arrangement: its drain opens a block, and the memo goes
    // in there with the extraction and the residual, guarded exactly as the source guarded them
    const multiInstanceConsume = !pureNavRhs && !bodylessSeqPrefix && (!sentinel || restSentinelOnly)
            && chain.length === 0
            && pattern.properties.length > 1 && prop.value.type === 'Identifier' && kind === 'instance';
    // an SE-keyed INSTANCE prop over a CONSTANT literal keeps its raw residual (the key
    // effect runs in place) and the overwrite re-spells the literal
    // (`a = _atMaybeArray([3, [7]])` - no memo)
    const seKeyLiteralOverwrite = !pureNavRhs && !bodylessSeqPrefix && sentinel && chain.length === 0
            && kind === 'instance' && prop.value.type === 'Identifier'
            && prop.computed && computedKeyHasSideEffects(prop)
            && isConstantLiteralReceiver(peelTransparentExpr(rhs));
    // a receiverless STATIC in a MULTI-prop consume rides along: the memo (or the kept
    // RHS statement) evaluates the init, and the static spells its own pure
    // (`({ of, name, from } = seCall())` -> `of = _Array$of; name = _name(_ref); ...`)
    // the depth of THIS claim does not change the arrangement: the extraction spells its own pure
    // and the surviving residual keeps reading the init, so a nested leaf rides along like a flat
    // one (`({ Map: { groupBy: g, size: s } } = mk())` - babel extracts and keeps the rest)
    // ... in a BODYLESS slot too: its drain hosts the residual and the extraction in one block, the
    // same arrangement. and in a DISCARDED sequence element, whose drain folds that very pair back
    // into its slot as sequence elements - standing down in either left the leg native where the
    // other one extracts
    const staticInMultiConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel
            && residualSurvives && prop.value.type === 'Identifier' && kind !== 'instance';
    // a NESTED receiver-less claim over a literal RHS consumes the destructure whole: the
    // statement becomes the plain re-bind (`({ a: { from: f } } = { a: Array })` ->
    // `f = _Array$from`), the discarded literal observing nothing
    // ... and a GUARDED nav receiver consumes the same way, whatever its depth: the read the
    // consume discards re-emits as the extraction's own probe prefix, and the live branch is
    // a pure binding the value reads directly (`v = ((null == _g.window ? void 0 : _self).Math,
    // _Math$sign)`)
    const guardedPureRhs = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
            && kind !== 'instance' && prop.value.type === 'Identifier' && pattern.properties.length === 1
            && !!initProbePlan;
    // ... and a SENTINEL residual keeps the receiver SPELLED, so a live `?.` in it is no
    // obstacle: the walk renders that nav as its guard in place and the slot still takes the
    // inline default (`({ [(k(), 'keys')]: v = _Object$keys } = null == _g.window ? ... )`)
    // ... and a SENTINEL residual keeps the receiver spelled whatever it is: the renamed slot is
    // what reads the init, exactly once, and the extraction spells its own pure beside it. this is
    // the arrangement babel prints for `({ groupBy: g, ...rest } = mk().Map)` and for the SE-key
    // twin - without it an effectful receiver had no sentinel route at all
    const sentinelKeptRhs = !pureNavRhs && !bodylessSeqPrefix && sentinel && kind !== 'instance'
            && prop.value.type === 'Identifier' && chain.length === 0;
    const sentinelGuardedRhs = !pureNavRhs && sentinel && chain.length === 0 && kind !== 'instance'
            && prop.value.type === 'Identifier'
            && (!!initProbePlan
              || !!planSealedNavProbe(hostParent.node.right, metaPath, probeRenderCtx));
    const nestedLiteralConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
      && kind !== 'instance' && prop.value.type === 'Identifier'
      && pattern.properties.length === 1 && !mayHaveSideEffects(rhs)
      && !!resolveNestedReceiverNode(metaPath, {});
    // a BARE proxy-global receiver names the polyfilled surface as surely as a nav off one does.
    // the SYMBOL leaf keeps its own route: its KEY is a claim of its own, and consuming the
    // destructure would drop that key's polyfill with the pattern
    // the QUIET receiver a lift leaves behind: its prefix (a sequence's leading expressions, a kept
    // write) renders as statements ahead of the extraction, so the questions below are about the TAIL
    const bareProxyRecvNode = unwrapInitValue(peelTransparentExpr(receiverNode));
    const bareProxyGlobalRhs = entry !== 'get-iterator-method' && bareProxyRecvNode?.type === 'Identifier'
      && POSSIBLE_GLOBAL_OBJECTS.has(bareProxyRecvNode.name)
      && isPristineProxyGlobal(adapter, bareProxyRecvNode.name);
    // a TYPED outer hop composes the two steps with no receiver of its own to keep: the hop step
    // feeds the leaf dispatch, the pattern is consumed whole, and the local re-binds through the
    // composition - the declarator host's arrangement, one host over. without it the slot fell to
    // the fallback mirror, which fires the source's default on the path the ponyfill answers
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost } = typedHopFor({
      chain, kind, entry, metaPath, receiverPath: hostReceiverPath(hostParent),
    });
    const typedHopConsume = !!typedHopPure && !sentinel && !hasRestSibling(pattern)
      && pattern.properties.length === 1 && prop.value.type === 'Identifier';
    // ... and a DEFAULTED nested leaf over an OPAQUE receiver has no slot for its default: the
    // overwrite spells the dispatch alone, and one answering undefined would skip the default the
    // source wrote (`({ codes: { findIndex: m = d() } } = recvF)` stays native)
    if ((!pureNavRhs && !soleConsume && !multiInstanceConsume && !seKeyLiteralOverwrite
      && !typedHopConsume
      && !staticInMultiConsume
      && !bodylessSeqPrefix && !nestedLiteralConsume && !guardedPureRhs && !sentinelGuardedRhs
      && !sentinelKeptRhs)
      || (chain.length > 0 && prop.value.type === 'AssignmentPattern' && !nestedLiteralConsume
        // ... the arm is about the INSTANCE dispatch, which may answer undefined: the VALUE renders
        // the guard that keeps the source's default, so what is left to refuse is a receiver whose
        // SURFACE is unknown - a PROXY-GLOBAL one, bare or navigated, resolves to the polyfilled
        // surface and its claim binds the ponyfill where the source's default would have hidden it
        && kind === 'instance' && !bareProxyGlobalRhs
        && !resolveProxyNavReceiver(bareProxyRecvNode, guardCtx))) return;
    const chainKeys = hopChainKeys(chain);
    const value = buildValue({
      guardCtx,
      kind, entry, hintName, receiverNode, prop, nested: chain.length > 0, chainKeys, metaPath,
      literalRoute: soleConsume || multiInstanceConsume || seKeyLiteralOverwrite,
      liveReceiver: receiverNode === hostParent.node.right ? () => hostParent.node.right : null,
      typedHop: typedHopPure ? { pure: typedHopPure, defaultHost: typedHopDefaultHost } : null,
    });
    if (!value) return;
    // the assignment-form twin of the declarator-host registrations: the ctor hint / fold
    // source is what lets a later read resolve through the extracted alias
    registerAssignmentExtractAlias({ prop, kind, entry, hintName, hostParent, exprStmtPath, metaPath },
      { adapter, injectorState });
    markRewrite();
    const keepSentinelBinding = sentinel && !hasRestSibling(pattern) && prop.value.type === 'Identifier'
      && chain.every(level => !level.outerRest);
    // an SE-keyed STATIC prop in an ASSIGNMENT host takes an INLINE DEFAULT instead of an
    // overwrite: the native slot wins when present, the ponyfill fills the gap
    // (`[(eff(), 'from')]: f = _Array$from` - babel's shape); no job records - the residual
    // is the whole render
    if (keepSentinelBinding && kind !== 'instance' && entry !== 'get-iterator-method') {
      markSubtreeSkipped(skippedNodes, prop.value);
      prop.value = { type: 'AssignmentPattern', left: prop.value, right: value() };
      prop.shorthand = false;
      return;
    }
    // an SE-keyed INSTANCE prop over a MEMBER receiver stands down whole: the kept key
    // re-reads the member in the residual and the rebuild would read it again - babel
    // declines the same shape (a CONSTANT literal re-spells freely instead, below)
    if (keepSentinelBinding && kind === 'instance' && prop.computed && computedKeyHasSideEffects(prop)
      && peelTransparentExpr(rhs)?.type === 'MemberExpression') return;
    // an SE-keyed SYMBOL prop under an ANCHORED hop keeps the key-swap ALONE: the kept key
    // already reads through the polyfilled symbol, and a re-bind would render the claim
    // twice; the PLAIN assignment keeps its overwrite
    if (keepSentinelBinding && entry === 'get-iterator-method' && chain.length > 0
      && prop.computed && computedKeyHasSideEffects(prop)) return;
    const job = {
      prop, pattern, chain, sentinel, bodyless, local: propLocalName(prop), value,
      host: seqHostStatement ? 'assign-seq' : 'assignment',
      assignment: hostParent.node,
      seqPrefix: bodylessSeqPrefix,
      // an INSTANCE extraction re-READS the receiver - two reads of an unreusable one need
      // the memo the declaration form already mints
      readsReceiver: kind === 'instance',
      // the same pristine verdict the declaration host takes: an effectful computed key read
      // off the ROOT is the read the source performed, and the consume discards it
      rawKeyRootInit: initRawKeyOnRoot(rhs),
      seqHostStatement,
      metaPath,
      // the shape of the read a full consume DISCARDS, planned on the PRISTINE tree - the
      // declaration host's own pair, asked of the assignment's right
      initProbePlan,
      sealedProbePlan: planSealedNavProbe(hostParent.node.right, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
      mintedSentinels: [],
      // an SE-keyed prop in an ASSIGNMENT host keeps its ORIGINAL binding in the residual -
      // the overwrite channel re-binds it right after, so no sentinel mints (babel's shape);
      // a rest sibling still renames (the key must keep excluding it from rest)
      keepSentinelBinding,
      // a FOR sink keeps the assignment inside the for-init, so no sentinel `var` fits beside
      // it: the declaration hoists with the refs (babel's scope.push). the name is claimed
      // HERE, where the WALK is, so it declares in the order babel pushed it - claimed at
      // drain time it would run past every other ref and rank behind them all
      forInitSentinel: seqHostStatement?.type === 'ForStatement'
        ? injector.declareUnusedRef(metaPath) : null,
    };
    // an assignment-position sentinel writes an undeclared name: the drain plants its
    // `var _unusedN;` immediately before the rewritten statement, babel's shape
    job.mintSentinel = () => {
      if (seqHostStatement?.type === 'ForStatement') {
        const claimed = job.forInitSentinel ?? injector.declareUnusedRef(metaPath);
        job.forInitSentinel = null;
        return claimed;
      }
      const name = mintUnusedName();
      job.mintedSentinels.push(name);
      return name;
    };
    recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath, job });
  }

  // a pure member nav rooted in a POSSIBLE-GLOBAL identifier, rendered via the shared
  // passthrough resolution; null when the receiver is not that shape
  function resolveProxyNavReceiver(receiver, guardCtx = null) {
    const { root: cur, keys: navKeys } = navHopChain(receiver, guardCtx);
    let keys = navKeys;
    if (!keys.length || keys.some(key => !key) || cur?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) return null;
    // leading pristine possible-global hops are pure navigation into the same surface - the
    // kept-root canon drops them (`globalThis.self.Array` reads as root + ['Array'])
    while (keys.length > 1 && isPristineProxyGlobal(adapter, keys[0])) keys = keys.slice(1);
    const ref = resolvePassthroughRef({
      keyPath: keys,
      receiverName: cur.name,
      receiverIsProxy: true,
      resolveGlobalPolyfill,
      adapter,
    });
    return () => {
      let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      for (const key of ref.path) base = memberFromKeyName(base, key);
      return base;
    };
  }

  // for-init: consumed declarators are replaced IN PLACE by the extracted siblings, and an
  // effect-bearing consumed init stays live as an `_unused` dummy declarator

  return {
    // the ONE unused-name minter of this leg: the guard render's rest residual mints its sentinels
    // through it too, so every `_unused` joins the same rename census and numbers with the rest
    mintUnusedName,
    extractCatchClause,
    extractLoopLeft,
    handleObjectPropertyResult,
    handlePerBranch,
    drain,
    sentinelAlreadyProcessed({ metaPath, meta }) {
      return sentinelAlreadyProcessed(metaPath, { node: metaPath.node, meta, injector: injectorState });
    },
    overwriteRebindEmitted: args => overwriteRebindEmitted({ ...args, injectorState }),
    warnConditionalFallbackUntouched(meta, metaPath) {
      warnConditionalFallbackUntouched(meta, metaPath, { getDebugOutput, adapter, resolvePure });
    },
    // an INLINE-resolvable CALL init yields a proxy surface the meta funnel never marks as a
    // fallback: the mirror owns that value, and the host shape is what says so
    // (`{ Array: { from } } = (g => g)((c++, globalThis))`)
    inlineCallYieldingProxyHost(metaPath) {
      let host = metaPath.parentPath;
      while (host?.node && (host.node.type === 'ObjectPattern' || host.node.type === 'Property')) {
        host = host.parentPath;
      }
      const init = host?.node?.type === 'VariableDeclarator' ? peelTransparentExpr(host.node.init) : null;
      if (init?.type !== 'CallExpression' || init.optional) return false;
      const returned = inlineCallReturnExpression(
        { node: init, seen: new Set(), ctx: { scope: metaPath.scope, adapter, path: metaPath } }, { rejectConditional: true },
      );
      // ... and only where the yielded value carries an EFFECT the extraction would drop: the
      // call evaluation runs its argument, and the harvest has no channel for argument effects.
      // a quiet identity call discards cleanly and keeps the ordinary extraction
      let value = returned && peelTransparentExpr(returned.node);
      let effectful = false;
      while (value?.type === 'SequenceExpression') {
        effectful ||= value.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr));
        value = peelTransparentExpr(value.expressions.at(-1));
      }
      return effectful && value?.type === 'Identifier' && isPristineProxyGlobal(adapter, value.name);
    },
    // an ARRAY-WRAPPED pattern resolves no receiver of its own in the meta funnel - the
    // element is positional, so a SELECTING one never reaches the mirror through the meta's
    // fallback flag. the host shape answers instead (`[{ Array: { from } }] = [c ? gw : o]`)
    arrayWrappedSelectingHost(metaPath) {
      if (metaPath.parentPath?.node?.type !== 'ObjectPattern') return false;
      const element = peelTransparentExpr(resolveArrayWrappedReceiver(metaPath.parentPath)?.element);
      return !!element && !!getFallbackBranchSlots(element);
    },
    noteMutatedCtorHopHost: declarator => hopHosts.set(declarator, { forceMutatedHop: true }),
    // a CTOR hop nothing extracted from re-anchors on its own member READ (`{ A$b: { from } }
    // = globalThis` -> `{ from } = _globalThis.A$b`) - only where the key qualifies as a
    // CONSTRUCTOR name the anchor may spell (the shared ctor-key-anchor gate): a lowercase
    // `constructor` names no global slot, and a non-identifier key has no member form
    noteUntouchedCtorHopHost(declarator, keyName, assignHost = false) {
      if (!hopHosts.has(declarator) && isStaticPlacement(keyName)) {
        // the key the WALK resolved travels with the note: a computed spelling bound to a
        // constant (`{ [hopKey]: { viaKey } }`) names no literal the re-anchor could read
        hopHosts.set(declarator, { untouched: true, wholeDeclarator: true, assignHost, hopKeyName: keyName });
      }
    },
    // a PRISTINE proxy hop navigates to the same surface, so a whole-declarator pattern
    // flattens onto it (`{ window: { Array } }` -> `{ Array }`). applied AT ONCE, not at
    // drain: the flattened pattern is what registers the ctor alias a later static read
    // resolves through (a nested value is not an alias on every path - the shared canon -
    // while its flattened twin is)
    // a PRISTINE proxy hop navigates to the same surface, so a whole-host pattern flattens
    // onto it (`{ window: { Array } }` -> `{ Array }`). at DRAIN like its siblings: the walk
    // is still running, and a pattern rewritten under it is visited a second time
    noteProxyCtorHopHost(host, metaPath, assignHost) {
      // the note fires only for a SOLE hop prop, so the pattern IS the whole host: a ctor hop
      // left below the peeled proxy one anchors on its own member read in the same pass
      if (!hopHosts.has(host)) hopHosts.set(host, { metaPath, assignHost, wholeDeclarator: true });
    },
    isAllProxySelectingInit: node => allProxySelectingInit(node, { adapter, injectorState }),
    // has any claim of this pattern reached the pipeline? the usage emitter's hop-collapse
    // verdict asks it: an UNCLAIMED pattern has no channel that re-renders its receiver, so a
    // collapse there would be the ONLY spelling - and under a value-observing carrier the hops
    // the source wrote have to survive. the pattern is visited before the init, so the answer
    // is complete by the time the init's claims land
    patternClaimed(patternNode) {
      for (const [, { jobs }] of ledger) {
        if (jobs.some(job => job.pattern === patternNode)) return true;
      }
      return false;
    },
    // a proxy hop bound to a NAME registers as an alias of that surface - the same channel the
    // polyfillable hops take through `registerExtractAliases`, for the ones pure cannot back
    noteProxyHopAlias({ metaPath, hopKey, localName, declarationPath }) {
      const aliasBinding = adapter.getBinding(metaPath.scope, localName, metaPath);
      if (!aliasBinding?.node) {
        registerBindinglessCtorAlias({ injector: injectorState, adapter, localName, hint: hopKey });
        return;
      }
      registerDeclAliasIfSound({
        injector: injectorState, adapter, kind: declarationPath?.node?.kind ?? 'const',
        localName,
        hint: hopKey,
        stmtPath: declarationPath,
        bindingNode: aliasBinding.node,
        binding: aliasBinding,
      });
    },
  };
}
