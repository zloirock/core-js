import {
  isCallShape,
  chainSealsAShortCircuit,
  navValueCanShortCircuit,
  descendToChainRoot,
  callYieldCanBeUndefined,
  inlineCallProxyGlobalRoot,
  proxyGlobalRootName,
  proxyReceiverValueCanBeUndefined,
  planKeptSequenceTail,
  planProvenNavGuardCollapse,
  composableNavGuardPlan,
  inlineCallHasObservableEffects,
  peelChainRootValue,
  maximalProxyGlobalPrefix,
  navHasUnresolvableProxyHop,
  peelReceiverSequenceTail,
  resolveObjectName,
  pristineRealmHopKey,
  unwrapParensCollectingEffects,
} from './resolve.js';
import {
  isMemberAccessNode,
  observableSequenceElements,
  peelNestedSequenceExpressions,
  peelChainAssignment,
  peelChainAssignmentDeep,
  POSSIBLE_GLOBAL_OBJECTS,
  isPristineProxyGlobal,
  isReusableReceiver,
  staticMemberKeyName,
  kebabToCamel,
  receiverCarriesLiveOptional,
  isRenderedStoredValue,
  definedBranchOfGuardConditional,
  isNullLiteralNode,
  singleSequenceTail,
  unwrapRuntimeExpr,
  receiverContainsOptional,
} from '../helpers/ast-patterns.js';
import { instanceSynthReceiverPure } from './destructure.js';
import { identifier, memberFromKeyName, planReceiverMemo, sequenceExpression } from '../render.js';

// does a nav (or bare identifier) bottom out on a realm root the binding-aware canon proves -
// a pristine proxy-global name or an alias of one, shadow bail included
function realmRootProves(node, aliasCtx) {
  const { root: cur } = descendToChainRoot(node, true);
  if (cur?.type !== 'Identifier') return false;
  const name = proxyGlobalRootName({ node: cur, ...aliasCtx });
  return !!name && POSSIBLE_GLOBAL_OBJECTS.has(name);
}

// Nullability of a canon-owned realm probe: a kept value and navigation through it
// have different guards. Inline calls answer for their yield; a known nullish or
// initless callee keeps its optional call guard. Opaque calls stay with the caller.
export function guardProbeUndefinable(probe, {
  path,
  scope = path?.scope,
  adapter,
  resolvePure,
  observableRead = false,
  nestedSeqUnproven = false,
}) {
  if (isCallShape(probe)) {
    const aliasCtx = { scope, adapter, path };
    const probeCallee = unwrapRuntimeExpr(probe.callee);
    // an INLINE-resolvable call answers with its YIELD, not its callee: a body navigating to
    // an environment probe (`() => globalThis.window`) is absent-able however defined the
    // callee is, and the `?.` above the call is the only thing standing between the collapse
    // and a read off `undefined`. the canonical question, the one the detection itself asks
    if (inlineCallProxyGlobalRoot({ callNode: probe, ...aliasCtx, rejectConditional: true })) {
      return callYieldCanBeUndefined(probe, aliasCtx, resolvePure);
    }
    if (probeCallee?.type === 'ArrowFunctionExpression' || probeCallee?.type === 'FunctionExpression') return false;
    if (proxyReceiverValueCanBeUndefined(probeCallee, resolvePure,
      { scope, adapter, path }, { throughChainAssign: true })) return true;
    // an INIT-LESS declaration (`let condFn;` + conditional assigns) is nullish on the
    // unassigned path - the callee canon only follows kept proxy writes
    if (probeCallee?.type === 'Identifier') {
      const calleeBinding = adapter.getBinding({ scope, name: probeCallee.name, path });
      if (calleeBinding?.node?.type === 'VariableDeclarator' && !calleeBinding.node.init) return true;
    }
    return false;
  }
  // a KEPT WRITE holds its VALUE: the canon judges what the write yields, while the
  // test clones the write whole (`null == (w = _globalThis.window)`). the write makes
  // the read OBSERVABLE, so a proxy spine below the probe hop counts as one surface
  const peeledProbe = unwrapRuntimeExpr(probe);
  let probeValue = peelChainAssignmentDeep(peeledProbe);
  // ... and it is the WRITE that makes it observable, not the peel: a sequence hands its tail's
  // value on and observes nothing, so a plain nav under one is judged by the value canon exactly
  // like its bare twin (`(eff(), globalThis.window.self)?.Promise.k` folds where the bare form does)
  let storeObserved = probeValue !== peeledProbe;
  // effectful sequence tails peel manually - the SE-bailing canon stops at them
  // (`(s = (e++, globalThis.self))` proves through the tail)
  for (;;) {
    if (probeValue?.type === 'SequenceExpression') {
      // ... ONE level for the routes that ASK it: a NESTED sequence is where the value canon
      // stops, so its value stays unproven and the guard over it lives
      // (`(d++, (c++, globalThis))?.Map.name`). a whole-swap claim reads no value through the
      // sequence and keeps the ordinary peel (`(d++, (c++, globalThis))?.Array.of` erases)
      const tail = singleSequenceTail(probeValue);
      if (!tail) {
        const deepTail = singleSequenceTail(probeValue, { nested: true });
        // ... but a tail carrying its OWN `?.` renders that guard itself - already rendered by an
        // earlier claim or still spelled - and a second one over it tests a value the first
        // already answered for
        const selfGuarded = receiverContainsOptional(deepTail)
          || (deepTail?.type === 'ConditionalExpression' && deepTail.consequent?.type === 'UnaryExpression'
            && deepTail.consequent.operator === 'void');
        // ... and the boundary speaks only for a spine the realm canon owns: a root the
        // binding-aware canon cannot prove (a SHADOWED realm name, a user binding) is the
        // user's value, and this verdict may not call it a probe - the ordinary walk decides
        if (nestedSeqUnproven && !selfGuarded
          && realmRootProves(deepTail, { scope, adapter, path })) return true;
        probeValue = deepTail;
        continue;
      }
      probeValue = tail;
      continue;
    }
    const dechained = peelChainAssignmentDeep(probeValue);
    if (dechained === probeValue) break;
    storeObserved = true;
    probeValue = unwrapRuntimeExpr(dechained);
  }
  // a bare ALIAS answers through the value canon like every other probe: an alias of an
  // entry-backed surface (`const g = globalThis`) holds the realm object and proves defined
  // there, an alias of a probe read (`const w = globalThis.window`) or of a rendered guard
  // (`null == _globalThis.window ? void 0 : _self`) holds a value that can be absent and keeps
  // its `?.`. asked of the NAME the alias resolves to instead, the guard render's alias read as
  // `self` - the defined branch the value canon classifies through - and the guard over a value
  // the other leg still tests was dropped
  return proxyReceiverValueCanBeUndefined(
    probeValue, resolvePure,
    { scope, adapter, path },
    { throughChainAssign: true, observableRead: observableRead || storeObserved });
}

// Apply a kept-value decision to its native slot. The binding substitutes/embeds a
// detached probe before insertion; the decision and the chosen slot stay shared.
export function prepareKeptMemoTail(node, ctx, { prepareProbe = probe => probe, renderKeptTail }) {
  const plan = planKeptSequenceTail(unwrapRuntimeExpr(node), {
    adapter: ctx.adapter, aliasCtx: ctx,
    resolveGlobalPolyfill: name => ctx.resolvePure({ kind: 'global', name }),
  });
  if (plan) plan.holder[plan.key] = renderKeptTail({ ...plan, probe: plan.probe && prepareProbe(plan.probe) });
}

// A previously rendered guard and a still-source navigation describe the same
// composition: test its existing probe once, then read its defined value. A user
// conditional is not a rendered guard and keeps its own evaluation boundary.
export function planGuardComposition(value, ctx, { readThrough = true, readerKey = null } = {}) {
  const defined = isRenderedStoredValue(value) && definedBranchOfGuardConditional(value);
  if (defined && value.test?.type === 'BinaryExpression' && isNullLiteralNode(value.test.left)) {
    return { probe: value.test.right, receiver: defined };
  }
  return composableNavGuardPlan(value, { ...ctx, readThrough, readerKey });
}

// A prepared VALUE retains its kept sequence before navigation collapses. This is an
// application, not a speculative query: native slot writes occur only here, and the
// binding owns conversion/clone/re-entry bookkeeping for the rendered nodes.
export function prepareMemoReceiver(node, ctx, bindings) {
  if (!ctx?.adapter || !ctx.path || !ctx.resolvePure) return node;
  prepareKeptMemoTail(node, ctx, bindings);
  const nav = planProvenNavGuardCollapse({
    rootNode: node, ...ctx, allowSequenceRoot: true, descendSequenceTail: true,
  });
  return nav && !nav.topAssign ? bindings.renderNav(nav) : node;
}

// A dispatch can substitute a proven static receiver while keeping the effects of
// its source object and computed keys in evaluation order. The quiet proof view
// cannot erase a live optional, a sealed throw or an effectful realm hop. Application
// owns imports and cloning; a declined preparation returns the source unchanged.
export function prepareStaticReceiver(node, ctx, { injectImport, embed = source => source }) {
  if (!ctx?.adapter || !ctx.path || !ctx.resolvePure) return node;
  const receiverSequence = peelNestedSequenceExpressions(node);
  const receiver = receiverSequence.tail;
  const objectSequence = isMemberAccessNode(receiver) ? peelNestedSequenceExpressions(receiver.object) : null;
  const keySequence = isMemberAccessNode(receiver) && receiver.computed ? peelNestedSequenceExpressions(receiver.property) : null;
  const objectTail = objectSequence?.tail;
  const objectKeySequence = isMemberAccessNode(objectTail) && objectTail.computed
    ? peelNestedSequenceExpressions(objectTail.property) : null;
  const objectKey = objectKeySequence && staticMemberKeyName({ ...objectTail, property: objectKeySequence.tail });
  const quietObject = typeof objectKey === 'string' && !POSSIBLE_GLOBAL_OBJECTS.has(objectKey)
    ? memberFromKeyName(unwrapRuntimeExpr(objectTail.object), objectKey, { optional: objectTail.optional === true }) : objectTail;
  const staticKey = objectSequence && staticMemberKeyName(keySequence ? { ...receiver, property: keySequence.tail } : receiver);
  if (keySequence?.prefix.length && POSSIBLE_GLOBAL_OBJECTS.has(staticKey)) return node;
  const pureView = typeof staticKey === 'string'
    ? memberFromKeyName(quietObject, staticKey, { optional: receiver.optional === true }) : receiver;
  const pure = !navValueCanShortCircuit(node, ctx.resolvePure, ctx)
    && !chainSealsAShortCircuit(node, ctx.resolvePure, ctx)
    && instanceSynthReceiverPure(pureView, ctx);
  if (!pure) return node;
  const effects = observableSequenceElements([
    ...receiverSequence.prefix, ...objectSequence?.prefix ?? [], ...objectKeySequence?.prefix ?? [], ...keySequence?.prefix ?? [],
  ], ctx, { preserveSourceReads: true });
  const value = identifier(injectImport(pure.entry, pure.hintName));
  return effects.length ? sequenceExpression([...effects.map(effect => embed(effect)), value]) : value;
}

// A generated realm binding already has a canonical import source. Read that native
// injector fact without resolving the generated identifier as a user declaration.
export function mintedProxyGlobalName(name, injectorState) {
  const source = [...injectorState?.pureImports ?? []].find(([, minted]) => minted === name)?.[0];
  const global = source && kebabToCamel(source.split('/').at(-1));
  return POSSIBLE_GLOBAL_OBJECTS.has(global) ? global : null;
}

// A bare identifier or nonoptional call can hold a realm value. Scope remains
// authoritative even without a source path; optional calls keep their own guard.
function resolvedRealmValueName(value, ctx) {
  if (value?.type === 'Identifier') {
    if (POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
      return isPristineProxyGlobal(ctx.adapter, value.name)
        && !(ctx.scope && ctx.adapter.getBinding?.({ scope: ctx.scope, name: value.name, path: ctx.path })) ? value.name : null;
    }
  } else if (!isCallShape(value) || value.optional) return null;
  const name = ctx.scope && resolveObjectName({ objectNode: value, ...ctx });
  return name && POSSIBLE_GLOBAL_OBJECTS.has(name) && isPristineProxyGlobal(ctx.adapter, name) ? name : null;
}

// Realm navigation can contain stores made earlier in the SAME sequence. This is
// local evaluation order, not a flow proof of writes across a surrounding function.
export function holdsProxySurface(objectNode, ctx) {
  const sequenceWrites = new Map();
  const followed = new Set();
  let value = unwrapRuntimeExpr(objectNode);
  for (;;) {
    if (value?.type === 'SequenceExpression') {
      for (const expr of value.expressions.slice(0, -1)) {
        const write = unwrapRuntimeExpr(expr);
        if (write?.type === 'AssignmentExpression' && write.operator === '=' && write.left?.type === 'Identifier') {
          sequenceWrites.set(write.left.name, unwrapRuntimeExpr(write.right));
        }
      }
      value = unwrapRuntimeExpr(value.expressions.at(-1));
    } else if (value?.type === 'Identifier' && sequenceWrites.has(value.name) && !followed.has(value.name)) {
      followed.add(value.name);
      value = sequenceWrites.get(value.name);
    } else if (value?.type === 'AssignmentExpression') {
      value = unwrapRuntimeExpr(value.right);
    } else if (isMemberAccessNode(value)) {
      if (!pristineRealmHopKey(value, ctx)) break;
      value = unwrapRuntimeExpr(value.object);
    } else break;
  }
  return !!resolvedRealmValueName(value, ctx);
}

// The value a memo holds: a pristine realm surface, or a constructor read from one.
// User properties, shadowed roots and mutated slots never acquire generated aliases.
export function memoReceiverGlobalName(objectNode, ctx, { constructors = false } = {}) {
  const value = peelChainRootValue(objectNode);
  if (isMemberAccessNode(value)) {
    const key = staticMemberKeyName(value);
    if (key && POSSIBLE_GLOBAL_OBJECTS.has(key) && holdsProxySurface(objectNode, ctx)) return key;
    if (!constructors || !ctx.scope) return null;
    const name = resolveObjectName({ objectNode: value, ...ctx });
    if (!name || !/^[A-Z]/u.test(name) || POSSIBLE_GLOBAL_OBJECTS.has(name)
      || ctx.adapter.isMutatedStatic?.('globalThis', name)) return null;
    const host = resolveObjectName({ objectNode: peelChainRootValue(value.object), ...ctx });
    return host && POSSIBLE_GLOBAL_OBJECTS.has(host) && isPristineProxyGlobal(ctx.adapter, host) ? name : null;
  }
  if (value?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(value.name)) {
    const minted = mintedProxyGlobalName(value.name, ctx.injectorState);
    if (minted) return minted;
  }
  return resolvedRealmValueName(value, ctx);
}

// Source provenance for re-entry differs from the held value above: a call yielding
// globalThis.window originates at globalThis, even when window is absent. This name
// does not prove definedness. Ordinary identifiers retain their existing provenance;
// generated pure bindings and captured expressions need an explicit memo alias.
export function memoReceiverOriginName(node, ctx) {
  const value = peelChainRootValue(node);
  if (isCallShape(value)) {
    const root = inlineCallProxyGlobalRoot({ callNode: value, ...ctx });
    return root && proxyGlobalRootName({ node: root, ...ctx });
  }
  if (value?.type === 'Identifier') {
    return ctx.injectorState?.isOwnPassPureBinding?.(value.name)
      ? proxyGlobalRootName({ node: value, ...ctx }) : null;
  }
  return memoReceiverGlobalName(node, ctx, { constructors: true });
}

// A pristine dotted realm hop can disappear from a guard's memo. Its unbacked
// sibling is the environment probe itself and must remain in the first read.
function backedMemoHop(node, ctx) {
  return isMemberAccessNode(node) && !node.computed && POSSIBLE_GLOBAL_OBJECTS.has(node.property?.name)
    && isPristineProxyGlobal(ctx.adapter, node.property.name)
    && ctx.resolvePure({ kind: 'global', name: node.property.name });
}

// A wholly backed realm spine reads the value of its kept root. Capture that root,
// not a navigation that would collapse to an always-defined ponyfill in the test.
// Unbacked hops are probes themselves and keep the whole receiver. Source wrappers
// and sequence prefixes belong to the captured slot; this query never rewrites it.
export function planGuardRootMemo(node, ctx) {
  if (!ctx?.adapter || !ctx.scope || !isMemberAccessNode(node)) return null;
  if (maximalProxyGlobalPrefix(node, ctx, { throughChainAssign: true }) !== node
    || (ctx.resolvePure && navHasUnresolvableProxyHop(node, ctx.resolvePure, ctx))) return null;
  const spine = [];
  let holder = null;
  let root = node;
  while (isMemberAccessNode(root)) {
    spine.push(root);
    holder = root;
    root = unwrapRuntimeExpr(root.object);
  }
  return peelReceiverSequenceTail(root)?.type === 'AssignmentExpression'
    ? { spine, holder, source: holder.object } : null;
}

// A stored navigation already proved defined needs no outer value guard. A user's
// bare alias keeps its read; only a generated pure binding stands for a collapsed nav.
export function storedMemoProvesGuard(node, ctx) {
  const stored = peelChainAssignment(node);
  if (!stored.outer) return false;
  const nav = unwrapRuntimeExpr(peelChainRootValue(stored.value));
  return (isMemberAccessNode(nav)
    || nav?.type === 'Identifier' && !!ctx.injectorState?.isOwnPassPureBinding?.(nav.name))
    && maximalProxyGlobalPrefix(nav, ctx, { throughChainAssign: true }) === nav
    && !proxyReceiverValueCanBeUndefined(stored.value, ctx.resolvePure, ctx);
}

// A guard prepares its observed VALUE before allocating any ref. Whole source
// navigation owns effects before trailing hops are peeled; kept stores and calls
// yielding an environment probe retain their nullish branch. Bindings only render,
// clone and deoptionalize decided nodes; scope/type registration follows this result.
export function prepareGuardReceiver(objectNode, ctx, bindings, {
  bareMemo = false, mutatedLeaf = false, readerKey = null, interveningEffects = false,
} = {}) {
  const receiverPure = !mutatedLeaf && instanceSynthReceiverPure(objectNode, ctx);
  if (receiverPure) objectNode = bindings.pure(receiverPure);
  if (isReusableReceiver(objectNode, { interveningEffects, ctx })) {
    return { firstReceiver: objectNode, receiver: objectNode, capture: false, source: objectNode, surface: null };
  }
  const surface = memoReceiverGlobalName(objectNode, ctx);
  let memoSource = objectNode;
  const nav = !mutatedLeaf && planProvenNavGuardCollapse({ rootNode: objectNode, ...ctx, allowSequenceRoot: true });
  if (nav && nav.kind !== 'nested' && !nav.topAssign
    && (nav.kind === 'sequence' || !nav.call || !guardProbeUndefinable(nav.call, ctx))) {
    memoSource = bindings.renderNav(nav);
  } else if (surface) {
    const rootMemo = planGuardRootMemo(objectNode, ctx);
    if (rootMemo) memoSource = rootMemo.source;
    for (let hop = unwrapRuntimeExpr(memoSource), pure; pure = backedMemoHop(hop, ctx);
      hop = unwrapRuntimeExpr(memoSource)) {
      if (hop.optional && !peelChainAssignment(unwrapRuntimeExpr(hop.object)).outer) {
        const effects = [];
        const call = unwrapParensCollectingEffects(hop.object, effects);
        const proven = isCallShape(call) && !call.optional
          && inlineCallProxyGlobalRoot({ callNode: call, ...ctx, rejectConditional: true })
          && !guardProbeUndefinable(call, ctx);
        if (proven && inlineCallHasObservableEffects({ callNode: call, ...ctx })) effects.push(call);
        memoSource = proven ? bindings.folded(pure, effects) : bindings.guarded(hop.object, pure);
        break;
      }
      memoSource = hop.object;
    }
    const call = unwrapRuntimeExpr(memoSource);
    if (isCallShape(call) && !call.optional && unwrapRuntimeExpr(call.callee)?.type === 'Identifier'
      && !guardProbeUndefinable(call, ctx) && !inlineCallHasObservableEffects({ callNode: call, ...ctx })) {
      const pure = ctx.resolvePure({ kind: 'global', name: surface });
      if (pure) memoSource = bindings.pure(pure);
    }
  }
  const peeled = bindings.cloneMemo(memoSource, bareMemo);
  const core = unwrapRuntimeExpr(peeled);
  if (core?.type === 'SequenceExpression'
    && !receiverCarriesLiveOptional(singleSequenceTail(core, { nested: true }))) {
    prepareKeptMemoTail(core, ctx, bindings);
  }
  const memo = planReceiverMemo(peeled, { interveningEffects, ctx });
  if (!memo.capture) return { ...memo, source: objectNode, surface };
  const composed = planGuardComposition(objectNode, ctx, { readerKey });
  if (composed) return { firstReceiver: composed.probe, receiver: composed.receiver ?? bindings.pure(composed.pure),
    capture: false, source: objectNode, surface };

  // A plain backed hop already throws before a later optional. A kept call yield
  // proves no definedness on its own; inside our rendered test that read is observed.
  const rendered = peeled.type === 'ConditionalExpression';
  const spine = rendered ? unwrapRuntimeExpr(peeled.test?.right) : peeled;
  for (let hop = spine; isMemberAccessNode(hop); hop = unwrapRuntimeExpr(hop.object)) {
    let base = unwrapRuntimeExpr(hop.object);
    let crossedHop = false;
    while (backedMemoHop(base, ctx) && !base.optional) {
      base = unwrapRuntimeExpr(base.object);
      crossedHop = true;
    }
    const written = base?.type === 'AssignmentExpression' ? unwrapRuntimeExpr(peelChainAssignmentDeep(base)) : null;
    const proven = (written ? rendered || !isCallShape(written) : false)
      || (rendered && isCallShape(base) && !base.optional
        && !!inlineCallProxyGlobalRoot({ callNode: base, ...ctx, rejectConditional: true }));
    if (hop.optional && proven && (crossedHop || !guardProbeUndefinable(base, ctx))) bindings.deoptionalize(hop);
  }
  return { ...memo, source: objectNode, surface };
}
