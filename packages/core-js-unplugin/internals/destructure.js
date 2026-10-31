import {
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  buildParameterArgumentSynthPlan,
  buildPatternRenderPlan,
  carriedInitReceiverNode,
  classifyCallBranchForSynth,
  visitFallbackSynthBranches,
  destructureAssignmentValueIsCaptured,
  receiverPerformsEveryInitEffect,
  destructureKeyReadPlan,
  destructurePatternHostPath,
  destructureRetainsLiteralWrapper,
  liftedPrefixSplit,
  flattenArrayWrapperInits,
  isInstanceSurfaceNav,
  isReReferenceableAcrossReads,
  isReReferenceableReceiver,
  patternComputedKeysSynthSafe,
  planSideEffectKeyStrategy,
  qualifiesForParamBodyExtract,
  planParameterInstanceExtraction,
  renderSynthTree,
  resolveNestedNavDispatch,
  proxyNavHead,
  seKeyStaticOwesTheMirror,
  resolveNestedReceiverNode,
  patternClaimOwesMirror,
  resolvePassthroughRef,
  staticHopPure as sharedStaticHopPure,
  synthPropDedupKey,
  typedNavClaimChain,
  computedRootMemoChain,
  provenRealmCallRoot,
  discardRescueNodesWithReads,
  initRunsCode,
  nearestInnerDefaultDead,
  observablePrefixElements,
  decidedRunningOperand,
  decidedRunningOperandPath,
  overwriteMemberTarget,
  pruneHopFromLevels,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  bodylessSlotReplacement,
  capturedLeafCtorAlias,
  capturedRealmCtorPure,
  planNestedKeyedPatternCapture,
  planRetainedObjectCapture,
  keyedReadEvaluation,
  renderRetainedObjectCapture,
  renderNestedKeyedPatternCapture,
  renderArrayWrapperCapture,
  renderArrayDestructurePlan,
} from '@core-js/polyfill-provider/destructure-host-shape';
import {
  chainThroughNamedDefaults,
  discardedReceiverEffects,
  destructureDefaultCarriesReceiver,
  shouldMirrorNestedDestructureDefault,
  planNestedDefaultHop,
  planAssignmentOverwrite,
  planLiteralResidual,
  planLiteralRoute,
  planInitializerNavigation,
  synthPlanFullyCovered,
  planSynthReceiverActivation,
  buildNestedDestructurePlan,
  destructureReadKeepsKey,
  hopPatternLeafClaims,
  isSymbolIteratorPatternClaim,
  symbolIteratorMemberTarget,
  leafCarriesOwnClaim,
  planNestedLeafTwin,
  resolvePolyfillableStaticProp,
  symbolIteratorInstanceLeaf,
} from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { registerDeclAliasIfSound } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  decidedRunningPart,
  discardRescueNodes,
  findProxyGlobal,
  inlineCallReturnExpression,
  isKnownStaticGlobal,
  peelChainRootValue,
  peelReceiverSequenceTail,
  isPureNavReceiver,
  navHopChain,
  peelDeadChainMarker,
  realmSelectingHostCollapses,
  realmProbeArmSelection,
  realmSelectionCollapseOperand,
  resolveSynthKeys,
  memberTargetTakesExtraction,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  assignmentInStatementPosition,
  assignmentValueDiscarded,
  climbTransparentWrapperPath,
  computedKeyHasSideEffects,
  findNodeSlot,
  forOfHeadIterableElements,
  hasRestSiblingExcept,
  hostsExportList,
  isForXStatement,
  isPristineProxyGlobal,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  paramsHaveInvisibleCallers,
  patternBindingCount,
  patternSlotTarget,
  patternMemberTargetPairs,
  soleChainToProp,
  isChainAssignment,
  isBodylessStatementSlot,
  peelFallbackBranchInner,
  peelTransparentExpr,
  peelParenAndTSParentPath,
  peelToExpressionStatement,
  peelNestedSequenceExpressions,
  POSSIBLE_GLOBAL_OBJECTS,
  prologueEndIndex,
  propBindingIdentifier,
  relocatedCatchPropUnobservable,
  relocatedHostFoldsGuardRefs,
  resolveFallbackReceiver,
  statementListOf,
  unwrapInitValue,
  unwrapParens,
  walkPatternIdentifiers,
  walkAstNodes,
  discardedSequenceElement,
  allProxySelectingInit,
  firstProxyBranch,
  invocationNode,
  isDeclaratorSelfViolation,
  noteRenderRetiredWrites,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { detectIifeArgReceiverPath, findSynthSwapReceiver } from './destructure-emit-utils.js';
import { nodeSite, stampNodeSite } from './nav-spine.js';
import { replaceNodeInTree } from './emit-shared.js';
import {
  assignmentExpression,
  blockStatement,
  conditionalExpression,
  expressionStatement,
  memberFromKeyName,
  nullGuardTest,
  callExpression,
  renderDestructureDispatch,
  cloneNode,
  identifier,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
  renderParameterInstanceCapture,
  renderNestedExtractionReceiver,
  renderAssignmentOverwrite,
  renderDestructureStatements,
  exportDeclaration,
} from '@core-js/polyfill-provider/render';
import {
  absentableStoreReadKeyOf,
  anchorLeadingStatement,
  arrayWrapperDeclarator,
  buildInstanceDefaultGuard,
  bareProxyGlobalPure,
  classifyDeclarationHost,
  climbPatternChain,
  defaultedSoleConsumes,
  divergingSelection,
  divergingSentinelSelectorDeclines,
  duplicateReceiver,
  eagerSentinelMemoName,
  emitAssignStaticDefaultOverwrite,
  guardedSlotValue,
  hasRestSibling,
  hopChainKeys,
  hostStatementOf,
  initRawKeyOnRoot,
  isPlainConsumableProp,
  isPureNavAfterSePrefix,
  markMemoDeclarators,
  navSpineHasComputedKeyEffect,
  nodeHoldsSubtree,
  overwriteRebindEmitted,
  planDiscardedInitProbe,
  captureProbePlan,
  planLiftedRhsPrefix,
  planSealedNavProbe,
  captureSealedNavProbe,
  propLocalName,
  proxyNavSynthBase,
  registerAssignmentExtractAlias,
  registerHopInstanceSynthSlot,
  registerInstanceSynthSlot,
  routeSelectionMirror,
  SELECTING_INIT_TYPES,
  hopDefaultCarriesEffect,
  nestedLeafSelectingReceiver,
  nestedInstanceWithoutSelectingInit,
  staticallySelectedLeft,
  warnConditionalFallbackUntouched,
} from './destructure-helpers.js';
import { sentinelAlreadyProcessed } from '@core-js/polyfill-provider/detect-usage/own-output';
import { planGuardedStaticNarrow } from '@core-js/polyfill-provider/detect-usage/members';
import createDestructureDrains from './destructure-drain.js';

// an assignment-position sentinel writes an undeclared name: the drain plants its `var _unusedN;`
// immediately before the rewritten statement, babel's shape - so every job an ASSIGNMENT host
// records mints through this, whichever drain empties a slot beside its rest. a FOR sink keeps the
// assignment inside the for-init, so no sentinel `var` fits beside it: the declaration hoists with
// the refs, claimed where the walk is so it declares in the order babel pushed it
function attachAssignmentSentinelMinter(job, { seqHostStatement, metaPath, injector, mintUnusedName }) {
  job.mintedSentinels = [];
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
}

// eslint-disable-next-line max-statements -- per-transform ledgers and the binding channels sharing them
export default function createAstDestructureEmitter({
  adapter,
  injector,
  injectorState,
  injectPureImport,
  markRewrite,
  skippedNodes,
  markSubtreeSkipped,
  claimLive,
  program,
  resolvePure,
  resolveGlobalPolyfill,
  mintUnusedName,
  mintRefName,
  paramDefaultNeverOverridden = null,
  parameterCallSites = null,
  resolveStaticKey = null,
  resolveNodeType = null,
  resolvePropertyObjectType = null,
  primeDestructureReceiverTypes = null,
  resolveForOfResolvedElement = null,
  resolvedType = null,
  toHint = null,
  isDisabled = null,
  getDebugOutput = null,
}) {
  // hostNode (VariableDeclaration | ExpressionStatement) -> { hostPath, jobs }
  const ledger = new Map();
  const pendingSplits = new Map();
  // the per-function insertion cursor keeping consecutive body-extracts in SOURCE order
  const bodyExtractInsertAt = new Map();
  // literal-route receiver memo names, shared per receiver NODE across that receiver's leaves
  const literalMemoNames = new Map();

  const capturedSiblingHosts = new WeakSet();
  // the jobs whose consumed prop a nested leaf's twin left out of its pattern: they bind it off their own
  // extraction, and a host rewrite after the twin leaves them nowhere to drain unless it hands them a declarator
  const twinDroppedJobs = new WeakSet();
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
  // the root a pure nav re-spells stays the source's one object only where no getter can rebind it
  function navRootReReadable(init, metaPath) {
    const { root } = navHopChain(peelReceiverSequenceTail(peelTransparentExpr(init)));
    return root?.type !== 'Identifier' || isReReferenceableAcrossReads(root, { scope: metaPath.scope, adapter, path: metaPath });
  }
  // the guard canon's context, per claim path: `resolvePure` in its PROVIDER shape (one argument),
  // and the alias context every undefinable-value walk reads
  function navGuardCtx(metaPath) {
    return {
      resolvePure: m => resolvePure(m, metaPath),
      aliasCtx: metaPath?.scope ? { scope: metaPath.scope, adapter, path: metaPath } : null,
    };
  }

  // the receiver a value-SELECTING init binds a FLATTEN to, or null where the selection has a branch
  // the flatten may not speak for. two questions, one answer: the surface question names the branch
  // every live one lands on, and the realm answer speaks for a selection whose first branch can only
  // VANISH - the surface question refuses that one, yet `globalThis.window ?? globalThis` reads the
  // realm off-window and on it alike, so the collapse binds the operand that proves it, never the
  // probe `firstProxyBranch` would pick. the mirror-or-flatten gates read it as a boolean
  // `site` is the path the init READS at: it carries the scope both questions owe, so a proxy-global
  // spelling that binds there (`function f(self)`) answers as the user's object it is
  function selectingInitSurface(node, site = null) {
    const ctx = { adapter, injectorState, scope: site?.scope ?? null, path: site };
    // ... never through a sequence prefix that still runs something: the flatten discards the init
    if (site && observablePrefixElements(peelNestedSequenceExpressions(peelTransparentExpr(node)).prefix,
      { scope: site.scope, adapter, path: site }).length) return null;
    return allProxySelectingInit(node, ctx) ? firstProxyBranch(node) : realmSelectionCollapseOperand(node, ctx);
  }

  const instanceSynthCtx = { adapter, resolvePure, injectPureImport, skippedNodes, resolveNodeType, toHint };
  const defaultCtx = {
    adapter, resolvePure, resolveNodeType, toHint,
    hasSubstitutedConstructor: name => !!injectorState?.getBindingInfo?.(name),
  };
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
  // the probe holder may be a kept STORE the source wrote, and its cloned value still owes the
  // root substitution every probe clone owes - the channel render joins after this object exists
  const probeRenderCtx = {
    adapter,
    injector,
    resolvePure,
    resolveGlobalPolyfill,
    injectPureImport,
    claimLive,
  };

  // the drain half rides the same per-transform state; `resolveProxyNavReceiver` is hoisted,
  // so handing it across at creation time is safe
  const { buildValue, drain, extractCatchClause, extractLoopLeft, planMemoArg, recordJob: recordPristineJob } = createDestructureDrains({
    adapter,
    capturedSiblingHosts,
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
    pendingSplits,
    probeRenderCtx,
    registerDeclaratorBindings,
    program,
    resolveGlobalPolyfill,
    resolvePropertyObjectType,
    primeDestructureReceiverTypes,
    resolveForOfResolvedElement,
    resolveProxyNavReceiver: (...args) => resolveProxyNavReceiver(...args),
    resolvePure,
    resolvedType,
    toHint,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
  });

  // Record every pristine host fact before live child claims can replace the initializer.
  // A receiver dispatch keeps its own init live; only a discarded value needs a captured probe.
  function recordJob(options) {
    recordPristineJob(options);
    const { job } = options;
    if (job.kind !== 'instance' && !job.readsReceiver) {
      job.initProbePlan = captureProbePlan(job.initProbePlan, job.metaPath, probeRenderCtx);
    }
    job.sealedProbePlan = captureProbePlan(job.sealedProbePlan, job.metaPath, probeRenderCtx);
  }

  // Render the shared receiver-mirror plan, or its caller-argument variant, into live source slots.
  // Keep preserved receiver/probe nodes live and retire only completed claims. With `argumentSites`,
  // return whether every caller settles the inner default arm; otherwise return the application
  // result: true where the plan rendered or its bail ends the dispatch, false where no plan stands.
  function renderNestedParamSynth({
    metaPath,
    meta,
    withinNode = null,
    argumentSites = null,
    fallbackOnBail = false,
    allowFlatInstanceDefault = false,
    deferredOnly = false,
  }) {
    const leafPattern = metaPath.parentPath;
    if (!argumentSites && synthDone.has(leafPattern.node)) return true;
    const options = {
      leafPatternPath: leafPattern,
      meta,
      resolvePure: (m, at = metaPath) => resolvePure(m, at),
      adapter,
      parameterCallSites: argumentSites,
      isDisabledProp: isDisabled,
      allowFlatInstanceDefault,
    };
    const plan = argumentSites ? buildParameterArgumentSynthPlan(options) : buildNestedParamSynthPlan(options);
    if (deferredOnly && !plan?.targets?.some(target => target.localMemo)) return false;
    const applied = applyNestedParamSynthPlan({
      plan,
      fallbackOnBail,
      // Caller-argument mirrors own their memo in the caller's evaluation frame.
      mintMemoRef: target => target.localMemo ? mintRefName()
        : injector.generateDeclaredRef(target.host ?? plan.host ?? metaPath),
      renderTree: (tree, recv) => renderSynthTree(tree, {
        injectImport: injectPureImport,
        ...recv,
        resolveGlobalPolyfill,
        adapter,
        // a BAILED passthrough - a polyfillable static the plan kept RAW (a member target) - is a
        // read the later claims must leave alone: resolved, it would install the ponyfill into
        // the user's object, exactly what the bail refused. the babel leg seeds the same skip
        renderPassthrough(node, passthrough) {
          if (passthrough.bailed) markSubtreeSkipped(skippedNodes, node);
          return node;
        },
      }),
      replaceTarget: (targetNode, rendered, target) => {
        // ... and never OUTSIDE the host the caller owns: a receiver reached through an alias
        // binding belongs to that binding's own declaration, and swapping a literal in there
        // rewrites what every other reader sees (`const w3 = [globalThis]` stays)
        if (withinNode && !nodeHoldsSubtree(withinNode, targetNode)) return false;
        // the PROBE arm's re-spelling: the selection becomes a null test on the probe's own read, so
        // the fallback still runs where the source ran it while the realm arm carries the literal
        // ... and a KEPT PREFIX stands ahead of the literal that takes its place, so the element runs
        // where the source wrote it and only its value is dropped. a COPY, so the replacement does not
        // contain the node it replaces, and so the walk still owes the reads inside it
        const value = target?.nullTestOn
          ? conditionalExpression(nullGuardTest(target.nullTestOn), target.keepArm, rendered)
          : rendered;
        if (!replaceNodeInTree(program, targetNode, value)) return false;
        markRewrite();
        return true;
      },
      skipSubtree: targetNode => markSubtreeSkipped(skippedNodes, targetNode),
      claimStaticBindings(bindings) {
        for (const [property, entry] of bindings) {
          const name = propBindingIdentifier(property.value)?.name;
          if (name) injectorState.registerBodyExtractAlias(name, entry, metaPath.scope.getBinding(name));
        }
      },
      claimProperties(properties, alwaysDefined = true) {
        for (const property of properties) {
          skippedNodes.add(property);
          if (alwaysDefined && property.value?.type === 'AssignmentPattern') {
            markSubtreeSkipped(skippedNodes, property.value.right);
          }
        }
      },
    });
    // ... a BAIL answered "stays native" for this claim alone: only a rendered mirror serves the
    // leaf's other claims, so only that one closes the leaf to them
    if (applied && !argumentSites && !plan?.bail) synthDone.add(leafPattern.node);
    // the caller mirror answers a different question than the host's: not "did a mirror render" but
    // "is the leaf's inner default arm closed for every caller" (the plan's `settled`) - a rendered
    // argument beside an open default still leaves the parameter's own rewrite to run
    // ... and otherwise the application verdict alone, as on the other leg: a caller telling a declined
    // plan from a bail asks again without the fallback, where a bail answers true
    if (argumentSites) return !!plan?.settled;
    return applied;
  }

  // Ask the shared mirror obligation before competing extraction routes, provided this host
  // has no queued job already owning it. Declaration, assignment and loop receivers may qualify.
  function tryPatternMirror({ metaPath, meta }) {
    // A queued extraction still reads this receiver at drain time. Leave its host to
    // the ordinary flatten so a later mirror cannot change that earlier read.
    const host = destructurePatternHostPath(metaPath);
    if (queuedJobsFor(host)?.jobs.some(job => host.node.type !== 'VariableDeclarator'
      || job.declarator === host.node)) return false;
    const pure = resolvePure(meta, metaPath);
    if (!patternClaimOwesMirror(pure?.kind, metaPath)) return false;
    // Sibling instance claims describe the source receiver, before its mirrored branch moves.
    if (meta.fromFallback) primeDestructureReceiverTypes?.(metaPath);
    // The array plan records the mirror before moving its neighbouring reads.
    if (meta.fromFallback && renderArrayFlattenPlan(metaPath)) return true;
    return renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true }) === true;
  }

  // one slot of the simple synth literal; the drain renders the whole pattern at once
  function registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName }) {
    // An instance slot renders `{ key: helper(receiver) }`, repeating the receiver per slot.
    // Stable bindings, literals and re-readable built-in surfaces can serve several slots;
    // an observable invocation or member read can serve only one.
    // the SYMBOL-ITERATOR triple is not a plain instance slot - its own routes own the
    // pattern, and a literal here would swap the receiver out from under them
    if (kind === 'instance') {
      // the slot's receiver is the param DEFAULT, or the IIFE ARGUMENT for a bare pattern -
      // both are the value the literal replaces, and both are read once per consuming slot
      // the canonical IIFE-arg detector answers for the bare pattern (it peels an SE tail, so
      // the prefix stays in place); the ctor-shaped `findSynthSwapReceiver` gate does not
      // apply - an instance slot dispatches on ANY value
      // ... a value the build decides offers the operand of it that runs, and a sequence its tail, the
      // prefix left where it runs (`decidedRunningOperandPath`) - by its PATH, peeled like the node: the type
      // resolver reads the receiver at its own position, and a cast (`= ([1, 2] as number[])`) is printer
      // trivia to the type the synth dispatches on
      const receiverPath = hostParent?.node?.type === 'AssignmentPattern'
        ? decidedRunningOperandPath(hostParent.get('right'), adapter)
        : detectIifeArgReceiverPath(hostParent, pattern, adapter);
      return registerInstanceSynthSlot({ metaPath, entry, hintName, synthLedger, ctx: instanceSynthCtx, receiverPath });
    }
    if (!isSynthSimpleObjectPattern(pattern)
      || !patternComputedKeysSynthSafe({ objectPatternNode: pattern, scope: metaPath.scope, adapter, path: metaPath })) return false;
    const receiver = findSynthSwapReceiver(hostParent, pattern, adapter, resolvePure);
    let baseIdent = receiver;
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
        { ...nodeSite(receiver, metaPath), adapter, resolveGlobalPolyfill });
    // a fallback LEFT takes the nav base only when it spells NO effect of its own: an
    // SE-bearing one routes through the callBranch memo, which owns the re-emission order
    if (navBase && !(receiver?.type === 'LogicalExpression' && navBase.leadingEffects)) {
      ({ baseIdent, passthroughPrefix } = navBase);
      baseIsProxy = true;
    } else if (!sePolicy.callBranch && receiver?.type === 'LogicalExpression') {
      // a fallback-shaped receiver (`(SE, Array) || Set`) collapses LEFT: the literal replaces
      // the whole logical, the left's sequence prefix re-runs ahead of it (its own claims stay
      // live), the dropped branch dies whole - a left the build decides by the part of it that runs
      let left = peelTransparentExpr(decidedRunningPart(receiver.left, { ...nodeSite(receiver, metaPath), adapter }));
      if (left?.type === 'SequenceExpression') {
        // The common activation harvests the live receiver's prefix after its claims land.
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
      // the canonical re-read target resolves on the PRISTINE tree - at drain time the
      // in-place claims would already have reshaped the spine
      memoArgPlan = planMemoArg(receiver.type === 'LogicalExpression' ? receiver.left : receiver, metaPath);
    } else if (baseIdent?.type !== 'Identifier' && baseIdent?.type !== 'ThisExpression'
      && !(baseIdent === receiver && receiver?.type === 'MemberExpression')
      // ... save a collapsed fallback's LEFT the receiver canon admitted (`findSynthSwapReceiver`: a member or
      // a quiet call), which the passthrough re-spells as the other leg's swap does (`passthroughBase`)
      && receiver?.type !== 'LogicalExpression') return false;
    const dedupKey = synthPropDedupKey(metaPath.node, { scope: metaPath.scope, path: metaPath, adapter });
    if (!dedupKey) return false;
    let pending = synthLedger.get(pattern);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
      if (!plan) return false;
      const activation = planSynthReceiverActivation({
        receiver, ...nodeSite(receiver, metaPath), adapter, resolvePure: meta => resolvePure(meta, metaPath),
      });
      pending = {
        plan, receiver, baseName: callBranch || baseIdent.type !== 'Identifier' ? null : baseIdent.name,
        passthroughBase: !callBranch && !baseIsProxy && receiver.type === 'LogicalExpression'
          && baseIdent.type !== 'Identifier' && baseIdent.type !== 'ThisExpression' ? baseIdent : null,
        baseIsProxy,
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
          && !synthPlanFullyCovered(plan, receiver, {
            contextFor: node => ({ ...nodeSite(node, metaPath), adapter }),
            resolvePure: meta => resolvePure(meta, metaPath),
          }) ? mintRefName() : null,
        memoArgPlan,
        ...activation,
        // ... and the SHAPE of the sealed read the swap erases, planned on the PRISTINE tree:
        // by drain time the walk has rendered that nav into its guard and the seal is gone
        sealedProbePlan: captureSealedNavProbe(receiver, metaPath, probeRenderCtx),
        metaPath,
        slots: new Map(),
      };
      synthLedger.set(pattern, pending);
    }
    const { synthGuard } = pending;
    // the replace target must not be swapped out from under the registration by the
    // ordinary arms (the drain would miss the detached node); a collapsed logical keeps its
    // SE prefix LIVE and kills only the tail ident and the dropped branch
    // the effects the drain's rescue will RE-EMIT stay claim-live inside a marked span:
    // their claims land in place and the drain harvest picks the rewritten spelling
    function markSkippedKeepingRescues(node) {
      for (const rescue of discardRescueNodes({ node, ...nodeSite(node, metaPath), adapter })) {
        skippedNodes.keepLive?.add(rescue);
      }
      if (synthGuard) skippedNodes.keepLive?.add(synthGuard.probe);
      markSubtreeSkipped(skippedNodes, node, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    }
    // The queued synth owns its guard. Let only the probe and child effects run;
    // a second navigation claim must not wrap this same receiver before the drain.
    if (synthGuard) markSkippedKeepingRescues(receiver);
    else if (callBranch) {
      if (receiver.type === 'LogicalExpression') markSubtreeSkipped(skippedNodes, receiver.right);
      // the top node must survive to the drain (a whole-member claim would detach it). a
      // canonically-planned tail is consumed whole; without a plan the inner nodes stay
      // live so the memo argument carries their in-place claims
      skippedNodes.add(receiver);
      if (memoArgPlan) markSkippedKeepingRescues(memoArgPlan.tail);
    } else if (receiver.type === 'LogicalExpression') {
      if (!synthGuard) markSubtreeSkipped(skippedNodes, receiver.right);
      // a NAV left dies whole with the swap - a tail-only skip would leave a dropped
      // sequence prefix's globals visible and leak a dead import
      if (baseIsProxy) markSkippedKeepingRescues(receiver.left);
      else skippedNodes.add(baseIdent);
    } else if (receiver.type === 'MemberExpression') {
      // a member the mirror passes through WHOLE keeps its inner claims live: the drain clones it
      // once they have landed (`[Iterator][0]` -> `[_Iterator][0].name`), only its top node survives
      if (baseIdent === receiver) skippedNodes.add(receiver);
      else markSkippedKeepingRescues(receiver);
    } else skippedNodes.add(receiver);
    pending.slots.set(dedupKey, injectPureImport(entry, hintName));
    return true;
  }

  // the per-branch mirror over a conditional / logical receiver: only a VIABLE branch (its
  // ctor carries a static polyfill for the key) becomes a literal; the rest keep their own
  // routing (the ctor identifier arm still swaps `Set` -> `_Set`). Nested patterns use the
  // complete shared mirror plan, with the original claim's source path and metadata.
  function handlePerBranch({ metaPath, meta = null, sourcePath = metaPath }) {
    const prop = metaPath.node;
    if (prop.type !== 'Property') return;
    if (destructureRetainsLiteralWrapper({ propPath: metaPath, kind: 'static', adapter })) return;
    const patternPath = metaPath.parentPath;
    const pattern = patternPath?.node;
    if (pattern?.type !== 'ObjectPattern') return;
    // the assignment's VALUE is the receiver itself: a branch swapped for a synth literal
    // would change what the expression yields, so a CONSUMED assignment declines the mirror
    // (`const host = ({ assign: a } = shim || Object)` keeps `Object`) - asked through the shared
    // host climb, so a wrapped pattern (`host = ([{ p }] = [sel])`) answers like the flat one
    if (destructureAssignmentValueIsCaptured(metaPath)) return;
    // an inline-array spread in the wrapper flattens first, the way the per-prop dispatch does
    flattenArrayWrapperInits(metaPath);
    // the receiver the pattern reads: its host's slot, the IIFE argument, or - under an ARRAY
    // WRAPPER - the element the host's literal pairs it with, the shared resolver's own climb
    const desc = resolveFallbackReceiver(patternPath.parentPath, pattern, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    if (!desc?.rhsNode) return;
    // the SECOND way a foreign-frame receiver enters the channel (the first is the arg detector):
    // the shared resolver hands back the call-ARG plus the site it evaluates at, so the subtree
    // takes its frame stamp here too - every branch question below then answers at the call site
    if (desc.callPath) stampNodeSite(desc.rhsNode, { scope: desc.callPath.scope, path: desc.callPath });
    // A nested mirror is planned as one source tree, including sibling hops and declined
    // reads. No per-property registration may assemble a different receiver at flush.
    if (patternSlotTarget(prop.value)?.type === 'ObjectPattern') {
      return renderNestedParamSynth({ metaPath: sourcePath, meta, fallbackOnBail: true });
    }
    if (!isSynthSimpleObjectPattern(pattern)
      || !patternComputedKeysSynthSafe({ objectPatternNode: pattern, scope: metaPath.scope, adapter, path: metaPath })) return;
    const { lookupKey } = resolveSynthKeys({ node: prop, scope: metaPath.scope, adapter, path: metaPath });
    const dedupKey = synthPropDedupKey(prop, { scope: metaPath.scope, path: metaPath, adapter });
    if (!lookupKey || !dedupKey) return;
    // the winning CALL-ARG leaves the wrapper-default live on its undefined-shaped arm -
    // thread the default so the leaf substitutes it there (the shared S081-1 rule)
    const wrapperNode = patternPath.parentPath?.node;
    const undefinedArmFallback = wrapperNode?.type === 'AssignmentPattern' && desc.rhsNode !== wrapperNode.right
      ? wrapperNode.right : null;
    if (!visitFallbackSynthBranches({
      branch: desc.rhsNode, key: lookupKey, undefinedArmFallback, adapter, resolvePure,
      readBranch: branch => ({ node: peelFallbackBranchInner(branch) }),
      childBranch: ({ node }, slot) => node[slot],
      contextFor: node => nodeSite(node, metaPath),
      register: leaf => registerBranchSynth({ ...leaf, dedupKey, pattern, metaPath }),
      ownsReceiver: ({ node }) => synthLedger.get(pattern)?.receiver === node,
      dropDeadRight({ node }) {
        markSubtreeSkipped(skippedNodes, node.right);
        if (replaceNodeInTree(program, node, node.left)) markRewrite();
      },
    })) return;
    // SERVED from the literal: the routes that would bind one of this pattern's names a second time
    // - the keyed capture, the param body-extract - ask the marker, and the caller reads the return
    // as "no left-untouched diagnostic owed". every DECLINE above leaves both falsy, and the nested
    // route returns the same success signal from the shared plan
    branchMirrorPatterns.add(pattern);
    return true;
  }

  // Native registration keeps the source children live for a call rescue and skips
  // a plain replacement whole. The shared walk has already chosen the leaf and route;
  // unresolved properties use the same provider literal renderer as every flat synth.
  function registerBranchSynth({
    source: { node: receiver }, pure, callBranch, rescueSe, dedupKey, pattern, metaPath,
  }) {
    let pending = pendingBranchSynths.get(receiver);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
      if (!plan) return false;
      pending = {
        plan,
        receiver,
        slots: new Map(),
        callBranch,
        rescueSe,
        metaPath,
        // Capture the source guard and sealed read before child claims rewrite either.
        ...planSynthReceiverActivation({
          receiver, ...nodeSite(receiver, metaPath), adapter, resolvePure: meta => resolvePure(meta, metaPath),
        }),
        sealedProbePlan: captureSealedNavProbe(receiver, metaPath, probeRenderCtx),
      };
      pendingBranchSynths.set(receiver, pending);
    }
    if (callBranch) skippedNodes.add(receiver);
    else markSubtreeSkipped(skippedNodes, receiver);
    pending.slots.set(dedupKey, injectPureImport(pure.entry, pure.hintName));
    return true;
  }

  // the shared static-hop question, asked with this leg's path-bound entry resolver
  function staticHopPure(ctorName, key, metaPath) {
    return sharedStaticHopPure({ ctorName, key, resolvePure: m => resolvePure(m, metaPath) });
  }

  // the value the outer key reads off, from whichever host spells it: a declarator's init and an
  // assignment's right are the same value, and the composition owes every host the same answer. a
  // host whose receiver is an ELEMENT hands that element in directly - the wrapper's own init is
  // the array AROUND it, and asking the outer key of that answers for the wrong surface
  function hostReceiverPath(host) {
    const type = host?.node?.type;
    if (type === 'VariableDeclarator') return host.get?.('init') ?? null;
    return type === 'AssignmentExpression' ? host.get?.('right') ?? null : null;
  }

  // Locate the current outer host only when the shared default decision needs its value.
  function defaultReceiverPath(defaultPath) {
    let host = defaultPath.parentPath;
    while (host?.node && host.node.type !== 'VariableDeclarator' && host.node.type !== 'AssignmentExpression'
      && host.node.type !== 'CatchClause' && host.node.type !== 'ForOfStatement'
      && host.node.type !== 'ForInStatement') host = host.parentPath;
    return hostReceiverPath(host);
  }

  // the ledger entry a destructure HOST's claims were queued under: the host hangs off its
  // declaration or its statement, and which of the two carries the entry is the host's shape - an
  // assignment's statement past whatever wrappers the source put around it (`(({ at } = box))`)
  function queuedJobsFor(hostPath) {
    return ledger.get(hostPath?.parentPath?.node) ?? ledger.get(hostPath?.parentPath?.parentPath?.node)
      ?? (hostPath && ledger.get(climbTransparentWrapperPath(hostPath).parentPath?.node));
  }

  function retireDeclaratorJobs(path) {
    const queued = queuedJobsFor(path);
    if (queued) queued.jobs = queued.jobs.filter(job => job.declarator !== path.node);
  }

  // ... and the question a rewrite that re-spells the PROPS of one pattern asks of each of them:
  // does a job queued by an EARLIER claim already own this prop? that job renders its own write at
  // drain, in the slot the source's claim was taken, so a render re-spelling the prop would either
  // write it twice or leave a native re-read over it. the other binding's channel answers the same
  // question by having REMOVED the prop before its render sees it
  function propHasQueuedJob(hostPath, prop) {
    return !!queuedJobsFor(hostPath)?.jobs.some(job => job.prop === prop);
  }

  // ... and the props such a job has taken OUT of the statement: a sentinel stays behind as `_unused`,
  // every other claim leaves - the pattern the other binding asks its sole chain of has lost them
  function propLeftByQueuedJob(hostPath, prop) {
    return !!queuedJobsFor(hostPath)?.jobs.some(job => job.prop === prop && !job.sentinel);
  }

  // ... and the OTHER half of that ownership: the capture render's memo leads the expression that
  // replaces this host, so it PERFORMS the init's SE prefix where the source ran it - the lift a job
  // recorded for the drain would run the same effect a second time, and is retired here
  function retireHostPrefixLift(hostPath) {
    for (const job of queuedJobsFor(hostPath)?.jobs ?? []) if (job.seqPrefix?.length) job.seqPrefix = null;
  }

  // A route that puts private bindings into its declaration (a capture's refs, a join's sentinels)
  // first turns an exported host into a plain declaration plus an export list of its source names,
  // before the route inserts anything. Returns the live declaration path, or null where nothing
  // unwrapped (not exported, or an export no list may replace) - the other leg's contract.
  function unwrapExportedHost(declaration) {
    const exportPath = declaration.parentPath;
    if (exportPath?.node?.type !== 'ExportNamedDeclaration' || !hostsExportList(exportPath.parentPath?.node)) return null;
    const names = declaration.node.declarations.flatMap(node => collectPatternNames(node.id));
    // the requeue re-detects every claim of the declaration, the ones a sibling declarator's function
    // holds included: nothing queued under the export, the declaration or a host inside it (their
    // recorded paths still hang off the export) may survive to render a second time
    ledger.delete(exportPath.node);
    walkAstNodes({ root: declaration.node, visit: node => { ledger.delete(node); } });
    const [live] = exportPath.replaceWithMultiple([declaration.node, {
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers: names.map(name => ({ type: 'ExportSpecifier', local: identifier(name), exported: identifier(name) })),
    }]);
    markRewrite();
    return live;
  }

  // Bind the shared ordered capture before a host-specific route can consume its pattern.
  // eslint-disable-next-line max-statements -- apply default, retained and ordinary plans to their native hosts
  function capturePatternForExtraction({ metaPath, meta, kind, entry, hintName }) {
    if (!entry && !meta.fromFallback) return false;
    const capturePlan = planRetainedObjectCapture({
      propPath: metaPath,
      meta,
      adapter,
      resolvePure: (value, at) => resolvePure(value, at ?? metaPath),
      parameterCallSites,
      isDisabledProp: isDisabled,
    });
    const defaultPlan = capturePlan?.defaultCapture;
    if (defaultPlan) {
      if (!defaultPlan.body && !defaultPlan.assignment && unwrapExportedHost(defaultPlan.host.parentPath)) return true;
      primeDestructureReceiverTypes?.(metaPath);
      const rendered = renderRetainedObjectCapture(capturePlan, {
        mintRef: mintRefName,
        mintDeclaredRef: () => injector.generateDeclaredRef(metaPath),
        injectImport: injectPureImport,
        resolveGlobalPolyfill,
        adapter,
        ctx: { scope: metaPath.scope, adapter, path: metaPath },
        claimProperties: properties => { for (const item of properties) skippedNodes.add(item); },
      });
      // the capture writes the pattern's targets anew: the source host's writes leave the tree
      if (rendered) noteRenderRetiredWrites(defaultPlan.host.node);
      if (rendered?.expression) defaultPlan.host.replaceWith(rendered.expression);
      else if (rendered?.statements) {
        const { body } = defaultPlan.site.node;
        const statements = body.type === 'BlockStatement' ? body.body : [{ type: 'ReturnStatement', argument: body }];
        defaultPlan.site.get('body').replaceWith({ type: 'BlockStatement', body: [...rendered.statements, ...statements] });
      } else if (rendered) {
        if (defaultPlan.body) {
          if (defaultPlan.host.node.type === 'VariableDeclarator') defaultPlan.host.get('id').replaceWith(rendered.head);
          else if (defaultPlan.host.node.type === 'CatchClause') defaultPlan.host.get('param').replaceWith(rendered.head);
          else defaultPlan.host.get('params')[0].replaceWith(rendered.head);
          const { body } = defaultPlan.site.node;
          const statements = defaultPlan.preserveBodyScope ? [body] : body.type === 'BlockStatement' ? body.body
            : defaultPlan.expressionBody ? [{ type: 'ReturnStatement', argument: body }] : [body];
          defaultPlan.site.get('body').replaceWith({
            type: 'BlockStatement',
            body: [
              variableDeclaration(defaultPlan.kind,
                rendered.declarations),
              ...statements,
            ],
          });
          if (rendered.mutable.length) defaultPlan.site.node.body.body.unshift(variableDeclaration('let', rendered.mutable));
        } else {
          if (rendered.mutable.length) defaultPlan.host.parentPath.insertBefore([variableDeclaration('let', rendered.mutable)]);
          for (const declaration of defaultPlan.host.replaceWithMultiple(rendered.declarations)) registerDeclaratorBindings(declaration);
        }
      }
      if (rendered) {
        markRewrite();
        return true;
      }
    }
    // The complete array plan owns source captures before any per-property rewrite.
    if (renderArrayFlattenPlan(metaPath)) return true;
    const restHost = destructurePatternHostPath(metaPath);
    const assignment = restHost?.node?.type === 'AssignmentExpression';

    const restPlan = (restHost?.node?.type === 'VariableDeclarator' || assignment) && planRetainedObjectCapture({
      pattern: assignment ? restHost.node.left : restHost.node.id,
      init: assignment ? restHost.node.right : restHost.node.init,
      assignment,
      prop: metaPath.node,
      hostPath: restHost,
      adapter,
      resolveNodeType,
      injectorState,
      kind,
      entry,
      meta,
      resolvePure: (value, at) => resolvePure(value, at ?? metaPath),
      resolveStaticProp: resolvePolyfillableStaticProp,
      planGuardedNarrow: planGuardedStaticNarrow,
      resolveStaticKey,
      parameterCallSites,
      isConsumedProp: item => propLeftByQueuedJob(restHost, item),
      isClaimedProp: item => propHasQueuedJob(restHost, item)
        || injectorState.hasGeneratedUnusedName(propBindingIdentifier(item.value)?.name),
    });
    if (restPlan?.keepsNative) return true;
    if (restPlan) {
      primeDestructureReceiverTypes?.(metaPath);
      if (unwrapExportedHost(restHost.parentPath)) return true;
      const declaration = restHost.parentPath;
      const pendingJobs = queuedJobsFor(restHost)?.jobs ?? [];
      // Earlier queued reads can declare this same receiver in their original statement slot.
      // A split capture shares that declaration; only its inner refs need hoisted slots.
      const deferredReceiver = restPlan.claimedProps?.size
        && (!restPlan.capture || restPlan.capture.splitCapture && assignmentInStatementPosition(restHost))
        && assignmentValueDiscarded(restHost)
        && pendingJobs.some(job => job.readsReceiver) && pendingJobs.every(job => !job.bodyless);
      const rendered = renderRetainedObjectCapture(restPlan, {
        mintRef: mintRefName,
        mintDeclaredRef: () => injector.generateDeclaredRef(metaPath),
        mintReceiverRef: deferredReceiver ? mintRefName : undefined,
        injectImport: injectPureImport,
        entry,
        hintName,
        renderDefaultGuard: buildInstanceDefaultGuard,
        mintUnused: declared => declared ? injector.declareUnusedRef(metaPath) : mintUnusedName(),
        claimProperties: properties => { for (const item of properties) skippedNodes.add(item); },
        noteStaticAlias: (name, aliasEntry) => injectorState.registerBodyExtractAlias(name, aliasEntry, metaPath.scope.getBinding(name)),
        noteRefAlias: (name, ctor) => injectorState.registerGlobalAlias(name, ctor, { trusted: true, minted: true }),
        ctx: { scope: metaPath.scope, adapter, path: metaPath },
        // the capture binds the constructor's ponyfill where its single key reads the pristine realm
        anchorPure: capturedRealmCtorPure({
          capture: restPlan.capture ?? restPlan.elementPlan?.capture,
          scope: metaPath.scope, adapter, path: metaPath, resolveGlobalPolyfill,
        }),
      });
      // the capture writes the pattern's targets anew: the source pattern's writes leave the tree
      noteRenderRetiredWrites(assignment ? restHost.node.left : restHost.node.id);
      if (rendered.expression) {
        retireHostPrefixLift(restHost);
        const holder = rendered.expression.expressions?.[0];
        if (restPlan.claimedProps?.size && holder?.type === 'AssignmentExpression' && holder.right === restPlan.init) {
          for (const job of pendingJobs) {
            job.receiverHolder = holder;
            if (deferredReceiver) job.receiverExpression = rendered.expression;
          }
        }
        const statement = restPlan.capture?.inlineLeaf && !pendingJobs.length && assignmentInStatementPosition(restHost)
          ? peelToExpressionStatement(restHost)?.exprStmt : null;
        if (statement) {
          const statements = rendered.expression.expressions.map(expressionStatement);
          if (isBodylessStatementSlot(statement.parentPath.node, statement.node)) {
            statement.replaceWith(bodylessSlotReplacement(statement.node, statements));
          } else statement.replaceWithMultiple(statements);
        } else restHost.replaceWith(rendered.expression);
      } else {
        const sourceType = resolveNodeType(restHost.get('init'));
        if (sourceType && rendered.refName && rendered.declarations[0].id.name === rendered.refName) {
          resolvedType?.set(rendered.declarations[0].id, sourceType);
        }
        // A shared capture owns its complete ordered group. Other sibling patterns also keep
        // the inserted tail together until their drains place their memos and extractions.
        const captured = capturedSiblingHosts.has(restHost.node)
          || !!(restPlan.capture || restPlan.arrayCapture) && patternBindingCount(rendered.declarations[0].id) > 0;
        const captureBody = statementListOf(declaration.parentPath.node);
        if (captureBody && (restPlan.capture || restPlan.arrayCapture)) pendingSplits.set(declaration.node, captureBody);
        if (captured || declaration.node.declarations.some(node => node !== restHost.node
          && (node.id.type === 'ArrayPattern' || node.id.type === 'ObjectPattern'))) {
          for (const node of rendered.declarations.slice(captured ? 0 : 1)) capturedSiblingHosts.add(node);
        }
        // the host a queued job was recorded against leaves the tree. its prop takes a declarator of its own,
        // where the walk claims it again - save one the walk skips (a twin's sentinel), whose job follows it
        // there, and one a twin left out (`twinDroppedJobs`), whose job binds off the first
        for (const job of pendingJobs) {
          if (job.declarator !== restHost.node) continue;
          const holder = rendered.declarations.find(node => nodeHoldsSubtree(node, job.prop));
          if (!holder && twinDroppedJobs.has(job)) job.declarator = rendered.declarations.at(0);
          else if (holder && skippedNodes.has(job.prop) && holder.id.properties?.includes(job.prop)) {
            job.declarator = holder;
            job.pattern = holder.id;
          }
        }
        // The re-detected siblings resolve statics through the newly inserted bindings - every
        // declarator's, as the other leg registers them.
        for (const capture of restHost.replaceWithMultiple(rendered.declarations)) registerDeclaratorBindings(capture);
      }
      markRewrite();
      return true;
    }
    return false;
  }

  // registers the names an inserted declarator binds, its pattern walked to the binding leaves:
  // the scope query takes an Identifier path, never the pattern holding it. a name the scope binds
  // already is the source's own, moved here with its writes: its binding follows the move off the
  // declarator it replaced, as the other leg re-registers it - registering it again would record the
  // move as one more write, and a binding read as reassigned loses the alias its static claim registers.
  // the replaced declarator's own record leaves with it (`isDeclaratorSelfViolation`: a loop head's
  // rebind) - kept, it would read as a write of the declarator the binding moved onto
  function registerDeclaratorBindings(declarator) {
    const bindings = new Set();
    walkPatternIdentifiers(declarator.node.id, id => bindings.add(id));
    declarator.traverse({
      Identifier(path) {
        if (!bindings.has(path.node)) return;
        const moved = declarator.scope.getOwnBinding(path.node.name);
        if (!moved) declarator.scope.registerBinding(declarator.parentPath.node.kind, path, declarator);
        else if (moved.path?.removed) {
          const selfWrites = moved.constantViolations.filter(write => isDeclaratorSelfViolation(write, moved.path.node));
          for (const write of selfWrites) moved.removeConstantViolation(write);
          Object.assign(moved, { path: declarator, identifierPath: path });
        }
      },
    });
  }

  // The first claim chooses its host's route. A later property must not plan a
  // partially consumed host and move ahead of extractions already placed for it.
  const arrayPlanHosts = new WeakSet();

  // Apply the complete array branch before this host has any per-property jobs.
  // The provider owns its residual and order; the binding inserts the planned declarations.
  function renderArrayFlattenPlan(metaPath) {
    const declarator = destructurePatternHostPath(metaPath);
    if (declarator?.node?.type !== 'VariableDeclarator' && declarator?.node?.type !== 'AssignmentExpression') return false;
    if (arrayPlanHosts.has(declarator.node)) return false;
    arrayPlanHosts.add(declarator.node);
    const plan = buildNestedDestructurePlan({
      arrayPath: declarator,
      arrayProp: metaPath,
      adapter,
      resolvePure,
      isDisabledProp: isDisabled,
      isClaimedProp: (path, meta) => skippedNodes.has(path.node)
        || sentinelAlreadyProcessed(path, { node: path.node, meta, injector: injectorState }),
    });
    if (!plan) return false;
    const declaration = declarator.parentPath;
    const exported = declaration.parentPath.node.type === 'ExportNamedDeclaration';
    const rendered = renderArrayDestructurePlan(plan, {
      kind: declaration.node.kind ?? 'const',
      injectImport: injectPureImport,
      init: declarator.node.init,
      embed: cloneNode,
      retain: node => node,
      mintRef: plan.array.assignment ? () => injector.generateDeclaredRef(metaPath) : mintRefName,
      mintDeclaredRef: () => injector.generateDeclaredRef(metaPath),
      mintUnused: declared => declared ? injector.declareUnusedRef(metaPath) : mintUnusedName(),
      decorate: (node, source, isExport) => exportDeclaration(node, isExport),
      read: (extraction, receiver) => {
        const id = identifier(injectPureImport(extraction.entry, extraction.hint));
        return callExpression(id, [cloneNode(receiver)]);
      },
    });
    if (exported && !plan.array.inDeclaration && plan.array.exportedSiblings?.length) rendered.push({
      type: 'ExportNamedDeclaration',
      declaration: null,
      source: null,
      specifiers: plan.array.exportedSiblings.map(name => ({
        type: 'ExportSpecifier',
        local: identifier(name),
        exported: identifier(name),
      })),
    });
    if (!plan.array.assignment) retireDeclaratorJobs(declarator);
    for (const extraction of plan.extractions) skippedNodes.add(extraction.prop);
    // the render copies the pattern's targets into the statements it plans: the source pattern leaves
    noteRenderRetiredWrites(plan.array.assignment ? declarator.node.left : declarator.node.id);
    if (plan.array.assignment) {
      const statement = declarator.findParent(item => item.node === plan.array.statement);
      declarator.get('left').replaceWith(rendered[0].expression.left);
      if (plan.array.bodyless) statement.replaceWith(bodylessSlotReplacement(statement.node, [statement.node, ...rendered.slice(1)]));
      else statement.insertAfter(rendered.slice(1));
    } else if (plan.array.inDeclaration) {
      // the export unwraps first, as on the other leg: the declarators land in the live declaration, through
      // its own declarator path - the one this route holds hangs off the export the unwrap removed
      const host = unwrapExportedHost(declaration) ?? declaration;
      const liveDeclarator = host === declaration ? declarator
        : host.get('declarations')[host.node.declarations.indexOf(declarator.node)];
      const replacements = liveDeclarator.replaceWithMultiple(rendered.flatMap(node => node.declarations));
      for (const replacement of replacements) registerDeclaratorBindings(replacement);
      if (plan.array.splitDeclaration) pendingSplits.set(host.node, statementListOf(host.parentPath?.node));
    } else if (plan.array.positional && !exported) {
      declarator.get('id').replaceWith(rendered[0].declarations[0].id);
      registerDeclaratorBindings(declarator);
      declaration.insertAfter(rendered.slice(1));
    } else {
      const statement = exported ? declaration.parentPath : declaration;
      const statements = rendered.map((node, index) => exportDeclaration(
        node,
        exported && node.type !== 'ExportNamedDeclaration' && plan.array.exportFrom !== null && index >= plan.array.exportFrom,
      ));
      // a declaration binds through declarations: its leading expression statements are the lifted effects
      const lifted = statements.findIndex(item => item.type !== 'ExpressionStatement');
      const replacements = statement.replaceWithMultiple(anchorLeadingStatement({
        statements, hostNode: declaration.node, statementNode: statement.node, lifted,
      }));
      for (const replacement of replacements) {
        const emittedDeclaration = replacement.node.type === 'ExportNamedDeclaration' ? replacement.get('declaration') : replacement;
        if (emittedDeclaration.node?.type === 'VariableDeclaration') {
          for (const emittedDeclarator of emittedDeclaration.get('declarations')) registerDeclaratorBindings(emittedDeclarator);
        }
      }
    }
    markRewrite();
    // Retained claims are visited in the replacement; the source path is retired.
    return true;
  }

  function captureParameterInstance(metaPath) {
    const plan = planParameterInstanceExtraction({
      propPath: metaPath, adapter, resolvePure, isDisabledProp: isDisabled, parameterCallSites,
      isClaimedProp: path => overwriteRebindEmitted({ metaPath: path, injectorState, adapter }),
    });
    // A completed default mirror owns its pattern before remaining siblings revisit it.
    if (!plan || synthDone.has(plan.pattern)) return false;
    for (const property of plan.claimedProperties) skippedNodes.add(property);
    for (const leaf of plan.bindingProperties) resolvePropertyObjectType(leaf);
    const rendered = renderParameterInstanceCapture(plan, {
      receiverName: mintRefName(),
      unusedName: plan.paddingRequired ? mintUnusedName() : null,
    });
    plan.rootPath.replaceWith(rendered.head);
    if (rendered.padding) plan.fnPath.node.params.push(rendered.padding);
    const { body } = plan.fnPath.node;
    if (body.type === 'BlockStatement') body.body.splice(prologueEndIndex(body.body), 0, rendered.declaration);
    else {
      plan.fnPath.node.body = blockStatement([rendered.declaration, { type: 'ReturnStatement', argument: body }]);
      plan.fnPath.node.expression = false;
    }
    plan.fnPath.scope.crawl();
    markRewrite();
    return true;
  }

  // eslint-disable-next-line max-statements -- per-form prop dispatch sequence
  function handleObjectPropertyResult({ metaPath, meta, kind, entry, hintName }) {
    if (kind === 'instance' && captureParameterInstance(metaPath)) return;
    // Keep the default's comment position before its own claims replace the value node.
    const sourceDefault = metaPath.node.value;
    if (sourceDefault?.type === 'AssignmentPattern') sourceDefault.defaultCommentsAt ??= unwrapParens(sourceDefault.right).start;
    const keyCtx = { scope: metaPath.scope, adapter, path: metaPath };
    // the caller mirror first: where it settles the leaf's inner default arm for every caller
    // (mirrored the default, or proved it dead at each call), the rewrites below would only add
    // dead text beside it
    if (parameterCallSites && renderNestedParamSynth({ metaPath, meta, argumentSites: parameterCallSites, fallbackOnBail: true })) return;
    if (kind === 'instance' && renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
    // A flat open default normally uses the compact data-slot synth. If an earlier
    // parameter/default step can observe its reads, use the shared lazy mirror instead.
    if (kind === 'instance' && renderNestedParamSynth({
      metaPath, meta, allowFlatInstanceDefault: true, deferredOnly: true,
    })) return;
    // A declined caller mirror must retain absent properties and the caller's own defaults.
    if (meta?.parameterArgumentsOnly) return;
    // every leaf of this pattern answers its receiver type before the routes below rewrite it
    primeDestructureReceiverTypes?.(metaPath);
    // Expand literal array spreads before choosing their capture, as on the Babel host.
    flattenArrayWrapperInits(metaPath);

    // the MIRROR's one ask, at the same point in both bindings' dispatch and ahead of every route that
    // CONSUMES the hop (the keyed capture, the proxy flatten, the key-read plan). Every condition of
    // it is the provider's `seKeyStaticOwesTheMirror`, so neither leg carries a gate of its own, and
    // `fallbackOnBail` is what keeps a declined plan falling through to those routes instead of
    // swallowing the claim
    if (seKeyStaticOwesTheMirror({ propPath: metaPath, meta, kind, adapter,
      resolvePure: (value, at) => resolvePure(value, at ?? metaPath) })
      && renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
    const restHost = destructurePatternHostPath(metaPath);
    if (renderArrayFlattenPlan(metaPath)) return;
    const arrayRest = restHost?.node?.type === 'VariableDeclarator'
      && buildNestedDestructurePlan({
        arrayPath: restHost,
        adapter,
        injectorState,
        captureFor: { prop: metaPath.node, pattern: metaPath.parentPath.node, kind },
      })?.array.capture;
    if (arrayRest) {
      if (unwrapExportedHost(restHost.parentPath)) return;
      const rendered = renderArrayWrapperCapture(arrayRest, { mintRef: mintRefName });
      // Re-detection owns the moved pattern; queued claims still name the old array host.
      retireDeclaratorJobs(restHost);
      const [capture] = restHost.replaceWithMultiple([rendered.capture,
        ...rendered.elements.flatMap(element => element.declarator ? [element.declarator] : [])]);
      capture.get('id').traverse({
        Identifier(path) {
          capture.scope.registerBinding(capture.parentPath.node.kind, path, capture);
        },
      });
      markRewrite();
      return;
    }
    const nestedRest = restHost?.node?.type === 'VariableDeclarator'
      && planNestedKeyedPatternCapture({
        pattern: restHost.node.id,
        init: restHost.node.init,
        prop: metaPath.node,
        kind,
        entry,
        ctx: keyCtx,
        anchored: entry === 'get-iterator-method' && !!buildNestedDestructurePlan({
          declarator: restHost.node, scope: metaPath.scope, adapter, path: metaPath,
          resolvePure: value => resolvePure(value, metaPath), resolveGlobalPolyfill, isDisabledProp: isDisabled,
        })?.anchor,
      });
    if (nestedRest) {
      if (unwrapExportedHost(restHost.parentPath)) return;
      const rendered = renderNestedKeyedPatternCapture(nestedRest, { mintRef: mintRefName });
      const leafAlias = capturedLeafCtorAlias({
        capture: nestedRest,
        rendered,
        leafPattern: metaPath.parentPath.node,
        kind,
        meta,
        ctx: keyCtx,
      });
      if (leafAlias) injectorState.registerGlobalAlias(leafAlias.ref, leafAlias.ctorName, { trusted: true, minted: true });
      retireDeclaratorJobs(restHost);
      const declarations = rendered.elements.flatMap(element => element.declarator ? [element.declarator] : []);
      capturedSiblingHosts.add(rendered.capture);
      for (const declaration of declarations) capturedSiblingHosts.add(declaration);
      for (const replacement of restHost.replaceWithMultiple([rendered.capture, ...declarations])) {
        registerDeclaratorBindings(replacement);
      }
      markRewrite();
      return;
    }
    // Common captures above may expose a flat read. Remaining literal-wrapper
    // static/global slots retain their source patterns on every host.
    if (destructureRetainsLiteralWrapper({ propPath: metaPath, kind, adapter })) {
      // A retained plain static binding still has its known return type. A native
      // default may supply another function, so only the unguarded binding is an alias.
      if (kind === 'static' && metaPath.node.value.type === 'Identifier') registerExtractAliases({
        metaPath, kind, entry, prop: metaPath.node,
      });
      renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true });
      return;
    }
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
        && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && isPristineProxyGlobal(adapter, hintName, { node: prop, path: metaPath }))) return;
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
    // the leaf-claim question is the CORE's (`leafCarriesOwnClaim`), asked here with the receiver this
    // route reads the leaf through; the binding binds the resolver and the key context, nothing else
    function leafKeyMayClaim(leaf, receiver, foldsComputedKey = false) {
      return leafCarriesOwnClaim({
        leaf,
        receiver,
        resolvePure,
        keyCtx: { scope: metaPath?.scope, adapter, path: metaPath },
        foldsComputedKey,
      });
    }
    // does the host hold this prop ALONE, every level down to it spelling one key? the re-anchor
    // LIFTS the pattern out of the statement, and a prop in the MIDDLE of its level has no placement
    // that orders both sides of it
    // the node types a destructure LEVEL is spelled with, in either dialect: the climb out of a
    // nested prop to the pattern its statement owns walks exactly these
    const PATTERN_LEVEL_TYPES = new Set(['ObjectPattern', 'ArrayPattern', 'Property', 'ObjectProperty', 'AssignmentPattern']);

    // the pattern an ASSIGNMENT host owns, climbed out of however many levels sit between it and
    // this prop - the lift moves the pair out of that whole statement, so its arity is the question,
    // not the immediate level's. null for every other host: a declaration has a statement slot of
    // its own and orders nothing around it
    function liftHostPattern(path) {
      let cur = path;
      while (cur?.parentPath && PATTERN_LEVEL_TYPES.has(cur.parentPath.node?.type)) cur = cur.parentPath;
      return cur?.parentPath?.node?.type === 'AssignmentExpression' ? cur.node : null;
    }
    // the ctor-pattern re-anchor serves only a pattern the FLATTEN leaves whole: one
    // resolvable leaf routes the claim through the leaf's own chain climb instead, and a
    // mixed pattern's split residual stays staged. it re-anchors the pattern VERBATIM on the
    // ponyfill, so its leaves must be plain bindings too - a rest would collect the ponyfill's
    // own properties instead of the constructor's
    // ... and its STATIC twin: a static claim whose slot holds a claim-free pattern re-anchors that
    // pattern on the ponyfill (`{ from: { length } } = Array` -> `const { length } = _Array$from`) -
    // the plan's pattern-valued static, the babel leg's shape off a constructor init; a leaf with
    // a claim of its own (`name` off the function) keeps its own route, a mutated static its source
    // ... off a spelled receiver: a `this` in a static context resolves its leaves on the static
    // SURFACE alone, and a pattern under such a leaf hops past that surface - kept as written, the
    // babel leg's negative
    const hostValue = metaPath.parentPath?.parentPath?.node;
    const thisReceiver = peelTransparentExpr(hostValue?.type === 'VariableDeclarator' ? hostValue.init
      : hostValue?.type === 'AssignmentExpression' || hostValue?.type === 'AssignmentPattern' ? hostValue.right : null)
      ?.type === 'ThisExpression';
    // ... and on the ASSIGNMENT host a claiming leaf RIDES the re-anchor (the plan's `claimsRide`):
    // that host renders every leaf claim it consumed off the extraction (the overwrite channel),
    // and a computed key runs once inside the re-anchored pattern, where the source wrote it
    const claimsRide = kind === 'static' && hostValue?.type === 'AssignmentExpression';
    // ... and that host is also the one the re-anchor LIFTS the pattern out of, so it serves only a
    // host nothing survives in: a sibling the host keeps runs its own key effects where the statement
    // stands while the lifted pair runs after ALL of them, and the source ordered the two around each
    // other. every wider shape belongs to the branch mirror, whose slot serves the static with the
    // statement standing and nothing moved - the shared plan's own rule for the same decision
    const liftTakesHostWhole = !liftHostPattern(metaPath) || soleChainToProp(liftHostPattern(metaPath), prop);
    // Original leaf defaults stay in the constructor pattern; only the binding target qualifies here.
    const ctorPattern = liftTakesHostWhole && prop.value?.type === 'ObjectPattern' && !prop.computed
      && (kind === 'global' || (kind === 'static' && !thisReceiver && !adapter.isMutatedStatic?.(meta?.object, meta?.key)))
      && prop.value.properties.every(leaf => patternSlotTarget(leaf.value)?.type === 'Identifier'
        && (claimsRide ? leaf.type === 'Property'
        : !leafKeyMayClaim(leaf, kind === 'global'
          ? { object: hintName, placement: 'static' } : { object: undefined, placement: 'prototype' }, true)));
    // a pattern default becomes the extraction's own LHS, so its leaves may spell anything a
    // pattern spells - a REST included, which binds no key and so claims nothing. what disqualifies
    // it is a leaf naming a member of the RESULT: that leaf is a claim off this one, and the
    // composition is rendered by its route, not by a consume here. an INSTANCE claim binds the
    // pattern off the guarded dispatch, a STATIC one off the guarded import binding (`{ of: [o] =
    // [] } = Array` -> `const [o] = _Array$of === void 0 ? [] : _Array$of`) - the babel canon for both
    const patternLeft = (kind === 'instance' || kind === 'static') && prop.value?.type === 'AssignmentPattern'
      && (prop.value.left?.type === 'ArrayPattern' || (prop.value.left?.type === 'ObjectPattern'
        && !hopPatternLeafClaims({ pattern: prop.value.left, resolvePure, keyCtx: { scope: metaPath?.scope, adapter, path: metaPath } })));
    const patternPath = metaPath.parentPath;
    const pattern = patternPath?.node;
    // a RELOCATED catch pattern reaches this ledger as an ordinary declarator - the shared
    // liveness gate keeps a binding the catch body never reads a native read
    if (pattern?.type !== 'ObjectPattern' || relocatedCatchPropUnobservable({
      declaratorPath: patternPath.parentPath,
      propNode: prop,
      patternNode: pattern,
      localName: propLocalName(prop) ?? null,
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
    })) return;

    // a rest sibling reads "everything the pattern did not consume": the consumed prop then
    // RENAMES to an `_unused` sentinel instead of leaving (the key keeps excluding it) - and
    // an SE computed key takes the same rename, its effect replaying in the residual
    // ... and so does a prop whose LITERAL outlives it: the pairing walk keeps that literal alive, and
    // a slot that simply left would take with it the key the surviving husk still reads
    // a MEMBER SLOT is admitted only where the claim is a STATIC or a CONSTRUCTOR and the extraction canon
    // admits the target (a computed one only as the host's sole chain): an INSTANCE claim has its own route,
    // and the gate is what keeps a PROTOTYPE member (`Set.union`) from being written into the slot as though
    // it were a static
    // An iterator result joins the ordered assignment plan; other instance targets
    // still need the nested overwrite to own their whole host.
    const memberHost = destructurePatternHostPath(metaPath);
    const memberSlot = kind === 'static' || kind === 'global'
      ? !!memberTargetTakesExtraction(prop.value,
        { hostPattern: memberHost?.node?.left, prop, gone: item => propLeftByQueuedJob(memberHost, item) })
      : !!symbolIteratorMemberTarget(prop, entry,
        { hostPattern: memberHost?.node?.left, gone: item => propLeftByQueuedJob(memberHost, item), ctx: keyCtx })
        || kind === 'instance' && !!overwriteMemberTarget(metaPath, keyCtx);
    if (!isPlainConsumableProp(prop, { symbolProp, ctorPattern, patternLeft, memberSlot })) return;
    const keyReadPlan = kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop, keyCtx))
      ? destructureKeyReadPlan(metaPath, keyCtx) : null;
    // an SE-keyed static asks the shared plan before any route here, on every host, as the other leg
    // does: a mirror spells the literal where the pattern reads it, and a bail keeps the read native
    if (kind !== 'instance' && !meta?.fromFallback && (computedKeyHasSideEffects(prop, keyCtx) || keyReadPlan?.sole)
      && renderNestedParamSynth({ metaPath, meta })) return;
    // ... a pattern-valued iterator claim reads the same way, destructuring the helper result there
    const keyedPattern = keyReadPlan?.sole && isSymbolIteratorPatternClaim(prop, entry) ? prop.value : null;
    if (keyReadPlan?.sole && (propBindingIdentifier(prop.value) || keyedPattern)) {
      const declaratorPath = patternPath.parentPath;
      const { init } = declaratorPath.node;
      const evaluation = keyedReadEvaluation(keyReadPlan, { init, hostPath: metaPath, readsReceiver: kind === 'instance', ctx: keyCtx });
      const { discarded, inlineReceiver } = evaluation;
      const receiverName = evaluation.storeReceiver ? injector.generateDeclaredRef(metaPath) : null;
      let value = buildValue({
        kind, entry, hintName, receiverNode: declaratorPath.node.init, prop, metaPath,
        literalRoute: true,
        liveReceiver: inlineReceiver ? () => keyReadPlan.receiver : null,
      });
      if (!value) return;
      // a single instance leaf binds its own dispatch over the helper result, as the extraction does
      const keyedLeaf = keyedPattern && symbolIteratorInstanceLeaf({
        value: keyedPattern, resolvePure: m => resolvePure(m, metaPath), isDisabled: null,
        keyNameOf: leafProp => leafProp.key?.name ?? leafProp.key?.value ?? null,
      });
      if (keyedLeaf) {
        const helperRead = value;
        const leafId = injectPureImport(keyedLeaf.instanceEntry, keyedLeaf.instanceHint);
        value = (ref, product) => renderDestructureDispatch(identifier(leafId), helperRead(ref), product);
      }
      // the pattern's leaves read off the helper result and claim nothing of their own; their values stay live
      if (keyedPattern) walkAstNodes({ root: keyedPattern, visit: node => { if (node.type === 'Property') skippedNodes.add(node); } });
      // the discarded receiver renders no claim, so the slots below it hold; what discarding it runs stays
      // claim-live where it stands, and the drain reads it at its slots
      if (discarded) {
        for (const node of discarded) skippedNodes.keepLive?.add(node);
        markSubtreeSkipped(skippedNodes, keyReadPlan.receiver, skippedNodes.keepLive);
      }
      recordJob({ hostPath: declaratorPath.parentPath,
        job: {
          host: 'key-read',
          declarator: declaratorPath.node,
          prop,
          value,
          collapseLeafName: keyedLeaf?.localName ?? null,
          keyReadPlan,
          receiverName,
          evaluation,
          metaPath,
          declarationPath: declaratorPath.parentPath,
          readsReceiver: kind === 'instance',
        } });
      // the bound name registers as the static's alias during the walk, as an extraction's does: a
      // later call off it narrows by the static's known return (`from(x).at(-1)`)
      if (kind === 'static') registerExtractAliases({
        metaPath, kind, entry, hintName, prop, declaration: declaratorPath.parentPath.node, declarationPath: declaratorPath.parentPath,
      });
      markRewrite();
      return;
    }
    const sentinel = destructureReadKeepsKey(metaPath, kind, keyCtx);
    // a sentinel-kept DEFAULTED prop retires whole (`[(se, 'at')]: _unused` - the default
    // lives on in the extraction's guard ternary); other pattern-valued props stay. a MEMBER slot the
    // gate above admitted retires the same way on the host's own level: the extraction writes into it.
    // one level down the hop capture writes it (`planNestedKeyedPatternCapture`)
    if (sentinel && !propBindingIdentifier(prop.value) && !(memberSlot && memberHost?.node?.left === pattern)
      && !isSymbolIteratorPatternClaim(prop, entry)) return;
    // the nested proxy flatten (`{ Array: { from } } = globalThis`): the resolution already
    // proved the hop chain (the meta resolved to the static through it), so the climb only
    // validates shape - plain non-computed hop props at every level - and records the
    // PATTERN CHAIN for the drain's emptiness cascade
    const climbed = climbPatternChain(patternPath, {
      scope: metaPath.scope,
      adapter,
      path: metaPath,
      carriesReceiver(defaultPath) {
        return destructureDefaultCarriesReceiver({
          defaultPath, path: metaPath, getReceiverPath: defaultReceiverPath, kind, slotStatic: meta?.slotStatic,
        }, defaultCtx);
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
    if (chain.length > 0 && kind === 'instance' && normalizeNestedLeafSiblings(metaPath)) return;
    // The climb and the post-normalization mirror use the same source extraction decision.
    // Registration still targets the live default path; children may rewrite its right slot later.
    if (chain.length > 0 && !receiverSeOnly && shouldMirrorNestedDestructureDefault({
      path: metaPath, receiverPath: hostReceiverPath(hostParent), kind,
    }, defaultCtx) && registerSimpleSynthSlot({
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
    // ... under a PARAMETER default or an IIFE parameter, the slot the hops pair with takes the
    // instance mirror - the flat parameter's instance synth one level down
    // ... and an INNER default above the leaf (`{ A: { B: { at } } = { B: [1, 2] } }`) is the same slot one
    // level in: the mirror replaces the default's paired value, so it fires where the default does.
    // the shared hop climb admits the host, an array wrapper on the way included
    if (kind === 'instance' && registerHopInstanceSynthSlot({ metaPath, kind, entry, hintName },
      { adapter, synthLedger, instanceSynthCtx, injectorState })) return;
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
      // a for-x HEAD holds no statement for any of the routes below to land in, and its declarator
      // no init: what the wrapper pairs is an ELEMENT of the iterated literal, which the shared
      // mirror swaps in place, wrapper and all. asked AHEAD of them - the declined-wrapper fallback
      // below asks the same plan bounded to the declarator, out of whose span the head's element
      // stands, and a refused replacement still leaves the plan planned, so the ask arriving after
      // it renders nothing. the wrappers pair a slot and host nothing, so the walk through them -
      // every pattern level the head may nest, a key's property and a transparent inner default
      // included - ends at the same slot-less declarator, or at the loop whose `left` is the
      // pattern where the head declares nothing; the shared primitive answers both and nothing else
      if (kind !== 'instance' && forOfHeadIterableElements(destructurePatternHostPath(metaPath))
        && renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
      // ... and a DECLINED wrapper still mirrors its NESTED leaf where the shared plan reaches
      // the element: the literal replaces the element's own value and the siblings run on
      // (`[(eff('e'), { Object: { fromEntries: _Object$fromEntries } }), eff('f')]`) - or the
      // element's own DEFAULT, which the declarator owns as much as its init
      // (`const [{ Array: { of } } = globalThis] = []` mirrors the default, the babel shape)
      if (chain.length && renderNestedParamSynth({
        metaPath, meta, withinNode: arrayWrapperDeclarator(hostPatternPath),
      })) return;
      // ... and an element DEFAULT bearing a receiver (`[{ from } = Array]`) names the arm the slot
      // leaves open: the shared plan reads the slot first - it mirrors the default where the slot
      // proves `undefined` or stays open, and closes the arm where the slot proves a value - and the
      // swap of the default alone is what a slot no route proved falls back to; the object hop's
      // inner default takes the same order, and so does the babel leg here
      if (kind !== 'instance' && chain.length === 0 && hostPatternPath.parentPath?.node?.type === 'AssignmentPattern'
        && hostPatternPath.parentPath.node.left === hostPatternPath.node
        && (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })
          || registerSimpleSynthSlot({ metaPath, pattern, hostParent: hostPatternPath.parentPath, kind, entry, hintName }))) return;
    }
    // ... and a bare param pattern (`(({ resolve }) => ...)(Promise)`) takes the same parameter
    // route: the IIFE call-arg is the receiver its simple synth and the shared nested plan read
    if (hostParent?.node?.type === 'AssignmentPattern' || hostParent?.node?.type === 'ArrayPattern'
      || ((hostParent?.node?.type === 'ArrowFunctionExpression' || hostParent?.node?.type === 'FunctionExpression')
        && (hostPatternPath.listKey === 'params' || hostPatternPath.key === 'params'))) {
      if (receiverSeOnly) return;
      return handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath });
    }
    if (hostParent?.node?.type === 'VariableDeclarator' && hostParent.node.id === hostPatternPath.node) {
      return handleDeclaratorHost({ metaPath, meta, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent });
    }
    if (hostParent?.node?.type === 'AssignmentExpression' && hostParent.node.left === hostPatternPath.node
      && hostParent.node.operator === '=') {
      if (receiverSeOnly) return;
      return handleAssignmentHost({ metaPath, meta, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent });
    }
    // a for-x HEAD with no declaration hosts the pattern in the loop's own `left`: no statement slot
    // and no init, so the shared mirror answers in the iterated ELEMENT - the declarator head's route
    // one host over, and the other leg's same gate
    if (isForXStatement(hostParent?.node) && hostParent.node.left === hostPatternPath.node) {
      renderNestedParamSynth({ metaPath, meta });
    }
  }

  function handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath }) {
    for (let from = hostPatternPath, cur = hostPatternPath.parentPath; cur; from = cur, cur = cur.parentPath) {
      const { type } = cur.node ?? {};
      if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') {
        if (from.listKey !== 'params' && from.key !== 'params') return;
        // an INNER default the climb rewound to (`{ k: { from } = Array }`, `[{ from } = Array]`)
        // asks the shared plan first: it reads the slot the default pairs with - the default is
        // mirrored where that slot proves `undefined` or stays open, and the arm is closed where
        // the slot proves a value - and the swap of the default alone is what it falls back to
        if (chain.length === 0 && hostParent.node.type === 'AssignmentPattern' && hostParent.parentPath?.node?.type !== type
          && renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
        // the SIMPLE receiver swap of the default or of the bare parameter's IIFE argument first,
        // the nested/array-wrapped plan when it declines
        if (chain.length === 0 && (hostParent.node.type === 'AssignmentPattern' || hostParent.node === cur.node)
          && registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName })) return;
        if (renderNestedParamSynth({ metaPath, meta })) return;
        paramExtractFallback({ metaPath, kind, entry, hintName, pattern });
        return;
      }
      // ... a CATCH parameter binds like a declarator, and so does a for-x head written without one: the
      // climb has to stop AT it, or it walks past into the enclosing function and answers for a params
      // list this pattern is not in
      if (type === 'VariableDeclarator' || type === 'AssignmentExpression' || type === 'CatchClause'
        || type === 'Program' || isForXStatement(cur.node) && cur.node.left === from.node) {
        // a receiver-bearing default fires under exactly the condition its outer slot leaves
        // open, so the mirror is correct outside a parameter list too - the host only decides
        // where the residual lives, not whether the default is live. (the TYPED-outer dead
        // case never reaches here: `carriesReceiver` answers false there, the climb keeps
        // the hop, and the composed extraction owns the claim)
        // ... the shared plan first where the host spells the live receiver beside the default
        // (a head whose elements differ rewinds the climb to the default and lands here): it
        // mirrors both arms, and the swap of the default alone is the fallback
        // ... asked for the NESTED leaf too: a pattern spelling only hops under the default (`[{ Array:
        // { of } } = globalThis] = []`) has no flat leaf to ask for it, and the babel leg's one route
        // mirrors it from any leaf
        if (hostParent.node.type === 'AssignmentPattern') {
          const mirrored = renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true });
          // ... and where no plan stands - a pattern the mirror cannot spell (a member target, a duplicate
          // or a non-identifier key beside the leaf) - a flat leaf takes the simple swap
          if (!mirrored && chain.length === 0) registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName });
        }
        break;
      }
    }
  }

  // A declined parameter mirror may still use a proven body extraction. Otherwise keep
  // the parameter native; a leaf default would change a supplied undefined property.
  function paramExtractFallback({ metaPath, kind, entry, hintName, pattern }) {
    const prop = metaPath.node;
    if (kind === 'instance') return;
    // a pattern whose branches a SIBLING prop already mirrored is served from the literal, and this
    // extraction would bind the same name a second time - and out of the CALLER's reach, where the
    // literal keeps it caller-correct. the capture route asks the same marker one level over
    if (branchMirrorPatterns.has(pattern)) return;
    if (paramsHaveInvisibleCallers(metaPath, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
    const keyHasSideEffect = computedKeyHasSideEffects(prop, { scope: metaPath.scope, adapter, path: metaPath });
    if (!keyHasSideEffect) tryBodyExtractParam({ metaPath, prop, pattern, entry, hintName });
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
    body.splice(at, 0, ...renderDestructureStatements([{ id: identifier(localId.name), init: identifier(id) }], { kind: 'let' }));
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

  // Allocate and share the receiver memo selected by the provider, then prepare
  // the host's export/sibling placement. Live slots are captured before any edit.
  function planLiteralKeepKey({
    kind,
    entry,
    prop,
    pattern,
    sentinel,
    declarator,
    declaration,
    soleBinding,
    literalReceiver,
    relaxedReceiver,
    declaratorConsumedWhole = false,
    carried = false,
    receiverConsumesInit = false,
    exported,
    slotMemo = null,
    metaPath = null,
    symbolPatternResidual = false,
    allProxyInit = false,
    forInit = false,
  }) {
    const decision = planLiteralResidual({
      kind, entry, prop, pattern, sentinel, declarator, declaration, soleBinding, literalReceiver, relaxedReceiver,
      declaratorConsumedWhole, carried, receiverConsumesInit, slotMemo, symbolPatternResidual,
      allProxyInit, forInit, injectorState, ctx: { scope: metaPath?.scope, path: metaPath, adapter },
    });
    if (!decision) return null;
    const { keepKey, siblingAppend, memoizeReceiver, consumeResidualRead, deferMemo } = decision;
    let memoRecv = null;
    if (memoizeReceiver) {
      // shared per receiver NODE: two leaves off one receiver read the same `_ref`
      // a BRANCHING fragment defers its number to the drain, where every other whole-init
      // memo takes one: minting during the walk would run ahead of them and babel numbers
      // by its own emission order
      let memo = literalMemoNames.get(literalReceiver);
      // an object slot memo WRITTEN in its slot (an observable property before it) takes the
      // element memo's in-slot shape; a hoistable one defers its number like every other
      if (!memo && slotMemo && !slotMemo.hoist) memo = elementMemoFor(literalReceiver, declarator, { inSlot: true, metaPath });
      if (!memo) {
        // the SLOT is captured while the identity still holds: the swap below writes through it,
        // so a claim rendering INSIDE this receiver cannot strand the memo
        const slot = findNodeSlot(declaration.node, literalReceiver);
        // ... and so does a constant literal behind a SENTINEL: babel plants that memo where the
        // residual's other refs are numbered, not where the walk first met the literal
        memo = deferMemo
          ? { ident: identifier(''), node: literalReceiver, slot, deferred: true }
          : { refName: mintRefName(), node: literalReceiver, slot };
        literalMemoNames.set(literalReceiver, memo);
      }
      memoRecv = memo;
    }
    // ... an EXPORTED join would hand the residual's sentinels out beside the appended extractions,
    // so the host first leaves its export - the capture canon's unwrap - and joins as a plain one
    if (siblingAppend && exported && !slotMemo) return { unwrapExport: true };
    return { keepKey, memoRecv, siblingAppend, consumeResidualRead };
  }

  // the extraction's own validity proof, asked THROUGH a chain assignment: a capture yields its RHS,
  // so the SELECTION under it is what the pattern reads - and polyfill-always-wins holds only where
  // every arm of that selection resolves, either by agreeing statically or by every value being the
  // realm. an OPAQUE arm keeps the source's own read, and with a capture in the way the mirror is no
  // escape either: a literal in the arm would hand the capture our object. measured, both halves -
  // `const { Array: { from } } = (held = shim || globalThis)` with a TRUTHY shim bound the ponyfill
  // where native and the other binding answer the user object's own member
  function capturedSelectionDeclinesExtraction({ selecting, meta, metaPath, soleBinding, chain, kind }) {
    let captured = selecting;
    while (isChainAssignment(captured)) captured = peelTransparentExpr(captured.right);
    if (captured === selecting) return false;
    // ... a selection the build decides stores the operand of it that runs (`decidedRunningOperand`)
    captured = decidedRunningOperand(captured, { ...nodeSite(captured, metaPath), adapter });
    if (captured?.type !== 'LogicalExpression' && captured?.type !== 'ConditionalExpression') return false;
    // the DIVERGING half is the canon's - a selection not every branch of which is one proxy surface -
    // and the other half is this site's: arms that agree STATICALLY carry the same static, so the
    // extraction is sound over them (`b = (Array || Set)`, both with `from`)
    return divergingSelection(captured, { adapter, injectorState })
      && !staticallySelectedLeft({ selecting: captured, meta, metaPath, soleBinding, chain, adapter, kind });
  }

  // an OPAQUE / effect-bearing init with no direct receiver: the defaulted sole-consume
  // takes it whole, a proven logical left or agreeing ternary arm extracts, otherwise it records
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
    initializerNavigation,
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
          // ... and so does a HOP whose DEFAULT carries an EFFECT, the assignment host's same arm
          if (hopDefaultCarriesEffect(chain)) {
            // the SHARED plan answers first, as it does on the other binding: it reads the slot the
            // default pairs with and mirrors the arm there, where the per-branch route below only sees
            // the leaf's own meta and leaves a passthrough sibling's tree unrenderable
            if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return 'handled';
            routeSelectionMirror(metaPath, handlePerBranch, meta);
            return 'handled';
          }
          registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration: declarationPath.node, declarationPath });
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
    // Source admission has already chosen a shared receiver for the surviving readers.
    if (initializerNavigation?.carrier === 'memo') {
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
          // a catch-born host declares its default-guard refs as block `let`s (the drain's shape)
          catchBorn: relocatedHostFoldsGuardRefs(destructurePatternHostPath(metaPath)),
        },
      });
      markRewrite();
      return 'handled';
    }
    if (nestedInstanceWithoutSelectingInit({ chain, kind, init: declarator.init })) return 'handled';
    // a value-SELECTING init (a conditional / logical) is the per-branch mirror's shape:
    // an unconditional extraction here would erase the other branch's semantics - EXCEPT
    // a fallback logical whose LEFT detection statically selected (the meta's object
    // resolved through it): the plain-ctor extraction stands and the dead right drops
    // with the residual (`{ from } = Array || Iterator` -> `const from = _Array$from`).
    // ordered AHEAD of the AssignmentPattern bail: a DEFAULTED leaf under a selection
    // belongs to the mirror / the statically-selected extraction exactly like its
    // undefaulted twin - the flat bail left the claim unrendered
    // ... and a value-selecting inner DEFAULT of the leaf's own level (`{ k: { Map: { groupBy } }
    // = sel } = {}`) is the per-branch mirror's shape whatever the host's init: the leaf reads
    // that default exactly when the outer key is missing, and the mirror fills its arms
    const levelDefault = nestedLeafSelectingReceiver(metaPath, null);
    if (levelDefault && kind !== 'instance' && chain.length > 0
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(levelDefault)?.type)) {
      // the shared plan first: a paired slot proves the default dead, an all-proxy selection
      // mirrors whole; only a selection the plan cannot spell goes to the per-branch mirror
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return 'handled';
      if (!selectingInitSurface(levelDefault, metaPath)) {
        routeSelectionMirror(metaPath, handlePerBranch, meta);
        return 'handled';
      }
    }
    const selecting = peelTransparentExpr(declarator.init);
    if (selecting?.type === 'ConditionalExpression' || selecting?.type === 'LogicalExpression') {
      const left = staticallySelectedLeft({ selecting, meta, metaPath, soleBinding, chain, adapter, kind });
      if (left) {
        // the init dies with a SOLE binding, so its claims are consumed; a surviving
        // residual keeps reading it and its own claims must still render
        // ... but an init carrying OBSERVABLES keeps its claims live: the drain re-emits the
        // whole selection as a discarded statement, and that spelling is the collapsed one
        if (soleBinding && !mayHaveSideEffects(declarator.init, { scope: metaPath.scope, adapter, path: metaPath })) {
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
      // a diverging LOGICAL guard under a NESTED static leaf no earlier route served keeps the destructure
      // and its read native: the selected branch's own undefined is its answer (the ternary mirror declines
      // outright - the locked diverging-only rule)
      if (selecting.type === 'LogicalExpression' && selecting.operator === '&&'
        && kind !== 'instance' && chain.length) return 'handled';
      // ... and with a residual left over, the selection has TWO readers (the extraction and
      // the residual) - the whole init memoizes so the branch is taken exactly once, which is
      // the same whole-init memo the opaque route below records
      if (kind !== 'instance' || chain.length) {
        // a selection the routes above declined and the fromFallback dispatch cannot reach
        // (a non-nullish PRIMARY resolves WITHOUT the flag): the per-branch mirror still
        // owns the shape - `(d++, globalThis) || fb` mirrors the diverging tail exactly
        // like its fromFallback twins, instead of leaving the claim unrendered
        routeSelectionMirror(metaPath, handlePerBranch, meta);
        return 'handled';
      }
    }
    if (prop.value.type === 'AssignmentPattern' && !defaultedIdent) return 'handled';
    if (chain.length > 0 && kind === 'instance') return 'handled';
    if (capturedSelectionDeclinesExtraction({ selecting, meta, metaPath, soleBinding, chain, kind })) {
      routeSelectionMirror(metaPath, handlePerBranch, meta);
      return 'handled';
    }
    registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration: declarationPath.node, declarationPath });
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
        symbolPattern: isSymbolIteratorPatternClaim(prop, entry),
        // ... and its SINGLE bare polyfillable leaf collapses the whole extraction the same way
        // the plain route's does (`{ [S]: { name } } = arr` -> `_nameMaybeFunction(_gim(_ref))`)
        collapseLeaf: isSymbolIteratorPatternClaim(prop, entry)
          ? symbolIteratorInstanceLeaf({
            value: prop.value, resolvePure: m => resolvePure(m, metaPath), isDisabled: null,
            keyNameOf: leafProp => leafProp.key?.name ?? leafProp.key?.value ?? null,
          }) : null,
        // A KEY effect buried in the source spine rides the extraction's
        // own sequence, where the source ran it - inside the read, not ahead of it
        buriedKeyEffect: navSpineHasComputedKeyEffect(declarator.init),
        rawKeyRootInit: initRawKeyOnRoot(declarator.init),
        // ... and the same timing for the guard the discarded read renders through;
        // its source plan owns the effects the drain places around that read
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        // A logical selection observes the nested leaf after selecting its receiver.
        // Keep that final property read in the discarded probe.
        initProbeReadsLeaf: selecting?.type === 'LogicalExpression',
        // ... and whether a read stands over a store the realm may leave void: where the probe
        // DECLINES that read (an effect inside the stored value keeps the whole init with the
        // effect channel), this lift is what carries it, and with it the throw the consume erases
        // ... kept as the KEY the read spells: by drain time the collapse may have folded that key
        // into the extraction, and the lift rebuilds the read off the live store instead
        absentableStoreReadKey: absentableStoreReadKeyOf(declarator.init,
          { scope: metaPath.scope, adapter, path: metaPath, resolvePure: m => resolvePure(m, metaPath) }),
        // ... and the SEALED shape of the same read, for the same reason
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure }),
      },
    });
    return 'handled';
  }

  // the flat twin over a root the source COMPUTES (a call, a member, a sequence, `this`) that a claim queued
  // earlier in the declarator reads: the twin reads that root too, which the source evaluates once, so the
  // root takes its memo now, ahead of the declaration, and the declaration is detected again over it - where
  // the other binding, which consumes the earlier claim in place, stands when it reaches this one. the host
  // then takes the twin the way a name would
  function memoizeQueuedTwinRoot({ declarator }) {
    const declaration = declarator.parentPath;
    const { declarations } = declaration.node;
    const ref = mintRefName();
    // every claim of the declaration is detected again, so nothing queued under it may render twice
    walkAstNodes({ root: declaration.node, visit: node => { ledger.delete(node); } });
    // the twin's host is the declaration's last declarator: the ones ahead of it keep their statement,
    // and the memo runs between their inits and the host's read, where the source evaluates the root
    const ahead = declarations.slice(0, -1);
    const statements = [
      ...ahead.length ? [{ ...declaration.node, declarations: ahead }] : [],
      variableDeclaration('const', [variableDeclarator(identifier(ref), declarator.node.init)]),
      { ...declaration.node, declarations: [{ ...declarator.node, init: identifier(ref) }] },
    ];
    for (const inserted of declaration.replaceWithMultiple(statements)) {
      for (const item of inserted.get('declarations')) registerDeclaratorBindings(item);
    }
    markRewrite();
    return true;
  }

  // a nested pattern whose LEAF level keeps siblings is the flat shape written the long way:
  // `{ y: { at, other } } = box` reads exactly what `{ at, other } = box.y` reads. normalizing it
  // hands the claim to the flat channel, which reads the hop ONCE into a `_ref` both the dispatch
  // and the residual share and keeps the residual where the source wrote it - the shape this emitter
  // already prints for the flat source. a level above the leaf that keeps SIBLINGS splits the hop out
  // into a twin of its own beside the host (`hopSplitPlan`); the host goes on binding those siblings
  // off the root. the twin is re-detected: the traversal queues every node a replacement inserts
  function normalizeNestedLeafSiblings(metaPath) {
    const plan = planNestedLeafTwin({
      path: metaPath,
      sourceLeafCount: metaPath.parentPath.node.properties?.length,
      queuedReceiverRead: declarator => !!queuedJobsFor(declarator)?.jobs.some(job => job.declarator === declarator.node
        && (job.readsReceiver || (job.host === 'memo-decl' && job.kind === 'instance'))),
    }, {
      adapter,
      resolvePure,
      resolveGlobalPolyfill,
      isOwnAlias: isOwnPureAlias,
      resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
    });
    if (!plan) return false;
    if (plan.kind === 'capture') return memoizeQueuedTwinRoot(plan);
    const { declarator: declaratorPath, split, slotDefault } = plan;
    const nav = renderNestedExtractionReceiver(plan.receiver, { embed: cloneNode });
    const fold = slotDefaultFold({ slotDefault, nav, metaPath });
    const memo = plan.memo ? mintRefName() : null;
    const twinInit = memo ? identifier(memo) : fold;
    // neither a minted name nor a nav this pass built walks back to the source's type, so the
    // receiver's type rides the node the twin is re-detected off
    const type = resolvePropertyObjectType?.(metaPath);
    if (type) resolvedType?.set(twinInit, type);
    const leafTwin = plan.walk ? twinLeafPattern(declaratorPath, plan.leafPattern.node) : cloneNode(plan.leafPattern.node);
    if (plan.kind === 'assignment') {
      declaratorPath.get('right').replaceWith(twinInit);
      declaratorPath.get('left').replaceWith(leafTwin);
      return true;
    }
    const { declaration: declarationPath, bodyless, forInit } = plan.host;
    const memoDeclaration = memo && variableDeclaration('const', [variableDeclarator(identifier(memo), fold)]);
    if (split) {
      const twin = variableDeclaration(declarationPath.node.kind, [variableDeclarator(leafTwin, twinInit)]);
      splitHopOutOfHost({ declarationPath, split, pair: memoDeclaration ? [memoDeclaration, twin] : [twin] });
      return true;
    }
    if (memoDeclaration && bodyless && declarationPath.node.declarations.length === 1) {
      // an unbraced slot holds ONE statement: the memo and the twin take a block of their own
      declarationPath.replaceWith(blockStatement([memoDeclaration,
        variableDeclaration(declarationPath.node.kind, [variableDeclarator(leafTwin, twinInit)])]));
      return true;
    }
    if (memoDeclaration) {
      // earlier sibling reads run ahead of the fold. a loop head holds no statement slot, so there
      // the memo joins its declarators unsplit; a shared declaration splits per statement after the
      // drain, as the other leg's post-split does
      if (declarationPath.node.declarations.length > 1 || forInit) {
        declaratorPath.insertBefore(memoDeclaration.declarations);
        if (!forInit) {
          markMemoDeclarators(memoDeclaration.declarations);
          pendingSplits.set(declarationPath.node, statementListOf(declarationPath.parentPath?.node));
        }
      } else declarationPath.insertBefore([memoDeclaration]);
    }
    declaratorPath.get('init').replaceWith(twinInit);
    declaratorPath.get('id').replaceWith(leafTwin);
    return true;
  }

  // the leaf pattern a nested leaf's twin binds: a clone of the source's, where a prop an EARLIER claim already
  // queued (a static beside the instance leaf) stays that claim's - a consumed one leaves the twin, its own
  // extraction binding it, and a SENTINEL one, an effectful key the residual keeps, follows into the twin with
  // its job, skipped, since the re-walk would claim it a second time
  function twinLeafPattern(declaratorPath, leafPattern) {
    const leafTwin = cloneNode(leafPattern);
    const consumed = new Set();
    for (const job of queuedJobsFor(declaratorPath)?.jobs ?? []) {
      const index = leafPattern.properties.indexOf(job.prop);
      if (index === -1) continue;
      if (!job.sentinel) {
        consumed.add(leafTwin.properties[index]);
        twinDroppedJobs.add(job);
        continue;
      }
      job.prop = leafTwin.properties[index];
      job.pattern = leafTwin;
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    leafTwin.properties = leafTwin.properties.filter(item => !consumed.has(item));
    return leafTwin;
  }

  // the read a nested leaf's twin destructures. a DEFAULT on the SLOT folds into it: what the twin
  // binds off is the slot's own value when it is defined and the default when it is not, through the
  // render canon. mirroring the default alone polyfills the arm that may never run and leaves the live
  // one raw
  function slotDefaultFold({ slotDefault, nav, metaPath }) {
    if (!slotDefault) return nav;
    const slotGuardRef = injector.generateDeclaredRef(metaPath);
    return buildInstanceDefaultGuard({
      assignedRef: identifier(slotGuardRef),
      call: nav,
      defaultValue: cloneNode(slotDefault),
      reread: identifier(slotGuardRef),
    });
  }

  // the twin of a hop whose level keeps SIBLINGS (`hopSplitPlan`): the hop's prop leaves its level and
  // the leaf binds off the twin in a declaration of its own - the pair (memo, twin) ahead of the host
  // where the hop led it, behind it otherwise. the host pattern is edited in place: the traversal stands
  // inside the hop, whose subtree is skipped, and a fresh copy of the host would walk its earlier props
  // again, each queueing the claim it already queued
  function splitHopOutOfHost({ declarationPath, split, pair }) {
    markSubtreeSkipped(skippedNodes, split.hopProp);
    pruneHopFromLevels(split);
    if (split.placeBefore) declarationPath.insertBefore(pair);
    else declarationPath.insertAfter(pair);
  }

  // every name a pattern binds, in source order - what an exported host has to keep exporting once
  // its wrapper comes off
  function collectPatternNames(patternNode) {
    const names = [];
    if (patternNode) walkPatternIdentifiers(patternNode, id => names.push(id.name));
    return names;
  }

  // the ownership answer is the core's `typedNavClaimChain`; this leg only adds what its own
  // registration knows - the hop chain it walked, every level of it spellable as a member (the climb
  // refuses a computed hop that folds to no static name, so a standing chain needs no second test)
  function typedNavChainFor({ kind, entry, chain, metaPath, allowSurfaceBase = false }) {
    if (kind !== 'instance' || !chain.length) return null;
    // the SURFACE opt-in belongs to the instance dispatch alone: the SYMBOL claim's own shape over
    // such a hop is the anchored re-key (`{ [_Symbol$iterator]: a } = _Map`), which both legs print,
    // and granting it a chain here retires the very refusal that keeps the key in the residual
    return typedNavClaimChain(metaPath, { adapter, allowSurfaceBase: allowSurfaceBase && entry !== 'get-iterator-method' });
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
    const keyCtx = { scope: metaPath.scope, adapter, path: metaPath };
    // the bodyless slot extracts every resolvable prop; an INSTANCE read requires a
    // reusable receiver (the extraction re-reads it), a SENTINEL (SE key / rest) keeps
    // its renamed residual beside the extractions
    let initValue = peelTransparentExpr(initNode ?? host.declarator.init);
    // an SE SEQUENCE init lifts its prefix as block statements; only the TAIL is the
    // receiver and must be quiet (`(eff('a'), globalThis)` -> `eff('a'); var from = ...`) - the live
    // arm's prefix of a selection the build decides with it (`liftedPrefixSplit`)
    let seqPrefix = null;
    const initSplit = liftedPrefixSplit(initValue, keyCtx);
    if (initSplit.prefix.length) {
      seqPrefix = initSplit.prefix;
      initValue = initSplit.tail;
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
            && (soleConsume || (sentinel && prop.computed && computedKeyHasSideEffects(prop, keyCtx)));
    // ... and a MEMO bounds any other instance shape the same way: the init evaluates in
    // the `_ref` declaration alone - the extraction dispatches on the ref, a surviving
    // residual reads the same ref (`if (c) var { at, ...rest } = getObj();` -> the block
    // memo - babel's shape)
    // a NON-instance claim reads nothing off the receiver, but a SURVIVING residual does, and the
    // block the drain opens hosts a memo for it exactly like the instance twin - so an effectful
    // init is no reason to decline here either (`if (c) var { Map: { groupBy: g }, other } = mk();`)
    const memoBoundsInit = (kind === 'instance' && !chain.length && !soleConsume)
      || (kind !== 'instance' && !soleConsume);
    const literalRoute = planLiteralRoute({
      metaPath, prop, kind, sentinel, chain, declarator: host.declarator, declaration: host.declaration, adapter,
    });
    const nestedReceiver = chain.length ? literalRoute.literalReceiver : null;
    const carriedReceiver = literalRoute.receiverCarriesInit ? nestedReceiver : null;
    const relaxedNestedReceiver = literalRoute.relaxedReceiver && !carriedReceiver ? nestedReceiver : null;
    // The carried receiver owns its prefix inside the dispatch; the block lifts nothing.
    if (carriedReceiver) seqPrefix = null;
    // ... unless the chain NAMES a built-in surface: there the VALUE BUILDER spells the receiver by
    // NAME (`_globalThis.Array.prototype`), the way the ordinary route does one host down, and this
    // slot only has to host the guard. the leaf is handed over UNDEFAULTED - the slot's own
    // `=== void 0` is the guard, and a second one inside the value would run the default twice
    // ... and a TYPED outer hop composes under this host on the same terms as under the plain
    // declarator: the hop dispatch feeds the leaf, so the slot needs no re-readable receiver of
    // its own. the receiver is handed over as the value it IS - this host holds nodes, not paths
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost } = planNestedDefaultHop({
      chain, kind, entry, path: metaPath, receiverPath: { node: initValue, scope: metaPath.scope },
    }, defaultCtx);
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
    // a resolved ELEMENT living inside the init memoizes when a residual survives: the memo
    // holds the element, the kept init reads the ref in its slot, and the dispatch shares
    // the identity (`{ a, y: { flat: m } } = { a: se(), y: [3, [1, 2]] }` -> the block memo)
    const nestedMemoNode = nestedReceiver && nodeHoldsSubtree(initValue, nestedReceiver)
      && !mayHaveSideEffects(nestedReceiver) ? nestedReceiver : null;
    if (kind === 'instance' && chain.length && !carriedReceiver
      && !isReReferenceableReceiver(nestedReceiver) && !surfaceLeafValue
      && !(relaxedNestedReceiver && nestedMemoNode)) {
      // The ordinary drain can capture a slot that this compact host cannot re-read.
      // Re-detect every declarator inside the same conditional var scope.
      ledger.delete(host.declaration);
      host.declarationPath.replaceWith(blockStatement([host.declaration]));
      markRewrite();
      return;
    }
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
        return carriedInitReceiverNode({ path: metaPath, initNode: host.declarator.init, adapter })
          ?? dispatchReceiver;
      }
      if (nestedReceiver || seqPrefix?.length || initNode) return dispatchReceiver;
      return host.declarator.init ?? dispatchReceiver;
    }
    // ... while a receiver-LESS claim reads nothing a memo would share: the residual evaluates the init
    // where it stands, ordered around the extraction by the shared residual canon (the other leg's shape)
    const needsMemo = (!reusableInit && !soleConsume && kind === 'instance' && (!nestedReceiver || !!nestedMemoNode))
      // ... and an SE-KEY sentinel over a SEQUENCE init memoizes the sequence WHOLE: the memo is where
      // the prefix runs, the residual and the dispatch read the ref (`var _ref = (mark(), arr), { [k]:
      // _unused, z } = _ref, s = _at(_ref)` - the statement host's own shape)
      || (!!seqPrefix?.length && sentinel && kind === 'instance' && computedKeyHasSideEffects(prop, keyCtx) && !nestedReceiver);
    const consumeResidualRead = needsMemo && !!planSideEffectKeyStrategy({
      polyfillKind: kind,
      entry,
      prop,
      pattern,
      hostPattern: host.declarator.id,
      sourceBindingCount: patternBindingCount(host.declarator.id),
      receiverNode: nestedReceiver,
      capturedReceiverNode: nestedMemoNode,
      propKeyIsPure: !computedKeyHasSideEffects(prop, keyCtx),
    })?.consumeResidualRead;
    if (kind !== 'global') registerExtractAliases({
      metaPath,
      kind,
      entry,
      hintName,
      prop,
      declaration: host.declaration,
      declarationPath: host.declarationPath,
    });
    recordJob({
      hostPath: host.declarationPath,
      job: {
        prop,
        pattern,
        chain,
        // ... the relaxed slot's leaf keeps its key as a sentinel in the residual that reads the ref -
        // the statement host's shape (`var { M: { name: _unused } } = { M: _ref }`)
        sentinel: sentinel || !!(relaxedNestedReceiver && nestedMemoNode),
        declarator: host.declarator,
        declaration: host.declaration,
        local: propLocalName(prop),
        host: 'bodyless-decl',
        metaPath,
        needsMemo,
        consumeResidualRead,
        seqPrefix,
        initTail: initValue,
        nestedMemoNode,
        readsReceiver: kind === 'instance',
        // the ARRAY-wrapped host keeps its wrapper: the quiet tail replaces the ELEMENT,
        // not the whole init
        initHost: initNode ?? null,
        defaulted,
        value: kind !== 'instance'
          ? () => guardedSlotValue(identifier(injectPureImport(entry, hintName)), defaultNode, guardRef)
          : surfaceLeafValue
            ? (ref, product) => guardedSlotValue(surfaceLeafValue(null, product), defaultNode, guardRef)
            : needsMemo
            ? (ref, product) => guardedSlotValue(
              renderDestructureDispatch(identifier(injectPureImport(entry, hintName)), identifier(ref), product),
              defaultNode,
              guardRef,
            )
            : (ref, product) => guardedSlotValue(
              renderDestructureDispatch(identifier(injectPureImport(entry, hintName)), cloneNode(liveDispatchReceiver()), product),
              defaultNode,
              guardRef,
            ),
      },
    });
  }

  // eslint-disable-next-line max-statements -- per-form host dispatch sequence
  function handleDeclaratorHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    const keyCtx = { scope: metaPath.scope, adapter, path: metaPath };
    // a pattern a per-branch mirror already owns is spelled whole by its literal - an extraction
    // here would bind the same leaf a second time and lift the branch as a bare statement
    const host = classifyDeclarationHost(hostParent);
    if (!host || chain.some(level => branchMirrorPatterns.has(level.outerPattern))) return;
    // a LOOP HEAD hosts no statement, and its declarator no init: what it destructures is an
    // ELEMENT of the iterated literal, and the shared mirror swaps that element in place inside
    // the array - read afresh on every pass. asked here because this leg's other mirror hooks sit
    // on the param and array-wrapper routes, which a head reaches neither of
    if (host.head && renderNestedParamSynth({ metaPath, meta })) return;
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
    const proxyInitSurface = selectingInitSurface(declarator.init, metaPath);
    const allProxyInit = !!proxyInitSurface;
    // Source admission records the prefix owner before children rewrite its live nodes.
    const initializerNavigation = planInitializerNavigation({
      init: declarator.init, prop, kind, entry, keys: hopChainKeys(chain),
      sourcePattern: declarator.id, forInit,
    }, { ...keyCtx, resolvePure: guardCtx.resolvePure, isOwnAlias: isOwnPureAlias });
    const seCarried = !!initializerNavigation?.carried;
    const carriedInitValue = seCarried ? initializerNavigation.receiver : declarator.init;
    // ... and an init the pattern DESCENDS - a literal holding the receiver in one of its slots -
    // is a nav receiver by what the hops land on, not by what the init spells: the shared decision
    // walks through the literal and hands back the nav those hops name, which is what dispatches
    // (`{ w: { Array: { prototype: { at } } } } = { w: globalThis }` reads `_globalThis.Array
    // .prototype`, exactly as its identifier-init twin does)
    const navDispatch = kind === 'instance' && chain.length > 0 ? resolveNestedNavDispatch(metaPath, { adapter }) : null;
    const pureNav = ((forInit || seCarried
      ? isPureNavAfterSePrefix(carriedInitValue, guardCtx)
      : isPureNavReceiver(declarator.init, guardCtx)) && navRootReReadable(declarator.init, metaPath))
      || allProxyInit
      || (!!navDispatch?.dispatch?.root && isPureNavReceiver(navDispatch.dispatch.node, guardCtx)
        && (sentinel || receiverPerformsEveryInitEffect(declarator.init, navDispatch.dispatch.node, keyCtx)));
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost } = planNestedDefaultHop({
      chain, kind, entry, path: metaPath, receiverPath: hostReceiverPath(hostParent),
    }, defaultCtx);
    const typedNavChain = typedNavChainFor({ kind, entry, chain, metaPath, allowSurfaceBase: true });
    // An anchored symbol keeps its key swap when extraction would change a raw default
    // or leave an effectful key without its source slot.
    const literalRoute = planLiteralRoute({
      metaPath,
      prop,
      kind,
      sentinel,
      chain,
      declarator,
      declaration,
      pureNav: pureNav || !!typedHopPure,
      forInit,
      adapter,
      entry,
      typedNavChain,
      allProxyInit,
      patternCtx: { ...nodeSite(prop, metaPath), adapter },
    });
    if (!literalRoute.admitted) return;
    const {
      soleBinding,
      declaratorConsumedWhole,
      relaxedReceiver,
      carriedLive,
      receiverConsumesInit,
      sentinelMemoEligible,
      memoSibling,
    } = literalRoute;
    let { literalReceiver, forInitLiteral } = literalRoute;
    // a for-init SENTINEL needs a receiver the residual can read a second time: the memo
    // gives it one, and a bare IDENTIFIER init already is one (`{ at, ...rest } = arr` ->
    // `at = _at(arr), { at: _unused, ...rest } = arr`)
    if (forInit && sentinel && !sentinelMemoEligible && kind === 'instance'
      && peelTransparentExpr(declarator.init)?.type !== 'Identifier') return;
    // a value-SELECTING conditional init under a sentinel-kept prop: the per-branch mirror
    // owns the claim - an unconditional extraction would corrupt the non-global branch.
    // a fallback LOGICAL keeps extracting: its resolved left is the always-truthy receiver
    if (sentinel && !sentinelMemoEligible && divergingSentinelSelectorDeclines(
      { declarator, meta, metaPath, chain, kind },
      { adapter, injectorState, resolveGlobalPolyfill },
    )) return;
    // a for-init FULL consume needs no statement slot: the drain keeps the init in a `_ref`
    // declarator beside the extractions (`for (const _ref = bump(), parse = _JSON$parse;`),
    // so the opaque-memo route - which hoists a STATEMENT - must not claim it
    // a TYPED-HOP composition reads the init exactly ONCE, inside its own dispatch, and the whole
    // pattern goes with it - so an opaque init needs no memo channel here, the same single-read
    // contract that lets a sole consume spell an effectful receiver in place. without this the
    // composed claim shipped native over a CALL receiver while it composed over a bare binding
    const typedHopSoleConsume = !!typedHopPure
      && patternBindingCount(declarator.id) === patternBindingCount(prop.value);
    // A typed nav that consumes its declarator reads any root once, including an unbound name.
    const typedNavSoleConsume = !!typedNavChain
      && patternBindingCount(declarator.id) === patternBindingCount(prop.value);
    // a nested leaf off a COMPUTED root beside a host sibling: the whole init memoizes, as the
    // sibling's own claim memoizes it, and the leaf dispatches on the hop read off that ref
    // (`{ data: { at }, keys } = mk()` -> `const _ref = mk(); const at = _at(_ref.data);`). a DEFAULTED
    // leaf rides it too: its guard reads the dispatch off the ref (the drain's memo-job value)
    if (!typedNavChain && !sentinel && !forInit && chain.length > 0 && kind === 'instance' && propBindingIdentifier(prop.value)
      && entry !== 'get-iterator-method' && computedRootMemoChain(metaPath, adapter)) {
      recordJob({
        hostPath: exported ? declarationPath.parentPath : declarationPath,
        job: {
          prop, pattern, chain, kind, entry, hintName, declarator,
          local: propLocalName(prop), host: 'memo-decl', exported, metaPath,
          initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
          sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure }),
        },
      });
      markRewrite();
      return;
    }
    // a SENTINEL claim skips the opaque route below because its residual outlives the whole-init
    // memo - the one question that skip owns. the nested-instance stand-down there is not that
    // question, and without it the claim dispatches on the HOST the memo would have held
    if (sentinel && !literalReceiver
      && nestedInstanceWithoutSelectingInit({ chain, kind, init: declarator.init })) return;
    if (!sentinel && !literalReceiver && !pureNav && !typedHopSoleConsume && !typedNavSoleConsume
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
        initializerNavigation,
      });
      if (opaque === 'handled') return;
      ({ literalReceiver, forInitLiteral } = opaque);
    }
    // the ctor-alias registration is independent of the extraction: the destructured local holds
    // the surface ctor whether or not a value renders (`{ Array } = globalThis` keeps the
    // destructure and a later `Array.from` still resolves through the alias; `const { self:
    // { Symbol: S } } = globalThis; obj[iterator]` folds off `S`'s hops). the drain swaps the value
    // in place, and babel reaches the same through its in-place rewrite - what the walk-time judges
    // of both legs then see
    if (kind === 'global' && hintName && prop.value.type === 'Identifier') {
      registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath });
    }
    const literalPlan = planLiteralKeepKey({
      kind,
      entry,
      prop,
      pattern,
      sentinel,
      declarator,
      declaration,
      soleBinding,
      forInit,
      literalReceiver: forInitLiteral ? null : literalReceiver, relaxedReceiver, exported,
      slotMemo: literalRoute.slotMemo ?? null,
      metaPath,
      declaratorConsumedWhole,
      carried: !!carriedLive,
      receiverConsumesInit,
      // ... and an ALL-PROXY SELECTING init is re-readable the same way a bare proxy root is:
      // every branch names the same surface, so the sibling needs no kept key
      symbolPatternResidual: isSymbolIteratorPatternClaim(prop, entry)
        && pattern.properties.length > 1 && !allProxyInit
        && !findProxyGlobal(declarator.init, keyCtx),
      allProxyInit,
    });
    if (!literalPlan) return;
    if (literalPlan.unwrapExport) {
      unwrapExportedHost(hostParent.parentPath);
      return;
    }
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
    }, sentinelMemoNames, mintRefName);
    const catchBorn = relocatedHostFoldsGuardRefs(hostParent);
    // ... and where the hops descend a LITERAL init, the receiver the dispatch spells is the nav
    // those hops NAME, not the literal they start in: the shared decision walked through it, so the
    // root and the keys left over are what the render reads (`{ w: { Array: { prototype: { at } } } }
    // = { w: globalThis }` dispatches on `_globalThis.Array.prototype`, its identifier twin's shape)
    const navSurface = !literalReceiver && !memoRecv && navDispatch?.dispatch?.root
      && peelTransparentExpr(declarator.init)?.type !== 'Identifier'
      ? navDispatch.dispatch : null;
    const chainKeys = navSurface ? navSurface.keys : hopChainKeys(chain);
    let value = buildValue({
      guardCtx,
      kind,
      entry,
      hintName,
      // ... a slot memo's leaf may navigate on from the slot: those keys spell off the ref
      receiverNode: memoRecv
        ? (literalRoute.slotMemo?.navKeys ?? []).reduce(memberFromKeyName, memoRecv.ident ?? identifier(memoRecv.refName))
        : navSurface ? navSurface.root
          : literalReceiver ?? (allProxyInit ? proxyInitSurface : carriedInitValue), prop,
      typedHop: typedHopPure ? { pure: typedHopPure, defaultHost: typedHopDefaultHost } : null,
      typedNavChain,
      nested: (!literalReceiver || !!typedHopPure) && chain.length > 0, chainKeys, metaPath,
      literalRoute: (!!literalReceiver && !memoRecv) || sentinelMemoEligible,
      // the live reader is offered whenever the receiver IS this declarator's own init - a LITERAL
      // route reads it too, since a claim inside that init renders by replacing its node and the
      // captured copy would ship the source read. an ELEMENT or a memo names a slot of its own, and a
      // CARRIED prefix leaves the tail it yields: the drain carries that prefix, so a dispatch reading
      // the whole init would run it twice (`(o.k = _self, _self.Array.prototype)`)
      liveReceiver: carriedLive ?? (seCarried || memoRecv || allProxyInit
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
    if (isSymbolIteratorPatternClaim(prop, entry)) {
      const leaf = symbolIteratorInstanceLeaf({
        value: prop.value, resolvePure: m => resolvePure(m, metaPath), isDisabled: null,
        keyNameOf: leafProp => leafProp.key?.name ?? leafProp.key?.value ?? null,
      });
      if (leaf) {
        const inner = value;
        const leafId = injectPureImport(leaf.instanceEntry, leaf.instanceHint);
        collapseLeafName = leaf.localName;
        value = (ref, product) => renderDestructureDispatch(identifier(leafId), inner(ref), product);
      }
    }
    // a symbol-PATTERN sibling leaves a residual that must still SPELL the key: over a
    // memoized receiver, or an init the collapse does not own, the sentinel is what keeps
    // the source's own read of the slot in the pattern
    // ... and an ALL-PROXY SELECTING init IS owned by the collapse: every branch names the same
    // surface, so the extraction reads it off the ponyfill and the residual dies whole
    if (!keepKey && isSymbolIteratorPatternClaim(prop, entry)
      && pattern.properties.length > 1
      && (memoRecv || (!allProxyInit
        && !findProxyGlobal(declarator.init, keyCtx)))) {
      keepKey = true;
    }
    markRewrite();
    // the extracted binding registers as a body-extract alias DURING the walk, so a later
    // use folds / narrows through it (`{ iterator } = globalThis.Symbol; arr[iterator]` ->
    // `_getIteratorMethod(arr)`); ctor aliases (kind global) registered above
    if (kind !== 'global') registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath });
    const sinkDrop = forInit && !!discardedReceiverEffects(declarator.init, { scope: metaPath.scope, adapter, path: metaPath })?.length;
    recordJob({
      hostPath: exported ? declarationPath.parentPath : declarationPath,
      job: {
        prop,
        pattern,
        chain,
        sentinel: keepKey,
        exported,
        declarator,
        local: propLocalName(prop),
        value,
        collapseLeafName,
        eagerMemoName: sentinelMemoNames.get(declarator) ?? null,
        metaPath,
        sinkDrop,
        // ... less the read the dispatch itself performs: a carried receiver the claim dispatches on is
        // read once, by that dispatch
        sinkKeep: forInit && !receiverConsumesInit && (mayHaveSideEffects(declarator.init)
          || discardRescueNodesWithReads({ node: declarator.init, scope: metaPath.scope, adapter, path: metaPath })
            .some(node => !literalReceiver || !nodeHoldsSubtree(literalReceiver, node))),
        // the sink's re-read target resolves on the PRISTINE tree, like every other memo arg -
        // asked only of a MULTI-HOP nav that survives the sink, the one shape whose root the
        // walk would otherwise respell as its own hop pure (`_self.Array` for `_globalThis.Array`)
        sinkPlan: forInit && peelTransparentExpr(peelTransparentExpr(declarator.init)?.object)?.type === 'MemberExpression'
          && !sinkDrop
          && patternBindingCount(declarator.id) === patternBindingCount(prop.value)
          ? planMemoArg(declarator.init, metaPath) : null,
        symbolPattern: isSymbolIteratorPatternClaim(prop, entry),
        defaulted: prop.value.type === 'AssignmentPattern',
        // the shape of the read a full consume discards, planned on the PRISTINE tree: by drain
        // time the walk has collapsed the nav and the probe's own question is unanswerable
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure }),
        seKey: prop.computed && computedKeyHasSideEffects(prop, keyCtx),
        readsReceiver: kind === 'instance',
        consumeResidualRead: literalPlan.consumeResidualRead,
        seCarried,
        // a dispatch spelling the init itself is that init's one evaluation: the loop head keeps no
        // sink for it (`for (const at = _at(mk().y);;)`)
        initRidesValue: !!value.spellsInit,
        // the prefix rides the extraction's own value only where the claim spells an INSTANCE
        // dispatch to hold it; a receiver-less static and the symbol leaf bind their pure directly,
        // and there both legs lift (babel's `LIFT_SE_*` strategy family does the same)
        carriesPrefix: kind === 'instance' && entry !== 'get-iterator-method',
        catchBorn,
        memoRecv,
        // a slot memo WRITTEN in its slot: the residual performs the write, so the extraction
        // reading the ref lands after it (the array wrapper's effectful-neighbour order)
        captureInResidual: !!memoRecv?.inSlot,
        capturedSibling: capturedSiblingHosts.has(declarator),
        siblingAppend: siblingAppend || capturedSiblingHosts.has(declarator),
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

  // the shared memo for a wrapper ELEMENT several claims read: one deferred plan per element
  // node, its number taken at drain like every other memo this emitter plants
  function elementMemoFor(element, hostNode, { inSlot = false, metaPath = null } = {}) {
    let memo = literalMemoNames.get(element);
    if (!memo) {
      // the SLOT is captured while the identity still holds: a claim rendering INSIDE this element
      // replaces the node, and a memo holding the old one strands itself
      memo = { ident: identifier(''), node: element, slot: findNodeSlot(hostNode, element), deferred: true };
      // ... and behind an EFFECTFUL predecessor nothing may hoist: the memo takes the SLOT itself,
      // a write the literal performs where native evaluates the element, and every reader follows
      // the declaration (`var _ref; const [, {...}] = [eff(), _ref = X]; const a = _at(_ref);`)
      if (inSlot) {
        memo.refName = injector.generateDeclaredRef(metaPath);
        memo.ident.name = memo.refName;
        memo.deferred = false;
        memo.inSlot = true;
      }
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
      // a declarator binds the local itself, so its binding always carries the node
      const aliasBinding = adapter.getBinding({ scope: metaPath.scope, name: localName, path: metaPath });
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
    } else if (kind !== 'global' && entry
      && (prop.value.type === 'Identifier' || prop.value.type === 'AssignmentPattern')) {
      injectorState?.registerBodyExtractAlias?.(propLocalName(prop), entry, metaPath.scope?.getBinding?.(propLocalName(prop)));
    }
  }

  // the aliases this leg minted for a global (`_globalThis`): the re-read question's per-leg lookup
  function isOwnPureAlias(name) {
    return !!injectorState?.getBindingInfo?.(name);
  }

  // Apply the common overwrite product in the native statement/sequence slot. The
  // deferred render follows borrowed receiver and default slots after child rewrites.
  function emitAssignmentOverwrite({
    metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent, exprStmtPath, seqHostStatement, bodyless,
  }) {
    if (exprStmtPath?.node?.type !== 'ExpressionStatement' && !seqHostStatement) return false;
    const keyCtx = { scope: metaPath.scope, adapter, path: metaPath, injectorState };
    const receiverPlan = planAssignmentOverwrite({
      path: metaPath,
      assignment: hostParent.node,
      entry,
      chain,
      pending: true,
    }, {
      ...keyCtx,
      isOwnAlias: isOwnPureAlias,
      resolvePure,
      resolveGlobalPolyfill,
      injectorState,
      resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
    });
    if (!receiverPlan) return false;
    const bindingId = receiverPlan.target;
    if (receiverPlan.kind === 'capture') {
      const { capture } = receiverPlan;
      const rendered = renderNestedKeyedPatternCapture(capture, {
        mintRef: () => injector.generateDeclaredRef(metaPath), assignment: true, embed: cloneNode,
        renderLeaf: capture.inlineLeaf ? receiverNode => assignmentExpression('=', cloneNode(bindingId), buildValue({
          kind,
          entry,
          hintName,
          receiverNode,
          prop,
          nested: false,
          chainKeys: [],
          metaPath,
          literalRoute: true,
          guardCtx: navGuardCtx(metaPath),
        })()) : null,
      });
      // the capture copies the pattern's targets: the source pattern leaves
      noteRenderRetiredWrites(hostParent.node.left);
      if (!seqHostStatement) {
        const statements = rendered.expression.expressions.map(expressionStatement);
        if (bodyless) exprStmtPath.replaceWith(bodylessSlotReplacement(exprStmtPath.node, statements));
        else exprStmtPath.replaceWithMultiple(statements);
      } else hostParent.replaceWith(rendered.expression);
      markRewrite();
      return true;
    }
    const id = injectPureImport(entry, hintName);
    const overwriteRef = receiverPlan.fallback ? identifier(injector.generateDeclaredRef(metaPath)) : null;
    markRewrite();
    const overwriteJob = {
      host: 'assign-overwrite',
      local: bindingId.name ?? null,
      bodyless,
      seqHostStatement,
      // the drain asks the consumed host's remains through the claim's own path (a realm nav lifts by it)
      metaPath,
      // the raw slot goes with the dispatch that re-spells it - the shared canon answers which
      // slots may leave, and the drain removes the prop and drops an emptied host
      prunesSlot: receiverPlan.prunesSlot,
      carriesInit: !!receiverPlan.carriesInit,
      prop,
      pattern,
      chain,
      sentinel,
      assignment: receiverPlan.liveReceiver ? null : hostParent.node,
      value: () => {
        // Follow the plan's borrowed slot after child rewrites, then embed it once.
        const node = !receiverPlan.liveReceiver && receiverPlan.refresh ? resolveNestedReceiverNode(metaPath,
          { allowSePeeledFragment: true, allowInitCarriedEffects: true, adapter }) ?? receiverPlan.node : receiverPlan.node;
        const pure = !receiverPlan.liveReceiver && receiverPlan.rebind
          ? bareProxyGlobalPure(peelTransparentExpr(node), metaPath, { adapter, resolveGlobalPolyfill }) : receiverPlan.pure;
        const receiver = renderNestedExtractionReceiver({ ...receiverPlan, node, pure }, {
          embed: source => duplicateReceiver(source, injector),
          importPure: target => identifier(injectPureImport(target.entry, target.hintName)),
        });
        const call = callExpression(identifier(id), [receiver]);
        return renderAssignmentOverwrite(receiverPlan, {
          call, ref: overwriteRef, embed: source => source, defaultGuard: buildInstanceDefaultGuard,
        });
      },
    };
    attachAssignmentSentinelMinter(overwriteJob, { seqHostStatement, metaPath, injector, mintUnusedName });
    recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath, job: overwriteJob });
    return true;
  }

  // eslint-disable-next-line max-statements -- per-form host dispatch sequence
  function handleAssignmentHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    const keyCtx = { scope: metaPath.scope, adapter, path: metaPath, injectorState };
    // An overwrite needs a statement or a discarded sequence element of its own.
    // Transparent wrappers do not change that native insertion slot.
    const exprStmtPath = peelParenAndTSParentPath(hostParent);
    const seqHostStatement = exprStmtPath?.node?.type !== 'ExpressionStatement'
      && discardedSequenceElement(hostParent) ? hostStatementOf(hostParent) : null;
    const bodyless = !seqHostStatement && !statementListOf(exprStmtPath?.parentPath?.node);
    // A defaulted instance prop with an effectful key keeps its raw destructure;
    // the shared overwrite reads the binding that already ran the source default.
    if (prop.value.type === 'AssignmentPattern' && kind === 'instance' && computedKeyHasSideEffects(prop, keyCtx)) {
      return emitAssignmentOverwrite({
        metaPath,
        kind,
        entry,
        hintName,
        prop,
        pattern,
        chain,
        sentinel,
        hostParent,
        exprStmtPath,
        seqHostStatement,
        bodyless,
      });
    }
    // the RHS as the route's QUESTIONS see it: a dead chain marker is a spelling of this
    // parser's dialect, not a shape, so every shape question below reads the nav it wraps.
    // the node-carrying sites keep `hostParent.node.right`: the receiver handed to the render,
    // the lifted prefix, the liveness identity - what sits in the slot is what the emitters
    // mutate - and the two PROBE planners, whose plan re-emits the read the source performs,
    // so it owes the source's own spelling (peeling there moves neither corpus, measured)
    const guardCtx = navGuardCtx(metaPath);
    const rhs = peelDeadChainMarker(hostParent.node.right, guardCtx);
    // A logical guard keeps its falsy path and all rest reads: a mirror cannot replace a rest receiver,
    // and a leaf the ordered capture declined keeps its read native.
    if (rhs?.type === 'LogicalExpression' && rhs.operator === '&&' && chain.length > 0
      && kind !== 'instance' && hasRestSibling(pattern, keyCtx)) return;
    // the extraction's validity proof through a CAPTURE, the declarator host's own question asked
    // where the pattern is an assignment target: a captured selection whose arms do not all resolve
    // keeps the source's own read, or the ponyfill lands over whatever the opaque arm holds. the
    // host does not change the answer, only which route asks it
    if (capturedSelectionDeclinesExtraction({
      selecting: peelTransparentExpr(rhs), meta, metaPath, soleBinding: false, chain, kind,
    })) {
      routeSelectionMirror(metaPath, handlePerBranch, meta);
      return;
    }
    // the hop-host note is taken AHEAD of every route: a claim this host CONSUMES never reaches the
    // stand-down below, and the residual it leaves behind re-anchors like an untouched one
    noteStaticHopPatternCallHost();
    // a CAPTURED result hands its reader the receiver itself, so no channel here may rewrite it: the
    // ordered capture is its route, and a leaf it declined keeps its read native
    if (exprStmtPath?.node?.type !== 'ExpressionStatement' && !seqHostStatement) return;
    // a DISCARDED sequence element has no statement slot of its own: the shared plan answers there first,
    // as on the other leg, and its bail keeps the read native over a receiver it cannot prove
    if (seqHostStatement && kind !== 'instance' && chain.length > 0 && renderNestedParamSynth({ metaPath, meta })) return;
    // a value-SELECTING RHS under a NESTED static leaf routes to the per-branch mirror,
    // the declarator host's decline (babel mirrors too; the extraction
    // route discards the selection and drags the substituted root in as a dead import)
    // ... the RHS the leaf's own level reads: an inner default of its own ahead of the host's. the
    // shared plan settles that level first - a value the host's literal pairs proves the default
    // DEAD (nothing to mirror, the babel leg's `dead` arm), an all-proxy selection mirrors whole -
    // and only a selection the plan cannot spell goes to the per-branch mirror
    const levelRhs = nestedLeafSelectingReceiver(metaPath, rhs);
    if (kind !== 'instance' && chain.length > 0 && levelRhs !== rhs
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(levelRhs)?.type)) {
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
      if (!selectingInitSurface(levelRhs, metaPath)) {
        routeSelectionMirror(metaPath, handlePerBranch, meta);
        return;
      }
    }
    // ... a selection the build decides is no selection here: the operand of it that runs is the RHS the routes
    // below take (`decidedRunningOperand`), as the declarator host's selected left is
    const runningRhs = decidedRunningOperand(rhs, keyCtx);
    if (kind !== 'instance' && chain.length > 0
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(runningRhs)?.type)
      && !selectingInitSurface(runningRhs, metaPath)) {
      routeSelectionMirror(metaPath, handlePerBranch, meta);
      return;
    }
    // a HOP whose DEFAULT carries an EFFECT, the declarator host's same arm in the same order: the
    // selecting gates above answer the default they can SPELL, and this one answers the rest of
    // them - a sequence around the selection is what the type set does not name (`= (h++, u ||
    // globalThis)`), and the consume below dropped the whole mirror with it
    if (kind !== 'instance' && hopDefaultCarriesEffect(chain)) {
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
      routeSelectionMirror(metaPath, handlePerBranch, meta);
      return;
    }
    if (emitAssignStaticDefaultOverwrite({ hostParent, prop, chain, kind, entry, hintName, metaPath },
      { adapter, injectorState, injectPureImport, markRewrite, markSubtreeSkipped, skippedNodes })) return;
    // a NESTED instance leaf in a destructuring-ASSIGNMENT has no declaration to host a
    // `const`: the destructure assigns the native slot first, then an OVERWRITE statement
    // re-binds the local through the ponyfill (`({ y: { at: m } } = { y: R })` -> `m =
    // _atMaybeArray(R)` after). the receiver is DUPLICATED into that copy, so it must be
    // safe to spell twice; the clone is taken at drain time off the rewritten tree, which
    // is what makes the copy scope-aware
    // the SYMBOL leaf rides this arm like any other instance claim: its dispatch has the same shape
    // (`_getIteratorMethod(recv)`), and leaving it out kept the computed key in the residual - a
    // second read of the hop, and an import of the symbol the dispatch does not need
    // ... but NOT where that residual ANCHORS on the hop constructor's own pure binding: there it is
    // `({ [_Symbol$iterator]: it } = _Symbol)`, which reads no hop at all and needs exactly the symbol
    // import, and it is what the DECLARATION host renders on both legs. claimed here, the leaf parted
    // the two emitters on the assignment form alone
    if (kind === 'instance' && chain.length > 0 && emitAssignmentOverwrite({
      metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent, exprStmtPath, seqHostStatement, bodyless,
    })) return;
    // A bodyless slot can still use the consume route when the overwrite declined.
    // an opaque receiver still consumes when the extraction is its ONLY read: a sole
    // plain prop, instance kind (the dispatch reads once - `mapOfKept = _mapMaybeArray(X ?? {})`)
    // or an SE-free receiver a static may discard
    // an ALL-proxy selecting RHS reads like a plain proxy receiver: every LIVE branch lands
    // on the same surface, so the claim extracts off the first and the selection drops whole
    const proxyRhsSurface = selectingInitSurface(rhs, metaPath);
    const allProxyRhs = !!proxyRhsSurface;
    const pureNavRhs = allProxyRhs || isPureNavReceiver(hostParent.node.right, guardCtx);
    // the read a full consume DISCARDS, planned on the PRISTINE tree: by drain time the
    // walk has rendered the guard and the probe's own question is unanswerable
    const initProbePlan = planDiscardedInitProbe(hostParent.node.right, metaPath, { adapter, resolvePure });
    // a BODYLESS host with an SE SEQUENCE init lifts its prefix into the wrapping block
    // (`if (x) ({ Map: { g } } = (eff(), globalThis));` -> `{ eff(); g = _Map$groupBy; }`);
    // the receiver is the quiet TAIL
    let bodylessSeqPrefix = null;
    let receiverNode = allProxyRhs ? proxyRhsSurface : hostParent.node.right;
    // a sole STATIC hop whose slot holds a claim-free PATTERN over a CALL rhs: no consume route here
    // owns that shape - the leaf is pattern-valued, so the flat-leaf call lift declines, and a call
    // is no pure nav - and the source's pattern would then read the static RAW off the realm,
    // undefined where the ponyfill is the point. the drain's hop-host channel already anchors it:
    // `surfaceInitInfo` reads a tail the inline canon proves to yield a realm as that global's pure
    // binding, dropping the call where it runs no effect and keeping it ahead of the value where it
    // does, so the call still evaluates exactly once, where the source ran it. that channel is noted
    // from a realm claim SPELLED in the init, which a call init has none of - this host notes it
    // the note reads the HOST PATTERN, not this claim: a LEAF claim beside the claim-free pattern
    // (`{ Array: { of: { name, length } } }`) enters the routes below and never reaches the stand-down
    // where a claim-driven note would be taken, leaving the residual reading the static raw off the
    // realm - which the other leg anchors. the realm-identifier channel reads the host the same way
    function noteStaticHopPatternCallHost() {
      const host = hostParent.node;
      if (hopHosts.has(host) || host.left?.type !== 'ObjectPattern' || host.left.properties.length !== 1) return;
      const [hop] = host.left.properties;
      const hopKeyName = hop?.type === 'Property' && !hop.computed
        ? hop.key?.name ?? (typeof hop.key?.value === 'string' ? hop.key.value : null) : null;
      if (typeof hopKeyName !== 'string' || !isKnownStaticGlobal(hopKeyName, adapter)
        || hop.value?.type !== 'ObjectPattern' || hop.value.properties.length !== 1) return;
      const [staticProp] = hop.value.properties;
      if (staticProp?.type !== 'Property' || staticProp.computed
        || staticProp.value?.type !== 'ObjectPattern') return;
      // only a DISCARDED value: the anchored form yields the ponyfill where the source yields the
      // realm, so a captured result keeps the source (the hop-host channel's own rule)
      if (exprStmtPath?.node?.type !== 'ExpressionStatement' && !seqHostStatement) return;
      let tail = peelTransparentExpr(host.right);
      if (tail?.type === 'SequenceExpression') tail = peelTransparentExpr(tail.expressions.at(-1));
      if (!invocationNode(tail)
        || !provenRealmCallRoot(tail, metaPath, adapter, { allowEffects: true })) return;
      hopHosts.set(host, { untouched: true, wholeDeclarator: true, assignHost: true, hopKeyName, metaPath });
    }

    // the targets a pattern level writes: its bindings and its MEMBER targets - a member target reads
    // the init as surely as a binding does, and no binding count sees one
    function targetCount(level) {
      return patternBindingCount(level) + patternMemberTargetPairs(level, hostParent.node.right).length;
    }
    // the STATEMENT host lifts the same prefix as its own statements ahead
    // (`sideEffect(); from = _Array$from;` - babel's flatten); a SENTINEL residual then
    // reads the quiet tail
    // does anything OUTSIDE this claim still read the init? asked of the HOST pattern, not of the
    // claim's own one - a nested leaf sits in a pattern of its own, and its siblings live one level up
    const residualSurvives = targetCount(hostParent.node.left) !== targetCount(prop.value);
    // ... over what runs of a right the build decides (`decidedRunningPart`): its sequence lifts the same way
    const liftPlan = pureNavRhs ? null : planLiftedRhsPrefix(decidedRunningPart(hostParent.node.right, keyCtx), {
      anchorsInSequence: !!seqHostStatement && prop.value?.type === 'ObjectPattern',
      guardCtx,
      ctx: keyCtx,
    });
    if (liftPlan) {
      bodylessSeqPrefix = liftPlan.prefix;
      receiverNode = liftPlan.receiver;
    }
    // a SOLE full consume whose init runs code - an effect, or a read only a getter names (`initRunsCode`,
    // the question both legs ask) - lifts the init WHOLE as its own statement: claims land in place, the
    // assign reads the pure (`({ from: from2 } = (eff3(), globalThis).Array)` -> `(eff3(),
    // _globalThis).Array; from2 = _Array$from;`, babel's flatten); multi-prop and residual shapes stay
    // staged. a call counts however quiet: the lift is the claim's one route, and its own peel keeps
    // what the call owes (`({ groupBy: g } = mk().Map)` -> `mk(); g = _Map$groupBy;`, nothing for a
    // quiet call yielding the realm); a `||` / `??` its LEFT decides owes its prefix and the left's
    // effects alone (the lift's own peel: `({ of } = Array ?? (log(), Set))`), one it leaves undecided
    // both operands (`({ of } = globalThis.Array || (log(), Set))`)
    // ... and a DEFAULTED leaf is flat all the same: what its default costs is a guard, not a route.
    // a STATIC claim spells an always-defined ponyfill, so the default is dead and the binding is
    // its undefaulted twin; an INSTANCE dispatch answers `it.method` verbatim off a surface that is
    // not the polyfilled one, and the value render owns that guard. the KIND question belongs to
    // the lift below, which asks it on its own - this one is about the leaf's SHAPE
    const memberStaticSlot = kind === 'static' && !!memberTargetTakesExtraction(prop.value);
    const flatAssignLeaf = prop.value.type === 'Identifier' || memberStaticSlot
      || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
    if (!pureNavRhs && !bodylessSeqPrefix && !sentinel
      && pattern.properties.length === 1 && flatAssignLeaf && kind !== 'instance'
      && initRunsCode(rhs, { scope: metaPath.scope, adapter, path: metaPath })) {
      bodylessSeqPrefix = [hostParent.node.right];
    }
    const soleConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
      && pattern.properties.length === 1 && flatAssignLeaf
      && (kind === 'instance' || !mayHaveSideEffects(rhs));
    // a MULTI-prop instance consume rides the same literal route: several dispatches
    // (and any surviving residual) read ONE receiver, which the drain memoizes
    // (`({ at, includes } = [1, 2, 3])` -> `const _ref = [1, 2, 3]; at = _atMaybeArray(_ref); ...`)
    // ... a DEFAULTED leaf too, as in the sole consume: its guard is the value render's
    // ... and a REST sibling is exactly such a residual: it re-reads the receiver past the renamed
    // key, so the memo is what gives both readers one identity - the arrangement the DECLARATION
    // host already emits for the same pattern. an SE-keyed sentinel keeps its own routes below,
    // where the key's effect decides the shape rather than the receiver's re-readability
    const restSentinelOnly = sentinel && hasRestSibling(pattern, keyCtx)
      && !(prop.computed && computedKeyHasSideEffects(prop, keyCtx));
    // ... and a BODYLESS slot hosts the same arrangement: its drain opens a block, and the memo goes
    // in there with the extraction and the residual, guarded exactly as the source guarded them
    const multiInstanceConsume = !pureNavRhs && !bodylessSeqPrefix && (!sentinel || restSentinelOnly)
      && chain.length === 0
      && pattern.properties.length > 1 && flatAssignLeaf && kind === 'instance';
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
    // ... a DEFAULTED leaf rides along: its guard is the value render's (the flat twin's spelling)
    const plainOrDefaultedLeaf = prop.value.type === 'Identifier' || memberStaticSlot
      || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
    // ... but NEVER where the claim reads an INNER DEFAULT's arm rather than this host's own right
    // side: that pattern runs only when its slot is absent, and the arm it then reads may be the
    // USER's object - so consuming the destructure answers the ponyfill unconditionally, drops the
    // effect the arm carries, and leaves a residual the emitters cannot spell. Measured: the output
    // threw where native and the other leg bound the user's own members
    // a NAMED default the climb walked through is dead, and so is one the host's pairing proves
    // supplied: the level reads the host's own RHS
    const innerDefaultArm = levelRhs !== rhs && !chainThroughNamedDefaults(chain)
      && !nearestInnerDefaultDead(metaPath.parentPath, adapter);
    const staticInMultiConsume = !pureNavRhs && !bodylessSeqPrefix && (!sentinel || restSentinelOnly) && !innerDefaultArm
      && residualSurvives && plainOrDefaultedLeaf && kind !== 'instance';
    // a nested receiver-less claim over a GUARDED nav receiver consumes the destructure whole, whatever
    // its depth: the read the consume discards re-emits as the extraction's own probe prefix, and the
    // live branch is a pure binding the value reads directly (`v = ((null == _g.window ? void 0 :
    // _self).Math, _Math$sign)`)
    const guardedPureRhs = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
      && kind !== 'instance' && prop.value.type === 'Identifier' && pattern.properties.length === 1
      && !!initProbePlan;
    // ... and a SENTINEL residual keeps the receiver spelled whatever it is: the renamed slot is
    // what reads the init, exactly once, and the extraction spells its own pure beside it. this is
    // the arrangement babel prints for `({ groupBy: g, ...rest } = mk().Map)` and for the SE-key
    // twin - without it an effectful receiver had no sentinel route at all
    const sentinelKeptRhs = !pureNavRhs && !bodylessSeqPrefix && sentinel && kind !== 'instance'
      && prop.value.type === 'Identifier' && chain.length === 0;
    // ... so a live `?.` in that receiver is no obstacle either: the walk renders the nav as its
    // guard in place
    const sentinelGuardedRhs = !pureNavRhs && sentinel && chain.length === 0 && kind !== 'instance'
      && prop.value.type === 'Identifier'
      && (!!initProbePlan
        || !!planSealedNavProbe(hostParent.node.right, metaPath, probeRenderCtx));
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
    const { pure: typedHopPure, defaultHost: typedHopDefaultHost, consumesPattern } = planNestedDefaultHop({
      chain, kind, entry, path: metaPath, receiverPath: hostReceiverPath(hostParent),
    }, defaultCtx);
    const typedHopConsume = consumesPattern && !sentinel;
    const chainKeys = hopChainKeys(chain);
    // ... and a DEFAULTED nested leaf over an OPAQUE receiver has no slot for its default: the
    // overwrite spells the dispatch alone, and one answering undefined would skip the default the
    // source wrote (`({ codes: { findIndex: m = d() } } = recvF)` stays native)
    if ((!pureNavRhs && !soleConsume && !multiInstanceConsume
      && !typedHopConsume
      && !staticInMultiConsume
      && !bodylessSeqPrefix && !guardedPureRhs && !sentinelGuardedRhs
      && !sentinelKeptRhs)
      || (chain.length > 0 && prop.value.type === 'AssignmentPattern'
        // ... the arm is about the INSTANCE dispatch, which may answer undefined: the VALUE renders
        // the guard that keeps the source's default, so what is left to refuse is a receiver whose
        // SURFACE is unknown - a PROXY-GLOBAL one, bare or navigated, resolves to the polyfilled
        // surface and its claim binds the ponyfill where the source's default would have hidden it,
        // and so do hops that NAME a built-in instance surface (`{ prototype: { at: a = 1 } } = Array`;
        // a capitalised key off the user's own object names none) and a hop the receiver's TYPE
        // dispatches (the composition guards both defaults)
        && kind === 'instance' && !bareProxyGlobalRhs && !typedHopPure
        && !resolveProxyNavReceiver(bareProxyRecvNode, guardCtx)
        && !isInstanceSurfaceNav(chainKeys.reduce(memberFromKeyName, bareProxyRecvNode),
          { ctx: guardCtx.aliasCtx, isOwnAlias: isOwnPureAlias }))) {
      return;
    }
    const keepSentinelBinding = sentinel && !restSentinelOnly && prop.value.type === 'Identifier'
      && chain.every(level => !level.outerRest);
    // an SE-keyed STATIC prop in an ASSIGNMENT host keeps its key's slot and its read: a nested leaf is
    // the shared mirror's to render, and any other stays native - the key runs where the source runs it
    if (keepSentinelBinding && kind !== 'instance' && entry !== 'get-iterator-method') {
      if (chain.length) renderNestedParamSynth({ metaPath, meta });
      return;
    }
    const value = buildValue({
      guardCtx,
      kind, entry, hintName, receiverNode, prop, nested: chain.length > 0, chainKeys, metaPath,
      literalRoute: soleConsume || multiInstanceConsume,
      liveReceiver: receiverNode === hostParent.node.right ? () => hostParent.node.right : null,
      typedHop: typedHopPure ? { pure: typedHopPure, defaultHost: typedHopDefaultHost } : null,
    });
    if (!value) return;
    // the assignment-form twin of the declarator-host registrations: the ctor hint / fold
    // source is what lets a later read resolve through the extracted alias
    registerAssignmentExtractAlias({ prop, kind, entry, hintName, hostParent, exprStmtPath, metaPath },
      { adapter, injectorState });
    markRewrite();
    // an SE-keyed INSTANCE prop over a MEMBER receiver stands down whole: the kept key
    // re-reads the member in the residual and the rebuild would read it again - babel
    // declines the same shape (a CONSTANT literal re-spells freely instead, below)
    if (keepSentinelBinding && kind === 'instance' && prop.computed && computedKeyHasSideEffects(prop, keyCtx)
      && peelTransparentExpr(rhs)?.type === 'MemberExpression') return;
    // an SE-keyed SYMBOL prop under an ANCHORED hop keeps the key-swap ALONE: the kept key
    // already reads through the polyfilled symbol, and a re-bind would render the claim
    // twice; the PLAIN assignment keeps its overwrite
    if (keepSentinelBinding && entry === 'get-iterator-method' && chain.length > 0
      && prop.computed && computedKeyHasSideEffects(prop, keyCtx)) return;
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
      sealedProbePlan: planSealedNavProbe(hostParent.node.right, metaPath, { adapter, resolvePure }),
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
    attachAssignmentSentinelMinter(job, { seqHostStatement, metaPath, injector, mintUnusedName });
    recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath, job });
  }

  // a pure member nav rooted in a POSSIBLE-GLOBAL identifier, rendered via the shared
  // passthrough resolution; null when the receiver is not that shape
  function resolveProxyNavReceiver(receiver, guardCtx = null) {
    const head = proxyNavHead(receiver, { adapter, guardCtx });
    if (!head) return null;
    const ref = resolvePassthroughRef({
      keyPath: head.keys,
      receiverName: head.rootName,
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

  return {
    captureParameterInstance,
    capturePatternForExtraction,
    // the probe renders read their channel members off this object, and the channel that owns
    // them is built after this one - the two cross-reference, like the sealed-probe context
    probeRenderCtx,
    // the ONE unused-name minter of this leg: the guard render's rest residual mints its sentinels
    // through it too, so every `_unused` joins the same rename census and numbers with the rest
    mintUnusedName,
    extractCatchClause,
    mintRefName,
    extractLoopLeft,
    handleObjectPropertyResult,
    handlePerBranch,
    renderNestedParamSynth,
    tryPatternMirror,
    retireDeclaratorJobs,
    queuedJobsFor,
    recordJob,
    unwrapExportedHost,
    drain,
    sentinelAlreadyProcessed({ metaPath, meta }) {
      return sentinelAlreadyProcessed(metaPath, { node: metaPath.node, meta, injector: injectorState });
    },
    overwriteRebindEmitted: args => overwriteRebindEmitted({ ...args, injectorState, adapter }),
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
    noteMutatedCtorHopHost: declarator => hopHosts.set(declarator, { forceMutatedHop: true }),
    // a CTOR hop nothing extracted from re-anchors on its own member READ (`{ Proxy: { revocable } }
    // = globalThis` -> `{ revocable } = _globalThis.Proxy`) - only where the key names a built-in
    // the realm is known to carry (the shared ctor-key-anchor gate): a user global is an unknown
    // slot (`{ Deno: { env } = {} }` keeps its default), and a lowercase `constructor` names none
    noteUntouchedCtorHopHost(declarator, keyName, assignHost = false, metaPath = null) {
      if (!hopHosts.has(declarator) && isKnownStaticGlobal(keyName, adapter)) {
        // the key the WALK resolved travels with the note: a computed spelling bound to a
        // constant (`{ [hopKey]: { viaKey } }`) names no literal the re-anchor could read
        hopHosts.set(declarator, { untouched: true, wholeDeclarator: true, assignHost, hopKeyName: keyName, metaPath });
      }
    },
    // a PRISTINE proxy hop navigates to the same surface, so a whole-host pattern flattens
    // onto it (`{ window: { Array } }` -> `{ Array }`). at DRAIN like its siblings: the walk
    // is still running, and a pattern rewritten under it is visited a second time
    noteProxyCtorHopHost(host, metaPath, assignHost) {
      // the note fires only for a SOLE hop prop, so the pattern IS the whole host: a ctor hop
      // left below the peeled proxy one anchors on its own member read in the same pass
      if (!hopHosts.has(host)) hopHosts.set(host, { metaPath, assignHost, wholeDeclarator: true });
    },
    isRealmSelectingInit: node => !!realmSelectionCollapseOperand(node, { adapter, injectorState }),
    // the host init of the pattern this leaf sits in, where that init puts a realm PROBE on the arm
    // its own test decides - null otherwise. the arm is decided by the RECEIVER, so the question is
    // asked of the host rather than of the leaf's own meta, which says nothing about it
    realmProbeArmHostInit(metaPath) {
      const host = destructurePatternHostPath(metaPath)?.node;
      const init = host?.type === 'VariableDeclarator' ? host.init
        : host?.type === 'AssignmentExpression' && host.operator === '=' ? host.right : null;
      return init && realmProbeArmSelection(init, { adapter, injectorState }) ? init : null;
    },
    // the host rewrite, at this binding's first scoped look at the pattern - the twin of the babel
    // emitter's own, applied at the same point for the same reason: a realm-selecting init names ONE
    // object, so the selection is dead text and every route below reads a plain proxy receiver. the
    // branch it drops is skipped here, before the walk reaches it: dropped on one leg only, the other
    // still mints the imports that branch spells and the two import sets part over dead code.
    // Returns whether anything collapsed
    collapseRealmSelectingHost(metaPath) {
      const host = destructurePatternHostPath(metaPath);
      const collapses = host?.node ? realmSelectingHostCollapses(host.node,
        { adapter, injectorState, scope: host.scope, path: host }) : [];
      for (const { container, key, init, operand } of collapses) {
        container[key] = cloneNode(operand);
        markSubtreeSkipped(skippedNodes, init);
        markRewrite();
      }
      return collapses.length > 0;
    },
    // a proxy hop bound to a NAME registers as an alias of that surface - the same channel the
    // polyfillable hops take through `registerExtractAliases`, for the ones pure cannot back
    noteProxyHopAlias({ metaPath, hopKey, localName, declarationPath }) {
      // the local is the declarator's own binding, which always carries the node
      const aliasBinding = adapter.getBinding({ scope: metaPath.scope, name: localName, path: metaPath });
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
