// the proxy-spine channel of the usage-pure emitter: possible-global claims over pristine
// hop runs - the spine climbs, the fold/keep/stand-down verdicts, the guard renders and the
// root/hop claim emissions. created per transform over the factory's shared context
import {
  proxyHopClaimRoutes,
  spineHoldsKeptWrite,
  staticClaimNavigationRoutes,
  sealedClaimDisposition,
  staticClaimNeedsGuard,
  navGuardKeepsStoredProbe,
  probeHopInValue,
} from '@core-js/polyfill-provider/detect-usage/proxy-navigation';
import { planOptionalProbe } from '@core-js/polyfill-provider/detect-usage/guard-preparation';
import {
  canCollapseDeletedNavigation,
  proxyRunValueIsProven,
  navValueCanShortCircuit,
  navGuardTestBase,
  navGuardTestPlan,
  terminalNavCollapsePlan,
  directClaimProbeEffects,
  planProvenNavGuardCollapse,
  navPlanNeedsGuard,
  realmRunSplitBySequencePrefix,
  prependChainAssignmentEffect,
  aliasRootedReadMayThrow,
  chainReadsThroughSeal,
  deleteHostAboveCarriedChain,
  mutationGuardKeepingHop,
  probeRunIsTheSourceValue,
  pristineRealmHopKey,
  storedUserAssignmentOf,
  vestigialNavOptionals,
  isVestigialOptionalHop,
  proxyCollapseConsumer,
  createOuterCollapsePlanner,
  planOuterCollapseValue,
  unbackedProxyHopKey,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  planGuardedDestructureNarrow,
  planGuardedStaticNarrow,
  dispatchConsumesRun,
  planInnerProxyCollapse,
  planDeletedProxyClaim,
} from '@core-js/polyfill-provider/detect-usage/members';
import { erasedReceiverRescueNodes, renameSplitPropsToSentinels } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  capturedRealmCtorPure,
  renderNestedKeyedPatternCapture,
} from '@core-js/polyfill-provider/destructure-host-shape';
import {
  chainValueCarrier,
  CHAIN_HOP_WRAPPER_TYPES,
  climbTransparentWrapperPath,
  deleteHostAboveChain,
  isMemberWriteHost,
  isPristineProxyGlobal,
  peelParenAndTSParentPath,
  peelParenAndTSSlotPath,
  peelParenAndTSSlotChild,
  POSSIBLE_GLOBAL_OBJECTS,
  runStandsInLoweredGuardTest,
  SKIPPABLE_WRAPPER_TYPES,
  singleReturnBodyExpression,
  stepOverChainWrappers,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  typeArgumentHostOf,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  assignmentExpression,
  chainExpression,
  cloneNode,
  identifier,
  memberExpression,
  sequenceExpression,
  nullFirstGuardTest,
  renderCapturedReceiver,
  renderGuardedChainTail,
  renderShortCircuitGuard,
  renderBoundRawBranch,
  renderCtorIdentityNarrow,
  renderDestructureAssignments,
  renderNavCollapseValue,
  renderOuterCollapseValue,
  renderNavGuardTest,
} from '@core-js/polyfill-provider/render';
import {
  receiverCarriesOptional,
  replaceNodeInTree,
  withSideEffects,
} from './emit-shared.js';
import {
  guardProbeUndefinable,
  replaceGuardedHop,
  sealedClaimThrowProbe,
  sealedLayerAbove,
} from './claim-guards.js';
import {
  foldTailPristineProxyHops,
  emitNestedGuardNavValue,
  dropChainMarkerWithoutOptional,
  foldRealmHopOverCarriedValue,
  foldUnbackedRealmHopsAbove,
  landingOverSubstitutedSpan,
  insideMemoClone,
  instanceTailMemoTest,
  isDeleteOperand,
  markSubtreeSkipped,
  memberIsWriteTarget,
  navRootIsProxyIdentifier,
  noteMutatedCtorHopDestructure,
  optionalHeirAbove,
  plainProxyHopRunAbove,
  probeValueIsInvoked,
  reReadKeptWriteValue,
  sequenceTailRunAbove,
  sourceSpanKey,
  keptWriteReader,
  swallowDeadSeqWrapper,
} from './nav-spine.js';

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

// how far the navigation above a claim runs - the span a `delete` collapse would take. the MEMBER RUN
// is the span: a member continues it only while it reads THIS value as its object (reached as a
// computed KEY it is a sibling expression, not a continuation). the wrappers BETWEEN two hops - the
// chain marker, a TS cast, a source paren - are stepped THROUGH, because the comparison below peels
// the parent's object and the child alike. a seal bounds the SHORT-CIRCUIT, not this span: the `?.`
// it hides still decides whether the delete HAPPENS (`delete (nav.window?.self).slot`), so a span
// ending there would fold the run out from under the very guard that keeps it.
// where the span is deliberately WIDER than the canon chain end (`memberChainEndPath`): a carrier
// standing INSIDE it - a store, a sequence - hands the navigation on, while the canon follows one
// only at the ROOT step. the MUTATED-slot question is the other way round and rides the canon extent
// instead (`deletedRunCarriesMutatedRealmHop`): the fold lands its base UNDER those hops, so one
// standing anywhere on that extent decides for the whole run.
function deletedNavTopPath(metaPath) {
  let top = metaPath;
  // the span ends where the chain does - the root step carries no parent to continue onto
  for (let up = top.parentPath; up?.node; up = top.parentPath) {
    const upType = up.node.type;
    const topCore = unwrapRuntimeExpr(top.node);
    // ... and THROUGH the carrier standing inside the span: a store or a sequence hands the nav on,
    // and stopping at it anchored the delete question one member below the guard that decides it
    if (!SKIPPABLE_WRAPPER_TYPES.has(upType)
      && !(upType === 'MemberExpression' && unwrapRuntimeExpr(up.node.object) === topCore)
      && !chainValueCarrier(up.node, top.node)) break;
    top = up;
  }
  return top;
}

export default function createProxySpineChannel(ctx) {
  const {
    adapter,
    deleteHostedSpines,
    destructureEmit,
    hopPeelCtx,
    injectPureImport,
    injector,
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

  // one guard branch per candidate ctor, innermost-last - both legs chain the same plan list.
  // `captureSource` is the receiver VALUE the branches read through, handed to the render unless the
  // plan hoists its short-circuit INSIDE that capture - there the hoist writes the memo itself, and
  // passing it here too would assign the ref twice
  function guardChainNode(plan, rawBranch, call, captureSource, mintRef, live = null, receiverCtx = null) {
    return renderCtorIdentityNarrow(plan, rawBranch, {
      injectImport: injectPureImport, spellRecv: () => identifier(plan.recvIdent.name), call, ctx: receiverCtx,
      cloneCall: (source, callee, args, optional) => ({ ...cloneNode(source), callee, arguments: args, optional }),
      captureReceiver: plan.hoistInsideCapture ? null : captureSource,
      mintRef,
      embed: node => {
        const value = cloneNode(node);
        live?.add(value);
        return value;
      },
    });
  }

  // runtime ctor guard render: the DECISION is the shared provider plan,
  // this only composes nodes - `M === _Map ? _Map$groupBy : M.groupBy`. A raw callee binds
  // `this`, or its call stays in the branch when argument timing needs it.
  function emitGuardedStaticNarrow(meta, metaPath, parent) {
    const memberNode = metaPath.node;
    const plan = planGuardedStaticNarrow({ memberNode, parent, meta, path: metaPath, resolvePure, adapter });
    if (!plan) return false;
    if (plan.bail) return true;
    if (plan.captureReceiver) plan.recvIdent = identifier(injector.generateDeclaredRef(metaPath));
    // the receiver hop the guard absorbed is captured PLAIN - its `?.` is answered once by the
    // short-circuit the plan hoists over that hop's own base
    const captureSource = plan.receiverHop ? { ...cloneNode(plan.receiverHop), optional: false }
      : plan.captureReceiver ? cloneNode(plan.captureReceiver) : null;
    // an effectful sequence prefix on the receiver runs ONCE, ahead of the test - the raw
    // branch reads off the bare identifier, as it does off the left of a selection the build
    // decides, its dead right gone with the render
    const memberClone = plan.seqPrefix.length || plan.captureReceiver || plan.decidedSelection
      ? { ...cloneNode(memberNode), object: identifier(plan.recvIdent.name) }
      : cloneNode(memberNode);
    // a hoisted chain guard has already proved the receiver, so the raw branch drops the `?.` the
    // source wrote on the hop - and with it the chain wrapper that spelled it
    if (plan.hoisted) memberClone.optional = false;
    const rawBranch = plan.isCallee && !plan.callInBranches
      ? renderBoundRawBranch(memberClone, identifier(plan.recvIdent.name))
      : memberClone.optional || receiverCarriesOptional(memberClone) ? chainExpression(memberClone) : memberClone;
    const liveArguments = plan.callInBranches ? new Set() : null;
    // arguments of an absorbed call keep their own claims: the guard's subtree mark walks around them
    const tailArguments = new Set();
    let replacement = guardChainNode(plan, rawBranch, plan.callInBranches ? parent : null,
      captureSource, undefined, liveArguments,
      { scope: metaPath.scope, path: metaPath, adapter, injectorState: injector });
    // the plan's continuation rides inside the live branch, the short-circuit is spelled once above
    // it, and the replaced target climbs to the outermost absorbed step
    let tailTarget = null;
    if (plan.chainTail.length) {
      replacement = renderGuardedChainTail(plan.chainTail, replacement, {
        cloneHost: cloneNode,
        cloneCall: (step, built) => {
          const call = { ...cloneNode(step), callee: built };
          for (const argument of call.arguments) tailArguments.add(argument);
          return call;
        },
      });
      const outermost = plan.chainTail.at(-1);
      for (let up = metaPath.parentPath; up?.node && !tailTarget; up = up.parentPath) {
        if (up.node === outermost) tailTarget = up;
      }
    }
    // the short-circuit tests the value the source's own `?.` guards: the hop's base where the
    // RECEIVER spelling carries it, the receiver itself otherwise - and where that receiver is a
    // capture, the test rides inside the capture sequence, after the memo it reads
    if (plan.hoisted) {
      replacement = renderShortCircuitGuard(nullFirstGuardTest(plan.receiverHop
        ? cloneNode(plan.receiverHop.object) : identifier(plan.recvIdent.name)), replacement);
    }
    if (plan.hoistInsideCapture) {
      replacement = renderCapturedReceiver(identifier(plan.recvIdent.name), captureSource, replacement);
    }
    const prefixClones = plan.seqPrefix.map(expr => cloneNode(expr));
    if (prefixClones.length) replacement = sequenceExpression([...prefixClones, replacement]);
    let target = metaPath;
    if (plan.callInBranches) target = peelParenAndTSSlotPath(metaPath).parentPath;
    if (tailTarget) target = tailTarget;
    // the source `?.` arrived wrapped in a ChainExpression; the conditional replaces the whole
    // wrapper, the raw branch carries its own
    if (target.parentPath?.node?.type === 'ChainExpression' && target.parentPath.node.expression === target.node) {
      target = target.parentPath;
    }
    const consumed = target.node;
    markRewrite();
    target.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    // the WHOLE render is ours: the raw branch respells the member, and a revisit re-claiming it
    // would guard the guard. what the SOURCE still owes a claim rides in the live set the mark walks
    // around - the captured receiver's own read, the re-emitted effectful prefix, the arguments of an
    // absorbed call (`(log.push("r"), M).groupBy` still owes `push` its dispatch, exactly as the
    // babel leg's prefix clones do)
    const live = new Set([...liveArguments ?? [], ...tailArguments]);
    if (captureSource) live.add(captureSource);
    for (const expr of prefixClones) live.add(expr);
    markSubtreeSkipped(skippedNodes, replacement, live);
    return true;
  }

  // Guarded destructure hosts share their admission, captures and ordering with the provider.
  // Insert the guard while keeping receiver/default claims live and a value host's original RHS.
  // eslint-disable-next-line max-statements -- direct, nested and exported hosts land the shared guard plan
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
      isConsumedProp: item => destructureEmit.queuedJobsFor(hostPath)?.jobs.some(job => job.prop === item && !job.sentinel),
      meta,
      path: metaPath,
      resolvePure,
      adapter,
    });
    if (!admitted) return false;
    const { plan, split, restResidual, bindingName, hostKind, nested, capture, captureFirst, keepPatternLive, detach } = admitted;
    if (nested) {
      const declarationPath = nested.host.parentPath;
      if (capture && destructureEmit.unwrapExportedHost(declarationPath)) return true;
      if (!captureFirst
        && destructureEmit.renderNestedParamSynth({ metaPath, meta, fallbackOnBail: !!capture })) return true;
      if (!capture) return false;
      const rendered = renderNestedKeyedPatternCapture(capture, {
        mintRef: hostKind === 'declarator' ? destructureEmit.mintRefName : () => injector.generateDeclaredRef(metaPath),
        narrow: plan,
        split,
        assignment: hostKind !== 'declarator',
        preserveResult: hostKind === 'assignment-value',
        injectImport: injectPureImport,
        anchorPure: capturedRealmCtorPure({ capture, scope: metaPath.scope, adapter, path: metaPath, resolveGlobalPolyfill }),
      });
      if (rendered.expression) {
        for (const [index, element] of rendered.elements.entries()) {
          if (element.guarded) markSubtreeSkipped(skippedNodes, rendered.expression.expressions[index + 1]);
        }
        nested.host.replaceWith(rendered.expression);
        markRewrite();
        return true;
      }
      const elements = rendered.elements.filter(element => element.declarator);
      const extracted = elements.map(element => element.declarator);
      for (const [index, element] of elements.entries()) {
        if (element.guarded) markSubtreeSkipped(skippedNodes, extracted[index]);
      }
      destructureEmit.retireDeclaratorJobs(nested.host);
      const [captured] = nested.host.replaceWithMultiple([rendered.capture, ...extracted]);
      captured.scope.registerBinding(captured.parentPath.node.kind, captured.get('id'), captured);
      markRewrite();
      return true;
    }
    const host = hostPath.node;
    const pending = admitted.hasConsumedProps
      ? destructureEmit.queuedJobsFor(hostPath).jobs.find(job => (job.declarator ?? job.assignment) === host) : null;
    if (admitted.hasConsumedProps && !pending) return false;
    if (detach && !pending && hostKind !== 'assignment-value') {
      const list = hostKind === 'declarator' ? hostPath.parentPath.node.declarations : stmtUp?.parentPath?.node?.[stmtUp.listKey];
      if (!Array.isArray(list) || !list.includes(hostKind === 'declarator' ? host : stmtUp?.node)) return false;
    }
    // a captured receiver (`const { groupBy } = box.C`) is read once into a ref the guard tests, and
    // the guard takes the receiver's whole place
    const captureSource = plan.captureReceiver ? cloneNode(plan.captureReceiver) : null;
    const captured = plan.captureReceiver;
    if (captureSource) plan.recvIdent = identifier(injector.generateDeclaredRef(metaPath));
    function mintDefaultRef() {
      return injector.generateDeclaredRef(metaPath);
    }
    const live = new Set(captureSource ? [captureSource] : []);
    const chain = !split && !admitted.hasConsumedProps
      && guardChainNode(plan, memberExpression(identifier(plan.recvIdent.name), identifier(meta.key)),
        undefined, detach === 'after' ? null : captureSource, mintDefaultRef, live);
    if (captureSource && detach) {
      host[hostKind === 'declarator' ? 'init' : 'right'] = detach === 'before' ? identifier(plan.recvIdent.name)
        : renderCapturedReceiver(identifier(plan.recvIdent.name), captureSource, identifier(plan.recvIdent.name));
    }
    if (pending) {
      // Earlier extractions still occupy their source slots. Drain this guard beside them
      // in property order instead of inserting it ahead of the pending writes.
      const declarationPath = hostKind === 'declarator' ? hostPath.parentPath : stmtUp;
      const exported = declarationPath.parentPath?.node?.type === 'ExportNamedDeclaration';
      const leaves = split ?? [{ prop, key: meta.key, name: bindingName, plan, defaultValue: plan.destructureDefault?.value }];
      for (const [index, leaf] of leaves.entries()) {
        if (leaf.defaultValue) live.add(leaf.prop.value.right);
        markSubtreeSkipped(skippedNodes, leaf.prop, live);
        destructureEmit.recordJob({
          hostPath: exported ? declarationPath.parentPath : declarationPath,
          job: {
            prop: leaf.prop, pattern, chain: [], local: leaf.name,
            ...hostKind === 'declarator' ? { declarator: host } : { assignment: host },
            guardDetach: detach,
            metaPath, exported, host: pending.host,
            value: receiverName => {
              const receiver = receiverName ? identifier(receiverName) : captureSource ? plan.recvIdent : leaf.plan.recvIdent;
              const readPlan = { ...leaf.plan, recvIdent: receiver };
              // The queued source default is still visited. Clone its final subtree at drain time.
              if (leaf.defaultValue) readPlan.destructureDefault = { ...leaf.plan.destructureDefault, value: leaf.prop.value.right };
              return guardChainNode(readPlan, memberExpression(identifier(receiver.name), identifier(leaf.key)),
                undefined, !receiverName && index === 0 && detach !== 'after' ? captureSource : null, mintDefaultRef, live);
            },
          },
        });
      }
      markRewrite();
      return true;
    }
    if (detach) {
      markRewrite();
      markSubtreeSkipped(skippedNodes, prop);
      markSubtreeSkipped(skippedNodes, chain, live);
      pattern.properties.splice(pattern.properties.indexOf(prop), 1);
      if (hostKind === 'assignment-value') {
        hostPath.replaceWith(renderDestructureAssignments([{ name: bindingName, value: chain }], {
          residual: cloneNode(host), detach, receiver: identifier(plan.recvIdent.name),
        }));
        return true;
      }
      const placed = hostKind === 'declarator'
        ? { type: 'VariableDeclarator', id: identifier(bindingName), init: chain }
        : { type: 'ExpressionStatement', expression: assignmentExpression('=', identifier(bindingName), chain) };
      // A later capture replaces this host through its path; insertion must update that path's index.
      const anchorPath = hostKind === 'declarator' ? hostPath : stmtUp;
      if (detach === 'after') anchorPath.insertAfter([placed]);
      else anchorPath.insertBefore([placed]);
      return true;
    }
    markRewrite();
    if (!keepPatternLive) markSubtreeSkipped(skippedNodes, pattern);
    // the captured receiver stays claim-live: its own reads still owe their dispatch
    markSubtreeSkipped(skippedNodes, chain, live);
    // a MULTI-prop pattern becomes one read per prop, in source order, each taking its own guard:
    // the plan answered for all of them, so nothing here waits on a later visit - which is what lets
    // this leg render it at all, its walk never re-entering what it splices
    if (split) {
      const reads = split.map((item, index) => {
        const readPlan = captureSource ? { ...item.plan, recvIdent: plan.recvIdent } : item.plan;
        const read = guardChainNode(readPlan,
          memberExpression(identifier(readPlan.recvIdent.name), identifier(item.key)), undefined,
          captureSource && index === 0 ? captureSource : null, mintDefaultRef, live);
        markSubtreeSkipped(skippedNodes, read, live);
        return read;
      });
      if (hostKind === 'declarator') {
        hostPath.replaceWithMultiple([
          ...split.map((item, index) => ({
            type: 'VariableDeclarator', id: identifier(item.name), init: reads[index],
          })),
          // the REST reads the same receiver BEHIND the reads, with every consumed key renamed to a
          // sentinel so it still gathers exactly what the source left it
          ...restResidual ? [restResidualDeclarator(pattern, plan)] : [],
        ]);
        return true;
      }
      hostPath.replaceWith(renderDestructureAssignments(
        split.map((item, index) => ({ name: item.name, value: reads[index] })), {
          receiver: hostKind === 'assignment-value' ? identifier(plan.recvIdent.name) : null,
        }));
      return true;
    }
    const receiver = captured ?? plan.recvIdent;
    // a selection the build decides stands as the left it always yields first, the dead right leaving
    // with it, and the swap then lands on that left's receiver
    const valueKey = hostKind === 'declarator' ? 'init' : 'right';
    function swapInValue(target, next) {
      if (host[valueKey] === target) host[valueKey] = next;
      else replaceNodeInTree(host[valueKey], target, next);
    }
    if (plan.decidedSelection) swapInValue(plan.decidedSelection, meta.decidedReceiver);
    swapInValue(receiver, chain);
    if (hostKind === 'declarator') {
      host.id = keepPatternLive ? metaPath.node.value : identifier(bindingName);
      return true;
    }
    host.left = keepPatternLive ? metaPath.node.value : identifier(bindingName);
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

  // the hop a MUTATING consumer keeps, asked of the whole chain the claim stands in: the shared
  // exception walks the RUN, and a claim's own node spells only the part of it above the probe
  function mutationKeptHopAt(metaPath) {
    return mutationGuardKeepingHop(metaPath.node, m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath });
  }

  // Name a pristine realm hop through the shared key canon. Effectful keys stay native.
  function proxyHopKey(node, { allowOptional = false, metaPath = null } = {}) {
    const keyName = pristineRealmHopKey(node, { scope: metaPath?.scope, adapter, path: metaPath }, { allowOptional });
    return keyName ? { keyName } : null;
  }

  // Native claim provenance determines whether this delete names the run itself.
  // The provider owns inward admission, root/value landing, stores and effects.
  function collapseProxyHopSpine(node, metaPath, facts = {}) {
    const aliasCtx = metaPath ? { scope: metaPath.scope, adapter, path: metaPath } : null;
    function resolve(meta) { return resolvePure(meta, metaPath); }
    return planInnerProxyCollapse(node, { ...facts, aliasCtx, resolvePure: resolve,
      reader: metaPath?.node === node ? climbTransparentWrapperPath(metaPath).parentPath?.node : metaPath?.node,
      deleteFold: !!metaPath && !!deleteHostForClaim(metaPath, node, { forFold: true })
        && !dispatchConsumesRun({ path: metaPath, resolvePure: resolve, aliasCtx }) });
  }

  // Source-span and lowered-test provenance belong to the native binding. The
  // provider judges mutation and the guard over the exact span this fold erases.
  function deleteHostForClaim(metaPath, node, { forFold = false, canonOnly = false } = {}) {
    return canCollapseDeletedNavigation({
      hosted: deleteHostedSpines.has(sourceSpanKey(node))
        || deleteHostAboveChain(metaPath, node, unwrapRuntimeExpr)
        || deleteHostAboveCarriedChain(metaPath),
      loweredGuardTest: runStandsInLoweredGuardTest(metaPath, unwrapRuntimeExpr),
      mutationPath: metaPath,
      guardNode: forFold ? canonOnly ? node : deletedNavTopPath(metaPath).node : null,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: m => resolvePure(m, metaPath),
    });
  }

  // the run a MUTATING consumer keeps WHOLE, asked where the FOLD reaches. a live `?.` in the run
  // decides whether the act LANDS, and a fold swallows the hops ABOVE the claim too, so the question
  // is anchored at the run's top - a seal, a TS wrapper or a further hop parks the deciding marker
  // exactly there, out of reach of the claim's own node. every value verdict beside a collapse
  // answers `undefined` where the source throws, the price only a READ may pay, so this outranks
  // them. `mutationKeptHopAt` is the RENDER's half of the same rule: it weighs the `?.` this claim's
  // own substitution would erase, which is the claim's node and nothing above it
  function mutatedRunKeepsItsGuards(metaPath) {
    return !!mutationGuardKeepingHop(unwrapRuntimeExpr(deletedNavTopPath(metaPath).node),
      m => resolvePure(m, metaPath), { scope: metaPath.scope, adapter, path: metaPath });
  }

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
    // IDENTIFIER root the collapse family owns the whole nav and this arm stands down - except
    // across an SE-bearing sequence PREFIX, which that family's render lands INSIDE rather than
    // above: its root substitution spells the identifier in the prefix and the hops over it keep
    // their raw realm read, so standing down left `self` a native read nobody polyfills. a STORED
    // value is not that family's to begin with - the store canon owns the whole navigation there,
    // exactly as the shared marking site exempts it
    const proxyRootName = navRootIsProxyIdentifier(node, metaPath, adapter, { requireBareName: true });
    const rootIsProxyIdentifier = (!realmRunSplitBySequencePrefix(node, { scope: metaPath.scope, adapter, path: metaPath })
      || !!storedUserAssignmentOf(metaPath))
      && (typeof proxyRootName === 'string' ? !!resolveGlobalPolyfill(proxyRootName) : proxyRootName);
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
    // a claim SEALED away from the run the source reads on: a `?.` realm hop past the seal re-tests
    // the sealed value, so the run goes on through it, and the shared plan spells it whole from that
    // end - the render the root claim gives the same run. where nothing past the seal continues it
    // the root render declines and the claim keeps its own guard below
    if (sealedLayerAbove(metaPath, node) && emitRootGuardedNavCollapse(metaPath)) return true;
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
  }) {
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
    if (!navPlanNeedsGuard(plan)) return false;
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
      // ... and a probe the value canon calls defined still guards where a MUTATING consumer keeps
      // the `?.`: what that fold drops is not a value but the write itself
      // ... nor inside a guard TEST clone, where the render IS the read the test performs: the guard
      // built there answers for the run's UNBACKED hop, not for the source's `?.`, so a DEAD `?.`
      // standing this arm down handed the run to a fold that drops that read outright
      // (`(w = globalThis?.window.self.Array)?.from(x)` lost the test its `?.`-less twin spells)
      if (probe && !mutationKeptHopAt(metaPath) && !insideMemoClone(metaPath, probeTestClones)
        && !guardProbeUndefinable(probe,
          { metaPath, adapter, resolvePure, observableRead: sealedRead })) return false;
    }
    // staged corners: sequence wrappers, multi-step chain assigns. a ROOT sequence is not
    // one - but only while the test renders as the probe hop's SOURCE SLICE, which carries
    // the prefix inside it (`null == (e++, ut()).window`); a rebuilt base
    // (`navGuardTestBase`) spells the probe from imports and would drop it
    if (plan.seqAroundPrefix?.length || (plan.seqRoot && navGuardTestBase(plan))
      || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) return false;
    // harvested claim effects must be the plan's own (its kept write, its root
    // sequence's prefix - spelled once inside the test) - an effect the render has no slot
    // for would be dropped
    if (meta?.sideEffects?.length) {
      const seqPrefix = plan.seqRoot ? plan.rootValueNode.expressions.slice(0, -1) : [];
      const planOwned = new Set([plan.rootAssign, ...seqPrefix].filter(Boolean));
      if (meta.sideEffects.some(effect => !planOwned.has(effect))) return false;
    }
    let test = buildNavGuardTest(plan);
    test = instanceTailMemoTest(test, metaPath, node, seKeyReadCtx);
    const id = injectPureImport(entry, hintName);
    markRewrite();
    replaceGuardedHop({
      hopPath: metaPath,
      test: nullFirstGuardTest(test),
      built: identifier(id),
      skippedNodes,
      alwaysDefined: plan.hops.length === plan.collapseIdx + 1,
      preserveOptionalHops: true,
      resolveHere,
    });
    return true;
  }

  // the guard TEST of a nav plan: the resolvable-base probe read when one exists, else the
  // probe hop's source spelling - root substituted, dead `?.` dropped (the shared
  // vestigial verdict: a hop over the always-defined ponyfill reads plainly)
  function buildNavGuardTest(plan) {
    const test = navGuardTestPlan(plan);
    const { source } = test;
    if (skippedNodes.keepLive && source) {
      for (const child of source.children) skippedNodes.keepLive.add(child);
    }
    const probe = renderNavGuardTest(test, {
      injectImport: injectPureImport,
      cloneHost: node => source && skippedNodes.keepLive ? node : cloneNode(node),
      own: node => node,
    });
    substituteProbeProxyRoot(probe);
    if (test.base) return probe;
    // the probe is a FINISHED spelling: a re-visited claim on it must not re-collapse the
    // load-bearing read (`null == g.window` keeps its hop) - only the kept computed keys'
    // effect claims stay live and land in place. registered as a TEST clone too: the keep-live
    // carve leaves claims inside it visitable, and the call-rooted fold arms must see that
    // this nav is the read the test performs (`null == dw()?.window` keeps its call spelled)
    probeTestClones.add(probe);
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
      // A deferred owner may keep the probe's children live while owning the guard
      // above it. Rewriting that parent would add a second guard around its result.
      if (skippedNodes.has(upNode)) break;
      // step through the kept write and its wrappers (`(held = globalThis)?.window`):
      // the plan's chain-assign dig owns the store, the climb only finds the leaf. a SEAL - the
      // paren, a cast in it, the chain marker it closes - is one of those wrappers: whether the
      // run may go on past it is the leaf's own question below, asked of the nav the climb reaches
      if ((SKIPPABLE_WRAPPER_TYPES.has(upNode.type) && upNode.expression === cursor.node)
        || (upNode.type === 'AssignmentExpression' && upNode.right === cursor.node)
        // ... and a SEQUENCE root rides along whatever its prefix does: an effect-free one is the
        // bare twin's spelling (`(0, globalThis)`), and an effect-bearing one is spelled by the
        // nested render's own test, which carries the probe hop's SOURCE slice - prefix included,
        // evaluated exactly once. stopping here left the run raw where its prefix-less twin folds
        || (upNode.type === 'SequenceExpression' && upNode.expressions.at(-1) === cursor.node)) {
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
      // a run goes on past a seal only through a `?.` re-testing the sealed value: a PLAIN read of a
      // sealed short-circuit is the source's own throw, and the run under it ends at the seal
      if (chainReadsThroughSeal(leafPath.node, resolveHere, aliasCtx)) continue;
      // This channel exists for a navigation whose value can really disappear.  A syntactic
      // `?.` over the proven realm is handled by the ordinary spine collapse below, together
      // with its plain twin (`globalThis.self?.window.x` -> `_globalThis.x`).  Building a guard
      // here first preserved the dead source hops and prevented that collapse from running.
      const liveRootGuard = navValueCanShortCircuit(leafPath.node, resolveHere, aliasCtx,
        { throughChainAssign: true });
      if (!liveRootGuard && !spineHoldsKeptWrite(leafPath.node) && !storedUserAssignmentOf(metaPath)) {
        for (const hop of vestigialNavOptionals(leafPath.node, resolveHere, aliasCtx)) hop.optional = false;
        dropChainMarkerWithoutOptional(leafPath);
        continue;
      }
      const plan = planProvenNavGuardCollapse({
        rootNode: leafPath.node,
        scope: metaPath.scope,
        adapter,
        path: metaPath,
        resolvePure: resolveHere,
        throughKeptAssign: true,
        // a sequence at the run's root is spelled by the nested test's source slice, so the plan
        // may own it - the render re-emits the prefix there and nowhere else
        allowSequenceRoot: true,
      });
      if (!navPlanNeedsGuard(plan) || !plan.leafPure) continue;
      if (plan.seqAroundPrefix?.length
        || plan.topAssignSteps.length > 1 || (plan.topAssign && plan.topAssign !== plan.rootAssign)) continue;
      if (navGuardKeepsStoredProbe(plan, {
        path: leafPath, aliasCtx, invoked: probeValueIsInvoked(leafPath),
        deleteHosted: deleteHostAboveChain(leafPath, leafPath.node, unwrapRuntimeExpr),
      })) {
        dropValueProbeNavHops(plan, climbed, metaPath);
        return false;
      }
      const test = buildNavGuardTest(plan);
      // Hops above the collapse retain their source spelling on the ponyfill leaf.
      // A terminal run of realm self-references is navigation, not a value retained by
      // another consumer. Fold those hops onto the backed leaf, as the Babel binding does.
      const leafSlot = climbTransparentWrapperPath(leafPath);
      const renderPlan = terminalNavCollapsePlan(plan, { node: leafSlot.node, consumer: leafSlot.parentPath?.node });
      const leaf = identifier(injectPureImport(plan.leafPure.entry, plan.leafPure.hintName));
      const built = renderNavCollapseValue(renderPlan, leaf, { cloneHost: cloneNode });
      markRewrite();
      replaceGuardedHop({
        hopPath: leafPath,
        test: nullFirstGuardTest(test),
        built,
        skippedNodes,
        alwaysDefined: renderPlan.hops.length === renderPlan.collapseIdx + 1,
        navCollapse: true,
        preserveOptionalHops: true,
        resolveHere: m => resolvePure(m, metaPath),
      });
      return true;
    }
    return false;
  }

  // undefinability living in the KEPT VALUE: the source `?.` already guards it - drop the
  // pristine nav hops in place and transfer the `?.` to the surviving read. Effectful
  // keys stop the descent and remain ordinary source subtrees.
  function dropValueProbeNavHops(plan, climbed, metaPath) {
    const outside = climbed.filter(path => !(Number.isInteger(path.node.start)
      && path.node.start >= plan.rootAssign.start && path.node.end <= plan.rootAssign.end));
    // the climb reaches PAST the proxy run (a computed hop rides along for the plan's own
    // key resolution): only the leading run of real proxy hops drops, the first read the
    // fold rejects is the SURVIVOR (`?.self["Array"]` -> `?.["Array"]`)
    const navClimbed = [];
    for (const path of outside) {
      const hop = proxyHopKey(path.node, { allowOptional: true, metaPath });
      if (!hop) break;
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
    const wasOptional = !crossedSeal && navClimbed.some(path => path.node.optional);
    markRewrite();
    top.replaceWith(navClimbed[0].node.object);
    if (above?.type === 'MemberExpression' && wasOptional) above.optional = true;
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
      // `globalThis` reaches the output (`(() => globalThis)()?.window` tests the ponyfill).
      // WHAT such a call yields is the canon's answer (`singleReturnBodyExpression`, what the
      // value walk reads): descended by node shape, a BLOCK body shipped its raw read
      if (spine.type === 'CallExpression' && !spine.optional) {
        const callee = unwrapRuntimeExpr(spine.callee);
        const yielded = callee?.type === 'ArrowFunctionExpression' || callee?.type === 'FunctionExpression'
          ? singleReturnBodyExpression(callee.body) : null;
        if (yielded) {
          spine = unwrapRuntimeExpr(yielded);
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
  function emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount }) {
    // the collapse owns the shape wherever a `delete` may still fold it
    if (deleteHostForClaim(metaPath, node, { forFold: true })) return false;
    const plan = planOptionalProbe(node, {
      scope: metaPath.scope, path: metaPath, adapter, resolvePure: meta => resolvePure(meta, metaPath),
    }, { hintName, reader: metaPath.parentPath?.node, effects, receiverEffectCount });
    if (!plan) return false;
    const { source: probeSource, prefix: prefixSe, keySe, keepSequence: keepSeqInTest } = plan;
    const id = injectPureImport(entry, hintName);
    markRewrite();
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
    // a tail a `delete` runs on into is the operand the render hands the guard whole, kept as the
    // source spelled it - `?.` and all, as every other guard render keeps it
    const tailDeleted = deleteHostAboveChain(metaPath, node, unwrapRuntimeExpr) || deleteHostAboveCarriedChain(metaPath);
    // a REALM claim's alternate is the always-defined ponyfill the nav collapses onto, so its tail
    // takes the leaf pull the direct root's collapse takes: the `?.` reading the ponyfill folds in,
    // the next one stays outside (`(null == window ? void 0 : _self.box)?.k`). any other claim's
    // alternate is its own pure over the collapsed spine, read THROUGH by the source, so an optional
    // tail rides the branch with its `?.` kept (`p()?.window?.Promise.resolve(4)?.then?.(f)`)
    const realmLeaf = POSSIBLE_GLOBAL_OBJECTS.has(hintName);
    replaceGuardedHop({
      hopPath: metaPath,
      test,
      built: identifier(id),
      skippedNodes,
      alwaysDefined: realmLeaf,
      navAlternate: !realmLeaf,
      navCollapse: realmLeaf,
      preserveOptionalHops: !!unbackedProxyHopKey(probeSource, m => resolvePure(m, metaPath)),
      resolveHere: m => resolvePure(m, metaPath),
      prefixSe: prefixSe.length ? prefixSe.map(effect => cloneNode(effect)) : null,
      leafKeySe: keySe?.length ? keySe.map(effect => cloneNode(effect)) : null,
    });
    // ... and a READ tail answers the shared vestigial verdict like every other read off an
    // always-defined leaf: the source's `?.` over the ponyfill the alternate landed is dead text
    if (tailAbove?.type === 'MemberExpression' && !tailDeleted) {
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

  // Read the native consumer through wrappers and sequence tails, then ask the shared
  // positional policy. The supplied nodes retain their source-slot identity.
  function spineConsumerFacts(targetPath) {
    let child = targetPath.node;
    let navHost = targetPath.parentPath;
    while (navHost?.node) {
      const wrap = navHost.node;
      if (!SKIPPABLE_WRAPPER_TYPES.has(wrap.type)
        && !(wrap.type === 'SequenceExpression' && wrap.expressions.at(-1) === child)) break;
      child = wrap;
      navHost = navHost.parentPath;
    }
    const host = navHost?.node;
    return {
      node: child, source: targetPath.node, host,
      writeTarget: host?.type === 'MemberExpression' && host.object === child && memberIsWriteTarget(navHost),
      deleted: isDeleteOperand(navHost),
      deleteAbove: deleteHostAboveChain(navHost, host, unwrapRuntimeExpr),
    };
  }

  // Bind the common consumer question for the ordinary claim route as well.
  function spineIsNavigated(targetPath) {
    return proxyCollapseConsumer(spineConsumerFacts(targetPath),
      { adapter, resolvePure: m => resolveGlobalPolyfill(m.name) });
  }

  // a `?.` the shared vestigial verdict calls DEAD reads the always-defined binding this claim
  // substitutes, so the run over it is the plain twin. ONE reading for every collapse route - the
  // root claim's own run and the hop claim's spine ask it the same way
  function deadOptionalHopAt(metaPath) {
    return hop => isVestigialOptionalHop(
      hop,
      m => resolvePure(m, metaPath),
      { scope: metaPath.scope, adapter, path: metaPath },
    );
  }

  // Bind the common outward plan to native source cursors. The planner owns admission,
  // retained tails and effect placement; only the next path is selected here.
  function extendCollapseUpward(metaPath, { allowOptional, deadOptionalHop = null }) {
    let target = metaPath;
    const { plan, step, canCrossWrite } = createOuterCollapsePlanner({
      allowOptional, resolvePure: m => resolvePure(m, metaPath),
    });
    function writeAt(up, span) {
      if (plan.writeStep) return null;
      const read = keptWriteReader(up, span);
      if (!read) return null;
      const facts = {
        node: up.node, optional: !!read.reader.optional,
        readerHop: !!proxyHopKey(read.reader, { allowOptional: true, metaPath }),
        deadOptional: !allowOptional && read.reader.optional && !!deadOptionalHop?.(read.reader),
      };
      return canCrossWrite(facts) ? { target: read.target, facts } : null;
    }
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      const write = !plan.writeStep && writeAt(up, target);
      if (write && step({ kind: 'write', ...write.facts })) {
        target = write.target;
        continue;
      }
      if (up.node.type === 'ChainExpression' && up.node.expression === target.node) {
        if (!step({ kind: 'chain' })) break;
        target = up;
        continue;
      }
      if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(up.node.type) && up.node.expression === target.node) {
        const [outer, reader] = stepOverChainWrappers(target.node, up);
        const readerHop = !!plan.keptTail.length && reader?.node?.type === 'MemberExpression' && reader.node.object === outer
          && !isMemberWriteHost(reader)
          && !!proxyHopKey(reader.node, { allowOptional: allowOptional || !!deadOptionalHop?.(reader.node), metaPath });
        if (!step({ kind: 'wrapper', node: up.node, readerHop,
          stored: !!storedUserAssignmentOf(up, { throughReads: false }) })) break;
        target = up;
        continue;
      }
      if (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === target.node) {
        const run = sequenceTailRunAbove(up);
        const readerHop = !!run && !!proxyHopKey(run.member, { allowOptional: true, metaPath });
        const held = !readerHop && peelParenAndTSParentPath(up);
        if (!step({ kind: 'sequence', readerHop, stored: !!held && !!writeAt(held, up),
          prefixes: [...readerHop ? run.prefixes : [], ...up.node.expressions.slice(0, -1)] })) break;
        target = readerHop ? run.top : up;
        continue;
      }
      if (up.node.object !== target.node) break;
      const writeTarget = isMemberWriteHost(up);
      const hop = !writeTarget && proxyHopKey(up.node, { allowOptional: true, metaPath });
      if (!step({ kind: 'member', node: up.node, keyName: hop?.keyName, writeTarget,
        deadOptional: !writeTarget && !allowOptional && !!plan.keptTail.length && !!deadOptionalHop?.(up.node) })) break;
      target = up;
    }
    return { target, ...plan };
  }

  // Apply the shared collapse product at its native target, preserving skip identity,
  // optional-node representation and the binding's follow-up rewrite bookkeeping.
  function renderProxySpineCollapse({ metaPath, collapsed, entry, hintName, allowOptional = false, deadOptionalHop = null }) {
    const outer = extendCollapseUpward(metaPath, { allowOptional, deadOptionalHop });
    const { target } = outer;
    const parent = target.parentPath;
    const directReader = parent?.node;
    // Expensive source facts stay lazy: a declined or stored route never asks about
    // the value route's memo ancestry, and an unsealed read never asks about a delete.
    const plan = planOuterCollapseValue(outer, collapsed, { entry, hintName }, {
      scope: metaPath.scope, adapter, path: metaPath, resolvePure: m => resolvePure(m, metaPath),
    }, {
      allowOptional, consumer: spineConsumerFacts(target),
      get mutatedGuards() { return mutatedRunKeepsItsGuards(metaPath); },
      sealed: parent?.node?.type === 'ParenthesizedExpression'
        || (parent?.node?.type === 'ChainExpression' && parent.parentPath?.node?.type === 'ParenthesizedExpression'),
      get deletedAbove() { return deleteHostAboveChain(target, target.node, unwrapRuntimeExpr); },
      get deleteFold() { return deleteHostForClaim(metaPath, metaPath.node, { forFold: true }); },
      get inProbe() { return insideMemoClone(metaPath, probeTestClones); },
      get inMemo() { return insideMemoClone(metaPath, memoValueClones); },
      get parentInMemo() { return insideMemoClone(metaPath.parentPath, memoValueClones); },
      directReader: directReader?.type === 'MemberExpression' && unwrapRuntimeExpr(directReader.object) === target.node,
    });
    if (!plan) return false;
    markRewrite();
    if (plan.kind === 'decline') return false;
    const consumed = target.node;
    const replacement = renderOuterCollapseValue(plan, { injectImport: injectPureImport });
    if (plan.kind === 'write-in-place' && plan.optional) directReader.optional = true;
    if (plan.kind === 'store') {
      const carried = climbTransparentWrapperPath(target);
      const consumer = carried.parentPath?.node;
      if (consumer?.type === 'MemberExpression'
        && unwrapRuntimeExpr(consumer.object) === unwrapRuntimeExpr(carried.node)) {
        consumer.optional = plan.optional && optionalHeirAbove(consumer, unwrapRuntimeExpr(carried.node)) !== null;
      }
    }
    const replaceAt = plan.kind === 'store' || plan.kind === 'write-in-place' ? target
      : landingOverSubstitutedSpan(plan.swallowDeadSequence ? swallowDeadSeqWrapper(target, adapter) : target);
    replaceAt.replaceWith(replacement);
    markSubtreeSkipped(skippedNodes, consumed);
    skippedNodes.add(replaceAt.node);
    if ((plan.kind === 'write' && !plan.readsOffWrite) || plan.deadOptional) {
      deoptionalizeOverSubstituted({ metaPath: plan.kind === 'write' ? target : replaceAt,
        node: consumed, replacement, proxyRoot: true });
    }
    if (plan.kind === 'value' && plan.valuePosition) {
      foldRealmHopOverCarriedValue(replaceAt, { adapter, resolvePure: m => resolvePure(m, metaPath) });
    }
  }

  // the POSSIBLE-GLOBAL hop claim over a pristine proxy spine: it collapses to the spine's
  // ROOT binding while retaining its root effects and stores. True when this arm rendered.
  function emitProxyHopClaim({ meta, metaPath, node, entry, hintName }) {
    const above = climbTransparentWrapperPath(metaPath).parentPath?.node;
    const routes = proxyHopClaimRoutes({
      node, above, hintName,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: m => resolvePure(m, metaPath),
      sealed: sealedLayerAbove(metaPath, node),
      stored: !!storedUserAssignmentOf(metaPath),
      probeTest: insideMemoClone(metaPath, probeTestClones),
      deleteHosted: deleteHostForClaim(metaPath, node),
      deleteFold: deleteHostForClaim(metaPath, node, { forFold: true }),
      deleteRunFold: () => deleteHostForClaim(metaPath, node, { forFold: true }),
      deleteClaimFold: () => deleteHostForClaim(metaPath, node, { forFold: true, canonOnly: true }),
    });
    for (const route of routes) {
      if (route.kind === 'static-guard') {
        if (emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName,
          planNode: node, declineValueProbe: route.declineValueProbe, sealedRead: route.sealedRead })) return true;
        continue;
      }
      if (route.kind === 'root-guard') {
        if (emitRootGuardedNavCollapse(metaPath)) return true;
        continue;
      }
      if (route.kind === 'stored-probe') {
        markRewrite();
        // A source seal ends the short-circuit: only an open continuation inherits it.
        if (optionalHeirAbove(above, node)) {
          above.optional = true;
          replaceNodeInTree(above, above.object, node.object);
        } else replaceNodeInTree(above.object, node, node.object);
        skippedNodes.add(node);
        return true;
      }
      const { collapsed, deleteFold: deleteHost } = route;
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
    return false;
  }

  // the span a claim SWAP consumes: a TS wrapper (a cast, a non-null, their paren skins) around the
  // claimed spelling goes with it - the substituted binding needs no assertion (`(Map as any)` ->
  // `_Map`). a BARE paren stops the climb: that seal is load-bearing here (the read it makes
  // observable rides back as a throw probe), unlike the spine collapse's own climb
  function climbSubstitutedSpan(metaPath) {
    let target = metaPath;
    for (let up = target.parentPath; up?.node; up = target.parentPath) {
      const upType = up.node.type;
      // an instantiation filling a call's, a `new`'s or a tag's slot hands its type arguments to that
      // host, which keeps them on the substituted binding (`new (Map<string, number>)()` ->
      // `new _Map<string, number>()`); anywhere else it wraps the claim for the type layer alone and
      // goes with it like a cast (`(Map.groupBy<T>)` -> `_Map$groupBy`)
      if (upType === 'TSInstantiationExpression' && typeArgumentHostOf(up)) break;
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

  // what still runs once a swap erases a member claim's receiver spelling: the harvested SE with the
  // receiver's chain-assignments spliced in at the recorded receiver/key boundary (ECMA receiver-before-key),
  // or - nothing harvested - the canonical discard rescue of what the erasure would observably drop (a
  // chain-assignment rescued whole, an SE-bearing root call), a provably pure root call falling away
  function erasedReceiverEffects({ meta, metaPath, node }) {
    return meta.sideEffects?.length
      ? prependChainAssignmentEffect(node.object, meta.sideEffects, meta.chainAssignInsertAt ?? meta.receiverEffectCount)
      : erasedReceiverRescueNodes({ node: node.object, scope: metaPath.scope, adapter, path: metaPath });
  }

  // the kept-root hop collapse first, then the plain static / global claim swap
  function emitStaticGlobalClaim({ meta, metaPath, node, kind, entry, hintName }) {
    const routes = staticClaimNavigationRoutes({
      node,
      kind,
      hintName,
      meta,
      aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
      resolvePure: m => resolvePure(m, metaPath),
      deletion: () => deleteHostForClaim(metaPath, node, { forFold: true }),
      rootRun(allowOptional) {
        const deadOptionalHop = deadOptionalHopAt(metaPath);
        return { run: plainProxyHopRunAbove(metaPath, proxyHopKey, { allowOptional, deadOptionalHop }), deadOptionalHop };
      },
    });
    for (const route of routes) {
      switch (route.kind) {
        case 'nested-guard':
          if (emitNestedGuardNavValue(metaPath, node, nestedGuardCtx)) return;
          break;
        case 'hop':
          if (emitProxyHopClaim({ meta, metaPath, node, entry, hintName })) return;
          break;
        case 'written-store': {
          const effects = erasedReceiverEffects({ meta, metaPath, node });
          if (effects?.at(-1) === route.store) {
            markRewrite();
            climbSubstitutedSpan(metaPath).replaceWith(effects.length > 1 ? sequenceExpression(effects) : effects[0]);
          }
          return;
        }
        case 'static-guard':
          if (emitStaticOverGuardedNav({ meta, metaPath, node, entry, hintName })) return;
          break;
        case 'root-host':
          noteMutatedCtorHopDestructure(metaPath, node, { adapter, destructureEmit });
          break;
        case 'root-guard':
          if (emitRootGuardedNavCollapse(metaPath)) return;
          break;
        case 'root-collapse':
          if (renderProxySpineCollapse({
            metaPath,
            collapsed: { entry: route.pure?.entry ?? entry, hintName: route.pure?.hintName ?? hintName, effects: [] },
            entry, hintName, allowOptional: route.deleteFold, deadOptionalHop: route.deadOptionalHop,
          }) !== false) {
            // Only a root binding makes the surviving connector's optional vestigial.
            if (route.deleteFold && route.run.consumer?.type === 'MemberExpression'
              && carriedValue(route.run.consumer.object)?.type === 'Identifier') route.run.consumer.optional = false;
            return;
          }
      }
    }
    // static / global claim: the member (or bare identifier) becomes the import binding;
    // harvested SE (a computed key, a sequence receiver) re-runs ahead of it in source order,
    // and a member's erased receiver keeps what it would observably drop (`erasedReceiverEffects`)
    let effects = meta.sideEffects;
    // a receiver whose spine carries a LIVE `?.` gates the claim: the probe (the deepest
    // optional hop's own spelling) becomes the null test, the claim rides the alternate
    // (`condFn?.()?.Array.of(12)` -> `null == condFn?.() ? void 0 : _Array$of(12)`) - a
    // seq rescue would erase the short-circuit
    if (staticClaimNeedsGuard(node, m => resolvePure(m, metaPath), { scope: metaPath.scope, adapter, path: metaPath })
      && emitLiveOptionalProbeGuard({ metaPath, node, entry, hintName, effects, receiverEffectCount: meta.receiverEffectCount })) return;
    const sealed = kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && !effects?.length
      && sealedClaimDisposition(node, m => resolvePure(m, metaPath), { scope: metaPath.scope, adapter, path: metaPath });
    if (sealed?.kind === 'collapse') {
      markRewrite();
      metaPath.replaceWith(sealed.node);
      return;
    }
    if (node.type === 'MemberExpression') effects = erasedReceiverEffects({ meta, metaPath, node });
    // a pristine hop reading a KEPT-WRITE surface re-reads the ROOT after the write
    // (`(a = _globalThis).self` -> `(a = _globalThis, _globalThis)`, babel's re-read canon)
    // - but only TERMINAL: navigated further, the hop keeps its OWN pure
    // (`(p = _globalThis).self.Set` -> `(p = _globalThis, _self).Set`)
    // is the probe run standing over this claim the value the SOURCE reads? asked before the swap,
    // while the spine still stands - the tail fold below reads it
    const probeRunIsTheValue = probeRunIsTheSourceValue(metaPath,
      { resolvePure: m => resolvePure(m, metaPath), effects });
    // A direct delete lands on the run's root; reading through a retained probe on
    // the way to that slot still observes the stored value. The shared plan owns both.
    const deleted = kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
      ? planDeletedProxyClaim(node, {
        aliasCtx: { scope: metaPath.scope, adapter, path: metaPath },
        resolvePure: m => resolvePure(m, metaPath),
        claimName: hintName,
        deleteFold: !!deleteHostForClaim(metaPath, node, { forFold: true }),
      }) : null;
    const redirected = deleted?.pure;
    if (deleted?.keep) {
      const target = climbSubstitutedSpan(metaPath);
      const consumed = target.node;
      const replacement = withSideEffects(deleted.keep, deleted.effects);
      markRewrite();
      target.replaceWith(replacement);
      markSubtreeSkipped(skippedNodes, consumed, new Set([deleted.keep, ...deleted.effects]));
      skippedNodes.add(replacement);
      return;
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
    const id = deleted?.alias?.name ?? injectPureImport(redirected?.entry ?? entry, redirected?.hintName ?? hintName);
    markRewrite();
    const target = climbSubstitutedSpan(metaPath);
    const consumed = target.node;
    // the harvested effects run where the source runs them - ahead of the read the probe
    // reproduces (`(seq++, <probe>, _Array$of)(11)`); one the probe already spells drops
    // the probe node rides UNCLONED - it carries its own skip mark, and a copy would be
    // re-visited and claimed into the very ponyfill it stands ahead of
    const replacement = throwProbe
      ? sequenceExpression([
        ...directClaimProbeEffects(throwProbe, effects).map(effect => effect === throwProbe.node ? effect : cloneNode(effect)),
        identifier(id),
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
    const substitutedAt = node.type === 'MemberExpression'
      && POSSIBLE_GLOBAL_OBJECTS.has(redirected?.hintName ?? hintName) && !probeRunIsTheValue
      ? foldRealmHopsAndLand({ target, consumed, replacement, metaPath }) : target;
    // ... and BEFORE the `?.` verdict below: that one drops the chain wrapper the folded hop still
    // sits under, and a path whose container it detached writes into nothing
    // walk up from TARGET: a consumed TS wrapper sat between the claim and its `?.` parent
    // (`(Map as any)?.()` - the call reads the replacement directly after the climb)
    deoptionalizeOverSubstituted({
      metaPath: substitutedAt,
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

  // the realm hops standing over a substituted binding fold away here, and the fold answers WHERE
  // that binding then lives: the `?.` verdict walks up from it, and from the pre-fold path it read a
  // hop the fold had taken out of the tree, leaving a guard over a binding that cannot be absent.
  // only over a PROVEN root - an opaque call root is undefinable by its own canon, so the guard the
  // source wrote over it stands (`dh().self.window?.name` keeps its `?.`)
  function foldRealmHopsAndLand({ target, consumed, replacement, metaPath }) {
    function resolveHere(meta) {
      return resolvePure(meta, metaPath);
    }
    const folded = foldUnbackedRealmHopsAbove(target, replacement, { adapter, resolvePure: resolveHere });
    return folded && proxyRunValueIsProven(consumed, resolveHere, { scope: metaPath.scope, adapter, path: metaPath })
      ? folded : target;
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
      if (!chainDropped && dropChainMarkerWithoutOptional(chainPath)) chainDropped = true;
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
    if (node.optional) dropChainAt(metaPath.parentPath);
  }

  return {
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
    mutatedRunKeepsItsGuards,
    peelNonNullWraps,
    proxyHopKey,
    spineIsNavigated,
    substituteProbeProxyRoot,
  };
}
