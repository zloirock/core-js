// destructure rewrite pipeline. covers parameter-default synth-swap entry, top-level
// VariableDeclarator extraction (instance / static / global kinds), AssignmentExpression
// destructure flatten, nested proxy-global flatten (`{Array:{from}} = globalThis` ->
// `const from = _Array$from`), and CatchClause receiver extraction. also owns the per-prop
// AST-mutation pipeline `handleDestructuredProperty` (strategy decided by `planDestructureEmission`,
// executed via babel `replaceWith` / `insertBefore` / `splice`) plus side-effect deferral
// (`deferSideEffect` accumulates into `deferredSideEffects` array drained at programExit).
// public surface: `handleObjectPropertyResult`, `extractCatchClause`, `deferredSideEffects`,
// `retainedForInitHosts`, and the three programExit-driven members the caller must drain -
// `flushProbedAnchorSwaps`, `splitFlatMultiDecls`, `tryFlattenProxyHopHost`.
// instantiated per-file in `initFile` so closure-captured per-file state (`skippedNodes` /
// `synthSwap` / `injector` / `debugOutput`) stays in sync with the freshly-allocated values
import { ownEmittedPatternClaim, ownOutputTests, sentinelAlreadyProcessed } from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  hostSlot,
  memberFromKeyName,
  identifier as canonIdentifier,
  memberExpression as canonMember,
  renderInstanceDefaultGuard,
  renderStaticDefaultGuard,
} from '@core-js/polyfill-provider/render';
import estreeToBabel from './estree-to-babel.js';
import {
  arrayWrapperNeighbourEffect,
  arrayWrapperResidualDroppable,
  arrayWrapperResidualTrailingShed,
  assignmentInStatementPosition,
  assignmentValueDiscarded,
  computedKeyHasSideEffects,
  discardedSequenceElement,
  discardedSequenceElementPath,
  discardedWrapperEffects,
  dropDeadSequenceElements,
  forOfHeadElements,
  hasRealBinding,
  hasRestSiblingExcept,
  invalidateScopeVarIndex,
  isChainAssignment,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isReplayableSynthKey,
  isRestProperty,
  isSynthSimpleObjectPattern,
  isTransparentDestructureWrapper,
  isValidIdentifierName,
  leadingDiscardedEffectSlots,
  mayHaveSideEffects,
  memberKeyName,
  observableSequenceElements,
  pairedArrayWrapInitElement,
  paramsHaveInvisibleCallers,
  patternBindingCount,
  patternHasSeveralSeKeys,
  patternKeepsEffectfulKey,
  patternLevelKeepsEffectfulHop,
  patternLevelKeepsSentinels,
  peelNestedSequenceExpressions,
  peelParenAndTSParentPath,
  peelProxyGlobalObject,
  peelToExpressionStatement,
  peelTransparentWrapperPath,
  prologueEndIndex,
  propBindingIdentifier,
  propertyKeyName,
  pruneEmptiedHopProps,
  relocatedCatchPropUnobservable,
  resolveFallbackReceiverPath,
  statementListOf,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  canTransformDestructuring as sharedCanTransformDestructuring,
  carriedInitReceiverNode,
  classifyCallBranchForSynth,
  collectEnclosingObjectPatterns,
  conditionalDestructureLeftUntouchedWarning,
  consumedAssignmentSlotDropsHost,
  consumedAssignmentSlotDropsNav,
  consumedAssignmentSlotPrunes,
  descendReceiverPathByKeys,
  destructureAssignmentValueIsCaptured,
  destructurePatternHostPath,
  fallbackDestructureHasPolyfillableBranch,
  firstPatternProp,
  isBuiltInSurfaceNav,
  isInstanceSurfaceNav,
  isReReadableSurfaceNav,
  isReReferenceableReceiver,
  nestedAssignmentStatementOf,
  outerDestructureReceiver,
  paramDefaultInstanceSynthAllowed,
  patternHopKeysToHost,
  planArrayWrappedStaticExtract,
  planSideEffectKeyStrategy,
  qualifiesForParamBodyExtract,
  receiverPerformsEveryInitEffect,
  refineInstanceEntryByReceiver,
  renderSynthTree,
  resolveDestructureReceiverPlan,
  resolveNestedNavDispatch,
  resolveNestedReceiverBase,
  resolveNestedReceiverChain,
  resolveNestedReceiverNode,
  resolvePositionalElementSlot,
  staticHopPure as sharedStaticHopPure,
  synthPropDedupKey,
  typedNavClaimChain,
  wrapperElementNavPlacement,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  buildNestedDestructurePlan,
  isSymbolIteratorPatternProp,
  peelArrayWrapperPair,
  hopNamesMissingAbleCtor,
  planCatchClauseExtraction,
  probedNavProbeKey,
  resolvePolyfillableStaticProp,
  symbolIteratorInstanceLeaf,
} from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import {
  harvestDiscardedReceiverSE,
  isSourcedSymbolIteratorMeta,
  planCallRootDiscardedProxySwap,
  shouldDropRescueReceiver,
  SYMBOL_ITERATOR_PURE_RESULT,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  anchoredResidualSymbolKeyName,
  consumableHopSlotName,
  descendToChainRoot,
  globalProxyMemberName,
  maximalProxyGlobalHop,
  partitionEffectsAtProbe,
  patternBindingName,
  peelChainAssignment,
  peelReceiverSequenceTail,
  probedDestructureInitValue,
  resolveSynthKeys,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  maybeRegisterAssignmentAliasWrite,
  registerBindinglessCtorAlias,
  registerCtorAliasExtractions,
  registerDeclAliasIfSound,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  symbolKeyToEntry,
} from '@core-js/polyfill-provider/detect-usage/globals';
import {
  classifyVariableDeclarationHost,
  isBodylessStatementSlot,
  isForInitDeclaration,
} from '@core-js/polyfill-provider/destructure-host-shape';
import { cloneReceiverForEmit } from './babel-compat.js';
import {
  planDestructureEmission,
  STRATEGIES,
} from './destructure-emission-plan.js';
import { patternComputedKeysSynthSafe } from './synth-key-utils.js';

// when a residual destructure keeps a proxy-global member-chain receiver in the output (a
// surviving sibling / ...rest still reads off it, or it stays as a param default), collapse
// the intermediate proxy hops to the polyfilled root so `globalThis.self.Array` emits
// `_globalThis.Array`, not the runtime-undefined `_globalThis.self.Array` (ie:11 / Node).
// gated on `maximalProxyGlobalHop` so only a real intermediate hop is collapsed - the bare-root
// `globalThis.Array` keeps its natural global-rewrite path. the actual AST rewrite is the shared
// `collapseProxyGlobalReceiver` (the same helper the synth-swap path uses via `buildSynthLiteral`)
function collapseRetainedProxyReceiver(synthSwap, hostNode, key, aliasCtx = null) {
  if (!hostNode) return;
  // peel SE-tail + Paren/TS wrappers to the inner member chain, tracking the slot it lives in so
  // the collapsed receiver writes back UNDER the wrapper - the `(se(), ...)` prefix and the `as`
  // cast must survive. without the peel, `maximalProxyGlobalHop` (it inspects MemberExpression
  // chains only) returns null on an SE/TS-wrapped multi-hop receiver and the collapse is skipped,
  // emitting `_globalThis.self.Array` whose `_globalThis.self` is runtime-undefined (ie:11 / Node)
  let slotParent = hostNode;
  let slotKey = key;
  for (;;) {
    const node = slotParent[slotKey];
    if (node?.type === 'SequenceExpression' && node.expressions.length) {
      slotParent = node.expressions;
      slotKey = node.expressions.length - 1;
    } else if (node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type)) {
      slotParent = node;
      slotKey = 'expression';
    } else break;
  }
  const receiver = slotParent[slotKey];
  // a retained LOGICAL receiver (`globalThis.self.Array || Set`) keeps its operands live; collapse
  // the proxy hop in EACH so an evaluated operand never reads `_globalThis.self` (undefined on
  // ie:11 / Node, which throws BEFORE the `||` short-circuit can save it). recursion also covers
  // nested logicals and SE/wrapper-wrapped operands via the same slot peel, forwarding the same
  // aliasCtx, which makes the operand recursion alias-AWARE (a `const g = globalThis` root
  // follows to the global and collapses). matches the unplugin's per-operand collapse of
  // logical inits; an operand that is itself a pure ctor is handled by
  // `collapseProxyGlobalReceiver`'s own plan
  if (receiver?.type === 'LogicalExpression') {
    collapseRetainedProxyReceiver(synthSwap, receiver, 'left', aliasCtx);
    collapseRetainedProxyReceiver(synthSwap, receiver, 'right', aliasCtx);
    return;
  }
  // `true` (allowSideEffectKeys): a SE-bearing computed proxy hop (`(c++, (d++, globalThis))[(e++, 'self')]
  // .Array`) otherwise bails the gate to the bare root and leaves the operand RAW (a bare `globalThis` -
  // ie:11 ReferenceError - under a `|| {}` logical); collapseProxyGlobalReceiver routes the dropped key SE
  // through the call-rooted plan, matching the instance source gate and the unplugin operand collapse
  // through a kept chain-ASSIGN too: a residual reading off a store rides the same landing every
  // other run does - the shared plan keeps the store as its base where the stored value can be
  // absent, and drops the redundant hops off it
  if (!receiver || !maximalProxyGlobalHop(receiver, aliasCtx,
    { allowSideEffectKeys: true, throughChainAssign: true })) return;
  const collapsed = synthSwap.collapseProxyGlobalReceiver(receiver, { aliasCtx, throughChainAssign: true });
  if (collapsed) slotParent[slotKey] = collapsed;
}

// descend a transparent single-element array wrapper (`[{...}] = [(se(), R)]`) to the element
// that carries a receiver SE prefix at ANY consumed level - including the wrapper chain AROUND
// each array level (`(outer(), [(inner(), R)])`). thin adapter over the provider's
// `peelArrayWrapperPair` descent (ONE walk for both emitters): prefix = the peel's committed
// wrapper-level prefixes + the leaf element's own, source order; tail = the leaf stripped of its
// prefix; arr = the innermost consumed ArrayExpression (its first element is swapped to `tail`
// by the caller); unwrappedInit = the outermost one (re-anchoring `init` there stops a
// multi-prop host re-visit from re-lifting). null when no level carries a prefix.
// `liftTrailing` lets the peel consume a level beside an SE-bearing NEIGHBOUR the pattern does
// not bind; `includeTrailing` (a full consume - the wrapper dies) puts those neighbours on the
// lift too, behind the element's own effects and the `between` nodes (a discarded write the
// element stores) - the order native runs them. a partial consume leaves them in the kept array
function descendArrayWrapperToSE(declaratorNode, { liftTrailing = false, includeTrailing = false, between = [] } = {}) {
  const { init: leaf, peeledPrefixes, firstArray, lastArray, consumedLevels, trailingEffects } = peelArrayWrapperPair({
    pattern: declaratorNode.id, init: declaratorNode.init, liftTrailing,
  });
  if (!lastArray) return null;
  const { prefix: leafPrefix, tail } = peelNestedSequenceExpressions(leaf);
  const prefix = [...peeledPrefixes, ...leafPrefix, ...between, ...includeTrailing ? trailingEffects : []];
  if (!prefix.length) return null;
  return { prefix, tail, arr: lastArray, unwrappedInit: firstArray, consumedLevels };
}

// per-SE-expr ExpressionStatements for `insertBefore` - the grouping this channel and the unplugin
// drain both print, filtered through the shared canon so an element with nothing to observe leaves
// no statement behind.
// cloning preserves sibling visitors' path references through AST sub-tree relocation
function buildSEPrefixStatements(t, prefix) {
  return observableSequenceElements(prefix).map(expression => t.expressionStatement(t.cloneNode(expression)));
}

// a nav into the BUILT-IN namespace must NAME the instance surface it dispatches on: a leaf off
// the object the hops merely REACH is a name match (`[{ Array: { keys: m } }] = [globalThis,
// ...t]`), which every other host of both legs keeps native - asked of the paired ELEMENT, the
// value the positional route's minted name will hold
function positionalNameMatch(positional) {
  const slotIndex = positional.slot.parentPath?.node?.elements?.indexOf(positional.slot.node) ?? -1;
  const init = unwrapRuntimeExpr(positional.declarator?.node?.init);
  const pairedElement = slotIndex >= 0 && init?.type === 'ArrayExpression'
    ? pairedArrayWrapInitElement(init.elements, slotIndex) : null;
  const elementNav = pairedElement && positional.keys.length
    ? positional.keys.reduce(memberFromKeyName, unwrapRuntimeExpr(pairedElement)) : null;
  const OPTIONAL_HOPS = { allowOptionalHops: true };
  return !!elementNav && isBuiltInSurfaceNav(elementNav, OPTIONAL_HOPS) && !isInstanceSurfaceNav(elementNav, OPTIONAL_HOPS);
}

// the VariableDeclaration that hosts this prop, or null when the host is an assignment target
// (`({ y: { m } } = R)`) or a param - there is no declaration to extract a `const` into
function hostDeclarationOf(prop) {
  const host = destructurePatternHostPath(prop);
  return host?.isVariableDeclarator?.() ? host.parentPath : null;
}

// generic SE-prefix lift: peels prefix from `node[key]`, emits ExpressionStatements before
// `hostPath`, and collapses the slot to the bare tail. used for the AssignmentExpression
// (`right`) host and - via `liftDeclaratorInitSE` - the VariableDeclarator (`init`) host.
// mutating the slot is essential: multiple polyfilled props sharing one SE-bearing receiver
// each visit independently; without the swap, every visit re-peels the prefix, duplicating `se();`
function liftSEPrefixSwap(t, node, key, hostPath) {
  const { prefix, tail } = peelNestedSequenceExpressions(node[key]);
  if (!prefix.length) return;
  hostPath.insertBefore(buildSEPrefixStatements(t, prefix));
  node[key] = tail;
}

// for-init SE-sink parts: a for-init flatten can't lift statements (the loop header forbids
// them), so an SE-bearing init becomes a dedicated sink declarator. covers a top-level
// sequence init AND an SE hidden under a transparent array wrapper (`[(se(), R)]`,
// `(o(), [(i(), R)])`) - the descent is preferred so both shapes flatten to the one canonical
// sink sequence the unplugin emitter renders too. unwrapRuntimeExpr peels Paren / Chain / TS
// wrappers so `((se(), R) as any)` still trips the branch. null = not a for-init SE shape
function forInitSESinkParts(declaratorNode, isForInit) {
  if (!isForInit) return null;
  const descended = descendArrayWrapperToSE(declaratorNode);
  if (descended) return { prefix: descended.prefix, tail: descended.tail };
  const raw = unwrapRuntimeExpr(declaratorNode.init);
  if (raw?.type !== 'SequenceExpression') return null;
  return peelNestedSequenceExpressions(raw);
}

// the instance default-fold guard SHAPE lives in the render canon
// (`renderInstanceDefaultGuard`); this binding half clones its host operands, wraps them in
// host slots, and converts the canonical shell at the boundary
function buildInstanceDefaultGuard(t, { call, defaultNode, ref }) {
  return estreeToBabel(renderInstanceDefaultGuard({
    assignedRef: hostSlot(t.cloneNode(ref)),
    call: hostSlot(call),
    defaultValue: hostSlot(defaultNode),
    reread: hostSlot(t.cloneNode(ref)),
  }));
}

// re-anchor onto the moved declaration after an SE lift block-wrapped a BODYLESS control-slot
// host (`if (c) var {...} = (se(), R);`): babel's insertBefore replaces the statement with a
// BlockStatement in place, leaving BOTH the declaration path and the declarator's cached
// parentPath pointed at the wrapper block (no `.kind` / `.declarations` - the downstream render
// built an invalid declaration and threw). nodes are stable across the wrap, so the fresh paths
// are recovered by node identity. null when the host was not block-wrapped
function reanchorBlockWrappedDeclaration(declaration, declaratorNode) {
  if (declaration.isVariableDeclaration()) return null;
  const movedDeclaration = declaration.get('body').find(stmt => stmt.node?.declarations?.includes(declaratorNode));
  if (!movedDeclaration) return null;
  return {
    declaration: movedDeclaration,
    declarator: movedDeclaration.get('declarations').find(d => d.node === declaratorNode),
  };
}

// the ONE expression a lifted prefix becomes, through the shared trim canon: the value slot is
// gone, so a trailing effect-free element is a read nobody performs, and a prefix left with no
// observable at all is not a statement the source ran (`({ Map: m } = (0, globalThis))`)
function liftedPrefixExpression(t, prefix) {
  const kept = dropDeadSequenceElements(prefix);
  const lifted = kept.length === 1 ? kept[0] : t.sequenceExpression(kept);
  return mayHaveSideEffects(lifted) ? lifted : null;
}

// a SURVIVING residual keeps the receiver, so the extraction lands AHEAD of it - but the source
// ran the receiver's sequence prefix before either. lift the prefix to where the source ran it,
// or the effect observes the write the extraction has already made (`var { Map: m, other } =
// (eff(), globalThis)` had `eff` read the polyfilled `m`). the swap makes it idempotent: a
// sibling prop reaching the same host finds the slot already collapsed to its tail
function liftSurvivingResidualPrefix(t, node, key, hostPath) {
  // only a statement LIST takes the lift: a bodyless control slot would have to brace first (the
  // insert's own wrap lands the prefix in a block of its own, past the extraction), and a for-init
  // hosts no statement at all - both keep the shape they had
  if (!statementListOf(hostPath?.parentPath?.node)) return;
  const { prefix, tail } = peelNestedSequenceExpressions(node[key]);
  if (!prefix.length) return;
  const statements = buildSEPrefixStatements(t, prefix);
  if (statements.length) hostPath.insertBefore(statements);
  node[key] = tail;
}

// declarator-`init` SE lift that ALSO descends a transparent array wrapper hiding the receiver
// SE one ArrayExpression level down (`[{...}] = [(se(), R)]`), where the top-level peel can't
// see it. the wrapper is discarded by the flatten, so lift the nested-element SE and swap the
// element to its bare tail (stops a multi-prop host re-visit from re-lifting). no wrapper ->
// the plain top-level `liftSEPrefixSwap`.
// `wrapperDies` (a full consume): the neighbours a consumed wrapper level evaluates beside the
// element lift too, behind the element's own effects and `between` (a discarded write the plan
// harvested); a partial consume keeps them where they stand, in the residual's array
// `collapse` is applied to every expression the lift takes out of the init: a node that leaves the
// slot the visitor was going to reach keeps whatever spelling it had, so the caller re-derives the
// polyfill on it there
function liftDeclaratorInitSE(t, declaratorNode, hostPath, { wrapperDies = false, between = [], collapse = null } = {}) {
  function lifted(list) {
    return collapse ? list.map(collapse) : list;
  }
  const descended = descendArrayWrapperToSE(declaratorNode, { liftTrailing: true, includeTrailing: wrapperDies, between });
  if (!descended) {
    // a FLAT init has no wrapper to descend, and the setup handed back for the lift lands ahead of it
    // the same way (`kw = (eff(), _globalThis);` ahead of the extractions it fed)
    if (between.length) hostPath.insertBefore(buildSEPrefixStatements(t, lifted(between)));
    return liftSEPrefixSwap(t, declaratorNode, 'init', hostPath);
  }
  hostPath.insertBefore(buildSEPrefixStatements(t, lifted(descended.prefix)));
  descended.arr.elements[0] = descended.tail;
  // the neighbours a dying wrapper lifted leave the literal too: what stays is the slot alone, so a
  // residual the render still prints (an effectful computed key keeps one) runs none of them a second time
  if (wrapperDies) descended.arr.elements.length = 1;
  // strip every INTERMEDIATE consumed level's wrapper down to its bare array too: the re-anchored
  // init survives in a partial-consume residual, and a kept `(mid(), [R])` element would re-run
  // the just-lifted effect (double-exec vs the single native RHS evaluation). each level is pushed as
  // `{ wrapper: init, array }` with the next level's wrapper taken from `array.elements[0]`, so
  // the link below holds by construction - an identity test cannot tell an alias-dereferenced
  // level apart. should the descent ever follow aliases, gate on SPAN containment against the
  // declarator's own init, or the rewrite lands in a FOREIGN declaration and deletes its effects
  const levels = descended.consumedLevels;
  for (let i = 1; i < levels.length; i++) levels[i - 1].array.elements[0] = levels[i].array;
  // drop the consumed outer wrappers too - a host re-visit would re-collect their prefixes
  declaratorNode.init = descended.unwrappedInit;
}

// render the provider-normalized nested-param synth plan as AST replacing the parameter
// DEFAULT (the semantics - tree mirror, validation, leaf resolution - live in the shared
// `buildNestedParamSynthPlan`, the tree spelling in `renderSynthTree`; this half is the host
// surgery - path recovery by span and the skip marking - which the other leg does its own way)
function renderNestedParamSynth({ prop, meta, deps }) {
  const { t, resolvePure, resolveGlobalPolyfill, injectPureImport, skippedNodes, adapter } = deps;
  const plan = buildNestedParamSynthPlan({ leafPatternPath: prop.parentPath, meta, resolvePure, adapter });
  return applyNestedParamSynthPlan({
    plan,
    renderTree: (tree, recv) => estreeToBabel(renderSynthTree(tree, {
      injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
      ...recv,
      resolveGlobalPolyfill,
      adapter,
    })),
    // the target may sit in EITHER subtree (`(m && globalThis) || self` unfolds BOTH sides) -
    // descend from the host slot by span containment to recover the live path
    // generic span-containment descent: at every level pick the child slot whose span holds
    // the target (covers logical / conditional / sequence / paren AND transparent-IIFE hops -
    // call callee, arrow body, block return)
    // the descent length is the SOURCE's nesting, so it carries no hop budget: each step moves into
    // a strictly smaller span and the walk ends on the tree - either at the target or at a level
    // whose children do not contain it. a budget answered a legal deeply-nested pattern exactly as
    // it answered a broken one, and the caller reads that as "nothing to replace" and prints the
    // receiver raw - a polyfill silently lost past thirty-two levels, on this emitter only
    replaceTarget(targetNode, rendered) {
      let target = plan.host.get(plan.slot);
      while (target.node !== targetNode) {
        let next = null;
        for (const key of t.VISITOR_KEYS[target.node.type] ?? []) {
          const child = target.node[key];
          if (Array.isArray(child)) {
            const index = child.findIndex(item => item && targetNode.start >= item.start && targetNode.end <= item.end);
            if (index !== -1) next = target.get(`${ key }.${ index }`);
          } else if (child && typeof child.start === 'number'
            && targetNode.start >= child.start && targetNode.end <= child.end) {
            next = target.get(key);
          }
          if (next) break;
        }
        if (!next) return false;
        target = next;
      }
      if (target.node !== targetNode) return false;
      target.replaceWith(rendered);
      return true;
    },
    skipSubtree: targetNode => t.traverseFast(targetNode, node => { skippedNodes.add(node); }),
  });
}

// destructure-emit factory: orchestrates the flatten / cascade / param / catch pipelines,
// each with dedicated closure state (`skippedNodes` / `synthSwap` / bookkeeping WeakMaps).
// extracting sub-factories would split those shared accumulators across module boundaries,
// which is what the single-factory shape avoids (mirrors the unplugin twin)
/* eslint-disable-next-line max-statements -- factory orchestrator, see comment above */
export default function createDestructureEmitter({
  t,
  adapter,
  generateRef,
  paramDefaultNeverOverridden = null,
  resolvePure,
  generateLocalRef,
  generateUnusedId,
  injector,
  injectPureImport,
  isDisabled,
  isEntryNeeded = null,
  resolvePropertyObjectType,
  resolveNodeType = null,
  toHint = null,
  resolvedType,
  skippedNodes,
  synthSwap,
  getDebugOutput,
  markThrowingExtraction,
  probedNavGuardValueNode = null,
  collapseKeptNavValueNode = null,
  sealedClaimThrowProbeNode,
}) {
  // alias-resolution context for the proxy-global collapse: lets `findProxyGlobal` follow a
  // const-alias root (`const g = globalThis; g.self.X`) through the canonical resolver, so the
  // `.self` hop collapses off an aliased global too (it would otherwise read undefined on ie:11 /
  // Node). null -> node-only collapse (root classified by name)
  function aliasCtxFromPath(path) {
    return path?.scope ? { scope: path.scope, adapter, path } : null;
  }
  // a discarded-init effect replayed as a clone: a kept chain-assignment among them stores the
  // VALUE canon exactly like its in-place twin (the original was skip-seeded before its own
  // root visit could collapse it, and the clone's insertion traversal re-derives nothing) -
  // without this the replay froze a raw proxy nav into what the assignment stores
  function cloneReplayedEffect(node, path) {
    return collapseLiftedStore(t.cloneNode(node, true), path);
  }

  // ... and a store LIFTED out of an init keeps the same obligation: the node leaves the slot the
  // visitor was going to reach, so a residual dropped behind it takes the last reader with it and
  // the proxy nav freezes raw (`kw = (eff(), globalThis)` published the realm's own spelling, which
  // an engine without `globalThis` cannot even read)
  function collapseLiftedStore(node, path) {
    const tail = peelNestedSequenceExpressions(node).tail ?? node;
    if (tail.type !== 'AssignmentExpression') return node;
    collapseKeptNavValueNode?.(tail, path, { immediate: true });
    // ... and the proxy root of what it STORES is re-derived here too: the kept-nav collapse reads a
    // nav, and a stored bare global (`(eff(), globalThis)`) is a root no visitor reaches again once
    // the residual that held it drops - it would publish the realm's own spelling, which an engine
    // without that global cannot even read
    collapseRetainedProxyReceiver(synthSwap, tail, 'right', aliasCtxFromPath(path));
    const stored = peelNestedSequenceExpressions(tail.right);
    // a SHADOWED global is the user's own value and keeps whatever spelling it has
    const storedPure = stored.tail?.type === 'Identifier' && path?.scope
      && !adapter.getBinding(path.scope, stored.tail.name, path)
      ? resolveGlobalPure(stored.tail.name) : null;
    if (storedPure) {
      const pure = t.cloneNode(injectPureImport(storedPure.entry, storedPure.hintName));
      if (stored.prefix.length) tail.right.expressions[tail.right.expressions.length - 1] = pure;
      else tail.right = pure;
    }
    return node;
  }
  // original body index of each declaration, before insertBefore shifts it
  const originalDeclKeys = new WeakMap();
  // flat-family multi-declarator declarations touched by per-prop emission: split into one
  // statement per declarator AFTER the traversal completes (the unplugin canon - its
  // byStatement render emits per-slot statements; splitting mid-traversal would orphan
  // queued sibling-prop visits). a TRAILING sibling declarator (the SE-key / multi-instance
  // TDZ-safe shape: the polyfill references the receiver bound by its predecessor) stays in
  // the SAME statement as that predecessor - the drain groups it instead of splitting
  const flatTouchedMultiDecls = new Set();
  // array-WRAPPED residuals this pipeline emptied into sentinels: the wrapper is what kept the
  // per-prop route from seeing a whole consumption (its `soleBinding` test is per prop), so the
  // verdict lands after the traversal - see `dropDeadArrayResiduals`
  const arrayWrappedResiduals = new Map();
  // the last statement inserted AFTER a residual, so the next one lands behind it in source order
  const afterResidualAnchors = new Map();
  // the refs an object slot memo WRITES in its slot: the residual performs that write, so an
  // extraction reading the ref lands after it, like one reading past an effectful array neighbour
  const inSlotMemoRefs = new WeakSet();
  // the refs the slot memos declared: a surface nav spelled off one (`_ref.Array.prototype`) is a pure
  // read of a local binding, re-readable for free - by a later leaf of the same slot as well
  const slotMemoRefNames = new Set();
  // is this node a member chain rooted at one of those refs?
  function navOffSlotRef(node) {
    let cur = node;
    while (cur?.type === 'MemberExpression' && !cur.computed) cur = cur.object;
    return cur?.type === 'Identifier' && cur !== node && slotMemoRefNames.has(cur.name);
  }
  // the HOISTED memo of an element / slot, planted where the sibling-declarator canon puts it: ahead
  // of the whole declaration when nothing of the source precedes the host (the declaration stays one
  // statement - residual, extraction, trailing siblings), and behind the leading siblings otherwise,
  // where their own inits run first - the split at that slot is the one this host takes
  // ... that join is the SURVIVING residual's: a level the claims consume whole leaves nothing to
  // join, and its extractions take a statement each beside the siblings, the whole-consume canon.
  // whether the residual survives is known once every claim rendered and the dead residuals left, so
  // the host is handed to the post-traverse split, which reads the pattern it finds there
  function plantSlotMemo({ declarationPath, declaratorPath, ref, value }) {
    if (firstSourceDeclaratorHost(declarationPath, declaratorPath.node)) {
      const memo = t.variableDeclaration(declarationPath.node.kind, [t.variableDeclarator(ref, value)]);
      (declarationPath.parentPath?.isExportNamedDeclaration() ? declarationPath.parentPath : declarationPath)
        .insertBefore(memo);
    } else plantReceiverMemo({ host: declaratorPath, declarationPath, ref, value });
    noteSlotMemoHost(declarationPath, declaratorPath.node);
  }
  // the hosts a slot memo split, by the declarator it memoized for: where that declarator still binds
  // when the split runs, the memo declarator alone stands apart and every other declarator keeps
  // the join - residual, extractions, trailing siblings in one declaration
  const slotMemoHosts = new WeakMap();
  function noteSlotMemoHost(declarationPath, declaratorNode) {
    if (isForInitDeclaration(declarationPath.parentPath?.node, declarationPath.node)) return;
    flatTouchedMultiDecls.add(declarationPath);
    slotMemoHosts.set(declarationPath.node, declaratorNode);
  }

  // the write each in-slot memo planted, by the assignment node it left in the slot: a second leaf
  // off the same slot meets that write as its receiver and reads the one ref, never a second one
  const slotMemoRefs = new WeakMap();
  function writeSlotMemo({ owner, key, node, scope, typeOfReceiver }) {
    let ref = slotMemoRefs.get(node);
    if (!ref) {
      ref = injector.generateDeclaredRef(scope);
      slotMemoRefNames.add(ref.name);
      owner[key] = t.assignmentExpression('=', t.cloneNode(ref), node);
      slotMemoRefs.set(owner[key], ref);
    }
    const written = t.cloneNode(ref);
    if (typeOfReceiver) resolvedType.set(written, typeOfReceiver);
    return written;
  }
  const attachToPrevDeclarator = new WeakSet();
  // per-declarator anchor for successive SE-key trailing inserts (keeps their source order).
  // WeakMap: never drained, so a strong map would pin declarator nodes for the plugin's lifetime
  const seKeyTrailingAnchors = new WeakMap();
  // receiver-memo declarators planted at their source slot: the post-traverse split renders
  // them as standalone `const` statements WITHOUT an export wrap (the memo is an internal
  // temp, and `const` regardless of host kind - the canon both emitters emit)
  const memoDeclarators = new WeakSet();
  // for-init extraction declarators inserted ahead of their host: the SE sink must land
  // BEFORE all of them (the receiver SE evaluates ahead of the extracted bindings - the
  // source-faithful order the unplugin render emits)
  const forInitExtractionDecls = new WeakSet();

  // `let { pattern } = _ref;` declarations synthesized by a RELOCATION - the catch param's and the
  // loop head's alike: their default-guard test refs fold into the SAME `let` (`let _ref2, it = ...`)
  // instead of a hoisted `var _ref2;` - the relocation canon shape both emitters emit
  const catchBornDeclarations = new WeakSet();
  // per-function (body-extract) and per-host (AssignmentExpression cascade) emission bookkeeping:
  // each chains `insertAfter` on the previous inserted node to preserve source order (a bare
  // anchor.insertAfter every visit stacks subsequent inserts in REVERSE) and shares one
  // `var _unused, _unused2;`. matches unplugin's single-pass shape for byte-identical ordering
  const bodyExtractLastInsert = new WeakMap();
  // per-statement nested-instance overwrite tail: chains each overwrite off the previous one so a
  // multi-element pattern emits them in SOURCE order (last element wins, as native destructuring)
  const nestedOverwriteLastInsert = new WeakMap();
  // declarators whose init memoized WHOLE for a surviving residual: their extractions lead the residual
  const wholeInitMemoized = new WeakSet();
  // ... and the statement list each stands in, with its memo declarator: a residual the claims
  // empty demotes the memo, wherever the host declaration has moved to by then
  const wholeInitMemoHosts = new Map();
  // declarators whose claims RE-SPELL the receiver themselves: a sentinel left in their residual
  // would read a surface the extraction already reads, so their consumed leaves leave
  const surfaceRespelledHosts = new WeakSet();
  const nestedOverwriteUnusedVar = new WeakMap();
  // the FIRST artifact each host emitted, by host node. the whole-init memo has to precede them:
  // natively the init evaluates before the pattern binds anything, so a static extracted ahead of
  // the memoizing prop must not be hoisted above the init's own effects - an effect that reads the
  // binding sees TDZ in the source and would see it initialized here
  const hostFirstInsert = new WeakMap();
  function recordHostInsert(hostNode, inserted) {
    if (hostNode && inserted && !hostFirstInsert.has(hostNode)) hostFirstInsert.set(hostNode, inserted);
  }
  // extraction declarator -> the SOURCE offset of the claim that produced it, and the loop heads
  // holding such declarators. a head is written by two channels at different times (the flatten
  // renders every static at the first prop's dispatch, the per-prop route each instance at its
  // own), so the list they leave is in emission order; the source order is this offset's
  const extractionSourceAt = new WeakMap();
  const extractionPropOf = new WeakMap();
  const forInitOrderHosts = new Set();

  function noteExtractionSource(declaratorNode, propNode, declarationPath) {
    if (typeof propNode?.start !== 'number' || !declaratorNode) return;
    extractionSourceAt.set(declaratorNode, propNode.start);
    if (isForInitDeclaration(declarationPath?.parentPath?.node, declarationPath?.node)) {
      forInitOrderHosts.add(declarationPath);
    }
  }

  // the loop heads above, each list re-laid: a memo leads (its readers follow it), then a STORE the
  // source performs before the pattern binds, then every extraction in SOURCE order, and last the
  // sink holding what the head still has to evaluate - the shape the other leg's drain prints
  function orderForInitExtractions() {
    for (const declaration of forInitOrderHosts) {
      const decls = declaration.node?.declarations;
      if (!Array.isArray(decls) || decls.length < 2) continue;
      // a declarator still BINDING a pattern stays where it stands: its own keys may carry effects
      // the extractions must not overtake (`{ [(e1(), 'findLastIndex')]: _unused } = recv`)
      if (decls.some(item => !extractionSourceAt.has(item) && item.id?.type !== 'Identifier')) continue;
      const groups = [[], [], [], []];
      for (const item of decls) {
        if (extractionSourceAt.has(item)) groups[2].push(item);
        else if (memoDeclarators.has(item)) groups[0].push(item);
        else if (emptiedHostSinkValue(item.init).stores) groups[1].push(item);
        else groups[3].push(item);
      }
      if (groups[2].length < 2) continue;
      groups[2].sort((left, right) => extractionSourceAt.get(left) - extractionSourceAt.get(right));
      declaration.node.declarations = groups.flat();
    }
    forInitOrderHosts.clear();
  }

  // ... and the LAST, for the channels that emit into one host: `insertBefore` on the host takes
  // the host's own slot every time, so a second channel's declarator lands AHEAD of the first's -
  // reversing the order the props dispatched in. each insert anchors on the previous one instead
  const hostLastInsert = new WeakMap();
  function insertHostDeclarator(host, node) {
    const last = hostLastInsert.get(host.node);
    const inserted = last?.node && !last.removed ? last.insertAfter(node) : host.insertBefore(node);
    hostLastInsert.set(host.node, inserted[0]);
    recordHostInsert(host.node, inserted[0]);
    return inserted;
  }
  // declarator node -> its binding count, snapshotted on FIRST access (before a sibling prop's emission
  // mutates the pattern - a static-flatten sibling removes its own prop). keyed so `soleBindingInDeclaration`
  // is order-independent and matches unplugin (which never mutates the AST, so it always sees the original)
  const declOriginalBindingCount = new WeakMap();
  // its sibling for the OTHER question the same mutation makes unanswerable. the count above is of
  // BINDINGS, recursively through nested patterns, keyed by declarator; the receiver plan instead
  // asks how many PROPS this one pattern has, and the two part company on a nested pattern
  // (`{ a: { b, c } }` binds two through one prop), so neither can serve the other
  const originalPatternSize = new WeakMap();
  function originalBindingCount(prop) {
    const declarator = prop.findParent(p => p.isVariableDeclarator());
    if (!declarator) return 0;
    let count = declOriginalBindingCount.get(declarator.node);
    if (count === undefined) {
      count = patternBindingCount(declarator.node.id);
      declOriginalBindingCount.set(declarator.node, count);
    }
    return count;
  }
  // side-effect expressions from destructuring inits - drained at programExit
  // (re-traverse for nested polyfill detection then splice into the body in source order)
  const deferredSideEffects = [];
  // kept writes a synth receiver render already carries - the discard replay skips them
  const synthReceiverOwnedSe = new WeakSet();
  // where the READ a rendered throw probe reproduces begins, by probe node: the init's own effects
  // split on it, so what the source ran BEFORE that read still lifts while the read itself does not
  // run twice - the shared `partitionEffectsAtProbe` rule, spelled at this host
  const probeNavStarts = new WeakMap();
  // structural synth-eligibility of an ObjectPattern, judged on the shape it had when the FIRST of
  // its props reached the dispatch - later props see a spliced-down pattern
  const patternSynthEligibility = new WeakMap();
  function patternSizeOf(objectPattern) {
    const node = objectPattern?.node;
    if (!node?.properties) return null;
    if (!originalPatternSize.has(node)) originalPatternSize.set(node, node.properties.length);
    return originalPatternSize.get(node);
  }

  function patternSynthEligible(objectPattern, scope) {
    let verdict = patternSynthEligibility.get(objectPattern.node);
    if (verdict === undefined) {
      verdict = isSynthSimpleObjectPattern(objectPattern.node)
        && patternComputedKeysSynthSafe({ objectPatternNode: objectPattern.node, scope, adapter, path: objectPattern });
      patternSynthEligibility.set(objectPattern.node, verdict);
    }
    return verdict;
  }
  // `for` headers that hosted a destructure. the header is the one host with no statement slot,
  // so its init is RETAINED in place instead of being lifted, and the drain above - which is what
  // re-walks a lifted init - never sees it. recorded at dispatch so the drain visits exactly the
  // headers that were rewritten; scanning the program for them would charge every file for a
  // shape almost none contain
  const retainedForInitHosts = new Set();
  function noteRetainedForInitHost(prop) {
    const host = destructurePatternHostPath(prop);
    if (!host?.isVariableDeclarator?.()) return;
    const declaration = host.parentPath;
    const forStatement = declaration?.parentPath;
    if (forStatement?.isForStatement?.() && forStatement.node.init === declaration.node) {
      retainedForInitHosts.add(forStatement);
    }
  }
  function canTransformDestructuring(path) {
    const parent = path.parentPath?.parentPath;
    if (!sharedCanTransformDestructuring({
      parentType: parent?.node?.type,
      parentInit: parent?.node?.init,
    })) return false;
    // the canon walks past Paren / TS wrappers between the Assignment and its host: without that
    // peel `({from} = Array) as any;` parses as ExprStmt > TSAsExpression > Assignment and the
    // rewrite silently bails.
    // what it answers is whether ANYTHING reads the value: a statement position and a discarded
    // non-tail sequence element both say no, and where the rewrite lands is this emitter's own
    // question (`emitDiscardedSeqElementDestructure` writes into the element slot). the sequence a
    // STATEMENT hosts never arrives here at all - the minifier-shape pre-pass has already split it
    return !parent?.isAssignmentExpression() || assignmentValueDiscarded(parent);
  }

  // inline-default `{ p = _polyfill }` - only fires on undefined property. used when
  // synth-swap can't run (complex receiver, rest element, no default wrapper): it misses
  // the buggy-present native case, but preserves receiver evaluation semantics.
  // when value is already an AssignmentPattern (`{from = []}`), swap the user's default
  // expression with the polyfill ID directly - wrapping in another `t.assignmentPattern`
  // produces nested-AssignmentPattern AST which fails @babel/types validation
  // (AssignmentPattern.left expects Identifier / ObjectPattern / ArrayPattern / MemberExpression
  // / TS wrappers). reachable for arrow expr-body + AssignmentPattern + rest sibling, where
  // body-extract bails on the missing BlockStatement
  function emitParamInlineDefault(prop, id) {
    if (t.isAssignmentPattern(prop.node.value)) {
      prop.get('value').get('right').replaceWith(t.cloneNode(id));
      return;
    }
    prop.get('value').replaceWith(t.assignmentPattern(t.cloneNode(prop.node.value), t.cloneNode(id)));
    prop.node.shorthand = false;
  }

  // anchor a body-extract decl inside `fnPath.body`. first call lands after the directive
  // prologue (or at body[0] when no directives); subsequent calls chain off the previous
  // insert so multi-polyfilled-param functions emit declarations in SOURCE order rather
  // than the REVERSE order a naive directive-anchor reuse would produce. returns the
  // inserted path so callers can chain the next insertion off it
  function insertBodyExtractDecl(fnPath, newDecl) {
    const prevInsert = bodyExtractLastInsert.get(fnPath.node);
    if (prevInsert) return prevInsert.insertAfter(newDecl)[0];
    const bodyPath = fnPath.get('body');
    // inline-injected directives the parser didn't lift into `node.directives[]` still hold the
    // body head: an insert above them demotes them to regular statements (silent strict-mode loss)
    const directiveCount = prologueEndIndex(bodyPath.node.body);
    if (directiveCount === 0) return bodyPath.unshiftContainer('body', newDecl)[0];
    return bodyPath.get('body')[directiveCount - 1].insertAfter(newDecl)[0];
  }

  // parameter destructure polyfill. only static/global fit here; instance methods need a
  // receiver. synth-swap when `synthSwap.findTargetPath` identifies a safe Identifier
  // receiver; otherwise inline-default `{p = _polyfill}` (fires only on undefined property).
  // bare param without IIFE / receiver `function({ from }) {}` bails by design - `from`
  // could be ANY value the caller passes, not necessarily Array.from.
  // AssignmentPattern (`{from = []} = Array`): accept both `{key: binding}` and
  // `{key = default}` shapes. the user's default becomes dead code under synth-swap
  // (polyfill id is always defined) but stays syntactically intact in the output
  function handleParameterDestructure({ prop, kind, entry, hintName, meta = null }) {
    if (kind === 'instance') {
      // an instance method destructured off a typed param DEFAULT (`function f({ at } = Array.prototype)`)
      // synths the default itself - caller-correct (the synth only evaluates when the arg is omitted; a
      // passed value destructures natively). the shared gate bounds the receiver (see its docstring);
      // anything it rejects stays native - there is no receiver-less instance fallback
      if (!tryRegisterParamDefaultInstanceSynth({ prop, entry, hintName })
        && !tryRegisterIifeArgInstanceSynth({ prop, entry, hintName })) {
        tryRegisterHopInstanceSynth({ prop, entry, hintName });
      }
      return;
    }
    if (!isIdentifierPropValue(prop.node.value)) return;
    const objectPattern = prop.parentPath;
    // synth-swap fits every key the synth literal can REPLAY: a plain `{ of }`, a bare-Identifier
    // computed key `{ [k]: of }` (mirrored as `{ [k]: _polyfill }`), and a computed key that folds
    // to a static string - ask the RENDERER's own predicate rather than restating it, so this gate
    // can never drift narrower than what the literal is able to spell. `isSynthSimpleObjectPattern`
    // gates the whole pattern (duplicate keys, a computed key that reads a SIBLING binding)
    const synthKey = isReplayableSynthKey(prop.node);
    // the pattern SHRINKS as siblings emit (a body-extract splices its prop out), so asking the
    // structural gate again on a later prop would judge a different shape than the first one
    // saw. decide once per pattern
    const targetPath = synthKey && patternSynthEligible(objectPattern, prop.scope)
      ? synthSwap.findTargetPath(objectPattern?.parentPath, objectPattern) : null;
    if (!targetPath) {
      // a NESTED / array-wrapped parameter default replaces the DEFAULT itself with a
      // synthesized literal - fully caller-correct (see buildNestedParamSynthPlan)
      if (renderNestedParamSynth({ prop, meta, deps: {
        t, resolvePure, resolveGlobalPolyfill: resolveGlobalPure, injectPureImport, skippedNodes, adapter,
      } })) return;
      // no deferral to the nested mirror here: `renderNestedParamSynth` returns true whenever the
      // mirror rendered, was already planned, or deliberately bailed - a false means the plan never
      // resolved a host, so the mirror will not run for this pattern at all. deferring then dropped
      // the flat sibling's polyfill to a native read
      // synth-swap bailed (computed key / non-Identifier shape sibling) - try body-extract
      // first: insert `const from = _polyfill;` at function body top + remove the prop
      // from the destructure. preserves "polyfill always wins" even at the cost of caller-
      // passed `{from: customFrom}` being ignored (consistent with VariableDeclaration
      // flatten contract). expr-body arrows skipped (no statement slot to host the const)
      //
      // the receiver stays as the param DEFAULT (`{...} = R`, evaluated when the arg is
      // undefined), so collapse a proxy-global member chain in it before either fallback runs
      const paramDefault = objectPattern.parentPath;
      if (paramDefault?.isAssignmentPattern()) {
        collapseRetainedProxyReceiver(synthSwap, paramDefault.node, 'right', aliasCtxFromPath(paramDefault));
      }
      // caller-lossy emissions (body-extract ignores a caller-passed value; a leaf inline
      // default polyfills an ABSENT caller leaf that native leaves undefined) are sound only
      // when no invisible caller exists: an assignment-form host (fixed receiver) or an
      // immediately invoked function (every call site visible). a declared / exported
      // function's params stay VERBATIM instead - usage-global injection covers the targets
      if (paramsHaveInvisibleCallers(prop, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
      // a side-effecting computed key (`{ [(eff(), 'from')]: from }`) must NOT body-extract: that
      // removes the key text (dropping the prefix effects). the inline default keeps the key in the
      // pattern (run once) and appends `= _Array$from`, the SE-preserving shape on every host
      const keyHasSideEffect = computedKeyHasSideEffects(prop.node);
      if (!keyHasSideEffect && tryBodyExtractFromParamDestructure(prop, entry, hintName)) return;
      emitParamInlineDefault(prop, injectPureImport(entry, hintName));
      // parity with sibling destructure handlers - replaceWith schedules re-traversal
      // and the next visitor entry must short-circuit on the already-rewritten prop.
      // also mark the new `{p = _polyfill}` AssignmentPattern slot so Identifier visitors
      // walking `prop.node.value` don't re-fire on the synthetic `_polyfill` default
      skippedNodes.add(prop.node);
      if (prop.node.value) skippedNodes.add(prop.node.value);
      return;
    }
    // defer injectPureImport until programExit emits the synth. if a sibling plugin
    // mutates targetPath before then, the swap is skipped and no dead import is left.
    // the shared classifier flags SE-bearing receivers (call branches AND buried-SE member
    // spines) for the rescue emission - the literal alone would drop the effect
    const sePolicy = classifyCallBranchForSynth({
      inner: targetPath.node, scope: targetPath.scope, adapter, path: targetPath,
    });
    synthSwap.registerPolyfill({
      targetPath, objectPatternPath: objectPattern,
      key: synthPropDedupKey(prop.node, { scope: prop.scope, path: prop, adapter }), entry, hintName,
      callBranch: sePolicy.callBranch, rescueSe: sePolicy.rescueSe,
    });
  }

  // ctor-alias registration off a kind-global destructure property: a binding-less name (writing
  // the global itself) registers trusted, an assignment host runs the checked write registration
  // (the ASSIGNMENT path itself - the placement walk judges every edge up to the statement, so a
  // conditional expression container refuses flow-trust), a declaration host runs the decl gate
  function registerCtorAliasFromProperty(prop, hintName) {
    const aliasLocal = patternBindingName(prop.node.value);
    if (!aliasLocal) return;
    const aliasHost = prop.parentPath?.parentPath;
    const aliasBinding = adapter.getBinding(prop.scope, aliasLocal);
    if (!aliasBinding?.node) registerBindinglessCtorAlias({ injector, adapter, localName: aliasLocal, hint: hintName });
    else if (aliasHost?.isAssignmentExpression()) {
      maybeRegisterAssignmentAliasWrite({
        injector, adapter, binding: aliasBinding,
        localName: aliasLocal, hint: hintName, assignNode: aliasHost.node, stmtPath: aliasHost,
      });
    } else {
      registerDeclAliasIfSound({
        injector, adapter, kind: aliasHost?.parentPath?.node?.kind, localName: aliasLocal, hint: hintName,
        stmtPath: aliasHost?.parentPath, bindingNode: aliasBinding.node ?? null, binding: aliasBinding,
      });
    }
  }

  // register an instance param-default synth: the default expression becomes the synth target and
  // apply() renders `{ at: _atMaybeArray(<receiver>) }` in its place (buildSynthLiteral's instance
  // entry). BOTH a parameter's own default and an INNER one qualify - the mirror replaces that
  // default, so it fires exactly when the slot it defends is undefined, which is the condition under
  // which the source destructures the default itself, whatever host stands above it. the shared gate
  // bounds the receiver's shape / read count / global safety
  function tryRegisterParamDefaultInstanceSynth({ prop, entry, hintName }) {
    const objectPattern = prop.parentPath;
    const wrapper = objectPattern.parentPath;
    if (!wrapper?.isAssignmentPattern()) return false;
    const rightPath = peelTransparentWrapperPath(wrapper.get('right'));
    if (!paramDefaultInstanceSynthAllowed({
      objectPatternNode: objectPattern.node, receiverNode: rightPath.node,
      scope: prop.scope, adapter, path: prop, resolvePure,
    })) return false;
    const use = refineInstanceEntryByReceiver({
      pureResult: { entry, hintName }, key: resolveSynthKeys({ node: prop.node, scope: prop.scope, adapter, path: prop }).lookupKey,
      receiverPath: rightPath, resolveNodeType, toHint, resolvePure, path: prop,
    });
    const slotKey = synthPropDedupKey(prop.node, { scope: prop.scope, path: prop, adapter });
    if (!slotKey) return false;
    synthSwap.registerPolyfill({
      targetPath: rightPath, objectPatternPath: objectPattern, key: slotKey,
      entry: use.entry, hintName: use.hintName, instance: true,
    });
    return true;
  }

  // the IIFE twin of the param-default instance clause: the call is the parameter's ONLY call
  // site, so replacing the ARGUMENT with the synth literal is caller-correct the same way - the
  // argument's value is read once, inside the literal (`(({ at }) => ...)([1, 2])` ->
  // `(({ at }) => ...)({ at: _atMaybeArray([1, 2]) })`). the shared gate bounds the receiver's
  // shape (bare non-global Identifier / this / re-eval-inert literal / clean member chain);
  // anything it rejects stays native. a failed receiver typing keeps the generic dispatcher
  function tryRegisterIifeArgInstanceSynth({ prop, entry, hintName }) {
    const objectPattern = prop.parentPath;
    const wrapper = objectPattern.parentPath;
    if (wrapper?.isAssignmentPattern()) return false;
    const argPath = synthSwap.detectIifeArgPath(wrapper, objectPattern);
    if (!argPath || !paramDefaultInstanceSynthAllowed({
      objectPatternNode: objectPattern.node, receiverNode: argPath.node,
      scope: prop.scope, adapter, path: prop, resolvePure,
    })) return false;
    const use = refineInstanceEntryByReceiver({
      pureResult: { entry, hintName }, key: resolveSynthKeys({ node: prop.node, scope: prop.scope, adapter, path: prop }).lookupKey,
      receiverPath: argPath, resolveNodeType, toHint, resolvePure, path: prop,
    });
    const slotKey = synthPropDedupKey(prop.node, { scope: prop.scope, path: prop, adapter });
    if (!slotKey) return false;
    synthSwap.registerPolyfill({
      targetPath: argPath, objectPatternPath: objectPattern, key: slotKey,
      entry: use.entry, hintName: use.hintName, instance: true,
    });
    return true;
  }

  // body-extract fallback when synth-swap can't fire (computed-key sibling / non-Identifier
  // shape / rest sibling): walk up to the enclosing function-like, ensure block body,
  // prepend `let <local> = _polyfill;`. for rest siblings, replace the prop value with
  // `_unused` sentinel so the destructure still consumes the key and rest exclusion
  // survives; otherwise remove the prop entirely. preserves "polyfill always wins"
  // guarantee at the cost of caller-passed `{from: customFrom}` being ignored
  // an INSTANCE leaf under object hops of a parameter pattern (`({ w: { at: m } } = { w: [1, 2] })`, the
  // IIFE-argument twin): the slot the hops pair with is the receiver, and the mirror lands IN that
  // slot - the flat parameter's instance synth one level down, through the same registration
  function tryRegisterHopInstanceSynth({ prop, entry, hintName }) {
    const objectPattern = prop.parentPath;
    const climbed = patternHopKeysToHost(objectPattern, adapter);
    if (!climbed) return false;
    const wrapper = climbed.hostPattern.parentPath;
    const basePath = wrapper?.isAssignmentPattern() ? peelTransparentWrapperPath(wrapper.get('right'))
      : synthSwap.detectIifeArgPath(wrapper, climbed.hostPattern);
    const slotPath = basePath ? descendReceiverPathByKeys(basePath, climbed.hops) : null;
    // never over a slot THIS pass minted (`of: _Array$of` inside a rendered mirror): the static
    // mirror hands the leaf below it the ponyfill VALUE, and a second mirror there would dispatch on it
    if (!slotPath || (slotPath.node.type === 'Identifier' && ownOutputTests(injector).isOwnPassBinding(slotPath.node.name))
      || !paramDefaultInstanceSynthAllowed({
        objectPatternNode: objectPattern.node, receiverNode: slotPath.node,
        scope: prop.scope, adapter, path: prop, resolvePure,
      })) return false;
    const use = refineInstanceEntryByReceiver({
      pureResult: { entry, hintName }, key: resolveSynthKeys({ node: prop.node, scope: prop.scope, adapter, path: prop }).lookupKey,
      receiverPath: slotPath, resolveNodeType, toHint, resolvePure, path: prop,
    });
    const slotKey = synthPropDedupKey(prop.node, { scope: prop.scope, path: prop, adapter });
    if (!slotKey) return false;
    synthSwap.registerPolyfill({
      targetPath: slotPath, objectPatternPath: objectPattern, key: slotKey,
      entry: use.entry, hintName: use.hintName, instance: true,
    });
    return true;
  }

  function tryBodyExtractFromParamDestructure(prop, entry, hintName) {
    const valueNode = propBindingIdentifier(prop.node.value);
    if (!valueNode) return false;
    // the qualification chain (caller-lossiness containment / foreign-binding redeclare /
    // block body / param-scope reads / var-redeclare) lives in the shared provider gate so
    // both emitters bail on exactly the same shapes
    const qualified = qualifiesForParamBodyExtract({ propPath: prop, localId: valueNode });
    if (!qualified) return false;
    const { fnPath } = qualified;
    const id = injectPureImport(entry, hintName);
    // register the local name -> entry path so receiver-narrowing through this binding
    // (`arr = from('x'); arr.at(-1)`) finds the polyfill's static return type. babel scope
    // tracker may keep the original ObjectProperty binding stale post-AST-mutation, so the
    // structural `staticPairFromDestructure` extractor can't re-derive (Constructor, method)
    // from the renamed `_unused` value - injector alias is the authoritative path
    injector.registerBodyExtractAlias(valueNode.name, entry, prop.scope.getBinding(valueNode.name));
    // `let` (not `const`): the original was a function parameter binding, which is
    // reassignable. swapping in `const` would silently reject downstream `from = newValue`
    // assignments in the body that were valid pre-rewrite.
    // skip past the directive prologue (`'use strict'` ExpressionStatements with
    // `.directive` set): unshifting at body[0] would land the var BEFORE the directive,
    // demoting the directive into a no-op statement and silently flipping the function
    // out of strict mode. babel parser typically lifts directives to `node.directives[]`
    // (separate slot), but inline-injected ExpressionStatements with `.directive` survive
    const newDecl = t.variableDeclaration('let', [
      t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id)),
    ]);
    bodyExtractLastInsert.set(fnPath.node, insertBodyExtractDecl(fnPath, newDecl));
    skippedNodes.add(prop.node);
    if (prop.node.value) skippedNodes.add(prop.node.value);
    if (hasRestSiblingExcept(prop.parent.properties, prop.node)) {
      prop.get('value').replaceWith(generateUnusedId());
      prop.node.shorthand = false;
    } else {
      prop.remove();
    }
    return true;
  }

  // the shared static-hop question, asked with this leg's entry resolver: the passthrough canon asks
  // it of a nav ending on such a key, so the twin reads the static's ponyfill and never the raw static
  function staticHopPure(ctorName, key) {
    return sharedStaticHopPure({ ctorName, key, resolvePure });
  }

  // a nested pattern whose LEAF level keeps siblings is the flat shape written the long way:
  // `{ y: { at, other } } = box` reads exactly what `{ at, other } = box.y` reads. normalizing it
  // hands the claim to the ordinary memo channel, which reads the hop ONCE into a `_ref` both the
  // dispatch and the residual share - the shape this file already prints for the flat twin.
  // sole-host only: a host sibling names another key off the ROOT, and it would lose its binding
  // when the declarator takes the leaf pattern
  function normalizeNestedLeafSiblings(prop) {
    // the same walk `typedNavClaimShape` wraps, asked WITHOUT its built-in-surface refusal: that
    // question is whether the typed-nav dispatch OWNS a claim, this one is where the shape is spelled
    // best, and a surface nav has a flat twin like any other chain
    const walk = resolveNestedReceiverChain(prop, { soleSlots: true, allowLeafSiblings: true, allowSlotDefault: true, adapter });
    // a SOLE claim needs no normalizing - the extraction owns the whole leaf - unless its own KEY
    // carries an effect: that effect runs where the source wrote it, so the leaf has to survive,
    // and a surviving leaf is a second reader of the hop. the flat twin is where both are already
    // answered (the memo the residual reads), so the shape goes there instead of being extracted
    // past its own key
    if (!walk || !(walk.leafPattern?.node?.properties?.length > 1
      || walk.leafPattern?.node?.properties?.some(item => item.type !== 'RestElement'
        && computedKeyHasSideEffects(item)))) return false;
    // at least one hop - a leaf with no hop above it IS the flat twin already. the count used to
    // stop at ONE, because past a hop the two legs read the flattened receiver's type differently;
    // that asymmetry was the slot read answering init-only on the nested side, and it is closed -
    // both spellings now fold the same writer set, so the deeper chains flatten like the first
    if (!walk.keys.length) return false;
    // a REST in the leaf travels with it: the normalization hands the whole leaf pattern to the flat
    // channel, which already spells a rest beside a claim off one memo
    const { declarator } = walk;
    // an array WRAPPER pairs the pattern with an ELEMENT of a literal, and the flat twin lives
    // THERE: the element takes the nav, the pattern takes the leaf, and the pairing routes read the
    // rest as they read a source-written twin. `wrapperElementTakesNav` owns what moves - the hop
    // read lands where the literal builds
    // asked THROUGH the wrappers the source spelled: one leg's parser keeps a paren node the other
    // drops, and a raw identity would answer differently about the same program
    const wrapped = walk.wrapper && unwrapRuntimeExpr(declarator?.node?.init) === walk.wrapperRoot;
    // the core answers WHERE the twin goes: into the element, or trailing the residual where an
    // effect stands between the literal and the read
    const navPlacement = wrapped ? wrapperElementNavPlacement(walk) : null;
    // ... and either spelling REPLACES the host pattern with the leaf, so the host may hold nothing
    // but the hop: a sibling beside it binds a value that replacement drops, and the emitted code
    // then reads a name nothing declares. the flat spelling asks it of the declarator's own
    // pattern, the wrapped one of the ELEMENT that pairs with the literal
    if (wrapped
      ? !navPlacement || walk.hostPattern?.node?.properties?.length !== 1
      : declarator?.node?.id?.type !== 'ObjectPattern' || declarator.node.id.properties.length !== 1) return false;
    // the HOST shapes both legs render: no export wrapper (the memo would have to lift out of it),
    // and a slot the pair can stand in - a statement list, a LOOP HEAD taking declarators, or an
    // unbraced control slot to brace. a declaration with sibling declarators splits, which this
    // leg's own rewrite leaves behind and the other leg's drain now spells the same way
    const declaration = declarator.parentPath;
    if (declaration?.node?.type !== 'VariableDeclaration'
      || declaration.parentPath?.isExportNamedDeclaration()) return false;
    const slotParent = declaration.parentPath?.node;
    const forInit = slotParent?.type === 'ForStatement' && slotParent.init === declaration.node;
    if (!forInit && !statementListOf(slotParent)
      && !isBodylessStatementSlot(slotParent, declaration.node)) return false;
    // ... and a SIBLING declarator is admitted only at an END of the list: the other leg stands its
    // pair beside the declaration rather than splitting the node another route may be rewriting,
    // and a declarator in the MIDDLE has no such side. in a HEAD the pair joins the declarators
    const index = declaration.node.declarations.indexOf(declarator.node);
    if (!forInit && index !== 0 && index !== declaration.node.declarations.length - 1) return false;
    const base = resolveNestedReceiverBase({
      rootName: walk.root.name,
      keys: walk.keys,
      bound: !!adapter.getBinding(prop.scope, walk.root.name, prop),
      adapter,
      resolveGlobalPolyfill: resolveGlobalPure,
      resolveStaticPolyfill: staticHopPure,
    });
    // a CTOR pure has no twin here - its statics are the anchored residual's business; a nav ending
    // on a polyfillable STATIC memoizes that static's ponyfill (`{ of: { name, foo } } = Array`)
    if (!base || (base.pure && !base.static)) return false;
    // spelled off the RAW init, so a TS cast the source wrote survives into the memo - dropping it
    // resolves the flattened receiver against a different type than the source's own spelling
    const navBase = base.static ? t.cloneNode(injectPureImport(base.pure.entry, base.pure.hintName))
      : walk.rootSpelling?.type !== 'TSAsExpression' ? t.cloneNode(walk.root) : t.cloneNode(walk.rootSpelling);
    const nav = estreeToBabel(base.path.reduce(memberFromKeyName, hostSlot(navBase)));
    // a DEFAULT on the slot folds into that same read: what the twin destructures is the slot's own
    // value when it is defined and the default when it is not, through the render canon the sole-slot
    // dispatch already spells. mirroring the default alone polyfills the arm that may never run and
    // leaves the live one raw - which is the shape this normalization exists to route to one memo
    const init = walk.slotDefault ? buildInstanceDefaultGuard(t, {
      call: nav,
      defaultNode: t.cloneNode(walk.slotDefault),
      ref: generateRef(prop.scope, prop.node),
    }) : nav;
    if (wrapped) {
      // the twin is RE-DETECTED off this tree, and a nav this pass just built is a shape the type
      // ladder cannot walk back to its source - so the receiver's type is STASHED on it first, the
      // pre-mutation channel the resolver keeps for exactly this (`resolvedType`). without it the
      // claim ships the generic dispatcher where its source-written twin ships the narrowed one,
      // and the other leg - which never re-detects - ships the narrowed one either way
      const receiverType = resolvePropertyObjectType(prop);
      if (receiverType) resolvedType.set(init, receiverType);
      // a TRAILING twin is a declaration of its own AFTER this one: the wrapper keeps its literal
      // and its element, the pattern empties to coerce that element the way the source does, and
      // the flat channel re-detects the twin below - memo included, where two claims read one nav
      if (navPlacement === 'trail') {
        const twin = t.variableDeclaration(declaration.node.kind,
          [t.variableDeclarator(t.cloneNode(walk.leafPattern.node), init)]);
        walk.hostPattern.replaceWith(t.objectPattern([]));
        // a declarator left binding NOTHING goes with its literal, where that literal holds no
        // effects: the twin reads through the same element, so it performs the coercion the emptied
        // pattern would - and a declarator binding nothing BESIDE one that binds is a shape
        // `@babel/plugin-transform-destructuring` lowers wrong, dropping the sibling's own binding
        const bindsNothing = !Object.keys(t.getBindingIdentifiers(declarator.node.id)).length;
        if (bindsNothing && !mayHaveSideEffects(declarator.node.init)) {
          const others = declaration.node.declarations.filter(item => item !== declarator.node);
          declaration.replaceWithMultiple([
            ...others.length ? [t.variableDeclaration(declaration.node.kind, others)] : [],
            twin,
          ]);
          return true;
        }
        declaration.insertAfter(twin);
        return true;
      }
      walk.hostPattern.replaceWith(t.cloneNode(walk.leafPattern.node));
      // descend the nested literals by the slot chain the walk proved - the element the nav takes
      // sits at the innermost level, which for a single wrapper is the init itself
      let slot = declarator.get('init');
      for (const level of walk.wrapperLevels) slot = slot.get('elements')[level.index];
      slot.replaceWith(init);
      return true;
    }
    // a FOLD is an expression, and the twin's receiver has to be a NAME: the dispatch and whatever
    // residual survives both read it, and reading a fold twice would run the guard twice. so the
    // fold binds its own memo ahead of the declaration and the twin reads that name - a plain nav
    // needs none of this, since the flat channel memoizes it itself when a second reader appears
    if (init !== nav) {
      const memo = injector.generateLocalRef(prop.scope);
      declaration.insertBefore(t.variableDeclaration('const', [t.variableDeclarator(t.cloneNode(memo), init)]));
      // the twin is RE-DETECTED off this tree, and a minted NAME has no shape the type ladder can
      // walk back to the fold - so the receiver's type is stashed on it first, the pre-mutation
      // channel the resolver keeps for exactly this. without it the claim ships the generic
      // dispatcher where the other leg - which never re-detects - ships the narrowed one
      const memoSlot = t.cloneNode(memo);
      const foldType = resolvePropertyObjectType(prop);
      if (foldType) resolvedType.set(memoSlot, foldType);
      declarator.get('init').replaceWith(memoSlot);
    } else {
      // ... and the PLAIN nav carries it just the same: the id below is replaced by a CLONE of the
      // leaf pattern, so the props that answered the type are gone by the re-detection and the leaf
      // asks again off a nav the ladder cannot walk back to the source. the other leg never
      // re-detects and keeps the narrowed dispatcher, so without this the two spell it differently
      const navType = resolvePropertyObjectType(prop);
      if (navType) resolvedType.set(init, navType);
      declarator.get('init').replaceWith(init);
    }
    declarator.get('id').replaceWith(t.cloneNode(walk.leafPattern.node));
    return true;
  }

  // the POSITIONAL element extraction: rename the element SLOT to a minted binding, leave the
  // declaration (and its iteration) exactly as the source wrote it, and bind the claim off that
  // name in the statement that follows. the declaration is what evaluates the init, so it stays -
  // this route discards nothing and reorders nothing
  // the reads an OUTER level owes, in the order the source's nesting spells them: what a level binds
  // BEFORE the hop is read before it, the hop's own value is memoized into the next root, and what
  // the level binds AFTER is read after the inner level - so the trailing pieces come back
  // innermost-first for the caller to place behind the claim
  function buildPositionalLevelReads({ outer, keys, ref, hopped, kind, scope }) {
    const leading = [];
    const trailing = [];
    let root = t.cloneNode(ref);
    for (const [index, level] of outer.entries()) {
      if (level.before.length) {
        leading.push(t.variableDeclaration(kind,
          [t.variableDeclarator(t.objectPattern(level.before), t.cloneNode(root))]));
      }
      const next = index === outer.length - 1 ? hopped : generateLocalRef(scope);
      const hopRead = memberFromKeyName(hostSlot(t.cloneNode(root)), keys[index]);
      leading.push(t.variableDeclaration(kind, [t.variableDeclarator(t.cloneNode(next), estreeToBabel(hopRead))]));
      if (level.after.length) {
        trailing.unshift(t.variableDeclaration(kind,
          [t.variableDeclarator(t.objectPattern(level.after), t.cloneNode(root))]));
      }
      root = next;
    }
    return { leading, trailing };
  }

  // the claimed prop keeps its key and binds a sentinel instead of the source name: the extraction
  // owns that name now, and the key stays where a rest beside it goes on excluding it
  function renameClaimToSentinel(propNode) {
    const sentinel = generateUnusedId();
    propNode.value = sentinel;
    propNode.shorthand = false;
    return sentinel;
  }

  // the hops and the claimed prop of a dropped positional pattern are spent; the claim level's
  // OTHER props ride the residual LIVE, so a sibling claim among them (`{ flat: m, at: m2 }`)
  // still lands off the memoized value instead of reading raw beside the sentinel
  function skipDroppedKeepingSiblings(dropped, claimPattern, propNode) {
    const liveSiblings = new Set();
    for (const sibling of claimPattern.properties) {
      if (sibling !== propNode) t.traverseFast(sibling, node => { liveSiblings.add(node); });
    }
    t.traverseFast(dropped, node => { if (!liveSiblings.has(node)) skippedNodes.add(node); });
  }

  // the POSITIONAL element route's render (the other leg's `registerPositionalElementJob` +
  // drain): the array slot the claim's pattern sits in takes a MINTED name, the claim dispatches
  // off that name through the hop keys the pattern descends, and whatever else the slot bound
  // re-emits as a residual off the same name - the claim's own level with its key renamed to a
  // sentinel, the outer levels split around their hop so each reads in source order. a
  // declaration host binds the name as a declarator, an assignment host as a hoisted `var`
  // written right after the statement. false where the host offers no slot for the pair
  function extractPositionalElementSlot({ prop, entry, hintName, positional, declaration, isForInit }) {
    const bindingId = propBindingIdentifier(prop.node.value);
    if (!bindingId) return false;
    // an ASSIGNMENT host carries no declaration for the pair: the minted name takes a hoisted `var`
    // instead, the statement keeps its own iteration, and the claim's binding is written right after
    // it - which is where the source's own assignment left it
    if (positional.assignment) {
      const { statement } = positional;
      if (!statement?.node || !statementListOf(statement.parentPath?.node)) return false;
      const assignRef = injector.generateDeclaredRef(prop.scope);
      const droppedSlot = positional.slot.node;
      positional.slot.replaceWith(t.cloneNode(assignRef));
      t.traverseFast(droppedSlot, node => { skippedNodes.add(node); });
      const assignReceiver = estreeToBabel(positional.keys.reduce(memberFromKeyName, hostSlot(t.cloneNode(assignRef))));
      const assignDispatch = markThrowingExtraction(t.callExpression(injectPureImport(entry, hintName), [assignReceiver]));
      // chain each write off the previous one for this statement, the way the overwrite channel does:
      // a bare `insertAfter` per element stacks them in REVERSE, and the pattern's elements bind in
      // source order
      const writeStmt = t.expressionStatement(t.assignmentExpression('=', t.cloneNode(bindingId), assignDispatch));
      const prevWrite = nestedOverwriteLastInsert.get(statement.node);
      nestedOverwriteLastInsert.set(statement.node, (prevWrite ?? statement).insertAfter(writeStmt)[0]);
      return true;
    }
    if (!declaration?.node || !declaration.isVariableDeclaration?.()) return false;
    // a FOR-OF / FOR-IN left has only the loop BODY for a statement slot, and the pair belongs
    // where the binding is - so those stay native, as they do on the other leg
    const slotParent = (declaration.parentPath?.isExportNamedDeclaration()
      ? declaration.parentPath.parentPath : declaration.parentPath)?.node;
    if (!isForInit && !statementListOf(slotParent)
      && !isBodylessStatementSlot(slotParent, declaration.parentPath?.isExportNamedDeclaration()
        ? declaration.parentPath.node : declaration.node)) return false;
    // an EXPORTED host must not export the minted name, so its wrapper comes OFF either way: where the
    // declaration binds nothing else the extraction carries the export the source wrote, and where it
    // binds MORE those names keep their export through a specifier list - the source's own bindings,
    // exported by name rather than through a declaration that now also holds a minted one
    const isExport = !!declaration.parentPath?.isExportNamedDeclaration();
    const exportedSiblings = isExport
      ? Object.keys(t.getBindingIdentifiers(declaration.node)).filter(name => name !== bindingId.name)
      : [];
    const anchor = isExport ? declaration.parentPath : declaration;
    const bodyless = isBodylessStatementSlot(anchor.parentPath?.node, anchor.node);
    if (positionalNameMatch(positional)) return false;
    const ref = generateLocalRef(prop.scope);
    const dropped = positional.slot.node;
    // a REST in the dropped pattern gathers what that pattern did not name, so the pattern itself
    // has to survive - reading the minted name, with the claim's key renamed to a sentinel so it
    // goes on excluding itself. renamed BEFORE the drop is marked skipped, since it rides along
    const sentinel = renameClaimToSentinel(prop.node);
    const residualBinds = Object.keys(t.getBindingIdentifiers(dropped)).some(name => name !== sentinel.name);
    // the pattern the residual re-emits is the CLAIM's own level, not the whole element: rooted at
    // the value the dispatch already read, it repeats no hop. re-emitting the element pattern would
    // read every hop key a SECOND time, which runs a getter the source runs once
    const claimPattern = prop.parentPath.node;
    positional.slot.replaceWith(t.cloneNode(ref));
    skipDroppedKeepingSiblings(dropped, claimPattern, prop.node);
    const receiver = estreeToBabel(positional.keys.reduce(memberFromKeyName, hostSlot(t.cloneNode(ref))));
    // the OUTER levels bind their own slots, so each reads the value ITS level reads: the props
    // before the hop are read before it, the props after it after the inner level - the order the
    // source's nesting spells. a level with nothing beside the hop needs no read of its own
    const outer = (positional.levels ?? []).slice(0, -1);
    const outerBinds = outer.some(level => level.before.length || level.after.length);
    // ... and where a hop stands between the element and the claim, the read is memoized so both
    // sides take the SAME value: the dispatch's argument and the residual's root
    const hopped = (residualBinds || outerBinds) && positional.keys.length ? generateLocalRef(prop.scope) : null;
    const { leading, trailing } = hopped
      ? buildPositionalLevelReads({ outer, keys: positional.keys, ref, hopped, kind: declaration.node.kind, scope: prop.scope })
      : { leading: [], trailing: [] };
    const hopDecl = hopped && !leading.length
      ? t.variableDeclaration(declaration.node.kind, [t.variableDeclarator(t.cloneNode(hopped), receiver)]) : null;
    const dispatch = markThrowingExtraction(t.callExpression(injectPureImport(entry, hintName),
      [hopped ? t.cloneNode(hopped) : receiver]));
    const residual = residualBinds
      ? t.variableDeclaration(declaration.node.kind, [t.variableDeclarator(
        hopped ? claimPattern : dropped, t.cloneNode(hopped ?? ref))]) : null;
    const extracted = wrapAsExportIf(
      t.variableDeclaration(declaration.node.kind, [t.variableDeclarator(t.cloneNode(bindingId), dispatch)]),
      isExport);
    // a LOOP HEAD hosts declarators, not statements: the extraction joins the head right after the
    // renamed one, where the binding it reads is already in scope (declarators evaluate in order)
    if (isForInit) {
      if (!positional.declarator?.node) return false;
      positional.declarator.insertAfter(extracted.declarations[0]);
      return true;
    }
    // an unbraced control slot takes exactly one statement - the pair joins the host there
    const pair = [...hopDecl ? [hopDecl] : [], ...leading, extracted, ...residual ? [residual] : [], ...trailing];
    if (bodyless) anchor.replaceWith(bodylessSlotStatement(declaration.node.kind, [declaration.node, ...pair]));
    else if (isExport) {
      const specifiers = exportedSiblings.map(name => t.exportSpecifier(t.identifier(name), t.identifier(name)));
      const kept = specifiers.length ? [t.exportNamedDeclaration(null, specifiers)] : [];
      anchor.replaceWithMultiple([declaration.node, ...pair, ...kept]);
    } else anchor.insertAfter(pair);
    return true;
  }

  // minted USER-binding writes REPLACE positioned originals: carry the original span so the
  // positional flow gates (mutation intervals, guard dominance) see the write where the
  // source wrote it. the estree emitter keeps the original node, so span parity keeps the
  // narrowing decisions aligned across substrates - a span-less minted write fails every
  // positional interval and conservatively drops narrows the unplugin emitter keeps
  function inheritSpan(node, from) {
    if (typeof from?.start === 'number') {
      node.start = from.start;
      node.end = from.end;
      node.loc = from.loc;
      node.range = from.range;
    }
    return node;
  }

  // emit `<binding> = <polyfillId>;` ExpressionStatement; both nodes are cloned so
  // sibling re-emits don't share AST identity. used by every "extract polyfill as separate
  // statement" path (simple flatten / cascade / body-extract via varDecl variant)
  function buildPolyfillAssignmentStatement(valueNode, id, spanFrom) {
    return inheritSpan(t.expressionStatement(
      inheritSpan(t.assignmentExpression('=', t.cloneNode(valueNode), t.cloneNode(id)), spanFrom),
    ), spanFrom);
  }

  // hoist `_unused` sentinel names into a shared `var _unused, _unused2;` declaration ahead
  // of the destructure host. first call creates the declaration via `insertBefore`, subsequent
  // calls APPEND to the same VariableDeclaration node (single combined statement, not split).
  // matches the unplugin drain's single `var ...;` segment
  function appendUnusedVarDeclarators(bk, exprStmt, names) {
    if (!names.length) return;
    if (!bk.unusedVarDecl) {
      const [path] = exprStmt.insertBefore(t.variableDeclaration('var', []));
      bk.unusedVarDecl = path.node;
    }
    for (const name of names) {
      bk.unusedVarDecl.declarations.push(t.variableDeclarator(t.identifier(name)));
    }
  }

  // chain `insertAfter` on the previous polyfill-assignment (or on the host on first call)
  // so per-visitor emissions land in declaration order. plain `host.insertAfter` on every
  // visit lands at parent.body[idx+1] and stacks subsequent insertions in REVERSE
  // ... and the chain is the HOST's, not this render's: the per-prop overwrite channel writes
  // into the same statement, and two anchors of their own put whichever ran second in front
  // (`({ Object: { keys: k }, Array: { prototype: { at: a } } } = R)` printed `a` then `k`).
  // one anchor per host keeps every channel's write in the order the props dispatched
  function appendPolyfillAssignment(bk, exprStmt, stmt) {
    const anchor = bk.lastSibling ?? nestedOverwriteLastInsert.get(exprStmt.node) ?? exprStmt;
    const [path] = anchor.insertAfter(stmt);
    bk.lastSibling = path;
    nestedOverwriteLastInsert.set(exprStmt.node, path);
  }

  // force-wrap a bodyless-slot ExpressionStatement (`if (cond) STMT;` / `while (cond) STMT;`
  // / etc.) in a BlockStatement and return the in-block path. babel's `path.insertAfter` on
  // such a slot internally wraps the slot but DOES NOT update the original path's listKey/
  // key; subsequent `path.remove()` then targets the stale slot key and silently removes
  // the whole synthetic block. wrap via `path.replaceWith(BlockStatement)` so babel updates
  // the slot's path state, then re-resolve to the inner body[0] path. a direct
  // `parent.node[key] = ...` AST write would break that path state - replaceWith keeps the path
  // API contract intact while still wrapping the slot atomically
  function ensureExprStmtInBlock(exprStmt) {
    const parent = exprStmt.parentPath;
    if (!isBodylessStatementSlot(parent?.node, exprStmt.node)) return exprStmt;
    const innerNode = exprStmt.node;
    exprStmt.replaceWith(t.blockStatement([innerNode]));
    return exprStmt.get('body.0');
  }

  // canonical host-statement resolver for a destructure host. wrapping an unbraced control slot
  // - whether through the canon above or through babel's own `insertBefore`, which does the same
  // replaceWith internally - leaves every path already held for that statement pointing at the
  // WRAPPER, so a second emission through such a path wraps again and lands its statement outside
  // the block the first one built. babel@8 caches child paths per parent PATH, so re-`get`ting the
  // descendants cannot re-seat what is already held; record the in-block host instead and resolve
  // every later insertion for the same host through it
  const reboundHostStatements = new WeakMap();

  function hostStatementPath(parent) {
    const rebound = reboundHostStatements.get(parent.node);
    return rebound?.node ? rebound : peelParenAndTSParentPath(parent);
  }

  function blockWrappedHostStatement(parent) {
    const host = ensureExprStmtInBlock(hostStatementPath(parent));
    reboundHostStatements.set(parent.node, host);
    return host;
  }

  // strip transparent wrappers (oxc parens / TS casts / chain / SE-with-AE-as-tail) sitting
  // between the AssignmentExpression and its ExpressionStatement host. SE prefix expressions
  // land as side-effect ExpressionStatement siblings before the host; the host's expression
  // slot collapses to the bare AE so the cascade's bookkeeping (which assumes
  // assignPath.parentPath === ExpressionStatement) operates on a clean shape. flatten only
  // on FIRST visit per host - sibling per-prop re-entries find the slot already collapsed.
  // path-API replaceWith (NOT raw `exprStmt.node.expression = ...`) updates babel's parent
  // chain for inner descendants; raw mutation leaves the detached SE expression slot
  // referenced by inner prop paths, and `isOrphaned` flags every sibling after the first
  // as orphaned - silently dropping per-prop polyfill dispatch for multi-prop hosts
  function flattenSEWrappersToBareAE(exprStmt, assignPath, peeled) {
    if (exprStmt.node.expression === assignPath.node) return;
    const prefixStmts = peeled.sequencePrefix.map(e => t.expressionStatement(e));
    exprStmt.get('expression').replaceWith(assignPath.node);
    if (prefixStmts.length) exprStmt.insertBefore(prefixStmts);
  }

  // `({Array: {from}, ...} = receiver);` (AssignmentExpression in ExpressionStatement) -
  // plan-driven batch rewrite on the first dispatched leaf, mirroring
  // `renderDeclaratorFlattenPlan`: the plan host is a synthetic `{ id, init }` over the
  // assignment's slots, and the statement keeps its receiver tail verbatim.
  // pattern pruned in place (`_unused` sentinels under rest preserve exclusion; a shared
  // `var _unused, _unused2;` is hoisted before the host - LHS slots must be pre-declared,
  // strict mode otherwise throws); each extraction lands as `name = _polyfill;` after the
  // host in plan order. when the pattern fully empties, the dead `({} = receiver)` host is
  // removed - an SE-bearing receiver that survived the prefix lift (an SE nested inside an
  // ArrayExpression element is not hoistable as a top-level prefix) keeps evaluating as a
  // bare statement. preserves "polyfill always wins" - the destructure discards the
  // receiver's native value into `_unused`, then `name = _polyfill` overrides it
  const cascadedAssignments = new WeakSet();
  // `peeled` is REQUIRED: both call sites reach here only past a truthy `peelToExpressionStatement`
  // the discarded-ELEMENT twin of `peelToExpressionStatement`: the same render, hosted by a slot
  // that is not a statement. the peel yields no sequence prefix - only Paren / TS wrappers sit
  // between the assignment and its element, and the SE its RIGHT carries is lifted downstream
  // sentinel `var`s owed by a discarded-element render, flushed once the tree is final
  const pendingElementSentinels = [];

  // an assignment-position sentinel is a plain LHS write: without its `var` the write throws under
  // strict mode. asked of the FINISHED program - a name the render kept is declared, one a later
  // lift carried off with its pattern is not
  function flushDiscardedElementSentinels() {
    for (const { anchor, names } of pendingElementSentinels) {
      if (!anchor?.node || anchor.removed) continue;
      const program = anchor.scope?.getProgramParent?.()?.path;
      if (!program?.node) continue;
      const live = names.filter(name => referencesName(program.node, name));
      if (live.length) {
        anchor.insertBefore(t.variableDeclaration('var', live.map(name => t.variableDeclarator(t.identifier(name)))));
      }
    }
    pendingElementSentinels.length = 0;
  }

  // does this subtree spell `name` anywhere? the sentinel declarations are emitted from what the
  // render actually kept, not from what the prune renamed before a later rebuild replaced it
  function referencesName(node, name) {
    let found = false;
    t.traverseFast(node, item => {
      if (item.type === 'Identifier' && item.name === name) found = true;
    });
    return found;
  }

  function peelToDestructureHost(assignPath) {
    const peeled = peelToExpressionStatement(assignPath);
    if (peeled) return peeled;
    const element = assignmentInStatementPosition(assignPath) ? null : discardedSequenceElementPath(assignPath);
    return element ? { element, sequencePrefix: [] } : null;
  }

  function cascadeAssignmentExpressionDestructure({ assignPath, prop, peeled }) {
    const rawStmt = peeled.exprStmt;
    if (cascadedAssignments.has(assignPath.node)) return !!prop && planConsumedProp(prop);
    // loc rides along so the plan's anchor disable-gate sees the real statement line
    const fake = { id: assignPath.node.left, init: assignPath.node.right, loc: assignPath.node.loc };
    const plan = buildFlattenPlan({
      declaratorNode: fake, scope: assignPath.scope, path: assignPath,
    });
    if (!plan) return false;
    // the kept receiver tail carries its own setup (a chain assignment / SE-bearing call) -
    // neutralize the harvest so an extraction prefix doesn't re-run it (mirrors unplugin).
    // the anchored rebuild replays the replaced tail from the NODE it drops, not from this
    // harvest (a deferred-drain clone re-plans with an empty harvest), so the null is safe
    plan.discardSe = null;
    cascadedAssignments.add(assignPath.node);
    const assigns = [];
    plan.outerProps.forEach((outer, i) => {
      // a prop an earlier per-prop channel already CLAIMED (its real extraction is emitted, its
      // value renamed to a sentinel) re-enters this render as a stale plan row whose localName
      // is the sentinel - rendering it emits a dead `_unused = _polyfill` duplicate. mirror the
      // unplugin render's claimed-prop verbatim gate and skip it
      const srcProp = plan.pattern.properties[i];
      if (srcProp && (skippedNodes.has(srcProp) || (srcProp.value && skippedNodes.has(srcProp.value)))) return;
      for (const e of outer.extractions ?? []) {
        // pattern-valued symbol extraction: the printer parenthesizes the pattern-LHS assignment
        assigns.push(buildPolyfillAssignmentStatement(
          e.pattern ? clonePatternClaimed(e.pattern) : t.identifier(e.localName),
          extractionValueExpr(e, assignPath.node.right, plan, assignPath.scope), assignPath.node));
      }
      // anchored residual on an assignment host: `({ union } = _Set)` (the printer parenthesizes the
      // pattern-LHS assignment)
      if (outer.kind === 'anchored') {
        const { pattern, binding } = anchoredResidualNodes(outer, assignPath.scope);
        const assign = inheritSpan(t.expressionStatement(
          inheritSpan(t.assignmentExpression('=', pattern, binding), assignPath.node)), assignPath.node);
        t.traverseFast(assign, node => { skippedNodes.add(node); });
        assigns.push(assign);
      }
    });
    // a render reducing to exactly ONE statement on an unbraced control slot keeps the
    // slot bodyless - block-wrapping a single statement would churn the guard shape for
    // nothing. two single-statement shapes exist: a FULL consume with one assignment
    // (`if (cond) from = _Array$from;` - host removed, the assign is the emission) and a
    // ZERO-extraction anchored residual (`if (cond) ({ custom } = _Map);` - the rewritten
    // host is the emission). both require no SE prefixes / rest sentinels around them
    // ... and a REST that keeps a hop level alive keeps the host with it: the extractions land
    // beside the residual, never in its place
    const fullyConsumed = plan.outerProps.every(o => o.kind === 'consumed')
      && !plan.pattern.properties.some(isRestProperty) && !plan.restKeepsLevel;
    // an ANCHORED prop discards the init too (its residual reads the ctor binding), so the
    // probe question is "does this render discard the init", not "is every prop consumed"
    const discardsInit = fullyConsumed || (plan.outerProps.every(o => o.kind === 'consumed' || o.kind === 'anchored')
      && !plan.pattern.properties.some(isRestProperty) && !plan.restKeepsLevel);
    // an UNDEFINABLE probe nav under a full-consume assignment host: ride the guarded
    // first-key read ahead of the first extraction assign - same canon as the declarator host
    if (discardsInit && assigns.length) {
      const cascadeProbeKey = probedNavProbeKey(plan);
      if (cascadeProbeKey) {
        const navBase = plan.probedNavNode ?? plan.initElement ?? assignPath.node.right;
        const probedNavNode = peelNestedSequenceExpressions(navBase).tail ?? navBase;
        const guarded = probedNavGuardValueNode?.(probedNavNode, assignPath);
        if (guarded) {
          assigns[0].expression.right = t.sequenceExpression([
            probeKeyReadNode(guarded.node, cascadeProbeKey), assigns[0].expression.right,
          ]);
        }
      }
    }
    // a DISCARDED sequence element hosts no statements: the render lands in its own slot as a
    // sequence - the extractions ahead of whatever residual survives, the order the statement host
    // takes with `insertBefore`. the sentinel `var`s still hoist, ahead of the statement the
    // sequence sits in, which is where a `var` hoists to anyway
    if (peeled.element) {
      const unusedNames = prunePatternByPlanAndRest(plan, assignPath.node.left);
      if (plan.anchor && plan.pattern.properties.length > 0) applyAnchoredAssignmentRebuild(plan, assignPath);
      const exprs = assigns.map(item => item.expression);
      // the residual survives as the assignment itself while it still binds something; once the
      // prune empties it, what is left to evaluate is the RIGHT alone - and only where it carries an
      // effect, exactly the statement host's rule. dropping it whole lost a kept WRITE's effect
      if (plan.pattern.properties.length) exprs.push(assignPath.node);
      else if (mayHaveSideEffects(assignPath.node.right)) exprs.unshift(assignPath.node.right);
      if (exprs.length) {
        const [replaced] = peeled.element.replaceWith(exprs.length === 1 ? exprs[0] : t.sequenceExpression(exprs));
        // the sentinels are declared from what SURVIVED: an ANCHORED rebuild lifts the pattern this
        // prune renamed into a statement of its own and declares the sentinel it keeps there, so a
        // `var` planted here would name what left with the pattern and be read by nothing
        // the sentinels are DEFERRED, not declared here: a later channel may lift the pattern this
        // prune renamed into a statement of its own, taking the name with it, and a `var` planted
        // now would be read by nothing. the post-traverse flush asks the finished tree instead
        if (unusedNames.length) pendingElementSentinels.push({ anchor: findStatementParent(replaced), names: unusedNames });
      }
      return !!prop && planConsumedProp(prop);
    }
    const seFree = !peeled.sequencePrefix.length
      && !peelNestedSequenceExpressions(assignPath.node.right).prefix.length
      && !mayHaveSideEffects(assignPath.node.right);
    // zero extractions imply zero consumed props, so the prune emits no rest sentinels -
    // a rest element is harmless in the anchored single-statement shape
    const singleStatement = seFree
      && (fullyConsumed && assigns.length === 1 || (!assigns.length && plan.anchor));
    if (singleStatement && isBodylessStatementSlot(rawStmt.parentPath?.node, rawStmt.node)) {
      prunePatternByPlanAndRest(plan, assignPath.node.left);
      if (assigns.length) rawStmt.get('expression').replaceWith(assigns[0].expression);
      else applyAnchoredAssignmentRebuild(plan, assignPath);
      return !!prop && planConsumedProp(prop);
    }
    // the block-wrap goes through the SHARED pair: wrapping leaves every path already held for this
    // statement pointing at the WRAPPER, so a channel that wrapped it earlier (an overwrite beside
    // this cascade) had its block wrapped a second time - the sentinel `var` and the residual ended
    // up in a block of their own, nested inside the slot's
    const exprStmt = blockWrappedHostStatement(assignPath);
    flattenSEWrappersToBareAE(exprStmt, assignPath, peeled);
    liftSEPrefixSwap(t, assignPath.node, 'right', exprStmt);
    // within-call chaining only: the `cascadedAssignments` gate above makes this the sole pass
    // over this assignment node, so there is nothing for a cross-call memo to hand back
    const bk = { lastSibling: null, unusedVarDecl: null };
    appendUnusedVarDeclarators(bk, exprStmt, prunePatternByPlanAndRest(plan, assignPath.node.left));
    for (const stmt of assigns) appendPolyfillAssignment(bk, exprStmt, stmt);
    // ANCHORED residual on an assignment host: `({ K: <inner> } = proxy)` becomes
    // `(<inner'> = <ctorBinding>)` - same rebuild as the declarator render
    if (plan.anchor && plan.pattern.properties.length > 0) {
      applyAnchoredAssignmentRebuild(plan, assignPath);
    }
    if (plan.pattern.properties.length === 0 && !plan.restKeepsLevel) {
      if (mayHaveSideEffects(assignPath.node.right)) exprStmt.get('expression').replaceWith(assignPath.node.right);
      else exprStmt.remove();
    }
    return !!prop && planConsumedProp(prop);
  }

  // a leaf resolved as an INSTANCE member of the extracted iterator method: the synth call becomes
  // the dispatcher's receiver (`_demethodize(_getIteratorMethod(x))`) instead of being destructured,
  // the same shape a flat instance extraction emits. the call appears ONCE - the shared helper admits
  // a single leaf precisely so no memo is owed here. takes the LEAF (a plan extraction record and the
  // emitter's own resolution carry the same two fields), so both producers spell this once
  function instanceLeafCall(leaf, value) {
    return leaf?.instanceEntry
      ? t.callExpression(injectPureImport(leaf.instanceEntry, leaf.instanceHint), [value])
      : value;
  }

  // value expression for one extraction record, kind-dispatched: `symbol-iterator` synth
  // wraps the receiver in `_getIteratorMethod(...)`, a static entry binds the pure import
  // (registering the body-extract alias; a ctor alias - kind global - was already
  // trust-registered by the plan gate, a re-register here would erase its write span).
  // shared by the cascade's statement render and the in-place anchored rebuild
  function extractionValueExpr(e, initNode, plan, scope) {
    if (e.synth === 'symbol-iterator') {
      return instanceLeafCall(e, t.callExpression(
        t.cloneNode(injectPureImport(SYMBOL_ITERATOR_PURE_RESULT.entry, SYMBOL_ITERATOR_PURE_RESULT.hintName)),
        [flattenSynthReceiver(initNode, plan)]));
    }
    if (e.kind !== 'global') injector.registerBodyExtractAlias(e.localName, e.entry, scope.getBinding(e.localName));
    const id = injectPureImport(e.entry, e.hint);
    // the leaf's own default keeps its guard, the flat twin's shape (dead text: the pure is always defined)
    return e.defaultNode
      ? estreeToBabel(renderStaticDefaultGuard({
        read: hostSlot(t.cloneNode(id)), defaultValue: hostSlot(t.cloneNode(e.defaultNode)), reread: hostSlot(t.cloneNode(id)),
      }))
      : id;
  }

  // anchored residual rebuild for an assignment host: swap the LHS to the (pruned) inner
  // pattern and the RHS to the ctor binding / raw member; the detached proxy read is
  // skip-seeded so it doesn't earn a dead import. an SE-bearing replaced tail (a chain
  // assignment - the prefix lift has already peeled plain sequence effects) replays WHOLE
  // ahead of the anchor read, exactly once; rebuilding from the dropped NODE itself keeps
  // the replay alive for deferred-drain clones, whose re-planned harvest is empty (clones
  // are traversed on insertion, earning their own substitutions)
  function applyAnchoredAssignmentRebuild(plan, assignPath) {
    anchoredRebuiltAssignments.add(assignPath.node);
    const oldRight = assignPath.node.right;
    assignPath.node.left = plan.pattern;
    assignPath.node.right = mayHaveSideEffects(oldRight)
      ? t.sequenceExpression([t.cloneNode(oldRight, true), anchorInitNode(plan, assignPath, oldRight)])
      : anchorInitNode(plan, assignPath, oldRight);
    t.traverseFast(oldRight, node => { skippedNodes.add(node); });
  }

  // peel single-element ArrayPattern (`[{...}]`) and inner AssignmentPattern (`{...} = {}`)
  // wrappers between an ObjectPattern and its host. shared predicate
  // `isTransparentDestructureWrapper` documents the safety contract under "polyfill always
  // wins". returns `{parent, leftmost}` where:
  //   - `parent`: the next-up parent path past the wrappers (host detection, chain walk)
  //   - `leftmost`: the outermost wrapper node (used for AssignmentExpression LHS match
  //     since `parent.node.left` may be the wrapper rather than the bare pattern)
  function peelTransparentWrappers(pattern) {
    let prev = pattern.node;
    let parent = pattern.parentPath;
    while (parent && isTransparentDestructureWrapper(parent.node, prev)) {
      prev = parent.node;
      parent = parent.parentPath;
    }
    return { parent, leftmost: prev };
  }

  // `const { Array: { from } } = globalThis` -> `const from = _Array$from`.
  // supports N-deep nesting (`const { NS: { Sub: { x } } } = globalThis`): walks up
  // pattern/property pairs until we hit the declarator, then unwinds the cascade from
  // innermost-empty-property-removed outward. AssignmentExpression form is NOT flattened
  // (changing statement shape would lose the expression's return value); only VariableDeclaration.
  // accepts `{ x }`, `{ x: alias }`, `{ x = default }`, `{ x: alias = default }` - user's
  // default is dropped: the polyfill binding is always defined, so `= default` would be
  // dead code; flatten guarantees polyfill wins even on buggy-but-present native
  function tryFlattenNestedProxyDestructure(prop) {
    const valueNode = propBindingIdentifier(prop.node.value);
    // a pattern-valued symbol prop has no binding identifier but the shared plan consumes it
    // (destructuring the helper result), so it may trigger the flatten like any binding leaf
    if (!valueNode && !isSymbolIteratorPatternProp(prop.node)) return false;
    // collect the chain of (property, pattern) pairs leading up to the host (declarator
    // or ExpressionStatement-wrapped AssignmentExpression). hosts handled here ALWAYS
    // win polyfill - native fallback would produce wrong runtime in usage-pure mode
    // (`from = globalThis.Array.from` picks native on modern engines)
    let declarator;
    let currentProp = prop;
    for (;;) {
      const pattern = currentProp.parentPath;
      if (!t.isObjectPattern(pattern?.node)) return false;
      // the outermost pattern's parent may sit under wrapper layers (`{...} = {}` default,
      // `[{...}]` single-element array) - the peel above already crossed them, so the host
      // declarator is the value the loop tested, not something to re-derive after it
      const { parent, leftmost } = peelTransparentWrappers(pattern);
      if (parent?.isVariableDeclarator()) {
        declarator = parent;
        break;
      }
      // AssignmentExpression in ExpressionStatement context: cascade-rewrite for ALL chain
      // shapes. a simple-flatten short-cut full-replacing the statement when no rest sibling
      // is present would, on multi-prop hosts
      // (`({Array: {from}, Object: {fromEntries}} = globalThis)`), seal the WHOLE LHS in
      // skippedNodes after the first prop's emit, silently dropping `fromEntries` polyfill.
      // unified cascade walks each prop's chain inner-to-outer independently, dispatching
      // to `_unused` sentinel emission when any rest sibling is present (rest exclusion
      // preserved) or plain remove otherwise; emits `name = _polyfill;` after the host;
      // when the cascade fully empties the outermost pattern, the empty `({} = receiver)`
      // host is removed (last visitor in declaration order does this).
      // `leftmost` matches against AssignmentExpression's LHS - if peel walked past wrappers
      // the LHS may be the outermost wrapper rather than the bare pattern. transparent
      // statement wrappers (ParenthesizedExpression / TS casts / SequenceExpression with the AE as
      // tail) sitting between AssignmentExpression and ExpressionStatement are flattened in-place -
      // `ChainExpression` is NOT among them: an assignment is not part of an optional chain, so no
      // parser produces one here and the peel's wrapper set omits it: SE prefix exprs land as side-effect
      // ExpressionStatement siblings before the cascade output, the ExpressionStatement's
      // expression slot is replaced with the bare AE so the cascade's bookkeeping (which
      // assumes `assignPath.parentPath === ExpressionStatement`) operates on a clean shape
      if (parent?.isAssignmentExpression() && parent.node.left === leftmost) {
        const peeled = peelToDestructureHost(parent);
        if (peeled) {
          return cascadeAssignmentExpressionDestructure({ assignPath: parent, prop, peeled });
        }
      }
      if (!t.isObjectProperty(parent?.node)) return false;
      currentProp = parent;
    }
    return renderDeclaratorFlattenPlan(declarator, prop);
  }

  // declarator nodes already batch-rendered from their plan; per-prop re-entries on the
  // same declarator report whether THEIR prop was consumed (consumed subtrees are
  // skip-seeded), so an unconsumed (plan-verbatim) leaf keeps its fallback emission
  const flattenedDeclarators = new WeakSet();
  // props a plan CONSUMED while their key stayed as a sentinel (a level a spread or a rest keeps
  // alive): the prop node is not skip-seeded - its KEY may still need the polyfill visitor - yet
  // the claim is answered, and a route that read only the seed fell through to the mirror and
  // rendered the slot a second way beside the extraction
  const planConsumedProps = new WeakSet();
  function planConsumedProp(prop) {
    return skippedNodes.has(prop.node) || planConsumedProps.has(prop.node);
  }

  function resolveGlobalPure(name) {
    const pure = resolvePure({ kind: 'global', name });
    return pure && pure.kind !== 'instance' ? pure : null;
  }

  // can the host re-emit, as statements ahead of the render, what a consumed array wrapper drops
  // beside the element? every statement host can (the assignment cascade keeps such an init
  // whole anyway); a for-init HEAD has no slot and keeps the wrapper native, the other leg's answer
  function planHostLiftsTrailing(path) {
    if (!path || path.isAssignmentExpression?.()) return true;
    const declaration = path.isVariableDeclaration?.() ? path : path.findParent?.(p => p.isVariableDeclaration());
    return !declaration || !isForInitDeclaration(declaration.parentPath?.node, declaration.node);
  }

  // the shared provider plan for a flatten-eligible host: the SAME decision tree the other
  // leg renders. babel's resolvePure already carries the mutated-static and disable
  // gates, so plan resolution matches the per-leaf detection pipeline. `declaratorNode` is
  // a real VariableDeclarator or the cascade's synthetic `{ id, init }` assignment host
  function buildFlattenPlan({ declaratorNode, scope, path }) {
    const plan = buildNestedDestructurePlan({
      declarator: declaratorNode,
      scope,
      adapter,
      path,
      resolvePure: meta => resolvePure(meta),
      resolveGlobalPolyfill: resolveGlobalPure,
      isDisabledProp: isDisabled,
      liftsTrailingEffects: planHostLiftsTrailing(path),
    });
    // ctor-alias extractions register through the checked trust path here (a refused registration
    // only withholds the member-narrow hint; the value swap stays - see the helper docstring)
    return registerCtorAliasExtractions({
      plan, declarator: declaratorNode, scope, adapter, injector, path,
    });
  }

  // does the host declarator's flatten plan CONSUME this prop (a non-verbatim plan node of
  // its own)? the flatten then OWNS the prop's emission. consulted EAGERLY at dispatch (the
  // plan is cached), so prop order cannot decide ownership - without it the per-prop
  // instance route steals the declarator first (memoizing an SE init into `_ref`) and the
  // sibling's flatten never fires, silently dropping its polyfill. mirrors the unplugin twin
  function flattenPlanConsumesProp(prop) {
    const objectPattern = prop.parentPath;
    if (!objectPattern?.isObjectPattern()) return false;
    const { parent: declarator } = peelTransparentWrappers(objectPattern);
    if (!declarator?.isVariableDeclarator()) return false;
    const plan = buildFlattenPlan({ declaratorNode: declarator.node, scope: prop.scope, path: prop });
    const idx = plan ? plan.pattern.properties.indexOf(prop.node) : -1;
    return idx !== -1 && plan.outerProps[idx].kind !== 'verbatim';
  }

  // props the plan declared `symbol-iterator-key` (a defaulted / non-binding value keeps the
  // key-swap): the natural computed-key visitor owns the key-text against the rebuilt
  // receiver - the per-prop instance route must not extract the leaf back out of the residual
  // (stealing it would guard the HELPER result where native raw-read semantics run the default)
  const keySwapOwnedProps = new WeakSet();

  // assignment hosts an anchored rebuild already re-shaped: the pre-rebuild plan is gone
  // (a fresh synthetic re-plan of the mutated node no longer anchors), so anchored-ness is
  // recorded at rebuild time for the host-walk below
  const anchoredRebuiltAssignments = new WeakSet();
  // probed-anchor init nodes awaiting their program-exit guard retype (see anchorInitNode)
  const pendingProbedAnchorSwaps = [];

  // a symbol leaf on an SE-bearing key keeps the KEY-SWAP whenever its host ANCHORS: the
  // effect stays in the kept key (swapped by the natural visitors, effect once), values
  // and defaults run on raw-read semantics off the rebuilt ctor - an anchored constructor
  // gains nothing from the helper's fallbacks, and extracting would flip a default's side
  // where the helper result is defined and the raw read is not. plain receivers keep the
  // established extraction / default-guard pair (matches the unplugin emitter on both sides).
  // marks the prop key-swap-owned: revisits after the anchored rebuild re-enter the
  // dispatch with the REBUILT host (whose re-plan no longer anchors) and would extract
  function sekeySymbolKeepsKeySwap(prop, meta, entry) {
    if (meta?.fromFallback || !computedKeyHasSideEffects(prop.node)) return false;
    if (entry !== SYMBOL_ITERATOR_PURE_RESULT.entry || !hostFlattenPlanAnchors(prop)) return false;
    keySwapOwnedProps.add(prop.node);
    return true;
  }

  // does the leaf's host flatten plan ANCHOR (single-ctor-key hop rebuild)? walks the
  // pattern / property chain to the declarator or assignment host and consults the shared
  // plan - cached by the REAL declarator node, so a post-rebuild walk still reads the
  // pre-rebuild answer; a rebuilt assignment host reads the rebuild-time record instead.
  // the SE-key symbol dispatch declines anchored hosts to the key-swap
  function hostFlattenPlanAnchors(prop) {
    let pattern = prop.parentPath;
    while (pattern?.isObjectPattern()) {
      const { parent, leftmost } = peelTransparentWrappers(pattern);
      if (parent?.isVariableDeclarator()) {
        const plan = buildFlattenPlan({ declaratorNode: parent.node, scope: prop.scope, path: prop });
        return !!plan?.anchor;
      }
      if (parent?.isAssignmentExpression() && parent.node.left === leftmost) {
        if (anchoredRebuiltAssignments.has(parent.node)) return true;
        const fake = { id: parent.node.left, init: parent.node.right, loc: parent.node.loc };
        const plan = buildFlattenPlan({ declaratorNode: fake, scope: prop.scope, path: prop });
        return !!plan?.anchor;
      }
      if (!t.isObjectProperty(parent?.node)) return false;
      pattern = parent.parentPath;
    }
    return false;
  }

  // every binding LEAF of a consumed prop renamed to a sentinel, the hops above it kept: the
  // pattern keeps its shape and binds nothing the extractions did not take. returns the names
  function renameLeavesToUnused(prop) {
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'ObjectPattern') return value.properties.flatMap(renameLeavesToUnused);
    const unusedId = generateUnusedId();
    prop.value = unusedId;
    prop.shorthand = false;
    return [unusedId.name];
  }

  // prune consumed props from the (possibly nested) pattern per the plan tree: a consumed
  // prop is removed outright, or - under a rest sibling - kept as a `key: _unused` sentinel
  // (rest gathers all OTHER own keys, so dropping a fully-consumed key would change runtime
  // semantics: `rest.Array` becomes defined, originally excluded). consumed subtrees are
  // skip-seeded so queued visitor re-entries short-circuit; verbatim survivors (including
  // `[Symbol.iterator]`-keyed props whose key the natural visitor polyfills) stay live.
  // `keepSentinels`: the wrapper this pattern sits in SURVIVES the consume (a spread keeps its
  // array iterating), so a pattern the prune would EMPTY keeps its consumed leaves as sentinels
  // instead - at leaf depth, the shape a bound neighbour leaves (`[{ Array: { from: _unused } },
  // plain2]`); one that keeps a live prop sheds the consumed ones like any partial consume
  // ... asked through the PLAN: a level a spread keeps alive keeps the leaf sentinels, a level a REST
  // keeps alive empties the consumed hop and binds the hop itself to a sentinel (`{ w: _unused,
  // ...rest }` - the flat rest shape one level down), minting into the caller's declaration list
  // `keepSentinels`: the declaration render keeps a surviving level's leaf sentinels; the assignment
  // cascade never did - its surviving literal stays as a statement of its own
  function prunePatternByPlanAndRest(plan, hostPattern, { keepSentinels = false } = {}) {
    const names = prunePatternByPlan(plan.pattern, plan.outerProps,
      { keepSentinels: keepSentinels && !plan.restKeepsLevel });
    if (plan.restKeepsLevel) {
      pruneEmptiedHopProps(hostPattern, { mint: () => {
        const id = generateUnusedId();
        names.push(id.name);
        return id;
      }, isSentinel: isUnusedName });
    }
    return names;
  }

  function prunePatternByPlan(pattern, planNodes, { keepSentinels = false } = {}) {
    // a rest sibling and an effectful hop key keep the level's consumed props as sentinels alike
    const hasRest = patternLevelKeepsSentinels(pattern);
    // ... and only where the prune would EMPTY the pattern: a prop the source still binds keeps the
    // residual alive by itself, and a sentinel beside it reads a key the extraction already spells
    const emptiesPattern = pattern.properties.every(item => planNodes.some(planNode => planNode.prop === item));
    if (keepSentinels && !hasRest && emptiesPattern
      && planNodes.every(planNode => planNode.kind === 'consumed' || planNode.kind === 'anchored')) {
      // ... a sentinel only where its read cannot throw: a leaf UNDER a MISSING-ABLE ctor hop would read
      // the ctor the stripped realm lacks (`_globalThis.Iterator.from`), and an anchored prop reads its own
      // binding - both leave the husk, which coerces the slot and lets the spread iterate even as `[{}]`.
      // a global claim's own sentinel (`{ WeakSet: _unused }`) reads one hop off the realm and stays
      const kept = planNodes.filter(planNode => planNode.kind === 'consumed'
        && !(planNode.prop.value?.type === 'ObjectPattern'
          && hopNamesMissingAbleCtor(planNode.prop, name => resolvePure({ kind: 'global', name }))));
      for (const planNode of planNodes) {
        // a KEPT sentinel still evaluates its own KEY, so that read stays visitable: skipping the whole
        // prop shipped a raw `[Symbol.iterator]` off the realm beside a residual the polyfill spells
        const keepsSentinel = kept.includes(planNode);
        planConsumedProps.add(planNode.prop);
        t.traverseFast(keepsSentinel ? planNode.prop.value : planNode.prop, node => { skippedNodes.add(node); });
        if (!keepsSentinel) pattern.properties = pattern.properties.filter(item => item !== planNode.prop);
      }
      return kept.flatMap(planNode => renameLeavesToUnused(planNode.prop));
    }
    const removed = new Set();
    // sentinel names accumulate for the AssignmentExpression host, which must hoist
    // `var _unused;` declarations (a VariableDeclarator host declares them via the pattern)
    const unusedNames = [];
    for (const planNode of planNodes) {
      // a consumed prop's leaves are extracted; an anchored prop's residual is its own `{ ... } = _Ctor`
      // declarator - both drop from the native residual (skip-seeded so visitor re-entries short-circuit).
      // only a CONSUMED key under an outer rest keeps a sentinel; anchoring bails on rest, so an anchored
      // prop never co-occurs with one
      switch (planNode.kind) {
        case 'consumed':
        case 'anchored':
          t.traverseFast(planNode.prop, node => { skippedNodes.add(node); });
          if (hasRest && planNode.kind === 'consumed') {
            // a synth Symbol.iterator sentinel re-keys through the polyfilled binding so engines without
            // native `Symbol` can still evaluate the computed key (the original key was skip-seeded above)
            if (planNode.extractions?.[0]?.synth === 'symbol-iterator') {
              planNode.prop.key = t.cloneNode(injectPureImport('symbol/iterator', 'Symbol$iterator'));
            }
            // a consumed HOP whose leaves spell an effectful key keeps its shape, the leaves retiring
            // one by one: retiring the hop whole would drop the key the source still evaluates
            if (patternKeepsEffectfulKey(planNode.prop.value)) {
              unusedNames.push(...renameLeavesToUnused(planNode.prop));
            } else {
              const unusedId = generateUnusedId();
              unusedNames.push(unusedId.name);
              planNode.prop.value = unusedId;
              planNode.prop.shorthand = false;
            }
          } else removed.add(planNode.prop);
          break;
        case 'rebuilt':
          unusedNames.push(...prunePatternByPlan(planNode.pattern, planNode.children, { keepSentinels }));
          break;
        case 'symbol-iterator-key':
          keySwapOwnedProps.add(planNode.prop);
      }
    }
    if (removed.size) pattern.properties = pattern.properties.filter(p => !removed.has(p));
    return unusedNames;
  }

  // receiver for the synth Symbol.iterator extraction (`it = _getIteratorMethod(<recv>)`):
  // an ALIASED Identifier tail keeps the user binding (`obj` - its own init is polyfilled
  // independently), matching the unplugin render byte-for-byte; a direct proxy-global /
  // constructor receiver reads through its polyfill binding instead (the raw global would
  // ReferenceError on engines without it); anything else clones the SE-peeled tail verbatim
  function flattenSynthReceiver(initNode, plan) {
    // an ANCHORED plan's symbol leaf reads the iterator method off the anchored
    // CONSTRUCTOR, not the proxy root - the same base the anchored residual reads
    if (plan.anchor) return anchorInitNode(plan);
    const { tail } = peelNestedSequenceExpressions(initNode);
    const isAliasedIdentifier = tail?.type === 'Identifier' && tail.name !== plan.receiver;
    const pure = !isAliasedIdentifier && plan.receiver ? resolveGlobalPure(plan.receiver) : null;
    if (!pure) return t.cloneNode(tail);
    const pureId = t.cloneNode(injectPureImport(pure.entry, pure.hintName));
    // a KEPT STORE inside the receiver stays inside it: the dispatch takes the receiver the source
    // wrote, whole and evaluated once (`{ [S]: it } = (g = globalThis)` is `_gim(g = _globalThis)`,
    // and with a hop above the store `_gim((g = _globalThis, _self))`). lifting the write out and
    // re-reading the always-defined binding spells one receiver in two places, and which place it
    // lands in is then decided by the route the KEY's spelling picked - never a receiver question.
    // the store may BE the receiver (its value is what the dispatch takes) or sit at the ROOT of a
    // run the hops collapsed to the leaf pure - there the write is that value's prefix, spelled
    // with the store's own resolved root
    const ownStore = peelChainAssignment(tail).outer;
    if (ownStore) {
      synthReceiverOwnedSe.add(ownStore);
      const carried = t.cloneNode(ownStore, true);
      carried.right = pureId;
      return carried;
    }
    const rootStore = peelChainAssignment(descendToChainRoot(tail).root ?? tail).outer;
    const rootName = rootStore?.right?.type === 'Identifier' ? rootStore.right.name : null;
    const rootPure = rootName ? resolveGlobalPure(rootName) : null;
    if (!rootPure) return pureId;
    synthReceiverOwnedSe.add(rootStore);
    const carried = t.cloneNode(rootStore, true);
    carried.right = t.cloneNode(injectPureImport(rootPure.entry, rootPure.hintName));
    return t.sequenceExpression([carried, pureId]);
  }

  // init for an ANCHORED (single-ctor-key proxy-hop) residual: the plan-resolved ctor
  // entry when present (`= _Map` - patch-visible for mutated statics, defined on
  // missing-global targets), else a member read off the proxy's own binding
  // (`= _globalThis.Math`). the static-placement canon admits only identifier-valid names, so
  // a plain identifier key node is always valid here (a key folding to `Symbol.iterator` /
  // `'App-Key'` never reaches an anchored plan)
  function anchorInitNode(plan, anchorPath = null, initNode = null) {
    // an UNDEFINABLE probe nav init: the anchored read must ride the guard-value spelling
    // (`(null == _globalThis.window ? void 0 : _self).Math`) so the destructure still throws
    // where the source does; the always-defined ctor / receiver bindings below erase that
    // throw. the swap is DEFERRED to program exit: this emitter mutates the AST in place, and
    // an early conditional init would read as a diverging receiver to the per-prop channels
    // still due to visit the pattern (an SE-key extraction declined on it) - the defined-nav
    // render below stays resolvable through the traversal, the flush retypes it in place.
    // bails to the plain defined-nav render when the shared plan cannot guard this nav shape
    const emitted = plan.anchorPure
      ? t.cloneNode(injectPureImport(plan.anchorPure.entry, plan.anchorPure.hintName))
      : t.memberExpression(
        resolveGlobalPure(plan.receiver)
          ? t.cloneNode(injectPureImport(resolveGlobalPure(plan.receiver).entry, resolveGlobalPure(plan.receiver).hintName))
          : t.identifier(plan.receiver),
        t.identifier(plan.anchor));
    if (plan.probedNav && initNode && anchorPath) {
      const navNode = peelNestedSequenceExpressions(initNode).tail ?? initNode;
      const guarded = probedNavGuardValueNode?.(navNode, anchorPath);
      if (guarded) pendingProbedAnchorSwaps.push({ emitted, guarded: guarded.node, anchor: plan.anchor, hostNode: anchorPath.node });
    }
    return emitted;
  }

  // drain for the probed-anchor guard swaps: retype the emitted defined-nav init IN PLACE
  // into the guarded member read (`_self.Math` / `_Map` -> `(null == _globalThis.window ?
  // void 0 : _self).Math`). fired at the HOST's exit with that host's node (every per-prop
  // channel of the pattern has dispatched, and a sibling plugin's later lowering hasn't yet
  // cloned the emitted node away), and host-less at program exit as the backstop
  function flushProbedAnchorSwaps(hostNode = null) {
    for (let i = pendingProbedAnchorSwaps.length - 1; i >= 0; i--) {
      const swap = pendingProbedAnchorSwaps[i];
      if (hostNode && swap.hostNode !== hostNode) continue;
      const swapped = t.memberExpression(swap.guarded, t.identifier(swap.anchor));
      for (const key of Object.keys(swap.emitted)) delete swap.emitted[key];
      Object.assign(swap.emitted, swapped);
      pendingProbedAnchorSwaps.splice(i, 1);
    }
  }

  // unconditional proxy-hop trigger, wired into the MAIN usage-pure traversal (replaces the
  // dedicated normalize pre-pass traverse): an anchored plan must fire even when NO leaf
  // resolves (`{ Map: { customY } } = globalThis` - the whole point is the re-anchored
  // residual). cheap shape prefilter before any plan work; the host-value gates live in the
  // callees (declarator inits are never read; the cascade gates on statement context)
  function tryFlattenProxyHopHost(path) {
    const isDecl = path.isVariableDeclarator();
    const pattern = isDecl ? path.node.id : path.node.left;
    const init = isDecl ? path.node.init : path.node.right;
    if (!init || pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return;
    const [hopProp] = pattern.properties;
    if (!t.isObjectProperty(hopProp)) return;
    const inner = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
    if (inner?.type !== 'ObjectPattern') return;
    if (isDisabled(path.node)) return;
    if (isDecl) {
      renderDeclaratorFlattenPlan(path, null);
      return;
    }
    if (path.node.operator !== '=') return;
    const peeled = peelToDestructureHost(path);
    if (peeled) cascadeAssignmentExpressionDestructure({ assignPath: path, prop: null, peeled });
  }

  // for-init+SE full consume: convert the orphan declarator to an SE-sink. the sink init
  // is REBUILT as a bare flattened sequence - transparent wrappers (TS casts) and nested
  // sequence parens are dead on the discarded sink slot, and the bare shape is the
  // plan-canonical sink both emitters emit
  function convertForInitSESink(declarator, forInitSE, extracted) {
    foldBuriedProxyHopHosts(declarator.get('init'));
    declarator.node.id = generateUnusedId();
    declarator.node.init = t.sequenceExpression([...forInitSE.prefix, forInitSE.tail]);
    declarator.insertBefore(extracted);
  }

  // fold proxy-hop hosts buried in a kept init BEFORE a sink render captures it: both
  // for-init sinks (the flatten route's re-embedded prefix and the per-prop route's cloned
  // memo) print from their assembly-time snapshot, so a later enter-visit rebuild would
  // mutate a node the print no longer reads (matches the unplugin's marked-operand compose)
  function foldBuriedProxyHopHosts(initPath) {
    initPath.traverse({
      AssignmentExpression(assignPath) { tryInPlaceAnchoredRebuild(assignPath); },
    });
  }

  // ZERO-extraction anchored rebuild of a proxy-hop host buried in a KEPT expression slot
  // (a for-init sink's re-embedded SE prefix): no statement machinery needed, the host
  // rebuilds in place, folding the hop exactly like the statement form (an SE-bearing init
  // replays whole via the shared rebuild). invoked from the SINK ASSEMBLY - the
  // post-traverse drain prints the sink from that render, so a later enter-visit rebuild
  // would mutate a node the drain no longer reads
  function tryInPlaceAnchoredRebuild(assignPath) {
    if (cascadedAssignments.has(assignPath.node)) return;
    const fake = { id: assignPath.node.left, init: assignPath.node.right, loc: assignPath.node.loc };
    const plan = buildFlattenPlan({ declaratorNode: fake, scope: assignPath.scope, path: assignPath });
    // every extraction kind composes expression-shaped below (a synth reads the anchored
    // ctor, a static binds its pure import) - bailing statics to the default-injection
    // channel demoted them to the weaker native-wins tier
    const extractions = plan?.anchor ? plan.outerProps.flatMap(o => o.extractions ?? []) : null;
    if (!extractions) return;
    // the rebuild replays the replaced tail from the dropped node itself (mirrors the cascade)
    plan.discardSe = null;
    // a rest sentinel on an assignment host is a plain LHS write: declare it (statement
    // hosts declare via their own emit; an in-place fold has no statement slot, so the
    // scope hoist carries it - at the FUNCTION scope, not the loop-body block, since the
    // for-init writes the sentinel before the body block runs)
    const hoistScope = assignPath.scope.getFunctionParent() ?? assignPath.scope.getProgramParent();
    for (const name of prunePatternByPlanAndRest(plan, assignPath.node.left)) {
      hoistScope.push({ id: t.identifier(name) });
    }
    cascadedAssignments.add(assignPath.node);
    const assignExprs = extractions.map(e => inheritSpan(t.assignmentExpression('=',
      e.pattern ? clonePatternClaimed(e.pattern) : t.identifier(e.localName),
      extractionValueExpr(e, assignPath.node.right, plan, assignPath.scope)), assignPath.node));
    // full consume collapses the host to the assigns sequence. an SE-bearing init keeps its
    // effects verbatim ahead of the assigns - sequence prefixes and a chain-assignment tail,
    // the only SE channels the anchored plan admits - while the dead anchored tail read
    // drops (clones are traversed on insertion, earning their own substitutions)
    if (!plan.pattern.properties.length) {
      const { prefix, tail } = peelNestedSequenceExpressions(assignPath.node.right);
      // an UNDEFINABLE probe nav under a full-consume cascade: ride the guarded first-key
      // read ahead of the first assign, once per pattern - same canon as the declarator host
      const cascadeProbeKey = assignExprs.length ? probedNavProbeKey(plan) : null;
      if (cascadeProbeKey) {
        const navBase = plan.probedNavNode ?? plan.initElement ?? assignPath.node.right;
        const probedNavNode = peelNestedSequenceExpressions(navBase).tail ?? navBase;
        const guarded = probedNavGuardValueNode?.(probedNavNode, assignPath);
        if (guarded) {
          assignExprs[0].right = t.sequenceExpression([
            probeKeyReadNode(guarded.node, cascadeProbeKey), assignExprs[0].right,
          ]);
        }
      }
      // an SE-free init drops whole (its pure prefixes too - the unplugin emitter's collapse
      // replaces the full operand, so keeping a dead literal here would desync the shape)
      const kept = mayHaveSideEffects(assignPath.node.right)
        ? [...prefix, ...isChainAssignment(tail) ? [tail] : []]
        : [];
      const orphaned = assignPath.node;
      const exprs = [...kept.map(n => cloneReplayedEffect(n, assignPath)), ...assignExprs];
      assignPath.replaceWith(exprs.length === 1 ? exprs[0] : t.sequenceExpression(exprs));
      t.traverseFast(orphaned, node => { skippedNodes.add(node); });
      return;
    }
    applyAnchoredAssignmentRebuild(plan, assignPath);
    if (assignExprs.length) {
      assignPath.replaceWith(t.sequenceExpression([assignPath.node, ...assignExprs]));
    }
  }

  // a computed `Symbol.X` key cloned into an anchored residual is skip-seeded whole, so the
  // standalone key visitor never touches the CLONE: whether it fired on the ORIGINAL depends
  // on which sibling dispatched the flatten (a rewritten original clones as the injected
  // identifier and needs nothing). a still-raw key re-keys directly - the DECISION is the shared
  // canon (alias and proxy-global spellings of `Symbol` answer like the bare name, a shadowed or
  // SLOT-MUTATED one refuses), only the render is local: a non-well-known name falls to the
  // polyfilled CONSTRUCTOR read (`[_Symbol.foo]`) - raw `Symbol` throws on symbol-less engines
  function anchoredResidualPropKey(key, scope) {
    const name = anchoredResidualSymbolKeyName({ key, computed: true, scope, adapter, path: null });
    if (name === null) return null;
    const entry = symbolKeyToEntry(`Symbol.${ name }`);
    if (entry && isEntryNeeded?.(entry)) return t.cloneNode(injectPureImport(entry, `Symbol$${ name }`));
    if (isEntryNeeded?.('symbol/constructor')) {
      return t.memberExpression(t.cloneNode(injectPureImport('symbol/constructor', 'Symbol')), t.identifier(name));
    }
    return null;
  }

  // build the `{ ...leaves } = _Ctor` parts for an anchored-residual prop. the caller wraps them in a
  // VariableDeclarator (declaration host) or an AssignmentExpression statement (assignment host), then
  // skip-seeds the result (the leaves carry no default - the planner bails those - so re-visiting would
  // only risk re-collapsing the binding; matches the unplugin text render's no-re-visit)
  function anchoredResidualNodes(outer, scope) {
    return {
      pattern: t.objectPattern(outer.residualProps.map(p => {
        const cloned = t.cloneNode(p, true);
        if (cloned.computed) {
          const rekeyed = anchoredResidualPropKey(cloned.key, scope);
          if (rekeyed) cloned.key = rekeyed;
        }
        return cloned;
      })),
      binding: t.cloneNode(injectPureImport(outer.anchorPure.entry, outer.anchorPure.hintName)),
    };
  }

  // extraction declarators in plan order. a GLOBAL extraction registers a global alias
  // (member reads through the local keep resolving: `Symbol.iterator` off the extracted
  // `Symbol` -> `_Symbol$iterator`); a static-method extraction registers the body-extract
  // alias so receiver narrowing through the local keeps resolving post-mutation
  function buildExtractionDeclarators(plan, declarator) {
    const extracted = [];
    for (const outer of plan.outerProps) {
      for (const e of outer.extractions ?? []) {
        let init;
        if (e.synth === 'symbol-iterator') {
          init = instanceLeafCall(e, t.callExpression(
            t.cloneNode(injectPureImport(SYMBOL_ITERATOR_PURE_RESULT.entry, SYMBOL_ITERATOR_PURE_RESULT.hintName)),
            [flattenSynthReceiver(declarator.node.init, plan)]));
        } else {
          // the shared value render: the pure import, guarded by the leaf's own default where it has one
          init = t.cloneNode(extractionValueExpr(e, declarator.node.init, plan, declarator.scope));
        }
        // a pattern-valued symbol extraction destructures the helper result; the deep clone is
        // fresh (not skip-seeded), so its inner polyfillables (a default's instance call) are
        // re-visited on insertion and rewritten like any source pattern - with its PROPERTY
        // nodes claimed so the pipeline doesn't re-enter on the extracted pattern
        const item = t.variableDeclarator(e.pattern ? clonePatternClaimed(e.pattern) : t.identifier(e.localName), init);
        extractionPropOf.set(item, outer.prop);
        extracted.push(item);
      }
      if (outer.kind === 'anchored') {
        const { pattern, binding } = anchoredResidualNodes(outer, declarator.scope);
        const declr = t.variableDeclarator(pattern, binding);
        t.traverseFast(declr, node => { skippedNodes.add(node); });
        extractionPropOf.set(declr, outer.prop);
        extracted.push(declr);
      }
    }
    return extracted;
  }

  // the probe's member read off the guard value: dotted for identifier-valid names, computed
  // string otherwise, and the polyfilled symbol binding for a `[Symbol.iterator]` first key
  // (old runtimes without native Symbol still evaluate the read). the read NODE is skip-seeded -
  // the probe is an already-decided render, and a key naming an instance method (`keys`) would
  // otherwise be re-claimed into a dispatcher call on insertion - while everything INSIDE stays
  // live: the guard test relies on re-entry for its proxy-root substitution
  function probeKeyReadNode(guardNode, probeKey) {
    const read = probeKey.symbolIterator
      ? t.memberExpression(guardNode, t.cloneNode(injectPureImport('symbol/iterator', 'Symbol$iterator')), true)
      : isValidIdentifierName(probeKey.name)
        ? t.memberExpression(guardNode, t.identifier(probeKey.name))
        : t.memberExpression(guardNode, t.stringLiteral(probeKey.name), true);
    skippedNodes.add(read);
    return read;
  }

  // init-side rebuilds of the flatten render, shared ordering-sensitive channels:
  // - ANCHORED residual: rebuild the declarator as `<innerPattern> = <ctorBinding>` - the hop
  //   wrapper and the proxy read are dead (every surviving read goes through the constructor);
  //   the old init subtree is skip-seeded so the detached proxy root doesn't earn a dead
  //   import; an SE-bearing original replays its sequence prefixes and harvested discard-SE
  //   ahead of the anchor read, exactly once (clones are traversed on insertion, so inner
  //   `globalThis` references still earn their substitutions)
  // - UNDEFINABLE probe nav under an anchored FULL consume: the discarded init's read must
  //   still throw where the source does - ride the guarded anchor read ahead of the FIRST
  //   extraction's binding, once per pattern (native throws before any prop read)
  // - SE-bearing chain-root call / chain-assignment in a fully-DISCARDED init: re-emit as a
  //   sequence prefix on the SOLE extraction so the setup still runs, exactly once (a partial
  //   consume keeps the declarator with its init, so the setup already runs there); several
  //   extractions hand it to the statement lift, or to a loop head's own sink declarator
  // - ... unless the consumed wrapper also drops TRAILING neighbours: native runs the setup
  //   before them, and the neighbours lift as statements, so the setup is handed back to the
  //   caller's lift (`returned`) to land ahead of them instead of behind, on the extraction
  function applyAnchoredInitRebuilds(plan, declarator, extracted, patternEmpties) {
    if (plan.anchor && !patternEmpties) {
      const oldInit = declarator.node.init;
      declarator.node.id = plan.pattern;
      const replayed = [...plan.anchorSe ?? [], ...plan.discardSe ?? []];
      declarator.node.init = replayed.length
        ? t.sequenceExpression([...replayed.map(node => cloneReplayedEffect(node, declarator)), anchorInitNode(plan, declarator, oldInit)])
        : anchorInitNode(plan, declarator, oldInit);
      t.traverseFast(oldInit, node => { skippedNodes.add(node); });
    }
    const fullConsumeProbeKey = patternEmpties && extracted.length ? probedNavProbeKey(plan) : null;
    let probeOwnedCall = null;
    if (fullConsumeProbeKey) {
      // an array-wrapped init's probe value is the DESCENDED element, not the wrapper array
      const navBase = plan.probedNavNode ?? plan.initElement ?? declarator.node.init;
      const probedNavNode = peelNestedSequenceExpressions(navBase).tail ?? navBase;
      const guarded = probedNavGuardValueNode?.(probedNavNode, declarator);
      if (guarded) {
        const [first] = extracted;
        first.init = t.sequenceExpression([probeKeyReadNode(guarded.node, fullConsumeProbeKey), first.init]);
        probeOwnedCall = guarded.rootEffectCall;
      }
    } else if (patternEmpties && extracted.length && plan.initElement) {
      // the ALIAS-held flavor of the array-wrapped rule: no guard value to read the pattern
      // key off - the ELEMENT read itself is the probe (`[{ of }] = [a.Array]` throws reading
      // `.Array` where the extraction just binds), riding the first extraction once per
      // pattern; the per-prop channel never sees the wrapper, so this is its only owner
      const throwProbe = sealedClaimThrowProbeNode?.(declarator, unwrapRuntimeExpr(plan.initElement));
      if (throwProbe) {
        skippedNodes.add(throwProbe.node);
        const [first] = extracted;
        first.init = t.sequenceExpression([throwProbe.node, first.init]);
      }
    }
    if (patternEmpties && plan.discardSe) {
      // the probe's guard test runs an effect-bearing CALL root exactly once - the discard
      // replay must not re-run it (identity plus span symmetry with the harvested node).
      // a WRITE the synth receiver carries is spelled there for the same reason
      const replayable = plan.discardSe.filter(node => !synthReceiverOwnedSe.has(node)
        && (!probeOwnedCall || (node !== probeOwnedCall
          && !(node.start >= probeOwnedCall.start && node.end <= probeOwnedCall.end)
          && !(probeOwnedCall.start >= node.start && probeOwnedCall.end <= node.end))));
      const replayed = replayable.map(node => cloneReplayedEffect(node, declarator));
      if (plan.trailingEffects) return replayed;
      // a SOLE extraction rides the setup inside its own value; SEVERAL readers of one init cannot each
      // hold it, so on a statement host it is handed back to the lift ahead of them all, and in a LOOP
      // HEAD - which hosts no statement - it takes a sink declarator of its own ahead of them, where the
      // source performed the store (`_unused = kw = (eff(), _globalThis), a = ..., b = ...`)
      const forInit = isForInitDeclaration(declarator.parentPath?.parentPath?.node, declarator.parentPath?.node);
      // ... and the readers are counted over the PATTERN, not over this render: an instance claim
      // beside the statics binds through the per-prop route and never joins this list, yet it reads
      // the same init - so a prefix carried into the first extraction would run after it
      const readers = extracted.length
        + plan.outerProps.filter(outer => outer.kind === 'consumed' && !outer.extractions?.length).length;
      if (replayed.length > 0 && readers > 1) {
        if (!forInit) return replayed;
        const sink = t.variableDeclarator(generateUnusedId(), replayed.length === 1 ? replayed[0] : t.sequenceExpression(replayed));
        if (emptiedHostSinkValue(sink.init).stores) extracted.unshift(sink);
        else extracted.push(sink);
      } else if (replayed.length) {
        const [first] = extracted;
        first.init = t.sequenceExpression([...replayed, first.init]);
      }
    }
    return [];
  }

  // declaration-host renderer for the shared nested-flatten plan: ONE batch render on the
  // first dispatched leaf replaces the old per-prop incremental cascade. extraction order =
  // plan order = source order, matching both the old visit order and unplugin's render.
  // hosts handled here ALWAYS win polyfill - native fallback would produce wrong runtime in
  // usage-pure mode (`from = globalThis.Array.from` picks native on modern engines)
  function renderDeclaratorFlattenPlan(declarator, prop) {
    let declaration = declarator.parentPath;
    if (!declaration?.isVariableDeclaration()) return false;
    if (flattenedDeclarators.has(declarator.node)) return !!prop && planConsumedProp(prop);
    const plan = buildFlattenPlan({ declaratorNode: declarator.node, scope: declarator.scope, path: declarator });
    if (!plan) return false;
    flattenedDeclarators.add(declarator.node);
    const isForInit = isForInitDeclaration(declaration.parentPath?.node, declaration.node);
    const forInitSE = forInitSESinkParts(declarator.node, isForInit);
    const declCount = declaration.node?.declarations?.length ?? 1;
    const extracted = buildExtractionDeclarators(plan, declarator);
    prunePatternByPlanAndRest(plan, declarator.node.id, { keepSentinels: !!plan.wrapperSurvives });
    // a wrapper a spread keeps alive never EMPTIES: what leaves it (an anchored prop reading its
    // own ctor binding) leaves a `{}` husk that still coerces the slot and lets the spread iterate
    const patternEmpties = plan.pattern.properties.length === 0 && !plan.wrapperSurvives;
    // the discarded setup handed back for the statement lift (a consumed wrapper's trailing
    // neighbours lift behind it), empty where the rebuild placed it itself
    const liftedSetup = applyAnchoredInitRebuilds(plan, declarator, extracted, patternEmpties);
    // seed skippedNodes for the subtree about to be orphaned so scheduled visitor re-entries
    // short-circuit. for-init+SE preserves the init (under a sink id), so its inner
    // Identifier visits (`globalThis` inside `(se(), globalThis)`) still need to fire for
    // substitution - restrict the skip to the pattern (id) in that case. NOT calling
    // scope.registerDeclaration on new bindings: it trips "Duplicate declaration" when the
    // enclosing scope.crawl() later re-scans
    if (patternEmpties) {
      t.traverseFast(forInitSE ? declarator.node.id : declarator.node,
        node => { skippedNodes.add(node); });
    }
    // for-init+SE full consume: convert the orphan declarator to an SE-sink
    if (forInitSE && patternEmpties) {
      for (const item of extracted) noteExtractionSource(item, extractionPropOf.get(item), declarator.parentPath);
      convertForInitSESink(declarator, forInitSE, extracted);
      return !!prop && planConsumedProp(prop);
    }
    // multi-decl FULL consume splits the declaration around the consumed slot so sibling
    // evaluation order survives (pre-sibling inits with inline SEs must run BEFORE the lifted
    // SE); the split takes the no-SE case too - it just contributes an empty prefix. a PARTIAL
    // consume falls through to the statement lift below
    if (trySplitAroundConsumedDeclarator({
      declaration, declarator, extractedDeclarators: extracted, willRemoveDeclarator: patternEmpties, declCount, isForInit,
      between: liftedSetup,
    })) return !!prop && planConsumedProp(prop);
    // declarator-level insert in for-init keeps loop-header shape; declaration-level insert
    // would wrap for-init in an arrow-IIFE. lift the receiver SE (descending a transparent
    // array wrapper that hides it one ArrayExpression level down) for both partial and full
    // consume - the residual / replacement must not re-run the prefix. an ANCHORED residual
    // owns its SE: the rebuild already replayed it INSIDE the new init, and lifting that
    // sequence to the declaration would hoist the effect above pre-sibling declarator inits
    // (reordering vs the native left-to-right evaluation)
    if (!isForInit && (!plan.anchor || patternEmpties)) {
      liftDeclaratorInitSE(t, declarator.node, declaration,
        { wrapperDies: patternEmpties, between: liftedSetup, collapse: expr => collapseLiftedStore(expr, declaration) });
    }
    const moved = reanchorBlockWrappedDeclaration(declaration, declarator.node);
    if (moved) ({ declaration, declarator } = moved);
    // host wrapped in `export const { ... } = X` - every emitted statement re-exports its
    // bindings. for-init can't host export statements (loop header)
    const declIsExport = !isForInit && declaration.parentPath?.isExportNamedDeclaration();
    if (patternEmpties && declCount === 1 && !isForInit) {
      // single-declarator full consume: replace the declaration with the extraction
      // statements (replaceWith preserves leading comments on the single-statement shape)
      const stmts = extracted.map(d => wrapAsExportIf(t.variableDeclaration(declaration.node.kind, [d]), declIsExport));
      const target = declIsExport ? declaration.parentPath : declaration;
      if (stmts.length === 1) target.replaceWith(stmts[0]);
      else target.replaceWithMultiple(stmts);
      return !!prop && planConsumedProp(prop);
    }
    // multi-decl / for-init: declarator-level insert keeps the extractions AT THEIR SOURCE
    // SLOT relative to sibling declarators (a declaration-level insertBefore hoisted them
    // above pre-siblings - a reorder observable when pre-sibling inits carry effects; the
    // loop header forbids statement inserts outright); the post-traverse split drain renders
    // the statement-per-declarator canon and re-applies the export wrap. a single-declarator
    // host keeps the statement-level insert so later same-declaration emissions (an instance
    // residual-extract) anchor after it in dispatch order
    if (extracted.length) {
      if (isForInit || declCount > 1) {
        for (const item of extracted) noteExtractionSource(item, extractionPropOf.get(item) ?? prop?.node, declaration);
        insertHostDeclarator(declarator, extracted);
      } else {
        const newDecls = extracted.map(d => wrapAsExportIf(t.variableDeclaration(declaration.node.kind, [d]), declIsExport));
        // `insertBefore` is the one insertion here that does NOT carry the declaration's leading
        // comments over - `replaceWith` / `replaceWithMultiple` inherit them on their own, which is
        // why the sibling split paths need nothing
        const lead = declaration.node.leadingComments;
        if (lead?.length) {
          newDecls[0].leadingComments = lead;
          declaration.node.leadingComments = null;
        }
        recordHostInsert(declaration.node,
          (declIsExport ? declaration.parentPath : declaration).insertBefore(newDecls)[0]);
      }
    }
    if (patternEmpties) {
      // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
      // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
      const idx = declaration.node.declarations.indexOf(declarator.node);
      if (idx !== -1) declaration.node.declarations.splice(idx, 1);
    }
    // a surviving multi-declarator host (partial consume / preserved siblings) joins the
    // post-traverse split drain like the flat executor's hosts - the statement-per-declarator
    // canon applies to plan-rendered declarations too
    if (!isForInit && declaration.node?.declarations?.length > 1) flatTouchedMultiDecls.add(declaration);
    return !!prop && planConsumedProp(prop);
  }

  // after extracting a destructured property, if the pattern is now empty
  // (all properties polyfilled, no rest), skip the init node to prevent unused
  // constructor import (e.g., _Promise from { resolve } = Promise)
  function skipEmptyPatternInit(path) {
    const objectPattern = path.parentPath;
    if (objectPattern?.node?.properties?.length > 0) return;
    const parent = objectPattern.parentPath;
    const initNode = parent?.isVariableDeclarator() ? parent.node.init
      : parent?.isAssignmentExpression() ? parent.node.right : null;
    if (initNode) skippedNodes.add(initNode);
  }

  // multi-element ArrayPattern wrapping the consumed ObjectPattern (`const [, { from }] = [Set, Array]`,
  // or nested `const [{ Array: { from } }, other] = [globalThis, {...}]`): the cascade flatten bails
  // because dropping the whole declarator would lose the sibling / hole bindings. extract the static
  // into a `const <local> = _Polyfill` before the host and rename the consumed key to `_unused` in
  // place, leaving the residual array destructure (siblings, holes, init array) intact so every other
  // target keeps binding - "polyfill always wins" without disturbing them. static keys only: an
  // instance method needs a concrete receiver the residual array slot can't supply here
  function tryExtractArrayWrappedStatic({ prop, entry, hintName, kind }) {
    const plan = planArrayWrappedStaticExtract({
      propNode: prop.node, parentPath: prop.parentPath, scope: prop.scope, adapter, kind,
    });
    if (!plan) return false;
    const { localId, declaration, isExport, declarationKind } = plan;
    injector.registerBodyExtractAlias(localId.name, entry, prop.scope.getBinding(localId.name));
    const id = injectPureImport(entry, hintName);
    // the leaf's own default keeps its guard, the flat twin's shape (dead text: the pure is always defined)
    const value = prop.node.value.type === 'AssignmentPattern'
      ? estreeToBabel(renderStaticDefaultGuard({
        read: hostSlot(t.cloneNode(id)), defaultValue: hostSlot(t.cloneNode(prop.node.value.right)), reread: hostSlot(t.cloneNode(id)),
      }))
      : t.cloneNode(id);
    const extracted = t.variableDeclaration(declarationKind, [t.variableDeclarator(t.cloneNode(localId), value)]);
    const anchor = isExport ? declaration.parentPath : declaration;
    // the residual keeps the wrapper literal, and the source ran the receiver's sequence prefix
    // before the pattern bound anything - it lifts ahead of this extraction like every other host's,
    // descending a sole wrapper to the element that carries it (`[(eff(), globalThis)]` lifts `eff`
    // and leaves `[_globalThis]` behind, the shape every partial consume prints)
    const wrappedDeclarator = prop.findParent(pp => pp.isVariableDeclarator())?.node ?? null;
    if (wrappedDeclarator && statementListOf(anchor.parentPath?.node)) liftDeclaratorInitSE(t, wrappedDeclarator, anchor);
    // beside SIBLING declarators the extraction is appended as a declarator right after its residual
    // - the sibling-declarator canon (`const lead = eff(), [{ Set: _unused }, y] = [_globalThis, 2],
    // s = _Set, tail = 1;`, exported with its host); a sole declarator (or a loop head) keeps the
    // statement ahead
    const siblingHost = declaration.node.declarations.length > 1
      && !isForInitDeclaration(declaration.parentPath?.node, declaration.node) && wrappedDeclarator;
    const hostDeclaratorPath = siblingHost ? prop.findParent(pp => pp.isVariableDeclarator()) : null;
    const [extractedPath] = hostDeclaratorPath
      ? hostDeclaratorPath.insertAfter(t.variableDeclarator(t.cloneNode(localId), value))
      : anchor.insertBefore(isExport ? t.exportNamedDeclaration(extracted, []) : extracted);
    if (hostDeclaratorPath) attachToPrevDeclarator.add(extractedPath.node);
    // the element's OTHER props are planned BEFORE the consumed key retires - by either exit below:
    // the plan anchors only beside a claim it can see consumed
    anchorWrappedElementSiblings(prop, anchor, extractedPath);
    // rename the consumed key to `_unused`: the residual array destructure keeps its shape
    // (siblings / holes / the init array survive) and the new `const <local>` shadows it
    // ... unless the key sits UNDER a hop naming a MISSING-ABLE ctor: the sentinel would read that
    // ctor off the realm (`_globalThis.Iterator.from`), which throws where the ctor is absent, so the
    // leaf leaves with its emptied hop levels and the element keeps a `{}` husk, shed by the shared
    // trailing-shed canon where the lowering would miscompile it (the other leg's drop)
    // the claimed leaf LEAVES where a hop names a ctor the targets may lack (its sentinel would read
    // that ctor), and where the element still binds something ELSE: the residual lives on that
    // binding, and the sentinel beside it re-reads a key the extraction already spells. an element
    // the claim EMPTIES keeps its sentinel - that read is what holds the level up
    if (hopChainNamesMissingAbleCtor(prop) || wrappedElementBindsBeside(prop)) {
      skippedNodes.add(prop.node);
      let pattern = prop.parentPath;
      pattern.node.properties = pattern.node.properties.filter(item => item !== prop.node);
      while (!pattern.node.properties.length && pattern.parentPath?.isObjectProperty()
        && pattern.parentPath.parentPath?.isObjectPattern()) {
        const hop = pattern.parentPath;
        pattern = hop.parentPath;
        pattern.node.properties = pattern.node.properties.filter(item => item !== hop.node);
      }
      const arrayPattern = pattern.parentPath?.isArrayPattern() ? pattern.parentPath.node : null;
      const shed = arrayPattern ? arrayWrapperResidualTrailingShed(arrayPattern, new Set([pattern.node])) : 0;
      if (shed && shed < arrayPattern.elements.length) arrayPattern.elements.length -= shed;
      return true;
    }
    prop.get('value').replaceWith(generateUnusedId());
    prop.node.shorthand = false;
    skippedNodes.add(prop.node);
    return true;
  }

  // does the element hold a binding BESIDE this claim - a prop of its own, at any depth, that is not
  // this leaf and not one of its hops? a REST is the exception: it gathers what the pattern did not
  // name, so the claimed key has to STAY, spelled by a sentinel, to go on excluding itself
  function wrappedElementBindsBeside(prop) {
    let level = prop.parentPath;
    let inner = prop.node;
    while (level?.isObjectPattern()) {
      if (level.node.properties.some(isRestProperty)) return false;
      if (level.node.properties.some(item => item !== inner)) return true;
      const hop = level.parentPath;
      if (!hop?.isObjectProperty()) return false;
      inner = hop.node;
      level = hop.parentPath;
    }
    return false;
  }

  // the OTHER props of a multi-wrapper element the static left behind: a hop naming a MISSING-ABLE
  // ctor with verbatim leaves under it re-anchors on the pure ctor as a declarator of its own, the way
  // the flatten anchors it on a sole wrapper (`[{ AggregateError: { customZ }, ... }, zn]` ->
  // `const { customZ } = _AggregateError;`) - the native residual would read the ctor the stripped
  // realm lacks. the element is planned like a sole wrapper's, and the plan's own anchor decides
  function anchorWrappedElementSiblings(prop, anchor, extractedPath) {
    let element = prop.parentPath;
    while (element?.isObjectPattern() && element.parentPath?.isObjectProperty()) element = element.parentPath.parentPath;
    const arrayPattern = element?.isObjectPattern() ? element.parentPath : null;
    if (!arrayPattern?.isArrayPattern()) return;
    const declarator = arrayPattern.parentPath;
    if (!declarator?.isVariableDeclarator()) return;
    // the plan is asked only where the element holds what it could anchor - a hop naming a
    // missing-able ctor with a pattern under it - since planning claims the element's other leaves
    const claimHops = new Set();
    for (let hop = prop.parentPath; hop?.isObjectPattern() && hop.parentPath?.isObjectProperty(); hop = hop.parentPath.parentPath) {
      claimHops.add(hop.parentPath.node);
    }
    const candidate = element.node.properties.some(item => !claimHops.has(item) && item.value?.type === 'ObjectPattern'
      && hopNamesMissingAbleCtor(item, name => resolvePure({ kind: 'global', name })));
    if (!candidate) return;
    const init = unwrapRuntimeExpr(declarator.node.init);
    const index = arrayPattern.node.elements.indexOf(element.node);
    const slot = init?.type === 'ArrayExpression' ? pairedArrayWrapInitElement(init.elements, index) : null;
    if (!slot) return;
    const plan = buildFlattenPlan({ declaratorNode: { id: element.node, init: slot }, scope: prop.scope, path: declarator });
    const anchored = plan?.outerProps.filter(outer => outer.kind === 'anchored') ?? [];
    if (!anchored.length) return;
    // each anchored declarator lands where its hop stood: ahead of the extraction for a hop the source
    // wrote before the claim's, behind it otherwise
    const claimAt = element.node.properties.findIndex(item => claimHops.has(item) || item === prop.node);
    for (const outer of anchored) {
      const { pattern, binding } = anchoredResidualNodes(outer, prop.scope);
      const declaration = t.variableDeclaration(declarator.parentPath.node.kind, [t.variableDeclarator(pattern, binding)]);
      t.traverseFast(declaration, node => { skippedNodes.add(node); });
      (element.node.properties.indexOf(outer.prop) < claimAt ? extractedPath : anchor).insertBefore(declaration);
      t.traverseFast(outer.prop, node => { skippedNodes.add(node); });
      element.node.properties = element.node.properties.filter(item => item !== outer.prop);
    }
    const shed = arrayWrapperResidualTrailingShed(arrayPattern.node, new Set([element.node]));
    if (shed && shed < arrayPattern.node.elements.length) arrayPattern.node.elements.length -= shed;
  }

  // does a hop between the claimed prop and its array element name a ctor the targets may lack? the
  // core's per-hop question, walked up this leg's paths
  function hopChainNamesMissingAbleCtor(prop) {
    for (let pattern = prop.parentPath; pattern?.isObjectPattern() && pattern.parentPath?.isObjectProperty();
      pattern = pattern.parentPath.parentPath) {
      if (hopNamesMissingAbleCtor(pattern.parentPath.node, name => resolvePure({ kind: 'global', name }))) return true;
    }
    return false;
  }

  // a receiver-less static under a MULTI-element wrapper of an assignment statement: the cascade
  // never descends a multi-element wrapper, and a mirror literal in the element's place would
  // replace a value the OTHER slots still read - a kept write's store above all - so the raw
  // destructure stays, the element evaluates in it once, and the binding takes the ponyfill right
  // after (`[{ Map: { groupBy: g } }, zn] = [kw = (eff(), globalThis), 7]; g = _Map$groupBy;`)
  function tryStaticOverwriteUnderMultiWrapper({ prop, entry, hintName }) {
    const bindingId = propBindingIdentifier(prop.node.value);
    if (!bindingId) return false;
    let pattern = prop.parentPath;
    let topProp = prop.node;
    while (pattern?.isObjectPattern() && pattern.parentPath?.isObjectProperty()) {
      topProp = pattern.parentPath.node;
      pattern = pattern.parentPath.parentPath;
    }
    const arrayPattern = pattern?.isObjectPattern() ? pattern.parentPath : null;
    if (!arrayPattern?.isArrayPattern() || arrayPattern.node.elements.length < 2) return false;
    const assign = arrayPattern.parentPath;
    if (!assign?.isAssignmentExpression() || assign.node.left !== arrayPattern.node || assign.node.operator !== '=') return false;
    const rawStatement = nestedAssignmentStatementOf(prop);
    if (!rawStatement?.node) return false;
    const index = arrayPattern.node.elements.indexOf(pattern.node);
    const right = unwrapRuntimeExpr(assign.node.right);
    const element = right?.type === 'ArrayExpression' ? pairedArrayWrapInitElement(right.elements, index) : null;
    if (!element) return false;
    // ... and only where every SIBLING can READ the raw destructure it leaves standing: a sibling hop
    // naming a ctor the targets may lack has to re-anchor on the pure instead (`{ AggregateError:
    // { customZ } }` off a realm without it), and that rebuild belongs to the routes owning the whole
    // pattern. the claim's OWN hop is no obstacle - the overwrite is what serves it
    if (pattern.node.properties.some(item => item !== topProp && hopNamesMissingAbleCtor(item, resolveGlobalPure))) {
      return false;
    }
    // a bodyless control slot braces first, the way every overwrite host does: the raw destructure
    // and its overwrite stay one conditional body (`if (c) { [...] = [...]; g = _g; }`)
    const statement = statementListOf(rawStatement.parentPath?.node) ? rawStatement : ensureExprStmtInBlock(rawStatement);
    const writeStmt = buildPolyfillAssignmentStatement(bindingId, injectPureImport(entry, hintName), assign.node);
    const prevWrite = nestedOverwriteLastInsert.get(statement.node);
    nestedOverwriteLastInsert.set(statement.node, (prevWrite ?? statement).insertAfter(writeStmt)[0]);
    skippedNodes.add(prop.node);
    if (prop.node.value) skippedNodes.add(prop.node.value);
    return true;
  }

  // memoize a constant-literal receiver into a `_ref` so the surviving residual doesn't keep a
  // duplicate of the (possibly large) literal beside the extract. the SWAP below is the dedup: the
  // literal leaves the residual in this same call, so a sibling leaf resolves `_ref` and never
  // reaches here with the same node (the other leg memoizes by node - its drain renders once per
  // receiver node, after the walk).
  // constant-only, so re-crawling the hoisted clone is inert
  function memoizeSeKeyReceiver({ prop, plan, residualDecl, objectNode }) {
    const ref = generateLocalRef(residualDecl.scope);
    const memoDeclarator = t.variableDeclarator(t.cloneNode(ref), t.cloneNode(objectNode));
    if (plan.siblingDeclarator) {
      // sibling host (multi-declarator / for-init): the memo joins the declaration as a PRECEDING
      // declarator at the source slot - a statement insert would hoist the receiver read above
      // earlier sibling inits (an observable getter reorder) or has no slot in a for-head
      const declaratorPath = prop.findParent(pp => pp.isVariableDeclarator());
      memoDeclarators.add(memoDeclarator);
      declaratorPath.insertBefore(memoDeclarator);
    } else residualDecl.insertBefore(t.variableDeclaration(residualDecl.node.kind, [memoDeclarator]));
    // bodyless host: the hoist wrapped the body in a block; re-point to the residual (block's last statement)
    if (residualDecl.isBlockStatement()) residualDecl = residualDecl.get('body').at(-1);
    // swap the receiver in the surviving residual for `_ref`, located by identity in the declaration
    let receiverPath = null;
    residualDecl.traverse({
      enter(p) {
        if (p.node !== objectNode) return;
        receiverPath = p;
        p.stop();
      },
    });
    if (receiverPath) receiverPath.replaceWith(t.cloneNode(ref));
    return { residualDecl, receiverArg: ref };
  }

  // does the prop's DIRECT object-pattern host (a declarator's own pattern, no rest) spell several
  // keys with effects? the consumed ones already wear their sentinel, so the count holds all along
  function severalSeKeyProps(prop) {
    const objectPattern = prop.parentPath;
    if (!objectPattern?.isObjectPattern() || !objectPattern.parentPath?.isVariableDeclarator()
      || objectPattern.parentPath.node.id !== objectPattern.node) return false;
    // a SEGMENT the split already cut goes on splitting behind its own key: the interleave holds
    // for every key of the source pattern, whichever segment now carries it
    return patternHasSeveralSeKeys(objectPattern.node, attachToPrevDeclarator.has(objectPattern.parentPath.node) ? 1 : 2);
  }

  // native evaluates a destructure PER PROP (key, read, default, next key), so a guarded
  // LIVE default must run BEFORE the following props' key effects. split the residual at the
  // defaulted prop: the props after it move into a NEW destructure declarator (same init)
  // emitted AFTER the guard, restoring the interleave. gated to a DIRECT object-pattern host
  // without rest (rest gathers by exclusion of its own pattern's keys, so moving props out
  // would change what rest collects - those stay batched, a documented boundary)
  function splitResidualAfterDefaultProp({ prop, guardPath }) {
    const objectPattern = prop.parentPath;
    if (!objectPattern.isObjectPattern()) return;
    const hostDeclarator = objectPattern.parentPath;
    if (!hostDeclarator.isVariableDeclarator() || hostDeclarator.node.id !== objectPattern.node) return;
    const props = objectPattern.node.properties;
    const idx = props.indexOf(prop.node);
    if (idx === -1 || idx === props.length - 1) return;
    if (props.some(pr => isRestProperty(pr))) return;
    const moved = props.splice(idx + 1);
    const segment = t.variableDeclarator(t.objectPattern(moved), t.cloneNode(hostDeclarator.node.init));
    if (guardPath?.isVariableDeclaration?.()) {
      // catch-born: the guard is a standalone `let` after the residual - the segment follows
      // as its own `let { ... } = _ref;` (the moved props' paths requeue and re-visit there).
      // it INHERITS the catch-born mark so a later defaulted prop inside it keeps the
      // catch-canon fold (`let _refN, x = ...`) instead of a hoisted `var _refN;`
      const segmentDeclaration = t.variableDeclaration(guardPath.node.kind, [segment]);
      catchBornDeclarations.add(segmentDeclaration);
      const [inserted] = guardPath.insertAfter(segmentDeclaration);
      return inserted;
    }
    attachToPrevDeclarator.add(segment);
    const [inserted] = guardPath.insertAfter(segment);
    seKeyTrailingAnchors.set(hostDeclarator.node, inserted);
    return inserted;
  }

  // the array-wrapper slot this prop sits in, asked against its own declarator's literal init:
  // null host / non-literal init pins nothing
  // the array-wrapper slot's index within its declarator, or -1 when this prop is not in one
  // the array-wrapping declarator this prop sits in - resolved by PARENT WALK, so a declaration
  // sharing the slot with sibling declarators answers for the prop's own wrapper, not for the first one
  function arrayWrapperHostDeclarator(prop, declaration) {
    const declarator = prop.findParent(pp => pp.isVariableDeclarator())?.node;
    if (!declaration?.node?.declarations?.includes(declarator)) return null;
    // a wrapper may sit under a KEY (`{ pair: [{ at }] } = { pair: [arr] }`), so the host is any
    // pattern over a literal - which STEPS reach the slot is the level walk's answer, not this one's
    const literalInit = declarator.init?.type === 'ArrayExpression' || declarator.init?.type === 'ObjectExpression';
    return literalInit && (declarator.id?.type === 'ArrayPattern' || declarator.id?.type === 'ObjectPattern')
      ? declarator : null;
  }

  // the wrapper LEVELS between the declarator's id and the pattern holding `prop`, outermost first,
  // each as the literal it pairs with and the slot taken in it. wrappers NEST (`[[{ y: { at } }]] =
  // [[nb]]`), and every level carries neighbours the order questions below have to see - asking only
  // the outermost read a nested literal as if it had none. null when this prop is not array-wrapped,
  // or when the init's shape does not follow the pattern's
  function arrayWrapperLevels(prop, declaration) {
    const declarator = arrayWrapperHostDeclarator(prop, declaration);
    if (!declarator) return null;
    const slots = [];
    // keys BELOW the outermost wrapper are the claim's own receiver hops, not steps into the init -
    // the descent starts where the pairing does, at the first array level
    let seenWrapper = false;
    for (let cur = prop.parentPath; cur?.node && cur.node !== declarator.id; cur = cur.parentPath) {
      const up = cur.parentPath?.node;
      if (up?.type === 'ArrayPattern') {
        const index = up.elements.indexOf(cur.node);
        if (index === -1) return null;
        slots.unshift({ index });
        seenWrapper = true;
        continue;
      }
      if (seenWrapper && (up?.type === 'ObjectProperty' || up?.type === 'Property') && up.value === cur.node) {
        // through the consuming canon: a bound computed key names the slot its fold spells
        const key = consumableHopSlotName(up, { scope: cur.parentPath.scope, adapter, path: cur.parentPath });
        if (typeof key !== 'string') return null;
        slots.unshift({ key });
      }
    }
    if (!seenWrapper) return null;
    const levels = [];
    let literal = declarator.init;
    for (const step of slots) {
      if (step.key === undefined) {
        if (literal?.type !== 'ArrayExpression') return null;
        levels.push({ literal, index: step.index });
        literal = literal.elements[step.index];
        continue;
      }
      if (literal?.type !== 'ObjectExpression') return null;
      const at = literal.properties.findIndex(item => (item.type === 'ObjectProperty' || item.type === 'Property')
        && propertyKeyName(item) === step.key);
      if (at === -1 || literal.properties.some(item => item.type === 'SpreadElement')) return null;
      levels.push({ literal, key: step.key, propIndex: at });
      literal = literal.properties[at].value;
    }
    return { levels, element: literal };
  }

  // what a level evaluates AFTER the slot it pairs with - the neighbours a moved read would step over
  function wrapperLevelTail({ literal, index, key, propIndex }) {
    return key === undefined
      ? literal.elements.slice(index + 1)
      : literal.properties.slice(propIndex + 1).map(item => item.value);
  }

  // the effects the slots BEFORE this claim's carry, taken out of the literal as the caller lifts
  // them: what stays in their place is an elision, which is what the pattern's own hole reads
  function arrayWrapperLeadingEffects(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    const [{ literal }] = wrapper.levels;
    const declarator = arrayWrapperHostDeclarator(prop, declaration);
    const lifted = [];
    for (const at of leadingDiscardedEffectSlots(literal, declarator?.id)) {
      lifted.push(literal.elements[at]);
      literal.elements[at] = null;
    }
    return lifted;
  }

  // ... and BEFORE it, which is what a hoist has to leave untouched
  function wrapperLevelHead({ literal, index, key, propIndex }) {
    return key === undefined
      ? literal.elements.slice(0, index)
      : literal.properties.slice(0, propIndex).map(item => item.value);
  }

  // the OUTERMOST slot - what a caller spelling the declarator's own init INDEXES by, so a keyed
  // outermost level has no answer here and its callers fall to the whole-init questions
  function arrayWrapperSlotIndex(prop, declaration) {
    return arrayWrapperLevels(prop, declaration)?.levels[0].index ?? -1;
  }

  // every level's OTHER elements as one node the purity test can read, or null when this prop
  // is not in an array wrapper
  function arrayWrapperOtherElements(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    if (!wrapper) return null;
    return t.arrayExpression(wrapper.levels
      .flatMap(level => [...wrapperLevelHead(level), ...wrapperLevelTail(level)]));
  }

  // the patterns whose leaves already answered the type question, asked once per host
  const primedPatterns = new WeakSet();

  function primeDestructureReceiverTypes(prop) {
    const host = prop.findParent(pp => pp.isVariableDeclarator() || pp.isAssignmentExpression());
    const pattern = host?.isVariableDeclarator?.() ? host.get('id') : host?.get?.('left');
    if (!pattern?.node || primedPatterns.has(pattern.node)) return;
    primedPatterns.add(pattern.node);
    pattern.traverse({
      ObjectProperty(leaf) {
        if (t.isObjectPattern(leaf.node.value) || t.isArrayPattern(leaf.node.value)) return;
        resolvePropertyObjectType(leaf);
      },
    });
  }

  // the levels whose hole effects this pass already lifted, so a second prop of the same wrapper
  // asks nothing again
  const liftedHoleLevels = new WeakSet();

  function liftWrapperHoleEffects(prop) {
    const declaration = prop.findParent(pp => pp.isVariableDeclaration());
    if (!declaration?.node || liftedHoleLevels.has(declaration.node)) return;
    const host = declaration.parentPath?.isExportNamedDeclaration() ? declaration.parentPath : declaration;
    if (!statementListOf(host.parentPath?.node)
      || isForInitDeclaration(declaration.parentPath?.node, declaration.node)) return;
    // a level whose other slots still BIND lifts the same way: the discarded slots ahead of the
    // claim leave as statements, and the memo the survivors share hoists behind them in source
    // order (`[, { at }, z] = [eff(), eff(), 1]` - the flat channel's shape on both legs)
    const holesBeside = arrayWrapperHolesBeside(prop, declaration);
    if (!holesBeside && !arrayWrapperDiscardedAhead(prop, declaration)) return;
    // ... and only where a receiver the claim can SPELL comes out of the level: one that resolves to
    // nothing leaves the pattern native (an OPAQUE element under hops is the wrapper family's own
    // gap, `nested-computed-root` in the corpus), and rewriting the literal around a claim that
    // never lands would move effects for nothing
    // ... or one the dispatch CARRIES whole (`{ y: (log.push("c"), arr) }`): the wrapper dies with the
    // claim, so the slot's own prefix rides the dispatch and the neighbours ahead of it lift here
    const nested = prop.parentPath.parentPath?.isObjectProperty?.();
    if (nested && !resolveNestedReceiverNode(prop, { allowNavSegments: true, adapter })
      && !resolveNestedReceiverNode(prop, { allowSeFreeSingleRead: true, adapter })
      && !resolveNestedReceiverNode(prop, { allowInitCarriedEffects: true, adapter })) return;
    const effects = arrayWrapperLeadingEffects(prop, declaration);
    if (!effects.length) return;
    liftedHoleLevels.add(declaration.node);
    for (const expr of effects) host.insertBefore(t.expressionStatement(collapseLiftedStore(expr, prop)));
    if (!holesBeside) return;
    // ... and the claimed element's own prefix goes with them: a dispatch could hold it, but the
    // neighbours it now stands behind are statements, and one shape reads better than two
    const wrapper = arrayWrapperLevels(prop, declaration);
    const [{ literal, index }] = wrapper.levels;
    const element = unwrapRuntimeExpr(literal.elements[index]);
    if (element?.type === 'SequenceExpression') {
      for (const expr of element.expressions.slice(0, -1)) {
        host.insertBefore(t.expressionStatement(collapseLiftedStore(expr, prop)));
      }
      literal.elements[index] = element.expressions.at(-1);
    }
    // the level binds through this claim alone, so once the claims consume it the husk leaves
    const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
    if (hostDeclarator) emptiedWrapperHosts.set(hostDeclarator.node, declaration);
  }

  // does a slot the pattern discards carry an effect AHEAD of this claim's - one the lift takes out?
  function arrayWrapperDiscardedAhead(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    if (!wrapper || wrapper.levels.length !== 1 || wrapper.levels[0].key !== undefined) return false;
    const declarator = arrayWrapperHostDeclarator(prop, declaration);
    return leadingDiscardedEffectSlots(wrapper.levels[0].literal, declarator?.id).length > 0;
  }

  // does every OTHER slot of the wrapper bind NOTHING - a hole, or a pattern this claim empties?
  // such a level survives only for the effects its elements carry, so those lift as statements in
  // source order and the level goes with them (`[, { Array: { prototype: { flat } } }] = [eff(), R]`)
  function arrayWrapperHolesBeside(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    if (!wrapper || wrapper.levels.length !== 1) return false;
    const [{ literal, index, key }] = wrapper.levels;
    if (key !== undefined) return false;
    const declarator = arrayWrapperHostDeclarator(prop, declaration);
    const pattern = declarator?.id;
    if (pattern?.type !== 'ArrayPattern' || pattern.elements.some(item => item?.type === 'RestElement')) return false;
    if (literal.elements.some(item => item?.type === 'SpreadElement')) return false;
    return pattern.elements.every((item, at) => at === index || item === null);
  }

  // hoisting the element's memo ahead of the declaration keeps SOURCE order exactly when every
  // element BEFORE this slot is pure - native evaluates them left to right before reading
  function arrayWrapperHoistKeepsOrder(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    return !!wrapper && wrapper.levels
      .every(level => wrapperLevelHead(level).every(item => !mayHaveSideEffects(item)));
  }

  function arrayWrapperNeighbourEffectAt(prop, declaration) {
    const wrapper = arrayWrapperLevels(prop, declaration);
    if (!wrapper) return false;
    // a HEAD effect the lift takes with it pins nothing - the shared predicate owns that question,
    // asked of the level's own literal and the pattern reading it
    const declarator = arrayWrapperHostDeclarator(prop, declaration);
    return wrapper.levels.some((level, at) => wrapperLevelTail(level).some(mayHaveSideEffects)
      || (level.key === undefined && at === 0
        ? arrayWrapperNeighbourEffect(level.literal, level.index, declarator?.id)
        : wrapperLevelHead(level).some(mayHaveSideEffects)));
  }

  // the extraction lands AHEAD of the residual, and the receiver's sequence prefix has to land
  // ahead of BOTH: the source ran it before the pattern bound anything, and the residual keeping it
  // lets the effect read the binding this extraction just wrote. a MULTI-declarator host cannot
  // take the pair above its pre-siblings, so it splits at the slot and the two land inside that split
  function insertExtractionAheadOfResidual({
    residualDecl, anchor, node, isExport, declaratorNode, extractedDeclarators,
  }) {
    const decls = residualDecl.node?.declarations;
    const idx = declaratorNode && Array.isArray(decls) ? decls.indexOf(declaratorNode) : -1;
    // only an EFFECTFUL pre-sibling forces the split: the pair may not hoist over an init the source
    // runs first. quiet ones (this pipeline's own extractions among them) are free to follow it
    const pinnedBySibling = idx > 0 && decls.slice(0, idx).some(declarator => mayHaveSideEffects(declarator.init));
    if (pinnedBySibling && !isExport && !isForInitDeclaration(residualDecl.parentPath?.node, residualDecl.node)
      && statementListOf(residualDecl.parentPath?.node)) {
      const { prefix, tail } = peelNestedSequenceExpressions(declaratorNode.init);
      const lifted = prefix.length ? liftedPrefixExpression(t, prefix) : null;
      if (prefix.length) declaratorNode.init = tail;
      splitDeclarationAtSlot({
        declaration: residualDecl, idx, keepSlot: true,
        sePrefix: lifted ? [lifted] : [],
        extractedDeclarators,
      });
      return;
    }
    // a bodyless control slot is braced first, so the lift has a list to land in and the effect
    // stays conditional - the brace the plain declaration route performs for the same reason
    const host = statementListOf(anchor.parentPath?.node) ? anchor : ensureExprStmtInBlock(anchor);
    liftSurvivingResidualPrefix(t, declaratorNode, 'init', host);
    host.insertBefore(node);
  }

  // keep a destructure key IN the residual pattern (its value renamed to `_unused`) and extract the
  // polyfill into a preceding `const <local> = ...`. used for a side-effecting computed key (the effect
  // runs once, in source order, in the kept key) AND for a nested INSTANCE method (the polyfill
  // `_m(receiver)` needs the receiver, which the residual preserves). leaves the residual destructure
  // (siblings + receiver) intact - "polyfill always wins" without reordering effects. mirrors
  // `tryExtractArrayWrappedStatic`. returns false when it can't safely extract (no binding name, or an
  // instance receiver that isn't a bare Identifier -> would double-evaluate, since the residual reads it
  // too); the caller then leaves it native
  // eslint-disable-next-line max-statements -- sequential residual-shaping steps
  function keepKeyInResidual({ prop, kind, entry, hintName, declaration, plan, objectNode, typedNav = false,
    sourceSiblingHost = plan.siblingDeclarator }) {
    // a MULTI-declarator host whose claimed declarator is consumed WHOLE joins the post-traverse
    // split like every other route: the memo and the extraction this function plants would otherwise
    // stay welded to the source's siblings in one declaration, where the other leg prints a statement
    // per binding (`const [{ at: m }] = [arr.flat()], zTail = 1`)
    // ... but a residual that SURVIVES as a sentinel keeps the comma join: the memo, that residual and
    // the extraction are one group on both legs there, and only a declarator consumed WHOLE splits
    // ... where the residual SURVIVES, the join is the slot memo's: the memo ahead, then one
    // declaration - residual, extraction, trailing siblings (the split reads the pattern it finds)
    if (declaration.node?.declarations?.length > 1 && plan.memoizeReceiver) {
      noteSlotMemoHost(declaration, prop.findParent(pp => pp.isVariableDeclarator())?.node);
    }
    // an ARRAY-WRAPPED host whose literal carries an effect-bearing NEIGHBOUR pins the order:
    // native evaluates every element before reading a property off one of them, and the plain
    // route hoists the reading extraction AHEAD of the declaration. the extraction lands after
    // the residual instead - the shared predicate answers for both legs, and a receiver-LESS
    // static neither reads nor reorders, so only this route asks
    const extractAfterResidual = kind === 'instance'
      && (arrayWrapperNeighbourEffectAt(prop, declaration) || (!!objectNode && inSlotMemoRefs.has(objectNode)));
    const valueNode = propBindingIdentifier(prop.node.value);
    // a pattern-valued `[Symbol.iterator]` prop consumes like the identifier form, destructuring
    // the helper RESULT (`{ next } = _getIteratorMethod(recv)`): value-correct on modern engines
    // (the helper returns the same method a raw read yields) and polyfill-visible where a raw
    // `recv[_Symbol$iterator]` read misses native iterators. get-iterator-method ONLY (a
    // Maybe-dispatch helper returns a dispatcher, not the native method). every memoize arm is
    // pattern-compatible (the memo reads the receiver ONCE into `_ref`; extraction and residual
    // both read the ref), so only SOURCE-level sibling-declarator hosts keep the key-swap bail -
    // parity with the unplugin emitter, whose drain covers the memo and duplicate paths but
    // not the visit-time sibling emit. a memo-created sibling is fine: the trailing
    // branch hosts a pattern declarator like any binding
    const patternValue = !valueNode && entry === SYMBOL_ITERATOR_PURE_RESULT.entry
      && isSymbolIteratorPatternProp(prop.node)
      && !sourceSiblingHost ? prop.node.value : null;
    if (!valueNode && !patternValue) return false;
    // the deep clone is fresh (not skip-seeded), so its inner polyfillables (a default's
    // instance call) are re-visited on insertion and rewritten like any source pattern.
    // its PROPERTY nodes are claimed, though: the re-visit must not re-enter the destructure
    // pipeline on the extracted pattern (`{ name } = _getIteratorMethod(x)` would re-extract
    // `name` through the whole-init memo, diverging from the unplugin emitter's rendered copy) -
    // value subtrees stay live, so defaults keep polyfilling
    // the SAME question the plan asks for a proxy receiver, asked here for the receivers the plan
    // never sees (`= Array` / a plain object reach the synth through this route). one helper, so the
    // two producers cannot drift apart on it
    const instanceLeaf = patternValue && entry === SYMBOL_ITERATOR_PURE_RESULT.entry
      ? symbolIteratorInstanceLeaf({ value: patternValue, resolvePure, isDisabled: null, keyNameOf: propertyKeyName })
      : null;
    function bindingLhs() {
      if (instanceLeaf) return t.identifier(instanceLeaf.localName);
      return patternValue ? clonePatternClaimed(patternValue) : t.cloneNode(valueNode);
    }

    // an `insertBefore` below auto-wraps a bodyless control body (`if (c) var {...}=R`) in a block and
    // re-points THIS path at the wrapping block (whose `.kind` is undefined). the memoize hoist inserts
    // EARLY (before the kind read + the extract insert), so track the residual declaration separately and
    // re-resolve it after the block-conversion; the static / non-memoize path inserts last, so it is unaffected
    let residualDecl = declaration;
    let receiverArg = objectNode;
    if (plan.memoizeReceiver) ({ residualDecl, receiverArg } = memoizeSeKeyReceiver({ prop, plan, residualDecl, objectNode }));
    let polyfillValue;
    // catch-born hosts fold the default-guard test ref into the extracted `let` (block-scoped,
    // no `var` hoist) - the catch-canon shape both emitters emit; other hosts hoist `var _ref;`
    let foldedTestRef = null;
    let instanceDefaultLive = false;
    if (kind === 'instance') {
      // the polyfill `_m(receiver)` re-references the receiver (the residual reads it too). the planner
      // (`planSideEffectKeyStrategy`) already admitted only re-referenceable receivers, so clone directly -
      // no local re-check (a duplicate gate here once drifted from the planner and left a literal native)
      polyfillValue = markThrowingExtraction(t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(receiverArg)]));
      // the clone stays LIVE: the default arm is code the source runs when the dispatch answers
      // undefined, so a claim inside it is polyfilled like any other (`m = _flat(recv) === void 0
      // ? (_push(log).call(log, 'dead'), 0) : m` - the other leg's own answer)
      if (!patternValue && prop.node.value?.type === 'AssignmentPattern') {
        instanceDefaultLive = true;
        const defaultClone = t.cloneNode(prop.node.value.right);
        // ... but only where the born declaration can CARRY an initializer-less declarator: the fold
        // adds the test ref as one, and a relocated loop head keeps the source's `const`, where that
        // is a syntax error. those take the hoisted `var` the other leg emits
        const catchBorn = catchBornDeclarations.has(declaration.node) && declaration.node.kind !== 'const';
        const ref = catchBorn ? generateLocalRef(prop.scope) : generateRef(prop.scope, prop.node);
        if (catchBorn) foldedTestRef = ref;
        polyfillValue = buildInstanceDefaultGuard(t, { call: polyfillValue, defaultNode: defaultClone, ref });
      }
    } else {
      // global ctor (`{ [(eff(), 'Promise')]: P } = globalThis`): register a GLOBAL alias so member reads
      // re-polyfill (`P.allSettled` -> the pure static). ALSO registering it as a body-extract alias would
      // clobber that and leave the member read raw against the bare ctor (which lacks the static) -> a
      // TypeError on ie:11. static method (`{ [(eff(), 'from')]: from } = Array`): body-extract alias so
      // post-rewrite narrowing resolves the extracted local. both bind the local to the pure import
      // (`const P = _Promise` / `const from = _Array$from`) and keep the SE-key as a `_unused` residual
      if (kind === 'global') {
        // a refused registration (conditional `var` decl) only withholds the member-narrow hint;
        // the SE-key extraction itself stays (value-correct, and the key effect runs in place)
        registerDeclAliasIfSound({
          injector, adapter, kind: declaration.node.kind, localName: valueNode.name, hint: hintName, stmtPath: declaration,
          binding: adapter.getBinding(prop.scope, valueNode.name),
        });
      } else injector.registerBodyExtractAlias(valueNode.name, entry, prop.scope.getBinding(valueNode.name));
      const pure = injectPureImport(entry, hintName);
      // the leaf's own default keeps its guard (dead text: the pure is always defined), the array-wrapped
      // twin's shape and the other leg's
      polyfillValue = !patternValue && prop.node.value?.type === 'AssignmentPattern'
        ? estreeToBabel(renderStaticDefaultGuard({
          read: hostSlot(t.cloneNode(pure)),
          defaultValue: hostSlot(t.cloneNode(prop.node.value.right)),
          reread: hostSlot(t.cloneNode(pure)),
        }))
        : t.cloneNode(pure);
    }
    // dead residual: this leaf is the declaration's only binding and the init has no effect to preserve, so
    // the destructure binds nothing observable - replace the whole declaration with just the extracted binding
    if (plan.eliminateResidual) {
      const isExport = declaration.parentPath?.isExportNamedDeclaration();
      const declarators = [
        ...foldedTestRef ? [t.variableDeclarator(t.cloneNode(foldedTestRef))] : [],
        t.variableDeclarator(bindingLhs(), instanceLeafCall(instanceLeaf, polyfillValue)),
      ];
      const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
      // a SIBLING declarator keeps the declaration: the extraction takes the dead slot in place and
      // the split renders it as its own statement, the shape the sole-declarator host emits directly.
      // `replaceWithMultiple`, not a splice: the extracted value carries a CLONED receiver whose inner
      // globals and instance calls only substitute if the new nodes are re-queued for the traversal
      if (declaration.node.declarations.length > 1 && hostDeclarator?.node) {
        // a NESTED claim keeps the declarator NODE and rewrites it in place: replacing it detaches
        // a pattern the traversal still holds queued paths into (the hop props above this leaf),
        // and the first of them asks babel for a parent that no longer exists. the declarator
        // identity survives the rewrite, so those paths stay answerable and our own skip set
        // keeps them from re-entering. the receiver here is spelled by the extraction itself
        // (nothing to re-queue for substitution), which is what makes the in-place shape sound
        if (declarators.length === 1 && prop.parentPath?.node !== hostDeclarator.node.id) {
          const dropped = hostDeclarator.node.id;
          hostDeclarator.node.id = declarators[0].id;
          hostDeclarator.node.init = declarators[0].init;
          t.traverseFast(dropped, node => { skippedNodes.add(node); });
          flatTouchedMultiDecls.add(declaration);
          return true;
        }
        hostDeclarator.replaceWithMultiple(declarators);
        flatTouchedMultiDecls.add(declaration);
        return true;
      }
      const extracted = t.variableDeclaration(declaration.node.kind, declarators);
      (isExport ? declaration.parentPath : declaration)
        .replaceWith(isExport ? t.exportNamedDeclaration(extracted, []) : extracted);
      return true;
    }
    // SEVERAL SE keys on one pattern interleave: native runs key, read, key, read, and the dispatch
    // reads the property too - so each claim's extraction follows its own key's segment of the
    // residual, the split the live default already takes (`{ [k]: _unused } = _ref, s = _at(_ref),
    // { [k2]: _unused2 } = _ref, f = ..., { z } = _ref` - the other leg's shape)
    // ... an INSTANCE claim's interleave: a static binds its pure with no read of the receiver, and a
    // catch-born host keeps the catch canon (its guard ref folds into the relocated `let`)
    const segmented = kind === 'instance' && !foldedTestRef && !catchBornDeclarations.has(residualDecl.node)
      && severalSeKeyProps(prop);
    if (plan.siblingDeclarator || (instanceDefaultLive && !foldedTestRef) || segmented) {
      // a preceding statement is impossible (loop header) or unsafe (a multi-declarator instance receiver
      // bound earlier in the same declaration would TDZ-fault) - bind the polyfill as a trailing sibling
      // IMMEDIATELY AFTER the consumed declarator: a later declarator of the same declaration may read
      // the extracted name (`var { [(SE, 'flat')]: flat } = arr, viaFlat = flat`), and an end-of-declaration
      // append would hand it the pre-init value (undefined on var, TDZ throw on let/const). `insertAfter`
      // (not a raw splice) re-queues the new declarator for the active traversal, so a nested instance /
      // static / global inside the cloned receiver gets re-visited and polyfilled - matching the
      // standalone branch's `insertBefore` re-traversal, and the consumed / unplugin paths.
      // a LIVE-defaulted extraction takes this arm on a standalone host too: it must evaluate
      // AFTER the kept key's side effect (native reads the key first, then fires the default)
      const trailing = t.variableDeclarator(bindingLhs(), instanceLeafCall(instanceLeaf, polyfillValue));
      const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
      noteExtractionSource(trailing, prop.node, hostDeclarator.parentPath);
      if (!wholeInitMemoized.has(hostDeclarator.node)) attachToPrevDeclarator.add(trailing);
      // successive pairs from the SAME declarator keep source order: anchor each insert on the
      // previously inserted trailing, not the declarator (which would reverse them)
      const anchor = seKeyTrailingAnchors.get(hostDeclarator.node) ?? hostDeclarator;
      // a host memoized WHOLE reads its residual off the ref, so the extraction lands AHEAD of that
      // residual - the partial-memo canon both legs print (`const _ref = mk(); const at = _at(_ref);
      // const { other } = _ref;`); a source sibling host keeps the extraction behind its residual
      const [inserted] = wholeInitMemoized.has(hostDeclarator.node) && anchor === hostDeclarator
        ? anchor.insertBefore(trailing) : anchor.insertAfter(trailing);
      seKeyTrailingAnchors.set(hostDeclarator.node, inserted);
      if (instanceDefaultLive || segmented) splitResidualAfterDefaultProp({ prop, guardPath: inserted });
    } else if (instanceDefaultLive) {
      // catch-born host: the separate `let _ref2, i = ...` line lands AFTER the relocated
      // residual (the kept key's effect runs first) - the catch-canon shape the unplugin emitter emits
      const extracted = t.variableDeclaration(residualDecl.node.kind, [
        t.variableDeclarator(t.cloneNode(foldedTestRef)),
        t.variableDeclarator(bindingLhs(), instanceLeafCall(instanceLeaf, polyfillValue)),
      ]);
      const [guardPath] = residualDecl.insertAfter(extracted);
      splitResidualAfterDefaultProp({ prop, guardPath });
    } else {
      const isExport = residualDecl.parentPath?.isExportNamedDeclaration();
      const extracted = t.variableDeclaration(residualDecl.node.kind, [
        ...foldedTestRef ? [t.variableDeclarator(t.cloneNode(foldedTestRef))] : [],
        t.variableDeclarator(bindingLhs(), instanceLeafCall(instanceLeaf, polyfillValue)),
      ]);
      const anchor = isExport ? residualDecl.parentPath : residualDecl;
      const node = isExport ? t.exportNamedDeclaration(extracted, []) : extracted;
      if (isExport && exportMemoHosts.has(residualDecl.node) && !foldedTestRef) {
        // the memo stands ahead as a local statement, so the extraction takes the memo declarator's
        // own slot: behind the residual, in the exported declaration (`const _ref = eff(); export
        // const { [k]: _unused, z } = _ref, s = _at(_ref);` - the sibling-declarator join)
        const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
        const [trailing] = extracted.declarations;
        noteExtractionSource(trailing, prop.node, hostDeclarator.parentPath);
        const [inserted] = (seKeyTrailingAnchors.get(hostDeclarator.node) ?? hostDeclarator).insertAfter(trailing);
        seKeyTrailingAnchors.set(hostDeclarator.node, inserted);
      } else if (!foldedTestRef && residualDecl.node?.declarations?.length > 1) {
        // a SIBLING-declarator host keeps the extraction AT ITS SOURCE SLOT: a statement ahead of the
        // declaration would overtake the earlier declarators (the flatten route's own rule), so the
        // pure binds as the declarator before its host and the split renders it as a statement there
        // - behind the receiver's own prefix, which opens that group where the source ran it, and
        // under an EXPORT wrapper the split re-applies (the prefix a plain statement ahead of it)
        const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
        const [ahead] = extracted.declarations;
        noteExtractionSource(ahead, prop.node, hostDeclarator.parentPath);
        recordSplitLiftedPrefix(hostDeclarator.node, ahead.id, ahead);
        insertHostDeclarator(hostDeclarator, ahead);
        flatTouchedMultiDecls.add(residualDecl);
      } else if (extractAfterResidual) {
        // successive props of one declaration keep SOURCE order: each insert anchors on the
        // previously inserted statement, not on the residual (which would reverse them)
        const [inserted] = (afterResidualAnchors.get(residualDecl.node) ?? anchor).insertAfter(node);
        afterResidualAnchors.set(residualDecl.node, inserted);
      } else {
        insertExtractionAheadOfResidual({
          residualDecl, anchor, node, isExport,
          declaratorNode: prop.findParent(pp => pp.isVariableDeclarator())?.node ?? null,
          extractedDeclarators: extracted.declarations,
        });
      }
    }
    // a TYPED user nav, a built-in surface hop and a whole-memoized host are spelled by the
    // extraction itself, so the consumed leaf has no reason to stay: a `_unused` sentinel there
    // would READ the hop a second time and fire its getter twice. the leaf LEAVES and the levels
    // it empties cascade out, exactly what the static flatten prints
    // (`{ Array: { from }, keep } = box` -> `const from = _Array$from; const { keep } = box;`).
    // a REST sibling still keeps its sentinel - rest gathers what the pattern did not name
    // ... and a leaf under hops the EXTRACTION re-spells for free (a built-in surface, an alias it
    // memoized) is in the same position: the sentinel would re-read what costs nothing to read
    const hostDeclarator = prop.findParent(item => item.isVariableDeclarator());
    const navReceiver = prop.parentPath.parentPath?.isObjectProperty?.()
      ? resolveNestedReceiverNode(prop, { allowNavSegments: true, adapter }) : null;
    const chained = typedNav || hopChainNamesMissingAbleCtor(prop) || wholeInitMemoized.has(hostDeclarator?.node)
      || surfaceRespelledHosts.has(hostDeclarator?.node)
      || (!!navReceiver && isReReadableSurfaceNav(navReceiver, name => !!injector?.getBindingInfo?.(name)));
    // ... and only a leaf whose own key evaluates nothing: an EFFECTFUL key runs where it stands, so
    // that leaf retires to a sentinel below like any other kept key
    if (chained && !hasRestSiblingExcept(prop.parent.properties, prop.node) && !computedKeyHasSideEffects(prop.node)) {
      const hostId = hostDeclarator?.node?.id;
      skippedNodes.add(prop.node);
      prop.remove();
      if (hostId) pruneEmptiedHopProps(hostId, { mint: generateUnusedId });
      // ... and a host pattern the claim emptied WHOLE binds nothing: with a pure init it leaves,
      // since a declarator binding nothing beside one that binds is a shape the standard
      // destructuring lowering miscompiles, and the memo it read keeps that read for its siblings
      // ... dropped AFTER the traversal: paths into the removed subtree are still queued, and
      // babel asks a removed node for its parent before this emitter's own guards run
      // ... and an EXPORTED host reading a memo planted ahead of its wrapper is the same shape one
      // statement up: its sole declarator binds nothing, so the whole export leaves.
      // in a LOOP HEAD there is nowhere to lift to, so an emptied host carrying an EFFECT stays as
      // the `_unused` sink instead of leaving
      if (hostId?.type === 'ObjectPattern' && !hostId.properties.length && hostDeclarator?.node
        && (!mayHaveSideEffects(hostDeclarator.node.init)
          ? hostDeclarator.parentPath?.node?.declarations?.length > 1
            || (wholeInitMemoized.has(hostDeclarator.node) && hostDeclarator.parentPath?.parentPath?.isExportNamedDeclaration())
          : isForInitDeclaration(hostDeclarator.parentPath?.parentPath?.node, hostDeclarator.parentPath?.node))) {
        emptiedHostDeclarators.set(hostDeclarator.node, hostDeclarator.parentPath);
      }
      return true;
    }
    const sentinel = generateUnusedId();
    prop.get('value').replaceWith(sentinel);
    prop.node.shorthand = false;
    skippedNodes.add(prop.node);
    recordArrayWrappedResidual({ declaration: residualDecl, sentinelName: sentinel.name, kind, prop });
    // a hop the sentinel emptied retires to one sentinel of its own where its level keeps it and
    // the extraction reads a built-in SURFACE, not the slot: a slot the memo channel reads keeps
    // the leaf's own sentinel inside the hop, the shape the other leg prints for that read
    const sentinelHostId = hostDeclarator?.node?.id;
    if (sentinelHostId?.type === 'ObjectPattern' && objectNode && isBuiltInSurfaceNav(objectNode)) {
      pruneEmptiedHopProps(sentinelHostId, { mint: generateUnusedId, isSentinel: isUnusedName });
    }
    return true;
  }

  // a sentinel this leg minted, by the injector's own registry
  function isUnusedName(id) {
    return injector.hasGeneratedUnusedName(id.name);
  }

  // is a hop above this leaf keyed by an effect? its level keeps the hop, so no residual dies
  function effectfulHopAbove(prop) {
    for (let cur = prop.parentPath; cur?.node; cur = cur.parentPath) {
      if (cur.isObjectPattern() && patternLevelKeepsEffectfulHop(cur.node)) return true;
      if (!cur.isObjectPattern() && !cur.isObjectProperty() && !cur.isArrayPattern() && !cur.isAssignmentPattern()) return false;
    }
    return false;
  }

  // an ARRAY-WRAPPED residual this route emptied: each prop renamed to a sentinel, the extraction
  // reading the element. the wrapper is why the residual survived at all - the per-prop route asks
  // "is this prop the declaration's only binding", which a SECOND polyfilled prop answers no,
  // while the flat form reaches the whole-consume channel and drops. collected here, adjudicated
  // once the traversal has renamed every prop it is going to
  function recordArrayWrappedResidual({ declaration, sentinelName, kind, prop }) {
    // the prop's OWN declarator, whatever else shares the declaration: pruning its consumed
    // keys is per-declarator work, and a sibling declarator only keeps the declaration alive
    const declaratorNode = prop.findParent(pp => pp.isVariableDeclarator())?.node ?? null;
    if (declaratorNode?.id?.type !== 'ArrayPattern') return;
    if (!declaration?.node?.declarations?.includes(declaratorNode)) return;
    // keyed by the DECLARATOR: two wrapped declarators of one declaration are two independent
    // verdicts, and a shared key would let either one's kept residual hold the other's
    let record = arrayWrappedResiduals.get(declaratorNode);
    if (!record) {
      record = {
        declaration,
        declarator: declaratorNode,
        sentinels: new Set(),
        consumed: [],
        readsReceiver: false,
        emptied: new Set(),
      };
      arrayWrappedResiduals.set(declaratorNode, record);
    }
    record.sentinels.add(sentinelName);
    // the wrapper ELEMENT this prop descends from: only an element the extraction empties may
    // leave with the residual, since the extraction repeats the coercion the element performed
    let element = prop.parentPath;
    while (element?.node && element.parentPath?.node !== declaratorNode.id) element = element.parentPath;
    if (element?.node) record.emptied.add(element.node);
    record.consumed.push({ propNode: prop.node, patternNode: prop.parentPath?.node ?? null });
    // an INSTANCE extraction reads the element inside its own dispatch, so the read native
    // performs off it survives the drop; a receiver-less static leaves the residual as the
    // only reader and keeps it
    record.readsReceiver ||= kind === 'instance';
  }

  // an assignment host (`({ ... } = R)`) has no declaration to extract a `const` into. for a statement-
  // context assignment with a bare-Identifier binding and a re-referenceable receiver, append
  // `m = _flatMaybeArray(recv)` AFTER the statement: the destructure assigns `m` natively first (running any
  // in-place computed-key effect, leaving `m` undefined on engines lacking the method), then this overwrite
  // makes the polyfill win. returns true when this IS a statement-context assignment (overwrite emitted, or
  // left native when the receiver can't be re-referenced), false otherwise (declaration / param /
  // expression-context whose value would need preserving) so the caller continues
  // the element twin of `pruneOverwrittenSlot`: the same prune, with the sentinel `var`s hoisted
  // ahead of the statement the sequence sits in. answers whether the residual DIED with the prune -
  // an emptied pattern over an effect-free receiver has nothing left to evaluate, and the element
  // becomes the overwrite alone; an effectful one keeps the residual, which is what evaluates it
  // `carriesInit`: the dispatch spells a receiver that performs every effect the right would, so the
  // kept residual would run them a SECOND time - the same pairing the statement route holds
  function pruneOverwrittenSlotInElement({ prop, seqElement, carriesInit = false }) {
    return pruneOverwrittenChain({
      prop,
      anchor: findStatementParent(seqElement),
      // an emptied host over an effect-FREE receiver has nothing left to evaluate, so the element
      // becomes the overwrite alone; one with effects keeps the residual, which evaluates it
      onHostEmptied: hostAssign => carriesInit || !mayHaveSideEffects(hostAssign.node.right),
    });
  }

  function emitAssignmentInstanceOverwrite({ prop, entry, hintName }) {
    const rawStatement = nestedAssignmentStatementOf(prop);
    // ... and where the assignment is a DISCARDED sequence element there is no statement to append
    // after: the overwrite becomes the element's own next sequence slot, which is the same order -
    // the residual assigns natively first, the overwrite then wins
    const hostAssign = rawStatement ? null : prop.findParent(item => item.isAssignmentExpression());
    const seqElement = hostAssign && !assignmentInStatementPosition(hostAssign)
      ? discardedSequenceElementPath(hostAssign) : null;
    if (!rawStatement && !seqElement) return false;
    const spanAnchor = rawStatement ?? seqElement;
    // `resolveNestedReceiverNode` gates the receiver (Identifier / side-effect-free literal); `propBinding-
    // Identifier` unwraps a defaulted binding (`{ flat: m = [] }` is an AssignmentPattern), so a raw
    // `value?.type === 'Identifier'` check wouldn't drop the overwrite and lose the polyfill to the native read
    // read-after consumer: the overwrite runs AFTER the residual evaluated the init in place,
    // so a receiver peeled from under an SE prefix keeps native order here
    // ... and a NAV receiver resolves through the same canon now that it spells its own segments
    // (`globalThis.Array.prototype`): the overwrite reads it once in its dispatch, which is the
    // single-read contract that gate names. without it the claim shipped native in this host alone.
    // ... a DEFAULTED prop rides it too: the guard below keeps whatever the raw slot bound, so a
    // dispatch that answers undefined off a foreign receiver no longer buries the source's default
    // ... but the SPELLED nav is a second read of the source's own receiver, beside the residual's,
    // so only a BUILT-IN surface qualifies - a user key may be a getter, and re-spelling it fired
    // that getter twice where the source reads it once
    // a nav the source wrote with `?.` answers every question below the same way: the hop
    // short-circuits the WHOLE chain, so a residual and a re-spelling read one value - and the
    // collapse then renders the nav without the marker, as it does for every other host
    const OPTIONAL_HOPS = { allowOptionalHops: true };
    // a FLAT claim inside an array WRAPPER has no nested chain to resolve: its receiver is the
    // ELEMENT the pattern is paired with, the very value the statement host reads directly. without
    // it the claim had no route at all under a wrapper and shipped native, where every other host of
    // both legs dispatches (`([{ flat: m }] = [globalThis.Array.prototype])`)
    const resolvedNested = resolveNestedReceiverNode(prop,
      { allowSePeeledFragment: true, allowNavSegments: true, adapter });
    const wrappedElement = resolvedNested ? null : arrayWrappedAssignElement(prop);
    // an EFFECT-bearing wrapper element is no plain receiver: the residual keeps reading it, so
    // spelling it in the dispatch too ran its effects TWICE (`([{ at: v }] = [eff()])`). it
    // qualifies only through the carried route below, which drops that residual
    const plainReceiver = resolvedNested
      ?? (wrappedElement && !mayHaveSideEffects(wrappedElement) ? wrappedElement : null);
    // ... and where the HOST dies with the slot, an EFFECT-bearing receiver qualifies too: nothing
    // survives to read it a second time, so the dispatch performs the effects the dropped residual
    // would have performed, exactly once (`({ y: { at: v } } = { y: eff() })`). the re-read gate
    // above protects a residual - with none left it has nothing to protect
    const carriedReceiver = plainReceiver || !consumedAssignmentSlotDropsHost(prop) ? null
      : carriedInitReceiverNode({
        path: prop,
        initNode: prop.findParent(item => item.isAssignmentExpression())?.node?.right,
        resolveOptions: { allowSePeeledFragment: true, allowNavSegments: true },
        fallbackNode: wrappedElement,
        adapter,
      });
    const resolvedReceiver = plainReceiver ?? carriedReceiver;
    // ... and a FLAT SE-keyed prop over a MEMBER read stands down: its key keeps the slot, so the
    // residual re-reads that member and the dispatch would read it a second time, where the source
    // reads once. only a flat one - a NESTED claim's hops name the polyfilled surface themselves, and
    // that the canon does re-spell (a re-referenceable token and a constant literal re-spell freely
    // too). the receiver is what the SOURCE hands the pattern: the wrapper element, or the
    // assignment's own right
    const sourceReceiver = arrayWrappedAssignElement(prop)
      ?? prop.findParent(item => item.isAssignmentExpression())?.node?.right;
    if (prop.node.computed && mayHaveSideEffects(prop.node.key)
      && !prop.parentPath?.parentPath?.isObjectProperty?.()
      && (sourceReceiver?.type === 'MemberExpression'
        || sourceReceiver?.type === 'OptionalMemberExpression')) return false;
    // ... and a nav into the BUILT-IN namespace must NAME the instance surface it dispatches on: a
    // leaf off the object the hops merely REACH is a name match (`[{ Array: { keys: k } }] =
    // [globalThis]`), which every other host of both legs keeps native - the shared rule the nested
    // render asks. a receiver that is not such a nav resolved through its own TYPE and keeps its claim
    if (resolvedReceiver && isBuiltInSurfaceNav(resolvedReceiver, OPTIONAL_HOPS)
      && !isInstanceSurfaceNav(resolvedReceiver, OPTIONAL_HOPS)) {
      return false;
    }
    // ... and a slot that takes the NAV with it leaves the dispatch as the only reader, so the root the
    // re-read gate insists on has nothing left to protect: an instance surface off a USER namespace
    // (`userNs.Array.prototype`) is read exactly once, where the source reads it
    // ... and so is a nav naming USER keys the whole way, but only under the ARRAY WRAPPER, where
    // the pairing takes the whole pattern and no residual survives to run first: the bare
    // assignment host runs its residual BEFORE the overwrite, which would read a sibling's key
    // ahead of this hop and reorder two getters the source fires the other way round
    // a POSITIONAL segment inside the resolved nav is spelled by the canon as a COMPUTED literal
    // (`x[0]`), which is an estree node the babel tree cannot host - and reading a property is not
    // what the pattern does there anyway (it pulls from an iterator). the positional slot has its
    // own route, on a declaration host; here the claim stays native, as it does on the other leg
    for (let hop = resolvedReceiver; hop?.type === 'MemberExpression'; hop = hop.object) {
      if (hop.property?.type === 'Literal') return false;
    }
    const receiverNode = resolvedReceiver
      && (carriedReceiver
        || isReReferenceableReceiver(resolvedReceiver)
        || isReReadableSurfaceNav(resolvedReceiver, name => !!injector?.getBindingInfo?.(name), OPTIONAL_HOPS)
        || (consumedAssignmentSlotDropsNav(prop)
          && (isInstanceSurfaceNav(resolvedReceiver, OPTIONAL_HOPS)
            || prop.findParent(item => item.isAssignmentExpression())?.node?.left?.type === 'ArrayPattern')))
      ? resolvedReceiver : null;
    const bindingId = propBindingIdentifier(prop.node.value);
    // the overwrite re-spells the receiver nav the residual reads, so the raw slot has no reader
    // left once the dispatch lands - unless its KEY still owes an in-place effect
    const prunesSlot = consumedAssignmentSlotPrunes(prop);
    if (bindingId && receiverNode && !skippedNodes.has(prop.node)) {
      // mark handled so a re-visit (babel re-crawls after the insertAfter mutation) doesn't append a
      // second identical overwrite
      skippedNodes.add(prop.node);
      // chain each overwrite off the previous one for this statement: the elements of a multi-element
      // pattern (`[{ flat: x }, { at: x }] = [a, b]`) must overwrite in SOURCE order so the last one wins,
      // as native destructuring does - a bare `statement.insertAfter` per element reverses them
      const overwriteCall = markThrowingExtraction(t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(receiverNode)]));
      // a DEFAULTED leaf keeps its guard: the pure entry answers `it.method` verbatim off a receiver
      // that is not the polyfilled surface, so the dispatch may be undefined and burying what the
      // destructure bound loses the source's default (`({ y: { flat: m = null } } = { y: navigator })`
      // bound undefined where the source binds null). the RAW slot ran that default already, exactly
      // once, so the BINDING is the fallback - re-spelling the default node would run it twice
      // ... and once the slot is PRUNED nothing ran that default, so the guard spells the default
      // NODE instead - the one reader left, evaluated exactly once
      const overwriteValue = prop.node.value?.type === 'AssignmentPattern'
        ? buildInstanceDefaultGuard(t, {
          call: overwriteCall,
          defaultNode: t.cloneNode(prunesSlot ? prop.node.value.right : bindingId),
          ref: generateRef(prop.scope, prop.node),
        })
        : overwriteCall;
      const overwriteAssign = inheritSpan(
        t.assignmentExpression('=', t.cloneNode(bindingId), overwriteValue), spanAnchor.node);
      if (seqElement) {
        const dropsResidual = prunesSlot
          && pruneOverwrittenSlotInElement({ prop, seqElement, carriesInit: !!carriedReceiver });
        seqElement.replaceWith(dropsResidual ? overwriteAssign
          : t.sequenceExpression([seqElement.node, overwriteAssign]));
        return true;
      }
      const overwriteStmt = inheritSpan(t.expressionStatement(overwriteAssign), rawStatement.node);
      // an unbraced control slot whose HOST dies takes the dispatch IN PLACE: block-wrapping first
      // and removing the raw statement after would drop the block the wrap just built, and the slot
      // holds one statement either way - which is the shape the other leg prints
      const assignPath = prop.findParent(item => item.isAssignmentExpression());
      // ... only for a receiver that owes NOTHING: an effect lifted off a bodyless slot is queued
      // against the list holding the CONTROL statement, so it would run unconditionally where the
      // source runs it only when the branch is taken. one with effects takes the block below, whose
      // lift lands inside it
      if (prunesSlot && consumedAssignmentSlotDropsHost(prop) && !nestedOverwriteLastInsert.has(rawStatement.node)
        && (carriedReceiver || !mayHaveSideEffects(assignPath.node.right))
        && isBodylessStatementSlot(rawStatement.parentPath?.node, rawStatement.node)) {
        rawStatement.replaceWith(overwriteStmt);
        return true;
      }
      // the host is block-wrapped through the SHARED pair before the first dispatch lands: babel's own
      // `insertAfter` wraps a bodyless slot without re-seating the path, and a second element then
      // anchored on the stale slot and landed AHEAD of the first - reversing the source order the last
      // write depends on (`if (c) [{ flatMap: s }, { at: s }] = [b, c]` bound `s` from `b`)
      const statement = blockWrappedHostStatement(assignPath);
      const prevInsert = nestedOverwriteLastInsert.get(statement.node);
      nestedOverwriteLastInsert.set(statement.node, (prevInsert ?? statement).insertAfter(overwriteStmt)[0]);
      if (prunesSlot) pruneOverwrittenSlot({ prop, statement, carriesInit: !!carriedReceiver });
    }
    return true;
  }

  // the consumed slot drops the way the flat host's does: the prop first, then every hop pattern it
  // empties, and an emptied TOP takes the statement with it - its receiver keeping only the PREFIX
  // it owes (`({ A: { prototype: { fill: m } } } = (kw = _g, _g.A))` -> `kw = _g;` + the overwrite).
  // a REST at any level keeps that level's slot under an `_unused` sentinel, so the rest keeps
  // excluding the key - the one shape `prunePatternByPlan` already spells for the plan-driven hosts
  // the wrapper ELEMENT a flat claim is paired with: the pattern sits in an ArrayPattern whose
  // assignment reads an array LITERAL, so the element at that index is what the source destructures
  function arrayWrappedAssignElement(prop) {
    const pattern = prop.parentPath;
    const arrayPattern = pattern?.isObjectPattern?.() ? pattern.parentPath : null;
    if (!arrayPattern?.isArrayPattern?.()) return null;
    const index = arrayPattern.node.elements.indexOf(pattern.node);
    const assign = arrayPattern.parentPath;
    if (index === -1 || !assign?.isAssignmentExpression?.() || assign.node.left !== arrayPattern.node) return null;
    const init = assign.node.right;
    return init?.type === 'ArrayExpression' && init.elements.every(item => item?.type !== 'SpreadElement')
      ? init.elements[index] ?? null : null;
  }

  // the climb both overwrite prunes take: rename the consumed slot, hoist whatever sentinel that
  // leaves onto `anchor`, and keep going while the pattern it emptied is itself a hop prop. what an
  // emptied HOST means is the caller's - a statement drops with its receiver's effects replayed, an
  // element only reports it so its own render may leave the residual out
  function pruneOverwrittenChain({ prop, anchor, memoKey = null, onHostEmptied }) {
    const bk = { unusedVarDecl: memoKey ? nestedOverwriteUnusedVar.get(memoKey) ?? null : null };
    let propNode = prop.node;
    let pattern = prop.parentPath;
    while (pattern?.isObjectPattern?.()) {
      appendUnusedVarDeclarators(bk, anchor,
        prunePatternByPlan(pattern.node, [{ kind: 'consumed', prop: propNode }]));
      if (memoKey && bk.unusedVarDecl) nestedOverwriteUnusedVar.set(memoKey, bk.unusedVarDecl);
      if (pattern.node.properties.length) return false;
      const { parent, leftmost } = peelTransparentWrappers(pattern);
      if (parent?.isAssignmentExpression?.() && parent.node.left === leftmost) return onHostEmptied(parent);
      if (!parent?.isObjectProperty?.()) return false;
      propNode = parent.node;
      pattern = parent.parentPath;
    }
    return false;
  }

  // `carriesInit`: the dispatch spells a receiver that performs every effect the right would, so
  // re-emitting the right beside it would run those effects a SECOND time - the emptied host takes
  // its right with it instead of deferring it
  function pruneOverwrittenSlot({ prop, statement, carriesInit = false }) {
    pruneOverwrittenChain({
      prop,
      anchor: statement,
      memoKey: statement.node,
      onHostEmptied(hostAssign) {
        if (!carriesInit) deferSideEffect(statement, hostAssign.node.right);
        statement.remove();
        return true;
      },
    });
  }

  // deep-clone a pattern for a helper-result extraction LHS, claiming its PROPERTY nodes so
  // the re-traversal on insertion doesn't re-enter the destructure pipeline (value subtrees -
  // binding defaults - stay live and keep polyfilling)
  function clonePatternClaimed(pattern) {
    const clone = t.cloneNode(pattern, true);
    t.traverseFast(clone, node => {
      if (node.type === 'ObjectProperty' || node.type === 'Property') skippedNodes.add(node);
    });
    return clone;
  }

  // dispatch a polyfillable key whose KEY must stay in the pattern - either a side-effecting computed key
  // (`{ [(eff(), 'from')]: from } = R`, the effect runs in place) OR a nested INSTANCE method (the polyfill
  // `_m(receiver)` needs the receiver the residual preserves). the ONE robust emission (decided by the
  // shared `planSideEffectKeyStrategy`): keep the key IN PLACE (value renamed to a throwaway) and bind the
  // polyfill separately - uniform across statement / nested / for-init / rest / default / export / array-
  // wrapper / nested-sequence keys. a param-default / IIFE host can't host that separate binding, so it
  // synth-swaps the receiver instead. an assignment host (no declaration) emits the post-statement overwrite
  // for an instance method; an SE-computed key never falls through to the discarding instance extract.
  // returns true when handled (caller stops); false lets the caller continue (non-instance assignment host)
  // eslint-disable-next-line max-statements -- the host dispatch: one branch per slot shape
  function handleSideEffectComputedKey({ prop, kind, entry, hintName, meta = null }) {
    const objectPattern = prop.parentPath;
    const { parent: synthHost } = peelTransparentWrappers(objectPattern);
    // param-default / IIFE host: no room for a separate binding statement -> synth-swap receiver. an
    // INSTANCE method routes here too, but ONLY on such a host - the receiver synth spells the key
    // through its resolved name and leaves the effect on the pattern, so nothing needs a separate
    // binding. an ASSIGNMENT host keeps the post-statement overwrite below, which is what preserves
    // the in-place effect there.
    // `meta` MUST thread through: the nested-mirror plan gates on `meta.object`, and dropping it here
    // demotes a wrapped-pattern SE key from the caller-correct receiver synth (key text + effect stay in
    // the pattern) to the native-wins inline default - diverging from the unplugin emitter
    const paramHost = !!synthHost?.isAssignmentPattern() || !!synthHost?.isFunction();
    if ((kind !== 'instance' || paramHost) && !synthHost?.isVariableDeclarator() && !synthHost?.isObjectProperty()) {
      handleParameterDestructure({ prop, kind, entry, hintName, meta });
      return true;
    }
    // the long-hand flat shape normalizes FIRST: the rewrite re-queues the pattern, and the claim
    // fires again on the twin this file already knows how to extract
    if (kind === 'instance' && normalizeNestedLeafSiblings(prop)) return true;
    // a for-x HEAD hosts no statement and its declarator no init: every shape below lifts the key
    // effect into a statement beside the extraction, and there is nowhere for one to land. the claim
    // stays native there - reaching further crashed the transform, reading the absent init and
    // inserting a statement into the head. the pattern may sit under WRAPPERS (array slots, hop
    // properties): they pair a value and host nothing, so the walk through them ends at the same
    // slot-less declarator
    let headDeclarator = objectPattern.parentPath;
    while (headDeclarator?.node && (headDeclarator.node.type === 'ArrayPattern'
      || headDeclarator.node.type === 'ObjectPattern' || headDeclarator.isObjectProperty?.()
      || headDeclarator.node.type === 'Property')) headDeclarator = headDeclarator.parentPath;
    if (headDeclarator?.isVariableDeclarator?.() && !headDeclarator.node.init) return false;
    let declaration = hostDeclarationOf(prop);
    // an assignment host has no declaration to extract into. an INSTANCE method emits the post-statement
    // overwrite (which leaves the destructure in place so an in-place computed-key effect still runs) and is
    // always reported handled - an SE-computed key must never fall through to the default instance extract,
    // which discards the destructure AND the key's effect. a non-instance (static) bails to its flatten path
    if (!declaration) {
      // ... and where that overwrite DECLINES for want of a spelling, the positional route is the one
      // that needs none: the element takes a minted name, and on this host that name is a hoisted
      // `var`. asked only after the overwrite has had its say, so the host's own channel still wins
      // wherever it can name the receiver
      if (kind === 'instance' && !emitAssignmentInstanceOverwrite({ prop, entry, hintName })) {
        const positional = resolvePositionalElementSlot(prop, adapter);
        if (positional?.assignment) {
          extractPositionalElementSlot({ prop, entry, hintName, positional, declaration: null, isForInit: false });
        }
      }
      return kind === 'instance';
    }
    const isForInit = isForInitDeclaration(declaration.parentPath?.node, declaration.node);
    const sourceSiblingHost = isForInit || sourceDeclaratorsOf(declaration).length > 1;
    // resolve the instance receiver once: the planner needs its kind, `keepKeyInResidual` the node. for the
    // nested-receiver path `objectNode` is a bare node (no path); the SE-computed-key path resolves the
    // declarator init, which `resolveNestedReceiverNode` also reaches - either way it gates memo / re-ref
    let declarator = prop.findParent(pp => pp.isVariableDeclarator())?.node;
    const bindingCount = originalBindingCount(prop);
    // the wrapper's other element PATTERNS, or null where this prop sits in no wrapper: the same
    // view the purity test reads, asked for what each of them still coerces
    const wrapperSiblingElements = arrayWrapperOtherElements(prop, declaration);
    // does the residual DIE with this extraction? the same three facts the plan reads, asked here
    // too: the SE-prefix route below spells the init into the dispatch only where nothing survives
    // to evaluate it a second time
    // ... and never under a hop whose key carries an effect: that level keeps the hop as a sentinel
    const residualDies = bindingCount === patternBindingCount(prop.node.value)
      && (!wrapperSiblingElements || wrapperSiblingElements.elements.every(element => element === null))
      && !effectfulHopAbove(prop);
    let objectNode = kind === 'instance'
      ? resolveDestructuringObject(prop, resolvePropertyObjectType(prop), true) : null;
    // ... and an EFFECT-bearing slot resolves as a CANDIDATE first, then answers for itself: the
    // effects only matter while a residual survives to re-evaluate them, and a receiver that
    // performs every effect its init would leaves that residual nothing to do
    // an ARRAY WRAPPER whose claim sits on the ELEMENT is not this case: that element rides the
    // wrapper's own prefix channel, which re-emits the discarded init beside the dispatch - the pair
    // would evaluate it twice. a claim NESTED inside the element is, though: what it reads is the
    // SLOT, so where the residual dies the dispatch performs that read and where it survives the
    // plan memoizes the slot - neither re-emits the element beside it
    // (`const [{ k: { at: a } }] = [{ k: eff() }]` left the claim native)
    // one climb answers both: the wrapper is an ArrayPattern between this prop and its declarator,
    // and a claim nested inside its element sits under more than one object pattern on the way
    function arrayWrapperClimb() {
      let patterns = 0;
      for (let cur = prop.parentPath; cur && !cur.isVariableDeclarator(); cur = cur.parentPath) {
        if (cur.isObjectPattern()) patterns += 1;
        if (cur.isArrayPattern()) return { wrapped: true, patterns };
      }
      return { wrapped: false, patterns };
    }
    const climb = arrayWrapperClimb();
    const initCarriedByReceiver = !climb.wrapped || climb.patterns > 1;
    if (kind === 'instance' && !objectNode && initCarriedByReceiver) {
      const carried = resolveDestructuringObject(prop, resolvePropertyObjectType(prop), true, null, true);
      // ... and under a wrapper that KEEPS its residual the receiver answers for its own ELEMENT
      // alone: the memo takes that slot out and the residual reads the ref in its place, so the
      // neighbours still evaluate where the source evaluates them (`[{ y: eff() }, eff()]`)
      const wrapperElement = arrayWrapperLevels(prop, declaration)?.element ?? null;
      if (carried && (receiverPerformsEveryInitEffect(declarator?.init, carried)
        || (wrapperElement && arrayWrapperHoistKeepsOrder(prop, declaration)
          && receiverPerformsEveryInitEffect(wrapperElement, carried)))) objectNode = carried;
    }
    // an ARRAY-WRAPPED slot in a statement declaration: the wrapper residual is the one this pipeline
    // drops whole once its props are consumed, so eliminating it up front only does earlier what the
    // post-traverse prune does anyway - and a loop header has no statement list to drop into
    // ... and so does a DECLARATOR of a shared statement declaration whose receiver carries the init:
    // the extraction replaces that declarator alone and the siblings render beside it, which is the
    // split the flat route already performs (`const { flat } = (eff(), Array.prototype), z = 1`)
    let slotDropsAlone = !isForInit && arrayWrapperSlotIndex(prop, declaration) >= 0;
    // set by the typed-nav branch below: that receiver is spelled by the extraction itself, so a
    // kept residual would read it a SECOND time
    let typedNavReceiver = false;
    // does the receiver node below CARRY the init's own effects? the plan drops the residual only
    // where nothing is left to preserve, and a receiver spelled as `(prefix, <nav>)` is that case
    let receiverCarriesInit = false;
    // ... and an element whose wrapper DIES with the claim carries the neighbours the source
    // evaluates AHEAD of it as its own prefix: native builds the literal - every element, in order -
    // before reading anything off the slot, so the dispatch reads `(eff(), X)` exactly where the
    // source read `X`, and the dropped residual leaves nothing behind (the other leg's
    // `literalContainerRescue` spells the same prefix). only where every effectful neighbour PRECEDES
    // the slot - one standing after it would have to run between the element and the read, which
    // the memo beside a kept residual serves instead - and only for an element a residual could not
    // re-read for free, since a re-referenceable one keeps the residual for the effect as it is
    // the wrapper dies when its OTHER slots are holes: nothing else binds, so nothing coerces once the
    // neighbours ride the prefix
    const wrapperPattern = climb.wrapped && climb.patterns === 1 ? prop.parentPath.parentPath : null;
    const wrapperHolesBeside = wrapperPattern?.isArrayPattern()
      && wrapperPattern.node.elements.every(element => element === null || element === prop.parentPath.node);
    let neighboursCarried = false;
    if (kind === 'instance' && objectNode && wrapperHolesBeside && !isReReferenceableReceiver(objectNode)
      && bindingCount === patternBindingCount(prop.node.value)) {
      const levels = arrayWrapperLevels(prop, declaration)?.levels;
      const level = levels?.length === 1 && levels[0].key === undefined ? levels[0] : null;
      const ahead = level ? wrapperLevelHead(level).filter(item => item && mayHaveSideEffects(item)) : [];
      if (ahead.length && wrapperLevelTail(level).every(item => !item || !mayHaveSideEffects(item))) {
        objectNode = t.sequenceExpression([...ahead, objectNode]);
        receiverCarriesInit = true;
        neighboursCarried = true;
      }
    }
    // the identifier-init twin of the literal walk, SYMBOL channel only (the one canon the
    // other leg already extracts): the receiver renders as the member chain the pattern
    // descends (`_getIteratorMethod(obj.inner)`), spelled through the render canon and
    // converted at the boundary
    // sole-binding only: the sibling cell still key-swaps on BOTH legs (their joint next
    // target) - extracting here alone would open a one-leg import-set divergence
    if (kind === 'instance' && !objectNode && entry === SYMBOL_ITERATOR_PURE_RESULT.entry
      && declaration.node.declarations.length === 1
      && originalBindingCount(prop) === patternBindingCount(prop.node.value)) {
      const chain = resolveNestedReceiverChain(prop, { adapter });
      const base = chain && resolveNestedReceiverBase({
        rootName: chain.root.name,
        keys: chain.keys,
        bound: !!adapter.getBinding(prop.scope, chain.root.name, prop),
        adapter,
        resolveGlobalPolyfill: resolveGlobalPure,
      });
      if (base) {
        objectNode = estreeToBabel(base.path.reduce(
          (acc, key) => canonMember(acc, canonIdentifier(key)),
          hostSlot(base.pure ? injectPureImport(base.pure.entry, base.pure.hintName) : t.cloneNode(chain.root)),
        ));
      }
    }
    // ... and a chain that NAVIGATES INTO a built-in surface spells that surface as its receiver
    // (`{ Array: { prototype: { flat: m } } } = globalThis` -> `_flatMaybeArray(_globalThis.Array
    // .prototype)`, the hop already folded into the init by the proxy flatten): the extraction
    // CONSUMES the declarator, so the nav is read exactly once. the other leg extracts the same
    // claim - leaving it native here is the import-set divergence, not the safe side
    // ... the SYMBOL claim rides this walk too, and only through the surface gate below: its
    // anchored-residual shape navigates to the object itself (`_globalThis.Map`), which that gate
    // refuses, so the re-key both legs print there stands
    if (kind === 'instance' && !objectNode) {
      // the trailing-static arm is asked only where the claim's leaf is the declarator's whole
      // binding: a leaf sibling keeps a residual that would re-read the static RAW, and that shape
      // is the flat twin's (the normalization above). the symbol channel keeps its anchored re-key
      const { nav: navReceiver, dispatch: navDispatch } = resolveNestedNavDispatch(prop, {
        adapter,
        resolvePure,
        allowTrailingStatic: entry !== SYMBOL_ITERATOR_PURE_RESULT.entry
          && bindingCount === patternBindingCount(prop.node.value),
      });
      if (navDispatch?.kind === 'surface') objectNode = navDispatch.node;
      else if (navDispatch?.kind === 'static') objectNode = t.cloneNode(injectPureImport(navDispatch.entry, navDispatch.hintName));
      // ... and a nav that does NOT enter that namespace resolved its leaf through the receiver's own
      // TYPE, where the surface question has nothing to judge: `{ y: { at } } = src` dispatches on
      // `src.y`, the read the source performs. spelled through the same chain/base pair the symbol
      // claim above uses - it admits only identifier keys off an identifier root, so a positional
      // segment declines here instead of minting a member the binding dialect cannot print - and
      // asked for SOLE slots, because a user nav re-read by a residual is a second getter call
      else if (!navReceiver || !isBuiltInSurfaceNav(navReceiver)) {
        let typedChain = typedNavClaimChain(prop, { adapter });
        // a nested leaf off a COMPUTED root beside a host sibling: the sibling keeps its own read
        // of the root, which only a memo affords - the whole init memoizes into a `_ref` (the shape
        // the flat sibling's own claim takes) and the walk resolves off that identifier
        // (`{ data: { at }, keys } = mk()` -> `const _ref = mk(); const at = _at(_ref.data);`)
        if (!typedChain && typedNavClaimChain(prop, { rootMemoized: true, adapter })?.root?.type !== undefined
          && typedNavClaimChain(prop, { rootMemoized: true, adapter }).root.type !== 'Identifier') {
          const hostDeclarator = prop.findParent(item => item.isVariableDeclarator());
          const hostDeclaration = hostDeclarator?.parentPath;
          if (hostDeclarator?.node?.init && hostDeclaration?.isVariableDeclaration()
            && statementListOf(hostDeclaration.parentPath?.node)
            && !isForInitDeclaration(hostDeclaration.parentPath?.node, hostDeclaration.node)) {
            memoizeWholeInit(hostDeclarator, prop.scope, null);
            noteWholeInitMemoHost(hostDeclarator);
            flatTouchedMultiDecls.add(hostDeclaration);
            typedChain = typedNavClaimChain(prop, { adapter });
          }
        }
        const typedBase = typedChain && resolveNestedReceiverBase({
          rootName: typedChain.root.name,
          keys: typedChain.keys,
          bound: !!adapter.getBinding(prop.scope, typedChain.root.name, prop),
          adapter,
          resolveGlobalPolyfill: resolveGlobalPure,
          resolveStaticPolyfill: staticHopPure,
        });
        // ... a nav ending on a polyfillable STATIC dispatches on that static's ponyfill - an import
        // binding, always defined, so a slot default folds through the static guard
        // (`{ Array: { of: { name } } } = globalThis` -> `_name(_Array$of)`)
        if (typedBase?.static) {
          const staticId = injectPureImport(typedBase.pure.entry, typedBase.pure.hintName);
          objectNode = typedChain.slotDefault ? estreeToBabel(renderStaticDefaultGuard({
            read: hostSlot(t.cloneNode(staticId)),
            defaultValue: hostSlot(t.cloneNode(typedChain.slotDefault)),
            reread: hostSlot(t.cloneNode(staticId)),
          })) : t.cloneNode(staticId);
          typedNavReceiver = true;
        } else if (typedBase && !typedBase.pure) {
          objectNode = estreeToBabel(typedBase.path.reduce(memberFromKeyName, hostSlot(t.cloneNode(typedChain.root))));
          typedNavReceiver = true;
          // a root with no NAME - a call, a `new`, a member the walk admitted for the sole read - is
          // spelled by this nav, so the dispatch performs the init's own evaluation: a residual kept
          // for that init's effect would run it a second time
          receiverCarriesInit ||= typedChain.root.type !== 'Identifier';
          // ... and a DEFAULT on the way up folds BOTH arms into that receiver: the slot's own value
          // when it is defined, the default when it is not - one read of the nav, and the default
          // evaluated only where the source evaluates it
          if (typedChain.slotDefault) {
            objectNode = buildInstanceDefaultGuard(t, {
              call: objectNode,
              defaultNode: t.cloneNode(typedChain.slotDefault),
              ref: generateRef(prop.scope, prop.node),
            });
          }
        }
      }
      if (!objectNode) {
        // ... and an init that is a plain SE SEQUENCE spells its prefix INSIDE the dispatch, the way
        // the flat canon spells one (`_flat((eff(), Array.prototype))`): the receiver is read once,
        // in source order, and the residual it replaces discards nothing. the prefix nodes ride LIVE
        // - their own claims land through them - and a WRITING tail is not this shape, since peeling
        // it would drop the write
        // the node that HOLDS the receiver: an array WRAPPER puts it in the slot's own element, and
        // the prefix there belongs to that element, not to the literal around it
        const declInit = prop.findParent(pp => pp.isVariableDeclarator())?.node?.init;
        const wrapperSlot = declInit?.type === 'ArrayExpression' ? arrayWrapperSlotIndex(prop, declaration) : -1;
        const seqInit = unwrapRuntimeExpr(wrapperSlot >= 0 ? declInit.elements[wrapperSlot] : declInit);
        // the EXPRESSIONS this init performs before it yields the receiver: a sequence's leading ones,
        // and a kept WRITE (whole - it is both the effect and the store of what the nav then reads)
        const prefixExprs = seqInit?.type === 'AssignmentExpression' && seqInit.operator === '=' ? [seqInit]
          : seqInit?.type === 'SequenceExpression'
            ? unwrapRuntimeExpr(seqInit.expressions.at(-1))?.type === 'AssignmentExpression'
              ? seqInit.expressions : seqInit.expressions.slice(0, -1)
            : null;
        const overPrefix = prefixExprs
          ? resolveNestedReceiverNode(prop, { allowNavSegments: true, allowSePeeledFragment: true, adapter }) : null;
        // ... and only where the residual DIES with the extraction: a surviving one would evaluate
        // that same init a second time. where it survives, the prefix LIFTS to its own statement
        // ahead of the declaration instead - available wherever the declaration itself is a
        // statement (a for-head lifts ahead of the loop, which its once-only init makes equivalent),
        // but never out of a CONTROL slot, where the effect would stop being conditional
        // the lift lands ahead of the WHOLE declaration, so it may not jump over a PRECEDING
        // declarator that performs effects of its own: `const zLead = eff("lead"), [{...}] =
        // [(eff("e"), globalThis)]` runs `lead` first, and hoisting `e` past it swapped them
        // (caught by the differential's effect log, not by any import set)
        function precedingDeclaratorsPure() {
          const decls = declaration.node.declarations;
          const at = decls.indexOf(declarator);
          return at <= 0 || decls.slice(0, at).every(item => !mayHaveSideEffects(item.init));
        }
        if (isInstanceSurfaceNav(overPrefix)) {
          // an EXPORTED host lifts around its export wrapper, as a loop head lifts around the loop
          const liftHost = isForInit || declaration.parentPath?.isExportNamedDeclaration()
            ? declaration.parentPath : declaration;
          // a FOR-HEAD carries it like any other SOLE reader: its header holds the dispatch, the
          // prefix inside that argument runs before the read, and that is the order the source has -
          // one statement fewer than the lift, and the same shape the other leg prints
          // the value the init yields once its prefix has been taken off it
          // ... and a lifted WRITE leaves what it STORED: the store's own prefix ran inside the lifted
          // write, so the slot keeps the stored tail alone - keeping the whole right side would run
          // that prefix a second time wherever the slot is still read
          function seqTailValue() {
            const stored = seqInit.type === 'AssignmentExpression' ? seqInit.right
              : prefixExprs.length === seqInit.expressions.length ? seqInit.expressions.at(-1).right : null;
            return stored ? peelReceiverSequenceTail(stored) : seqInit.expressions.at(-1);
          }
          if (residualDies && (patternBindingCount(prop.node.value) === 1 || isForInit
            || !statementListOf(declaration.parentPath?.node))) {
            objectNode = t.sequenceExpression([...prefixExprs, overPrefix]);
            receiverCarriesInit = true;
            slotDropsAlone = true;
          } else if (residualDies) {
            // ... SEVERAL readers of a dying residual cannot each carry the prefix: on a statement host
            // it lifts ahead of them all and every reader reads the surface directly (`effect(); const m
            // = _values(_globalThis.Array.prototype); const a = _at(_globalThis.Array.prototype);`)
            liftDeclaratorInitSE(t, declarator, declaration, { collapse: expr => collapseLiftedStore(expr, prop) });
            objectNode = overPrefix;
          } else if (isBodylessStatementSlot(declaration.parentPath?.node, declaration.node)) {
            // ... and a CONTROL slot gets its statement by BRACING first: the block keeps the effect
            // conditional, which is what forbids the bare lift, and the pair the flatten route uses
            // owns that surgery. the lift REPLACES the declaration path, so the anchors are taken
            // again from the moved pair - reading the stale one is an undefined node downstream
            liftDeclaratorInitSE(t, declarator, declaration);
            const moved = reanchorBlockWrappedDeclaration(declaration, declarator);
            if (moved) {
              declaration = moved.declaration;
              declarator = moved.declarator.node ?? moved.declarator;
            }
            objectNode = overPrefix;
          } else if (wrapperSlot < 0 && !isForInit && statementListOf(liftHost.parentPath?.node)
            && !claimsConsumeWholePattern(prop, seqTailValue())) {
            // ... and a FLAT init whose residual SURVIVES every claim memoizes WHOLE, prefix and store
            // inside the memo, so the residual and every claim read one `_ref` - the partial-memo canon
            // both legs print for an opaque init (`const _ref = (eff(), _globalThis); const a = _at(_ref
            // .Array.prototype); const { ...other } = _ref;`); the ref is registered as the realm's own
            // alias so the hops off it still name the built-in surface. a pattern the claims EMPTY
            // lifts the prefix instead and reads the surface directly, as the other leg does
            const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
            memoizeWholeInit(hostDeclarator, prop.scope, null, 'globalThis');
            flatTouchedMultiDecls.add(hostDeclarator.parentPath);
            noteWholeInitMemoHost(hostDeclarator);
            declarator = hostDeclarator.node;
            objectNode = resolveNestedReceiverNode(prop, { allowNavSegments: true, adapter }) ?? overPrefix;
          } else if (!isForInit && statementListOf(declaration.parentPath?.node) && !precedingDeclaratorsPure()) {
            // ... and where an EFFECTFUL sibling declarator stands AHEAD of the slot, the prefix may
            // not hoist over it - the declaration SPLITS at the slot instead: pre-siblings evaluate,
            // then the prefix, then this declarator with the rest. the split keeps the declarator
            // only when it is handed back as the slot's own list, and it REPLACES the path, so the
            // host is read again from the prop that travelled with it
            const at = declaration.node.declarations.indexOf(declarator);
            if (wrapperSlot >= 0) declInit.elements[wrapperSlot] = seqTailValue();
            else declarator.init = seqTailValue();
            splitDeclarationAtSlot({
              declaration,
              idx: at,
              sePrefix: prefixExprs,
              extractedDeclarators: [declarator],
            });
            const rehomed = hostDeclarationOf(prop);
            if (!rehomed?.node) return true;
            declaration = rehomed;
            declarator = prop.findParent(pp => pp.isVariableDeclarator())?.node;
            objectNode = overPrefix;
          } else if (isForInit) {
            // a LOOP HEAD hosts no statement of its own: the discarded init stays in the header,
            // where the emptied residual becomes the `_unused` sink the flatten route prints there,
            // and every reader spells the surface itself (`for (const m = _values(_g.Array.prototype),
            // a = _at(_g.Array.prototype), _unused = (eff(), _g);;)`)
            objectNode = overPrefix;
            surfaceRespelledHosts.add(declarator);
          } else if (wrapperSlot >= 0 && statementListOf(liftHost?.parentPath?.node)
            && arrayWrapperHolesBeside(prop, declaration) && precedingDeclaratorsPure()) {
            // ... and a level whose OTHER slots bind nothing lifts as a whole: the neighbours' effects
            // first, then this element's own prefix, all in source order, and what is left of the level
            // binds nothing (`push('n'); push('e'); const m = _flat(_globalThis.Array.prototype);`)
            for (const expr of arrayWrapperLeadingEffects(prop, declaration)) {
              liftHost.insertBefore(t.expressionStatement(expr));
            }
            for (const expr of prefixExprs) liftHost.insertBefore(t.expressionStatement(collapseLiftedStore(expr, prop)));
            declInit.elements[wrapperSlot] = seqTailValue();
            objectNode = overPrefix;
            emptiedWrapperHosts.set(prop.findParent(pp => pp.isVariableDeclarator()).node, declaration);
          } else if (statementListOf(liftHost?.parentPath?.node) && precedingDeclaratorsPure()
            && arrayWrapperHoistKeepsOrder(prop, declaration)) {
            for (const expr of prefixExprs) liftHost.insertBefore(t.expressionStatement(collapseLiftedStore(expr, prop)));
            if (wrapperSlot >= 0) declInit.elements[wrapperSlot] = seqTailValue();
            else declarator.init = seqTailValue();
            objectNode = overPrefix;
          }
        }
      }
    }
    // ... a POSITIONAL element resolves to no spelling at all - the pattern ITERATES, so no member
    // read stands for it - and takes the one route that needs none: the slot binds a minted name
    // and the dispatch reads that. new branch: `extractPositionalElementSlot`; checked canon:
    // `keepKeyInResidual` (keeps the key so the RESIDUAL spells the receiver - here the residual
    // BINDS it, and there is no key to keep), the memo channel (`plantReceiverMemo` reads an
    // expression the source already spells; a positional element has none), the wrapper pairing in
    // `resolveNestedReceiverChain` (pairs an element of a LITERAL init, which this init is not)
    if (kind === 'instance' && !objectNode) {
      const positional = resolvePositionalElementSlot(prop, adapter);
      if (positional
        && extractPositionalElementSlot({ prop, entry, hintName, positional, declaration, isForInit })) {
        return true;
      }
    }
    // an instance receiver that resolves to NOTHING (a call, an interpolated template, an unmatched hop) is
    // unextractable - leave native. the planner's `receiverIsSafe` short-circuit used to catch this, but the
    // `eliminateResidual` relaxation (which admits a side-effect-free member) no longer does, so guard here
    if (kind === 'instance' && !objectNode) return true;
    // the declarator hosting this leaf + whether it is the declaration's only binding and its init is pure -
    // lets the planner drop a dead residual / memoize a duplicated constant-literal receiver.
    // resolved by PARENT WALK, not source positions: a catch-born relocated declaration is
    // synthesized (no start/end), and a position find would miss it - initIsPure then reads
    // false and the dead-residual drop never fires
    // a CONDITIONAL / LOGICAL receiver (`c ? globalThis : userObj`, `m && globalThis`, `g || self`)
    // must NOT extract `const f = _polyfill` unconditionally: on a diverging ternary that binds the
    // polyfill on the user branch too, corrupting its legitimate `undefined`. decline (no emission) so
    // it falls through to the receiver-aware nested mirror, which swaps only the proxy operand(s) and
    // keeps the SE key in the residual LHS (runs once). a bare unconditional receiver keeps the sound
    // SE-extraction (the effect is preserved by the residual and the polyfill always wins). keyed on
    // receiver SHAPE, not proxy-name: the receiver may already be rewritten to an injected `_global`.
    // `outerDestructureReceiver` descends array wrappers (`[{ Array: { [se]: f } }] = [c ? gt : u]`)
    const recv = kind === 'instance' ? null : outerDestructureReceiver(prop.parentPath, prop.scope, adapter);
    if (recv?.type === 'ConditionalExpression' || recv?.type === 'LogicalExpression') return false;
    // ... and a FOR-HEAD drops its slot too when the extraction takes the declarator whole AND its
    // receiver is a resolved SURFACE: what the drop needs is a DECLARATOR slot, not a statement one,
    // and the header has that (`for (const m = _m(_g.Array.prototype); ...)`, the other leg's
    // spelling) - the dead residual kept there re-read that surface a second time for nothing. a
    // LITERAL receiver keeps its residual on both legs, which is the standing negative
    if (isForInit && isInstanceSurfaceNav(objectNode)
      && originalBindingCount(prop) === patternBindingCount(prop.node.value)) slotDropsAlone = true;
    const typedNavOwnsRead = typedNavReceiver
      && originalBindingCount(prop) === patternBindingCount(prop.node.value);
    // ... and so does ANY consumed declarator whose receiver a residual could not re-read for FREE:
    // the split renders one statement per declarator, so the extraction takes this one whole and the
    // siblings render beside it, where a kept residual would spell the receiver a second time and
    // fire its getter twice (`const { y: { at } } = { y: nb.y }, zn = 1`)
    if (!isForInit && objectNode && !isReReferenceableReceiver(objectNode)
      && bindingCount === patternBindingCount(prop.node.value)
      && (!wrapperSiblingElements || wrapperSiblingElements.elements.every(element => element === null))) {
      slotDropsAlone = true;
    }
    // the neighbour question asked of a NESTED leaf too: the wrapper around its OUTERMOST pattern,
    // with holes beside it, is the one that dies with the claim
    let outermost = prop.parentPath;
    while (outermost?.isObjectPattern() && outermost.parentPath?.isObjectProperty()) outermost = outermost.parentPath.parentPath;
    const deepWrapper = outermost?.isObjectPattern() && outermost.parentPath?.isArrayPattern() ? outermost.parentPath : null;
    const wrapperHolesBesideDeep = !!deepWrapper
      && deepWrapper.node.elements.every(element => element === null || element === outermost.node);
    // a RE-READABLE element - a bare binding, a built-in surface nav - needs no memo across its
    // TRAILING neighbours: native builds the whole literal before it reads anything off the slot,
    // so those neighbours lift as statements ahead of the dispatch, the wrapper dies with the
    // claim and the dispatch reads the surface inline - the other leg's shape (`[globalThis,
    // eff()]` -> `eff(); const m = _flat(_globalThis.Array.prototype)`). the lift itself waits
    // for the plan: a residual the plan keeps (a slot default's guard) keeps its neighbours too
    const deepInit = unwrapRuntimeExpr(declarator?.init);
    // a claim beside a SPREAD takes the positional route: the wrapper survives for the iteration,
    // and the memo route would mint a ref AND keep a husk residual reading it (`_ref = f(); [{}] =
    // [_ref, ...t]`) where the positional pair binds the element in the slot the pattern already
    // has (`[_ref] = [{ y: arr }, ...t]; m = _flat(_ref.y)` - the other leg's canon). a RE-READABLE
    // element needs no ref and reads inline beside the residual, except in a LOOP HEAD, where the
    // husk would be a declarator beside the binding one - the shape the standard lowering miscompiles
    if (kind === 'instance' && objectNode && deepWrapper && deepInit?.type === 'ArrayExpression'
      && deepInit.elements.some(item => item?.type === 'SpreadElement')
      && (isForInit || !(isReReferenceableReceiver(objectNode)
        || isReReadableSurfaceNav(objectNode, name => !!injector?.getBindingInfo?.(name))))) {
      const positional = resolvePositionalElementSlot(prop, adapter);
      if (positional && extractPositionalElementSlot({ prop, entry, hintName, positional, declaration, isForInit })) return true;
    }
    // a SINGLE-declarator host only: the lift lands ahead of the declaration, and a pre-sibling's
    // own init would then run after a neighbour the source ran after it. a sibling host keeps the
    // residual comma-joined instead, reading the surface inline beside it - the canon every
    // surviving residual of a sibling host takes on both legs
    const deepLiteral = kind === 'instance' && objectNode && wrapperHolesBesideDeep && !isForInit
      && deepWrapper.node === declarator?.id && deepInit?.type === 'ArrayExpression'
      && declaration.node.declarations.length === 1
      && bindingCount === patternBindingCount(prop.node.value)
      ? deepInit.elements : null;
    const deepSlot = deepLiteral ? deepWrapper.node.elements.indexOf(outermost.node) : -1;
    const trailingLiftPending = deepSlot >= 0 && !neighboursCarried && !computedKeyHasSideEffects(prop.node)
      && !mayHaveSideEffects(deepLiteral[deepSlot] ?? null)
      && (isReReferenceableReceiver(objectNode) || isReReadableSurfaceNav(objectNode, name => !!injector?.getBindingInfo?.(name)))
      && deepLiteral.slice(deepSlot + 1).some(item => item && mayHaveSideEffects(item))
      && deepLiteral.every(item => item?.type !== 'SpreadElement')
      && deepLiteral.slice(0, deepSlot).every(item => !item || !mayHaveSideEffects(item))
      && !!statementListOf((declaration.parentPath?.isExportNamedDeclaration() ? declaration.parentPath : declaration).parentPath?.node);
    if (trailingLiftPending) {
      receiverCarriesInit = true;
      neighboursCarried = true;
      slotDropsAlone = true;
    }
    const plan = planSideEffectKeyStrategy({
      polyfillKind: kind,
      isForInit,
      // RAW count, unlike `sourceSiblingHost`: the minted memo is exactly the binding an extraction
      // hoisted to a preceding statement would read before its own initializer
      isMultiDeclarator: declaration.node.declarations.length > 1,
      receiverNode: objectNode,
      // the residual is dead when THIS extraction takes every binding of the declaration - not when
      // the declaration happens to bind exactly one name. a pattern-valued extraction consumes its
      // whole inner pattern, so counting its slice is what keeps a sibling prop / a rest element
      // (whose bindings the extraction does NOT take) holding the residual
      // `bindingCount` is already the host DECLARATOR's own original binding count, so where each
      // declarator renders its own statement the declaration-wide count adds nothing.
      // under an ARRAY WRAPPER the other elements ride the same slot: each still COERCES its own
      // element, so only a wrapper whose remaining elements are holes may go up front - one whose
      // siblings are patterns waits for the post-traverse prune, which knows what they all consumed
      // ... or ride the receiver's own prefix, where the slots beside them are holes coercing nothing
      // ... and a hop keyed by an EFFECT keeps the declarator the way a rest sibling does: the hop
      // retires to a sentinel that runs the key, and the claim reads beside it
      soleBindingInDeclaration: (slotDropsAlone || typedNavOwnsRead || declaration.node.declarations.length === 1)
        && bindingCount === patternBindingCount(prop.node.value) && !effectfulHopAbove(prop)
        && (!wrapperSiblingElements || neighboursCarried
          || wrapperSiblingElements.elements.every(element => element === null)),
      // ... and a TYPED user nav owns that slot under a SIBLING-declarator host too: the split
      // canon renders one statement per declarator, and there the residual is not merely dead -
      // it would spell `nb.y` again and fire its getter twice where the source reads it once
      slotDropsAlone: slotDropsAlone || typedNavOwnsRead,
      // a TYPED user nav is spelled by the extraction itself, and the walk that resolved it proved
      // every hop level dies with the claim - so whatever residual survives (a wrapper kept for a
      // neighbour) reads the element, never these hops
      residualKeepsNoReader: typedNavReceiver,
      // under an ARRAY WRAPPER the init's purity question is about the OTHER elements: the
      // consumed one travels into the extraction, and only the neighbours would be erased by a
      // dropped residual. the element ITSELF still has to be effect-free - an effect inside it
      // belongs to the other leg's own prefix-lift channel, whose spelling this route does not
      // reproduce (`[arr as any]` extracts here, `[(effect(), arr)]` stays native)
      initIsPure: !!declarator && !mayHaveSideEffects(declarator.init.type === 'ArrayExpression'
        ? arrayWrapperOtherElements(prop, declaration) ?? declarator.init : declarator.init)
        && !mayHaveSideEffects(arrayWrapperLevels(prop, declaration)?.element ?? null),
      propKeyIsPure: !computedKeyHasSideEffects(prop.node),
      // ... and a receiver that performs every effect its init would carries it just as surely: the
      // dropped residual would have evaluated exactly what the dispatch now evaluates, once
      // ... not where the wrapper's HOLE effects were lifted ahead of the declaration: what is left
      // of the init is the slot alone, and the flat twin memoizes that slot rather than carrying it
      // (`eff(); const _ref = getArr(); const ci = _at(_ref)` on both legs)
      receiverCarriesInit: receiverCarriesInit
        || (initCarriedByReceiver && !(climb.wrapped && liftedHoleLevels.has(declaration.node))
          && receiverPerformsEveryInitEffect(declarator?.init, objectNode)),
      // an ARRAY-WRAPPED slot whose PRECEDING elements are pure: the memo evaluates the element
      // where native already evaluates it first, so the hoist observes nothing out of order even
      // though the literal as a whole is not pure
      memoHoistKeepsOrder: arrayWrapperHoistKeepsOrder(prop, declaration),
      // the receiver IS the whole initializer: a memo for it lands where the source evaluates it
      receiverIsWholeInit: !!declarator?.init && !!objectNode
        && unwrapRuntimeExpr(declarator.init) === unwrapRuntimeExpr(objectNode),
      // ... and a nav into the BUILT-IN namespace re-spells for free beside the residual that keeps
      // it, which is what an effect-bearing wrapper neighbour leaves as the only sound placement
      receiverReReadable: isReReadableSurfaceNav(objectNode, name => !!injector?.getBindingInfo?.(name))
        || navOffSlotRef(objectNode),
      // ... and whether that residual survives ONLY for a neighbour's effect (a call, a spread
      // beside a sole slot): the surface then re-spells inline instead of memoizing ahead of it
    });
    // null = an instance receiver the residual can't safely re-reference (non-Identifier / multi-declarator).
    // leave the destructure NATIVE (return handled): falling through to the default instance extract would
    // discard the whole destructure and with it the key's EFFECT. unplugin likewise leaves it native
    if (!plan) return true;
    // the trailing neighbours lift only where the plan DROPS the residual: kept, it runs them itself
    if (trailingLiftPending && plan.eliminateResidual) {
      liftDeclaratorInitSE(t, declarator, declaration,
        { wrapperDies: true, collapse: expr => collapseLiftedStore(expr, prop) });
    }
    return keepKeyInResidual({ prop, kind, entry, hintName, declaration, plan, objectNode, sourceSiblingHost,
      typedNav: typedNavReceiver });
  }

  // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
  // function-parameter destructure path (`function({ from }) {}` form) or the regular
  // VariableDeclarator / AssignmentExpression destructure path.
  // `meta` carries `fromFallback` for conditional init (`const { from } = cond ? Array : Set`):
  // rewriting would substitute the polyfill id for the whole receiver, breaking the other
  // branch (`_Set.from` is undefined). pure mode has no side-effect import channel either,
  // so we leave the code intact and warn - runtime correctness depends on which branch
  // fires and on native availability
  // a SEALED probe init (`{ of } = (globalThis.window?.self).Array`): the collapse drops
  // the read the source performs on the sealed VALUE - prepend it as a THROW probe so an
  // absent `window` throws before ANY binding, exactly as the untranspiled source does
  function sealedProbedDestructureValue(prop, value) {
    // ONE probe per pattern, and only on a FULL consume: extraction removes each handled
    // prop from the pattern, so the LAST prop standing sees itself alone - any residual
    // (leftover props, rest) re-reads the init and carries the throw AND the key SE itself,
    // making a probe a double run
    const props = prop.parentPath?.node?.properties;
    if (!props || props.length !== 1 || props[0] !== prop.node) return value;
    const sourceNode = destructureSourceNode(prop);
    // the whole init is discarded here (one prop standing, no residual), so a store the source
    // wrote inline is re-emitted exactly once - the claim channels keep theirs and take no store.
    // a SEQUENCE around the init is no obstacle: the probe reproduces its TAIL and the effect
    // channel keeps the prefix, split on the probe's own offset
    const throwProbe = sourceNode && sealedClaimThrowProbeNode?.(prop, sourceNode, { allowStoreHolder: true });
    // the probe READ is an already-decided render - the alias arm spells it from a RAW source
    // read the member visitor would otherwise re-claim on insertion. NODE-level seed only:
    // everything inside the probe stays live for re-entry (a key-SE claim, the guard test)
    if (throwProbe) {
      skippedNodes.add(throwProbe.node);
      if (Number.isInteger(throwProbe.navStart)) probeNavStarts.set(throwProbe.node, throwProbe.navStart);
      return t.sequenceExpression([throwProbe.node, value]);
    }
    // a BARE probed nav (`{ structuredClone } = (globalThis.window?.self)` - no member read
    // to seal): native throws reading the pattern key off the probe value, so re-emit that
    // read as `(guard).<key>` ahead of the binding. the key comes from the canon, so a
    // static-string / template spelling of the SAME slot re-emits the same read - read as
    // Identifier-only, those spellings dropped the probe and answered where native throws. a
    // computed SE key still keeps its residual channel (the canon does not fold one), and a
    // nav the shared guard plan cannot collapse keeps today's render
    const bareKey = propertyKeyName(prop.node);
    const probedInit = bareKey && sourceNode && probedNavGuardValueNode
      ? probedDestructureInitValue(sourceNode, ({ name }) => resolveGlobalPure(name),
        { scope: prop.scope, adapter, path: prop }) : null;
    if (probedInit) {
      const navNode = peelNestedSequenceExpressions(probedInit).tail ?? probedInit;
      const guarded = probedNavGuardValueNode(navNode, prop);
      // a slot name that is not spellable bare (`{ 'a-b': v }`) re-reads computed
      if (guarded) {
        // same node-level skip seeding as `probeKeyReadNode`: the probe read is an already-
        // decided render, its guard test stays live for the re-entry root substitution
        const read = isValidIdentifierName(bareKey)
          ? t.memberExpression(guarded.node, t.identifier(bareKey))
          : t.memberExpression(guarded.node, t.stringLiteral(bareKey), true);
        skippedNodes.add(read);
        return t.sequenceExpression([read, value]);
      }
    }
    return value;
  }

  // the enclosing destructure SOURCE expression (declarator init / assignment right) for a
  // pattern property - the read the source performs before any binding lands
  function destructureSourceNode(prop) {
    for (let p = prop.parentPath; p; p = p.parentPath) {
      if (p.isVariableDeclarator()) return p.node.init;
      if (p.isAssignmentExpression()) return p.node.right;
      if (!p.isObjectPattern() && !p.isObjectProperty() && !p.isArrayPattern()) return null;
    }
    return null;
  }

  // per-branch synth-swap on ConditionalExpression / LogicalExpression branches: each viable branch
  // becomes its own `{key: _Branch$key}` literal, preserving runtime conditional semantics
  function registerFallbackBranchSynth({ prop, meta }) {
    // per-branch synth-swap on ConditionalExpression / LogicalExpression branches: each
    // viable branch becomes its own `{key: _Branch$key}` literal, preserving runtime
    // conditional semantics. receiver lives either on a destructure wrapper slot
    // (`{p} = R`) or as the IIFE call-arg (`(({p}) => body)(R)`) - both shapes are
    // unified by `resolveFallbackReceiverPath`. non-viable branches stay raw and the
    // identifier visitor still rewrites bare globals via the standard path
    // the same value-capture gate the provider's whole-receiver synth plan applies: replacing a
    // branch of `host = ({ k } = shim || Object)` with a mirror literal hands `host` the literal
    // instead of the branch object. the receiver's own value wins over the leaf here - the same
    // trade the unplugin emitter makes, whose gate sits ahead of the registration
    const rhsPath = destructureAssignmentValueIsCaptured(prop)
      ? null : resolveFallbackReceiverPath(prop.parentPath?.parentPath, prop.parentPath?.node);
    // the winning CALL-ARG leaves the wrapper-default live on its undefined-shaped arm -
    // thread the default so the leaf substitutes it there (the shared S081-1 rule)
    const wrapperNode = prop.parentPath?.parentPath?.node;
    const undefinedArmFallback = wrapperNode?.type === 'AssignmentPattern' && rhsPath && rhsPath.node !== wrapperNode.right
      ? wrapperNode.right : null;
    const registered = rhsPath && synthSwap.tryRegisterPerBranchSynth(rhsPath, prop, { undefinedArmFallback });
    // warn only for a GENUINE candidate a structural pattern issue blocked - not for a key no
    // branch actually polyfills (the build tags `object` permissively), which would lie. the gate
    // is a debug-only concern, so skip it unless debug output is on
    const debug = getDebugOutput();
    if (!registered && debug
      && fallbackDestructureHasPolyfillableBranch({ meta, path: prop, adapter, resolvePure })) {
      debug.warn(conditionalDestructureLeftUntouchedWarning(meta.key));
    }
  }

  // eslint-disable-next-line max-statements -- the per-prop route dispatch: one branch per route
  function handleObjectPropertyResult({ prop, meta, kind, entry, hintName }) {
    // a key-swap survivor of an already-rendered flatten / fold (revisits re-enter here
    // after the host rebuild requeues the pattern subtree): the natural computed-key
    // visitor owns the key-text, nothing to extract
    if (keySwapOwnedProps.has(prop.node)) return;
    // a prop a prior pass already claimed (its overwrite rebind, substituted default,
    // minted computed key or printed sentinel stands beside it) - the shared census
    // family, ahead of every route
    if (ownEmittedPatternClaim(prop, ownOutputTests(injector))
      || sentinelAlreadyProcessed(prop, { node: prop.node, meta, injector })) return;
    // the group's size is read HERE, at the first prop of it to dispatch - the emissions below
    // splice props out, and the receiver plan must judge the group the source wrote
    patternSizeOf(prop.parentPath);
    noteRetainedForInitHost(prop);
    // claim the whole enclosing pattern chain up front (before any branch can bail) - the
    // synth-swap proxy-hop collapse keys its defer on the ROOT pattern; an unclaimed pattern
    // collapses there like a non-destructure receiver
    for (const pattern of collectEnclosingObjectPatterns(prop.parentPath)) {
      synthSwap.claimDestructurePattern(pattern);
    }
    // snapshot the original binding count BEFORE any sibling prop's emission below mutates the pattern,
    // so a later instance prop's `soleBindingInDeclaration` reflects the source, not the shrunken pattern
    originalBindingCount(prop);
    // every leaf of this pattern is asked for its receiver TYPE while the pattern still reads as the
    // source wrote it: the routes below rewrite it - a consumed hop leaves, a memo takes the init's
    // place - and a leaf asked after that reads a shrunken path, taking the generic dispatcher where
    // its sibling narrowed. the resolver caches by prop, so this only moves the question earlier
    primeDestructureReceiverTypes(prop);
    // a wrapper level whose OTHER slots are holes evaluates them for their effects alone: those lift
    // ahead of the declaration, in source order, before any route below reads the level - what stays
    // is the elision the pattern already reads, and every question about the init then sees a level
    // the source's own reads leave behind (`[, { y: { at } }] = [eff(), { y: nb.y }]`)
    // ... not ahead of a per-branch MIRROR: it swaps arms inside the level and keeps the level whole,
    // so the holes' effects run where the source wrote them, the other leg's shape
    if (!meta?.fromFallback) liftWrapperHoleEffects(prop);
    // polyfill-always-wins canon: a multi-element ArrayPattern wrapper extracts the static even
    // when the consumed key carries a SE (the residual keeps the raw key, its effect runs once in
    // source order) - the SE-key dispatch below would otherwise preempt into the weaker
    // native-wins inline default, diverging from the non-SE shape and from the unplugin emitter.
    // the shared plan self-gates (declarator host only, no conditional receiver, non-instance)
    if (!meta?.fromFallback && tryExtractArrayWrappedStatic({ prop, entry, hintName, kind })) return;
    if (sekeySymbolKeepsKeySwap(prop, meta, entry)) return;
    if (!meta?.fromFallback && computedKeyHasSideEffects(prop.node)
      && handleSideEffectComputedKey({ prop, kind, entry, hintName, meta })) return;
    // a symbol prop on a declarator the flatten OWNS (its plan consumes the prop) routes to
    // the flatten's own synth extraction - regardless of which prop dispatched first, so the
    // per-prop instance routes below never race the rebuild. sits ABOVE the fromFallback
    // branch: the plan exists only for a wholly-discardable fallback init (an all-proxy
    // ternary - the flatten/extract canon), a diverging receiver bails the plan and keeps
    // the per-branch mirror
    // the flatten render may declare THIS prop a key-swap survivor (a defaulted value) -
    // the rebuilt residual keeps it, the instance routes below must not steal it
    if (meta && isSourcedSymbolIteratorMeta(meta) && flattenPlanConsumesProp(prop)
      && (tryFlattenNestedProxyDestructure(prop) || keySwapOwnedProps.has(prop.node))) return;
    // a RELOCATED catch pattern reaches here as an ordinary declarator - written that way by a
    // sibling, by the unplugin emitter's earlier phase, or by hand. its bindings are block-scoped to the
    // catch, so the same per-prop liveness rule the clause form gets applies: a binding the body
    // never reads is not worth an import and a dispatcher call. the clause form itself never gets
    // here twice - `extractCatchClause` already dropped its unobservable props before relocating
    // the clause form never arrives here twice - `extractCatchClause` drops its unobservable
    // props before relocating; what reaches this gate is a declarator someone else wrote
    if (relocatedCatchPropUnobservable({
      declaratorPath: prop.parentPath?.parentPath, propNode: prop.node, patternNode: prop.parentPath.node,
      localName: propBindingIdentifier(prop.node.value)?.name ?? null, walkNode: traverseWithParent,
    })) return;
    if (meta?.fromFallback) {
      registerFallbackBranchSynth({ prop, meta });
      return;
    }
    const objectPattern = prop.parentPath;
    // patternParent walks past transparent destructure wrappers (AssignmentPattern default,
    // single-element ArrayPattern) - both are passthrough for proxy-global resolution
    const { parent: patternParent } = peelTransparentWrappers(objectPattern);
    if (isFunctionParamDestructureParent(objectPattern)) {
      handleParameterDestructure({ prop, kind, entry, hintName, meta });
      return;
    }
    // nested proxy-global destructure: `{ Array: { from } } = globalThis`. default
    // (`from = _Array$from`) wouldn't fire - `globalThis.Array` is always present and
    // `Array.from` is non-undefined on every engine we target (may just be buggy).
    // flatten the outer structure when it's a single-nested shape: replace the whole
    // VariableDeclarator with `const from = _Array$from` so the polyfill ALWAYS wins
    // an INSTANCE receiver carried by the pattern's own default is mirrored the same way a
    // parameter's is - the default is the receiver, and replacing it keeps the caller's object
    // destructuring natively. only the receiver-less nested forms fall through to the SE-key path
    // ... but the FLAT TWIN comes first where the shape has one: the mirror replaces the DEFAULT, so
    // it polyfills the arm that may never run and leaves the live one raw, while the twin folds both
    // arms off a single read. the normalization owns whether such a twin exists (the host has to
    // afford the memo); where it declines, the mirror is still the best answer available
    if (kind === 'instance' && normalizeNestedLeafSiblings(prop)) return;
    if (kind === 'instance' && objectPattern.parentPath?.isAssignmentPattern()
      && tryRegisterParamDefaultInstanceSynth({ prop, entry, hintName })) return;
    if (patternParent?.isObjectProperty() && kind !== 'instance') {
      if (tryFlattenNestedProxyDestructure(prop)) return;
      if (tryStaticOverwriteUnderMultiWrapper({ prop, entry, hintName })) return;
      // conditional receiver: mirror each proxy operand per branch. when the pattern can't be
      // mirrored (rest / computed / duplicate key) the shared plan bails to native if any reachable
      // value branch is a non-proxy (a `= _polyfill` default would corrupt its legitimate undefined);
      // a proxy-only receiver keeps the sound inline default
      handleParameterDestructure({ prop, kind, entry, hintName, meta });
      return;
    }
    // nested INSTANCE method (`{ y: { flat: m } } = { y: arr }`, or array-wrapped `[{ y: { flat: m } }] =
    // [{ y: arr }]` / `[{ flat: m }] = [arr]`): the static flatten doesn't apply (the receiver is an
    // instance, not a constructor). delegate to the shared SE-key path - for a declaration it resolves the
    // nested receiver through object keys AND array indices (bare Identifier only, else native), respects
    // the planner (bails a multi-declarator / non-Identifier receiver, routes a for-init to a sibling
    // declarator), and extracts `const m = _flatMaybeArray(recv)`; for an assignment host it emits the
    // post-statement overwrite. an ArrayPattern host peels past `patternParent` (a single-element wrapper
    // collapses to the declarator), so gate on it directly
    // a TOP-LEVEL pattern-valued `[Symbol.iterator]` prop routes through the same pipeline:
    // its extraction destructures the helper result (see `keepKeyInResidual`), which the
    // standalone channel below cannot host (it collects bare-Identifier bindings only)
    if ((patternParent?.isObjectProperty() || objectPattern.parentPath?.isArrayPattern()
      || (entry === SYMBOL_ITERATOR_PURE_RESULT.entry && isSymbolIteratorPatternProp(prop.node)))
      && kind === 'instance') {
      handleSideEffectComputedKey({ prop, kind, entry, hintName, meta });
      return;
    }
    // transparent wrap between ObjectPattern and host (`const [{from}] = wrapper` -
    // ArrayPattern peeled): no outer Property to inline a default on, so try flatten
    // directly. `peelTransparentWrappers` walks the same wrappers inside the flatten
    // chain walk, so the rewrite reaches the same VariableDeclarator. bail silently
    // when flatten can't (multi-prop ObjectPattern, complex shape) since there's no
    // alternative emission path for ArrayPattern-wrapped destructures
    if (objectPattern.parentPath?.node !== patternParent?.node && kind !== 'instance') {
      // ArrayPattern wrap + rest sibling flows into the same rest-aware cascade as the unwrapped
      // shapes: babel's sentinel rename mutates the pattern IN PLACE and unplugin splices the
      // rebuilt pattern back into the original LHS text, so the wrap survives on both and rest
      // keeps reading the matching init element
      if (tryFlattenNestedProxyDestructure(prop)) return;
      // ... and where the flatten declines because the host is a for-x HEAD - it holds no statement
      // for the extraction to land in - the mirror answers in the ELEMENT instead, wrapper and all
      let headHost = objectPattern.parentPath;
      while (headHost?.node?.type === 'ArrayPattern') headHost = headHost.parentPath;
      if (headHost?.isVariableDeclarator() && forOfHeadElements(headHost)) {
        handleParameterDestructure({ prop, kind, entry, hintName, meta });
      }
      return;
    }
    if (!canTransformDestructuring(prop)) {
      // a for-x HEAD holds no init for the value swap below to rewrite, so the shape gate turns it
      // away - but what it destructures IS a value: the element of the iterated literal, which the
      // mirror swaps in place. the relocation that would otherwise mint a host for this claim stands
      // down for exactly these patterns (the shared plan decides), so the mirror is what answers
      if (kind !== 'instance' && forOfHeadElements(objectPattern.parentPath)) {
        handleParameterDestructure({ prop, kind, entry, hintName, meta });
      }
      return;
    }
    // ctor alias (kind global): trust-register the hint. a REFUSED registration (conditional /
    // cross-fn write, dirty binding, conditional `var` decl) only withholds the member-narrow hint;
    // the value swap below still runs - it is value-correct on every path (the polyfill lands
    // exactly when the native write would run), and dropping it would strip the polyfill from
    // conditional forms (`while (c) var { Promise } = globalThis`)
    if (kind === 'global') registerCtorAliasFromProperty(prop, hintName);
    // export + rest of a static: polyfill it like the nested-proxy export+rest path - the
    // consumed key renames to `_unused` (a named export, as the nested path also emits) and the
    // extracted static binds via the new `const <local> = _Polyfill`. skipping here would leave
    // the static native and undefined on engines without it ("polyfill always wins")
    let value;
    if (kind === 'instance') {
      // a STATIC-placement meta names the constructor the receiver denotes (`Array` for both
      // `(eff(), Array)` and a call whose return type is the ctor); a prototype/instance meta
      // carries a lowercase TYPE HINT instead, which is not a global name and must not register
      const objectNode = resolveDestructuringObject(prop, resolvePropertyObjectType(prop), false,
        meta?.placement === 'static' ? meta.object : null);
      if (!objectNode) return;
      // collapse a SE-wrapped proxy-global source receiver (`(c++, globalThis.self).Array.prototype`) BEFORE
      // wrapping it in the instance polyfill: the wrap hides it from the post-statement collapseRetainedProxyReceiver
      // and the natural visitor skips it (the provider marks the wrapped root handled). mirrors the instance-call path
      const instAliasCtx = aliasCtxFromPath(prop);
      // `true` (allowSideEffectKeys): a SE-bearing computed proxy hop (`(e++, globalThis)[(c++, 'self')].Array
      // .prototype`) otherwise bails the prefix to the bare root, hiding the hop from this gate; the collapse
      // itself routes the dropped key SE through the call-rooted plan (`(e++, c++, _globalThis).Array.prototype`)
      const collapsedObj = instAliasCtx && maximalProxyGlobalHop(objectNode, instAliasCtx, { allowSideEffectKeys: true })
        ? synthSwap.collapseProxyGlobalReceiver(objectNode, { aliasCtx: instAliasCtx }) : null;
      // through the shared receiver copy: the kept-nav collapse of a chain-assign inside the
      // receiver is deferred and matches by NODE, so the copy this emit hands the helper has to
      // register for it in its own right (see the helper's own contract)
      value = markThrowingExtraction(t.callExpression(injectPureImport(entry, hintName),
        [cloneReceiverForEmit({ t, collapse: collapseKeptNavValueNode, node: collapsedObj ?? objectNode, path: prop })]));
      // a `X || fallback` logical source (`{flat} = (c++, globalThis.self).Array.prototype || {}`) keeps each
      // operand live; the single-member gate above misses it, so collapse the proxy hop in the WRAPPED operands
      // (collapseRetainedProxyReceiver recurses logical operands) - else an evaluated proxy operand reads raw `.self`
      if (objectNode?.type === 'LogicalExpression') {
        collapseRetainedProxyReceiver(synthSwap, value.arguments, 0, instAliasCtx);
      }
    } else {
      value = sealedProbedDestructureValue(prop, injectPureImport(entry, hintName));
    }
    // body-extract alias for static methods: AST mutation rewrites the destructure value
    // to `_unused` (rest sibling) or removes the prop entirely, leaving the new
    // `const <localName> = _Polyfill$Method;` shadow declaration as the only path receiver
    // narrowing can find. injector lookup `getBindingInfo(localName).entry` returns the
    // canonical entry path, so `arr = from('hi'); arr.at(-1)` narrows correctly post-mutation
    if (kind === 'static') {
      const localName = patternBindingName(prop.node.value);
      if (localName) {
        injector.registerBodyExtractAlias(localName, entry, prop.scope.getBinding(localName));
      }
    }
    // mark property as handled - rest-rename triggers re-traversal which must be skipped
    skippedNodes.add(prop.node);
    handleDestructuredProperty(prop, value);
    skipEmptyPatternInit(prop);
  }

  // `walkNode(root, visit(node, parent))` over a raw babel subtree: `t.traverseFast` hands the
  // visitor no parent, and the provider's reference-position filters need one
  function traverseWithParent(root, visit) {
    t.traverse(root, (node, ancestors) => { visit(node, ancestors.at(-1)?.node ?? null); });
  }

  // catch-clause receiver relocation - `catch ({ code }) { ... }` -> `catch (_ref) { let { code } = _ref; ... }`
  // - as the shared planner decides it; this half is the host surgery (ref allocation, the
  // unshift into the body, the born-declaration registration)
  function extractCatchClause(path) {
    const { param } = path.node;
    const plan = planCatchClauseExtraction({
      paramNode: param,
      bodyNode: path.node.body,
      scope: path.scope,
      adapter,
      path,
      resolvePure: meta => resolvePure(meta, path),
      walkNode: traverseWithParent,
    });
    if (!plan) return;
    for (const p of plan.unobservable) skippedNodes.add(p);
    // use our own `_ref, _ref2, ...` generator instead of babel's `scope.generateUidIdentifier`
    // - keeps one naming scheme across the plugin and matches unplugin's output shape
    const ref = injector.generateLocalRef(path.scope);
    const relocated = t.variableDeclaration('let', [t.variableDeclarator(param, ref)]);
    catchBornDeclarations.add(relocated);
    path.get('body').unshiftContainer('body', [relocated]);
    path.node.param = ref;
  }

  // a LOOP HEAD is the catch param's twin: the loop variable binds per iteration and has no
  // declaration a claim could extract into, so the relocation gives it one - the head takes a minted
  // name and the pattern moves to the body's first statement (`for (const { flat } of rows)` ->
  // `for (const _ref of rows) { const { flat } = _ref; ... }`). the KIND travels with it, which is
  // what keeps `const`'s per-iteration binding, and a bodyless loop is braced around the pair.
  // the plan is the catch host's own: the question - does relocating buy a claim its host - and the
  // predicates that answer it are the same, so the two hosts cannot drift apart
  function extractLoopLeft(path) {
    const left = path.get('left');
    if (!left.isVariableDeclaration() || left.node.declarations.length !== 1) return;
    const [declarator] = left.node.declarations;
    // an assignment target (`for ({ at } of rows)`) declares nothing to relocate, and an
    // already-plain binding needs no host
    if (declarator.init || !declarator.id || declarator.id.type === 'Identifier') return;
    const typeProbe = firstPatternProp(left.get('declarations')[0].get('id'));
    const elementType = typeProbe ? resolvePropertyObjectType(typeProbe) : null;
    const plan = planCatchClauseExtraction({
      paramNode: declarator.id,
      bodyNode: path.node.body,
      scope: path.scope,
      adapter,
      path,
      resolvePure: meta => resolvePure(meta, path),
      walkNode: traverseWithParent,
      objectHint: toHint?.(elementType) ?? null,
      iterableNode: path.node.right,
      mirrorHosts: !!forOfHeadElements(left.get('declarations')[0]),
    });
    if (!plan) return;
    for (const p of plan.unobservable) skippedNodes.add(p);
    const ref = injector.generateLocalRef(path.scope);
    const slot = t.cloneNode(ref);
    // the relocated pattern is RE-DETECTED off the minted name, and a name has no shape the type
    // ladder can walk back to the iterated value - so the ELEMENT's type is stashed on it first,
    // the pre-mutation channel the resolver keeps for exactly this. without it the loop variable
    // reads as unknown, which both over-injects (a plain data key pulls its family's ponyfill) and
    // under-narrows (a real claim ships the generic dispatcher)
    if (elementType) resolvedType.set(slot, elementType);
    // the relocated declaration takes `let` where the head wrote `const`: a claim's own default guard
    // folds its test ref in as an initializer-less declarator, which `const` cannot carry - and the
    // per-iteration binding the source asked for comes from the HEAD, which keeps its kind
    const relocatedKind = left.node.kind === 'const' ? 'let' : left.node.kind;
    const relocated = t.variableDeclaration(relocatedKind, [t.variableDeclarator(declarator.id, slot)]);
    catchBornDeclarations.add(relocated);
    if (!path.get('body').isBlockStatement()) path.get('body').replaceWith(t.blockStatement([path.node.body]));
    path.get('body').unshiftContainer('body', [relocated]);
    declarator.id = ref;
    // the head now declares a MINTED name, and a `var` one hoists into an owner whose var index
    // may already be built - drop it, or the relocated pattern reads a receiver with no writes
    if (left.node.kind === 'var') invalidateScopeVarIndex(path);
    // the head's minted binding is born mid-traversal, and the relocated pattern is RE-DETECTED
    // against it: a receiver the scope cannot name is a receiver whose STATICS cannot be claimed
    // (`{ fromEntries } of [Object]`), because the type stash above answers for instance members
    // alone - a constructor has no value-type to stash. the name is fresh, so registering it here
    // cannot collide the way re-registering a rewritten sibling would
    // the head's minted binding is born mid-rewrite, and the relocated pattern is RE-DETECTED
    // against it: a receiver no scope can name is a receiver whose STATICS are lost, because the
    // type stash above answers for instance members alone - a constructor has no value-type to
    // stash. the loop's OWN scope is re-crawled rather than hand-registered: registering a
    // declarator leaves the kind `unknown` (every constancy gate reads that as "not a binding I
    // may narrow through"), and registering the declaration collides with the program-exit crawl
    // ("Duplicate declaration" on an injected helper, measured on the e2e bundle)
    path.scope.crawl();
  }

  // ---------- per-prop AST emission (strategy-dispatched) ----------

  // plant `<ref> = <value>` for a memoized receiver, ahead of the host but never ahead of what the
  // source evaluates first: a declarator host takes a SIBLING DECLARATOR at its own source slot,
  // because a declaration-level insertBefore hoists the memo above earlier declarators and reorders
  // their side effects. the post-traverse split renders such a memo as its own `const`.
  // an EXPORTED host must not export the internal temp: a first-declarator memo (nothing to reorder
  // past) becomes a bare statement before the export instead
  // the elements a sequence evaluates BEFORE this one: discarded values, so each becomes a statement
  // ahead of the host, in source order. the element itself stays where it is, and a memo planted for
  // it then lands behind those effects rather than in front of them
  function liftLeadingSequenceElements(host) {
    const element = discardedSequenceElementPath(host);
    const sequence = element?.parentPath;
    if (!sequence?.isSequenceExpression?.()) return;
    const at = sequence.node.expressions.indexOf(element.node);
    if (at <= 0) return;
    const leading = sequence.node.expressions.splice(0, at);
    findStatementParent(sequence).insertBefore(leading.map(expr => t.expressionStatement(expr)));
  }

  function plantReceiverMemo({ host, declarationPath, ref, value }) {
    // ahead of whatever this host already emitted: a static extracted BEFORE the memoizing prop
    // was planted at the host, and the memo carries the init's effects, which the source runs
    // first. the anchor is a live path (the drain re-renders it, it is never removed here)
    const memoAnchor = hostFirstInsert.get(declarationPath?.node) ?? hostFirstInsert.get(host.node) ?? null;
    const exportHost = declarationPath?.parentPath?.isExportNamedDeclaration() ? declarationPath.parentPath : null;
    if (memoAnchor?.node) {
      // the anchor is whatever slot that first artifact took: a sibling-declarator host recorded a
      // DECLARATOR, and a declaration cannot go in a declarator list
      if (memoAnchor.isVariableDeclarator()) insertMemoDeclarator(memoAnchor, ref, value);
      else {
        memoAnchor.insertBefore(t.variableDeclaration(declarationPath?.node.kind ?? 'const',
          [t.variableDeclarator(ref, value)]));
      }
    } else if (exportHost && host.node === declarationPath.node.declarations[0]) {
      const memoDeclarator = t.variableDeclarator(ref, value);
      memoDeclarators.add(memoDeclarator);
      // ... standing apart beside SIBLINGS it binds nothing the source named: `const`, the split's
      // kind for it; a SOLE host's memo keeps that host's kind, the statement insert's shape
      const kind = declarationPath.node.declarations.length > 1 ? 'const' : declarationPath.node.kind;
      exportHost.insertBefore(t.variableDeclaration(kind, [memoDeclarator]));
      exportMemoHosts.add(declarationPath.node);
    } else if (host.isVariableDeclarator()) {
      insertMemoDeclarator(host, ref, value);
      if (exportHost) flatTouchedMultiDecls.add(declarationPath);
    } else {
      // a host in a DISCARDED sequence element has no statement of its own, and `insertBefore` on an
      // expression path turns it into a block whose body holds that expression - the memo hoists
      // ahead of the statement the sequence sits in instead
      const anchor = assignmentInStatementPosition(host) || !discardedSequenceElement(host)
        ? blockWrappedHostStatement(host) : findStatementParent(host);
      anchor.insertBefore(t.variableDeclaration('const', [t.variableDeclarator(ref, value)]));
    }
  }

  // the EXPORTED declarations whose memo stands as a local statement ahead of them: the memo could
  // not join their declarator list, so the extraction joins it instead, behind the residual - the
  // one shape a memoized host takes wherever the memo declarator itself would have stood
  const exportMemoHosts = new WeakSet();

  // the host is the first declarator the SOURCE wrote, and the declaration is not a loop header
  // (whose declarators have no statement slot to precede them)
  function firstSourceDeclaratorHost(declarationPath, hostNode) {
    if (isForInitDeclaration(declarationPath.parentPath?.node, declarationPath.node)) return false;
    const sourceDeclarators = sourceDeclaratorsOf(declarationPath);
    return sourceDeclarators.length > 0 && sourceDeclarators[0] === hostNode;
  }

  function insertMemoDeclarator(anchor, ref, value) {
    const memoDeclarator = t.variableDeclarator(ref, value);
    memoDeclarators.add(memoDeclarator);
    anchor.insertBefore(memoDeclarator);
  }

  // resolve the destructure receiver: the DECISION is the shared provider plan (one procedure
  // for both emitters); this function only RENDERS the whole-init-memo channel on the AST
  // substrate - every other channel returns the plan's node as-is
  // `ctorName` - the constructor the receiver DENOTES, as the dispatching prop's own meta named it.
  // this emitter mutates the host in place, so the memo REPLACES the init and every prop after the
  // memoizing one resolves against a bare `_ref` instead of the original receiver; the unplugin emitter
  // keeps the source AST and never loses it. without the name, a sibling STATIC after the first
  // instance prop (`const { name, of } = (eff(), Array)`) stays a native read - undefined on ie11
  function resolveDestructuringObject(path, typeOfReceiver, allowSeFreeSingleRead = false, ctorName = null,
    allowInitCarriedEffects = false) {
    const plan = resolveDestructureReceiverPlan(path, {
      allowSeFreeSingleRead, allowInitCarriedEffects, adapter, resolvePureGlobal: resolveGlobalPure,
      patternSize: patternSizeOf(path.parentPath),
    });
    // an ARRAY-WRAPPED element memoizes at the DECLARATION: `const _ref = <element>` lands ahead
    // and the wrapper array reads `_ref` in its slot, so residual and extraction share one
    // evaluation (the shared plan proved the hoist keeps source order)
    if (plan.channel === 'array-element-memo') {
      const wrapper = path.parentPath.parentPath;
      const declaratorPath = wrapper.parentPath;
      const declarationPath = declaratorPath.parentPath;
      // a BODYLESS control slot has no statement list to plant the memo in: the insert would
      // block-wrap the body and RE-POINT the caller's declaration path at that block, whose
      // `.declarations` the strategy below reads. the element reads raw there instead
      if (isBodylessStatementSlot(declarationPath.parentPath?.node, declarationPath.node)) return plan.node;
      // ... and behind an EFFECTFUL predecessor nothing may hoist: the memo takes the SLOT itself,
      // a write the literal performs exactly where native evaluates the element, and every reader
      // follows the declaration (`var _ref; const [, {...}] = [eff(), _ref = X]; const a = _at(_ref)`)
      const initPath = declaratorPath.get('init');
      const { elements } = (initPath.node.type === 'ArrayExpression'
        ? initPath : peelTransparentWrapperPath(initPath)).node;
      if (plan.inSlot) {
        return writeSlotMemo({ owner: elements, key: plan.elementIndex, node: plan.node, scope: path.scope, typeOfReceiver });
      }
      const ref = generateLocalRef(path.scope);
      const elementSlot = t.cloneNode(ref);
      // the type rides across the memo on the node that TAKES the element's place: every prop after
      // the memoizing one asks what the pattern reads from, and by then that is this bare `_ref` -
      // unresolvable, so the claim shipped the generic dispatcher where its first sibling shipped
      // the narrowed one (`const [{ flat, at }] = [nb.y]` - `at` alone lost it)
      if (typeOfReceiver) resolvedType.set(elementSlot, typeOfReceiver);
      elements[plan.elementIndex] = elementSlot;
      plantSlotMemo({ declarationPath, declaratorPath, ref, value: plan.node });
      const elementRead = t.cloneNode(ref);
      if (typeOfReceiver) resolvedType.set(elementRead, typeOfReceiver);
      return elementRead;
    }
    // an OBJECT slot memo: the slot value moves to a ref both readers take - hoisted ahead of the
    // declaration where the source evaluates nothing observable before it, written in the slot
    // otherwise (`w: _ref = eff()`); the array element memo one level of keys down
    if (plan.channel === 'object-slot-memo') {
      const declaratorPath = path.findParent(item => item.isVariableDeclarator());
      const declarationPath = declaratorPath?.parentPath;
      if (!declarationPath?.isVariableDeclaration()
        || isBodylessStatementSlot(declarationPath.parentPath?.node, declarationPath.node)) return null;
      let written;
      if (plan.hoist) {
        const ref = generateLocalRef(path.scope);
        slotMemoRefNames.add(ref.name);
        written = t.cloneNode(ref);
        plan.prop.value = t.cloneNode(ref);
        plantSlotMemo({ declarationPath, declaratorPath, ref, value: plan.node });
      } else {
        written = writeSlotMemo({ owner: plan.prop, key: 'value', node: plan.node, scope: path.scope, typeOfReceiver });
      }
      // the segments the leaf navigates on from the slot spell off the ref (`_ref.Array.prototype`) - a
      // pure read of a local ref, re-readable for free like the built-in surface it names
      written = plan.navKeys.reduce((acc, key) => t.memberExpression(acc, t.identifier(key)), written);
      if (typeOfReceiver) resolvedType.set(written, typeOfReceiver);
      if (!plan.hoist) inSlotMemoRefs.add(written);
      return written;
    }
    if (plan.channel !== 'whole-init-memo') {
      // the node this returns becomes the INIT the re-detected claim reads, and the pattern that
      // answered the type is rebuilt by then - the leaf asking again gets a fresh node the cache
      // cannot know. so the answer rides the node that takes its place, the way the memo channels
      // above already carry it
      if (typeOfReceiver && plan.node) resolvedType.set(plan.node, typeOfReceiver);
      return plan.node;
    }
    return memoizeWholeInit(path.parentPath.parentPath, path.scope, typeOfReceiver, plan.proxyCtor ?? ctorName);
  }

  // does the flatten plan of this prop's host declarator, read over the given init (the source's
  // with its prefix taken off), consume EVERY outer prop? the per-prop route sees one claim at a
  // time, so the question "will a residual survive" is asked of the plan
  function claimsConsumeWholePattern(prop, init) {
    const hostDeclarator = prop.findParent(pp => pp.isVariableDeclarator());
    if (!hostDeclarator) return false;
    const fake = { id: hostDeclarator.node.id, init, loc: hostDeclarator.node.loc };
    const plan = buildFlattenPlan({ declaratorNode: fake, scope: prop.scope, path: prop });
    return !!plan?.outerProps?.length && !plan.pattern.properties.some(isRestProperty)
      && plan.outerProps.every(outer => outer.kind === 'consumed' || outer.kind === 'anchored');
  }

  // what a memo ALIASES once the collapse has run: a proxy-global member (`_globalThis.Array`) makes
  // the ref stand for THAT ctor - the name a sibling static resolves through, and the one the type
  // channel narrows a later leaf by. every other shape keeps the alias the caller asked for
  function memoizedAliasName(receiver, asked) {
    const { tail } = peelNestedSequenceExpressions(unwrapRuntimeExpr(receiver));
    const name = tail?.type === 'MemberExpression' ? memberKeyName(tail) : null;
    return name && resolveGlobalPure(name) ? name : asked;
  }

  // the WHOLE-INIT memo: the host's init hoists into a `const _ref = <init>` every reader of it
  // shares - the receiver-memo channel of the flat route, planted here for any host that needs it
  function memoizeWholeInit(parent, scope, typeOfReceiver, memoCtor = null) {
    const initKey = parent.isVariableDeclarator() ? 'init' : 'right';
    // collapse a proxy-global hop before memoizing (`globalThis.self.Array` -> `globalThis.Array`) -
    // the same collapse the retained-residual path applies - so the memo isn't `_globalThis.self.Array`,
    // whose `.self` is runtime-undefined on ie:11 / Node
    collapseRetainedProxyReceiver(synthSwap, parent.node, initKey, aliasCtxFromPath(parent));
    const receiver = parent.node[initKey];
    // declare=false: we emit our own `const _ref = init;` below, no extra `var _ref;`
    const ref = generateLocalRef(scope);
    // sibling-declarator insert keeps the memo AT ITS SOURCE SLOT (a declaration-level
    // insertBefore hoisted it above earlier declarators - a side-effect reorder). on a
    // VariableDeclarator host the post-traverse split renders it as a standalone `const`;
    // for-init keeps the comma shape (loop header). an AssignmentExpression host has no
    // declarator list, so it keeps the preceding-statement insert.
    // an EXPORTED host must not export the internal memo temp: plant it as a bare statement
    // BEFORE the export instead of joining the exported declarator list - for the first
    // declarator directly (nothing to reorder past); a later-declarator memo takes the sibling
    // slot and the split cuts the exported list around it, the declarators ahead of it staying ahead
    const declarationPath = parent.isVariableDeclarator() ? parent.parentPath : null;
    // a DISCARDED SEQUENCE ELEMENT hoists its memo to a preceding statement, which walks that read
    // past whatever the sequence evaluates AHEAD of it - `q = (lead(), ({ at } = eff()), 5)` ran `e`
    // before `L`. those leading elements are discarded values, so they lift to statements of their
    // own, in source order, and the memo lands behind them where the source evaluates it
    if (!declarationPath) liftLeadingSequenceElements(parent);
    plantReceiverMemo({ host: parent, declarationPath, ref, value: receiver });
    const cloned = t.cloneNode(ref);
    // store resolved type for subsequent destructured properties to resolve type hints
    if (typeOfReceiver) resolvedType.set(cloned, typeOfReceiver);
    // a memoized proxy-global-member receiver (`_ref = _globalThis.Array`) is registered as a global
    // alias for its ctor so SIBLING statics destructured off `_ref` re-polyfill - a `[Symbol.iterator]`
    // key has no instance type, so the resolvedType channel above doesn't carry the ctor, and the
    // inserted `_ref` is not scope-registered, leaving `from` native otherwise (undefined on ie:11).
    // `trusted`: `_ref` is plugin-generated (user code cannot rebind it), so the adapter's hint-only
    // fallback may trust it even without a scope binding
    if (memoCtor) injector.registerGlobalAlias(ref.name, memoizedAliasName(receiver, memoCtor), { trusted: true, minted: true });
    parent.node[initKey] = cloned;
    return ref;
  }

  // the shape a bodyless slot takes: ONE statement stays bare, several brace a block - unless the
  // host is a `var` declaration and every statement declares: those join as the declarators of ONE
  // `var`, the slot's own statement (`if (c) var { keys } = _globalThis.Array, _ref = Array.prototype,
  // { [k]: _unused } = _ref, a = _at(_ref);`), memo declarators included - the join the other leg prints
  function bodylessSlotStatement(kind, stmts) {
    if (stmts.length === 1) return stmts[0];
    if (kind === 'var' && stmts.every(stmt => t.isVariableDeclaration(stmt))) {
      return t.variableDeclaration('var', stmts.flatMap(stmt => stmt.declarations));
    }
    return t.blockStatement(stmts);
  }

  // ... asked of the FINISHED tree too: babel's own `insertBefore` / `insertAfter` brace a bodyless
  // slot on their way, so a block they synthesized there (no source span) holding nothing but `var`
  // declarations is that slot's join as well. an arrow body is a block of its own, never a slot
  function joinBodylessVarBlocks(programPath) {
    programPath.traverse({
      BlockStatement(path) {
        if (path.node.loc || path.parentPath.isArrowFunctionExpression()
          || !isBodylessStatementSlot(path.parentPath.node, path.node)) return;
        if (path.node.body.some(stmt => !t.isVariableDeclaration(stmt, { kind: 'var' }))) return;
        path.replaceWith(bodylessSlotStatement('var', path.node.body));
      },
    });
  }

  // bodyless control statement with side-effect: wrap in block to keep scope.
  // `cloneDeep` is necessary - the original `initNode` is still referenced by the
  // about-to-be-replaced declaration's path; reusing it would create node-identity aliasing
  // that babel's path tracker mishandles. expensive (deep walk) but bounded by init AST size.
  // the lifted init is TRIMMED like every other lift (`sideEffect();`, not
  // `sideEffect(), Array;`) - the trailing value is unread once extraction consumed the
  // bindings, the uniform canon both emitters emit.
  // multi-decl host (`var a=1, {p}=SE(), b=2`): sibling declarators preserve their original
  // position around the consumed slot. pre-siblings run before the lifted SE, post-siblings
  // after the extracted target. a collapsed-trailing emission would silently reorder
  // pre-sibling initializers past the SE expression, observable when both sides carry effects
  function wrapBodylessWithSideEffect({ declaration, initNode, parentDeclarator, extractedDeclaration, kind }) {
    const decls = declaration.node.declarations;
    const idx = decls.indexOf(parentDeclarator);
    const stmts = [];
    if (idx > 0) stmts.push(t.variableDeclaration(kind, decls.slice(0, idx)));
    stmts.push(t.expressionStatement(trimSideEffectTail(t.cloneDeep(initNode))), extractedDeclaration);
    if (idx < decls.length - 1) stmts.push(t.variableDeclaration(kind, decls.slice(idx + 1)));
    declaration.replaceWith(t.blockStatement(stmts));
  }

  // a FULLY-DISCARDED destructure receiver (every prop a pure static, its value never read) that carries side
  // effects keeps ONLY its COMPLETE harvested side effects (sequence prefixes + chain-assign + buried calls +
  // hop-keys, via the canonical `harvestDiscardedReceiverSE`) - the whole proxy navigation is dead and would
  // THROW off-browser on an unponyfillable hop, so re-emit the harvested SE in source-eval order (matching the
  // unplugin drop). null (caller keeps the receiver verbatim, via its own collapse) when it is not a droppable
  // proxy nav OR carries NO side effects: an effect-free nav has nothing to drop and its bare-value collapse is
  // owned by the caller's `collapseRetainedProxyReceiver` / fold, keeping the two emitters' output identical.
  // shared by the for-init sink AND the statement-lifted plain-decl discard so their decision stays
  // consistent. CALLERS MUST PASS THE RAW INIT: the gate inspects the navigation TAIL (peeled past a
  // sequence root like `(d++, globalThis['self'].Array)`, while the whole leaf still feeds the SE
  // harvest), and once the per-prop collapse has re-rooted the nav to `(se, _globalThis).member` that
  // tail is a bare identifier the gate no longer recognizes
  function discardedReceiverSinkInit(initNode, path) {
    const leaf = unwrapRuntimeExpr(initNode);
    const { tail } = peelNestedSequenceExpressions(leaf);
    const dropCtx = path?.scope ? { scope: path.scope, adapter, path, resolvePure } : null;
    if (!shouldDropRescueReceiver(tail !== leaf ? unwrapRuntimeExpr(tail) : leaf, dropCtx)) return null;
    const se = harvestDiscardedReceiverSE(leaf, { scope: path.scope, adapter, path });
    if (!se.length) return null;
    return se.length === 1 ? t.cloneDeep(se[0]) : t.sequenceExpression(se.map(node => t.cloneDeep(node)));
  }

  // for-init with SE: keep SE inline so it doesn't escape the loop.
  // static: for (var { from } = (se(), Array);;) -> for (var _ref = (se(), Array), from = _Array$from;;)
  // instance: for (var { at } = getObj();;) -> for (var at = _at(getObj());;) - SE consumed by call.
  // both branches mutate the VariableDeclaration in place; babel's scope tracker doesn't observe
  // raw property/array mutations, so fresh bindings are re-registered on the mutated path
  function handleForInitSE({ declaration, parent, localBinding, value, scope, isStatic }) {
    if (isStatic) {
      // a verbatim sink of a MULTI-hop proxy receiver reads an undefined intermediate hop off-browser
      // (`sf()[(c++, 'self')].Map` keeps the raw `.self` - ie:11 / Node throw). the sink value is
      // discarded (dummy binding), so re-emit ONLY the harvested side effects (shared discard helper).
      // resolve the drop on the RAW init - foldBuriedProxyHopHosts re-roots the nav to a form the gate misses
      let sinkInit = discardedReceiverSinkInit(parent.node.init, parent);
      foldBuriedProxyHopHosts(parent.get('init'));
      // a droppable nav with NO harvestable SE (a provably-pure call root: `(() => globalThis)().self.Array`)
      // still needs a SAFE sink - the fold leaves the raw `.self` hop the loop init reads undefined off-engine,
      // and unlike a lifted plain-decl residual the for-init sink never re-enters the natural member detection.
      // render the DISCARDED value through the shared plans: a pure-ctor leaf whole-swaps (`_Map`), a native-
      // static leaf re-roots at the pure global (`_globalThis.Array`). plain-decl uses collapseRetainedProxyReceiver
      if (!sinkInit) {
        const initLeaf = unwrapRuntimeExpr(parent.node.init);
        if (shouldDropRescueReceiver(initLeaf)) {
          const aliasCtx = aliasCtxFromPath(parent);
          const discarded = planCallRootDiscardedProxySwap({ receiver: initLeaf, ...aliasCtx, resolvePure });
          if (discarded) {
            const pureId = injectPureImport(discarded.leafPure.entry, discarded.leafPure.hintName);
            sinkInit = discarded.harvestedSE.length
              ? t.sequenceExpression([...discarded.harvestedSE.map(node => t.cloneDeep(node)), pureId]) : pureId;
          } else sinkInit = synthSwap.collapseProxyGlobalReceiver(initLeaf, { aliasCtx });
        }
      }
      // static polyfill import - SE needs a dummy binding to stay in for-init. the sink
      // lands BEFORE every extraction of this declaration (SE-first, source-faithful),
      // not at the consumed slot where earlier per-prop inserts would precede it
      const ref = generateLocalRef(scope);
      const decls = declaration.node.declarations;
      const idx = decls.indexOf(parent.node);
      if (idx === -1) return;
      const sink = t.variableDeclarator(ref, sinkInit ?? t.cloneDeep(parent.node.init));
      const extracted = t.variableDeclarator(localBinding, value);
      decls[idx] = extracted;
      const firstExtraction = decls.findIndex(d => forInitExtractionDecls.has(d));
      decls.splice(firstExtraction === -1 ? idx : firstExtraction, 0, sink);
      // register PER DECLARATOR, the same way the instance branch below does. registering the
      // whole declaration re-registers every sibling id too, and a sibling an earlier per-prop
      // emission already rewrote and registered then collides with itself - babel aborts the
      // build with "Duplicate declaration"
      for (const node of [extracted, sink]) {
        const at = decls.indexOf(node);
        if (at !== -1) declaration.scope?.registerDeclaration(declaration.get(`declarations.${ at }`));
      }
    } else {
      parent.node.id = localBinding;
      parent.node.init = value;
      parent.scope?.registerDeclaration(parent);
    }
  }

  // walk up from `path` to the nearest parent whose container is an array body (statement-level)
  // SwitchCase uses `consequent` instead of `body`
  function findStatementParent(path) {
    let stmt = path;
    while (stmt.parentPath && !Array.isArray(stmt.parentPath.node.body)
      && !Array.isArray(stmt.parentPath.node.consequent)) stmt = stmt.parentPath;
    return stmt;
  }

  // `replaceWith` doesn't register declarations on the target scope, so after collapsing
  // `const { X } = ...` to `const X = ...` a later visit of bare `X` would see an empty
  // scope and mistake `X` for an unbound global. safe only on `replaceWith` (original
  // bindings gone); `insertBefore` keeps the old declaration and duplicate-registering
  // the same name trips babel's block-scope collision check in rest / multi-prop paths
  function replaceWithAndRegister(path, node) {
    const [newPath] = path.replaceWith(node);
    newPath.scope.registerDeclaration(newPath);
  }

  // `(inner(), Array)` - when we lift the init as a standalone statement only the
  // side-effectful head is needed; the trailing value (`Array`, read by the destructure)
  // becomes a no-op read once extraction leaves no destructure target. trim it so the
  // emitted ExpressionStatement reads `inner();` instead of `inner(), Array;`. nested SE
  // (`(x++, (y++, Array))`) is flattened first so the inner trailing identifier strips too -
  // without the flatten the outer trim stops at `(y++, Array)` (which has
  // its own `mayHaveSideEffects` from `y++`), leaving a useless `Array` read in the output
  function trimSideEffectTail(node) {
    if (!t.isSequenceExpression(node)) return node;
    // the canonical peel flattens nested sequence layers, so the dead-tail pop can drop a
    // final no-op parked under an inner SE wrapper too
    const { prefix, tail } = peelNestedSequenceExpressions(node);
    const flat = dropDeadSequenceElements([...prefix, tail]);
    if (flat.length === 1) return flat[0];
    const sameShape = flat.length === node.expressions.length
      && flat.every((e, i) => e === node.expressions[i]);
    return sameShape ? node : t.sequenceExpression(flat);
  }

  function deferSideEffect(containerPath, initNode, probeNavStart = null) {
    if (!initNode || !mayHaveSideEffects(initNode)) return;
    // a THROW PROBE riding the value already re-emits the READ this init performs, so only what the
    // source ran BEFORE that read is still owed here - the shared partition rule, asked once and
    // complemented so neither half is dropped
    if (Number.isInteger(probeNavStart)) {
      const { ahead } = partitionEffectsAtProbe(harvestDiscardedReceiverSE(initNode,
        { scope: containerPath.scope, adapter, path: containerPath }), probeNavStart);
      if (!ahead.length) return;
      deferLiftedExpression(containerPath, ahead.length === 1
        ? t.cloneNode(ahead[0], true) : t.sequenceExpression(ahead.map(node => t.cloneNode(node, true))));
      return;
    }
    deferLiftedExpression(containerPath, null, initNode);
  }

  // the queueing half of the defer: one expression, lifted to the slot the source ran it in
  function deferLiftedExpression(containerPath, expression, initNode = null) {
    const stmt = findStatementParent(containerPath);
    const parentNode = stmt.parentPath?.node;
    const body = parentNode?.body ?? parentNode?.consequent;
    if (Array.isArray(body)) {
      const index = originalDeclKeys.get(containerPath.node) ?? stmt.key;
      // processDeferredSideEffects assumes each queued `node` is an ExpressionStatement
      // (the re-traversal visitor walks only its body and spawns nested polyfills from
      // `.expression`). emit as ExpressionStatement unconditionally; a future caller that
      // wants a different statement type must teach the consumer or wrap on its own.
      // `anchorPrev` / `anchor` snapshot the statements around the slot: the drain
      // re-resolves the index through them, since a later `scope.push` (a `var _ref;` /
      // sentinel hoist) unshifts the body and leaves the RECORDED index one slot stale -
      // the splice then landed the lifted effect ABOVE a preceding `let`, a runtime TDZ
      // break. the PRECEDING statement is the primary anchor: the slot's own statement is
      // the host, which its rebuild may replace (indexOf then misses), while the
      // predecessor is a settled earlier statement
      deferredSideEffects.push({
        body, index,
        anchorPrev: index > 0 ? body[index - 1] ?? null : null,
        anchor: body[index] ?? null,
        seq: deferredSideEffects.length,
        // a fully-discarded proxy-nav receiver keeps only its harvested SE (the nav is dead and would throw
        // off-browser on an unponyfillable hop); otherwise the whole init lifts minus a dead
        // tail, a kept chain-assignment among it storing the value canon like its in-place twin
        node: t.expressionStatement(expression
          ?? discardedReceiverSinkInit(initNode, containerPath)
          ?? cloneReplayedEffect(trimSideEffectTail(initNode), containerPath)),
      });
    }
  }

  // a flat STATIC destructure (`const { from, of } = Array`) is a degenerate flatten -
  // receiver + consumed static props, no instance/nested. route it
  // through the SAME shared-plan renderer the nested/proxy path uses (`renderDeclaratorFlattenPlan`),
  // retiring the per-prop strategy path for these shapes. the renderer self-gates on plan
  // existence (instance props plan as verbatim -> no extractions -> no plan -> falls through),
  // and handles full-consume / residual / rest / export / for-init / multi-declarator uniformly.
  // the plan resolves a bare-Identifier receiver itself (a const-alias chain, a proxy-global
  // shorthand) - both route correctly. EXCLUDED shapes (kept on the per-prop strategy path,
  // where the plan render would diverge byte-wise from the established per-prop / unplugin canon):
  //   - a non-Identifier init (member / sequence / logical / optional - `globalThis['self'].Array`,
  //     `(se(), Array)`, `Array || Promise`): needs the per-prop intermediate-hop collapse
  //     (`globalThis['self'].Array` -> `_globalThis.Array`) and SE-discard the flat-residual
  //     plan path doesn't reproduce
  //   - a default prop (`{ from = d() }`): the flat path keeps the always-true guard
  //     `_X === void 0 ? d() : _X`, the plan drops it (equivalent, but byte-divergent)
  //   - a leading comment on the declaration: the per-prop path leaves it between the split
  //     statements, the plan render lifts it to the first - byte-divergent on multi-statement output
  // those canon merges are separate increments. an AssignmentExpression host has no plan-render here
  function tryRouteFlatStaticToPlan(prop) {
    const objectPattern = prop.parentPath;
    if (!objectPattern.isObjectPattern()) return false;
    const declarator = objectPattern.parentPath;
    if (!declarator?.isVariableDeclarator() || objectPattern.node !== declarator.node.id) return false;
    const { init } = declarator.node;
    if (!t.isIdentifier(init)) return false;
    if (objectPattern.node.properties.some(p => t.isObjectProperty(p) && t.isAssignmentPattern(p.value))) return false;
    // a computed key that SPELLS no slot (`[Symbol.iterator]: it`) has no resolvePure entry, so the
    // plan leaves it a verbatim survivor - re-rendering the whole declarator here would clobber the
    // per-prop symbol-key extraction (`it = _getIteratorMethod(_ref)`). keep those patterns on the
    // per-prop path, where the symbol key and its sibling statics each emit independently
    if (objectPattern.node.properties.some(p => t.isObjectProperty(p) && p.computed
      && !propertyKeyName(p))) return false;
    // shape alone is not enough: a prop the plan cannot consume stays a VERBATIM residual, and on a
    // flat pattern that residual never re-enters the per-prop channel - an INSTANCE prop read off
    // the constructor (`{ of, name } = Array`) has its ponyfill built and then discarded. hand any
    // unconsumed prop back to the per-prop path, which emits the two kinds side by side
    const plan = buildFlattenPlan({ declaratorNode: declarator.node, scope: declarator.scope, path: declarator });
    if (plan?.outerProps?.some(outer => outer.kind === 'verbatim')) return false;
    return renderDeclaratorFlattenPlan(declarator, prop);
  }

  // babel-plugin's destructure emission counterpart of the unplugin's destructure pipeline.
  // dispatches on the parser-agnostic `planDestructureEmission` strategy enum, then
  // executes the strategy-specific AST mutation. planning logic lives in
  // `./destructure-emission-plan.js` so it stays parser-agnostic and unit-testable;
  // this function owns the babel AST-mutation side
  function handleDestructuredProperty(prop, value) {
    // flat STATIC shapes render through the shared-plan renderer (see `tryRouteFlatStaticToPlan`)
    if (tryRouteFlatStaticToPlan(prop)) return;
    const propValue = prop.node.value;
    // captured before default-value processing turns Identifier into ConditionalExpression.
    // a THROW PROBE this emitter minted ahead of the value leaves it static: the host classification
    // routes the init's own effects by this flag, and reading the probe as "dynamic" dropped them.
    // the key-SE prefix beside it is the opposite case - it FOLDS the effect into the value
    const probeLed = t.isSequenceExpression(value) && probeNavStarts.has(value.expressions[0]);
    const probeNavStart = probeLed ? probeNavStarts.get(value.expressions[0]) : null;
    let isStaticValue = t.isIdentifier(value)
      || (probeLed && value.expressions.length === 2 && t.isIdentifier(value.expressions[1]));
    // a computed key with side effects (`{ [(eff(), 'from')]: x }`) evaluates at destructure time;
    // the property is about to be removed (prop.remove), so harvest the key SE now and fold it into
    // the final emitted value so it still fires once (native evaluates the key after the source).
    // unplugin preserves the key verbatim in its retained pattern, so this aligns babel with it
    const keySideEffect = computedKeyHasSideEffects(prop.node) ? t.cloneNode(prop.node.key) : null;
    const objectPattern = prop.parentPath;
    // a catch-born host folds the default-guard test ref into its own `let` (block-scoped,
    // minted without the `var` hoist) - the catch-canon shape both emitters emit
    const catchBorn = objectPattern.parentPath?.isVariableDeclarator()
      && catchBornDeclarations.has(objectPattern.parentPath.parentPath?.node);
    let catchFoldedRef = null;
    // default value: { from = [] } = Array -> from = _from === void 0 ? [] : _from
    // instance calls need temp ref to avoid double evaluation
    let localBinding;
    if (t.isAssignmentPattern(propValue)) {
      localBinding = t.cloneNode(propValue.left);
      const needsTemp = t.isCallExpression(value);
      // prop.node anchors the loop-header escape check: a for-init host needs the memo `var`
      // BEFORE the loop, not in a block-converted bodyless body
      const ref = needsTemp ? catchBorn ? generateLocalRef(prop.scope) : generateRef(prop.scope, prop.node) : value;
      if (needsTemp && catchBorn) catchFoldedRef = t.cloneNode(ref);
      value = estreeToBabel(needsTemp
        ? renderInstanceDefaultGuard({
          assignedRef: hostSlot(ref),
          call: hostSlot(value),
          defaultValue: hostSlot(t.cloneNode(propValue.right)),
          reread: hostSlot(t.cloneNode(ref)),
        })
        : renderStaticDefaultGuard({
          read: hostSlot(ref),
          defaultValue: hostSlot(t.cloneNode(propValue.right)),
          reread: hostSlot(t.cloneNode(ref)),
        }));
    } else {
      localBinding = t.cloneNode(propValue);
    }
    const parent = objectPattern.parentPath;

    // rest element present: keep property in pattern with renamed value to preserve rest semantics
    // const { from, ...rest } = Array -> const from = _from; const { from: _, ...rest } = Array
    const hasRest = objectPattern.node.properties.some(p => isRestProperty(p));
    // rest: rename property value to preserve rest semantics; otherwise remove property
    const isEmpty = hasRest ? false : (prop.remove(), objectPattern.node.properties.length === 0);
    if (hasRest) {
      // shared generator keeps babel and unplugin emitting identical `_unused` sentinels;
      // scope.generateUidIdentifier would diverge when babel's scope tracker sees
      // pre-existing `_unused*` bindings our injector hasn't learnt about
      const unusedId = generateUnusedId();
      prop.get('value').replaceWith(unusedId);
      prop.node.shorthand = false;
      // a sentinel on an ASSIGNMENT host is a plain LHS write - pre-declare it
      // (`var _unused;`) or strict mode throws ReferenceError; a declaration host binds it
      // via the destructure pattern itself
      if (parent.isAssignmentExpression()) {
        function unusedDecl() {
          return t.variableDeclaration('var', [t.variableDeclarator(t.identifier(unusedId.name))]);
        }
        // a DISCARDED sequence element has no statement of its own, and the sentinel is a plain LHS
        // write all the same: the `var` goes ahead of the statement the sequence sits in, which is
        // where a `var` hoists to anyway. without it the write threw ReferenceError under strict mode.
        // only for a pattern the assignment holds DIRECTLY - a nested one is the cascade's, and its
        // own render declares every sentinel it keeps, so a `var` planted here would never be read
        if (parent.node.left === objectPattern.node
          && !assignmentInStatementPosition(parent) && discardedSequenceElement(parent)) {
          findStatementParent(parent).insertBefore(unusedDecl());
        } else {
          // through the SHARED pair: an unbraced control slot has no statement list, and `insertBefore`
          // wraps it on its own without re-seating the path - the extraction landing after it then
          // wrapped the block a SECOND time, leaving the `var` and the residual in a block of their own
          const stmt = blockWrappedHostStatement(parent);
          if (stmt?.node?.type === 'ExpressionStatement') stmt.insertBefore(unusedDecl());
        }
      }
    }

    // a retained receiver keeps a proxy-global member chain live - collapse the intermediate hop so it
    // is runtime-safe (`_globalThis.self.Array` reads an undefined hop off-browser). retained when a
    // surviving sibling / ...rest reads the value OR when an emptied pattern still lifts the init as a
    // statement for its side effect - the bare receiver evaluates there too, so it must not be gated on
    // value-consumption alone
    const retainedInit = parent.isVariableDeclarator() ? parent.node.init
      : parent.isAssignmentExpression() ? parent.node.right : null;
    // the pattern is EFFECTIVELY empty once every SURVIVING sibling is itself a polyfillable static off the
    // same receiver (each gets extracted by its own per-prop emit), so the receiver drops just as for a
    // literally-empty pattern: a SE-sequence init lifts ONLY its prefix (tail dropped), a plain init
    // vanishes - collapsing the gone receiver injects a DEAD `_globalThis`. a logical / SE-bearing RETAINED
    // init still re-emits the receiver (`|| Set` operand); `...rest` / a non-polyfilled / computed /
    // disabled sibling keeps it live - those keep the collapse via the side-effect / non-empty disjuncts
    let survivingSiblingsAllConsumed = false;
    if (retainedInit && !hasRest && !isEmpty) {
      const receiverName = globalProxyMemberName({ node: peelProxyGlobalObject(retainedInit), scope: parent.scope, adapter, path: parent });
      survivingSiblingsAllConsumed = !!receiverName && objectPattern.node.properties.every(sibling => {
        return !!resolvePolyfillableStaticProp({ prop: sibling, receiverName, resolvePure, isDisabled });
      });
    }
    const effectivelyEmpty = isEmpty || (!hasRest && survivingSiblingsAllConsumed);
    const seqTailDropped = effectivelyEmpty && !hasRest && retainedInit?.type === 'SequenceExpression';
    // a fully-discarded receiver whose nav carries side effects is HARVESTED + dropped whole by the SE-lift
    // (`deferSideEffect` -> `discardedReceiverSinkInit`) on the RAW init - re-rooting it here would leave a
    // `(se, _globalThis).member` dead read the drop gate no longer recognizes, diverging from the unplugin drop.
    // gated on the drop actually firing (SE present), so an effect-free nav still collapses through the path below
    const dropsDiscardedNav = effectivelyEmpty && !hasRest && retainedInit
      && discardedReceiverSinkInit(retainedInit, parent) !== null;
    if (!dropsDiscardedNav && (hasRest || !effectivelyEmpty || (retainedInit && mayHaveSideEffects(retainedInit) && !seqTailDropped))) {
      if (parent.isVariableDeclarator()) collapseRetainedProxyReceiver(synthSwap, parent.node, 'init', aliasCtxFromPath(parent));
      else if (parent.isAssignmentExpression()) collapseRetainedProxyReceiver(synthSwap, parent.node, 'right', aliasCtxFromPath(parent));
    }

    if (keySideEffect) {
      value = t.sequenceExpression([keySideEffect, value]);
      isStaticValue = false;
    }
    if (parent.isVariableDeclarator()) {
      emitVariableDeclaratorDestructure({
        prop, parent, localBinding, value, isStaticValue, isEmpty, catchFoldedRef, probeNavStart,
      });
    } else {
      emitAssignmentDestructure({ parent, localBinding, value, isStaticValue, isEmpty, probeNavStart });
    }
  }

  // build the parser-agnostic context the planner consumes from a babel VariableDeclarator
  // path. delegates host-shape classification (isExport / isForInit / isBodyless /
  // isMultiDecl) to the shared `classifyVariableDeclarationHost` in polyfill-provider so
  // both plugins compute the same booleans from the same source of truth
  function classifyVariableDeclaratorSite({ declaration, parent, isStaticValue, isEmpty }) {
    return {
      parentType: 'VariableDeclarator',
      ...classifyVariableDeclarationHost({
        declaration: declaration.node,
        declarationParent: declaration.parentPath?.node,
      }),
      isEmpty,
      isStaticValue,
      hasSideEffects: isEmpty && mayHaveSideEffects(parent.node.init),
    };
  }

  // @babel/traverse@8 stale-path fixup: an earlier emit in the same handleObjectPropertyResult
  // chain (cascade extraction) may have wrapped a bodyless VariableDeclaration in BlockStatement
  // and `parent.parentPath` now points at the wrapper. raw `parent.parent` is still the real
  // VariableDeclaration - scan the wrapper's children for the matching path. babel@7's tracker
  // kept paths in sync so this is a no-op there. CONTRACT: the result is always the real
  // VariableDeclaration path - `classifyVariableDeclarationHost` reads `.declarations` off it
  // unguarded, so a wrapper leaking through here would crash the build rather than degrade
  function resolveDeclarationPath(declaratorPath) {
    const declaration = declaratorPath.parentPath;
    if (declaration.isBlockStatement() && declaratorPath.parent?.type === 'VariableDeclaration') {
      const rebound = declaration.get('body').find(p => p.node === declaratorPath.parent);
      if (rebound) return rebound;
    }
    return declaration;
  }

  // kind snapshot resilient to downstream path-orphaning: an ORPHANED declaration node carries no
  // `kind`, so fall through to its statement parent and finally to `var` (the only kind valid
  // inside the bodyless control hosts where the wrap fires). @babel/types@7 silently accepted
  // undefined in variableDeclaration builders; v8 throws
  function snapshotDeclarationKind(declaration) {
    return declaration.node.kind ?? findStatementParent(declaration).node?.kind ?? 'var';
  }

  // VariableDeclarator branch executor. classifies the host shape, asks the planner
  // for a strategy, then dispatches to the matching AST mutation
  function emitVariableDeclaratorDestructure({
    prop, parent, localBinding, value, isStaticValue, isEmpty, catchFoldedRef = null, probeNavStart = null,
  }) {
    const declaration = resolveDeclarationPath(parent);
    // save original index before first insertBefore shifts it
    if (!originalDeclKeys.has(declaration.node)) {
      originalDeclKeys.set(declaration.node, findStatementParent(declaration).key);
    }
    const kind = snapshotDeclarationKind(declaration);
    const extractedDeclaration = t.variableDeclaration(kind, [
      ...catchFoldedRef ? [t.variableDeclarator(catchFoldedRef)] : [],
      t.variableDeclarator(localBinding, value),
    ]);
    const ctx = classifyVariableDeclaratorSite({ declaration, parent, isStaticValue, isEmpty });
    if (ctx.isMultiDecl && !ctx.isForInit) flatTouchedMultiDecls.add(declaration);
    const strategy = planDestructureEmission(ctx);
    switch (strategy) {
      case STRATEGIES.WRAP_BODYLESS_SE:
        return wrapBodylessWithSideEffect({
          declaration,
          initNode: parent.node.init,
          parentDeclarator: parent.node,
          extractedDeclaration,
          kind,
        });
      case STRATEGIES.FOR_INIT_SE_STATIC:
      case STRATEGIES.FOR_INIT_SE_INSTANCE:
        return handleForInitSE({
          declaration, parent, localBinding, value, scope: prop.scope,
          isStatic: strategy === STRATEGIES.FOR_INIT_SE_STATIC,
        });
      case STRATEGIES.FOR_INIT_MUTATE_DECL:
        parent.node.id = localBinding;
        parent.node.init = value;
        return undefined;
      case STRATEGIES.FOR_INIT_REPLACE:
      case STRATEGIES.REPLACE_DECL:
        return replaceWithAndRegister(declaration, extractedDeclaration);
      case STRATEGIES.DEFER_SE_AND_SPLICE:
        return spliceAndLiftSideEffect({ declaration, parent, localBinding, value });
      case STRATEGIES.DEFER_SE_AND_REPLACE:
        deferSideEffect(declaration, parent.node.init, probeNavStart);
        return replaceWithAndRegister(declaration, extractedDeclaration);
      case STRATEGIES.SPLICE_AND_SPLIT:
        // path-API replaceWith (NOT a raw declarations.splice) keeps queued sibling-declarator
        // paths in sync - a raw splice desyncs path.key and orphans the sibling subtrees'
        // pending visits (their inner polyfills would silently drop). the statement-per-
        // declarator split happens in the post-traverse `splitFlatMultiDecls` drain
        return parent.replaceWith(t.variableDeclarator(localBinding, value));
      case STRATEGIES.INSERT_BEFORE_DECLARATOR: {
        // the prefix cannot lift over the whole declaration - a preceding declarator's own init
        // runs first - so it rides the SPLIT this host takes after the traverse, as the statement
        // that opens this declarator's group. a for-init never splits and keeps its shape
        // `parent.insertBefore` (VariableDeclarator-level) keeps babel-traverse path.key of
        // queued sibling declarators in sync. `declaration.insertBefore` would wrap a
        // for-init in an arrow-IIFE and lose the loop-header shape
        const extractedDeclarator = t.variableDeclarator(localBinding, value);
        if (ctx.isForInit) {
          forInitExtractionDecls.add(extractedDeclarator);
          // the carry waits for the finished shape: whether a residual SURVIVES this host, and what
          // it looks like, is only known once every prop of the pattern has been through
          if (!forInitCarries.has(parent.node)) forInitCarries.set(parent.node, extractedDeclarator);
        } else recordSplitLiftedPrefix(parent.node, localBinding, extractedDeclarator);
        return insertHostDeclarator(parent, extractedDeclarator);
      }
      case STRATEGIES.INSERT_BEFORE_EXPORT: {
        liftSurvivingResidualPrefix(t, parent.node, 'init', declaration.parentPath);
        const insertedExport = declaration.parentPath.insertBefore(t.exportNamedDeclaration(extractedDeclaration));
        recordHostInsert(declaration.node, insertedExport[0]);
        return insertedExport;
      }
      case STRATEGIES.INSERT_BEFORE_DECLARATION: {
        // a bodyless control slot is braced first, for the reason the assignment host braces
        const host = statementListOf(declaration.parentPath?.node)
          ? declaration : ensureExprStmtInBlock(declaration);
        liftSurvivingResidualPrefix(t, parent.node, 'init', host);
        const insertedDeclaration = host.insertBefore(extractedDeclaration);
        recordHostInsert(host.node, insertedDeclaration[0]);
        return insertedDeclaration;
      }
      default:
        throw new Error(`[core-js] destructure-emitter: unhandled destructure strategy ${ strategy }`);
    }
  }

  // wrap declarators into VariableDeclaration statements. when any declarator still
  // carries an unconsumed ObjectPattern, keep them grouped so later visitor passes see
  // an intact multi-decl; otherwise emit one statement per declarator. shared by
  // `spliceAndLiftSideEffect` (pre/post
  // halves around a lifted SE in DEFER_SE_AND_SPLICE) and
  // `splitDeclarationAtSlot` (nested-proxy SE-prefix lift through a multi-decl)
  // re-wrap a VariableDeclaration in ExportNamedDeclaration when the original host was
  // exported. used by `tryFlattenNestedProxyDestructure` to keep each cascaded extraction
  // re-exporting its binding (`export const from = _Array$from;` instead of dropping the
  // `export` keyword on individual emitted declarations)
  function wrapAsExportIf(decl, isExport) {
    return isExport ? t.exportNamedDeclaration(decl) : decl;
  }

  function splitDeclarators(decls, kind, isExport) {
    if (!decls.length) return [];
    const groups = decls.some(d => t.isObjectPattern(d.id)) ? [decls] : decls.map(d => [d]);
    return groups.map(g => {
      // a receiver memo is an internal temp: standalone `const`, never export-wrapped
      if (g.length === 1 && memoDeclarators.has(g[0])) return t.variableDeclaration('const', g);
      const decl = t.variableDeclaration(kind, g);
      return isExport ? t.exportNamedDeclaration(decl) : decl;
    });
  }

  // move leading comments from `from` AST node onto `to` (clears them on the source).
  // shared by cascade insert paths and `splitDeclarationAtSlot` so the relocated
  // first statement inherits the host's leading docblock
  // nested-proxy cascade split gate: fires on multi-decl + willRemove + non-for-init.
  // peels the consumed declarator's SE prefix (empty array when no SE) and delegates
  // to the shared `splitDeclarationAtSlot`. for-init / single-decl take legacy paths
  // (loop-header shape / no siblings to reorder)
  function trySplitAroundConsumedDeclarator({
    declaration, declarator, extractedDeclarators, willRemoveDeclarator, declCount, isForInit, between = [],
  }) {
    if (!willRemoveDeclarator || declCount <= 1 || isForInit) return false;
    const idx = declaration.node.declarations.indexOf(declarator.node);
    if (idx === -1) return false;
    // descend a transparent array wrapper so a nested-element SE lifts too - the wrapper dies
    // with the consumed declarator, so its trailing neighbours and the handed-back setup lift
    // along; the split drops the declarator outright, so no element swap is needed (unlike the
    // single-decl lift). non-wrapper inits fall back to the bare top-level prefix
    const { prefix } = descendArrayWrapperToSE(declarator.node, { liftTrailing: true, includeTrailing: true, between })
      ?? peelNestedSequenceExpressions(declarator.node.init);
    splitDeclarationAtSlot({ declaration, idx, sePrefix: prefix, extractedDeclarators });
    return true;
  }

  // shared primitive: replace declaration with `[pre-siblings, ...SE expression
  // statements, extracted + post-siblings]`. `sePrefix` is an array of AST expression
  // nodes (empty for no-SE callers) - each cloned into a standalone ExpressionStatement
  // between the pre and post halves so sibling evaluation order survives. consumers:
  //   - `trySplitAroundConsumedDeclarator` (nested-proxy cascade, pre-peeled SE prefix)
  //   - `spliceAndLiftSideEffect` (DEFER_SE_AND_SPLICE, single-element SE array or empty)
  function splitDeclarationAtSlot({
    declaration, idx, sePrefix, extractedDeclarators, sePrefixAt = idx, keepSlot = false,
  }) {
    const { kind } = declaration.node;
    const isExport = declaration.parentPath?.isExportNamedDeclaration();
    const decls = declaration.node.declarations;
    const stmts = [
      ...splitDeclarators(decls.slice(0, sePrefixAt), kind, isExport),
      ...sePrefix.map(e => t.expressionStatement(t.cloneNode(e))),
      ...splitDeclarators([
        ...decls.slice(sePrefixAt, idx), ...extractedDeclarators, ...decls.slice(keepSlot ? idx : idx + 1),
      ], kind, isExport),
    ];
    const newPaths = declaration.replaceWithMultiple(stmts);
    // re-mark grouped products for the post-traverse split drain: `splitDeclarators` keeps
    // ObjectPattern-bearing runs comma-joined so later per-prop visits still see an intact
    // multi-decl, and the replace killed the originally-marked path. the drain delivers the
    // final statement-per-declarator canon after those visits complete
    for (const p of newPaths) {
      const inner = p.isExportNamedDeclaration() ? p.get('declaration') : p;
      if (inner.isVariableDeclaration() && inner.node.declarations.length > 1) {
        flatTouchedMultiDecls.add(inner);
      }
    }
  }

  // DEFER_SE_AND_SPLICE strategy executor: lift the side-effecting init out of the
  // consumed slot and split declaration around it. SE init -> single trimmed expression
  // emitted between pre/post halves; no-SE init -> empty SE prefix (split still
  // preserves sibling order). earlier `deferSideEffect` anchored SE at original-
  // declaration body index, so after a strategy-time sibling shift, the lifted
  // SE landed BEFORE pre-siblings (observable when both halves carry effects)
  function spliceAndLiftSideEffect({ declaration, parent, localBinding, value }) {
    const decls = declaration.node.declarations;
    const idx = decls.indexOf(parent.node);
    if (idx === -1) return;
    const sePrefix = mayHaveSideEffects(parent.node.init)
      ? [trimSideEffectTail(parent.node.init)]
      : [];
    // natively the init runs before the pattern binds anything, so the lift belongs ahead of every
    // artifact this host has already emitted - an EARLIER prop's extraction among them, which the
    // per-prop order had put between the pre-siblings and this slot
    const firstInsert = hostFirstInsert.get(parent.node);
    const insertedAt = firstInsert ? decls.indexOf(firstInsert.node ?? firstInsert) : -1;
    splitDeclarationAtSlot({
      declaration, idx, sePrefix,
      sePrefixAt: insertedAt >= 0 ? Math.min(idx, insertedAt) : idx,
      extractedDeclarators: [t.variableDeclarator(localBinding, value)],
    });
  }

  // build the planner context for an AssignmentExpression destructure host. mirrors
  // `classifyVariableDeclaratorSite`: `assignmentTarget` is the host ExpressionStatement,
  // `isBodyless` reports whether that statement is the unbraced body of a control statement,
  // `hasSideEffects` is only relevant when the destructure pattern was fully consumed (isEmpty)
  function classifyAssignmentDestructureSite({ parent, assignmentTarget, isStaticValue, isEmpty }) {
    return {
      parentType: 'AssignmentExpression',
      isEmpty,
      isStaticValue,
      hasSideEffects: isEmpty && mayHaveSideEffects(parent.node.right),
      isBodyless: isBodylessStatementSlot(assignmentTarget.parentPath?.node, assignmentTarget.node),
    };
  }

  // AssignmentExpression branch executor. dispatches the planner strategy to the matching
  // AST mutation - parallel to `emitVariableDeclaratorDestructure`'s switch
  // a DISCARDED non-tail sequence element owns no statement: what a statement host writes as
  // sibling statements, this one writes as sequence elements in its own slot. the three shapes the
  // planner reaches here map one for one - a surviving residual takes the extraction AHEAD of it,
  // an emptied pattern over an effectful receiver keeps that receiver ahead of the assignment, and
  // an emptied one over a quiet receiver is the bare assignment. replacing the STATEMENT instead
  // dropped whatever the sequence held after this element
  function emitDiscardedSeqElementDestructure({ parent, element, localBinding, value, isStaticValue, isEmpty }) {
    const assign = inheritSpan(t.assignmentExpression('=', localBinding, value), parent.node);
    if (!isEmpty) return element.replaceWith(t.sequenceExpression([assign, element.node]));
    const init = parent.node.right;
    if (isStaticValue && mayHaveSideEffects(init)) {
      return element.replaceWith(t.sequenceExpression([trimSideEffectTail(t.cloneDeep(init)), assign]));
    }
    return element.replaceWith(assign);
  }

  function emitAssignmentDestructure({ parent, localBinding, value, isStaticValue, isEmpty, probeNavStart = null }) {
    const seqElement = assignmentInStatementPosition(parent) ? null : discardedSequenceElementPath(parent);
    if (seqElement) {
      return emitDiscardedSeqElementDestructure({ parent, element: seqElement, localBinding, value, isStaticValue, isEmpty });
    }
    // peel Paren / TS wrappers up to the ExpressionStatement so the rewrite owns the whole
    // statement - replacing only the inner assignment leaves dead wrapper decoration
    // (`((from = _Array$from) satisfies unknown)!;`) the unplugin render never emits
    const assignmentTarget = hostStatementPath(parent);
    const assignment = inheritSpan(t.expressionStatement(
      inheritSpan(t.assignmentExpression('=', localBinding, value), parent.node)), assignmentTarget.node);
    // save the original body index before the first insertBefore shifts it, so a deferred SE on
    // the empty tail (`({ from, of } = (se(), Array))`) lifts AHEAD of the earlier insertBefore'd
    // assignments instead of interleaving between them - mirrors the VariableDeclarator capture,
    // aligning flat multi-prop AE with the VariableDeclaration splice order
    if (!originalDeclKeys.has(assignmentTarget.node)) {
      originalDeclKeys.set(assignmentTarget.node, findStatementParent(assignmentTarget).key);
    }
    const ctx = classifyAssignmentDestructureSite({ parent, assignmentTarget, isStaticValue, isEmpty });
    const strategy = planDestructureEmission(ctx);
    switch (strategy) {
      case STRATEGIES.WRAP_BODYLESS_SE_ASSIGN:
        return wrapBodylessAssignWithSideEffect({
          assignmentTarget, initNode: parent.node.right, assignment,
        });
      case STRATEGIES.DEFER_SE_AND_REPLACE_ASSIGN:
        deferSideEffect(assignmentTarget, parent.node.right, probeNavStart);
        return assignmentTarget.replaceWith(assignment);
      case STRATEGIES.REPLACE_ASSIGNMENT:
        return assignmentTarget.replaceWith(assignment);
      case STRATEGIES.INSERT_BEFORE_ASSIGNMENT: {
        // a bodyless control slot hosts no statement list of its own: brace it first, and both the
        // lifted prefix and the extraction land inside that block, where the effect stays conditional
        const host = statementListOf(assignmentTarget.parentPath?.node)
          ? assignmentTarget : blockWrappedHostStatement(parent);
        liftSurvivingResidualPrefix(t, parent.node, 'right', host);
        return host.insertBefore(assignment);
      }
      default:
        throw new Error(`[core-js] destructure-emitter: unhandled destructure strategy ${ strategy }`);
    }
  }

  // AE counterpart of `wrapBodylessWithSideEffect`. simpler shape: the host is a single
  // ExpressionStatement with no sibling declarators, so the block is just `[<SE>; <assign>;]`.
  // `cloneDeep` for the same reason as the VariableDeclarator wrap: `initNode` is still
  // referenced by the about-to-be-replaced assignment expression
  function wrapBodylessAssignWithSideEffect({ assignmentTarget, initNode, assignment }) {
    assignmentTarget.replaceWith(t.blockStatement([
      t.expressionStatement(trimSideEffectTail(t.cloneDeep(initNode))),
      assignment,
    ]));
  }

  // post-traverse drain for the multi-decl split canon. statement-position only; a path
  // already replaced by another emission (bodyless block wrap, split-around) fails the
  // VariableDeclaration check and is skipped
  // a whole-init pre-memo INSERTS a sibling declarator, and an earlier prop's emission on the SAME
  // declaration may have planted a memo and/or a trailing pair already. every gate asking "is this a
  // multi-declarator host" means the SOURCE shape - counting our own mint answers a question nobody asked
  function sourceDeclaratorsOf(declaration) {
    return declaration.node.declarations.filter(d => !memoDeclarators.has(d) && !attachToPrevDeclarator.has(d));
  }

  // a for-init hosts no statement of its own, so the prefix of a SURVIVING residual's receiver
  // rides the FIRST extraction's value, which the loop header evaluates where the source ran it
  // (`for (var m = (eff(), _Map), { other } = _globalThis; ...)`). a nested hop or a rest sibling
  // re-reads the receiver THROUGH that residual, and there the whole read stays with it
  const forInitCarries = new Map();

  function flushForInitCarries() {
    for (const [residual, extracted] of forInitCarries) {
      const props = residual.id?.properties;
      if (!props?.length || !extracted.init) continue;
      if (props.some(prop => prop.type === 'RestElement' || prop.value?.type === 'ObjectPattern')) continue;
      const { prefix, tail } = peelNestedSequenceExpressions(residual.init);
      if (!prefix.length) continue;
      const lifted = liftedPrefixExpression(t, prefix);
      residual.init = tail;
      carryPrefixIntoValue(lifted, extracted);
    }
    forInitCarries.clear();
  }

  // the prefix rides an extraction's VALUE, where the declarator list evaluates it in the place the
  // source ran it - the shape a loop header takes, having no statement slot of its own

  // the prefix a multi-declarator host lifted, keyed by the EXTRACTION that opens its group: the
  // split emits it as the statement ahead of that group, which is where the source ran it
  const splitLiftedPrefixes = new Map();

  function recordSplitLiftedPrefix(residual, localBinding, extractedDeclarator) {
    if (!splitLiftedPrefixes.has(localBinding)) {
      splitLiftedPrefixes.set(localBinding, { residual, extractedDeclarator });
    }
  }

  // the peel waits for the traverse to finish, for the reason the other leg re-derives its prefix
  // live: a claim INSIDE the prefix renders by replacing its node, and a copy taken at record time
  // is the pre-swap original - lifting that ships the source read with its polyfill lost
  function prepareSplitLiftedPrefixes() {
    for (const entry of splitLiftedPrefixes.values()) {
      // only a residual that SURVIVED still owns its receiver: an emptied one left its init to the
      // rescue channel, which re-emits it whole where the source read it
      if (!entry.residual.id?.properties?.length) continue;
      const { prefix, tail } = peelNestedSequenceExpressions(entry.residual.init);
      if (!prefix.length) continue;
      entry.residual.init = tail;
      entry.statements = buildSEPrefixStatements(t, prefix);
    }
  }

  function carryPrefixIntoValue(lifted, declarator) {
    if (!lifted || !declarator?.init) return;
    const carried = lifted.type === 'SequenceExpression' ? lifted.expressions : [lifted];
    declarator.init = t.sequenceExpression([...carried.map(expression => t.cloneNode(expression)), declarator.init]);
  }

  // declarator node -> its declaration path, filled by the typed-nav claim that emptied it
  const emptiedHostDeclarators = new Map();
  // ... and the array-WRAPPED twin: a level whose effects the lift took keeps a husk pattern that
  // binds nothing, and it leaves once the traversal has finished with the claims inside it
  const emptiedWrapperHosts = new Map();

  // the host declarators a typed-nav claim emptied WHOLE beside a sibling: they bind nothing and
  // read a pure init, so they leave once the traversal is done with their subtree - a declarator
  // binding nothing beside one that binds is a shape the standard lowering miscompiles
  function pruneEmptiedHostDeclarators() {
    orderForInitExtractions();
    for (const [declaratorNode, declaration] of emptiedWrapperHosts) {
      const decls = declaration.node?.declarations;
      if (!Array.isArray(decls) || !decls.includes(declaratorNode)) continue;
      if (patternBindingCount(declaratorNode.id) > 0 || mayHaveSideEffects(declaratorNode.init)) continue;
      if (decls.length > 1) declaration.node.declarations = decls.filter(item => item !== declaratorNode);
      else (declaration.parentPath?.isExportNamedDeclaration() ? declaration.parentPath : declaration).remove();
    }
    emptiedWrapperHosts.clear();
    for (const [declaratorNode, declaration] of emptiedHostDeclarators) {
      const decls = declaration.node?.declarations;
      if (!Array.isArray(decls) || !decls.includes(declaratorNode)) continue;
      if (declaratorNode.id?.type !== 'ObjectPattern' || declaratorNode.id.properties.length) continue;
      // an effect-bearing init in a loop head: the binding leaves, the read stays as the sink, and
      // it stands where the flatten route puts a discarded one - behind the extractions
      if (mayHaveSideEffects(declaratorNode.init)) {
        const sink = emptiedHostSinkValue(declaratorNode.init);
        declaratorNode.id = generateUnusedId();
        declaratorNode.init = sink.value;
        const rest = decls.filter(item => item !== declaratorNode);
        declaration.node.declarations = sink.stores ? [declaratorNode, ...rest] : [...rest, declaratorNode];
        continue;
      }
      if (decls.length > 1) {
        declaration.node.declarations = decls.filter(item => item !== declaratorNode);
        continue;
      }
      // a SOLE emptied declarator takes its statement with it; the comments that led the source
      // declaration lead what was planted ahead of it, which is what they described
      const statement = declaration.parentPath?.isExportNamedDeclaration() ? declaration.parentPath : declaration;
      const lead = statement.node.leadingComments;
      const heir = statement.getPrevSibling().node ?? statement.getNextSibling().node;
      const heirLead = heir?.leadingComments ?? [];
      if (lead?.length && heir) heir.leadingComments = [...lead, ...heirLead];
      statement.node.leadingComments = null;
      statement.remove();
    }
    emptiedHostDeclarators.clear();
  }

  // the memo `memoizeWholeInit` planted stands right ahead of its host: in the same declaration, or
  // as the statement before an EXPORTED host's wrapper
  function noteWholeInitMemoHost(hostDeclarator) {
    const declaration = hostDeclarator.parentPath;
    const exported = declaration.parentPath?.isExportNamedDeclaration();
    const statement = exported ? declaration.parentPath : declaration;
    const body = statementListOf(statement.parentPath?.node);
    const decls = declaration.node.declarations;
    const memo = exported
      ? body?.[body.indexOf(statement.node) - 1]?.declarations?.[0]
      : decls[decls.indexOf(hostDeclarator.node) - 1];
    wholeInitMemoized.add(hostDeclarator.node);
    if (body && memoDeclarators.has(memo)) wholeInitMemoHosts.set(memo, { residual: hostDeclarator.node, body });
  }

  // a whole-init memo whose residual DIED holds its value for nobody but the extractions: where the
  // tail is a re-readable surface the prefix lifts to statements ahead and every extraction reads
  // the surface itself - the shape the other leg prints for a pattern the claims empty (`effect();
  // const m = _values(_globalThis.Array.prototype); const a = _at(_globalThis.Array.prototype);`).
  // the ref is a minted name, so every read of it in the host's statement list is one to respell;
  // the routes that claimed the residual may have rebuilt the host declaration, so the memo is
  // found again by node in that list, never through the path it was planted on
  function demoteDeadWholeInitMemos() {
    function declarationsOf(statement) {
      return statement?.declaration?.declarations ?? statement?.declarations;
    }
    for (const [memo, { residual, body }] of wholeInitMemoHosts) {
      if (!Array.isArray(body) || !memoDeclarators.has(memo)) continue;
      if (body.some(statement => declarationsOf(statement)?.includes(residual))) continue;
      const at = body.findIndex(statement => declarationsOf(statement)?.includes(memo));
      const { init } = memo;
      if (at === -1 || init?.type !== 'SequenceExpression') continue;
      // a bare identifier or `this` re-reads for free like a built-in surface (the other leg's own
      // reusable-init test); anything else the memo held for a reason
      const tail = init.expressions.at(-1);
      if (tail.type !== 'Identifier' && tail.type !== 'ThisExpression'
        && !isReReadableSurfaceNav(tail, name => !!injector?.getBindingInfo?.(name))) continue;
      const ref = memo.id.name;
      const statement = body[at];
      const decls = declarationsOf(statement).filter(item => item !== memo);
      memoDeclarators.delete(memo);
      t.traverseFast({ type: 'Program', body }, node => {
        for (const key of Object.keys(node)) {
          const child = node[key];
          if (child?.type === 'Identifier' && child.name === ref) node[key] = t.cloneNode(tail);
        }
      });
      const prefix = init.expressions.slice(0, -1).map(expr => t.expressionStatement(expr));
      if (decls.length) {
        (statement.declaration ?? statement).declarations = decls;
        body.splice(at, 0, ...prefix);
      } else body.splice(at, 1, ...prefix);
    }
    wholeInitMemoHosts.clear();
  }

  // what a host whose pattern EMPTIED still owes the program: the effects its init performed, and
  // the value a STORE inside it published. the hops the residual render folded into the tail are
  // dead once nothing binds off them, so the tail reduces to the root the source spelled - and a
  // store already yields that root, so it stands alone (`_unused = kw = (eff(), _globalThis)`)
  function emptiedHostSinkValue(init) {
    const { prefix, tail } = peelNestedSequenceExpressions(init);
    // a STORE is a write to a BINDING: a member write is an ordinary effect, and the value it
    // yields is not the receiver the readers took
    function storesBinding(node) {
      return node?.type === 'AssignmentExpression' && node.operator === '=' && node.left?.type === 'Identifier';
    }
    if (storesBinding(tail) && !prefix.length) return { value: tail, stores: true };
    if (prefix.length && storesBinding(peelNestedSequenceExpressions(prefix.at(-1)).tail)) {
      return { value: prefix.length === 1 ? prefix[0] : t.sequenceExpression(prefix), stores: true };
    }
    let root = tail;
    while (root?.type === 'MemberExpression' && !root.computed) root = root.object;
    return { value: prefix.length ? t.sequenceExpression([...prefix, root]) : root, stores: false };
  }

  function splitFlatMultiDecls() {
    demoteDeadWholeInitMemos();
    for (const declaration of flatTouchedMultiDecls) {
      if (!declaration.node || !declaration.parentPath || !declaration.isVariableDeclaration()) continue;
      const decls = declaration.node.declarations;
      if (!decls || decls.length <= 1) continue;
      // a TDZ-safe trailing declarator stays grouped with its predecessor; a host memoized WHOLE
      // prints memo, extractions and residual as three statements, its extractions in one
      const memoHost = decls.some(d => wholeInitMemoized.has(d));
      const slotHost = slotMemoHosts.get(declaration.node);
      const slotJoin = !!slotHost && decls.includes(slotHost) && patternBindingCount(slotHost.id) > 0;
      const groups = [];
      for (const d of decls) {
        const joinsPrev = groups.length && (attachToPrevDeclarator.has(d)
          || (memoHost && !memoDeclarators.has(d) && !memoDeclarators.has(groups.at(-1)[0]) && !wholeInitMemoized.has(d))
          || (slotJoin && !memoDeclarators.has(d) && !memoDeclarators.has(groups.at(-1)[0])));
        if (joinsPrev) groups.at(-1).push(d);
        else groups.push([d]);
      }
      if (groups.length <= 1) continue;
      const isExport = declaration.parentPath.isExportNamedDeclaration();
      const target = isExport ? declaration.parentPath : declaration;
      const slotParent = target.parentPath?.node;
      const stmts = groups.flatMap(g => {
        const entry = splitLiftedPrefixes.get(g[0]?.id);
        const statement = g.length === 1 && memoDeclarators.has(g[0])
          ? t.variableDeclaration('const', g)
          : wrapAsExportIf(t.variableDeclaration(declaration.node.kind, g), isExport);
        return entry?.statements?.length ? [...entry.statements, statement] : [statement];
      });
      // an unbraced control slot takes exactly one statement
      if (isBodylessStatementSlot(slotParent, target.node)) target.replaceWith(bodylessSlotStatement(declaration.node.kind, stmts));
      else if (Array.isArray(slotParent?.body) || Array.isArray(slotParent?.consequent)) target.replaceWithMultiple(stmts);
    }
    flatTouchedMultiDecls.clear();
    splitLiftedPrefixes.clear();
    // ref NAMES restart per file, so the set of slot memo refs does too
    slotMemoRefNames.clear();
  }

  // post-traverse verdict on the array-wrapped residuals above, the flat consume channel's own
  // two rules applied one level down: a consumed prop LEAVES its pattern (the extraction binds
  // it, and the residual re-reading the same key is a second getter fire native never performs),
  // and a residual left binding NOTHING over an ARRAY-LITERAL init is dead code that drops whole.
  // the element's own read survives inside the extraction's dispatch (`readsReceiver`), so
  // neither erases an observable. a REST sibling keeps its sentinel - rest gathers what the
  // pattern did not name, so the consumed key has to stay excluded
  function pruneArrayResiduals() {
    for (const { declaration, declarator, sentinels, consumed, readsReceiver, emptied } of arrayWrappedResiduals.values()) {
      if (!readsReceiver || !declaration.node || !declaration.parentPath || !declaration.isVariableDeclaration()) continue;
      if (declarator.id?.type !== 'ArrayPattern' || declarator.init?.type !== 'ArrayExpression') continue;
      if (!declaration.node.declarations.includes(declarator)) continue;
      const live = declaration.node.declarations.filter(item => item !== declarator);
      for (const { propNode, patternNode } of consumed) {
        if (!patternNode?.properties?.includes(propNode) || patternNode.properties.some(isRestProperty)) continue;
        // a prop whose KEY carries an effect keeps its slot: the key runs where it stands, and
        // removing the prop takes the effect with it
        if (computedKeyHasSideEffects(propNode)) continue;
        patternNode.properties = patternNode.properties.filter(item => item !== propNode);
      }
      // ... and the HOP the removal emptied leaves with it: a `{ y: {} }` husk still READS `y`,
      // a second getter fire for a slot that now binds nothing. only OBJECT props cascade - an
      // emptied array ELEMENT keeps its `{}`, which is what holds the position it coerces
      pruneEmptiedHopProps(declarator.id, { mint: generateUnusedId });
      // ... except at the END, where no position needs holding: an array pattern whose LAST element
      // binds nothing is a shape the downstream destructuring lowering miscompiles, dropping an
      // EARLIER element's binding with it (`const [{ other }, {}] = [x, arr]`). the literal still
      // evaluates every position shed here, and the extraction coerces what the husk would
      const shed = arrayWrapperResidualTrailingShed(declarator.id, emptied);
      if (shed && shed < declarator.id.elements.length) declarator.id.elements.length -= shed;
      // the DECLARATION drops only when nothing observable rides it: a surviving user binding,
      // an EFFECT-bearing key (it runs where it stands) or an effect-bearing init all keep it -
      // pruning the consumed props above is safe either way, since the declaration remains
      if (hasRealBinding(declarator.id, sentinels) || patternKeepsEffectfulKey(declarator.id)
        || !arrayWrapperResidualDroppable(declarator.id, emptied)) continue;
      // an init that still CARRIES effects the pattern discards (`[_ref, eff2()]` after the memo took
      // its slot) re-emits them as statements where the declaration stood, in source order - the
      // shape the plan route prints for the same neighbours (`liftTrailing`) and the other leg's
      // lift. a level whose memo WRITES in its slot keeps the declaration: that write is the memo
      // ... a SIBLING declarator keeps the husk instead: the effects run between the declarators, and no
      // statement slot stands there (the other leg keeps it too)
      const discarded = discardedWrapperEffects(declarator.init, declarator.id);
      if (!discarded || (discarded.length && live.length)) continue;
      const lifted = discarded.map(expr => t.expressionStatement(expr));
      // a SIBLING declarator keeps the declaration - only the emptied one leaves it
      if (live.length) {
        // the extractions stayed glued to the RESIDUAL that is leaving: with it gone they are
        // ordinary declarators again, and the split renders the statement-per-declarator canon
        // the flat channel emits for the same receiver
        for (const item of declaration.node.declarations.slice(declaration.node.declarations.indexOf(declarator) + 1)) {
          if (!attachToPrevDeclarator.has(item)) break;
          attachToPrevDeclarator.delete(item);
        }
        declaration.node.declarations = live;
      } else {
        const host = declaration.parentPath.isExportNamedDeclaration() ? declaration.parentPath : declaration;
        if (lifted.length) host.replaceWithMultiple(lifted);
        else host.remove();
      }
    }
    arrayWrappedResiduals.clear();
  }

  return {
    deferredSideEffects,
    retainedForInitHosts,
    extractCatchClause,
    extractLoopLeft,
    handleObjectPropertyResult,
    flushProbedAnchorSwaps,
    splitFlatMultiDecls,
    joinBodylessVarBlocks,
    flushForInitCarries,
    prepareSplitLiftedPrefixes,
    tryFlattenProxyHopHost,
    pruneArrayResiduals,
    pruneEmptiedHostDeclarators,
    flushDiscardedElementSentinels,
  };
}
