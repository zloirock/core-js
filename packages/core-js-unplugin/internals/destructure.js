import {
  synthPropDedupKey,
  buildPatternRenderPlan,
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  classifyCallBranchForSynth,
  fallbackBranchSwapKeepsSelection,
  isConstantLiteralReceiver,
  isReReferenceableReceiver,
  isViableBranchForKey,
  renderSynthTree,
  resolveNestedReceiverNode,
  resolvePassthroughRef,
  qualifiesForParamBodyExtract,
  undefinedArmEffectiveReceiver,
  paramDefaultInstanceSynthAllowed,
} from '@core-js/polyfill-provider/detect-usage/destructure';
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
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  patternBindingCount,
  POSSIBLE_GLOBAL_OBJECTS,
  TS_EXPR_WRAPPERS,
  assignmentInStatementPosition,
  computedKeyHasSideEffects,
  computedKeysAllBound,
  getFallbackBranchSlots,
  isPristineProxyGlobal,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  statementListOf,
  peelFallbackBranchInner,
  relocatedCatchPattern,
  relocatedCatchPropUnobservable,
  resolveFallbackReceiver,
  hasRestSiblingExcept,
  paramsHaveInvisibleCallers,
  propBindingIdentifier,
  prologueEndIndex,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { detectIifeArgReceiver, findSynthSwapReceiver } from './destructure-emit-utils.js';
import { nodeSite, stampNodeSite } from './nav-spine.js';
import { walkAstNodes } from './plugin-helpers.js';
import { discardedSequenceElement, memberFromKeyName, replaceNodeInTree } from './emit-shared.js';
import { callExpression, cloneNode, identifier, variableDeclaration, variableDeclarator } from './builders.js';
import {
  SELECTING_INIT_TYPES,
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
  navSpineHasCall,
  navSpineHasComputedKeyEffect,
  nodeHoldsSubtree,
  overwriteRebindEmitted,
  peelWrappers,
  plainNavHopKey,
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
  seLiftedHopNav,
  sentinelAlreadyProcessed,
  sinkDropsReceiver,
  staticallySelectedLeft,
  swapInlineDefaults,
  synthPlanFullyCovered,
  takesInlineDefault,
  warnConditionalFallbackUntouched,
} from './destructure-helpers.js';
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
    resolveProxyNavReceiver: (...args) => resolveProxyNavReceiver(...args),
    resolvePure,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
  });
  const { buildValue, drain, extractCatchClause, planMemoArg, recordJob } = drains;

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
        ? peelWrappers(hostParent.node.right)
        : peelWrappers(detectIifeArgReceiver(hostParent, pattern));
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
      : proxyNavSynthBase(receiver?.type === 'LogicalExpression' ? peelWrappers(receiver.left) : receiver,
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
      let left = peelWrappers(receiver.left);
      if (left?.type === 'SequenceExpression') {
        // capture the LIVE sequence, not its elements: the walker still rewrites the prefix
        // in place, and the drain reads the current state
        leadingEffects = left;
        left = peelWrappers(left.expressions.at(-1));
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
          insertOnUndefaulted: peelWrappers(desc.rhsNode)?.type === 'LogicalExpression'
            && peelWrappers(desc.rhsNode).operator === '&&',
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
      const selecting = peelWrappers(host?.node?.init ?? host?.node?.right ?? null);
      if (selecting?.type === 'LogicalExpression' && selecting.operator === '&&'
        && peelWrappers(selecting.left) === branch) return false;
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
      const returned = inlineCallReturnExpression({
        callNode: inner, ...nodeSite(inner, metaPath), adapter, seen: new Set(), rejectConditional: true,
      });
      // an IDENTITY call hands back its ARGUMENT: the literal lands on that value's own tail,
      // so a sequence prefix keeps running where the source wrote it
      let value = returned && peelWrappers(returned);
      while (value?.type === 'SequenceExpression') value = peelWrappers(value.expressions.at(-1));
      // ... and only the shapes whose yield is ONE surface: a bare proxy root, or an `&&` GATE
      // whose right operand is that root (`() => m && globalThis`). a selection between two
      // different surfaces keeps its own channels - the mirror there would spell both arms
      const gatedRoot = value?.type === 'LogicalExpression' && value.operator === '&&'
        && !proxySurfaceIdentifier(peelWrappers(value.left), { adapter, injectorState });
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
        cur = peelWrappers(cur.object);
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
  function registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath, symbolProp }) {
    // a BODYLESS twin and an INSTANCE-defaulted prop both keep the raw destructure (the
    // native slot assigns first, the overwrite re-binds after), so the element is read
    // TWICE - only a re-referenceable one qualifies. a STATIC default is DEAD (the pairing
    // proved the element) and the consume drops it with the destructure, the declaration
    // route's own rule
    const defaulted = prop.value.type === 'AssignmentPattern' && kind === 'instance';
    if ((wrapped.bodyless || defaulted) && !isReReferenceableReceiver(wrapped.element)) return;
    const chainKeys = hopChainKeys(chain);
    // the dead default peels out of the VALUE only - the raw prop keeps its own binding
    const twinProp = prop.value.type === 'AssignmentPattern' ? { ...prop, value: prop.value.left } : prop;
    // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
    // wrapper pairing proved the element, and a chain reads through the literal to the
    // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
    // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
    const twinDeepReceiver = kind === 'instance' && chain.length
        ? resolveNestedReceiverNode(metaPath) : null;
    const twinReceiver = twinDeepReceiver ?? wrapped.element;
    const value = buildValue({
      kind,
      entry,
      hintName,
      receiverNode: twinReceiver,
      prop: twinProp,
      nested: !twinDeepReceiver && chain.length > 0, chainKeys, metaPath,
      // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
      // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
      literalRoute: kind === 'instance' && (isConstantLiteralReceiver(peelWrappers(twinReceiver))
          || (isReReferenceableReceiver(twinReceiver)
            && !(peelWrappers(twinReceiver)?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(peelWrappers(twinReceiver).name)))),
    });
    if (!value) return;
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
          sentinel: defaulted || hasRestSibling(pattern) || chain.some(level => level.outerRest),
          // ... except a SYMBOL target, which has no declaration to host an extraction: the
          // destructure assigns it natively first and the overwrite rebinds it through the
          // helper, so the prop keeps its own binding (`[{ [S]: it, ...r }] = [arr]`) -
          // and a DEFAULTED one, whose default must run natively before the re-bind
          keepSentinelBinding: symbolProp || defaulted,
          local: propLocalName(prop), value,
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
  function innerDefaultDeadOnTypedOuter({ assignmentPattern, declaratorPath, metaPath }) {
    const outerProp = assignmentPattern?.parentPath;
    const outerKeyNode = outerProp?.node?.type === 'Property' && !outerProp.node.computed ? outerProp.node.key : null;
    const outerKey = outerKeyNode?.name ?? (typeof outerKeyNode?.value === 'string' ? outerKeyNode.value : null);
    const initPath = declaratorPath?.node?.type === 'VariableDeclarator' ? declaratorPath.get?.('init') : null;
    if (!initPath?.node || typeof outerKey !== 'string' || !resolveNodeType || !toHint) return null;
    const objectHint = toHint(resolveNodeType(initPath));
    if (!objectHint) return null;
    const outerPure = resolvePure({ kind: 'property', object: objectHint, key: outerKey, placement: 'prototype' }, metaPath);
    return outerPure?.kind === 'instance' ? outerPure : null;
  }

  // eslint-disable-next-line max-statements -- per-form prop dispatch sequence
  function handleObjectPropertyResult({ metaPath, meta, kind, entry, hintName }) {
    const prop = metaPath.node;
    // a PRISTINE proxy hop holding a nested pattern is pure NAVIGATION, not a ctor alias:
    // the flatten owns it, and an extraction here would bind the hop's OWN surface where
    // the source reads through it to the root (`{ self: { X } } = globalThis` -> `_globalThis`)
    if (meta?.guardedAliasHint || (meta?.chainAssignInsertAt !== null && meta?.chainAssignInsertAt !== undefined)
      || (kind === 'global' && !prop.computed && prop.value?.type === 'ObjectPattern'
        && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && isPristineProxyGlobal(adapter, hintName))) return;
    // harvested effects: only pure RECEIVER effects pass (the memo path keeps the whole
    // init alive, effects included); a mixed channel stays staged. KEY effects never reach
    // the meta here - they live in the prop's own key subtree, probed directly below
    const receiverSeOnly = !!meta?.sideEffects?.length && meta.receiverEffectCount === meta.sideEffects.length;
    if ((meta?.sideEffects?.length || meta?.receiverEffectCount) && !receiverSeOnly) return;
    const symbolProp = entry === 'get-iterator-method';
    // the ctor-pattern re-anchor serves only a pattern the FLATTEN leaves whole: one
    // resolvable leaf routes the claim through the leaf's own chain climb instead, and a
    // mixed pattern's split residual stays staged
    const ctorPattern = kind === 'global' && prop.value?.type === 'ObjectPattern'
      && prop.value.properties.every(leaf => leaf.type === 'Property' && !leaf.computed
        && leaf.value?.type === 'Identifier' && (leaf.key?.type === 'Identifier' || leaf.key?.type === 'Literal')
        && !resolvePure({
          kind: 'property', object: hintName, key: leaf.key.name ?? leaf.key.value, placement: 'static',
        }, metaPath));
    if (!isPlainConsumableProp(prop, { symbolProp, ctorPattern, instanceArrayLeft: kind === 'instance' })) return;
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
        let core = peelWrappers(defaultPath.node.right);
        if (core?.type === 'ChainExpression') core = peelWrappers(core.expression);
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
        // the TYPED outer is the same dead rule from the other side: the outer slot is always
        // defined, so the climb keeps the hop and the composed extraction folds this default
        // through the canonical guard instead of mirroring it
        return !innerDefaultDeadOnTypedOuter({ assignmentPattern: defaultPath, declaratorPath: host, metaPath });
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
        registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath, symbolProp });
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
        const deepReceiver = kind === 'instance' && chain.length
          ? resolveNestedReceiverNode(metaPath) : null;
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
        const sharedElementMemo = !deepReceiver && kind === 'instance' && chain.length === 0
          && prop.value.type === 'Identifier' && wrapped.precedingPure
          // several readers only: a SOLE prop reads the element once inside its own dispatch, and
          // memoizing there would polyfill a shape the other leg still leaves native (that
          // missed polyfill is the pre-existing class the queue tracks, not this memo's job).
          // a REST element keeps the residual whatever this prop takes, and that residual reads
          // the element again - a re-run selection could take the other branch by then
          && (pattern.properties.length > 1 || wrapped.wrapperRest)
          && !isReReferenceableReceiver(wrapped.element)
          ? elementMemoFor(wrapped.element) : null;
        // the dispatch SPELLS the element the source wrote (its TS cast kept - the flat canon);
        // the classifiers above read the peeled view
        const declReceiver = sharedElementMemo?.ident ?? deepReceiver
          ?? (wrapped.writtenElement && !mayHaveSideEffects(wrapped.writtenElement)
            ? wrapped.writtenElement : wrapped.element);
        const value = buildValue({
          kind,
          entry,
          hintName,
          receiverNode: declReceiver,
          prop: valueProp,
          nested: !deepReceiver && chain.length > 0, chainKeys, metaPath,
          // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
          // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
          literalRoute: kind === 'instance' && (!!sharedElementMemo
            // a SOLE consuming prop reads the element exactly once - inside its own dispatch -
            // so an effect-FREE element may be spelled there whatever its shape (`[arr?.inner]`
            // is one read either way, which is what native performs)
            || (patternBindingCount(prop.value) === patternBindingCount(hostPatternPath.node)
              && !mayHaveSideEffects(wrapped.element))
            || isConstantLiteralReceiver(peelWrappers(declReceiver))
            || (isReReferenceableReceiver(declReceiver)
              && !(peelWrappers(declReceiver)?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(peelWrappers(declReceiver).name)))
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
    }
    // a receiver-bearing DEFAULT one level in (`{ inner: { at } = [1, 2] } = {}`): the climb sees
    // THROUGH the AssignmentPattern and lands the claim on the outer host, but the swap belongs to
    // the default - the same simple synth the parameter form takes, whatever that outer host is
    // (a declarator, an assignment, a catch param: it decides where the residual lives, not
    // whether the default is live - `handleParamHost`'s own rule for the shape one level up).
    // ... but a DEAD default declines (`innerDefaultDeadOnTypedOuter` - the one rule both
    // inner-default spellings ask)
    if (chain.length > 0 && !receiverSeOnly && patternPath?.parentPath?.node?.type === 'AssignmentPattern'
      && patternPath.parentPath.node.left === patternPath.node
      && !innerDefaultDeadOnTypedOuter({ assignmentPattern: patternPath.parentPath, declaratorPath: hostParent, metaPath })
      && registerSimpleSynthSlot({
        metaPath,
        pattern,
        hostParent: patternPath.parentPath,
        kind,
        entry,
        hintName,
      })) return;
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
      || (kind === 'instance' && entry !== 'get-iterator-method' && !!literalReceiver
        && (forInit || !(soleBinding
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
          memo = branchingReceiver
            ? { ident: identifier(''), node: literalReceiver, deferred: true }
            : { refName: mintRefName(), node: literalReceiver };
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
    const defaultedIdent = prop.value.type === 'AssignmentPattern' && chain.length === 0
      && (prop.value.left?.type === 'Identifier'
        || (prop.value.left?.type === 'ObjectPattern' && entry === 'get-iterator-method'))
      && (kind === 'instance' || kind === 'static');
    if (forInit) return 'handled';
    if (chain.length > 0 && kind === 'instance' && peelWrappers(declarator.init)?.type !== 'ConditionalExpression'
      && peelWrappers(declarator.init)?.type !== 'LogicalExpression') return 'handled';
    // a value-SELECTING init (a conditional / logical) is the per-branch mirror's shape:
    // an unconditional extraction here would erase the other branch's semantics - EXCEPT
    // a fallback logical whose LEFT detection statically selected (the meta's object
    // resolved through it): the plain-ctor extraction stands and the dead right drops
    // with the residual (`{ from } = Array || Iterator` -> `const from = _Array$from`).
    // ordered AHEAD of the AssignmentPattern bail: a DEFAULTED leaf under a selection
    // belongs to the mirror / the statically-selected extraction exactly like its
    // undefaulted twin - the flat bail left the claim unrendered
    const selecting = peelWrappers(declarator.init);
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
    let initValue = peelWrappers(initNode ?? host.declarator.init);
    // an SE SEQUENCE init lifts its prefix as block statements; only the TAIL is the
    // receiver and must be quiet (`(eff('a'), globalThis)` -> `eff('a'); var from = ...`)
    let seqPrefix = null;
    if (initValue?.type === 'SequenceExpression') {
      seqPrefix = initValue.expressions.slice(0, -1);
      initValue = peelWrappers(initValue.expressions.at(-1));
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
    const memoBoundsInit = kind === 'instance' && !chain.length && !soleConsume;
    const nestedReceiver = kind === 'instance' && chain.length
      ? resolveNestedReceiverNode(metaPath) : null;
    if (kind === 'instance' && chain.length && !isReReferenceableReceiver(nestedReceiver)) return;
    // a resolved ELEMENT living inside the init memoizes when a residual survives: the memo
    // holds the element, the kept init reads the ref in its slot, and the dispatch shares
    // the identity (`{ a, y: { flat: m } } = { a: se(), y: [3, [1, 2]] }` -> the block memo)
    const nestedMemoNode = nestedReceiver && nodeHoldsSubtree(initValue, nestedReceiver)
      && !mayHaveSideEffects(nestedReceiver) ? nestedReceiver : null;
    if ((prop.value.type !== 'Identifier' && !defaulted)
      || (mayHaveSideEffects(initValue) && !initEvaluatesOnce && !memoBoundsInit && !nestedMemoNode)) return;
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
    const needsMemo = kind === 'instance' && !reusableInit && !soleConsume
            && (!nestedReceiver || !!nestedMemoNode);
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
          : needsMemo
            ? ref => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)), [identifier(ref)]), defaultNode, guardRef)
            : () => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)), [cloneNode(dispatchReceiver)]), defaultNode, guardRef),
      },
    });
  }

  // eslint-disable-next-line max-statements -- per-form host dispatch sequence
  function handleDeclaratorHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    // a pattern a per-branch mirror already owns is spelled whole by its literal - an extraction
    // here would bind the same leaf a second time and lift the branch as a bare statement
    const host = classifyDeclarationHost(hostParent);
    if (!host || chain.some(level => branchMirrorPatterns.has(level.outerPattern))) return;
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
      && peelWrappers(declarator.init)?.type !== 'Identifier') return;
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
    const pureNav = (forInit || seLiftedHopNav({ forInit, chain, declarator, prop })
      ? isPureNavAfterSePrefix(declarator.init) : isPureNavReceiver(declarator.init))
      || allProxyInit;
    const literalRoute = planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav });
    const { soleBinding, relaxedReceiver } = literalRoute;
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
    // the TYPED single hop (the receiver's own type dispatches the outer key as an instance
    // method) composes the two-step extraction: hop dispatch feeds the leaf dispatch, the
    // inner default folding through the canonical guard - it needs no literal receiver, so
    // it rides PAST the nested-instance decline below. this is what retires the dead-mirror
    // suppression for the sole-leaf shape; the babel leg composes the same steps natively
    const innerDefault = chain.length === 1 && metaPath.parentPath?.parentPath?.node?.type === 'AssignmentPattern'
      && metaPath.parentPath.parentPath.node.left === metaPath.parentPath.node
      ? metaPath.parentPath.parentPath : null;
    const typedHopPure = innerDefault && kind === 'instance' && entry !== 'get-iterator-method'
      ? innerDefaultDeadOnTypedOuter({ assignmentPattern: innerDefault, declaratorPath: hostParent, metaPath }) : null;
    // a sentinel KEEPS the declarator (and its init) alive, so the discard-safety proof is
    // not needed there; the instance value builder still bounds receiver reads on its own
    if ((chain.length > 0 && (kind === 'instance' && entry !== 'get-iterator-method' && !literalReceiver && !typedHopPure
      // an ANCHORED symbol prop keeps its key-swap instead of extracting when the extraction
      // would change what the slot answers: a DEFAULT fires on the raw read's undefined, which
      // the helper result need not be, and an SE KEY has no slot outside the kept key
      // ... and a SIBLING hop makes the host an anchored residual of its own: the symbol prop
      // rides it re-keyed rather than leaving (`{ Map: { [S]: a }, Object: { fromEntries } }`)
      || (entry === 'get-iterator-method'
        && (prop.value.type === 'AssignmentPattern' || computedKeyHasSideEffects(prop)
          || declarator.id?.properties?.length > 1))))
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
    if (!sentinel && !literalReceiver && !pureNav
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
      // ... and an ALL-PROXY SELECTING init is re-readable the same way a bare proxy root is:
      // every branch names the same surface, so the sibling needs no kept key
      symbolPatternResidual: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern'
        && pattern.properties.length > 1 && !allProxyInit
        && !findProxyGlobal(declarator.init, { scope: metaPath.scope, adapter, path: metaPath }),
      allProxyInit,
    });
    if (!literalPlan) return;
    let { keepKey, memoRecv, siblingAppend } = literalPlan;
    memoRecv ??= planNavReceiverMemo({ pureNav, sentinel, forInit, exported, chain, kind, entry, declarator, pattern });
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
    const catchBorn = !!relocatedCatchPattern(hostParent);
    const chainKeys = hopChainKeys(chain);
    let value = buildValue({
      kind,
      entry,
      hintName,
      receiverNode: memoRecv ? (memoRecv.ident ?? identifier(memoRecv.refName))
        : literalReceiver ?? (allProxyInit ? firstProxyBranch(declarator.init) : declarator.init), prop,
      typedHop: typedHopPure ? { pure: typedHopPure, defaultNode: innerDefault.node.right } : null,
      nested: (!literalReceiver || !!typedHopPure) && chain.length > 0, chainKeys, metaPath,
      literalRoute: (!!literalReceiver && !memoRecv) || sentinelMemoEligible,
      liveReceiver: memoRecv || literalReceiver || allProxyInit ? null : () => declarator.init,
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
        sinkPlan: forInit && peelWrappers(peelWrappers(declarator.init)?.object)?.type === 'MemberExpression'
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
        seLifted: seLiftedHopNav({ forInit, chain, declarator, prop }),
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
  function elementMemoFor(element) {
    let memo = literalMemoNames.get(element);
    if (!memo) {
      memo = { ident: identifier(''), node: element, deferred: true };
      literalMemoNames.set(element, memo);
    }
    return memo;
  }

  // a MULTI-prop pattern whose receiver an extraction actually reads hoists the collapsed
  // nav once (`const _ref = _globalThis.Array; const it = _gim(_ref); ...` - babel's
  // shape); a single prop reads the collapsed spelling inline, and a pure-ctor leaf
  // (`_Promise`) stays reusable inline too
  function planNavReceiverMemo({ pureNav, sentinel, forInit, chain, kind, entry, declarator, pattern }) {
    // an EXPORTED host is no obstacle: the memo lands as its own plain declaration ahead of
    // the extractions, which keep the export wrapper each
    if (!pureNav || sentinel || forInit || chain.length !== 0) return null;
    if (kind !== 'instance' && entry !== 'get-iterator-method') return null;
    if (peelWrappers(declarator.init)?.type !== 'MemberExpression' || pattern.properties.length <= 1) return null;
    if ((resolveProxyNavReceiver(peelWrappers(declarator.init))?.() ?? declarator.init)?.type !== 'MemberExpression') return null;
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
    // only a statement-position assignment whose value nobody reads: a captured result
    // (`x = ({ from } = Array)`) keeps the full object flowing - staged. oxc preserves the
    // grouping parens the spelling requires, so the climb peels them
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && (exprStmtPath.node?.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(exprStmtPath.node?.type))) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    // ... but a SHORTHAND flat prop keeps the whole destructure: the binding it writes is the
    // key's own name, and babel leaves that line spelled as the source wrote it
    const seqHostStatement = exprStmtPath?.node?.type !== 'ExpressionStatement'
            && (chain.length > 0 || !prop.shorthand) && discardedSequenceElement(hostParent)
            ? hostStatementOf(hostParent) : null;
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
      && SELECTING_INIT_TYPES.has(peelWrappers(hostParent.node.right)?.type)
      && !allProxySelectingInit(hostParent.node.right, { adapter, injectorState })) {
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
      const copyReceiver = bindingId && resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true });
      if (copyReceiver && isReReferenceableReceiver(copyReceiver)) {
        const id = injectPureImport(entry, hintName);
        markRewrite();
        recordJob({ hostPath: exprStmtPath,
          job: { host: 'assign-overwrite', local: bindingId.name, bodyless,
            value: () => callExpression(identifier(id), [duplicateReceiver(copyReceiver, injector)]) } });
        return;
      }
      if (bodyless) return;
    }
    // an opaque receiver still consumes when the extraction is its ONLY read: a sole
    // plain prop, instance kind (the dispatch reads once - `mapOfKept = _mapMaybeArray(X ?? {})`)
    // or an SE-free receiver a static may discard
    // an ALL-proxy selecting RHS reads like a plain proxy receiver: every LIVE branch lands
    // on the same surface, so the claim extracts off the first and the selection drops whole
    const allProxyRhs = allProxySelectingInit(hostParent.node.right, { adapter, injectorState });
    const pureNavRhs = allProxyRhs || isPureNavReceiver(hostParent.node.right);
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
    const liftPlan = pureNavRhs ? null : planLiftedRhsPrefix(hostParent.node.right,
      { anchorsInSequence: !!seqHostStatement && prop.value?.type === 'ObjectPattern' });
    if (liftPlan) {
      bodylessSeqPrefix = liftPlan.prefix;
      receiverNode = liftPlan.receiver;
    }
    // an SE-carrying NAV receiver (`({ from: from2 } = (eff3(), globalThis).Array)`): a
    // SOLE full consume lifts the receiver WHOLE as its own statement - claims land in
    // place, the assign reads the pure (`(eff3(), _globalThis).Array; from2 =
    // _Array$from;`, babel's flatten); multi-prop and residual shapes stay staged
    if (!pureNavRhs && !bodylessSeqPrefix && !sentinel
      && pattern.properties.length === 1 && prop.value.type === 'Identifier' && kind !== 'instance'
      && classifyCallBranchForSynth({
        inner: peelWrappers(hostParent.node.right), scope: metaPath.scope, adapter, path: metaPath,
      }).callBranch) {
      bodylessSeqPrefix = [hostParent.node.right];
    }
    const soleConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length === 1 && prop.value.type === 'Identifier'
            && (kind === 'instance' || !mayHaveSideEffects(hostParent.node.right));
    // a MULTI-prop instance consume rides the same literal route: several dispatches
    // (and any surviving residual) read ONE receiver, which the drain memoizes
    // (`({ at, includes } = [1, 2, 3])` -> `const _ref = [1, 2, 3]; at = _atMaybeArray(_ref); ...`)
    const multiInstanceConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length > 1 && prop.value.type === 'Identifier' && kind === 'instance'
            && !bodyless;
    // an SE-keyed INSTANCE prop over a CONSTANT literal keeps its raw residual (the key
    // effect runs in place) and the overwrite re-spells the literal
    // (`a = _atMaybeArray([3, [7]])` - no memo)
    const seKeyLiteralOverwrite = !pureNavRhs && !bodylessSeqPrefix && sentinel && chain.length === 0
            && kind === 'instance' && prop.value.type === 'Identifier'
            && prop.computed && computedKeyHasSideEffects(prop)
            && isConstantLiteralReceiver(peelWrappers(hostParent.node.right));
    // a receiverless STATIC in a MULTI-prop consume rides along: the memo (or the kept
    // RHS statement) evaluates the init, and the static spells its own pure
    // (`({ of, name, from } = seCall())` -> `of = _Array$of; name = _name(_ref); ...`)
    const staticInMultiConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length > 1 && prop.value.type === 'Identifier' && kind !== 'instance'
            && !bodyless && !seqHostStatement;
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
    const sentinelGuardedRhs = !pureNavRhs && sentinel && chain.length === 0 && kind !== 'instance'
            && prop.value.type === 'Identifier'
            && (!!initProbePlan
              || !!planSealedNavProbe(hostParent.node.right, metaPath, probeRenderCtx));
    const nestedLiteralConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
      && kind !== 'instance' && prop.value.type === 'Identifier'
      && pattern.properties.length === 1 && !mayHaveSideEffects(hostParent.node.right)
      && !!resolveNestedReceiverNode(metaPath, {});
    // ... and a DEFAULTED nested leaf over an OPAQUE receiver has no slot for its default: the
    // overwrite spells the dispatch alone, and one answering undefined would skip the default the
    // source wrote (`({ codes: { findIndex: m = d() } } = recvF)` stays native)
    if ((!pureNavRhs && !soleConsume && !multiInstanceConsume && !seKeyLiteralOverwrite
      && !staticInMultiConsume
      && !bodylessSeqPrefix && !nestedLiteralConsume && !guardedPureRhs && !sentinelGuardedRhs)
      || (chain.length > 0 && prop.value.type === 'AssignmentPattern' && !nestedLiteralConsume
        && !resolveProxyNavReceiver(peelWrappers(receiverNode)))) return;
    const chainKeys = hopChainKeys(chain);
    const value = buildValue({
      kind, entry, hintName, receiverNode, prop, nested: chain.length > 0, chainKeys, metaPath,
      literalRoute: soleConsume || multiInstanceConsume || seKeyLiteralOverwrite,
      liveReceiver: receiverNode === hostParent.node.right ? () => hostParent.node.right : null,
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
      && peelWrappers(hostParent.node.right)?.type === 'MemberExpression') return;
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
      rawKeyRootInit: initRawKeyOnRoot(hostParent.node.right),
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
  function resolveProxyNavReceiver(receiver) {
    let keys = [];
    let cur = receiver;
    while (cur?.type === 'MemberExpression' && !cur.optional && plainNavHopKey(cur) !== null) {
      keys.unshift(plainNavHopKey(cur));
      cur = peelWrappers(cur.object);
    }
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
    extractCatchClause,
    handleObjectPropertyResult,
    handlePerBranch,
    drain,
    sentinelAlreadyProcessed: args => sentinelAlreadyProcessed({ ...args, injectorState }),
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
      const init = host?.node?.type === 'VariableDeclarator' ? peelWrappers(host.node.init) : null;
      if (init?.type !== 'CallExpression' || init.optional) return false;
      const returned = inlineCallReturnExpression({
        callNode: init, scope: metaPath.scope, adapter, seen: new Set(), path: metaPath, rejectConditional: true,
      });
      // ... and only where the yielded value carries an EFFECT the extraction would drop: the
      // call evaluation runs its argument, and the harvest has no channel for argument effects.
      // a quiet identity call discards cleanly and keeps the ordinary extraction
      let value = returned && peelWrappers(returned);
      let effectful = false;
      while (value?.type === 'SequenceExpression') {
        effectful ||= value.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr));
        value = peelWrappers(value.expressions.at(-1));
      }
      return effectful && value?.type === 'Identifier' && isPristineProxyGlobal(adapter, value.name);
    },
    // an ARRAY-WRAPPED pattern resolves no receiver of its own in the meta funnel - the
    // element is positional, so a SELECTING one never reaches the mirror through the meta's
    // fallback flag. the host shape answers instead (`[{ Array: { from } }] = [c ? gw : o]`)
    arrayWrappedSelectingHost(metaPath) {
      if (metaPath.parentPath?.node?.type !== 'ObjectPattern') return false;
      const element = peelWrappers(resolveArrayWrappedReceiver(metaPath.parentPath)?.element);
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
