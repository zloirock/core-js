import {
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  buildParameterArgumentSynthPlan,
  buildPatternRenderPlan,
  carriedInitReceiverNode,
  classifyCallBranchForSynth,
  consumedAssignmentSlotDropsHost,
  consumedAssignmentSlotPrunes,
  destructureAssignmentValueIsCaptured,
  destructureKeyReadPlan,
  destructurePatternHostPath,
  fallbackBranchSwapKeepsSelection,
  flattenArrayWrapperInits,
  isBuiltInSurfaceNav,
  isConstantLiteralReceiver,
  isInstanceSurfaceNav,
  isReReadableSurfaceNav,
  isReReferenceableAcrossReads,
  isReReferenceableReceiver,
  isSeFreeMemberReceiver,
  isViableBranchForKey,
  paramDefaultInstanceSynthAllowed,
  patternHopKeysToHost,
  planSideEffectKeyStrategy,
  planSynthReceiverGuard,
  qualifiesForParamBodyExtract,
  receiverPerformsEveryInitEffect,
  renderSynthTree,
  resolveNestedDestructureReceiver,
  selectionLeftAlwaysTruthy,
  resolveNestedNavDispatch,
  resolveNestedReceiverBase,
  seKeyStaticOwesTheMirror,
  hopSplitPlan,
  resolveNestedReceiverChain,
  resolveNestedReceiverNode,
  patternClaimOwesMirror,
  resolvePassthroughRef,
  resolvePositionalElementSlot,
  staticHopPure as sharedStaticHopPure,
  synthPropDedupKey,
  typedNavClaimChain,
  computedRootMemoChain,
  typedNavClaimShape,
  undefinedArmEffectiveReceiver,
  walkStaticReceiverChain,
  wrapperElementNavPlacement,
  provenRealmCallRoot,
  discardRescueNodesWithReads,
  destructureRightIsReceiver,
  nearestInnerDefaultDead,
  observablePrefixElements,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  capturedRealmCtorPure,
  isBodylessStatementSlot,
  isForInitDeclaration,
  planArrayWrapperCapture,
  planNestedKeyedPatternCapture,
  planRetainedObjectCapture,
  keyedReadReceiverProven,
  renderRetainedObjectCapture,
  renderNestedKeyedPatternCapture,
  renderArrayWrapperCapture,
} from '@core-js/polyfill-provider/destructure-host-shape';
import {
  buildNestedDestructurePlan,
  destructureHostLiteralSurvives,
  leafCarriesOwnClaim,
  resolvePolyfillableStaticProp,
  symbolIteratorInstanceLeaf,
} from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { registerBindinglessCtorAlias, registerDeclAliasIfSound } from '@core-js/polyfill-provider/helpers/class-walk';
import {
  computedKeyIsWellKnownSymbol,
  discardRescueNodes,
  findProxyGlobal,
  inlineCallReturnExpression,
  isStaticPlacement,
  navValueCanShortCircuit,
  peelChainRootValue,
  peelReceiverSequenceTail,
  realmSelectingHostCollapses,
  realmProbeArmSelection,
  realmSelectionCollapseOperand,
  resolveObjectName,
  resolveSynthKeys,
  isCallShape,
  memberTargetTakesExtraction,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  computedKeyHasSideEffects,
  computedKeysAllBound,
  substitutedGlobalKeyImport,
  forOfHeadIterableElements,
  FUNCTION_LIKE_NODE_TYPES,
  getFallbackBranchSlots,
  hasRestSiblingExcept,
  isForXStatement,
  isMirrorablePatternValue,
  isPristineProxyGlobal,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  paramsHaveInvisibleCallers,
  patternBindingCount,
  patternSlotTarget,
  patternMemberTargetPairs,
  soleChainToProp,
  isChainAssignment,
  peelFallbackBranchInner,
  peelTransparentExpr,
  peelNestedSequenceExpressions,
  POSSIBLE_GLOBAL_OBJECTS,
  prologueEndIndex,
  plainSynthKeyName,
  propBindingIdentifier,
  receiverCarriesLiveOptional,
  relocatedCatchPropUnobservable,
  relocatedHostPattern,
  resolveFallbackReceiver,
  statementListOf,
  subtreeContainsNode,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapInitValue,
  unwrapRuntimeExpr,
  walkPatternIdentifiers,
  walkAstNodes,
  discardedSequenceElement,
  allProxySelectingInit,
  firstProxyBranch,
  invocationNode,
  proxySurfaceIdentifier,
  seKeyKeepsReceiverRead,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { detectIifeArgReceiver, findSynthSwapReceiver } from './destructure-emit-utils.js';
import { nodeSite, stampNodeSite } from './nav-spine.js';
import { findNodeSlot, replaceNodeInTree } from './emit-shared.js';
import {
  renderInstanceDefaultGuard,
  renderStaticDefaultGuard,
  conditionalExpression,
  memberFromKeyName,
  nullGuardTest,
  assignmentExpression,
  callExpression,
  cloneNode,
  identifier,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
} from '@core-js/polyfill-provider/render';
import {
  absentableStoreReadKeyOf,
  applyInlineDefault,
  arrayWrapperDeclarator,
  bareProxyGlobalPure,
  buriedKeyClaimInit,
  classifyDeclarationHost,
  climbPatternChain,
  declinedWrapperTakesDefault,
  defaultedSoleConsumes,
  discardedInitProbeNavStart,
  divergingSelection,
  divergingSentinelSelectorDeclines,
  duplicateReceiver,
  eagerSentinelMemoName,
  emitAssignStaticDefaultOverwrite,
  guardedSlotValue,
  hasRestSibling,
  hopChainKeys,
  hopSlotPrefixRidesLiteral,
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
  proxyPassthroughBase,
  registerAssignmentExtractAlias,
  registerHopInstanceSynthSlot,
  registerInstanceSynthSlot,
  registerSeKeyDefaultOverwrite,
  resolveArrayWrappedReceiver,
  routeSelectionMirror,
  seCarriedHopNav,
  SELECTING_INIT_TYPES,
  namedDefaultReceiver,
  hopDefaultCarriesEffect,
  nestedLeafSelectingReceiver,
  nestedInstanceWithoutSelectingInit,
  sinkDropsReceiver,
  staticallySelectedLeft,
  swapInlineDefaults,
  synthPlanFullyCovered,
  takesInlineDefault,
  warnConditionalFallbackUntouched,
} from './destructure-helpers.js';
import { sentinelAlreadyProcessed } from '@core-js/polyfill-provider/detect-usage/own-output';
import { planGuardedStaticNarrow, planProxyReceiver } from '@core-js/polyfill-provider/detect-usage/members';
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

// the non-tail expressions of every sequence on a node's receiver SPINE - the node itself, a call's
// callee, a member's object, through the transparent wrappers - in evaluation order. the sealed-nav
// walk (`navHopSequencePrefixes`) asks a narrower question: member objects only, of a nav it guards
function spineSequencePrefixes(node) {
  const prefixes = [];
  for (let cur = peelTransparentExpr(node); cur; cur = peelTransparentExpr(cur)) {
    switch (cur.type) {
      case 'SequenceExpression':
        prefixes.push(...cur.expressions.slice(0, -1));
        cur = cur.expressions.at(-1);
        break;
      case 'CallExpression':
        cur = cur.callee;
        break;
      case 'MemberExpression':
        cur = cur.object;
        break;
      default:
        return prefixes;
    }
  }
  return prefixes;
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

  // the in-slot memo writes this channel planted, keyed by the write left standing in the slot: a
  // SIBLING claim off the same element meets that write as its receiver and reads the one ref rather
  // than spelling - and performing - the write a second time
  const slotMemoWrites = new WeakMap();
  const forInitCaptures = new WeakMap();
  const capturedSiblingHosts = new WeakSet();
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
    resolvePure,
    resolveGlobalPolyfill,
    injectPureImport,
    keepLive: skippedNodes.keepLive,
  };

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
    resolveProxyNavStatic: (...args) => resolveProxyNavStatic(...args),
    resolvePure,
    resolvedType,
    toHint,
    seqDrainedSlots,
    skippedNodes,
    synthLedger,
  });
  const { buildValue, drain, extractCatchClause, extractLoopLeft, planMemoArg, recordJob } = drains;

  // Render the shared receiver-mirror plan, or its caller-argument variant, into live source slots.
  // Keep preserved receiver/probe nodes live and retire only completed claims. With `argumentSites`,
  // return whether every caller settles the inner default arm; otherwise return the application
  // result, preserving null when no plan exists.
  function renderNestedParamSynth({ metaPath, meta, withinNode = null, argumentSites = null, fallbackOnBail = false }) {
    const leafPattern = metaPath.parentPath;
    if (!argumentSites && synthDone.has(leafPattern.node)) return true;
    const options = {
      leafPatternPath: leafPattern, meta, resolvePure: m => resolvePure(m, metaPath), adapter,
      parameterCallSites: argumentSites,
      isDisabledProp: isDisabled,
    };
    const plan = argumentSites ? buildParameterArgumentSynthPlan(options) : buildNestedParamSynthPlan(options);
    const applied = applyNestedParamSynthPlan({
      plan,
      fallbackOnBail,
      // a memoized receiver's ref: declared where the leaf's use can reach it (the ref host climbs
      // past a parameter list and a loop header)
      mintMemoRef: () => injector.generateDeclaredRef(metaPath),
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
    if (applied && !argumentSites) synthDone.add(leafPattern.node);
    // the caller mirror answers a different question than the host's: not "did a mirror render" but
    // "is the leaf's inner default arm closed for every caller" (the plan's `settled`) - a rendered
    // argument beside an open default still leaves the parameter's own rewrite to run
    // ... and a plan that DECLINED as null (an un-mirrorable pattern over a proxy-only receiver, where
    // a host-specific fallback may apply) reads as null, so a caller can tell it from a bail
    if (argumentSites) return !!plan?.settled;
    return applied || (plan === null ? null : false);
  }

  // Ask the shared mirror obligation before competing extraction routes, provided this host
  // has no queued job already owning it. Declaration, assignment and loop receivers may qualify.
  function tryPatternMirror({ metaPath, meta }) {
    // A queued extraction still reads this receiver at drain time. Leave its host to
    // the ordinary flatten so a later mirror cannot change that earlier read.
    const host = destructurePatternHostPath(metaPath);
    if (queuedJobsFor(host)?.jobs.some(job => host.node.type !== 'VariableDeclarator'
      || (job.declarator ?? job.declaratorNode) === host.node)) return false;
    const pure = resolvePure(meta, metaPath);
    if (!patternClaimOwesMirror(pure?.kind, metaPath)) return false;
    return renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true }) === true;
  }

  // a MINTED well-known-symbol key (`[_Symbol$iterator]` - the wks swap ran before this claim)
  // has no tree binding until the import flush; the shared fold vouches for it
  function mintedKeyExempt(metaPath) {
    return keyNode => computedKeyIsWellKnownSymbol({ keyNode, scope: metaPath.scope, adapter, path: metaPath })
      || !!substitutedGlobalKeyImport(keyNode, name => injectorState.getPureImport?.(name)?.hint, resolveGlobalPolyfill);
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
      || !computedKeysAllBound(pattern, metaPath.scope, mintedKeyExempt(metaPath), resolveGlobalPolyfill)) return false;
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
        { ...nodeSite(receiver, metaPath), adapter, resolveGlobalPolyfill });
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
    } else if (baseIdent?.type !== 'Identifier' && baseIdent?.type !== 'ThisExpression'
      && !(baseIdent === receiver && receiver?.type === 'MemberExpression')) return false;
    const synthGuard = planSynthReceiverGuard({
      receiver, ...nodeSite(receiver, metaPath), adapter, resolvePure: meta => resolvePure(meta, metaPath),
    });
    const dedupKey = synthPropDedupKey(metaPath.node, { scope: metaPath.scope, path: metaPath, adapter });
    if (!dedupKey) return false;
    let pending = synthLedger.get(pattern);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter, resolveGlobalPolyfill });
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
        // The guard proves its probe on the alternate branch. Preserve the collapse plan from
        // the pristine receiver so unresolved literal slots read through that proven branch.
        guardedReceiverPlan: synthGuard ? planProxyReceiver(synthGuard.fallback?.left ?? receiver, {
          aliasCtx: { ...nodeSite(receiver, metaPath), adapter }, guardedProbe: synthGuard.probe,
          resolvePure: meta => resolvePure(meta, metaPath),
        }) : null,
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
      if (synthGuard) skippedNodes.keepLive?.add(synthGuard.probe);
      markSubtreeSkipped(skippedNodes, node, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    }
    if (callBranch) {
      if (receiver.type === 'LogicalExpression' && !synthGuard) markSubtreeSkipped(skippedNodes, receiver.right);
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
  // routing (the ctor identifier arm still swaps `Set` -> `_Set`). `claimObject` is what the type
  // ladder answered for THIS claim, which is what proves a container that holds the constructor
  // under a key of its own - the root admission below says how it is read
  function handlePerBranch({ metaPath, claimObject = null }) {
    const prop = metaPath.node;
    if (prop.type !== 'Property') return;
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
    const desc = resolveFallbackReceiver(patternPath.parentPath, pattern);
    if (!desc?.rhsNode) return;
    // the SECOND way a foreign-frame receiver enters the channel (the first is the arg detector):
    // the shared resolver hands back the call-ARG plus the site it evaluates at, so the subtree
    // takes its frame stamp here too - every branch question below then answers at the call site
    if (desc.callPath) stampNodeSite(desc.rhsNode, { scope: desc.callPath.scope, path: desc.callPath });
    // a HOP prop (its value another pattern): the mirror descends into the leaf and
    // resolves each leaf slot as a static of the hop's constructor - the branch literal
    // then nests back up (`cond ? { Array: { from: _Array$from } } : userObj`)
    // ... read through a hop's own DEFAULT (`{ Array: { from } = {} }`): the mirror fills the slot
    // the default guards, and the pattern keeps the default where it stands - the provider's mirror
    // plan peels it the same way
    if (patternSlotTarget(prop.value)?.type === 'ObjectPattern') {
      // the mirror REPLACES the receiver and keeps the pattern, so a hop key stays spelled wherever
      // the source wrote it - a computed key that FOLDS names the same hop its dotted spelling does
      const keyCtx = { scope: metaPath.scope, adapter, path: metaPath };
      // a prop the pattern reads as a plain CONSTRUCTOR beside a hop is a SLOT of the same literal,
      // not a reason to decline it: the mirror REPLACES the receiver, so a literal missing that key
      // answers `undefined` where the source read the realm. it rides the hop's literal as the
      // constructor's own ponyfill (`Set: _Set` beside `Map: { groupBy: _Map$groupBy }`), the
      // spelling the flat route gives that same slot off that same branch and the one the shared
      // mirror plan gives it, so the two legs render one literal. answers the key, or null
      function ctorSlotKey(item) {
        if (item.type !== 'Property' || patternSlotTarget(item.value)?.type === 'ObjectPattern') return null;
        if (!propBindingIdentifier(item.value)) return null;
        const keyName = resolveSynthKeys({ node: item, ...keyCtx }).lookupKey;
        return typeof keyName === 'string' ? keyName : null;
      }
      // every outer prop either a hop that names a slot - each registers its own subtree, and the
      // drain merges them into ONE branch literal (`{ Array: {...}, JSON: {...} }`) - or a ctor slot
      // of that same literal
      const mirrorable = pattern.properties.length === 1
        || pattern.properties.every(item => item.type === 'Property'
          && typeof resolveSynthKeys({ node: item, ...keyCtx }).lookupKey === 'string'
          && (patternSlotTarget(item.value)?.type === 'ObjectPattern' || !!ctorSlotKey(item)));
      // one subtree per hop the chain reaches, walked from this outer prop down. the chain descends
      // only while the key it just consumed is a pristine PROXY step: the first key that is not one
      // names the CONSTRUCTOR, and the pattern under it is the LEAF the mirror spells as that
      // constructor's statics - a pattern-valued slot there is a passthrough of the whole key path,
      // never another hop (`Array: { prototype: { at } }` is ONE hop, not two). descending past it
      // named `prototype` to the resolver as the object; the shared mirror plan stops in the same place
      // ... and a proxy step holding SEVERAL hops descends into EVERY one of them, each carrying its
      // own key path, which the drain merges back under the step they share
      // (`{ self: { Map: { groupBy }, Array: { prototype: { at } } } }`). stopping at the step instead
      // named the PROXY to the leaf resolver as the constructor, whose statics nothing resolves, and
      // the whole branch stayed native - the shared plan recurses per key and serves it
      // `hops` collects what the walk reached - the registration and the decline path both read it
      function collectHopChain(hopProp, prefix, hops, hopSiblingPattern) {
        const keyName = resolveSynthKeys({ node: hopProp, ...keyCtx }).lookupKey;
        if (typeof keyName !== 'string') return false;
        const chainKeys = [...prefix, keyName];
        const innerPattern = patternSlotTarget(hopProp.value);
        // an EMPTY pattern is no step to descend: it names no hop, and a step that reached only those
        // would admit a literal spelling nothing the source reads
        if (isPristineProxyGlobal(adapter, keyName) && innerPattern.properties.length
          && innerPattern.properties.every(item => item.type === 'Property'
            && (patternSlotTarget(item.value)?.type === 'ObjectPattern' || !!ctorSlotKey(item)))) {
          return innerPattern.properties.every(item => patternSlotTarget(item.value)?.type === 'ObjectPattern'
            ? collectHopChain(item, chainKeys, hops, innerPattern)
            : pushCtorSlot(ctorSlotKey(item), chainKeys, hops, innerPattern));
        }
        hops.push({ leafPattern: innerPattern, chainKeys, ctorName: keyName, hopSiblingPattern });
        return true;
      }

      // one ctor SLOT of the literal the hops share, addressed by the same key path they are
      // (`['self', 'Set']`): the level it names is the one its sibling hops hang under
      function pushCtorSlot(keyName, prefix, hops, hopSiblingPattern) {
        if (typeof keyName !== 'string') return false;
        hops.push({
          ctorSlot: true, leafPattern: null, chainKeys: [...prefix, keyName], ctorName: keyName, hopSiblingPattern,
        });
        return true;
      }
      function registerHop(hop, dryRun) {
        return !!mirrorable && registerNestedBranchMirror({
          branch: desc.rhsNode,
          leafPattern: hop.leafPattern,
          chainKeys: hop.chainKeys,
          metaPath,
          outerPattern: pattern,
          hopSiblingPattern: hop.hopSiblingPattern,
          ctorSlot: !!hop.ctorSlot,
          claimObject,
          dryRun,
        });
      }
      const hops = [];
      if (collectHopChain(prop, [], hops, pattern)
        && pattern.properties.every(item => item === prop
          || patternSlotTarget(item.value)?.type === 'ObjectPattern'
          || pushCtorSlot(ctorSlotKey(item), [], hops, pattern))) {
        // a step that branched has to fit WHOLE before any of its hops registers: a literal missing a
        // key the pattern reads answers `undefined` where the source read the realm. a single hop
        // needs no preflight - it IS the whole step - and every route the real pass takes is modelled
        // by the dry one, the wks whole-hop passthrough included, or the preflight would decline a
        // step whose only spelling is the one it refused to model
        const passes = hops.length === 1 ? [false] : [true, false];
        if (passes.every(dryRun => hops.every(hop => registerHop(hop, dryRun)))) return;
      }
      // the mirror declined (a `&&` / diverging shape / hop siblings): a DEFAULTED leaf
      // still takes the sound inline default - the polyfill lands only where the
      // destructured slot is undefined, whatever the receiver held
      for (const hop of hops) {
        if (hop.ctorSlot) continue;
        swapInlineDefaults({
          branchNode: desc.rhsNode,
          leafPattern: hop.leafPattern, ctorName: hop.ctorName, metaPath,
          insertOnUndefaulted: peelTransparentExpr(desc.rhsNode)?.type === 'LogicalExpression'
            && peelTransparentExpr(desc.rhsNode).operator === '&&',
        }, { resolvePure, markSubtreeSkipped, skippedNodes, injectPureImport, markRewrite });
      }
      return;
    }
    if (!isSynthSimpleObjectPattern(pattern)
      || !computedKeysAllBound(pattern, metaPath.scope, mintedKeyExempt(metaPath), resolveGlobalPolyfill)) return;
    const { lookupKey } = resolveSynthKeys({ node: prop, scope: metaPath.scope, adapter, path: metaPath });
    const dedupKey = synthPropDedupKey(prop, { scope: metaPath.scope, path: metaPath, adapter });
    if (!lookupKey || !dedupKey) return;
    // the winning CALL-ARG leaves the wrapper-default live on its undefined-shaped arm -
    // thread the default so the leaf substitutes it there (the shared S081-1 rule)
    const wrapperNode = patternPath.parentPath?.node;
    const undefinedArmFallback = wrapperNode?.type === 'AssignmentPattern' && desc.rhsNode !== wrapperNode.right
      ? wrapperNode.right : null;
    if (!registerBranchTree({ branch: desc.rhsNode, key: lookupKey, dedupKey, pattern, metaPath, undefinedArmFallback })) return;
    // SERVED from the literal: the routes that would bind one of this pattern's names a second time
    // - the keyed capture, the param body-extract - ask the marker, and the caller reads the return
    // as "no left-untouched diagnostic owed". every DECLINE above leaves both falsy, and the nested
    // route says the same through its own registration one level down
    branchMirrorPatterns.add(pattern);
    return true;
  }

  // the ROOT a nested branch mirror may spell as a literal, answered as the CONSTRUCTOR whose
  // statics its slots resolve against - null where the root is not one. a PRISTINE proxy global is
  // such a root: its hop keys name their own constructors, so the last key IS that constructor. so
  // is a STATIC CONTAINER the shared receiver walk resolves through the very same keys - the walk
  // the babel leg's mirror plan reads its own root through, so the two legs admit one root set. the
  // WALK is what names the constructor there, and a container key is free to ALIAS it (`const src =
  // { O: Object }` read as `O`): asking the key to equal the name declined a root the mirror spells
  // perfectly well, since the literal keeps the SOURCE's key and fills it with the WALKED
  // constructor's statics (`c && { O: { keys: _Object$keys } }`, the shared plan's own answer). a
  // walk landing on a PROXY level names no constructor of its own - its ctor hops sit one key
  // further down, where the chain descends by key - so it keeps the source, as does a chain the walk
  // cannot resolve at all: the literal REPLACES the receiver, and a root the mirror cannot spell
  // must never be replaced
  function mirrorableBranchRootCtor(root, chainKeys, metaPath, claimObject) {
    const ctorName = chainKeys.at(-1);
    if (root?.type !== 'Identifier' || typeof ctorName !== 'string') return null;
    // the SPELLING is trusted only where it binds nowhere: `function f(self)` and `const window =
    // {}` hold the user's own object, and the literal REPLACES what the root names - a bound one
    // falls to the container walk below, which reads what that binding actually holds
    if (proxySurfaceIdentifier(root, { adapter, injectorState, scope: metaPath.scope, path: metaPath })) return ctorName;
    const walked = walkStaticReceiverChain({
      receiverNode: root, walkPath: chainKeys, scope: metaPath.scope, adapter, path: metaPath,
    });
    if (typeof walked !== 'string' || POSSIBLE_GLOBAL_OBJECTS.has(walked)) return null;
    // ... and the ladder that resolved the CLAIM is what proves an ALIASING container: where it
    // answered with the very key the pattern reads (`O` for `{ O: { keys } }` off a selection it
    // could pick no arm of), it reached no constructor through this receiver and the walk's answer
    // is not the mirror's to spell. where it named one, the container is proven, and every hop the
    // walk names rides the same literal - the claim's own and its siblings'
    return walked === ctorName
      || (typeof claimObject === 'string' && claimObject !== ctorName) ? walked : null;
  }

  // the nested mirror registers only on a root the admission above proves: leading hops must be
  // pristine proxy steps, the last one names the constructor whose statics fill the slots
  // `hopSiblingPattern`: the pattern whose props are the hops THIS literal carries at the level the
  // hop sits on - the outer pattern wherever one outer prop reaches one hop, and the pattern under a
  // shared proxy step where it reaches several. it answers only "does this hop travel in company",
  // which is what a hop with nothing of its own to inject rides on; `outerPattern` keeps naming the
  // pattern the whole branch literal reproduces, which is what the drain counts its arity against
  // eslint-disable-next-line max-statements -- the same admission preflights every subtree before registering a whole assignment
  function registerNestedBranchMirror({ branch, leafPattern, chainKeys, metaPath, outerPattern = null,
    hopSiblingPattern = null, ctorSlot = false, claimObject = null, dryRun = false, partialTargets = false }) {
    const hopCompany = hopSiblingPattern ?? outerPattern;
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
    // the assignment's VALUE is the receiver itself: a branch swapped for a synth literal would
    // change what the expression yields, so a CONSUMED assignment declines the mirror wherever it is
    // registered from - asked HERE so no entry can miss it (`const host = ({ Array: { [SE]: from } }
    // = src)` kept `src`), through the shared host climb the flat spelling already asks
    if (destructureAssignmentValueIsCaptured(metaPath)) return false;
    if (chainKeys.slice(0, -1).some(key => !isPristineProxyGlobal(adapter, key))) return false;
    // a leaf under a CONSTRUCTOR hop may hold a pattern-valued slot the mirror SERVES: one whose key
    // is no static of that constructor reads as a passthrough of the whole key path and descends
    // there (`Array: { prototype: { at } }`), and one whose key IS a static descends off that
    // static's ponyfill where the pattern under it carries a claim (`Object: { keys: { name } }`).
    // what still keeps the source is a STATIC slot whose pattern claims nothing - that is the
    // pattern-valued static, whose canon is the shared plan's, and mirroring it here would spell a
    // literal where the other leg lifts. a proxy hop never reaches this question: its leaves are hops
    const hopCtorName = chainKeys.at(-1);
    const nestedValuesRideTheHop = !ctorSlot && !isPristineProxyGlobal(adapter, hopCtorName)
      && leafPattern.properties.every(item => item.type !== 'Property'
        || patternSlotTarget(item.value)?.type !== 'ObjectPattern'
        || !resolvePure({
          kind: 'property', object: hopCtorName, key: plainSynthKeyName(item.key), placement: 'static',
        }, metaPath)
        || !!descendedStaticPatternLeaves(item));
    // a ctor SLOT carries no leaf pattern of its own - what it binds is the constructor itself
    if (!ctorSlot
      && ((!partialTargets && !isSynthSimpleObjectPattern(leafPattern, { allowNestedValue: nestedValuesRideTheHop }))
        || !computedKeysAllBound(leafPattern, metaPath.scope, mintedKeyExempt(metaPath), resolveGlobalPolyfill))) return false;
    let inner = peelFallbackBranchInner(branch);
    let discardedInitProbePlan = null;
    let discardedProbeProp = null;
    if (!inner || inner.type !== 'Identifier') {
      let host = metaPath;
      while (host?.node && host.node.type !== 'AssignmentExpression') host = host.parentPath;
      const effectLeaf = metaPath.node?.type === 'Property' && metaPath.node.computed
        && computedKeyHasSideEffects(metaPath.node) && metaPath.node.value?.type === 'Identifier';
      const effectHop = outerPattern?.properties?.find(item => item.type === 'Property'
        && resolveSynthKeys({ node: item, scope: metaPath.scope, adapter, path: metaPath }).lookupKey === chainKeys[0]);
      if (host?.node?.operator === '=' && host.node.left === outerPattern && effectLeaf && effectHop
        && patternSlotTarget(effectHop.value)?.type === 'ObjectPattern') {
        discardedInitProbePlan = planDiscardedInitProbe(branch, metaPath, { adapter, resolvePure });
        if (discardedInitProbePlan) {
          inner = branch;
          discardedProbeProp = effectHop;
        }
      }
      if (!inner) return false;
    }
    // an INLINE-resolvable CALL branch yields its own RETURN expression: the literal replaces
    // that, so the call still runs and its body's effects stay where the source wrote them
    // (`c ? (() => { hits++; return globalThis; })() : ...`, `(() => m && globalThis)()`)
    if (inner.type === 'CallExpression' && !inner.optional) {
      const returned = inlineCallReturnExpression(
        { node: inner, seen: new Set(), ctx: { ...nodeSite(inner, metaPath), adapter } }, { rejectConditional: true },
      );
      // an IDENTITY call hands back its ARGUMENT: the literal lands on that value's own tail,
      // so a sequence prefix keeps running where the source wrote it. only a return standing INSIDE
      // the call is the call's own to rewrite - an IIFE's body, an identity call's argument: a NAMED
      // callee's body serves every caller, and a literal written there is what the others read too
      let value = returned && subtreeContainsNode(inner, returned.node) ? peelTransparentExpr(returned.node) : null;
      while (value?.type === 'SequenceExpression') value = peelTransparentExpr(value.expressions.at(-1));
      // ... and only the shapes whose yield is ONE surface: a bare proxy root, or an `&&` GATE
      // whose right operand is that root (`() => m && globalThis`). a selection between two
      // different surfaces keeps its own channels - the mirror there would spell both arms
      const gatedRoot = value?.type === 'LogicalExpression' && value.operator === '&&'
        && !proxySurfaceIdentifier(peelTransparentExpr(value.left), { adapter, injectorState });
      if (value && (gatedRoot
        || proxySurfaceIdentifier(value, { adapter, injectorState, ...nodeSite(inner, metaPath) }))) {
        inner = value;
      }
    }
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        // a `||` / `??` RIGHT whose LEFT is always truthy (a proxy, a known constructor, a static
        // container) is dead text the selection never reaches: the shared plan mirrors nothing there,
        // and neither does this route (spelled here alone, the dead arm shipped a dead import)
        if (slot === 'right' && inner.operator !== '&&' && selectionLeftAlwaysTruthy({
          node: inner.left,
          ...nodeSite(inner, metaPath),
          adapter,
          resolvePure: meta => resolvePure(meta, nodeSite(inner, metaPath).path),
          rescuesReceiverRead: ['VariableDeclarator', 'AssignmentExpression'].includes(destructurePatternHostPath(metaPath)?.node?.type),
        })) continue;
        if (!fallbackBranchSwapKeepsSelection({
          hostNode: inner, slot, branchNode: inner[slot], ...nodeSite(inner, metaPath), adapter,
          resolvePure: meta => resolvePure(meta, nodeSite(inner, metaPath).path),
        })) continue;
        if (registerNestedBranchMirror({
          branch: inner[slot],
          leafPattern,
          chainKeys,
          metaPath,
          outerPattern,
          hopSiblingPattern,
          ctorSlot,
          claimObject,
          dryRun,
          partialTargets,
        })) any = true;
        // a FALLBACK logical is decided by its LEFT, and the mirror puts an always-truthy
        // literal there: the right can no longer run, so it stays verbatim (babel's dead-side
        // canon). a CONDITIONAL keeps both - either arm is still reachable
        if (any && inner.type === 'LogicalExpression' && inner.operator !== '&&') break;
      }
      return any;
    }
    // the constructor this subtree's slots resolve against: the ROOT names it, and only a probed
    // discard - whose own plan carries the leaf - reaches here without asking for one
    const rootCtorName = discardedInitProbePlan
      ? hopCtorName : mirrorableBranchRootCtor(inner, chainKeys, metaPath, claimObject);
    if (!rootCtorName) return false;
    // a ctor SLOT spells the constructor's own ponyfill off the LEVEL it sits on - a proxy step
    // (`self.Set`), or the branch root itself where the pattern reads the realm flat. a level that
    // is no proxy names no constructor for that key, so the slot - and with it the whole step, which
    // has to fit as a WHOLE - keeps the source
    if (ctorSlot) {
      const slotHost = chainKeys.length > 1 ? chainKeys.at(-2)
        : proxySurfaceIdentifier(inner, { adapter, injectorState, scope: metaPath.scope, path: metaPath })
          ? inner.name : null;
      const slotPure = slotHost && resolvePure({
        kind: 'property', object: slotHost, key: rootCtorName, placement: 'static',
      }, metaPath);
      if (!slotPure || slotPure.kind === 'instance') return false;
      if (dryRun) return true;
      markSubtreeSkipped(skippedNodes, inner);
      pushNestedTree(inner, {
        chainKeys: [...chainKeys], outerPattern, ctorSlot: injectPureImport(slotPure.entry, slotPure.hintName),
      }, { metaPath, outerPattern, chainKeys });
      return true;
    }
    const plan = buildPatternRenderPlan(leafPattern, { scope: metaPath.scope, path: metaPath, adapter, resolveGlobalPolyfill });
    if (!plan) return false;
    // ... and a leaf the ponyfill cannot serve - a member target whose ROOT stands for a global,
    // neither a binding (defaulted or not) nor a pattern reading the ponyfill's members - keeps the
    // raw canon: its slot reads RAW off the branch root beside the ponyfilled siblings, the babel
    // leg's mixed mirror; a pattern of raw slots alone has nothing to mirror
    const rawSlots = new Set();
    if (!partialTargets) {
      for (const item of leafPattern.properties) {
        if (item.type !== 'Property' || propBindingIdentifier(item.value) || isMirrorablePatternValue(item.value)
          || memberTargetTakesExtraction(item.value, { scope: metaPath.scope, path: metaPath, adapter })) continue;
        const key = synthPropDedupKey(item, { scope: metaPath.scope, path: metaPath, adapter });
        if (!key) return false;
        rawSlots.add(key);
      }
    }
    const targetKinds = new Map();
    if (partialTargets) {
      for (const item of leafPattern.properties) {
        if (item.type !== 'Property') return false;
        const key = synthPropDedupKey(item, { scope: metaPath.scope, path: metaPath, adapter });
        // ... a plain PATTERN value binds through the ponyfill too: the slot supplies it and the
        // pattern's leaves read its members (`keys: { [(se, 'bind')]: bind }` off `_Object$keys`)
        // ... and a MEMBER target the extraction canon admits is SERVED by the slot too, which is what
        // the sibling census above already answers for the same shape - one question, one answer
        const binding = !!propBindingIdentifier(item.value) || isMirrorablePatternValue(item.value)
          || !!memberTargetTakesExtraction(item.value, { scope: metaPath.scope, path: metaPath, adapter });
        // One mirrored slot cannot supply both a pure binding and a native write target.
        if (!key || (targetKinds.has(key) && targetKinds.get(key) !== binding)) return false;
        targetKinds.set(key, binding);
      }
    }
    // the keys a STATIC slot's pattern spells when a leaf under it carries a CLAIM of its own: one
    // literal key per key the pattern reads, the claiming ones dispatched through their own ponyfill
    // where the source read them off the static's value. null where NO leaf claims - the flat binding
    // is the shorter spelling of the same value - and null where a key has no plain spelling: a
    // computed one, a duplicate, a defaulted slot, or `__proto__`, whose literal key would set the
    // prototype where the pattern reads an own property
    // `receiverObject`: the constructor whose instances the slot's value holds, where the slot names
    // one (`Array: { prototype: ... }`) - the receiver type the other leg reads off its own re-emitted
    // member (`_globalThis.Array.prototype.at` -> `array/instance/at`). unnamed elsewhere, and the
    // leaf then takes the common entry, which is that same read's answer one dialect over
    function descendedStaticPatternLeaves(prop, receiverObject = undefined) {
      const pattern = prop?.value;
      if (pattern?.type !== 'ObjectPattern' || !pattern.properties.length) return null;
      const leaves = [];
      let claims = false;
      for (const item of pattern.properties) {
        if (item.type !== 'Property' || item.computed || item.value?.type === 'AssignmentPattern') return null;
        const leafKey = plainSynthKeyName(item.key);
        if (leafKey === null || leafKey === '__proto__' || leaves.some(leaf => leaf.key === leafKey)) return null;
        const leafPure = resolvePure({ kind: 'property', object: receiverObject, key: leafKey, placement: 'prototype' }, null);
        if (leafPure?.kind === 'instance') claims = true;
        leaves.push({ key: leafKey, pure: leafPure?.kind === 'instance' ? leafPure : null });
      }
      return claims ? leaves : null;
    }

    const slotMap = new Map();
    // a leaf the literal has no slot for - a wks key dispatching on the VALUE, an instance member -
    // keeps the hop's own value: alone the hop declines the mirror (both legs keep the key-swap /
    // the instance route there), but beside a sibling hop it joins the multi-hop literal as the
    // hop's RAW passthrough (`Array: { prototype: _globalThis.Array.prototype }` beside
    // `Map: { groupBy: _Map$groupBy }` - the babel mixed mirror)
    let wholeHop = false;
    for (const planEntry of plan) {
      const pure = planEntry.wks ? null
        : resolvePure({ kind: 'property', object: rootCtorName, key: planEntry.lookupKey, placement: 'static' }, metaPath);
      // an INSTANCE leaf of the hop is a VALUE the literal spells through the ponyfill's own dispatch
      // on the hop's read (`name: _nameMaybeFunction(_globalThis.Object)`) - the spelling the babel leg
      // reaches by re-traversing its own emitted passthrough, which this drain has no second pass for.
      // nothing of the ponyfill lands in the user's object, so neither the member-target safe-bail nor
      // the partial-target gate applies to it: only a STATIC slot answers those
      if (pure?.kind === 'instance') {
        slotMap.set(planEntry.dedupKey, { ...pure, instanceHop: true });
        continue;
      }
      if (planEntry.wks) {
        if (partialTargets || !(hopCompany && hopCompany.properties.length > 1)) return false;
        wholeHop = true;
        break;
      }
      const mirrorableSlot = !rawSlots.has(planEntry.dedupKey)
        && (!partialTargets || !!targetKinds.get(planEntry.dedupKey));
      // ... and so does a slot the constructor polyfills NO static for, whose pattern holds a claim
      // of its own (`Array: { prototype: { at } }`): the keys read off the hop's own live value
      // rather than off a ponyfill, the claiming ones through their dispatch on that read. rendered
      // flat, the hop handed the pattern its value and the claim under it stayed native on both legs
      const hopLeaves = !pure && mirrorableSlot
        ? descendedStaticPatternLeaves(planEntry.prop,
          planEntry.lookupKey === 'prototype' ? rootCtorName : undefined) : null;
      if (hopLeaves) {
        slotMap.set(planEntry.dedupKey, { descendedHop: hopLeaves });
        continue;
      }
      // an unresolvable STATIC leaf renders as a passthrough off the branch root
      // (`isArray: _globalThis.Array.isArray` beside `of: _Array$of` - babel's mixed
      // mirror); only an all-unresolvable pattern has nothing to mirror for
      if (!pure || !mirrorableSlot) continue;
      // ... and a STATIC slot whose PATTERN holds a claim of its own DESCENDS: the literal spells
      // that pattern's keys off the ponyfill, the claiming one through its own ponyfill's dispatch
      // (`keys: { name: _nameMaybeFunction(_Object$keys) }`) - the shared mirror's answer for the
      // same slot. the flat binding handed the pattern the ponyfill and left that claim native
      const descended = descendedStaticPatternLeaves(planEntry.prop);
      slotMap.set(planEntry.dedupKey, descended ? { staticPure: pure, descended } : pure);
    }
    // a hop with nothing to polyfill still joins a MULTI-hop literal, as passthrough / raw slots
    // beside the sibling hop's ponyfills (`Promise: { customZ: _Promise.customZ }` beside
    // `Map: { groupBy: _Map$groupBy }` - the babel mixed mirror); alone it has nothing to mirror for
    // ... and an INSTANCE slot is not one of those ponyfills: the shared plan's metrics count only a
    // real polyfill leaf, so a hop carrying nothing else stays native (`{ Object: { name } } = sel` -
    // both legs leave it) and joins the literal only beside a sibling that does inject
    const hasRealSlot = slotMap.values().some(entry => !entry.instanceHop && !entry.descendedHop);
    if (!wholeHop && !hasRealSlot && !partialTargets && !(hopCompany && hopCompany.properties.length > 1)) return false;
    if (dryRun) return true;
    for (const [key, pure] of slotMap) {
      if (pure.descended || pure.descendedHop) {
        const leaves = (pure.descended ?? pure.descendedHop).map(leaf => ({
          key: leaf.key,
          helper: leaf.pure ? injectPureImport(leaf.pure.entry, leaf.pure.hintName) : null,
        }));
        // a descended HOP has no ponyfill base of its own: the render reads it off the branch root
        slotMap.set(key, pure.descended
          ? { base: injectPureImport(pure.staticPure.entry, pure.staticPure.hintName), descended: leaves }
          : { descendedHop: leaves });
        continue;
      }
      slotMap.set(key, pure.instanceHop
        ? { instanceHop: true, helper: injectPureImport(pure.entry, pure.hintName) }
        : injectPureImport(pure.entry, pure.hintName));
    }
    if (discardedInitProbePlan) {
      for (const rescue of discardRescueNodes({ node: inner, ...nodeSite(inner, metaPath), adapter })) {
        skippedNodes.keepLive?.add(rescue);
      }
    }
    markSubtreeSkipped(skippedNodes, inner, discardedInitProbePlan ? skippedNodes.keepLive : null);
    const baseName = discardedInitProbePlan?.leafPure
      ? injectPureImport(discardedInitProbePlan.leafPure.entry, discardedInitProbePlan.leafPure.hintName) : null;
    pushNestedTree(inner, wholeHop
      ? { chainKeys: [...chainKeys], outerPattern, wholeHop: true }
      : { plan, slots: slotMap, chainKeys: [...chainKeys], outerPattern, baseName, rawSlots },
    {
      metaPath,
      outerPattern,
      chainKeys,
      probe: discardedInitProbePlan ? { plan: discardedInitProbePlan, prop: discardedProbeProp } : null,
    });
    return true;
  }

  // the registry the drain merges into ONE branch literal: one entry per subtree the mirror spells,
  // filed under the receiver node that literal replaces. deduped by the key path the subtree hangs
  // on, because BOTH claims of a hop pair (the leaf's and the hop's own) reach a mirror route and a
  // second entry would double the literal's prop
  function pushNestedTree(receiverNode, tree, { metaPath, outerPattern, chainKeys, probe = null }) {
    let pending = pendingBranchSynths.get(receiverNode);
    if (!pending?.nestedTrees) {
      pending = {
        receiver: receiverNode,
        nestedTrees: [],
        discardedInitProbePlan: probe?.plan ?? null,
        discardedProbeProp: probe?.prop ?? null,
        metaPath,
      };
      pendingBranchSynths.set(receiverNode, pending);
    }
    if (pending.nestedTrees.some(entry => entry.outerPattern === outerPattern
      && entry.chainKeys.join('.') === chainKeys.join('.'))) return;
    pending.nestedTrees.push(tree);
    if (outerPattern) branchMirrorPatterns.add(outerPattern);
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
            resolvePure: meta => resolvePure(meta, nodeSite(inner, metaPath).path),
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
        const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter, resolveGlobalPolyfill });
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
      const hopKeys = [];
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
      const base = proxyPassthroughBase({ rootName, keys: hopKeys, adapter, resolveGlobalPolyfill });
      branchBase = { baseName: base.baseName, passthroughPrefix: base.keys, baseIsProxy: true };
    }
    let pending = pendingBranchSynths.get(inner);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter, resolveGlobalPolyfill });
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

  // the array-wrapped ASSIGNMENT twin's registration, extracted for its size - see the
  // arrayHost branch in handleObjectPropertyResult
  function registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath,
    symbolProp, patternPath }) {
    // a BODYLESS twin and an INSTANCE-defaulted prop both keep the raw destructure (the
    // native slot assigns first, the overwrite re-binds after), so the element is read
    // TWICE - only a re-referenceable one qualifies. a STATIC default is DEAD (the pairing
    // proved the element) and the consume drops it with the destructure, the declaration
    // route's own rule
    // ... unless the slot PRUNES: nothing ran the default then, so it neither keeps the raw slot nor
    // falls back to the binding - the default node is the one reader left
    // a prop with no LOCAL of its own - a hop the plan anchored (`AggregateError: { customZ }`) - has no
    // overwrite to append here: this route binds a name after the raw destructure, and a pattern is
    // not one. it stands down and leaves the slot to the residual (the anchored render is not yet
    // this host's), where recording it printed an identifier with no name
    // ... a MEMBER target the root gate admits is the exception: the source already named the slot
    // this route would have bound, so the overwrite writes straight into it
    if (propLocalName(prop) === undefined && !symbolProp
      && !memberTargetTakesExtraction(prop.value, { scope: metaPath.scope, path: metaPath, adapter })) return;
    const prunes = consumedAssignmentSlotPrunes(metaPath);
    const defaulted = prop.value.type === 'AssignmentPattern' && kind === 'instance' && !prunes;
    // ... and a MULTI-element wrapper is the third such keeper: its siblings still bind, so the
    // destructure stays whole and this claim only appends its overwrite - a FLAT static included,
    // which the other leg claims through its own overwrite channel for the same reason
    const keepsRaw = wrapped.bodyless || wrapped.multi;
    const chainKeys = hopChainKeys(chain);
    // the dead default peels out of the VALUE only - the raw prop keeps its own binding
    // a STATIC leaf's default rides the value builder, where the canon drops it (dead text: the pure
    // is always defined); an INSTANCE leaf keeps the overwrite's own guard, which falls back to the
    // raw slot the residual already defaulted - so its value peels the default out
    const twinProp = kind === 'instance' && prop.value.type === 'AssignmentPattern' ? { ...prop, value: prop.value.left } : prop;
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
        ? resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true, allowNavSegments: true, adapter }) : null;
    const twinCarriedDeep = kind === 'instance' && chain.length && !twinPlainDeep
      && consumedAssignmentSlotDropsHost(metaPath)
      ? carriedInitReceiverNode({
        path: metaPath,
        initNode: wrapped.assignment?.right,
        resolveOptions: { allowSePeeledFragment: true, allowNavSegments: true },
        adapter,
      }) : null;
    // ... and a nav ending on a polyfillable STATIC dispatches on that static's ponyfill - an import
    // binding, re-referenceable by nature - never on the raw static off the realm (`[{ Array: { of: {
    // name } } }] = [globalThis]` -> `_name(_Array$of)`): the typed-base question the plain assignment
    // host asks, so the wrapper answers like it
    const twinTypedChain = kind === 'instance' && chain.length && twinPlainDeep && !symbolProp
      ? typedNavClaimChain(metaPath, { adapter, allowAssignmentHost: true }) : null;
    const twinTypedBase = twinTypedChain && resolveNestedReceiverBase({
      rootName: twinTypedChain.root.name,
      keys: twinTypedChain.keys,
      binding: adapter.getBinding(metaPath.scope, twinTypedChain.root.name, metaPath),
      adapter,
      resolveGlobalPolyfill,
      resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
    });
    const twinStaticReceiver = twinTypedBase?.static
      ? identifier(injectPureImport(twinTypedBase.pure.entry, twinTypedBase.pure.hintName)) : null;
    const twinDeepReceiver = twinStaticReceiver ?? twinPlainDeep ?? twinCarriedDeep;
    // a SEQUENCE element whose tail cannot be spelled twice rides WHOLE where the raw destructure
    // leaves: the dispatch is then the one reader and spells the comma run where the source did
    // (`e = _at((out = 1, f()))`, the flat spelling's shape); where the destructure STAYS the level
    // keeps its native read - spelling the tail beside it would run the tail twice
    const seqElement = kind === 'instance' && wrapped.elementNode?.type === 'SequenceExpression'
      && wrapped.elementNode !== wrapped.element && !isReReferenceableReceiver(wrapped.element);
    // ... unless the key's own effect keeps the receiver read: the memo then takes the element SLOT
    // and holds the run WHOLE, so the tail is spelled once and the residual reads the ref in its
    // place. that is the one shape where spelling the element beside the destructure runs nothing
    // twice, and refusing it lost the claim on both legs alike
    const seKeySharesElement = kind === 'instance' && seKeyKeepsReceiverRead({
      prop,
      receiver: wrapped.elementNode ?? wrapped.element,
      restSibling: hasRestSibling(pattern),
    });
    if (seqElement && !seKeySharesElement && (keepsRaw || !consumedAssignmentSlotDropsHost(metaPath))) return;
    let twinReceiver = twinDeepReceiver ?? (seqElement ? wrapped.elementNode : wrapped.element);
    let receiverIsSlotMemo = false;
    // a sibling meeting the memo's own write reads the ref it published, before any gate judges the
    // write as though it were the receiver the source wrote
    const plantedSlotRef = slotMemoWrites.get(peelTransparentExpr(twinReceiver));
    if (plantedSlotRef) {
      twinReceiver = identifier(plantedSlotRef);
      receiverIsSlotMemo = true;
    }
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
    // REST above the hop - it keeps the hop's key in the pattern, and the key IS that read.
    // a receiver-less STATIC spells nothing beside that slot, so it extracts whatever the element
    // (`[{ Object: { fe }, ...rest }] = [kw = (eff(), globalThis)]` keeps the write in the residual)
    if ((kind === 'instance' || symbolProp)
      && !seKeySharesElement
      && (keepsRaw || defaulted || pattern.properties?.length > 1
        || chain.some(level => level.outerRest))
      && !isReReferenceableReceiver(twinReceiver)
      && !isReReadableSurfaceNav(twinReceiver, name => !!injectorState?.getBindingInfo?.(name))
      && !resolveProxyNavReceiver(twinReceiver, twinGuardCtx)) return;
    // ... and an SE-keyed INSTANCE prop over a MEMBER receiver owes that member exactly ONE
    // evaluation, whatever the wrapper and whether or not it is defaulted: the kept key leaves the
    // residual performing the source's own read, so the dispatch SHARES it through the memo below
    // and stands down only where the element has no slot to take. asked of the RESOLVED receiver,
    // not the raw element: a chain that resolved to a nav (`[{ y: { [se()]: m } }] = [nb]` dispatches
    // on `nb.y`) is the same member read
    if (kind === 'instance' && seKeyKeepsReceiverRead({
      prop,
      receiver: twinReceiver,
      restSibling: hasRestSibling(pattern),
    })) {
      // ... unless the element has a SLOT the memo can take: the write stands where the source
      // evaluates it, so the member is read once, the residual reads the memo in its place and the
      // dispatch reads it again for free - the other leg's answer for the same shape
      // a SEQUENCE element hands its slot the WHOLE run, prefix and all: the memo write stands
      // where the source evaluated it, so the order the native form runs in does not move
      const memoSource = seqElement ? wrapped.elementNode : wrapped.element;
      const slotMemo = wrapped.assignment
        ? elementMemoFor(memoSource, wrapped.assignment, { inSlot: true, metaPath }) : null;
      if (!slotMemo?.refName || !slotMemo.slot) return;
      const slotWrite = assignmentExpression('=', identifier(slotMemo.refName), memoSource);
      slotMemoWrites.set(slotWrite, slotMemo.refName);
      slotMemo.slot.owner[slotMemo.slot.key] = slotWrite;
      twinReceiver = identifier(slotMemo.refName);
      // the live re-resolve below reads the SLOT, which now holds the memo's own write: re-spelling
      // it in the dispatch would perform that write - and the member read inside it - a second time
      receiverIsSlotMemo = true;
    }
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
      && receiverPerformsEveryInitEffect(wrapped.assignment?.right, twinReceiver, { scope: metaPath.scope, adapter, path: metaPath });
    // ... and so does an element the PEEL reduced to a sequence's TAIL: the residual keeps the whole
    // sequence while the dispatch spells that tail, so spelling it is a SECOND evaluation unless it
    // is free to re-read. a second pass over this leg's own output is where the shape appears, with
    // the prefix lifted to the top (`[(push, _flat(arr).call(arr))]`)
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
      liveReceiver: receiverIsSlotMemo ? null : twinCarriedDeep
        ? () => resolveNestedReceiverNode(metaPath,
          { allowSePeeledFragment: true, allowNavSegments: true, allowInitCarriedEffects: true, adapter }) ?? twinReceiver
        : twinDeepReceiver || !patternPath ? null
          // ... a dispatch that CARRIES the init spells the element's own prefix ahead of the
          // rewritten tail (`_at((out = 1, _flatMaybeArray(arr).call(arr)))`), the other leg's peel
          : () => {
            const spelled = resolveArrayWrappedReceiver(patternPath, null, { adapter })?.element ?? twinReceiver;
            if (!carriesInit) return spelled;
            // ... every comma run on the element's own spine, outermost first - the element itself
            // (`(out = 1, f())`) or a receiver inside it (`(out = 1, arr).flat()`), whose prefix the
            // claim's rewrite left beside the residual that is now leaving
            const prefixes = spineSequencePrefixes(wrapped.elementNode)
              .filter(expr => !subtreeContainsNode(spelled, expr));
            return prefixes.length ? sequenceExpression([...prefixes, spelled]) : spelled;
          },
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
          sentinel: defaulted || wrapped.multi || computedKeyHasSideEffects(prop)
            || hasRestSibling(pattern) || chain.some(level => level.outerRest),
          // ... except a SYMBOL target, which has no declaration to host an extraction: the
          // destructure assigns it natively first and the overwrite rebinds it through the
          // helper, so the prop keeps its own binding (`[{ [S]: it, ...r }] = [arr]`) -
          // and a DEFAULTED one, whose default must run natively before the re-bind
          keepSentinelBinding: symbolProp || defaulted || wrapped.multi
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

  // the shared static-hop question, asked with this leg's path-bound entry resolver
  function staticHopPure(ctorName, key, metaPath) {
    return sharedStaticHopPure({ ctorName, key, resolvePure: m => resolvePure(m, metaPath) });
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
    // a STATIC outer hop composes the same two steps: the receiver NAMES the constructor, the key is
    // a static of it, and what the step spells is an import binding - always defined, so the drain
    // reads it in place instead of memoizing a call (`{ from: { name } = {} } = Array`).
    // the constructor may stand BEHIND hops of its own (`{ Array: { of: { name } = {} } } =
    // globalThis`): there the shared nested-receiver resolver names it through them, asked of the
    // prop whose pattern holds this hop - and a hop straight off the host reads the constructor
    // from the init through the value canon (`Array`, `globalThis.Array`, a const alias alike)
    const hopPattern = outerProp?.parentPath;
    let owner = hopPattern?.parentPath;
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === hopPattern.node) owner = owner.parentPath;
    if (owner?.node?.type === 'Property') {
      const container = resolveNestedDestructureReceiver(owner, adapter);
      return container ? staticHopPure(container, outerKey, metaPath) : null;
    }
    const ctorName = resolveObjectName({ objectNode: initPath.node, scope: metaPath.scope, adapter, path: metaPath });
    if (ctorName && isStaticPlacement(ctorName)) {
      const outerStatic = staticHopPure(ctorName, outerKey, metaPath);
      if (outerStatic) return outerStatic;
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

  // the value the outer key reads off, from whichever host spells it: a declarator's init and an
  // assignment's right are the same value, and the composition owes every host the same answer. a
  // host whose receiver is an ELEMENT hands that element in directly - the wrapper's own init is
  // the array AROUND it, and asking the outer key of that answers for the wrong surface
  function hostReceiverPath(host) {
    const type = host?.node?.type;
    if (type === 'VariableDeclarator') return host.get?.('init') ?? null;
    return type === 'AssignmentExpression' ? host.get?.('right') ?? null : null;
  }

  // the TYPED single hop (the receiver's own type dispatches the outer key, as an instance method
  // or as a static of the constructor the receiver names) composes the two-step extraction: the hop
  // step feeds the leaf dispatch, the inner default folding through the canonical guard. it needs no
  // literal receiver, so it rides PAST the nested-instance declines, and it is what retires the
  // dead-mirror suppression for the sole-leaf shape - the babel leg composes the same steps natively
  function typedHopFor({ chain, kind, entry, metaPath, receiverPath }) {
    const assignmentPattern = chain.length >= 1 && metaPath.parentPath?.parentPath?.node?.type === 'AssignmentPattern'
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

  // the ledger entry a destructure HOST's claims were queued under: the host hangs off its
  // declaration or its statement, and which of the two carries the entry is the host's shape
  function queuedJobsFor(hostPath) {
    return ledger.get(hostPath?.parentPath?.node) ?? ledger.get(hostPath?.parentPath?.parentPath?.node);
  }

  function retireDeclaratorJobs(path) {
    const queued = queuedJobsFor(path);
    if (queued) queued.jobs = queued.jobs.filter(job => (job.declarator ?? job.declaratorNode) !== path.node);
  }

  // ... and the question a rewrite that re-spells the PROPS of one pattern asks of each of them:
  // does a job queued by an EARLIER claim already own this prop? that job renders its own write at
  // drain, in the slot the source's claim was taken, so a render re-spelling the prop would either
  // write it twice or leave a native re-read over it. the other binding's channel answers the same
  // question by having REMOVED the prop before its render sees it
  function propHasQueuedJob(hostPath, prop) {
    return !!queuedJobsFor(hostPath)?.jobs.some(job => job.prop === prop);
  }

  // ... and the OTHER half of that ownership: the capture render's memo leads the expression that
  // replaces this host, so it PERFORMS the init's SE prefix where the source ran it - the lift a job
  // recorded for the drain would run the same effect a second time, and is retired here
  function retireHostPrefixLift(hostPath) {
    for (const job of queuedJobsFor(hostPath)?.jobs ?? []) if (job.seqPrefix?.length) job.seqPrefix = null;
  }

  // Bind the shared ordered capture before a host-specific route can consume its pattern.
  function capturePatternForExtraction({ metaPath, meta, kind, entry, hintName }) {
    if (!entry && !meta.fromFallback) return false;
    const restHost = destructurePatternHostPath(metaPath);
    // Its selected branch already supplies each leaf; capture must not replace it again.
    if (restHost && branchMirrorPatterns.has(restHost.node.type === 'AssignmentExpression'
      ? restHost.node.left : restHost.node.id)) return false;
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
      isConsumedProp: item => queuedJobsFor(restHost)?.jobs.some(job => job.prop === item && !job.sentinel),
      isClaimedProp: item => propHasQueuedJob(restHost, item)
        || injectorState.hasGeneratedUnusedName(propBindingIdentifier(item.value)?.name),
    });
    if (restPlan) {
      // Capture only the source export names before any private bindings are inserted.
      const declaration = restHost.parentPath;
      if (declaration.parentPath?.node?.type === 'ExportNamedDeclaration') {
        const names = declaration.node.declarations.flatMap(node => collectPatternNames(node.id));
        // Replacement requeues the declaration; retire claims tied to its old export host.
        ledger.delete(declaration.parentPath.node);
        declaration.parentPath.replaceWithMultiple([declaration.node, {
          type: 'ExportNamedDeclaration', declaration: null, source: null,
          specifiers: names.map(name => ({ type: 'ExportSpecifier', local: identifier(name), exported: identifier(name) })),
        }]);
        markRewrite();
        return true;
      }
      const rendered = renderRetainedObjectCapture(restPlan, {
        mintRef: mintRefName,
        mintDeclaredRef: () => injector.generateDeclaredRef(metaPath),
        injectImport: injectPureImport, entry, hintName,
        mintUnused: declared => declared ? injector.declareUnusedRef(metaPath) : mintUnusedName(),
        claimProperties: properties => { for (const item of properties) skippedNodes.add(item); },
        noteStaticAlias: (name, aliasEntry) => injectorState.registerBodyExtractAlias(name, aliasEntry, metaPath.scope.getBinding(name)),
        ctx: { scope: metaPath.scope, adapter, path: metaPath },
        // the capture binds the constructor's ponyfill where its single key reads the pristine realm
        anchorPure: capturedRealmCtorPure({
          capture: restPlan.capture ?? restPlan.elementPlan?.capture,
          scope: metaPath.scope, adapter, path: metaPath, resolveGlobalPolyfill,
        }),
      });
      if (rendered.expression) {
        retireHostPrefixLift(restHost);
        const holder = rendered.expression.expressions?.[0];
        if (restPlan.claimedProps?.size && holder?.type === 'AssignmentExpression' && holder.right === restPlan.init) {
          for (const job of queuedJobsFor(restHost)?.jobs ?? []) job.receiverHolder = holder;
        }
        restHost.replaceWith(rendered.expression);
      } else {
        const sourceType = resolveNodeType(restHost.get('init'));
        if (sourceType) resolvedType?.set(rendered.declarations[0].id, sourceType);
        // Another pattern in this declaration still owns a drain. Keep the captured
        // group together until that sibling places its own memo and extractions.
        if (declaration.node.declarations.some(node => node !== restHost.node
          && (node.id.type === 'ArrayPattern' || node.id.type === 'ObjectPattern'))) {
          for (const node of rendered.declarations.slice(1)) capturedSiblingHosts.add(node);
        }
        const [capture] = restHost.replaceWithMultiple(rendered.declarations);
        // The re-detected siblings resolve statics through this newly inserted binding.
        capture.scope.registerBinding(capture.parentPath.node.kind, capture.get('id'), capture);
      }
      markRewrite();
      return true;
    }
    return false;
  }

  // eslint-disable-next-line max-statements -- per-form prop dispatch sequence
  function handleObjectPropertyResult({ metaPath, meta, kind, entry, hintName }) {
    // the caller mirror first: where it settles the leaf's inner default arm for every caller
    // (mirrored the default, or proved it dead at each call), the rewrites below would only add
    // dead text beside it - an inline default the mirror's literal never leaves undefined
    if (parameterCallSites && renderNestedParamSynth({ metaPath, meta, argumentSites: parameterCallSites, fallbackOnBail: true })) return;
    // A declined caller mirror must retain absent properties and the caller's own defaults.
    if (meta?.parameterArgumentsOnly) return;
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
    const assignment = restHost?.node?.type === 'AssignmentExpression';
    const arrayRest = (kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(metaPath.node)))
      && restHost?.node?.type === 'VariableDeclarator'
      && restHost.parentPath?.parentPath?.node?.type !== 'ExportNamedDeclaration'
      && (planArrayWrapperCapture({ pattern: restHost.node.id, init: restHost.node.init,
        force: true, restPattern: metaPath.parentPath.node, adapter, injectorState })
        ?? planArrayWrapperCapture({ pattern: restHost.node.id, init: restHost.node.init,
          nestedOnly: !isForInitDeclaration(restHost.parentPath?.parentPath?.node, restHost.parentPath?.node) }));
    if (arrayRest) {
      const rendered = renderArrayWrapperCapture(arrayRest, { mintRef: mintRefName });
      // Re-detection owns the moved pattern; queued claims still name the old array host.
      retireDeclaratorJobs(restHost);
      const [capture] = restHost.replaceWithMultiple([rendered.capture, ...rendered.elements.map(element => element.declarator)]);
      capture.get('id').traverse({
        Identifier(path) {
          capture.scope.registerBinding(capture.parentPath.node.kind, path, capture);
        },
      });
      markRewrite();
      return;
    }
    const nestedRest = (kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(metaPath.node)))
      && restHost?.node?.type === 'VariableDeclarator'
      && restHost.parentPath?.parentPath?.node?.type !== 'ExportNamedDeclaration'
      && planNestedKeyedPatternCapture({ pattern: restHost.node.id, init: restHost.node.init });
    if (nestedRest && (nestedRest.rest || nestedRest.leafPattern.properties.length > 1
      || nestedRest.ancestors.some(level => level.pattern.properties.length > 1))) {
      const rendered = renderNestedKeyedPatternCapture(nestedRest, { mintRef: mintRefName });
      retireDeclaratorJobs(restHost);
      const [capture] = restHost.replaceWithMultiple([rendered.capture, ...rendered.elements.map(element => element.declarator)]);
      const bindings = new Set();
      walkPatternIdentifiers(capture.node.id, id => bindings.add(id));
      capture.traverse({
        Identifier(path) {
          if (bindings.has(path.node)) capture.scope.registerBinding(capture.parentPath.node.kind, path, capture);
        },
      });
      markRewrite();
      return;
    }
    const prop = metaPath.node;
    // a MEMBER target rides the literal like a binding does: what the mirror puts in the slot is a
    // VALUE, and the pattern writes it into the author's own object exactly as it would a binding -
    // the extraction canon answers which targets qualify, and a root standing for a global is the
    // one it refuses. reading the member off the bare `*/constructor` instead was an UNDER-inject:
    // that entry installs none of the ctor's own statics, so the slot answered `undefined`
    const nestedStaticAssignment = assignment && kind === 'static'
      && (prop.value?.type === 'Identifier'
        || !!memberTargetTakesExtraction(prop.value, { scope: metaPath.scope, adapter, path: metaPath }))
      && prop.computed && computedKeyHasSideEffects(prop)
      && restHost.node.left?.type === 'ObjectPattern' && !restHost.node.left.properties.includes(prop)
      && (!!planDiscardedInitProbe(restHost.node.right, metaPath, { adapter, resolvePure })
        || restHost.node.left.properties.every(outer => mirrorableBranchRootCtor(
          peelFallbackBranchInner(restHost.node.right),
          [outer.type === 'Property'
            ? resolveSynthKeys({ node: outer, scope: metaPath.scope, adapter, path: metaPath }).lookupKey : null],
          metaPath,
          null)));
    if (nestedStaticAssignment) {
      // Keep writes in the source pattern. No sibling is claimed until the whole mirror fits.
      const candidates = restHost.node.left.properties.map(outer => ({
        branch: restHost.node.right,
        leafPattern: outer.type === 'Property' ? patternSlotTarget(outer.value) : null,
        chainKeys: [outer.type === 'Property'
          ? resolveSynthKeys({ node: outer, scope: metaPath.scope, adapter, path: metaPath }).lookupKey : null],
        metaPath,
        outerPattern: restHost.node.left,
      }));
      if (candidates.every(candidate => candidate.leafPattern?.type === 'ObjectPattern'
        && typeof candidate.chainKeys[0] === 'string'
        && registerNestedBranchMirror({ ...candidate, dryRun: true, partialTargets: true }))) {
        for (const candidate of candidates) registerNestedBranchMirror({ ...candidate, partialTargets: true });
        return;
      }
    }
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
    const ctorPattern = liftTakesHostWhole && prop.value?.type === 'ObjectPattern' && !prop.computed
      && (kind === 'global' || (kind === 'static' && !thisReceiver && !adapter.isMutatedStatic?.(meta?.object, meta?.key)))
      && prop.value.properties.every(leaf => leaf.value?.type === 'Identifier' && (claimsRide ? leaf.type === 'Property'
        : !leafKeyMayClaim(leaf, kind === 'global'
          ? { object: hintName, placement: 'static' } : { object: undefined, placement: 'prototype' }, true)));
    // a pattern default becomes the extraction's own LHS, so its leaves may spell anything a
    // pattern spells - a REST included, which binds no key and so claims nothing. what disqualifies
    // it is a leaf naming a member of the RESULT: that leaf is a claim off this one, and the
    // composition is rendered by its route, not by a consume here. an INSTANCE claim binds the
    // pattern off the guarded dispatch, a STATIC one off the guarded import binding (`{ of: [o] =
    // [] } = Array` -> `const [o] = _Array$of === void 0 ? [] : _Array$of`) - the babel canon for both
    const patternLeft = (kind === 'instance' || kind === 'static') && prop.value?.type === 'AssignmentPattern'
      && (prop.value.left?.type === 'ArrayPattern'
        || (prop.value.left?.type === 'ObjectPattern'
          && prop.value.left.properties.every(leaf => leaf.type === 'RestElement'
            || !leafKeyMayClaim(leaf, { object: undefined, placement: 'prototype' }))));
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
    // ... and so does a prop whose LITERAL outlives it: the pairing walk keeps that literal alive, and
    // a slot that simply left would take with it the key the surviving husk still reads
    const keyedHost = kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop))
      ? destructurePatternHostPath(metaPath) : null;
    const anchoredSymbol = symbolProp && keyedHost?.node?.type === 'VariableDeclarator'
      && buildNestedDestructurePlan({
        declarator: keyedHost.node, scope: metaPath.scope, adapter, path: metaPath,
        resolvePure: value => resolvePure(value, metaPath), resolveGlobalPolyfill, isDisabledProp: isDisabled,
      })?.anchor;
    // a MEMBER SLOT is admitted only where the claim is a STATIC and the target's root proves
    // writable: an INSTANCE claim has its own route, and the gate is what keeps a PROTOTYPE member
    // (`Set.union`) from being written into the slot as though it were a static
    const memberSlot = kind === 'static'
      && !!memberTargetTakesExtraction(prop.value, { scope: metaPath.scope, adapter, path: metaPath });
    if (!isPlainConsumableProp(prop, { symbolProp, ctorPattern, patternLeft, memberSlot })) return;
    const nestedKeyCapture = !anchoredSymbol && keyedHost?.node?.type === 'VariableDeclarator'
      ? planNestedKeyedPatternCapture({ pattern: keyedHost.node.id, init: keyedHost.node.init }) : null;
    if (nestedKeyCapture?.leafPattern === pattern) {
      const captureName = mintRefName();
      const exported = keyedHost.parentPath?.parentPath?.node?.type === 'ExportNamedDeclaration';
      const receiverName = exported ? injector.generateDeclaredRef(metaPath) : null;
      const value = buildValue({
        kind, entry, hintName, receiverNode: identifier(captureName), prop, metaPath, literalRoute: true,
      });
      if (!value) return;
      recordJob({ hostPath: keyedHost.parentPath,
        job: {
          host: 'key-read', declarator: keyedHost.node, prop, value, receiverName,
          // Outer keys stay in the capture. Ask the ordinary key plan about the moved leaf
          // alone, so its effect-prefix spelling is the same as a source-written direct leaf.
          keyReadPlan: {
            keys: destructureKeyReadPlan({ node: prop, parentPath: { node: pattern } })?.keys ?? [],
            exported, sole: true,
          },
          nestedKeyCapture, captureName, declarationPath: keyedHost.parentPath,
        } });
      markRewrite();
      return;
    }
    const keyReadPlan = kind === 'instance' || (kind === 'static' && computedKeyHasSideEffects(prop))
      ? destructureKeyReadPlan(metaPath) : null;
    if (keyReadPlan?.sole && propBindingIdentifier(prop.value)) {
      const declaratorPath = patternPath.parentPath;
      const receiverName = keyReadPlan.exported ? injector.generateDeclaredRef(metaPath) : null;
      const value = buildValue({
        kind, entry, hintName, receiverNode: declaratorPath.node.init, prop, metaPath,
        literalRoute: true,
      });
      if (!value) return;
      recordJob({ hostPath: declaratorPath.parentPath,
        job: {
          host: 'key-read', declarator: declaratorPath.node, prop, value, keyReadPlan, receiverName,
          declarationPath: declaratorPath.parentPath,
          proven: kind === 'static' && keyedReadReceiverProven({ init: declaratorPath.node.init, hostPath: metaPath, adapter }),
        } });
      markRewrite();
      return;
    }
    const sentinel = hasRestSibling(pattern) || (prop.computed && computedKeyHasSideEffects(prop))
      || destructureHostLiteralSurvives(metaPath, adapter);
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
        if (!destructureRightIsReceiver(defaultPath.node.right)) return false;
        // ... nor one the host's pairing proves dead: the leaf reads the pair (`{ k: { at } = mk() } = { k: [1] }`)
        if (nearestInnerDefaultDead(patternPath, adapter)) return false;
        // ... and a resolvable OUTER chain leaves its default dead: the receiver proves the hop
        // (`{ Set: { union } = Set } = globalThis` flattens), an opaque host does not
        let host = defaultPath.parentPath;
        while (host?.node && host.node.type !== 'VariableDeclarator' && host.node.type !== 'AssignmentExpression'
          && host.node.type !== 'CatchClause' && host.node.type !== 'ForOfStatement'
          && host.node.type !== 'ForInStatement') host = host.parentPath;
        // ... and so does a chain the canonical nested walk names the constructor through without
        // the default: a LITERAL pairing the hop (`{ k: { from } = Array } = { k: Array }` flattens
        // off the paired `Array` - the babel shape), or the element a for-x HEAD spells the same on
        // every pass - a head declarator holds no init of its own for the reads below to ask
        if (defaultPath.parentPath?.node?.type === 'Property'
          && resolveNestedDestructureReceiver(defaultPath.parentPath, adapter, null, { innerDefault: false })) return false;
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
        if (kind === 'instance' && typedNavClaimShape(metaPath, { allowLeafSiblings: true, adapter })) return false;
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
    // ... and a NAMED default (`= Array`, `= globalThis.X`) never stands here live: the climb rewinds
    // to it wherever it may fire (`carriesReceiver`), so one it walked THROUGH is dead - the outer
    // chain named the receiver - and the flatten below owns the claim, as it does on the babel leg
    // (`{ k: { from } = Array } = { k: Array }` binds `_Array$from` outright); a LITERAL default (an
    // instance receiver) is what this swap is for
    if (chain.length > 0 && !receiverSeOnly && patternPath?.parentPath?.node?.type === 'AssignmentPattern'
      && patternPath.parentPath.node.left === patternPath.node
      && !namedDefaultReceiver(patternPath.parentPath.node.right)
      && !(kind === 'instance' && typedNavClaimShape(metaPath, { allowLeafSiblings: true, adapter }))
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
    // ... under a PARAMETER default or an IIFE parameter, the slot the hops pair with takes the
    // instance mirror - the flat parameter's instance synth one level down
    // ... and an INNER default above the leaf (`{ A: { B: { at } } = { B: [1, 2] } }`) is the same slot one
    // level in: the mirror replaces the default's paired value, so it fires where the default does
    function paramHostOf(host) {
      return (host?.node?.type === 'AssignmentPattern' && (FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type)
        || host.parentPath?.node?.type === 'Property' || host.parentPath?.node?.type === 'ArrayPattern'))
        || FUNCTION_LIKE_NODE_TYPES.has(host?.node?.type);
    }
    // ... asked of the host the HOP CLIMB lands on, so an array wrapper anywhere on the way (the
    // parameter itself, a level under an object hop) reaches the same mirror as an object hop does
    const hopHost = kind === 'instance' ? patternHopKeysToHost(patternPath, adapter)?.hostPattern.parentPath : null;
    if (paramHostOf(hopHost) && registerHopInstanceSynthSlot({ metaPath, hostParent: hopHost, kind, entry, hintName },
      { adapter, resolvePure, synthLedger, instanceSynthCtx, injectorState })) return;
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
      if (kind !== 'instance' && forOfHeadIterableElements(destructurePatternHostPath(metaPath))) {
        const mirrored = renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true });
        if (mirrored) return;
        // ... and a plan that DECLINED (null: a foreign array level the mirror cannot spell whole - a
        // call element beside a bound sibling, whose read of the call's other slot nothing names) leaves
        // the head to the slot's own default, the one render a head has left (`takesInlineDefault`'s
        // rule) and the babel leg's fallback on the same plan
        if (mirrored === null && (prop.value?.type === 'Identifier' || prop.value?.type === 'AssignmentPattern')) {
          return applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
        }
      }
      // a wrapper reached through a CONST BINDING resolves like the inline literal only for a
      // claim that never RE-READS the element: a static substitutes its own pure and spells no
      // receiver, while an instance / symbol extraction would re-read a value the wrapper's own
      // statement holds (`const chain = [arr]; const [{ at }] = chain` stays native)
      const wrapped = resolveArrayWrappedReceiver(hostPatternPath,
        kind === 'instance' || symbolProp ? null : { scope: metaPath.scope, adapter, path: metaPath },
        {
          adapter, allowBodylessMulti: true, readsReceiver: kind === 'instance' || symbolProp,
          // the babel order: the positional route answers only a claim whose nested receiver the
          // canonical walk cannot name (`[{ y: { flat } }] = [{ y: arr }, ...t]` pairs `arr` and
          // takes the memo route on both legs)
          // ... where "cannot name" is asked the way that leg asks it: the plain walk, and past a
          // slot's own effect prefix only where what it reaches is an INSTANCE surface the memo
          // route dispatches on (`[(eff(), globalThis)]` under `{ Array: { prototype: { flat } } }`)
          // ... and a RE-READABLE element needs no slot ref at all: it reads inline beside the
          // residual the spread keeps, on both legs (`[{}] = [_globalThis.Array.prototype, ...t]`)
          positionalTakes: elementNode => {
            if (resolveNestedReceiverNode(metaPath, { adapter })) return false;
            if (isReReadableSurfaceNav(peelTransparentExpr(elementNode), name => !!injectorState?.getBindingInfo?.(name))) return false;
            const peeled = resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true, allowNavSegments: true, adapter });
            return !(peeled && isInstanceSurfaceNav(peeled)) && !!resolvePositionalElementSlot(metaPath, adapter);
          },
        });
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
      if ((receiverSeOnly && wrapped) || (wrapped && kind !== 'instance' && !symbolProp
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
        // (`[(eff('e'), { Object: { fromEntries: _Object$fromEntries } }), eff('f')]`) - or the
        // element's own DEFAULT, which the declarator owns as much as its init
        // (`const [{ Array: { of } } = globalThis] = []` mirrors the default, the babel shape)
        nestedSynth: () => renderNestedParamSynth({
          metaPath, meta, withinNode: arrayWrapperDeclarator(hostPatternPath),
        }),
      })) return;
      if (wrapped) {
        const chainKeys = hopChainKeys(chain);
        // the leaf's default rides the value builder, where the canon drops it (dead text: the pure
        // is always defined), so the source prop goes through whole
        const valueProp = prop;
        // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
        // wrapper pairing proved the element, and a chain reads through the literal to the
        // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
        // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
        // ... and where the wrapper's own pattern is consumed WHOLE, an SE-free single read qualifies
        // too: no residual survives to read it again, so the dispatch is the single read the source
        // performs (`const [{ y: { at } }] = [{ y: nb.y }]` fires the `y` getter once)
        const plainDeep = kind === 'instance' && chain.length
          ? resolveNestedReceiverNode(metaPath, { adapter })
            ?? (!wrapped.wrapperRest && pattern.properties?.length === 1
              ? resolveNestedReceiverNode(metaPath, { allowSeFreeSingleRead: true, adapter }) : null)
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
        // ... and a sole consume whose wrapper DIES - the slots beside it holes, binding nothing -
        // reads an EFFECTFUL element once too, inside its own dispatch: the drain rescues only the
        // neighbours then, since the dispatch spells the element itself, read LIVE off the slot
        // (`[, { at }] = [eff(), mk()]` -> `(eff(), _at(mk()))`, the flat sole consume's own shape)
        const wrapperNode = hostPatternPath.parentPath?.node;
        const wrapperHolesBeside = !wrapped.wrapperRest && wrapperNode === wrapped.declarator?.id
          && wrapperNode.elements.every(item => item === null || item === hostPatternPath.node)
          && patternBindingCount(prop.value) === patternBindingCount(hostPatternPath.node)
          && !computedKeyHasSideEffects(prop);
        const carriedSlot = kind === 'instance' && chain.length && !plainDeep
          ? carriedInitReceiverNode({ path: metaPath, initNode: wrapped.element, adapter }) : null;
        // ... and a DYING wrapper's element answers AS WRITTEN, prefix included: the dispatch is its one
        // reader, so a receiver performing none of that prefix would drop it (`[(n++, { m: g() })]`)
        const carriedDeep = wrapperResidualDies && kind === 'instance' && chain.length && !plainDeep
          ? carriedInitReceiverNode({ path: metaPath, initNode: wrapped.elementNode ?? wrapped.element, adapter }) : null;
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
        // ... and a level whose other slots are HOLES has no second reader at all: the residual dies
        // with them, so the dispatch spells the element itself and needs no ref - unless a slot BEHIND
        // the claim carries an effect, which keeps that level alive to run it
        const wrapperInit = peelTransparentExpr(wrapped.declarator?.init);
        const wrapperTrailingEffect = wrapperInit?.type === 'ArrayExpression'
          && wrapperInit.elements.slice(wrapperNode?.elements?.indexOf(hostPatternPath.node) + 1 || 0)
            .some(item => mayHaveSideEffects(item));
        // A surviving key or wrapper shares its constant container with the extraction,
        // using the flat channel's memo policy rather than duplicating the literal.
        const literalMemoNode = resolvedDeep ?? wrapped.element;
        const constantMemo = isConstantLiteralReceiver(literalMemoNode) && planSideEffectKeyStrategy({
          polyfillKind: kind, receiverNode: literalMemoNode, initIsPure: true,
          soleBindingInDeclaration: wrapperHolesBeside && !wrapperTrailingEffect
            && chain.every(row => !computedKeyHasSideEffects(row.hopProp)),
          propKeyIsPure: !computedKeyHasSideEffects(prop),
        })?.memoizeReceiver;
        const nestedSlotMemo = (resolvedDeep && constantMemo
          ? elementMemoFor(resolvedDeep, wrapped.declarator, { inSlot: !wrapped.precedingPure, metaPath }) : null)
          ?? (resolvedDeep && kind === 'instance' && !wrapped.single
          && (!wrapperHolesBeside || wrapperTrailingEffect)
          && !isReReferenceableReceiver(resolvedDeep)
          && (wrapped.precedingPure || !wrapperHolesBeside)
          ? elementMemoFor(resolvedDeep, wrapped.declarator, { inSlot: !wrapped.precedingPure, metaPath }) : null)
          // ... and a SURVIVING residual memoizes that slot instead of spelling it: the residual and
          // the dispatch are two readers of one read, and the memo is what gives them one - the slot
          // swaps to the ref in place, exactly as the non-single route above does
          ?? (carriedSlot && !wrapperResidualDies
            && !isReReferenceableReceiver(carriedSlot)
            && (wrapped.precedingPure || !wrapperHolesBeside)
            ? elementMemoFor(carriedSlot, wrapped.declarator, { inSlot: !wrapped.precedingPure, metaPath }) : null);
        const deepReceiver = resolvedDeep ?? (nestedSlotMemo ? nestedSlotMemo.ident : null);
        // the memo is about the RECEIVER, so a DEFAULTED leaf takes it on the same terms - its guard
        // wraps the dispatch and reads the same ref (`const [{ at: m = nul }] = [arr.flat()]`)
        const memoLeafOk = prop.value.type === 'Identifier'
          || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
        const sharedElementMemo = nestedSlotMemo ?? (!deepReceiver && kind === 'instance' && chain.length === 0
          && memoLeafOk && (wrapped.precedingPure || !wrapperHolesBeside)
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
          // ... and a NEIGHBOUR element keeps the residual just the same, and that residual coerces
          // this element a second time - so a sole prop beside one memoizes too (`[{ at }, z] =
          // [box.inner, 1]` fired the getter twice where the babel twin reads it once)
          && (pattern.properties.length > 1 || wrapped.wrapperRest || !wrapped.single
            || (mayHaveSideEffects(wrapped.element) && (() => {
              const decls = wrapped.declarationPath?.node?.declarations ?? [];
              const at = decls.indexOf(wrapped.declarator);
              return at === -1 || decls.slice(at + 1).every(item => !mayHaveSideEffects(item.init));
            })()))
          && (!isReReferenceableReceiver(wrapped.element) || constantMemo)
          // ... and a RE-READABLE built-in surface needs no memo whatever keeps the residual: the dispatch
          // reads it inline and the residual re-reads it for free (`[{}] = [_globalThis.Array.prototype,
          // ...t]; _at(_globalThis.Array.prototype)`); only an effectful KEY memoizes it, its sentinel
          // residual and the dispatch sharing one read - the core's own memo rule
          && ((prop.computed && computedKeyHasSideEffects(prop))
            || !isReReadableSurfaceNav(wrapped.element, name => !!injectorState?.getBindingInfo?.(name),
              { ctx: { scope: metaPath.scope, adapter, path: metaPath } }))
          // the memo holds the element AS WRITTEN: a TS cast on it is the receiver's own spelling, and
          // memoizing the peeled view dropped it where the other leg keeps it (`_ref = arr.flat() as any`)
          ? elementMemoFor(wrapped.writtenElement ?? wrapped.element,
            wrapped.declarator ?? wrapped.assignment ?? null,
            { inSlot: !wrapped.precedingPure, metaPath }) : null);
        // the dispatch SPELLS the element the source wrote (its TS cast kept - the flat canon);
        // the classifiers above read the peeled view
        // a kept WRITE in the slot dispatches on what it STORES: the wrapper lift re-emits the write
        // as its own statement ahead of the extraction and leaves that value in the slot, so the
        // receiver here is the value and the write is not lost
        const writtenSlotValue = kind === 'instance' && chain.length
          && peelTransparentExpr(wrapped.element)?.type === 'AssignmentExpression'
          ? peelChainRootValue(wrapped.element) : null;
        const declReceiver = sharedElementMemo?.ident ?? deepReceiver ?? writtenSlotValue
          ?? (wrapped.writtenElement && !mayHaveSideEffects(wrapped.writtenElement, { scope: metaPath.scope, adapter, path: metaPath })
            ? wrapped.writtenElement : wrapped.element);
        // ... and only in a declaration of its OWN: a sibling declarator's memo hoists ahead of the whole
        // declaration, and an element spelled inside an extraction would then evaluate after it
        // (`[{ at: a1 }] = [rows()], [{ at: a2 }] = [second()]` ran `second` first)
        const effectfulSoleElement = kind === 'instance' && chain.length === 0 && wrapperHolesBeside
          && !sharedElementMemo && prop.value.type === 'Identifier'
          && mayHaveSideEffects(wrapped.element, { scope: metaPath.scope, adapter, path: metaPath })
          && wrapped.declarationPath?.node?.declarations?.length === 1;
        const liveSoleElement = effectfulSoleElement
          ? () => peelTransparentExpr(wrapped.declarator.init)?.elements?.[wrapperNode.elements.indexOf(hostPatternPath.node)]
            ?? wrapped.element
          : null;
        // what the claim's dispatch READS, live: the carried slot re-resolved (a claim inside it renders by
        // replacing its node), a proven single read the dispatch performs itself (a getter slot fires once
        // there), or the effectful sole element. a drop rescue of this init owes none of them again
        const dispatchReadLive = carriedDeep
          ? () => carriedInitReceiverNode({ path: metaPath, initNode: wrapped.elementNode ?? wrapped.element, adapter })
          : plainDeep ? () => plainDeep : liveSoleElement;
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
            ? () => carriedInitReceiverNode({ path: metaPath, initNode: wrapped.elementNode ?? wrapped.element, adapter })
            : liveSoleElement,
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
            || !!sharedElementMemo || effectfulSoleElement
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
            carriedReceiverLive: dispatchReadLive,
            memoRecv: sharedElementMemo,
            bodylessWrap: wrapped.host?.bodyless === true,
            bindingTarget: propBindingTarget(prop), metaPath,
            initProbePlan: planDiscardedInitProbe(wrapped.declarator.init, metaPath, { adapter, resolvePure }),
            initProbeNavStart: discardedInitProbeNavStart(wrapped.declarator.init),
            sealedProbePlan: planSealedNavProbe(wrapped.declarator.init, metaPath,
              { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
          },
        });
        return;
      }
      // ... and where NO literal pairs the element, nothing spells it at all - the slot takes a
      // minted binding instead, which is the one route a positional segment has
      if (!wrapped && registerPositionalElementJob({ metaPath, prop, kind, entry, hintName })) return;
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
    if (hostParent?.node?.type === 'AssignmentPattern' || hostParent?.node?.type === 'ArrayPattern') {
      if (receiverSeOnly) return;
      return handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath });
    }
    // a bare param pattern (`(({ resolve }) => ...)(Promise)`): the IIFE call-arg is the
    // receiver, the same simple-synth route (findSynthSwapReceiver resolves the arg)
    // ... and a HOP under an IIFE parameter mirrors the call's argument through the shared nested
    // synth plan (its host is the call, the slot the argument) - the flat parameter's synth swap
    // one level down
    if ((hostParent?.node?.type === 'ArrowFunctionExpression' || hostParent?.node?.type === 'FunctionExpression')
      && chain.length > 0 && !receiverSeOnly
      && (hostPatternPath.listKey === 'params' || hostPatternPath.key === 'params')) {
      if (renderNestedParamSynth({ metaPath, meta })) return;
      return;
    }
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
        // ... the shared plan first where the host spells the live receiver beside the default
        // (a head whose elements differ rewinds the climb to the default and lands here): it
        // mirrors both arms, and the swap of the default alone is the fallback
        // ... asked for the NESTED leaf too: a pattern spelling only hops under the default (`[{ Array:
        // { of } } = globalThis] = []`) has no flat leaf to ask for it, and the babel leg's one route
        // mirrors it from any leaf
        if (hostParent.node.type === 'AssignmentPattern') {
          const mirrored = renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true });
          // ... and where the mirror declined as null - a pattern it cannot spell (a member target, a
          // duplicate or a non-identifier key beside the leaf) over a default still spelling a NAMED
          // receiver - and the flat leaf's simple swap declined too, a static leaf, flat or nested,
          // keeps the sound inline default, which fires only where the receiver's own static is
          // absent: the babel leg's per-key fallback for the same shape on every host. (a parameter
          // list never lands here - its own chain above extracts or keeps the native leaf)
          if (!mirrored && !(chain.length === 0 && registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName }))
            && mirrored === null && kind !== 'instance' && namedDefaultReceiver(hostParent.node.right)) {
            applyInlineDefault({ prop: metaPath.node, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
          }
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
    const keyHasSideEffect = computedKeyHasSideEffects(prop);
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
    slotMemo = null,
    metaPath = null,
    symbolPatternResidual = false,
    allProxyInit = false,
    forInit = false,
  }) {
    // the key is kept when the residual still needs it. a SOLE binding leaves none, and
    // there the extraction may carry the init whole - including its effects, when the
    // receiver IS that init (`{ flat } = (c++, gt.self).Array.prototype || {}`)
    const carriesInitWhole = !!literalReceiver && literalReceiver === declarator.init;
    // ... spelled twice only where no getter of the pattern can rebind it (a name a function writes
    // is a single read, which the memo below serves like a relaxed member's)
    const reReadable = !!literalReceiver && (metaPath
      ? isReReferenceableAcrossReads(literalReceiver, { scope: metaPath.scope, adapter, path: metaPath })
      : isReReferenceableReceiver(literalReceiver));
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
      // ... a SYMBOL leaf under a hop beside a SIBLING prop keeps its sentinel: the residual binds
      // the sibling, and the helper reads the slot the extraction spells (`{ w: { [S]: _unused }, z }`)
      || (entry === 'get-iterator-method' && !!literalReceiver && declarator.id?.properties?.length > 1)
      || (kind === 'instance' && entry !== 'get-iterator-method' && !!literalReceiver
        && ((forInit && (carried || reReadable))
          || !((soleBinding || (declaratorConsumedWhole && !reReadable))
            && (relaxedReceiver || carriesInitWhole
              || !mayHaveSideEffects(declarator.init, metaPath && { scope: metaPath.scope, adapter, path: metaPath })))));
    // a MULTI-declarator host keeps the one declaration and appends the extraction as a
    // sibling declarator - the receiver is spelled twice there, so the memo never applies
    // (`const z = 1, { ..._unused } = R, m = _f(R);`)
    // ... and a SLOT memo keeps that join: the memo stands ahead (behind the leading siblings, whose
    // own inits run first) or is written in its slot, and the extraction is appended after the
    // residual either way - the shape the flat channel takes beside a sibling
    // ... an SE-KEY sentinel with a slot memo takes the same join: its key runs in the residual, the
    // memo behind (or in) that slot, and the extraction follows as a declarator like any other
    const siblingAppend = keepKey && (!sentinel || !!slotMemo) && !!literalReceiver && declaration.declarations.length > 1;
    let memoRecv = null;
    // a SENTINEL's residual re-reads its receiver, so a value-SELECTING one may not stay
    // spelled - the branch would be taken twice. the fragment memoizes and both readers take
    // the ref (`{ y: { [(k(), 'values')]: v } } = { y: c ? [1] : [] }`); an ALL-PROXY selection
    // re-reads for free and keeps its own shape
    const branchingReceiver = !allProxyInit && !!literalReceiver
      && (literalReceiver.type === 'ConditionalExpression' || literalReceiver.type === 'LogicalExpression');
    // ... and a CONSTANT LITERAL in a SLOT behind a sentinel memoizes too: spelling `[1, 2]` twice builds
    // two arrays where the source built one, and the other leg hands both readers one `_ref`. the whole
    // init stays the drain's sentinel-memo channel, which numbers its ref where babel does
    const slotLiteral = !!literalReceiver && literalReceiver !== unwrapRuntimeExpr(declarator.init)
      && isConstantLiteralReceiver(literalReceiver);
    if (keepKey && (!sentinel || branchingReceiver || slotLiteral || slotMemo)
      && literalReceiver && (literalReceiver.type !== 'Identifier' || !reReadable)) {
      // ... and a RE-READABLE built-in surface (`Array.prototype`) spells twice instead of memoizing:
      // the second read is free, and the other leg's residual keeps the source spelling
      const relaxedMemoizable = relaxedReceiver
        && literalReceiver.type !== 'ArrayExpression' && literalReceiver.type !== 'ObjectExpression'
        && !isReReadableSurfaceNav(literalReceiver, name => !!injectorState?.getBindingInfo?.(name),
          { ctx: metaPath ? { scope: metaPath.scope, adapter, path: metaPath } : null });
      const memoizable = (relaxedMemoizable || branchingReceiver
        || isConstantLiteralReceiver(literalReceiver) || !!slotMemo || !isReReferenceableReceiver(literalReceiver))
        // ... and a sibling join over a receiver it cannot spell twice memoizes it like a slot memo
        && (!siblingAppend || !!slotMemo || !isReReferenceableReceiver(literalReceiver)) && !forInit;
      // a receiver safe to SPELL TWICE duplicates instead (the identifier route's shape,
      // one level up): the extraction clones it and the residual keeps the original. the
      // clone is taken at drain time off the already-rewritten tree, so the copy carries
      // the walk's own scope-aware claims (`[Set]` -> `[_Set]` in both, a shadowed `Map`
      // raw in both)
      if (!memoizable) {
        if (!reReadable
          && !isReReadableSurfaceNav(literalReceiver, name => !!injectorState?.getBindingInfo?.(name),
            { ctx: metaPath ? { scope: metaPath.scope, adapter, path: metaPath } : null })) return null;
      } else {
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
          memo = branchingReceiver || sentinel
            ? { ident: identifier(''), node: literalReceiver, slot, deferred: true }
            : { refName: mintRefName(), node: literalReceiver, slot };
          literalMemoNames.set(literalReceiver, memo);
        }
        memoRecv = memo;
      }
    }
    if (siblingAppend && exported && !slotMemo) return null;
    return { keepKey, memoRecv, siblingAppend };
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
  // eslint-disable-next-line max-statements -- per-route init dispatch sequence
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
      // ... and an INSTANCE leaf whose hops name a built-in surface off the value a kept WRITE
      // stores: the store keeps its header slot ahead of the extractions (the drain's storing sink),
      // and the dispatch reads the surface off what it stored (`for (const _unused = kw = (eff(),
      // _globalThis), a = _at(_globalThis.Array.prototype), b = _Object$keys;`)
      const storedTail = kind === 'instance' && chain.length > 0 && prop.value.type === 'Identifier'
        && peelTransparentExpr(declarator.init)?.type === 'AssignmentExpression'
        && isPureNavReceiver(peelChainRootValue(declarator.init), navGuardCtx(metaPath))
        && isInstanceSurfaceNav(hopChainKeys(chain).reduce(memberFromKeyName, peelChainRootValue(declarator.init)))
        ? peelChainRootValue(declarator.init) : null;
      if ((kind !== 'instance' && flatLeaf && !prop.computed) || storedTail) {
        const forInitValue = buildValue({
          guardCtx: navGuardCtx(metaPath),
          kind,
          entry,
          hintName,
          receiverNode: storedTail ?? declarator.init,
          prop,
          nested: chain.length > 0,
          chainKeys: hopChainKeys(chain),
          metaPath,
        });
        if (forInitValue) {
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
              readsReceiver: !!storedTail,
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
    // ... a DEFAULTED leaf rides the same memo: its guard reads the dispatch off the ref (the drain's
    // memo-job value), where admitting the bare identifier alone left the defaulted twin native
    // ... and a kept WRITE is that same shape with the store as its last expression: the write lifts
    // whole and the nav reads what it stored (`(kw = (eff(), globalThis))` -> `kw = ...;` + the dispatch)
    const seqInitTail = peelTransparentExpr(declarator.init)?.type === 'SequenceExpression'
      || peelTransparentExpr(declarator.init)?.type === 'AssignmentExpression'
      ? peelChainRootValue(declarator.init) : null;
    // ... a tail that is a CALL the inline canon proves to yield a proxy global is that global for the
    // nav question (the memo holds what the call returned, read once); the memo still spells the call
    // ... and a BARE call the canon proves only up to its EFFECTS takes the memo too: the memo runs it
    // once where the source did and the nav reads what it returned - the fold that drops an
    // effect-free call is the declaration route's, which this one leaves alone
    const bareInit = peelTransparentExpr(declarator.init);
    const effectfulRealmCall = !seqInitTail && isCallShape(bareInit) && !provenRealmCallRoot(bareInit, metaPath, adapter)
      && provenRealmCallRoot(bareInit, metaPath, adapter, { allowEffects: true }) ? bareInit : null;
    const memoTail = seqInitTail ?? effectfulRealmCall;
    const seqNavRoot = memoTail ? provenRealmCallRoot(memoTail, metaPath, adapter, { allowEffects: true }) ?? memoTail : null;
    if (chain.length > 0 && kind === 'instance' && !forInit && memoTail
      && (prop.value.type === 'Identifier' || defaultedIdent) && entry !== 'get-iterator-method'
      && patternBindingCount(declarator.id) !== patternBindingCount(prop.value)
      && isPureNavReceiver(seqNavRoot, navGuardCtx(metaPath))
      && isInstanceSurfaceNav(hopChainKeys(chain).reduce(memberFromKeyName, seqNavRoot))) {
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
          catchBorn: !!relocatedHostPattern(destructurePatternHostPath(metaPath)),
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
        routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
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
        routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
        return 'handled';
      }
    }
    if (prop.value.type === 'AssignmentPattern' && !defaultedIdent) return 'handled';
    if (chain.length > 0 && kind === 'instance') return 'handled';
    if (capturedSelectionDeclinesExtraction({ selecting, meta, metaPath, soleBinding, chain, kind })) {
      routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
      return 'handled';
    }
    // ... and so does a HOP whose DEFAULT carries an EFFECT, the assignment host's same arm
    if (hopDefaultCarriesEffect(chain)) {
      // the SHARED plan answers first, as it does on the other binding: it reads the slot the
      // default pairs with and mirrors the arm there, where the per-branch route below only sees
      // the leaf's own meta and leaves a passthrough sibling's tree unrenderable
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return 'handled';
      routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
      return 'handled';
    }
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
        seqRootWrite: initSeqRootHasKeptWrite(declarator.init),
        // ... and the same timing for a KEY effect buried in the spine: it rides the extraction's
        // own sequence, where the source ran it - inside the read, not ahead of it
        buriedKeyEffect: navSpineHasComputedKeyEffect(declarator.init),
        keyClaimInit: buriedKeyClaimInit(declarator.init),
        seqDirectClaimInit: initSeqDirectClaim(declarator.init),
        rawKeyRootInit: initRawKeyOnRoot(declarator.init),
        // ... and the same timing for the guard the discarded read renders through, plus the offset
        // that read starts at - the effect channel splits the init's effects on it
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        initProbeNavStart: discardedInitProbeNavStart(declarator.init),
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
  // which is what this emitter already prints for the flat source. a level above the leaf that keeps
  // SIBLINGS splits the hop out into a twin of its own beside the host (`hopSplitPlan`); the host
  // goes on binding those siblings off the root
  function registerFlattenLeafJob({ metaPath, prop, kind, entry, hintName }) {
    const defaulted = prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier';
    if (kind !== 'instance' || (prop.value.type !== 'Identifier' && !defaulted)) return false;
    const walk = resolveNestedReceiverChain(metaPath, {
      soleSlots: true, allowLeafSiblings: true, allowSlotDefault: true, siblingLevels: true, adapter,
      allowAssignmentHost: true,
    });
    if (!walk) return registerAssignLiteralTwinJob({ metaPath, prop, entry, hintName });
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
    // ... unless the host stands in a STATEMENT LIST: there the hop LEAVES its level and the twin
    // stands as a declaration of its own beside the host (`{ of: { name, foo }, junk } = Array` ->
    // `const { junk } = Array; const _ref = _Array$of; ...`) - the level keeps reading the root for
    // its siblings, on the terms `hopSplitPlan` sets
    const siblingLevel = !wrapperNode && walk.climbed.slice(1).some(level => level.pattern.properties.length > 1);
    if (wrapperNode
      ? !navPlacement || walk.hostPattern?.node?.properties?.length !== 1
      : (declaratorPath?.node?.id ?? declaratorPath?.node?.left)?.type !== 'ObjectPattern'
        || ((declaratorPath.node.id ?? declaratorPath.node.left).properties.length !== 1 && !siblingLevel)) return false;
    // ... and an ASSIGNMENT statement has the same twin, spelled as the flat assignment channel spells it
    // (`({ y: { at, flat } } = box)` -> `const _ref = box.y; at = _at(_ref); flat = _flat(_ref);`): a
    // statement nothing reads, in a statement list, with no wrapper, split or slot fold, a plain binding per leaf
    const assignStatement = declaratorPath.node.type === 'AssignmentExpression' ? assignmentTwinStatement(declaratorPath) : null;
    if (assignStatement === false || (assignStatement && (wrapperNode || siblingLevel || walk.slotDefault
      || !plainTwinLeaf(walk.leafPattern.node)))) return false;
    const declarationPath = assignStatement ?? declaratorPath.parentPath;
    if (!assignStatement && (declarationPath?.node?.type !== 'VariableDeclaration'
      || declarationPath.parentPath?.node?.type === 'ExportNamedDeclaration')) return false;
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
    if (siblingLevel && (forInit || bodylessWrap)) return false;
    // A wrapped pair stands beside the declaration and needs an end slot. An unwrapped
    // middle declarator keeps its memo, claims and residual at that same slot during drain.
    const declarators = declarationPath.node.declarations ?? [];
    const index = declarators.indexOf(declaratorPath.node);
    if (wrapperNode && !forInit && index !== 0 && index !== declarators.length - 1) return false;
    // ... and a SPLIT pair stands behind the declaration on the other leg, so its host is the LAST declarator
    if (siblingLevel && index !== declarators.length - 1) return false;
    const binding = adapter.getBinding(metaPath.scope, walk.root.name, metaPath);
    const bound = !!binding;
    const ref = resolveNestedReceiverBase({
      rootName: walk.root.name,
      keys: walk.keys,
      binding,
      adapter,
      resolveGlobalPolyfill,
      // a nav ending on a polyfillable STATIC memoizes the static's own ponyfill: the twin reads
      // `{ name, foo } = _Array$of`, never the raw static off the realm (`{ of: { name, foo } } = Array`)
      resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
    });
    // a CTOR pure has no twin here - its statics are the anchored residual's business
    if (!ref || (ref.pure && !ref.static)) return false;
    const split = siblingLevel ? hopSplitPlan(walk, { builtInRoot: !bound || !!(ref.pure || ref.static) }) : null;
    if (siblingLevel && !split) return false;
    // ONE ref per declarator: every claim in this leaf reads the same memo, which is what keeps the
    // hop a single read. minted on the first claim, reused by its siblings
    // a DEFAULT on the SLOT folds into the memo itself: what the twin destructures is the slot's own
    // value when it is defined and the default when it is not, through the same render canon.
    // mirroring the default alone polyfills the arm that may never run and leaves the live one raw
    // ... unless the memo binds a STATIC ponyfill, an import binding the static guard re-reads for free
    const slotGuardRef = walk.slotDefault && !ref.static ? injector.generateDeclaredRef(metaPath) : null;
    // the claim's OWN default rides the canonical guard: the dispatcher answers `it.method` verbatim
    // off a surface that is not the polyfilled one, so it may be undefined and the source's default
    // has to fire. its ref mints BEFORE the memo - the order the babel twin numbers them in
    // ... a CATCH-BORN host cannot hoist a `var` past its own binding: the ref is block-scoped and
    // stands as its own `let` behind the memo, ahead of the extraction - the drain's lead declaration,
    // the shape the other leg prints (the SLOT guard above stays hoisted on both)
    const catchBorn = !!relocatedHostPattern(declaratorPath);
    const guardRef = defaulted ? catchBorn ? mintRefName() : injector.generateDeclaredRef(metaPath) : null;
    let refName = flattenLeafRefs.get(declaratorPath.node);
    if (!refName) {
      refName = mintRefName();
      flattenLeafRefs.set(declaratorPath.node, refName);
    }
    const dispatchName = injectPureImport(entry, hintName);
    const defaultNode = defaulted ? prop.value : null;
    // The normalized read follows its host's receiver ref and the current source default.
    function readFlattenedValue(receiverName) {
      const dispatch = callExpression(identifier(dispatchName), [identifier(receiverName)]);
      return defaultNode ? renderInstanceDefaultGuard({
        assignedRef: identifier(guardRef), call: dispatch,
        defaultValue: defaultNode.right, defaultName: defaultNode.left?.name, reread: identifier(guardRef),
      }) : dispatch;
    }
    // spelled off the RAW init, so a TS cast the source wrote survives into the memo; a SLOT default
    // folds around it, so what the memo binds is the fold rather than the bare nav.
    // a root with no NAME - a call, a `new`, a member the walk admitted for the sole read - is
    // spelled LIVE at drain: a claim inside it renders by replacing its node, and a copy taken here
    // would ship the source read with its own polyfill lost
    function navBase() {
      if (ref.pure) return identifier(injectPureImport(ref.pure.entry, ref.pure.hintName));
      if (ref.name) return walk.rootSpelling?.type !== 'TSAsExpression' ? identifier(ref.name) : cloneNode(walk.rootSpelling);
      const rawInit = declaratorPath.node.init ?? declaratorPath.node.right;
      return cloneNode(rawInit?.type === 'TSAsExpression' ? rawInit : unwrapRuntimeExpr(rawInit));
    }
    function navNode() {
      const navSpelling = ref.path.reduce(memberFromKeyName, navBase());
      // ... a static the memo binds STRAIGHT off its import is always defined: the default is dead
      // text there; a static read through a nav is the native slot and keeps the guard
      if (ref.static && walk.slotDefault) {
        return renderStaticDefaultGuard({
          read: navSpelling,
          defaultValue: walk.slotDefault,
          reread: cloneNode(navSpelling),
          alwaysDefined: !!ref.pure && !ref.path.length,
        });
      }
      return slotGuardRef ? renderInstanceDefaultGuard({
        assignedRef: identifier(slotGuardRef),
        call: navSpelling,
        defaultValue: walk.slotDefault,
        reread: identifier(slotGuardRef),
      }) : navSpelling;
    }
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
        split,
        bodylessWrap,
        forInit,
        assignHost: !!assignStatement,
        value: readFlattenedValue(refName),
        keyReadValue: readFlattenedValue,
        leadDecl: catchBorn ? guardRef : null,
      },
    });
    return true;
  }

  // the statement an ASSIGNMENT twin replaces: a plain `=` nothing reads, in a statement list; false otherwise
  function assignmentTwinStatement(assignmentPath) {
    let statement = assignmentPath.parentPath;
    while (statement && TRANSPARENT_EXPR_WRAPPER_TYPES.has(statement.node?.type)) statement = statement.parentPath;
    return assignmentPath.node.operator === '=' && assignmentPath.node.left?.type === 'ObjectPattern'
      && assignmentPath.node.left.properties.length === 1 && statement?.node?.type === 'ExpressionStatement'
      && !!statementListOf(statement.parentPath?.node) && statement;
  }

  // a leaf the assignment twin writes claim by claim: several plain bindings, no rest, no computed key
  function plainTwinLeaf(leafPattern) {
    return leafPattern.properties.length > 1 && leafPattern.properties.every(item => item.type === 'Property'
      && !item.computed && (item.value.type === 'AssignmentPattern' ? item.value.left : item.value).type === 'Identifier');
  }

  // ... over a LITERAL the assignment twin pairs the hop with its slot (`({ y: { at, flat } } = (n++, { y: g() }))`
  // -> `const _ref = (n++, g()); at = _at(_ref); flat = _flat(_ref);`): the literal dies with the statement,
  // so the slot, carrying whatever the init performs, is the one read - re-resolved LIVE at drain, since a
  // claim inside it renders by replacing its node. a plain leaf binding only (the babel twin's gate), and a
  // slot the flat channel re-reads for free keeps the route it already takes (`= { y: box }`)
  function registerAssignLiteralTwinJob({ metaPath, prop, entry, hintName }) {
    const leafPattern = metaPath.parentPath;
    // plain one-key levels up to the statement's own pattern, the babel twin's climb
    let top = leafPattern;
    while (top?.parentPath?.node?.type === 'Property' && !top.parentPath.node.computed
      && top.parentPath.parentPath?.node?.type === 'ObjectPattern' && top.parentPath.parentPath.node.properties.length === 1) {
      top = top.parentPath.parentPath;
    }
    const assignment = top?.parentPath;
    if (prop.value.type !== 'Identifier' || top === leafPattern || assignment?.node?.type !== 'AssignmentExpression'
      || assignment.node.left !== top.node || !plainTwinLeaf(leafPattern.node)) return false;
    const statement = assignmentTwinStatement(assignment);
    function liveReceiver() {
      return carriedInitReceiverNode({ path: metaPath, initNode: assignment.node.right, adapter });
    }
    const receiver = statement ? liveReceiver() : null;
    if (!receiver || isReReferenceableReceiver(receiver)) return false;
    let refName = flattenLeafRefs.get(assignment.node);
    if (!refName) {
      refName = mintRefName();
      flattenLeafRefs.set(assignment.node, refName);
    }
    recordJob({
      hostPath: statement,
      job: {
        prop,
        pattern: null,
        chain: [],
        kind: 'instance',
        host: 'flatten-leaf',
        local: prop.value.name,
        metaPath,
        refName,
        navNode: liveReceiver,
        leafPattern: leafPattern.node,
        declaratorNode: assignment.node,
        declarationNode: statement.node,
        assignHost: true,
        value: callExpression(identifier(injectPureImport(entry, hintName)), [identifier(refName)]),
      },
    });
    return true;
  }

  // every name a pattern binds, in source order - what an exported host has to keep exporting once
  // its wrapper comes off
  function collectPatternNames(patternNode) {
    const names = [];
    if (patternNode) walkPatternIdentifiers(patternNode, id => names.push(id.name));
    return names;
  }

  // the POSITIONAL element slot (the babel twin's `extractPositionalElementSlot`): where an ARRAY
  // pattern element holds the claim, no member read stands for that element - the pattern PULLS
  // from an iterator - so the slot takes a minted binding, the declaration keeps its iteration and
  // its init, and the claim reads that binding in the statement after
  function registerPositionalElementJob({ metaPath, prop, kind, entry, hintName }) {
    if (kind !== 'instance' || !propBindingIdentifier(prop.value)) return false;
    const positional = resolvePositionalElementSlot(metaPath, adapter);
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
          arrayLevels: positional.arrayLevels,
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
        arrayLevels: positional.arrayLevels,
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
  // registration knows - the hop chain it walked, every level of it spellable as a member (the climb
  // refuses a computed hop that folds to no static name, so a standing chain needs no second test)
  function typedNavChainFor({ kind, entry, chain, metaPath, rootMemoized = false, allowSurfaceBase = false }) {
    if (kind !== 'instance' || !chain.length) return null;
    // the SURFACE opt-in belongs to the instance dispatch alone: the SYMBOL claim's own shape over
    // such a hop is the anchored re-key (`{ [_Symbol$iterator]: a } = _Map`), which both legs print,
    // and granting it a chain here retires the very refusal that keeps the key in the residual
    return typedNavClaimChain(metaPath,
      { adapter, rootMemoized, allowSurfaceBase: allowSurfaceBase && entry !== 'get-iterator-method' });
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
      { adapter, allowForInit: true, readsReceiver: kind === 'instance' || symbolProp });
    if (!wrap?.host?.forInit || prop.value.type !== 'Identifier') return false;
    const capturePlan = kind === 'instance'
      ? planArrayWrapperCapture({ pattern: wrap.declarator.id, init: wrap.declarator.init }) : null;
    let capture = forInitCaptures.get(wrap.declarator);
    if (capturePlan && !capture) {
      capture = renderArrayWrapperCapture(capturePlan, { mintRef: mintRefName });
      forInitCaptures.set(wrap.declarator, capture);
    }
    const capturedElement = capture?.elements.find(element => element.pattern === hostPatternPath.node);
    if (!wrap.single && !capturedElement) return false;
    // a REST-kept prop renames to `_unused` and the residual re-reads its init in place, so
    // only a receiverless STATIC qualifies - an instance extraction would read it a second
    // time (a multi-declarator head extracts too: babel plants the sibling ahead of the
    // jobbed declarator)
    if (sentinel && kind === 'instance') return false;
    // a kept WRITE in the element stores the receiver the nav reads: the store rides the header as
    // the drain's storing sink (ahead of the extractions, or inside a sole dispatch), and the
    // dispatch reads what it stored (`[kw = (eff(), globalThis)]` -> `_at((kw = ..., _globalThis.Array.prototype))`)
    const stored = kind === 'instance' && peelTransparentExpr(wrap.element)?.type === 'AssignmentExpression'
      && isPureNavReceiver(peelChainRootValue(wrap.element), navGuardCtx(metaPath))
      ? peelChainRootValue(wrap.element) : null;
    const value = buildValue({
      kind,
      entry,
      hintName,
      receiverNode: capturedElement ? identifier(capturedElement.ref) : stored ?? wrap.element,
      prop,
      nested: chain.length > 0, chainKeys: hopChainKeys(chain), metaPath,
      typedNavChain: typedNavChainFor({ kind, entry, chain, metaPath, rootMemoized: !!capturedElement }),
    });
    if (!value) return false;
    registerExtractAliases({ metaPath, kind, entry, hintName, prop,
      declaration: wrap.declarationPath.node, declarationPath: wrap.declarationPath });
    recordJob({
      hostPath: wrap.declarationPath,
      job: {
        prop, pattern, chain, sentinel, declarator: wrap.declarator, local: propLocalName(prop), value,
        host: 'for-init', metaPath, arrayWrapSink: true, sinkKeep: mayHaveSideEffects(wrap.declarator.init),
        readsReceiver: kind === 'instance' || symbolProp,
        arrayWrapPattern: hostPatternPath.node,
        arrayWrapCapture: capturedElement ? capture : null,
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
      ? resolveNestedReceiverNode(metaPath, { adapter }) : null;
    // ... and a slot only the SE-free single-read relaxation names (a getter hop) where a residual
    // survives: the element memo below is then its one read
    const relaxedNestedReceiver = kind === 'instance' && chain.length && !plainNestedReceiver && !soleConsume && !sentinel
      ? resolveNestedReceiverNode(metaPath, { allowSeFreeSingleRead: true, adapter }) : null;
    const carriedReceiver = plainNestedReceiver || kind !== 'instance' || !chain.length || sentinel
      || patternBindingCount(host.declarator.id) !== patternBindingCount(prop.value)
      ? null
      : carriedInitReceiverNode({ path: metaPath, initNode: host.declarator.init, adapter });
    const nestedReceiver = plainNestedReceiver ?? relaxedNestedReceiver ?? carriedReceiver;
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
    // a resolved ELEMENT living inside the init memoizes when a residual survives: the memo
    // holds the element, the kept init reads the ref in its slot, and the dispatch shares
    // the identity (`{ a, y: { flat: m } } = { a: se(), y: [3, [1, 2]] }` -> the block memo)
    const nestedMemoNode = nestedReceiver && nodeHoldsSubtree(initValue, nestedReceiver)
      && !mayHaveSideEffects(nestedReceiver) ? nestedReceiver : null;
    if (kind === 'instance' && chain.length && !carriedReceiver
      && !isReReferenceableReceiver(nestedReceiver) && !surfaceLeafValue
      && !(relaxedNestedReceiver && nestedMemoNode)) return;
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
      return peelTransparentExpr(host.declarator.init) ?? dispatchReceiver;
    }
    // ... while a receiver-LESS claim reads nothing a memo would share: the residual evaluates the init
    // where it stands, ordered around the extraction by the shared residual canon (the other leg's shape)
    const needsMemo = (!reusableInit && !soleConsume && kind === 'instance' && (!nestedReceiver || !!nestedMemoNode))
      // ... and an SE-KEY sentinel over a SEQUENCE init memoizes the sequence WHOLE: the memo is where
      // the prefix runs, the residual and the dispatch read the ref (`var _ref = (mark(), arr), { [k]:
      // _unused, z } = _ref, s = _at(_ref)` - the statement host's own shape)
      || (!!seqPrefix?.length && sentinel && kind === 'instance' && computedKeyHasSideEffects(prop) && !nestedReceiver);
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
    const proxyInitSurface = selectingInitSurface(declarator.init, metaPath);
    const allProxyInit = !!proxyInitSurface;
    let { sentinelMemoEligible, memoSibling } =
      planSentinelMemo({ sentinel, declarator, kind, allProxyInit });
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
    const seCarried = seCarriedHopNav({ forInit, chain, declarator, prop, kind,
      tailRoot: provenRealmCallRoot(peelChainRootValue(declarator.init), metaPath, adapter) });
    // a LIFTED prefix leaves the value the nav reads: a sequence leaves its tail, a kept WRITE leaves
    // what it stores - and the lift emits the write itself, so reading its value here loses nothing
    // ... a carried tail that is a CALL the inline canon proves to yield a proxy global reads as that
    // global: the fold drops the call with the navigation (its run has no effect; the other leg's shape)
    const carriedInitValue = seCarried
      ? provenRealmCallRoot(peelChainRootValue(declarator.init), metaPath, adapter) ?? peelChainRootValue(declarator.init)
      : declarator.init;
    // ... and an init the pattern DESCENDS - a literal holding the receiver in one of its slots -
    // is a nav receiver by what the hops land on, not by what the init spells: the shared decision
    // walks through the literal and hands back the nav those hops name, which is what dispatches
    // (`{ w: { Array: { prototype: { at } } } } = { w: globalThis }` reads `_globalThis.Array
    // .prototype`, exactly as its identifier-init twin does)
    const navDispatch = chain.length > 0 ? resolveNestedNavDispatch(metaPath, { adapter }) : null;
    const pureNav = ((forInit || seCarried
      ? isPureNavAfterSePrefix(carriedInitValue, guardCtx)
      : isPureNavReceiver(declarator.init, guardCtx)) && navRootReReadable(declarator.init, metaPath))
      || allProxyInit
      || (!!navDispatch?.dispatch?.root && isPureNavReceiver(navDispatch.dispatch.node, guardCtx));
    const literalRoute = planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav, adapter });
    const { soleBinding, declaratorConsumedWhole, relaxedReceiver, carriedLive } = literalRoute;
    let { literalReceiver } = literalRoute;
    // a STATIC extraction drops the slot's read, and a slot whose live `?.` can short-circuit is the
    // probe channel's (the nested plan declines the same pair): no leg carries that probe through a
    // literal hop, so the leaf stays native, where the source's own read keeps its throw
    if (kind !== 'instance' && literalReceiver && receiverCarriesLiveOptional(literalReceiver)
      && navValueCanShortCircuit(unwrapRuntimeExpr(literalReceiver), m => resolvePure(m, metaPath),
        { scope: metaPath.scope, adapter, path: metaPath })) return;
    // ... and where the pairing keeps the LITERAL alive, the prefix it elides runs from that husk:
    // the receiver may be resolved THROUGH it, so the dispatch spells the value the read yields
    // (`{ w: (g(), globalThis) }` dispatches on `_globalThis` while the husk still runs `g()`).
    // a literal the consume DROPS keeps the whole sequence in the dispatch - nothing else runs it
    if (chain.length > 0 && destructureHostLiteralSurvives(metaPath, adapter)) {
      literalReceiver = resolveNestedReceiverNode(metaPath, { adapter, allowSePeeledFragment: true })
        ?? (literalReceiver?.type === 'SequenceExpression'
          ? peelReceiverSequenceTail(literalReceiver) : literalReceiver);
    }
    // a SENTINEL-kept flat prop over a single-declarator CONSTANT literal re-reads the
    // literal directly (`{ [(se, 'flat')]: m } = [1, P]` -> `const m = _flat([1, P]);` +
    // the `_unused` residual - babel re-emits, no memo); multi-declarator keeps the memo
    // ... a SOLE prop only: beside a sibling prop the residual is a second reader, and the literal
    // memoizes into the join like every other sentinel init (`const _ref = [1, 2], { [k]: _unused, z } = _ref, s = _at(_ref)`)
    if (sentinel && !literalReceiver && !pureNav && chain.length === 0 && !forInit
      && declaration.declarations.length === 1 && declarator.id?.properties?.length === 1
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
    // a chain of pristine proxy names peels away entirely (`{ self: { keys } } = globalThis` reads
    // the root itself, native on both legs), and a computed hop that FOLDS to a static name is that
    // same nav in its bracket spelling - the climb already refused the hop no member spelling reaches
    const surfaceInit = kind === 'instance' && chain.length > 0 && entry !== 'get-iterator-method';
    // ... with the SURFACE base admitted, the assignment host's own opt-in: a chain ending ON a
    // built-in surface is the anchored machinery's shape, and the anchor re-homes the RESIDUAL
    // without dispatching - so an INSTANCE leaf reading THROUGH that surface had no route at all
    // and shipped native beside the anchor (`{ Promise: { name } } = globalThis` bound `_Promise
    // .name`, the raw read the floor answers undefined, where the other leg dispatches
    // `_nameMaybeFunction(_Promise)`). the shared plan decides, so the two hosts answer alike
    const typedNavChain = typedNavChainFor({ kind, entry, chain, metaPath, allowSurfaceBase: true });
    // a sentinel KEEPS the declarator (and its init) alive, so the discard-safety proof is
    // not needed there; the instance value builder still bounds receiver reads on its own
    if (chain.length > 0 && (kind === 'instance' && entry !== 'get-iterator-method' && !literalReceiver
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
          // ... unless a SLOT memo gives the sibling's residual and the claim one ref: the symbol
          // leaf extracts off it beside the sentinel, like the instance leaf of the same slot
          || (declarator.id?.properties?.length > 1 && !typedNavChain && !literalRoute.slotMemo && !literalReceiver))))) return;
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
    // ... and a TYPED nav off a root with no NAME takes the same single-read contract: the walk
    // admitted that root only where the declarator dies whole, and the dispatch spells it once
    const typedNavSoleConsume = !!typedNavChain && typedNavChain.root?.type !== 'Identifier'
      && patternBindingCount(declarator.id) === patternBindingCount(prop.value);
    // a nested leaf off a COMPUTED root beside a host sibling: the whole init memoizes, as the
    // sibling's own claim memoizes it, and the leaf dispatches on the hop read off that ref
    // (`{ data: { at }, keys } = mk()` -> `const _ref = mk(); const at = _at(_ref.data);`)
    if (!typedNavChain && !sentinel && !forInit && chain.length > 0 && kind === 'instance' && prop.value.type === 'Identifier'
      && entry !== 'get-iterator-method' && computedRootMemoChain(metaPath, adapter)) {
      recordJob({
        hostPath: exported ? declarationPath.parentPath : declarationPath,
        job: {
          prop, pattern, chain, kind, entry, hintName, declarator,
          local: propLocalName(prop), host: 'memo-decl', exported, metaPath,
          initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
          initProbeNavStart: discardedInitProbeNavStart(declarator.init),
          sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
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
    }, sentinelMemoNames, mintRefName);
    const catchBorn = !!relocatedHostPattern(hostParent);
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
        sinkDrop: forInit && sinkDropsReceiver(declarator.init, metaPath, adapter),
        // ... less the read the dispatch itself performs: a carried receiver the claim dispatches on is
        // read once, by that dispatch
        sinkKeep: forInit && (mayHaveSideEffects(declarator.init)
          || discardRescueNodesWithReads({ node: declarator.init, scope: metaPath.scope, adapter, path: metaPath })
            .some(node => !literalReceiver || !nodeHoldsSubtree(literalReceiver, node))),
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
        initProbeNavStart: discardedInitProbeNavStart(declarator.init),
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
        seKey: prop.computed && computedKeyHasSideEffects(prop),
        readsReceiver: kind === 'instance',
        consumeKey: kind === 'instance' && !!destructureKeyReadPlan(metaPath)?.consumeKey,
        seCarried,
        // the prefix rides the extraction's own value only where the claim spells an INSTANCE
        // dispatch to hold it; a receiver-less static and the symbol leaf bind their pure directly,
        // and there both legs lift (babel's `DEFER_SE_*` strategy family does the same)
        carriesPrefix: kind === 'instance' && entry !== 'get-iterator-method',
        catchBorn,
        memoRecv,
        // a slot memo WRITTEN in its slot: the residual performs the write, so the extraction
        // reading the ref lands after it (the array wrapper's effectful-neighbour order)
        extractAfterResidual: !!memoRecv?.inSlot,
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
  function handleAssignmentHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
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
    // A logical guard keeps its falsy path and all rest reads. The static fallback lives
    // in the leaf, as on the declaration host; a mirror cannot replace a rest receiver.
    if (rhs?.type === 'LogicalExpression' && rhs.operator === '&&' && chain.length > 0
      && kind !== 'instance' && hasRestSibling(pattern) && prop.value.type === 'Identifier') {
      applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
      return;
    }
    // the extraction's validity proof through a CAPTURE, the declarator host's own question asked
    // where the pattern is an assignment target: a captured selection whose arms do not all resolve
    // keeps the source's own read, or the ponyfill lands over whatever the opaque arm holds. the
    // host does not change the answer, only which route asks it
    if (capturedSelectionDeclinesExtraction({
      selecting: peelTransparentExpr(rhs), meta, metaPath, soleBinding: false, chain, kind,
    })) {
      routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
      return;
    }
    // only a statement-position assignment whose value nobody reads: a captured result
    // (`x = ({ from } = Array)`) keeps the full object flowing - staged. oxc preserves the
    // grouping parens the spelling requires, so the climb peels them
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && TRANSPARENT_EXPR_WRAPPER_TYPES.has(exprStmtPath.node?.type)) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    const seqHostStatement = exprStmtPath?.node?.type !== 'ExpressionStatement'
            && discardedSequenceElement(hostParent) ? hostStatementOf(hostParent) : null;
    // the hop-host note is taken AHEAD of every route: a claim this host CONSUMES never reaches the
    // stand-down below, and the residual it leaves behind re-anchors like an untouched one
    noteStaticHopPatternCallHost();
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
    // ... the RHS the leaf's own level reads: an inner default of its own ahead of the host's. the
    // shared plan settles that level first - a value the host's literal pairs proves the default
    // DEAD (nothing to mirror, the babel leg's `dead` arm), an all-proxy selection mirrors whole -
    // and only a selection the plan cannot spell goes to the per-branch mirror
    const levelRhs = nestedLeafSelectingReceiver(metaPath, rhs);
    if (kind !== 'instance' && chain.length > 0 && levelRhs !== rhs
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(levelRhs)?.type)) {
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
      if (!selectingInitSurface(levelRhs, metaPath)) {
        routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
        return;
      }
    }
    if (kind !== 'instance' && chain.length > 0
      && SELECTING_INIT_TYPES.has(peelTransparentExpr(rhs)?.type)
      && !selectingInitSurface(rhs, metaPath)) {
      routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
      return;
    }
    // a HOP whose DEFAULT carries an EFFECT, the declarator host's same arm in the same order: the
    // selecting gates above answer the default they can SPELL, and this one answers the rest of
    // them - a sequence around the selection is what the type set does not name (`= (h++, u ||
    // globalThis)`), and the consume below dropped the whole mirror with it
    if (kind !== 'instance' && hopDefaultCarriesEffect(chain)) {
      if (renderNestedParamSynth({ metaPath, meta, fallbackOnBail: true })) return;
      routeSelectionMirror(metaPath, handlePerBranch, meta?.object);
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
    // the SYMBOL leaf rides this arm like any other instance claim: its dispatch has the same shape
    // (`_getIteratorMethod(recv)`), and leaving it out kept the computed key in the residual - a
    // second read of the hop, and an import of the symbol the dispatch does not need
    // ... but NOT where that residual ANCHORS on the hop constructor's own pure binding: there it is
    // `({ [_Symbol$iterator]: it } = _Symbol)`, which reads no hop at all and needs exactly the symbol
    // import, and it is what the DECLARATION host renders on both legs. claimed here, the leaf parted
    // the two emitters on the assignment form alone
    if (kind === 'instance' && chain.length > 0) {
      const bindingId = propBindingIdentifier(prop.value);
      // NO nav segments here: this arm resolves during the WALK and clones at drain, so a spelling
      // built over the captured root can never carry the substitution the walk performs on it
      // (`globalThis` -> `_globalThis`) - it printed the raw global beside a residual reading the
      // pure import. the consume route below spells such a receiver through the passthrough
      const copyReceiver = bindingId && resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true, adapter });
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
          adapter,
        });
      // ... and a NAV the hops name off a realm slot (`{ w: { Array: { prototype: { at } } } } = { w:
      // globalThis }`) dispatches on that surface, spelled at drain off the root's pure binding - the
      // shared dispatch decision, the declaration host's own channel
      // ... asked of a LITERAL host only: a bare realm init keeps the consume route below, whose
      // jobs drain in source order beside the statics of the same statement
      const surfaceNav = !plainCopy && !carriedReceiver && bindingId
        && peelTransparentExpr(hostParent.node.right)?.type === 'ObjectExpression'
        ? resolveNestedNavDispatch(metaPath, { adapter, resolvePure }).dispatch : null;
      const navSurfaceRoot = surfaceNav?.kind === 'surface' && surfaceNav.root ? surfaceNav : null;
      // ... and a nav ending on a polyfillable STATIC dispatches on that static's ponyfill - an
      // import binding, re-referenceable by nature - never on the raw static off the realm, which
      // the floor lacks (`({ Array: { of: { name } } } = globalThis)` -> `name = _name(_Array$of)`):
      // the typed-base question the declaration host asks, so the two hosts answer alike
      // ... with LEAF siblings admitted: the residual they keep re-anchors on the static's ponyfill
      // (the drain's sole static hop), so the overwrite dispatches beside them like the declaration
      // host's hop split
      // ... asked PAST the built-in-surface refusal: that refusal hands a chain to the anchored
      // machinery, which re-homes the residual onto the surface's own pure binding and never
      // dispatches, so an instance leaf under such a hop had no route of its own at all
      const typedChain = !plainCopy && !carriedReceiver && !navSurfaceRoot && bindingId
        ? typedNavClaimChain(metaPath,
          { adapter, allowAssignmentHost: true, allowLeafSiblings: true, allowSurfaceBase: true }) : null;
      const typedBase = typedChain && resolveNestedReceiverBase({
        rootName: typedChain.root.name,
        keys: typedChain.keys,
        binding: adapter.getBinding(metaPath.scope, typedChain.root.name, metaPath),
        adapter,
        resolveGlobalPolyfill,
        resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
      });
      // ... a SLOT default on the chain keeps the consume route below, the host's own answer at
      // the floor: over a static ponyfill it is dead text that route already drops with the host
      const typedStatic = typedBase?.static && !typedChain.slotDefault ? typedBase : null;
      // ... and a hop naming a BUILT-IN SURFACE dispatches the same way, off that surface's own pure
      // binding - a ctor entry (`_Promise`), or the realm's with the hop left to navigate
      // (`_globalThis.Object`): the very receiver the residual's anchor re-homes on, so the claim
      // reads what the anchor reads instead of staying native beside it. a DEFAULTED SYMBOL leaf is
      // the one shape left to the key-swap - the shared plan's rule for a prop-level default on
      // `[Symbol.iterator]`, whose helper result is DEFINED where the raw read is undefined, so a
      // dispatch here would flip which side of the default runs
      const typedSurface = !typedStatic && typedBase?.pure && !typedChain.slotDefault
        && !(entry === 'get-iterator-method' && prop.value?.type === 'AssignmentPattern') ? typedBase : null;
      // ... and a TYPED user nav the extraction OWNS - every level dies with the claim, the host
      // included, so the dispatch is the nav's one read, in the source's own order (`({ y: { at } } =
      // src)` -> `at = _atMaybeArray(src.y)`), the declaration host's answer for the same shape
      // the nav is spelled at drain off the base's NAME, the scope-aware copy this arm needs
      const typedUserNav = !typedStatic && typedBase && !typedBase.pure && typeof typedBase.name === 'string'
        && !typedChain.slotDefault && consumedAssignmentSlotDropsHost(metaPath) ? typedBase : null;
      if (plainCopy || carriedReceiver || navSurfaceRoot || typedStatic || typedSurface || typedUserNav) {
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
        const overwriteJob = { host: 'assign-overwrite', local: bindingId.name, bodyless, seqHostStatement,
          // the drain asks the consumed host's remains through the claim's own path (a realm nav lifts by it)
          metaPath,
          // the raw slot goes with the dispatch that re-spells it - the shared canon answers which
          // slots may leave, and the drain removes the prop and drops an emptied host
          prunesSlot: prunes,
          carriesInit: !!carriedReceiver,
          prop, pattern, chain, sentinel, assignment: hostParent.node,
          value: () => {
            // a CARRIED receiver re-resolves at drain: a claim inside it renders by REPLACING its
            // node, and the walk-time copy predates that rewrite
            const spelled = carriedReceiver
                ? resolveNestedReceiverNode(metaPath,
                  { allowSePeeledFragment: true, allowInitCarriedEffects: true, adapter }) ?? carriedReceiver
                : navSurfaceRoot ? navSurfaceRoot.root : copyReceiver;
              // ... and a receiver LIFTED out of a consumed literal is a node the walk never
              // revisits: a bare proxy global spells the pure binding that stands for it
            const barePure = typedStatic || typedSurface || typedUserNav ? null
              : bareProxyGlobalPure(peelTransparentExpr(spelled), metaPath, { adapter, resolveGlobalPolyfill });
            const pureBase = typedStatic ?? typedSurface;
            const root = pureBase ? identifier(injectPureImport(pureBase.pure.entry, pureBase.pure.hintName))
                : typedUserNav ? identifier(typedUserNav.name)
                : barePure ? identifier(injectPureImport(barePure.entry, barePure.hintName))
                : duplicateReceiver(spelled, injector);
            const receiver = typedUserNav ? typedUserNav.path.reduce(memberFromKeyName, root)
                : typedSurface ? typedSurface.path.reduce(memberFromKeyName, root)
                : navSurfaceRoot ? navSurfaceRoot.keys.reduce(memberFromKeyName, root) : root;
            const call = callExpression(identifier(id), [receiver]);
            return overwriteRef
                ? overwriteDefaultGuard({ call,
                  localName: bindingId.name,
                  ref: overwriteRef,
                  defaultNode: prunes ? prop.value.right : null })
                : call;
          } };
        attachAssignmentSentinelMinter(overwriteJob, { seqHostStatement, metaPath, injector, mintUnusedName });
        recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath, job: overwriteJob });
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
    const proxyRhsSurface = selectingInitSurface(rhs, metaPath);
    const allProxyRhs = !!proxyRhsSurface;
    const pureNavRhs = allProxyRhs || isPureNavReceiver(hostParent.node.right, guardCtx);
    // the read a full consume DISCARDS, planned on the PRISTINE tree: by drain time the
    // walk has rendered the guard and the probe's own question is unanswerable
    const initProbePlan = planDiscardedInitProbe(hostParent.node.right, metaPath, { adapter, resolvePure });
    // ... and where the read that probe reproduces begins, off the SOURCE spelling: the effect
    // channel of this host splits its lift on the same offset the declarator host does
    const initProbeNavStart = discardedInitProbeNavStart(hostParent.node.right);
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
      if (typeof hopKeyName !== 'string' || !isStaticPlacement(hopKeyName)
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
    const liftPlan = pureNavRhs ? null : planLiftedRhsPrefix(hostParent.node.right, {
      anchorsInSequence: !!seqHostStatement && prop.value?.type === 'ObjectPattern',
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
    const memberStaticSlot = kind === 'static' && prop.value.type === 'MemberExpression'
      && !!memberTargetTakesExtraction(prop.value, { scope: metaPath.scope, adapter, path: metaPath });
    const flatAssignLeaf = prop.value.type === 'Identifier' || memberStaticSlot
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
    // ... a DEFAULTED leaf rides along: its guard is the value render's (the flat twin's spelling)
    const plainOrDefaultedLeaf = prop.value.type === 'Identifier' || memberStaticSlot
      || (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier');
    // ... but NEVER where the claim reads an INNER DEFAULT's arm rather than this host's own right
    // side: that pattern runs only when its slot is absent, and the arm it then reads may be the
    // USER's object - so consuming the destructure answers the ponyfill unconditionally, drops the
    // effect the arm carries, and leaves a residual the emitters cannot spell. Measured: the output
    // threw where native and the other leg bound the user's own members
    const innerDefaultArm = levelRhs !== rhs;
    const staticInMultiConsume = !pureNavRhs && !bodylessSeqPrefix && (!sentinel || restSentinelOnly) && !innerDefaultArm
            && residualSurvives && plainOrDefaultedLeaf && kind !== 'instance';
    // a NESTED receiver-less claim over a literal RHS consumes the destructure whole: the
    // statement becomes the plain re-bind (`({ a: { from: f } } = { a: Array })` ->
    // `f = _Array$from`), the discarded literal observing nothing
    // ... through a NAV past the literal's slot as well (`({ w: { Array: { from: f } } } = { w:
    // globalThis })`), or a slot HOLDING one (`{ w: globalThis?.globalThis }`): the claim is
    // receiver-less, so the nav only has to be provable - the canonical resolver spells it as the
    // source's own member reads, and its single-read promise is kept trivially by a read that never
    // happens. the declarator host consumes the same shapes; without this the literal stayed and the
    // claim shipped native
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
      && kind !== 'instance' && plainOrDefaultedLeaf
      && pattern.properties.length === 1
      // ... or the effect is the hop SLOT's own prefix, which the kept literal statement runs
      && (!mayHaveSideEffects(rhs) || hopSlotPrefixRidesLiteral(rhs, hopChainKeys(chain), guardCtx))
      && !!resolveNestedReceiverNode(metaPath,
        { adapter, allowNavSegments: true, allowSeFreeSingleRead: true, allowSePeeledFragment: true });
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
        && !resolveProxyNavReceiver(bareProxyRecvNode, guardCtx))) {
      return;
    }
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
    const keepSentinelBinding = sentinel && !restSentinelOnly && prop.value.type === 'Identifier'
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
      initProbeNavStart,
      sealedProbePlan: planSealedNavProbe(hostParent.node.right, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
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

  // the ROOT and the hop keys of a pure member nav rooted in a POSSIBLE-GLOBAL identifier, or
  // null when the receiver is not that shape. leading pristine possible-global hops are pure
  // navigation into the same surface - the kept-root canon drops them (`globalThis.self.Array`
  // reads as root + ['Array'])
  function proxyNavHead(receiver, guardCtx = null) {
    const { root: cur, keys: navKeys } = navHopChain(receiver, guardCtx);
    let keys = navKeys;
    if (!keys.length || keys.some(key => !key) || cur?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) return null;
    while (keys.length > 1 && isPristineProxyGlobal(adapter, keys[0])) keys = keys.slice(1);
    return { rootName: cur.name, keys };
  }

  // a pure member nav rooted in a POSSIBLE-GLOBAL identifier, rendered via the shared
  // passthrough resolution; null when the receiver is not that shape
  function resolveProxyNavReceiver(receiver, guardCtx = null) {
    const head = proxyNavHead(receiver, guardCtx);
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

  // the STATIC such a nav ENDS on once the pattern's own hops are read through it, as the pure
  // entry spells it - null where the whole nav names no static (`{ of: { name } } = globalThis
  // .Array` dispatches on `_Array$of`, never on a raw `.of` read off the realm)
  function resolveProxyNavStatic(receiver, chainKeys, guardCtx, metaPath) {
    const head = proxyNavHead(receiver, guardCtx);
    if (!head) return null;
    const ref = resolvePassthroughRef({
      keyPath: [...head.keys, ...chainKeys ?? []],
      receiverName: head.rootName,
      receiverIsProxy: true,
      resolveGlobalPolyfill,
      adapter,
      resolveStaticPolyfill: (ctor, key) => staticHopPure(ctor, key, metaPath),
    });
    return ref?.static ? ref.pure : null;
  }

  // for-init: consumed declarators are replaced IN PLACE by the extracted siblings, and an
  // effect-bearing consumed init stays live as an `_unused` dummy declarator

  return {
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
    noteMutatedCtorHopHost: declarator => hopHosts.set(declarator, { forceMutatedHop: true }),
    // a CTOR hop nothing extracted from re-anchors on its own member READ (`{ A$b: { from } }
    // = globalThis` -> `{ from } = _globalThis.A$b`) - only where the key qualifies as a
    // CONSTRUCTOR name the anchor may spell (the shared ctor-key-anchor gate): a lowercase
    // `constructor` names no global slot, and a non-identifier key has no member form
    noteUntouchedCtorHopHost(declarator, keyName, assignHost = false, metaPath = null) {
      if (!hopHosts.has(declarator) && isStaticPlacement(keyName)) {
        // the key the WALK resolved travels with the note: a computed spelling bound to a
        // constant (`{ [hopKey]: { viaKey } }`) names no literal the re-anchor could read
        hopHosts.set(declarator, { untouched: true, wholeDeclarator: true, assignHost, hopKeyName: keyName, metaPath });
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
    // still mints the imports that branch spells and the two import sets part over dead code
    collapseRealmSelectingHost(metaPath) {
      const host = destructurePatternHostPath(metaPath);
      const collapses = host?.node ? realmSelectingHostCollapses(host.node,
        { adapter, injectorState, scope: host.scope, path: host }) : [];
      for (const { container, key, init, operand } of collapses) {
        container[key] = cloneNode(operand);
        markSubtreeSkipped(skippedNodes, init);
        markRewrite();
      }
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
