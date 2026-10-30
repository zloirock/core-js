import {
  isMemberAccessNode,
  isPristineProxyGlobal,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverCarriesLiveOptional,
  unwrapRuntimeExpr,
  peelChainAssignmentDeep,
  climbTransparentWrapperPath,
  claimDeleteOperand,
  isMemberWriteHost,
  memberKeyName,
  memberKeepsReceiverThrow,
} from '../helpers/ast-patterns.js';
import {
  deleteGuardKeepingHop,
  canCollapseDeletedNavigation,
  navValueCanShortCircuit,
  navHasUnresolvableProxyHop,
  peelReceiverSequenceTail,
  peelChainRootValue,
  mutationGuardKeepingHop,
  unbackedProxyHopKey,
  pristineRealmHopKey,
  callValueCanBeUndefined,
  unbackedTailRidesAbove,
  writtenRunKeptProbeStore,
  proxyCollapseConsumer,
  maximalProxyGlobalHop,
  runSwallowsStoreProbe,
  findProxyGlobal,
  keptProbeStore,
  collectChainAssignsThroughMemberChain,
  sealedChainBoundary,
  proxyReceiverValueCanBeUndefined,
  realmRootIsSpellable,
  directClaimProbePlan,
  aliasRootedReadMayThrow,
} from './resolve.js';
import {
  dispatchConsumesRun, planInnerProxyCollapse, proxyRunLandingPure, planProxyReceiver, planKeptSequenceReceiver,
} from './members.js';
import { optionalMemberStaysGuarded } from './guard-preparation.js';

// A root-driven fold has found its receiving slot, but has no claim owning that slot.
// Source consumers decide whether it folds whole or reads through a retained store.
// A refresh keeps the store's identity while native bookkeeping renews its children;
// ask the receiver plan only after that step, and the sequence fallback after a refusal.
export function * proxyRootCollapseRoutes({
  path, aliasCtx, resolvePure, writeTarget, deleteHosted, valueConsumer = null, keptSequence = false,
}) {
  const { node } = path;
  if (!maximalProxyGlobalHop(node, aliasCtx, { throughChainAssign: true })
    || (!deleteHosted && navValueCanShortCircuit(node, resolvePure, aliasCtx))
    || runSwallowsStoreProbe(node, resolvePure)
    || sealedClaimDisposition(node, resolvePure, aliasCtx, node)?.kind === 'throw') return;
  if (valueConsumer) {
    const source = planInnerProxyCollapse(node, {
      aliasCtx, resolvePure, root: findProxyGlobal(node, aliasCtx, true), allowOptional: true, valueConsumer,
    });
    if (source?.entry) yield { kind: 'whole', source };
    return;
  }
  const deleteRoot = deleteHosted && !collectChainAssignsThroughMemberChain(node, { throughEffects: false }).length;
  const keptStore = keptProbeStore(node.object, resolvePure, aliasCtx);
  if (writeTarget && !deleteRoot && !proxyCollapseConsumer({
    node: node.object, host: node, writeTarget: true,
    hasKeptTail: navHasUnresolvableProxyHop(node.object, resolvePure, aliasCtx),
    storeHoldsProbe: !deleteHosted && !!keptStore,
  }, { adapter: aliasCtx?.adapter, resolvePure }).writeThrough) return;
  if (keptStore) yield { kind: 'refresh', store: keptStore };
  const plan = planProxyReceiver(path.node, {
    aliasCtx, isWriteTarget: writeTarget, throughChainAssign: true, resolvePure,
  });
  if (plan) yield { kind: 'receiver', plan };
  if (keptSequence && !writeTarget && !deleteRoot) {
    const tail = planKeptSequenceReceiver(path, { aliasCtx, resolvePure });
    if (tail) yield { kind: 'sequence', tail };
  }
}

// a KEPT WRITE anywhere down the member spine (`((dw = gw) as any)?.self` - the write
// anchors the kept-root canon even buried under hops)
// `throughHops: false` asks the narrower question - is the write the value this spine READS, with
// only wrappers and sequence tails between? a write buried under a HOP is not: what the read holds
// is an environment value taken ABOVE the store, and a caller keying on the store's own surface
// must not answer yes for it
export function spineHoldsKeptWrite(objectNode, { throughHops = true } = {}) {
  // ... and through a SEQUENCE tail: the write is the value the spine reads either way
  // (`(c++, e = globalThis.window)?.[k]` anchors on the same kept write as the bare twin)
  let value = unwrapRuntimeExpr(objectNode);
  for (;;) {
    if (throughHops && value?.type === 'MemberExpression') {
      value = unwrapRuntimeExpr(value.object);
      continue;
    }
    if (value?.type === 'SequenceExpression') {
      value = unwrapRuntimeExpr(value.expressions.at(-1));
      continue;
    }
    break;
  }
  return value?.type === 'AssignmentExpression';
}

// is the PLAIN proxy run above this hop claim read OPTIONALLY by a consumer of its own?
// that `?.` is the only survivor of the source read, and the run's collapse would answer the
// always-defined ponyfill where the source throws - the claim's guard render owns the shape.
// a consumer that is itself a proxy hop is the probe-LEAF shape instead: pure cannot back it,
// so the whole run stays spelled and nothing here renders
function plainRunReadOptionally(path, node, aliasCtx) {
  let child = node;
  let up = path.parentPath;
  while (up?.node?.type === 'MemberExpression' && up.node.object === child && !up.node.optional
    && pristineRealmHopKey(up.node, aliasCtx)) {
    child = up.node;
    up = up.parentPath;
  }
  const consumer = up?.node;
  if (consumer?.type !== 'MemberExpression' || consumer.object !== child || !consumer.optional) return false;
  return !pristineRealmHopKey(consumer, aliasCtx, { allowOptional: true });
}

// The receiver route also preserves a syntactic optional over an unbacked call-root
// hop. A delete asks only `deleteGuardKeepingHop`: applying this union there would
// choose two different bindings for a proven, dead optional.
function callRootProbeStaysGuarded(node, resolvePure, aliasCtx) {
  let root = unwrapRuntimeExpr(node);
  while (isMemberAccessNode(root)) root = unwrapRuntimeExpr(peelReceiverSequenceTail(root.object));
  if (root?.type !== 'CallExpression' && root?.type !== 'OptionalCallExpression') return false;
  for (let cur = unwrapRuntimeExpr(node); isMemberAccessNode(cur);
    cur = unwrapRuntimeExpr(peelReceiverSequenceTail(cur.object))) {
    if (cur.optional && unbackedProxyHopKey(cur, resolvePure)) return true;
  }
  return !!deleteGuardKeepingHop(node, resolvePure, aliasCtx);
}

// Ordered source decisions for a possible-global hop claim. Yielding is deliberate:
// a declined native guard can settle optional markers, so later proofs read the live
// source after that attempt. The binding supplies provenance, never route predicates.
export function * proxyHopClaimRoutes({
  node, above, aliasCtx, resolvePure, hintName, sealed, stored, probeTest,
  deleteHosted, deleteFold, deleteClaimFold, deleteRunFold,
}) {
  const { path, adapter } = aliasCtx;
  function aboveReads() { return isMemberAccessNode(above) && unwrapRuntimeExpr(above.object) === node; }
  const aboveKey = aboveReads() && !above.computed ? above.property?.name : null;
  const sealedAbove = !!aboveKey && POSSIBLE_GLOBAL_OBJECTS.has(aboveKey)
    && !isPristineProxyGlobal(adapter, aboveKey, { node: above, path });
  const sealedRead = (sealed && navValueCanShortCircuit(node, resolvePure, aliasCtx)) || stored;
  const probeIsKeptWrite = unwrapRuntimeExpr(node.object)?.type === 'AssignmentExpression';
  const mutationGuard = !!mutationGuardKeepingHop(node, resolvePure, aliasCtx);
  const deadOwnOptional = node.optional && !mutationGuard
    && (probeIsKeptWrite || !spineHoldsKeptWrite(node.object))
    && !optionalMemberStaysGuarded(node, { ...aliasCtx, resolvePure, observableRead: sealedRead });
  if (probeTest && navHasUnresolvableProxyHop(node.object, resolvePure, aliasCtx)) {
    yield { kind: 'static-guard' };
  }
  const deadSpineOptionals = !navValueCanShortCircuit(node, resolvePure, aliasCtx, { throughChainAssign: true });
  let collapsed = sealedAbove || mutationGuard ? null : planInnerProxyCollapse(node, {
    aliasCtx, resolvePure, allowOptional: deleteFold || deadOwnOptional || deadSpineOptionals,
    reader: above,
    provenCallRoot: deleteClaimFold() || !deleteHosted,
    deleteFold: deleteRunFold() && !dispatchConsumesRun({ path, resolvePure, aliasCtx }),
  });
  if (collapsed?.unbackedRoot) collapsed = null;
  const probedReceiver = !deleteFold && receiverCarriesLiveOptional(node.object)
    && navHasUnresolvableProxyHop(node.object, resolvePure, aliasCtx);
  const optionalAbove = aboveReads() && above.optional && !probedReceiver;
  const guardOwnClaim = !collapsed && !sealedAbove && !optionalAbove && !deleteFold;
  if (guardOwnClaim && node.optional && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
    && resolvePure({ kind: 'global', name: hintName }) && aboveReads()) {
    let probeStore = unwrapRuntimeExpr(node.object);
    if (probeStore?.type === 'SequenceExpression') probeStore = unwrapRuntimeExpr(probeStore.expressions.at(-1));
    const assignedValue = peelChainAssignmentDeep(probeStore);
    const storeValue = peelChainRootValue(assignedValue);
    if (assignedValue !== probeStore && isMemberAccessNode(storeValue)
      && !storeValue.computed && POSSIBLE_GLOBAL_OBJECTS.has(storeValue.property?.name)
      && !resolvePure({ kind: 'global', name: storeValue.property.name })) yield { kind: 'stored-probe' };
  }
  const guardedReceiver = (node.optional && !deadOwnOptional)
    || callRootProbeStaysGuarded(node.object, resolvePure, aliasCtx)
    || (receiverCarriesLiveOptional(node.object) && navValueCanShortCircuit(node.object, resolvePure, aliasCtx));
  if (guardOwnClaim && guardedReceiver) {
    if (unbackedTailRidesAbove(path, resolvePure)) yield { kind: 'root-guard' };
    yield { kind: 'static-guard', declineValueProbe: true, sealedRead };
  }
  if (collapsed && !deleteFold && !sealedAbove
    && navValueCanShortCircuit(path.parentPath?.node ?? node, resolvePure, aliasCtx)
    && plainRunReadOptionally(path, node, aliasCtx)) yield { kind: 'static-guard' };
  if (collapsed) yield { kind: 'collapse', collapsed, deleteFold };
}

// A sealed source read owns its throw before any outer key or optional reader.
// Otherwise an admitted guard plan offers its plain-call collapse and root landing.
// A delete that can erase its guards must either spell the value
// or stand down; it must never fall back to constructing a conditional delete.
export function * navGuardCollapseRoutes(plan, { source, reader = null, aliasCtx, deleteHosted }) {
  if (sealedChainBoundary(aliasCtx.path.node)
    && sealedClaimDisposition(source(), plan.resolvePure, aliasCtx, reader?.())?.kind === 'throw') {
    const probe = directClaimProbePlan(source(), plan.resolvePure, aliasCtx);
    const tail = plan.hops[plan.collapseIdx + 1];
    // A retained plain tail can own the read, but must stay OUTSIDE the guard.
    // A live optional or effectful key instead needs the earlier throw probe.
    if (probe && tail && !tail.liveOptional
      && sealedClaimDisposition(source(), plan.resolvePure, aliasCtx, tail.node)?.kind !== 'throw') {
      yield { kind: 'sealed-tail', probe: { ...probe, boundary: { ...probe.boundary, member: null } } };
    } else yield probe ? { kind: 'sealed-probe', probe, defined: !tail } : { kind: 'stand-down' };
    return;
  }
  const definedCallRoot = plan.hops.every(hop => !hop.optional && !hop.liveOptional)
    && plan.call && !callValueCanBeUndefined(plan.call, aliasCtx, plan.resolvePure);
  if (definedCallRoot) {
    yield { kind: 'receiver-collapse' };
    if (plan.rootName && !plan.topAssign && !plan.seqAroundPrefix?.length && !plan.rootEffectCall) {
      const pure = proxyRunLandingPure({ navNode: source(), ctx: aliasCtx, resolvePure: plan.resolvePure, rootName: plan.rootName });
      if (pure) yield { kind: 'root-collapse', pure };
    }
  }
  if (canCollapseDeletedNavigation({ hosted: deleteHosted(), guardNode: aliasCtx.path.node,
    aliasCtx, resolvePure: plan.resolvePure })) {
    yield { kind: plan.valueFormSpells ? 'delete-collapse' : 'stand-down' };
  } else yield { kind: 'guard' };
}

// A plain read through an absent sealed value owns the throw, unless it names the
// same pristine realm surface. That hop may disappear only under a plain reader
// with a quiet static key and onto a spellable root: that reader owns the same throw.
// A whole-run replacement supplies its retained reader, since inner readers disappear.
// A boundary retained by that caller still performs its own read and needs no probe.
// Source slots belong to this query only; it never edits the tree or allocates host state.
export function sealedClaimDisposition(node, resolvePure, aliasCtx, retainedReader = null) {
  const boundary = sealedChainBoundary(node);
  const key = boundary && memberKeyName(boundary.member);
  if (key === null || retainedReader === boundary.member) return null;
  const realmHop = POSSIBLE_GLOBAL_OBJECTS.has(key) && isPristineProxyGlobal(aliasCtx?.adapter, key);
  const above = retainedReader ?? boundary.reader ?? aliasCtx?.path?.parentPath?.node;
  const dropsHop = realmHop && boundary.member === node && !node.computed && !node.optional
    && isMemberAccessNode(above) && unwrapRuntimeExpr(above.object) === node;
  const heldRead = realmHop && aliasRootedReadMayThrow(boundary.inner, resolvePure, aliasCtx);
  // Plain realm navigation keeps its established pure collapse. A live short
  // circuit or an absent value held by an alias makes the erased read mandatory.
  const unsafeReader = (boundary.member === node || retainedReader !== null) && isMemberAccessNode(above)
    && !memberKeepsReceiverThrow(above)
    && (heldRead || navValueCanShortCircuit(boundary.inner, resolvePure, aliasCtx, { throughChainAssign: true }));
  // A pristine hop with no surviving reader needs neither a throw nor a collapse.
  // Keep that cheap refusal ahead of the value proof on every speculative query.
  if (realmHop && !dropsHop && !unsafeReader
    || !proxyReceiverValueCanBeUndefined(boundary.inner, resolvePure, aliasCtx, { throughChainAssign: true })) {
    return null;
  }
  // An optional reader can skip the throw, and an unknown computed key runs before
  // its read. Neither can inherit the sealed member's earlier exception.
  if (!realmHop || unsafeReader) return { kind: 'throw' };
  return realmRootIsSpellable(node, resolvePure) ? { kind: 'collapse', node: node.object } : null;
}

// The claim guard owns a live optional unless a sealed read already owns the throw.
// Delete admission is separate: the last probe fallback may still have work after
// a structural guard declined, even when the navigation itself can fold.
export function staticClaimNeedsGuard(node, resolvePure, aliasCtx) {
  return isMemberAccessNode(node) && (node.optional || receiverCarriesLiveOptional(node.object))
    && sealedClaimDisposition(node, resolvePure, aliasCtx)?.kind !== 'throw';
}

// Source-claim priorities shared by the root and hop entry points. Native callbacks
// expose current span facts after each attempt, since a failed attempt may settle
// the AST. A kept write is a terminal decision even when its effects forbid erasure.
export function * staticClaimNavigationRoutes({ node, kind, hintName, meta, aliasCtx, resolvePure, deletion, rootRun }) {
  const deleteFold = deletion();
  if (isMemberAccessNode(node) && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)) {
    if (sealedClaimDisposition(node, resolvePure, aliasCtx)?.kind !== 'throw') {
      yield { kind: 'nested-guard' };
      yield { kind: 'hop' };
    }
    const store = writtenRunKeptProbeStore(aliasCtx.path, { resolvePure, aliasCtx, unwrap: unwrapRuntimeExpr });
    if (store) {
      yield { kind: 'written-store', store };
      return;
    }
  }
  if (staticClaimNeedsGuard(node, resolvePure, aliasCtx) && !deleteFold) yield { kind: 'static-guard' };
  if (node.type === 'Identifier' && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
    && !meta.sideEffects?.length) {
    yield { kind: 'root-host' };
    const rootDelete = deletion();
    if (!rootDelete) yield { kind: 'root-guard' };
    const { run, deadOptionalHop } = rootRun(rootDelete);
    const pure = run && proxyRunLandingPure({ navNode: run.child, ctx: aliasCtx, resolvePure,
      rootName: node.name, deleteFold: rootDelete });
    if (run && (rootDelete || !unbackedTailRidesAbove(aliasCtx.path, resolvePure))) {
      yield { kind: 'root-collapse', run, pure, deleteFold: rootDelete, deadOptionalHop };
    }
  }
}

// is the plan's probe hop INSIDE the kept write's value (`(r = globalThis.window)?.self`:
// the undefinability is the held VALUE, not a nav hop)
export function probeHopInValue(plan, probeHop) {
  return !!plan.rootAssign && Number.isInteger(probeHop.node.start)
    && probeHop.node.start >= plan.rootAssign.start && probeHop.node.end <= plan.rootAssign.end;
}

// A retained probe owns its optional unless the consumer invokes its value or
// deletes directly on a backed surface. A read through that surface still consumes
// the stored value, even when a later slot is deleted: the ordinary outer-consumer
// proof distinguishes `delete stored?.self.key` from `delete stored?.self.box.key`.
export function navGuardKeepsStoredProbe(plan, { path, aliasCtx, invoked, deleteHosted }) {
  if (!probeHopInValue(plan, plan.hops[plan.lastUnresolvableIdx]) || invoked) return false;
  if (!deleteHosted || navHasUnresolvableProxyHop(path.node, plan.resolvePure, aliasCtx)) return true;
  const slot = climbTransparentWrapperPath(path);
  const host = slot.parentPath;
  return navHasUnresolvableProxyHop(plan.rootAssign.right, plan.resolvePure, aliasCtx)
    && proxyCollapseConsumer({
      node: slot.node, host: host?.node, keptWrite: plan.rootAssign,
      deleted: claimDeleteOperand(host), deleteAbove: deleteHosted, writeTarget: isMemberWriteHost(host),
    }, { adapter: aliasCtx.adapter, resolvePure: plan.resolvePure }).navigated;
}
