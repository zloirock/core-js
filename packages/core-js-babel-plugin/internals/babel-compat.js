// babel-specific AST primitives + optional-chain handling. covers ref memoization,
// optional-chain deoptionalization, instance-method replacement strategies, TS-wrapper
// peeling. destructure emission moved out to `internals/destructure-emitter.js`.
import {
  directClaimProbePlan,
  destructureProbePlan,
  composableNavGuardPlan,
  planProvenNavGuardCollapse,
  planKeptSequenceTail,
  claimReceiverEvaluationMayThrow,
  descendToChainRoot,
  keySideEffectsOnly,
  maximalProxyGlobalPrefix,
  chainReadsThroughSeal,
  collectChainAssignsThroughMemberChain,
  guardTailPullCount,
  navHasUnresolvableProxyHop,
  navValueCanShortCircuit,
  proxyHopLacksPureEntry,
  peelChainRootValue,
  peelReceiverSequenceTail,
  callValueCanBeUndefined,
  deleteGuardKeepingHop,
  inlineCallProxyGlobalRoot,
  receiverSequenceTailKeys,
  navRootPrefixNodes,
  storedAbsenceObservedAbove,
  storedNavHopClaimSuppressed,
  storedUserAssignmentOf,
  navGuardTestPlan,
  navGuardSourcePlan,
  proxyReceiverValueCanBeUndefined,
  probedNavGuardValuePlan,
  foldableRealmHop,
  handsValueOn,
  mutationGuardKeepingHop,
  resolveObjectName,
  vestigialNavOptionals,
  proxyGlobalRootName,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  dispatchConsumesRun,
  landRunOnDeepestBackedSpan,
  planClaimlessCallRootedNav,
  proxyRunLandingPure,
} from '@core-js/polyfill-provider/detect-usage/members';
import { decidedReusableReceiver, isConstantLiteralReceiver } from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  classifyReceiverSE,
  chainValueCarrier,
  isNullLiteralNode,
  isDeoptedGlobalSlotRead,
  createTypeAnnotationChecker,
  deleteHostAboveChain,
  deleteOverOpenContinuation,
  isDestructurePattern,
  memberChainEndPath,
  isMemberWriteHost,
  isMemberAccessNode,
  isReusableReceiver,
  mayHaveSideEffects,
  calleeParenWrapped,
  memberKeyName,
  memberProxyHopName,
  migratableClaimSe,
  nodeSpan,
  observableSequenceElements,
  optionalCallReceiverGuard,
  peelParenAndTSParentPath,
  peelParenAndTSSlotPath,
  peelNestedSequenceExpressions,
  peelSkippableWrapperPath,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverCarriesLiveOptional,
  reEvaluationObservable,
  SKIPPABLE_WRAPPER_TYPES,
  subtreeContainsNode,
  staticMemberKeyName,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  unwrapCollectingSePrefixes,
  unwrapParens,
  unwrapRuntimeExpr,
  noteRenderRetiredWrites,
  hasDeferredContextAncestor,
  collectFoldedReceiverSideEffects,
  definedBranchOfGuardConditional,
  isRenderedStoredValue,
  peelChainAssignment,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  composeNullGuardTest,
  conditionalExpression,
  hostSlot,
  literal,
  nullFirstGuardTest,
  renderClaimProbe,
  renderMethodCall,
  renderOptionalMethodCall,
  renderReceiverMemo,
  planMethodCall,
  planOptionalMethodCall,
  renderDeleteShortCircuitGuard,
  renderKeptSequenceTail,
  renderNavCollapseValue,
  renderNavGuardTest,
  renderShortCircuitGuard,
} from '@core-js/polyfill-provider/render';
import estreeToBabel, { printableWriteTarget } from './estree-to-babel.js';

// is `child` the operand slot (object/callee) of an optional expression,
// possibly through TS wrappers OR explicit ParenthesizedExpression?
// default babel parser strips parens (records via `extra.parenthesized`); under
// `parserOpts.createParenthesizedExpressions: true` parens become real AST nodes
// and would block the match without an explicit peel
function isOptionalOperand(child, parent) {
  const slot = parent.isOptionalMemberExpression() ? 'object'
    : parent.isOptionalCallExpression() ? 'callee' : null;
  if (!slot) return false;
  return peelTransparentExpr(parent.node[slot]) === child.node;
}

// remove a pattern slot, keeping the bindings it WRITES: babel's `remove()` unregisters every name the
// removed node could declare, and a slot of an assignment pattern declares none - the binding it writes is
// declared elsewhere and outlives the slot, so a later lookup still finds it. a slot declaring its name
// leaves with it
export function removePatternSlot(slot) {
  const kept = [];
  for (const [name, ids] of Object.entries(slot.getBindingIdentifiers(true))) {
    const binding = slot.scope.getBinding(name);
    if (binding && !ids.includes(binding.identifier)) kept.push([name, binding]);
  }
  slot.remove();
  for (const [name, binding] of kept) {
    if (!binding.scope.hasOwnBinding(name)) binding.scope.bindings[name] = binding;
  }
}

// clone a slot target as the left of a write the emitter builds: the node dialect keeps a source paren as a
// node no assignment takes, so the write takes the slot inside it, spelled as the render canon's writes are
export function cloneWriteTarget(t, node) {
  return printableWriteTarget(t.cloneNode(unwrapParens(node)));
}

// write `rendered` into the slot the value peel ended on, replayed by its keys (`receiverSequenceTailKeys`):
// the effect prefixes, nested sequences and paren nodes standing above the value keep running where the
// source wrote them. walking raw `SequenceExpression` nodes instead reads a parser that keeps paren nodes
// as "nothing to descend", and writing into the outer sequence's last element replaces a nested one whole.
// `overTailLayers` replaces the layers wrapping the tail itself along with it, as wherever a bare global
// is replaced (`globalThis as any` -> `_globalThis`)
export function landInSequenceTail(host, slot, rendered, { overTailLayers = false } = {}) {
  const keys = receiverSequenceTailKeys(host[slot]);
  if (overTailLayers) while (keys.at(-1) === 'expression') keys.pop();
  let holder = host;
  let key = slot;
  for (const next of keys) {
    holder = holder[key];
    key = next;
  }
  holder[key] = rendered;
}

// the slot the swap of a proxy hop replaces: the transparent wrappers over the hop go with the substituted spelling,
// but one a user store holds (`storedUserAssignmentOf`) is written around the value the store hands on and stays
// (`kv = globalThis.self as any` stores `_self as any`), where the other leg's landing ends its climb too
export function proxyHopSwapSlotPath(path) {
  let slot = path;
  for (let up = slot.parentPath; up?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(up.node.type); up = slot.parentPath) {
    if (up.node.type !== 'ParenthesizedExpression' && storedUserAssignmentOf(up, { throughReads: false })) break;
    slot = up;
  }
  return slot;
}

// the babel dialect spells the two optional-chain links as their own node TYPES. asking by type
// keeps the path-form and node-form callers on one predicate - both spellings occur, and a
// path-only predicate leaves the node-form ones re-deriving it
const OPTIONAL_CHAIN_LINK_TYPES = new Set(['OptionalMemberExpression', 'OptionalCallExpression']);

// one wrapper per types object: babel hands over the same namespace every time, but a caller that
// builds a fresh options object per file re-enters here per file, and the spread copies ~1200 exports
const wrappedTypes = new WeakMap();

// `t.cloneNode` keeps a node's `loc` but drops its `start` / `end` OFFSETS, and the resolver's
// positional rules - the straight-line reaching write, the loop back-edge climb, the suspension a
// guard goes stale at - read exactly those offsets. a read carried into a rewritten host by a clone
// then answers "no position" to all of them, and they do not degrade alike: the suspension rule
// silently keeps a guard the write had already invalidated, emitting a type-specific helper for the
// wrong family. the offsets survive inside `loc`, so the copy is re-stamped from its own loc - and a
// copy spells the same source text as its original, so sharing that span is the honest answer.
// wrapped ONCE around the types object babel hands over, rather than at each of the ~190 clone sites
export function rangePreservingTypes(t) {
  const memo = wrappedTypes.get(t);
  if (memo) return memo;
  const wrapper = buildRangePreservingTypes(t);
  wrappedTypes.set(t, wrapper);
  return wrapper;
}

function buildRangePreservingTypes(t) {
  function restampRanges(clone) {
    t.traverseFast(clone, node => {
      const start = node.loc?.start.index;
      const end = node.loc?.end.index;
      if (typeof start === 'number' && typeof end === 'number') {
        node.start = start;
        node.end = end;
      }
    });
    return clone;
  }
  // BOTH clone entry points, and `cloneDeep` is not covered by overriding `cloneNode`: it reaches the
  // module's own binding, never this object's property, so a copy taken through it kept the gap
  // a spread COPY, not a prototype chain: babel hands over a frozen module namespace, whose
  // non-writable slots reject an override on anything inheriting from it.
  // a deep copy stands in for its original, so the writes the original holds may leave the tree with it -
  // noted for the lookups to check
  return {
    ...t,
    // ... save a copy whose place or spelling the source never had: a receiver handed to a helper call, a
    // computed key moved out of the pattern it ran late in, a re-emitted effect rendered again in place
    // (`alias = _globalThis`). the reaching lanes read the source's structure - and rank its writes by their
    // source positions - which is what the other leg reads too, so the original goes on answering for the
    // source write there
    cloneWithoutRetiring: node => restampRanges(t.cloneNode(node, true)),
    // a SHALLOW clone shares the original's children, and stamping those would give live source nodes
    // a span they never occupied - only a deep copy is ours to restamp
    cloneNode: (node, deep = true, ...rest) => {
      const clone = t.cloneNode(node, deep, ...rest);
      if (!deep) return clone;
      noteRenderRetiredWrites(node);
      return restampRanges(clone);
    },
    cloneDeep: (node, ...rest) => {
      noteRenderRetiredWrites(node);
      return restampRanges(t.cloneDeep(node, ...rest));
    },
  };
}

// the receiver copy an emit hands to its helper. the kept-nav collapse of a chain-assign inside it
// is DEFERRED to program exit - an early rewrite hides the member chain from the claim resolvers
// still due to visit it - and that flush matches by NODE, so the copy has to register for it in its
// own right: keyed on the original it landed on the detached subtree while the emitted one kept the
// raw hop (`(k = _globalThis.self.window)` where the value canon spells `(k = _self.window)`, the
// spelling the static claim beside it already reads through). the assignment may sit anywhere inside
// the copy - directly, under the member hops the canon's own dig walks, or under a helper call an
// inner claim already built around it - so the registration walks the whole copy, each candidate
// self-gating on the plan
export function cloneReceiverForEmit({ t, collapse, node, path, types = null }) {
  // a memo ref inside the receiver carries its resolved Type in the shared record, keyed on the NODE
  // - a deep clone leaves every one of those behind, and the dispatch above then picks the untyped
  // helper (`_at(_ref)` where the seeded twin resolves `_atMaybeArray`). the refs are minted with
  // unique names, so the name pairs the copy back to its original
  const seeded = new Map();
  if (types) {
    t.traverseFast(node, inner => {
      if (inner.type === 'Identifier' && types.get(inner)) seeded.set(inner.name, types.get(inner));
    });
  }
  const clone = t.cloneWithoutRetiring(node);
  // the copy is structurally identical, so one deterministic walk of each pairs the nodes in order.
  // the PAIRING is what the collapse below needs; the source positions the kept-nav trust proof reads
  // come back with the clone itself, since `rangePreservingTypes` wraps this `t`
  const originals = [];
  t.traverseFast(node, inner => originals.push(inner));
  // the stores this receiver hands its VALUE on to: what the dispatch reads is the receiver's own
  // value, so a store the carriers do not reach (a `&&` left, a branch TEST) is not read through it
  // and keeps the collapse's own spelling
  const spine = new Set();
  (function descend(cur) {
    if (!cur || typeof cur !== 'object') return;
    if (cur.type === 'AssignmentExpression' && cur.operator === '=') spine.add(cur);
    // the carrier slots by name - a sequence hands on its LAST expression, and a blind property
    // sweep skips it (the tail lives in an array) exactly where the value flows
    for (const child of [cur.expression, cur.right, cur.consequent, cur.alternate, cur.left,
      Array.isArray(cur.expressions) ? cur.expressions.at(-1) : null]) {
      if (child && typeof child === 'object' && handsValueOn(cur, child)) descend(child);
    }
  })(node);
  let at = 0;
  t.traverseFast(clone, inner => {
    const origin = originals[at++];
    if (inner.type === 'AssignmentExpression' && spine.has(origin)) collapse(inner, path);
    if (inner.type === 'Identifier' && seeded.has(inner.name)) types.set(inner, seeded.get(inner.name));
  });
  return clone;
}

export function isOptionalNode(node) {
  return OPTIONAL_CHAIN_LINK_TYPES.has(node?.type);
}

// rewrite an Optional{Member,Call}Expression in place into its plain twin
export function deoptionalizeAstNode(node) {
  node.type = node.type === 'OptionalMemberExpression' ? 'MemberExpression' : 'CallExpression';
  delete node.optional;
}

// path form: babel caches the type on the path too, so it has to move with the node
function deoptionalizeNode(path) {
  deoptionalizeAstNode(path.node);
  path.type = path.node.type;
}

// the claim carried its own `?.` and the replacement is always defined, so an ancestor whose
// `.optional` pointed AT that claim now dangles against a non-optional left side - deopt it. the
// same spine rule as `normalizeOptionalChain`'s climb bounds which ancestor that is: one reached
// from an ARGUMENT or a computed key owns a `?.` of its own (`host?.fn?.(Array?.from)`), and
// stripping it turns the user's short-circuit into a call on `undefined`
function deoptionalizeDanglingOptionalParent(replacePath) {
  let child = replacePath;
  let p = child.parentPath;
  // ... and THROUGH the carriers a swap can leave in the way (a re-emitted effect prefix, a kept
  // write): a carrier hands its value on, so the member above one reads the substituted binding
  // itself and its `?.` is as dead as the direct spelling's
  for (;;) {
    while (p?.node && SKIPPABLE_WRAPPER_TYPES.has(p.node.type)) {
      child = p;
      ({ parentPath: p } = p);
    }
    if (!p?.node || !chainValueCarrier(p.node, child.node)) break;
    child = p;
    ({ parentPath: p } = p);
  }
  if (p?.node?.optional && isOptionalOperand(child, p)) deoptionalizeNode(p);
}

// the resolver-facing options (`getAdapter` / `resolvePureGlobalEntry` / `injectPureGlobal`) are
// genuinely optional: the unit harness constructs the helpers with the injector alone to isolate
// AST-shape behaviour from resolver wiring, so every consumer of them must gate as a family
// restore the source parens around a tagged template's TAG once the tail above the render carries
// a `?.`: the chain must end at the parens, both to stay legal (a bare optional chain is not a
// valid tag) and to keep the tag a REFERENCE, so the call still binds `this` to the last read
function reparenthesizeTaggedTag(t, fromPath) {
  for (let step = fromPath; step?.node;) {
    // the tag SLOT may hold a wrapper stack over the chain (`(nav.tag!)`x``) - the wrap lands on
    // what the tagged template actually holds, and a seal that survived as a NODE needs no second
    const slot = peelParenAndTSSlotPath(step);
    const parent = slot.parentPath;
    if (parent?.isTaggedTemplateExpression() && parent.node.tag === slot.node) {
      if (!slot.isParenthesizedExpression()) slot.replaceWith(t.parenthesizedExpression(slot.node));
      return;
    }
    if (!parent?.isMemberExpression() && !parent?.isOptionalMemberExpression()) return;
    step = parent;
  }
}

// the VALUE a nav-collapse plan answers - its ponyfill leaf plus the hops above it, with no test around
// it. the guarded render is the other half of the same plan (`renderNavCollapseAst`); this one is what a
// slot holding the nav's VALUE takes when nothing about that value short-circuits
function navPlanValueAst(t, plan, pureId, renderedPlanTails) {
  const out = estreeToBabel(renderNavCollapseValue(plan, hostSlot(t.cloneNode(pureId)), {
    cloneHost: node => hostSlot(t.cloneNode(node)),
  }));
  for (let cur = out, left = plan.hops.length - plan.collapseIdx - 1; left > 0; left--, cur = cur.object) {
    renderedPlanTails.add(cur);
  }
  return out;
}

// a CLAIM sitting BELOW the chain end (`(nav).Map.prototype`) is the erase channel's: it re-emits
// the read as a throw probe AND swaps the claim, while the guard render spells the nav and leaves
// the claim native (`(guard).Map.prototype` - the realm's prototype, not the ponyfill's). a claim
// that IS the end (`(nav).Array`) has no such owner and stays with that render. through the canon:
// a claim spelled with a FOLDED key (`(nav)[(c++, 'Map')].prototype`) owns the chain exactly like
// the dotted one, and a narrower reader answered null there - the render then took a chain the
// claim was going to swap, leaving the constructor read raw off the guarded nav. down the WHOLE run
// below the end, not one step: a non-claimable key can stand between the end and the claim
// (`.Map.prototype.noSuchMethod`), and stopping at it took the chain anyway
// asked as the CLAIM channel asks it - a DEOPTED name reads verbatim there, so it owns nothing and
// standing down for it leaves the nav unguarded. under a `delete` the fold owns the chain either
// way, and the guard render would spell the value instead
function claimBelowEndOwnsChain(memberPath, {
  adapter,
  resolvePureGlobalEntry,
  resolvePureStaticEntry = null,
  resolvePurePrototypeEntry = null,
}) {
  const deleteFolds = deleteHostAboveChain(memberPath, memberPath.node, unwrapRuntimeExpr);
  // does the nav's own short-circuit REACH the claim above it? a seal ends the chain, so the read
  // over it is plain and observes the void - the instance channel below reads that receiver without
  // guarding it, and this render owes the guard. unsealed, the claim's chain carries the same `?.`
  // and its split spells the test
  const sealedFromClaim = chainReadsThroughSeal(memberPath.node,
    ({ name }) => resolvePureGlobalEntry(name, memberPath),
    { scope: memberPath.scope, adapter, path: memberPath });
  for (let belowEnd = memberPath.node.object; belowEnd;) {
    while (belowEnd && TS_EXPR_WRAPPERS.has(belowEnd.type)) belowEnd = belowEnd.expression;
    if (belowEnd?.type !== 'MemberExpression' && belowEnd?.type !== 'OptionalMemberExpression') break;
    if (memberProxyHopName(belowEnd)) break;
    // a key this walk cannot NAME is a step, not a stop: a computed one (`.Promise[k].zzz`) names
    // no claim of its own, and ending the walk there handed the chain to the render while the
    // constructor below it still owed a swap - the raw ctor read off the ponyfill
    const belowKey = staticMemberKeyName(belowEnd);
    if (belowKey && (deleteFolds || !isDeoptedGlobalSlotRead({ kind: 'global', name: belowKey }, adapter))
      && resolvePureGlobalEntry(belowKey, memberPath)) return true;
    // ... and a STATIC of a host below the end owns it the same way (`<nav>.Number.MAX_SAFE_INTEGER
    // .name`): asked by GLOBAL name alone the key answered nothing, the guard render took the chain
    // and the static stayed native off the ponyfill - a lost polyfill leg parity cannot see. the HOST
    // must be a real constructor / namespace (a proxy-global hop hosts the realm, not a static), and
    // an INSTANCE answer off such a host belongs to the instance channel, which renders its own receiver
    const belowHost = belowKey ? staticMemberKeyName(belowEnd.object) : null;
    if (belowHost && belowKey && !POSSIBLE_GLOBAL_OBJECTS.has(belowHost)
      && resolvePureStaticEntry?.(belowHost, belowKey, memberPath)?.kind === 'static') return true;
    // ... and a PROTOTYPE method read below the end (`<nav>.Array.prototype.at.call(...)`) is the
    // instance channel's claim, and that channel splits its receiver and composes the nav's guard
    // into its own test - the other leg's order, where the outer claim renders before the hops it
    // reads through. the guard render taking the chain first spelled the same test by a second
    // channel (`null == x` against the split's `x == null`), one source in two spellings
    const belowCtor = !sealedFromClaim && belowHost === 'prototype'
      ? staticMemberKeyName(unwrapRuntimeExpr(belowEnd.object).object) : null;
    if (belowCtor && belowKey && resolvePurePrototypeEntry?.(belowCtor, belowKey, memberPath)) return true;
    belowEnd = belowEnd.object;
  }
  return false;
}

// does this value flow straight into a DESTRUCTURING pattern - the pattern's own read, and not a
// plain member read above it? the climb steps through the member run and the transparent wrappers,
// so the FIRST host that is neither answers. the destructure read has an owner (the claim channel
// memoizes its probe), which is why the claimless collapses next door stand down for it
export function destructuredValueAbove(path) {
  let cursor = path;
  for (let up = path.parentPath; up?.node; cursor = up, up = up.parentPath) {
    const { node } = up;
    if (unwrapRuntimeExpr(node) !== node) continue;
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && unwrapRuntimeExpr(node.object) === unwrapRuntimeExpr(cursor.node)) continue;
    if (node.type === 'VariableDeclarator') {
      return isDestructurePattern(node.id) && node.init === cursor.node;
    }
    if (node.type === 'AssignmentExpression' || node.type === 'AssignmentPattern') {
      return isDestructurePattern(node.left) && node.right === cursor.node;
    }
    return false;
  }
  return false;
}

// descend the object spine to the span the plan picked - through members, sequence tails and the
// transparent wrappers - and swap only it, leaving the probe run above it spelled where the source
// wrote it. the kept members are THIS render's product: registered as plan tails so the hop claims
// inside the span stand down instead of re-collapsing one step further than the identifier twin
// ever spells
function swapProbeRunBase(endPath, swapNode, basePureId, markRenderedPlanTail) {
  let callPath = endPath.get('object');
  while (callPath?.node && callPath.node !== swapNode) {
    if (callPath.isMemberExpression() || callPath.isOptionalMemberExpression()) {
      callPath = callPath.get('object');
    } else if (callPath.isSequenceExpression()) {
      callPath = callPath.get('expressions').at(-1);
    } else if (callPath.node.expression !== undefined) {
      callPath = callPath.get('expression');
    } else return false;
  }
  if (callPath?.node !== swapNode) return false;
  callPath.replaceWith(basePureId);
  for (let kept = endPath.node; kept?.type === 'MemberExpression' || kept?.type === 'OptionalMemberExpression';
    kept = kept.object) markRenderedPlanTail?.(kept);
  return true;
}

// the babel RENDER of the shared claimless call-rooted plan (`planClaimlessCallRootedNav` -
// the verdicts live in the core): every claim channel here is driven by a claim, and a nav
// with none would ride raw - a native `self` read where the ponyfill is the point. an
// IDENTIFIER root is not this: its own visitor substitutes the root and the hop drive owns
// the rest
function collapseClaimlessCallRootedNav({
  endPath, adapter, resolvePureGlobalEntry, resolvePurePrototypeEntry, injectPureGlobal, collapseNav, withSideEffects,
  collapseKeptValue, markRenderedPlanTail,
}) {
  if (!adapter || !endPath?.scope || !injectPureGlobal || !resolvePureGlobalEntry) return false;
  // a MEMBER consumer only - the same callback also fires for a destructure property, whose node
  // has no navigation at all
  if (!endPath.isMemberExpression?.() && !endPath.isOptionalMemberExpression?.()) return false;
  // a `delete` naming a slot ON THIS RUN reads nothing over its navigation, so the fold takes the
  // WHOLE nav to the root binding (the identifier spelling's base): anchored at a hop claim it would
  // stop mid-run, leaving the hops above raw off the root (`delete dh().self.window.k` kept
  // `.window`). a dispatch standing between the operator and the run makes it an ordinary read
  // instead, riding the deepest hop pure can back - the same question the spine asks off an
  // identifier root
  const deleteFold = deleteHostAboveChain(endPath, endPath.node, unwrapRuntimeExpr)
    && !dispatchConsumesRun({
      path: endPath,
      resolvePure: meta => meta.placement === 'prototype'
        ? resolvePurePrototypeEntry?.(meta.object ?? null, meta.key, endPath)
        : resolvePureGlobalEntry(meta.name, endPath),
      aliasCtx: { scope: endPath.scope, adapter, path: endPath },
    });
  // the plan reads the member ENDING the all-proxy run, and a claim channel fires wherever its own
  // meta declined - one hop short of that end whenever navigation continues above (`f().self
  // .window.mutatedSlot`). the climb to that end is the plan's own, ONE for every consumer and the
  // `delete` fold included: its base is the run's root binding either way, and walking to the chain
  // TOP instead handed the plan a run with plain members inside it, which the plan declines outright
  // - `delete f().self.window.a.k` then fell back to a hop claim and kept `.window` spelled off the root
  const plan = planClaimlessCallRootedNav({
    deleteFold: !!deleteFold,
    scope: endPath.scope,
    adapter,
    path: endPath,
    resolvePure: ({ name }) => resolvePureGlobalEntry(name, endPath),
  });
  if (!plan.verdict) return false;
  endPath = plan.endPath;
  const stored = storedUserAssignmentOf(endPath);
  switch (plan.verdict) {
    case 'guard': return collapseNav(endPath);
    case 'stand-down': return false;
    case 'kept-value': return !!collapseKeptValue?.(stored, endPath);
    case 'swap-call': {
      // the swapped span carries the setup the source ran on the way in, and this render is the
      // only slot left for it - without the re-emit channel the swap would drop it
      if (plan.droppedSe.length && !withSideEffects) return false;
      const base = injectPureGlobal(plan.basePure.entry, plan.basePure.hintName);
      return swapProbeRunBase(endPath, plan.swapNode,
        plan.droppedSe.length ? withSideEffects(base, plan.droppedSe) : base, markRenderedPlanTail);
    }
    case 'fold-whole': {
      if (!withSideEffects) return collapseNav(endPath);
      // the sequence prefixes the fold's peel stepped over re-emit ahead of the base
      const prefixes = collectFoldedReceiverSideEffects(endPath.node.object, { ctx: { scope: endPath.scope, adapter, path: endPath } });
      const navPath = endPath.get('object');
      navPath.replaceWith(withSideEffects(injectPureGlobal(plan.rootPure.entry, plan.rootPure.hintName), prefixes));
      deoptionalizeDanglingOptionalParent(navPath);
      return true;
    }
    case 'leaf-fold': {
      const navPath = endPath.get('object');
      navPath.replaceWith(injectPureGlobal(plan.pure.entry, plan.pure.hintName));
      deoptionalizeDanglingOptionalParent(navPath);
      return true;
    }
    default: return false;
  }
}

// CLONE a guard-test operand and PRE-substitute its proxy root: guard renders may be
// inserted where no natural identifier rewrite runs again (a deferred destructure probe, a
// post-traversal splice), and a raw `globalThis` in the test is a ReferenceError on exactly
// the engines the ponyfill serves. an ALIAS root is the user's own binding, kept verbatim
function cloneWithSubstitutedProxyRoot(node, anchorPath, { t, resolvePureGlobalEntry, injectPureGlobal }) {
  const cloned = t.cloneNode(node, true);
  if (cloned?.type === 'Identifier') {
    const rootPure = POSSIBLE_GLOBAL_OBJECTS.has(cloned.name) ? resolvePureGlobalEntry(cloned.name, anchorPath) : null;
    return rootPure ? t.cloneNode(injectPureGlobal(rootPure.entry, rootPure.hintName)) : cloned;
  }
  for (let spine = cloned; spine?.type === 'MemberExpression' || spine?.type === 'OptionalMemberExpression';) {
    let obj = spine.object;
    while (obj && TS_EXPR_WRAPPERS.has(obj.type)) obj = obj.expression;
    if (obj?.type === 'Identifier') {
      const rootPure = POSSIBLE_GLOBAL_OBJECTS.has(obj.name) ? resolvePureGlobalEntry(obj.name, anchorPath) : null;
      if (rootPure) spine.object = t.cloneNode(injectPureGlobal(rootPure.entry, rootPure.hintName));
      break;
    }
    spine = obj;
  }
  return cloned;
}

function collapseHopsBelowProbe({ probePath, anchorPath, adapter, resolvePure, injectPure }) {
  const below = peelTransparentExpr(probePath.node.object);
  if (!isMemberAccessNode(below)) return false;
  const plan = planProvenNavGuardCollapse({
    rootNode: below, scope: anchorPath.scope, adapter, path: anchorPath, resolvePure,
  });
  if (!plan || plan.topAssign || !plan.valueFormSpells
    || plan.hops.length !== plan.collapseIdx + 1) return false;
  const { leafPure: pure } = plan;
  probePath.get('object').replaceWith(injectPure(pure.entry, pure.hintName));
  return true;
}

// eslint-disable-next-line max-statements -- per-transform channel factory wiring
export default function (t, { getInjector, getAdapter, typeResolvers, resolvePureGlobalEntry,
  resolvePureStaticEntry = null, resolvePurePrototypeEntry = null, injectPureGlobal,
  collapseReceiverHops = null, releaseHandledNode = null } = {}) {
  const { resolveNodeType, resolvedType } = typeResolvers ?? {};
  const isInTypeAnnotation = createTypeAnnotationChecker();

  function reset() {
    isInTypeAnnotation.reset();
    pendingKeptNavCollapses.length = 0;
  }

  // useNode (optional) - the source node at the use site, so generateDeclaredRef can place a
  // loop-header memo `var` before the loop (not inside a block-converted bodyless body)
  function generateRef(scope, useNode) {
    return getInjector().generateDeclaredRef(scope, useNode);
  }

  function generateLocalRef(scope) {
    return getInjector().generateLocalRef(scope);
  }

  function generateUnusedId() {
    return t.identifier(getInjector().generateUnusedName());
  }

  // Apply the already shared navigation decisions before the call asks about its receiver.
  // This is an apply step: imports and source replacement must never enter planMethodCall.
  function prepareMemoReceiver(node, ctx) {
    // Preserve the kept sequence probe before cloning the receiver into its guard.
    const canRender = ctx?.adapter && ctx.path && resolvePureGlobalEntry && injectPureGlobal;
    const keptTail = canRender && planKeptSequenceTail(unwrapRuntimeExpr(node), {
      adapter: ctx.adapter,
      aliasCtx: ctx,
      resolveGlobalPolyfill: name => resolvePureGlobalEntry(name, ctx.path),
    });
    if (keptTail) {
      if (keptTail.probe) keptTail.probe = cloneWithSubstitutedProxyRoot(keptTail.probe, ctx.path,
        { t, resolvePureGlobalEntry, injectPureGlobal });
      keptTail.holder[keptTail.key] = estreeToBabel(renderKeptSequenceTail(keptTail, {
        injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
        embed: hostSlot,
      }));
    }
    const navPlan = canRender && planProvenNavGuardCollapse({
      rootNode: node,
      ...ctx,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, ctx.path),
      allowSequenceRoot: true,
      descendSequenceTail: true,
    });
    if (navPlan && !navPlan.topAssign) {
      const { leafPure: pure } = navPlan;
      node = renderNavCollapseAst(navPlan, injectPureGlobal(pure.entry, pure.hintName));
    }
    return node;
  }

  // `anchorNode` - a RANGE-BEARING node at the use site for `var _ref` placement. defaults
  // to `node`, but callers memoizing a CLONE or a rendered navigation probe must pass the
  // live source node instead: a range-less useNode fails the param/loop-header escape
  // check and strands the `var` in the
  // function body, unreachable from a parameter-default use (ReferenceError at call time for
  // a TS parameter-property default)
  function memoize(node, scope, anchorNode = node, interveningEffects = false, ctx = null, directCallee = false) {
    node = prepareMemoReceiver(node, ctx);
    const { prefix, tail } = peelNestedSequenceExpressions(node);
    // The first read owns comments; repeated reads only need the stable tail.
    const value = prefix.length ? tail : node;
    if (isReusableReceiver(value, { interveningEffects, directCallee, ctx })) {
      return [t.cloneNode(node), t.removeComments(t.cloneNode(value))];
    }
    const ref = generateRef(scope, anchorNode);
    const assign = t.assignmentExpression('=', t.cloneNode(ref), node);
    // register the synthetic write so a RE-VISIT of the memo body can follow the ref back to
    // its value (the assignment never appears in scope constantViolations)
    getInjector?.()?.recordMemoWrite?.(ref.name, assign);
    return [assign, ref];
  }

  // resolve the expression's Type object - no-op when the factory was constructed without
  // typeResolvers (tooling that uses this module for raw AST rewrite only). `null` on
  // unresolvable types, cheaper on repeat calls thanks to resolveCache. Type cached in
  // the typeResolvers' WeakMap (via `resolvedType.set`) - canonical constructor form is
  // preserved for downstream `KNOWN_*_RETURN_TYPES` lookups, no AST-property pollution
  function pathType(p) {
    return resolveNodeType ? resolveNodeType(p) : null;
  }

  // clone a memoized `_ref` and, when its Type is known, seed it on the SAME clone that goes into
  // the AST so `resolveNodeType`'s WeakMap short-circuit resolves the synthesized (position-less)
  // ref back - keying a separate clone loses the type and enhanceMeta falls to the generic variant.
  // `resolvedType` may be undefined when wired without typeResolvers (raw AST-rewrite tooling)
  function seededRefClone(ref, type) {
    const clone = t.cloneNode(ref);
    if (type) resolvedType?.set(clone, type);
    return clone;
  }

  // guarded claims minted by the static erase-refusal (`null == root ? void 0 : <claim>`).
  // identity-tracked so an OUTER instance wrapper can re-hang the guard above itself instead of
  // wrapping the whole ternary (which would hand `void 0` to the helper - a throw where native
  // short-circuits). a USER-written ternary of the same shape must NOT re-hang: there the
  // wrapper legitimately consumes the branch value.
  // parenTerminated: chain barriers recorded at replace time (see markGuardedClaim's caller);
  // pendingKeptNavCollapses: kept nav-collapse renders awaiting their host-exit flush
  // throwingExtractions: helper-GET calls minted for DESTRUCTURE extractions -
  // native destructuring of undefined THROWS, so an erase-refusal guard must stay INSIDE the
  // helper argument (the helper then throws on the short-circuited void 0 exactly like native)
  // instead of climbing above it
  // hops a nav-collapse render emitted above its ponyfill leaf: the hop-drop
  // canon must not re-run on them, or the same source yields a different chain per traversal
  // chains whose tail feeds a TAGGED template: the source parens end the chain there, so the
  // lift that re-creates a short-circuit would swallow the throw the source performs
  const taggedTemplateTails = new WeakSet();
  const renderedPlanTails = new WeakSet();
  const renderedGuardTests = new WeakSet();
  const guardedClaims = new WeakSet();
  // Rendered throw probes are inserted AS-IS by the SE wrap, so
  // their served-read marks survive the visitor that would otherwise re-claim
  const mintedEffectNodes = new WeakSet();
  const pluginSeqWraps = new WeakSet();
  const parenTerminated = new WeakSet();
  const pendingKeptNavCollapses = [];

  const throwingExtractions = new WeakSet();
  const rebuiltSourceCalls = new WeakSet();
  function markThrowingExtraction(node) {
    throwingExtractions.add(node);
    return node;
  }
  function markGuardedClaim(node) {
    guardedClaims.add(node);
    return node;
  }
  // record the chain barrier when the replaced path sat inside user parens / a TS cast: the
  // barrier survives on the replacement so guard hoists (climb tail steps AND the instance
  // wrapper rebuild) stop at it - native throws past the barrier where the chain would
  // short-circuit, and a hoisted guard would swallow that throw
  function markParenTerminatedIfWrapped(path, replacement) {
    if (isWrappedInParens(path) || TS_EXPR_WRAPPERS.has(path.parentPath?.node?.type)) {
      parenTerminated.add(replacement);
    }
    return replacement;
  }

  // guarded-claim emission for the static erase-refusal (a live `?.` over an unresolvable
  // proxy hop): the claim re-hangs INSIDE the preserved guard - `null == (b = _globalThis
  // .window) ? void 0 : _Array$from(x)` - short-circuit intact. OUTER instance wrappers may
  // have consumed the member before the refusal fires, so the guard CLIMBS above the whole
  // plugin-built stack (helper wrap, its memoized twin, the `.call` dispatch, the surviving
  // optional-chain tail); ONLY plugin-minted wrappers and provable chain tails lift - a user
  // consumer of the member legitimately receives `void 0`, and user parens / TS casts
  // terminate the chain (native throws past them, so the guard must stay inside)
  function isHelperCall(callNode, argNode) {
    // SYNTHESIZED only: a plugin-built wrapper carries no source range. a call the SOURCE wrote
    // around the claim (`Array.of(<nav>)`) wears an injected callee too once its own static
    // resolves, but it is a polyfill in its own right - lifting a guard over it turns the
    // argument's short-circuit into the whole call's
    // a plugin HELPER wraps the claim and stays undefined-tolerant, so a guard may lift over it -
    // the unplugin emitter hangs it outside too. a call the SOURCE wrote around the claim is a
    // polyfill in its own right, whether it still carries its source range or an outer claim has
    // already rebuilt it: lifting past it turns the argument's short-circuit into the whole call's
    return typeof callNode.start !== 'number' && !rebuiltSourceCalls.has(callNode)
      && callNode.arguments.length === 1
      && callNode.arguments[0] === argNode && callNode.callee.type === 'Identifier'
      && getInjector().getBindingInfo(callNode.callee.name)?.source;
  }

  // replace every read of the plugin-minted ref inside a detached clone (allocator names are
  // file-unique, so a bare name match cannot hit user code)
  function traverseNodeReplaceIdent(node, name, replacement) {
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          const c = child[i];
          if (!c || typeof c.type !== 'string') continue;
          if (c.type === 'Identifier' && c.name === name) child[i] = t.cloneNode(replacement);
          else traverseNodeReplaceIdent(c, name, replacement);
        }
      } else if (child && typeof child.type === 'string') {
        if (child.type === 'Identifier' && child.name === name) node[key] = t.cloneNode(replacement);
        else traverseNodeReplaceIdent(child, name, replacement);
      }
    }
  }

  function liftThroughWrapper(basePath, body, prevKind) {
    // user parens / a TS cast on the climbed node TERMINATE the chain: native throws past
    // them where the chain would short-circuit, so the guard must stay INSIDE (the wrapping
    // helper then throws on the short-circuited void 0 exactly like native). both parser
    // configs spell that seal and both have to be read: the default parser's flag sits on the
    // climbed node, while `createParenthesizedExpressions` makes the seal a NODE - sometimes
    // above the climbed one, sometimes the climbed one itself. reading only the flag hoisted
    // the guard out of the helper under real paren nodes
    if (isWrappedInParens(basePath)) return null;
    // a `!` between two links ends nothing: the climb steps over it, as the chain normalizer does, and
    // the rebuilt body wears it where the source did
    const slot = peelParenAndTSSlotPath(basePath, TS_EXPR_WRAPPERS);
    for (let layer = basePath.parentPath; layer !== slot.parentPath; layer = layer.parentPath) {
      body = Object.assign(t.cloneNode(layer.node, false), { expression: body });
    }
    const p = slot.parentPath;
    if (!p) return null;
    if (p.isCallExpression() && isHelperCall(p.node, slot.node)) {
      if (throwingExtractions.has(p.node)) return null;
      return [p, t.callExpression(t.cloneNode(p.node.callee), [body]), 'helper'];
    }
    if (p.isAssignmentExpression() && p.node.operator === '='
      && p.node.right === slot.node && p.node.left.type === 'Identifier') {
      const gp = p.parentPath;
      if (gp?.isCallExpression() && isHelperCall(gp.node, p.node)) {
        if (throwingExtractions.has(gp.node)) return null;
        return [gp, t.callExpression(t.cloneNode(gp.node.callee),
          [t.assignmentExpression('=', t.cloneNode(p.node.left), body)]), 'helper'];
      }
      // memo assign leading a plugin-built SE wrap (`(_ref = <member>, keySE, helper(_ref))`):
      // the whole sequence lifts - its key SE legally moves into the guard's non-null branch
      // (native evaluates the key only when the chain does not short-circuit). a bare-
      // Identifier claim needs no memo at all - inline it over the ref reads and drop the
      // assign (the unplugin emitter folds the same shape memo-free)
      if (gp?.isSequenceExpression() && pluginSeqWraps.has(gp.node)
        && gp.node.expressions[0] === p.node) {
        if (body.type === 'Identifier') {
          const refName = p.node.left.name;
          const inlined = gp.node.expressions.slice(1).map(e => {
            const clone = t.cloneNode(e, true);
            traverseNodeReplaceIdent(clone, refName, body);
            return clone.type === 'Identifier' && clone.name === refName ? t.cloneNode(body) : clone;
          });
          return [gp, inlined.length === 1 ? inlined[0] : t.sequenceExpression(inlined), 'helper'];
        }
        return [gp, t.sequenceExpression([
          t.assignmentExpression('=', t.cloneNode(p.node.left), body),
          ...gp.node.expressions.slice(1).map(e => t.cloneNode(e)),
        ]), 'helper'];
      }
      return null;
    }
    if (prevKind === 'helper' && (p.isMemberExpression() || p.isOptionalMemberExpression())
      && p.node.object === slot.node && !p.node.computed && p.node.property.name === 'call') {
      const cp = p.parentPath;
      if ((cp?.isCallExpression() || cp?.isOptionalCallExpression()) && cp.node.callee === p.node) {
        const callMember = p.isOptionalMemberExpression()
          ? t.optionalMemberExpression(body, t.identifier('call'), false, true)
          : t.memberExpression(body, t.identifier('call'));
        const rebuiltArgs = cp.node.arguments.map(a => t.cloneNode(a));
        return [cp, cp.isOptionalCallExpression()
          ? t.optionalCallExpression(callMember, rebuiltArgs, false)
          : t.callExpression(callMember, rebuiltArgs), 'helper'];
      }
    }
    // the surviving OPTIONAL-chain tail over the claim (`<claim>.userM?.()` / `<helper-wrap>
    // .length`): the guard hoists over the whole tail - buried under a raw member read it
    // would throw on the short-circuited void 0 where native yields undefined. an Optional*
    // node type proves the chain by itself; a PLAIN member counts only past a plugin wrapper
    // or tail step (a sibling transform deoptionalized it) - never directly over the claim,
    // where a user-written consumer of the ternary is indistinguishable. rebuilt plain when
    // the link is non-optional (an Optional* node over a non-chain body fails babel's chain
    // invariant); an optional CALL directly over the claim keeps the visible-deopt spelling
    // (`(guard ? void 0 : _from)?.(x)`), so the call step needs a prior step
    const tailMember = p.node.object === slot.node && !parenTerminated.has(basePath.node)
      && (p.isOptionalMemberExpression() || (p.isMemberExpression() && prevKind !== 'claim'));
    if (tailMember) {
      // the claim body the FIRST step rebuilds over is the substituted binding itself - always
      // defined, so a `?.` the source wrote directly on it guards nothing and lands plain (the
      // vestigial verdict every substitution channel takes). a harvested effect prefix does not
      // revive it: the sequence hands its TAIL on, and that tail is the binding
      const carried = body.type === 'SequenceExpression' ? body.expressions.at(-1) : body;
      const deadOverClaim = prevKind === 'claim' && carried?.type === 'Identifier';
      return [p, p.node.optional && !deadOverClaim
        ? t.optionalMemberExpression(body, t.cloneNode(p.node.property), p.node.computed, true)
        : t.memberExpression(body, t.cloneNode(p.node.property), p.node.computed), 'tail'];
    }
    const tailCall = p.node.callee === slot.node && prevKind === 'tail'
      && (p.isOptionalCallExpression() || p.isCallExpression());
    if (tailCall) {
      const rebuiltArgs = p.node.arguments.map(a => t.cloneNode(a));
      return [p, p.node.optional
        ? t.optionalCallExpression(body, rebuiltArgs, true)
        : t.callExpression(body, rebuiltArgs), 'tail'];
    }
    return null;
  }

  // realm hops a claim climb absorbed onto a REALM-ponyfill claim read the ponyfill itself and
  // fold onto it - a read it cannot answer off-browser (`_self.window.Array` reads a `.window`
  // Node lacks); the canonical key verdict decides, innermost hop first, and the first
  // non-folding step ends it - the unplugin leg's fold-above twin
  function foldRealmHopsOntoClaimBody(claimBody, path) {
    const spine = [];
    for (let cur = claimBody; cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression';
      cur = cur.object) spine.push(cur);
    const foldCtx = { adapter: getAdapter?.(), resolvePure: ({ name }) => resolvePureGlobalEntry(name, path) };
    for (let i = spine.length - 1; i >= 0; i--) {
      if (!foldableRealmHop(spine[i], foldCtx)) return claimBody;
      if (i > 0) spine[i - 1].object = spine[i].object;
      else claimBody = spine[i].object;
    }
    return claimBody;
  }

  // the guard-lowering spelling of a STORED run whose deepest backed span swallows an unbacked
  // probe hop (`(s = globalThis.window.self.Number)?.isInteger(1)`): the shared probed-nav plan
  // renders the realm prefix, the claim keys above it re-hang inside the alternate. null where this
  // caller cannot spell the run - a wrapper in the write slot, a sequence or an SE hop key the plan
  // declines - and the landing below answers as before
  function probeSwallowingGuardValue(probeObject, path, resolveHere, aliasCtx) {
    const store = peelChainAssignment(probeObject);
    const run = store.outer ? unwrapRuntimeExpr(store.value) : null;
    if (!run || store.outer.right !== run) return null;
    const rehang = [];
    let prefix = run;
    for (;;) {
      if (prefix?.type !== 'MemberExpression' && prefix?.type !== 'OptionalMemberExpression') break;
      if (prefix.computed || prefix.property?.type !== 'Identifier') break;
      const key = prefix.property.name;
      if (!POSSIBLE_GLOBAL_OBJECTS.has(key)) {
        rehang.unshift({ name: key, optional: !!prefix.optional });
        prefix = unwrapRuntimeExpr(prefix.object);
        continue;
      }
      // Stop at every realm hop, just as for a computed key. Skipping an unbacked hop here
      // loses a read above the guarded prefix; the ordinary landing keeps that whole tail.
      break;
    }
    // with the backed hop at the run's END the existing landing already reaches the collapse; this
    // arm exists for the keys standing above it, which is where the landing swallowed the probe
    const prefixKey = rehang.length ? staticMemberKeyName(prefix) : null;
    if (!prefixKey || !POSSIBLE_GLOBAL_OBJECTS.has(prefixKey)
      || proxyHopLacksPureEntry(prefixKey, resolveHere)
      || !navHasUnresolvableProxyHop(unwrapRuntimeExpr(prefix.object), resolveHere, aliasCtx)) return null;
    // the acts the run performs BELOW its keys - a sequence prefix, a kept write, an SE-bearing
    // computed key - have no slot in this render, and the plan's own fallback arms spell the value
    // without them: an effect-bearing run keeps the landing it already takes
    if (collectFoldedReceiverSideEffects(prefix, { ctx: aliasCtx }).length) return null;
    const value = probedNavGuardValueNode(prefix, path);
    if (value?.node?.type !== 'ConditionalExpression') return null;
    for (const [index, hop] of rehang.entries()) {
      // the key standing DIRECTLY on the landed binding reads a value that cannot be absent, so its
      // own `?.` is dead text - the shared vestigial verdict, applied where the landing creates it
      value.node.alternate = hop.optional && index > 0
        ? t.optionalMemberExpression(value.node.alternate, t.identifier(hop.name), false, true)
        : t.memberExpression(value.node.alternate, t.identifier(hop.name));
    }
    store.outer.right = value.node;
    return probeObject;
  }

  // this binding's half of the landing canon, for every channel here that keeps a run spelled: the
  // effects a landing discards ride ahead of the binding, in the slot the source ran them in - the
  // canon hands them back, the dialect's own sequence spells them
  function landRunHere(navNode, path) {
    return landRunOnDeepestBackedSpan({
      navNode,
      ctx: { scope: path.scope, adapter: getAdapter?.(), path },
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, path),
      mintPure: (pure, discarded) => {
        const id = injectPureGlobal(pure.entry, pure.hintName);
        return discarded.length ? t.sequenceExpression([...discarded, id]) : id;
      },
    });
  }

  // WHERE the guard test's own spelling lands. the test SPELLS the run, so it lands where every kept
  // spelling lands - on the deepest span pure can back, the hops above it left standing
  // (`globalThis.self.window?.Array` tests `_self.window?.Array`). the ROOT rule answers only where
  // nothing above the root is backed; taken alone it froze a native `.self` read inside the test.
  // `false` comes back where the canon hands the run to the COLLAPSE instead: the caller re-enters
  // the traversal on a clone there, and the ordinary channels spell it as they do under any host
  function landGuardTestRun({ probeObject, path, substituteGlobal, guardObject }) {
    function resolveHere({ name }) {
      return resolvePureGlobalEntry(name, path);
    }
    const aliasCtx = { scope: path.scope, adapter: getAdapter?.(), path };
    // a landing that SWALLOWS an unbacked probe hop discards a read the source performs, and the
    // `?.` above tests a value only that read can make absent - swapped, the test asks an
    // always-defined ponyfill and answers the branch the source short-circuits past. the shared
    // plan spells both at once (the probe lowered to the test, the backed hop folded onto its
    // ponyfill), which is what a run ENDING at the backed hop already takes here and what the other
    // leg emits whatever stands above it. only the claim keys above the realm prefix are this
    // caller's own: they peel off and re-hang INSIDE the alternate, off the ponyfill
    const guarded = probeSwallowingGuardValue(probeObject, path, resolveHere, aliasCtx);
    if (guarded) return guarded;
    const landed = landRunHere(probeObject, path);
    if (landed !== null) return landed;
    const { root } = descendToChainRoot(guardObject, true);
    const buried = root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression'
      ? inlineCallProxyGlobalRoot({ callNode: root, scope: path.scope, adapter: getAdapter?.(), path })
      : root?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(root.name) ? root : null;
    // `noGlobals` - the built-in globals registry would report `globalThis` itself as
    // bound; only a REAL binding (param / var / destructured pattern) shadows
    if (buried && !path.scope.hasBinding(buried.name, true)) {
      const sub = substituteGlobal(buried.name);
      if (sub) buried.name = sub.name;
    }
    return null;
  }

  // re-hangs a claim inside the guard its receiver's `?.` provides. FALSE when no guard of this
  // shape expresses the source - the caller owns what happens then, and its plain arm spells the
  // claim behind a throw probe, so a stand-down here never costs the polyfill
  function emitGuardedClaim({
    path, replacePath, id, sideEffects, receiverEffectCount, guardObject,
    substituteGlobal = null, proxyRootClaim = false,
  }) {
    if (!guardObject) return false;
    // a kept chain-assign VALUE with collapsible pony hops spells through the shared plan
    // (`v = _globalThis.self.window` -> `v = _self.window`) before the test freezes it
    // ... and this test CLONES what it reads, so the render cannot wait for the store's own exit:
    // the clone freezes whatever stands now, and the node a deferred flush keys on dies with the
    // rebuild - the raw spelling then stayed frozen inside the test
    collapseKeptNavValueNode(guardObject, path, { beforeClone: true });
    // the probe is the VALUE that can be absent, not the effects the source spelled ahead of it:
    // peel the guard object's own sequence prefix so the canon classifies those effects as
    // LEADING (ahead of the whole ternary) and the test reads the bare probe - the spelling the
    // unplugin nav walk lands on by construction (`(seq++, W)?.X` -> `(seq++, null == W ? ...)`).
    // only a prefix the harvest already carries may peel: an unaccounted observable element keeps
    // the source spelling, where the test still runs it exactly once
    const harvestedSpans = new Set((sideEffects ?? [])
      .map(se => nodeSpan(se)).filter(Boolean).map(span => `${ span.start }:${ span.end }`));
    function prefixAccounted(node) {
      if (!mayHaveSideEffects(node)) return true;
      const span = nodeSpan(node);
      return !!span && harvestedSpans.has(`${ span.start }:${ span.end }`);
    }
    // ... two carve-outs, both the other leg's kept-root canon: a KEPT WRITE anchors the prefix -
    // the sequence stays whole inside the test beside it (`null == (seq++, q = W) ? ...`) - and a
    // NESTED sequence keeps its whole spelling too, because the value canon stops there
    const seqSource = unwrapRuntimeExpr(guardObject);
    const seqTail = seqSource?.type === 'SequenceExpression'
      ? unwrapRuntimeExpr(seqSource.expressions.at(-1)) : null;
    const anchoredSeq = seqTail?.type === 'AssignmentExpression' || seqTail?.type === 'SequenceExpression';
    const peeledPrefix = [];
    let probeObject = anchoredSeq ? guardObject : unwrapCollectingSePrefixes(guardObject, peeledPrefix);
    if (probeObject !== guardObject && !peeledPrefix.every(prefixAccounted)) probeObject = guardObject;
    const claimSe = migratableClaimSe({
      sideEffects, receiverEffectCount, rootNode: probeObject, end: nodeSpan(path.node)?.end,
    });
    if (!claimSe) return false;
    const { leading: leadingSe, migrated: migratedSe } = claimSe;
    // user parens on a mid-chain node TERMINATE the chain there: a PLAIN read above the seal
    // throws natively where the sealed chain would short-circuit, so a guarded claim spanning it
    // would swallow that throw. only ABOVE the guard object though: the test spells that object,
    // so a seal inside it is re-read there and still throws (`(seq, gw).self` rides the test).
    // the shared predicate answers for both dialects and through the wrapper layers a raw
    // `.object` walk stops at. with no resolver wired the value verdict is unavailable, and
    // standing down is the answer that cannot swallow.
    // FALSE, not silence: the caller's own next arm spells the claim behind a THROW PROBE, which
    // reproduces the read this shape would swallow - returning nothing left it raw, unpolyfilled
    if (!resolvePureGlobalEntry || !getAdapter?.()) return false;
    // the guard tests the OBJECT of the `?.` hop that guards the undefinable value (resolved by the
    // caller via `undefinableOptionalGuard`): `globalThis.window?.self.X` -> `globalThis.window`, a
    // hop the always-defined descended root does not cover. left in the AST so the identifier visitor
    // substitutes its proxy-global root in place (`_globalThis.window`)
    let rootNode = probeObject;
    // a run the canon hands to the COLLAPSE keeps no spelling of its own here: the test re-enters
    // the traversal on it (`reenter`) and the ordinary channels fold its backed hops
    let collapseOwnsRun = false;
    // the kept test still holds the chain's ROOT proxy-global (a bare `globalThis.window`
    // prefix or one BURIED in an inline-provable call arg): the member visitor's subtree-skip
    // means the identifier visitor never reaches it, and the claim freezes the kept text - a
    // raw `globalThis` would ReferenceError on ie:11. no tree walk: the canonical spine
    // descent + inline proof land on the ONE identifier, substituted by name in place. its own
    // `?.` spelling is the shared verdict below, applied once for every root shape
    if (substituteGlobal) {
      const landed = landGuardTestRun({ probeObject, path, substituteGlobal, guardObject });
      if (landed) rootNode = probeObject = landed;
      else collapseOwnsRun = landed === false;
    }
    // the peeled probe rides both slots: a top-level prefix now has a slot of its own (leading),
    // so the test-spelling exception must not re-freeze it - only hop-buried sequences remain
    // inside the probe and keep riding the source spelling
    rootNode = navGuardTestNode(rootNode, path, null, probeObject, { reenter: collapseOwnsRun });
    // the test is a RENDER, and which of the two shapes it takes is the shared seal
    // question: under a seal keep the navigation (its read throws where the source does) and
    // mark it so nothing re-reads it; without one take the plan's BASE, or the test keeps a native
    // `self` read (`_globalThis.self.window`) where its ponyfill is the point
    // a transparent wrapper on the ROOT gets explicit parens in the guard test: babel prints
    // `null == <cast> ? ...` cast-on-boolean (precedence drift) where the unplugin emitter keeps
    // the wrapped root grouped - `null == ((c = gw) as any) ? ...`
    if (SKIPPABLE_WRAPPER_TYPES.has(rootNode.type)) rootNode = t.parenthesizedExpression(rootNode);
    const invokeParent = replacePath.parentPath;
    // user parens around the claim TERMINATE the chain, exactly as they do for the climb in
    // `liftThroughWrapper`: the call applies to the guard's VALUE, so folding its arguments into
    // the alternate would short-circuit the call away where the source throws on the undefined
    const isInvoke = (invokeParent?.isCallExpression() || invokeParent?.isOptionalCallExpression())
      && invokeParent.node.callee === replacePath.node && !invokeParent.node.optional
      && !isWrappedInParens(replacePath);
    let target = isInvoke ? invokeParent : replacePath;
    let claimBody = isInvoke
      ? t.callExpression(t.cloneNode(id), invokeParent.node.arguments.map(a => t.cloneNode(a)))
      : t.cloneNode(id);
    // the rebuild loses the source range, but the call is still the one the SOURCE wrote
    if (isInvoke) rebuiltSourceCalls.add(claimBody);
    if (migratedSe.length) {
      claimBody = t.sequenceExpression([...migratedSe.map(se => t.cloneNode(se)), claimBody]);
    }
    let climbedHelper = false;
    for (let lifted = liftThroughWrapper(target, claimBody, 'claim'); lifted;
      lifted = liftThroughWrapper(target, claimBody, lifted[2])) {
      climbedHelper ||= lifted[2] === 'helper';
      [target, claimBody] = lifted;
    }
    if (proxyRootClaim) claimBody = foldRealmHopsOntoClaimBody(claimBody, path);
    // a guard re-hung above climbed HELPER wrappers memoizes its root: the unplugin emitter's
    // guard builder (which owns those shapes there) always allocates the memo ref, and the
    // pre-claim kept-canon does too - an unmemoized test would split the emitters on every
    // wrapped claim byte-for-byte. unwrapped claims, pure tail climbs and claims landing
    // inside an OUTER guard test keep the memo-free spelling (the unplugin emitter's
    // slot-hoisted prefix carries no memo either - the locked H1 / combined canon)
    let landing = target.parentPath;
    while (landing?.isAssignmentExpression()) landing = landing.parentPath;
    const inOuterGuardTest = !!landing?.isBinaryExpression()
      && landing.node.operator === '=='
      && (landing.node.left?.type === 'NullLiteral' || landing.node.right?.type === 'NullLiteral');
    const test = climbedHelper && !inOuterGuardTest
      ? t.assignmentExpression('=', t.cloneNode(generateRef(path.scope, path.node)), rootNode)
      : rootNode;
    // a `delete` the climbed tail runs on into is an act on a member the source names: absorbed
    // into the alternate the member is evaluated and deleted from nothing, so the whole operator
    // takes the guard, and the leading effects run ahead of it, where the source ran them
    const deleteHost = deleteOverOpenContinuation(target.node, target.parentPath);
    if (deleteHost) {
      target.replaceWith(claimBody);
      deleteHost.replaceWith(withSideEffects(estreeToBabel(renderDeleteShortCircuitGuard(
        nullFirstGuardTest(test, { embed: hostSlot }), hostSlot(deleteHost.node.argument))), leadingSe));
      return true;
    }
    const claimResult = markGuardedClaim(estreeToBabel(renderShortCircuitGuard(
      nullFirstGuardTest(test, { embed: hostSlot }), hostSlot(claimBody))));
    markParenTerminatedIfWrapped(target, claimResult);
    // effects the source wrote AHEAD of the guarded root run before the test, so they wrap the
    // whole claim rather than riding in either of its branches
    target.replaceWith(withSideEffects(claimResult, leadingSe));
    return true;
  }

  // a guard check as the list of its tests: one, or the tests a receiver split at its live link owes
  // ahead of the check's own, in evaluation order
  function guardChecks(check) {
    if (!check) return [];
    return Array.isArray(check) ? check : [check];
  }

  function wrapConditional(check, result) {
    // the SHAPE spelling of the canon (`x == null` for an identifier-like check, `null == (_ref = x)`
    // otherwise); the nav-guard channels take the literal-first form through `nullTest` instead
    return estreeToBabel(renderShortCircuitGuard(
      composeNullGuardTest(guardChecks(check), { embed: hostSlot }), hostSlot(result)));
  }

  // Apply the shared call with Babel source slots and memo provenance. Registration remains
  // immediate, and only the generated shell crosses the closed ESTree conversion boundary.
  function buildMethodCall({
    id,
    object,
    scope,
    args,
    optionalCall,
    anchorNode,
    anchorPath = null,
    sourceReceiver = object,
    lookupGuard = null,
    sideEffects = [],
    receiverEffectCount = 0,
  }) {
    const receiverCtx = anchorPath && {
      scope,
      path: anchorPath,
      adapter: getAdapter?.(),
      injectorState: getInjector(),
    };
    const decision = planMethodCall({
      receiver: prepareMemoReceiver(object, receiverCtx),
      sourceReceiver,
      sideEffects,
      receiverEffectCount,
      args,
      optional: optionalCall,
      ctx: receiverCtx,
    });
    const result = estreeToBabel(renderMethodCall(decision, {
      helper: hostSlot(id),
      lookupGuard,
      mintRef: () => generateRef(scope, anchorNode ?? decision.ctx?.path?.node ?? object).name,
      embed(node, role) {
        if (role === 'capture') return hostSlot(node);
        if (role === 'effect') return hostSlot(mintedEffectNodes.has(node) ? node : t.cloneWithoutRetiring(node));
        const clone = t.cloneNode(node);
        return hostSlot(role === 'receiver' ? t.removeComments(clone) : clone);
      },
      recordCapture(node) {
        const assign = estreeToBabel(node);
        getInjector().recordMemoWrite?.(assign.left.name, assign);
        return hostSlot(assign);
      },
    }));
    if (t.isSequenceExpression(result)) pluginSeqWraps.add(result);
    return result;
  }

  // strip Optional{Member,Call}Expression wrappers above a replaced node
  // stripFirstOptional: also deoptionalize the first user-written ?. in the chain
  // (used when the replacement is always defined, e.g., polyfill imports)
  function normalizeOptionalChain(path, stripFirstOptional) {
    // walk past TS / Paren / Chain wrappers between the replaced node and the optional
    // chain. without these peels, `(arr.includes)?.(1)` / ESTree-wrapped chains wouldn't
    // deopt. symmetric with `peelTransparentChildPath` (extractCheck's child-walk)
    let parentPath = peelParenAndTSParentPath(path, SKIPPABLE_WRAPPER_TYPES);
    if (!parentPath) return null;
    let topPath = null;
    let seenOptional = false;
    // the node the climb came from. `isOptionalOperand` is asked at EVERY hop, not only at entry:
    // an optional ancestor reached through an ARGUMENT or a computed KEY belongs to a different
    // chain, and deoptionalizing it destroys the user's own short-circuit (`cb?.fn(Array?.from(x))`
    // printed `(cb?.fn)(...)`, a TypeError where native answers undefined)
    let cursor = path;
    for (;;) {
      if (!isOptionalNode(parentPath?.node) || !isOptionalOperand(cursor, parentPath)) break;
      if (parentPath.node.optional && (!stripFirstOptional || seenOptional)) break;
      if (parentPath.node.optional) seenOptional = true;
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      cursor = parentPath;
      // ... and the wrappers are walked past at every hop too: a `!` between two links continues
      // the chain (`arr?.at(-1).toString()!.length`), and a climb stopping at it left the rest of
      // the continuation outside the guard. the link TYPES end the chain, so no seal is crossed
      parentPath = peelParenAndTSParentPath(parentPath, SKIPPABLE_WRAPPER_TYPES);
    }
    // trailing optional CALL whose callee is the just-deoptionalized member (`x.includes?.(2)`):
    // enclose it in the wrap WITHOUT deoptionalizing (the `?.()` genuinely guards `.includes`).
    // otherwise wrapping at `.includes` lifts it into the conditional and strands the `?.()`
    // with `this === undefined` (`(c ? void 0 : (...).includes)?.(2)` throws where native works)
    if (topPath && parentPath?.isOptionalCallExpression() && parentPath.node.optional
      && isOptionalOperand(topPath, parentPath)) {
      topPath = parentPath;
    }
    return topPath;
  }

  // optional method call (`recv.m?.()`): the callee is a member, so memoizing it into `_ref` and
  // rebinding the call to `_ref()` would invoke with `this === undefined` and break the receiver
  // binding. instead null-guard the method but keep the receiver: rewrite chainStart's call to
  // `_ref.call(recv)` and return the guard `check`. recv is bound to `this` for `super` (the call
  // arg cannot be `super`), re-read for a safe Identifier/this receiver, and memoized first when
  // side-effecting so it evaluates once. transparent wrappers (TS as/!/satisfies, parens, chain)
  // are peeled so `(obj.m as any)?.()` still counts as a method call - memoizing the peeled member
  // drops the type-only wrapper. returns null when chainStart's callee isn't a method member (a
  // free function `fn?.()` or a receiver-key chainStart), leaving the caller's plain-memo path.
  // a live `?.` in the receiver under a plain method member is the shared verdict's link: the
  // receiver splits there first, and the check is the list of the tests in evaluation order.
  // a method the build serves memoizes its lookup the way the combined dispatch memoizes its
  // inner one - the untested receiver folded into the lookup's argument, a tested one a test of
  // its own ahead of it (`_m = _flat(_r = recv)`, `null == _r || null == (_m = _flat(_r))`)
  function rewriteOptionalMethodCall(chainStart, key, scope, memoType, skipOptional) {
    const calleePath = key === 'callee' ? peelSkippableWrapperPath(chainStart.get(key)) : null;
    if (!calleePath || (!calleePath.isMemberExpression() && !calleePath.isOptionalMemberExpression())) return null;
    // asked of the source receiver, ahead of the split that rewrites it
    const lookupId = optionalMethodLookupId(calleePath);
    const linkCheck = optionalCallReceiverGuard(calleePath.node) === 'link'
      ? extractCheck(calleePath, skipOptional)[0] : null;
    const ctx = { scope, path: calleePath, adapter: getAdapter?.(), injectorState: getInjector() };
    const receiverNode = prepareMemoReceiver(collapsedSplitReceiver(calleePath.node.object, linkCheck, calleePath), ctx);
    const decision = planOptionalMethodCall({ callee: calleePath.node, receiver: receiverNode, ctx });
    const product = renderOptionalMethodCall(decision, {
      callee: calleePath.node,
      args: chainStart.node.arguments,
      helper: lookupId && hostSlot(lookupId),
      checks: guardChecks(linkCheck).map(hostSlot),
      mintRef(role) {
        const ref = generateRef(scope, chainStart.node);
        if (role === 'receiver') tagProxyGlobalMemoRef(ref, receiverNode, scope);
        return ref.name;
      },
      embed(node, role) {
        return hostSlot(role === 'method' ? seededRefClone(node, memoType)
          : role === 'capture' ? node : t.cloneNode(node));
      },
      recordCapture(node) {
        const assign = estreeToBabel(node);
        getInjector?.()?.recordMemoWrite?.(assign.left.name, assign);
        return hostSlot(assign);
      },
      recordLookup(node) {
        return lookupId ? node : hostSlot(t.inherits(estreeToBabel(node), calleePath.node));
      },
    });
    const invocation = estreeToBabel(product.receiver);
    chainStart.node.callee = invocation.callee;
    chainStart.node.arguments = invocation.arguments;
    const checks = product.disjuncts.map(estreeToBabel);
    return checks.length === 1 ? checks[0] : checks;
  }

  // the receiver a guard's split leaves, its realm hops collapsed once a test memoized the root they
  // read off (`check`, as `extractCheck` returns it); an untested receiver keeps its spelling
  function collapsedSplitReceiver(receiver, check, path) {
    return (guardChecks(check).length && collapseReceiverHops?.(receiver, path, { hopsOnly: true })) || receiver;
  }

  // the pure lookup of an optional call's method the build serves, or null: a raw read keeps the
  // member, and so does a `super` method, whose lookup reads the home object's prototype
  function optionalMethodLookupId(calleePath) {
    if (!resolvePurePrototypeEntry || !injectPureGlobal || t.isSuper(calleePath.node.object)) return null;
    const methodKey = memberKeyName(calleePath.node);
    const lookup = methodKey === null ? null : resolvePurePrototypeEntry(null, methodKey, calleePath);
    return lookup?.kind === 'instance' ? injectPureGlobal(lookup.entry, lookup.hintName) : null;
  }

  // a memoized NON-identifier optional root that RESOLVES to a proxy-global (an IIFE / call returning
  // globalThis, `(() => globalThis)()`) loses its provenance once it becomes a synthetic `_ref`: the tail's
  // redundant `.self` hop then survives (`_ref.self.X` reads undefined off-engine) and a static ctor method
  // stays native (`_ref.Array.from`, not collapsed to `_Array$from`). tag the minted ref with its resolved
  // proxy-global root so the natural hop / static-dispatch collapse recognises `_ref` when the replacement is
  // re-traversed. that collapse CONSUMES the receiver (a static is receiver-independent), so `_ref` survives
  // only in the null-guard afterwards, where the bare-read tag has no member access to rewrite. an identifier
  // root already carries provenance (the natural rewrite handles it); `inlineCallReturnExpression` no-ops for
  // a non-call root, so this only fires for the call/IIFE roots the natural collapse could not reach
  function tagProxyGlobalMemoRef(ref, rootNode, scope) {
    const adapter = getAdapter?.();
    if (!adapter || !scope || !ref?.name) return;
    // The memo already evaluated sequence prefixes and stores; its value is their canonical tail.
    rootNode = peelChainRootValue(rootNode);
    let name = rootNode?.type === 'Identifier' && getInjector().isOwnPassPureBinding?.(rootNode.name)
      ? proxyGlobalRootName({ node: rootNode, scope, adapter, path: null }) : null;
    if (rootNode?.type === 'CallExpression' || rootNode?.type === 'OptionalCallExpression') {
      // a bare call / IIFE root: inline its return and recognise the proxy-global it yields
      const rootId = inlineCallProxyGlobalRoot({ callNode: rootNode, scope, adapter, path: null });
      name = rootId && proxyGlobalRootName({ node: rootId, scope, adapter, path: null });
    } else if (rootNode?.type === 'MemberExpression' || rootNode?.type === 'OptionalMemberExpression') {
      // the same provenance loss with the call BURIED under pristine proxy hops (`f()?.window`):
      // the canonical receiver resolution walks the hops and the inline call in one go, and a
      // non-proxy result stays untagged (an identifier root keeps its provenance naturally).
      // an SE-carrying sequence at the chain root tags too - the memo assignment runs the
      // effect exactly once in the guard test, so the tagged ref is safe in the branch
      const resolved = resolveObjectName({ objectNode: rootNode, scope, adapter, path: null });
      name = resolved && POSSIBLE_GLOBAL_OBJECTS.has(resolved) ? resolved : null;
      // ... and a CTOR read off the surface tags the same way: the memo holds the
      // constructor itself, so a claim rebuilt onto the ref resolves its statics
      // (`_ref = (t = _globalThis, _globalThis).Array` serves `_ref?.from` -> `_Array$from`)
      if (!name && resolved && /^[A-Z]/.test(resolved) && !adapter.isMutatedStatic('globalThis', resolved)) {
        getInjector().registerGlobalAlias(ref.name, resolved, { minted: true, trusted: true });
        return;
      }
    }
    if (name) getInjector().registerGlobalAlias(ref.name, name, { minted: true, trusted: true });
  }

  // THE guard-test spelling, shared by every channel that builds a `null == <test>` guard: the
  // vestigial-`?.` verdict of the provider (a `?.` over the proven root is dead - the unplugin
  // drops it too; one over a genuine probe is load-bearing and stays). deopts a CLONE - the
  // source node may still be read by another channel - and keeps node identity when nothing is dead
  // AND nothing inside still owes its own render, so channels relying on the live subtree are
  // untouched; a nav buried in a call root owes one, and the original is already marked handled
  // channels holding a PATH pass it (the resolve context is rebuilt from it); the plan's own
  // render passes the context the plan resolved with
  function navGuardTestNode(node, anchorPath, plan = null, guardObject = null,
    { detached = false, reenter = false } = {}) {
    // the member chain of a test this emit spelled ITSELF: `keptNavHopClaimSuppressed` answers for
    // these, so a claim cannot collapse the render to its leaf ponyfill and erase the read the guard
    // exists to reproduce. identifier substitution inside stays live - that is what re-entry is for
    function markGuardTestRendered(rendered) {
      // peel the transparent wrappers on the way down: with parens as NODES the walk stopped at the
      // first one and left the nav under it unowned, so another channel rendered THAT as a guarded
      // value inside this test - one source, two import sets between the two paren spellings
      for (let hop = unwrapRuntimeExpr(rendered); hop?.type === 'MemberExpression' || hop?.type === 'OptionalMemberExpression';
        hop = unwrapRuntimeExpr(hop.object)) {
        renderedGuardTests.add(hop);
      }
      return rendered;
    }
    const adapter = getAdapter?.();
    if (!node || !adapter || !resolvePureGlobalEntry) return node;
    const resolvePure = plan ? plan.resolvePure : ({ name }) => resolvePureGlobalEntry(name, anchorPath);
    const ctx = plan ? plan.ctx : { scope: anchorPath?.scope, adapter, path: anchorPath };
    if (!ctx?.scope) return node;
    if (guardObject && injectPureGlobal) {
      const test = navGuardSourcePlan(guardObject, resolvePure, ctx);
      if (!test.source) return markGuardTestRendered(estreeToBabel(renderNavGuardTest(test, {
        injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
        cloneHost: source => t.cloneNode(source), embed: hostSlot, own: source => source,
      })));
    }
    // `detached`: the caller's own render lifts this test out of the tree, so no visitor reaches
    // its root again - a raw `globalThis` frozen there is a ReferenceError on exactly the engines
    // the ponyfill serves. an ATTACHED test keeps the live node, whose root substitutes on re-entry
    const clone = detached
      ? cloneWithSubstitutedProxyRoot(node, anchorPath ?? ctx.path, { t, resolvePureGlobalEntry, injectPureGlobal })
      : t.cloneNode(node, true);
    const dead = vestigialNavOptionals(clone, resolvePure, ctx);
    // a nav that still owes its own collapse - one BURIED in a call root, or one the landing canon
    // handed to the collapse (`reenter`) - cannot go back as the live node: the claim's walk already
    // marked that subtree handled, so handing it back freezes the raw spelling while the unplugin
    // emitter renders it. the clone resets identity, so the visitors re-enter and spell it there
    if (!dead.length) {
      const { root } = descendToChainRoot(node, true);
      const buriedCall = (root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression')
        && inlineCallProxyGlobalRoot({ callNode: root, ...ctx });
      return markGuardTestRendered(detached || buriedCall || reenter ? clone : node);
    }
    for (const hop of dead) {
      hop.type = 'MemberExpression';
      delete hop.optional;
    }
    return markGuardTestRendered(clone);
  }

  // the leg's clone-and-embed: the callback every canon render takes to put a HOST node the source
  // wrote inside a tree the canon built. a DEEP clone, so the copy carries a span of its own instead
  // of the original's, then this binding's embed mark on it. spelled once because what embedding
  // means is one rule - three renderers each writing it inline could only ever half-follow a change
  function cloneHost(node) {
    return hostSlot(t.cloneNode(node));
  }

  // the AST spelling of a nav-collapse plan: the leaf and its tail are the canon's, this binding
  // clones its host nodes into them and keeps the traversal bookkeeping the canon knows nothing of
  function renderNavCollapseAst(plan, pureId, { prefixOutside = false } = {}) {
    // a caller wrapping the leaf in a test of its own hangs the root's sequence prefix OUTSIDE that
    // test, where the source runs it, so the leaf leaves it out
    const prefix = plan.kind === 'sequence' && !prefixOutside
      ? navRootPrefixNodes(plan, node => hostSlot(keptPrefix(node))) : [];
    const value = estreeToBabel(renderNavCollapseValue(plan, cloneHost(pureId), { prefix, cloneHost }));
    for (let cur = value, left = plan.hops.length - plan.collapseIdx - 1; left > 0; left--, cur = cur.object) {
      renderedPlanTails.add(cur);
    }
    function keptPrefix(node) {
      return navGuardTestNode(node, null, plan);
    }
    if (plan.kind !== 'nested') return value;
    const testPlan = navGuardTestPlan(plan);
    // The replaced source spine can still be held by a sibling receiver. Apply its decided
    // root binding in that live slot before requeue, while rendering clones the retained read.
    if (testPlan.source?.root) {
      const { path, pure } = testPlan.source.root;
      path.reduce((node, key) => node[key], testPlan.source.source).name = injectPureGlobal(pure.entry, pure.hintName).name;
    }
    if (testPlan.source) for (const path of testPlan.source.served) {
      renderedGuardTests.add(path.reduce((node, key) => node[key], testPlan.source.source));
    }
    const test = renderNavGuardTest(testPlan, {
      injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
      cloneHost: source => t.cloneNode(source), embed: hostSlot, own: source => source,
    });
    return estreeToBabel(renderShortCircuitGuard(nullFirstGuardTest(test), hostSlot(value)));
  }

  // node-level twin of `collapseProvenNavPath` for channels that hold a NODE, not a path (the
  // static claim's guard test): a kept chain-assign VALUE collapses in place by mutating the
  // assignment's right slot - the node is live in the tree, so the spelling lands in the test
  // KEPT chain-assign values only: bare / call-rooted shapes collapse through the claim +
  // guard channels (with the stronger static-in-branch substitution). the plan resolves NOW
  // (live scopes), but the right-slot mutation DEFERS to program exit: an early rewrite hid
  // the member chain from every claim resolver still due to visit it (`(n = X)?.Array.of(...)`
  // lost its static claim), while the assignment node itself stays live through any memoize,
  // so the deferred mutation lands in whatever emit captured it
  // the assignment carrying the collapsible value may sit BURIED under member hops of the
  // node a channel holds (`(q = globalThis.self.window).Number` - the claim's object tops at
  // `.Number`, not at the `=`), so the funnel digs with the same walk the SE prelude uses and
  // collapses every assignment it surfaces; a node that IS the assignment walks to itself
  function collapseKeptNavValueNode(rootNode, anchorPath, opts) {
    let rendered = false;
    for (const chainAssign of collectChainAssignsThroughMemberChain(rootNode)) {
      rendered = collapseKeptChainAssign(chainAssign, anchorPath, opts) || rendered;
    }
    return rendered;
  }

  // the stored value's own SEQUENCE hands its TAIL on: where the PLAN peeled that tail, the render
  // lands in the same slot (`landInSequenceTail`) so the prefix keeps running where the source wrote it -
  // replacing the whole value dropped its effects. only where the plan says it peeled: a plan that read
  // the whole value re-emits the effects itself, and its render owns the whole slot. every plan channel
  // that writes a stored value goes through here - in place, at the host's exit, and at the program-exit
  // backstop
  function landStoredValue(plan, step, rendered) {
    if (plan.storedValueSeqDescended) landInSequenceTail(step, 'right', rendered);
    else step.right = rendered;
  }

  // is the `?.` over this store DEAD? the store hands its value on, so a stored NAVIGATION the value
  // canon calls always-defined leaves the link as text (`(v = (eff(), globalThis.window.self))?.Array`
  // - the unplugin emitter folds it whole). only over a navigation, or the ponyfill one collapsed to:
  // a store of a bare USER binding (`(n = gw)?.Map`) keeps the guard both emitters spell for it,
  // because the fold verdict speaks for what a nav navigates, not for what a binding happens to hold.
  // never where that navigation passes a MUTATED slot - there the store holds the user's own object,
  // which the value canon cannot speak for, and the mutated canon owns the read
  function deoptDeadOptionalOverStore(chainStart, key, path) {
    const adapter = getAdapter?.();
    if (!adapter || !resolvePureGlobalEntry) return false;
    const stored = peelChainAssignment(chainStart.node[key]);
    if (!stored.outer) return false;
    const nav = unwrapRuntimeExpr(peelChainRootValue(stored.value));
    const isNav = nav?.type === 'MemberExpression' || nav?.type === 'OptionalMemberExpression'
      || (nav?.type === 'Identifier' && !!getInjector?.()?.isOwnPassPureBinding?.(nav.name));
    // the MUTATION question through the canon: a hop the file patched is not pristine, so the
    // maximal proxy prefix stops short of the nav - there the store holds the user's own object and
    // the value canon cannot speak for it (a patched `self` may be nullish)
    const navCtx = { scope: path.scope, adapter, path };
    if (!isNav || maximalProxyGlobalPrefix(nav, navCtx, { throughChainAssign: true }) !== nav
      || proxyReceiverValueCanBeUndefined(stored.value,
        ({ name }) => resolvePureGlobalEntry(name, path), { scope: path.scope, adapter, path })) return false;
    deoptionalizeNode(chainStart);
    return true;
  }

  // the composed guard the kept-nav plan spells for this link, or null: the plan renders this value
  // as a GUARD whose alternate is the ponyfill it collapsed to (`null == ga.window ? void 0 : _self`),
  // and memoizing that spells a SECOND test over the first - the probe decides the branch and the
  // claim reads the always-defined leaf. the link and every optional above it deoptionalize with it
  function composeNavGuardCheck(chainStart, key, path, memoType) {
    const value = chainStart.node[key];
    // the slot may already hold OUR root guard (`null == A ? void 0 : _self`, the hop claim's render
    // over an undefinable root): memoizing it spells a second test over the first, so compose with
    // it the same way - the guarded operand is the test, the defined branch is what the claim reads
    const definedBranch = isRenderedStoredValue(value) ? definedBranchOfGuardConditional(value) : null;
    if (definedBranch && value.test?.type === 'BinaryExpression' && isNullLiteralNode(value.test.left)) {
      const probe = value.test.right;
      chainStart.node[key] = seededRefClone(t.cloneNode(definedBranch), memoType);
      deoptionalizeNode(chainStart);
      for (let up = chainStart.parentPath; up && up !== path; up = up.parentPath) {
        if (isOptionalNode(up.node)) deoptionalizeNode(up);
      }
      return t.cloneNode(probe);
    }
    const composed = resolvePureGlobalEntry && composableNavGuardPlan(value, {
      scope: path.scope, adapter: getAdapter?.(), path,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, path),
      readThrough: key === 'object',
      readerKey: key === 'object' ? staticMemberKeyName(chainStart.node) : null,
    });
    if (!composed) return null;
    chainStart.node[key] = seededRefClone(injectPureGlobal(composed.pure.entry, composed.pure.hintName), memoType);
    deoptionalizeNode(chainStart);
    for (let up = chainStart.parentPath; up && up !== path; up = up.parentPath) {
      if (isOptionalNode(up.node)) deoptionalizeNode(up);
    }
    return t.cloneNode(composed.probe);
  }

  // one dug assignment's collapse: plan, then render - immediately in place, or deferred to
  // the assignment's own exit flush. true only when a render actually landed
  function collapseKeptChainAssign(rootNode, anchorPath, { immediate = false, observed = false, beforeClone = false } = {}) {
    const adapter = getAdapter?.();
    // the whole resolver-option family or nothing: this one omitted `injectPureGlobal` while
    // calling it at the tail, so a harness wired with only some of them would TypeError there
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return;
    // the hops BELOW a sequence tail are the stored nav's own, and this channel owns them: without
    // the descent the plan declined the shape whole (`q = (c++, globalThis.self).window`) and every
    // render reading the store - a guard test, an instance receiver, the destructure lift - froze
    // the raw spelling it was handed, a native `self` read off the ponyfill root
    const plan = planProvenNavGuardCollapse({
      rootNode, scope: anchorPath.scope, adapter, path: anchorPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, anchorPath),
      allowSequenceRoot: true, storedValueSequenceTail: true, descendSequenceTail: true,
    });
    if (!plan?.topAssign) return;
    // a stored nav that cannot SHORT-CIRCUIT is the proxy global it navigates, so the value slot takes
    // the plan's VALUE, not its guarded render: spelled as a guard the store read `window` off the
    // ponyfill and handed the user's variable `void 0` off-window, where the same nav read bare answers
    // the ponyfill leaf. effect-free, identifier-rooted plans only - a sequence prefix and an
    // effectful root all re-emit INSIDE the guarded render, and the claims living in them go with it
    // the WRITE observes the raw read by construction - this channel exists for it - so the value
    // question is asked with that flag: the proxy spine below the probe hop is one surface here,
    // where a plain read of the same nav folds it whole
    // the verdict is the PLAN's - see `storedValueFormSpells`. this channel only renders it
    const { leafPure: pure, storedValueSpells } = plan;
    // a channel that OWNS the assignment's emission (the unguarded static claim re-emits it as a
    // side effect, possibly on a REBUILT receiver whose nodes the deferred flush can never match
    // by identity) collapses in place: the caller replaceWith-inserts the host right after, so
    // the render re-enters traversal and the ES5 lowerings still visit it.
    // the render replaces the INNERMOST `=` step's value slot - the plan peels the whole `=`
    // chain to the nav, so writing the OUTER right would obliterate every mid-chain write
    // (`q = w = nav` must keep `w =`)
    // Sequence and call roots carry live source claims. A raw slot replacement on a live
    // host would detach queued paths into those subtrees, so their render waits for exit.
    // A detached clone has no later flush site and can render immediately.
    const carriesSourceSubtree = plan.seqRoot || plan.call;
    // the EARLY half of the store's guard verdict, carried to whichever moment renders: the
    // value form is what a stored plain nav owes unless the plan itself has effects only the
    // guarded render can spell, or the CALLER's own render observes the store's absence (its
    // null test is the store's only reader - a flag, because that test is not in the tree yet).
    // the host-exit flush adds the LATE half (`storeNullTestObservedAbove`) for observers
    // rendered between the queue point and the flush
    const storeTakesGuard = !storedValueSpells || observed;
    // a caller rendering a CLONE of this value takes it now, but only where no unresolvable prefix
    // survives: there the value form and the guarded render agree, so the LATE observer half has no
    // test to change - with one alive it does, and rendering early dropped the store's own guard
    const landsNow = immediate || (beforeClone && plan.kind !== 'nested');
    let hostIsLive = false;
    if (carriesSourceSubtree) {
      const host = plan.topAssignSteps.at(-1);
      for (let up = anchorPath; up && !hostIsLive; up = up.parentPath) hostIsLive = up.node === host;
    }
    // a store standing in a SEQUENCE PREFIX inside a DEFERRED body has a host exit of its own, and the
    // flush there is what owns the value / guard choice in every other position. rendering it eagerly
    // instead made this one position answer differently from its straight-line twin: the doctrine puts
    // a sequence prefix inside the guarded render, and only the flush asks that question
    let deferToFlush = false;
    for (let up = anchorPath; up?.node; up = up.parentPath) {
      if (up.node !== plan.topAssign) continue;
      const host = up.parentPath?.node;
      deferToFlush = host?.type === 'SequenceExpression' && host.expressions.indexOf(up.node) > 0
        && hasDeferredContextAncestor(up) && ctorClaimOwnsStore(up.parentPath, anchorPath);
      break;
    }
    if (landsNow && !deferToFlush && !(carriesSourceSubtree && hostIsLive)) {
      landStoredValue(plan, plan.topAssignSteps.at(-1), storeTakesGuard
        ? renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName))
        : navPlanValueAst(t, plan, injectPureGlobal(pure.entry, pure.hintName), renderedPlanTails));
      return true;
    }
    // snapshot a render source NOW (pre-lowering) by deep-cloning it: the flush lands at program
    // exit, AFTER the optional-chain lowering pass visited the tree, so a LIVE node reference may
    // by then have been moved into the lowering's own memo and the render would strand a dangling
    // `_refN`. the snapshot does NOT drop optionals - only the VESTIGIAL ones die, at render time,
    // in the kept-prefix / guard-test spelling; a load-bearing `?.` survives into the emitted node
    // and relies on the flush re-queueing it (`replaceWith`) so the ES5 lowering still sees it.
    // call ARGUMENTS stay untouched - user optionals inside them lower normally in place. null
    // when the spine holds a `?.()` (it may be conditionally proven - a REAL short-circuit the
    // plan may not flush-render; the raw memo fallback stays faithful)
    function snapshotNavRenderNode(node) {
      if (!node) return node;
      for (let spine = node; spine;) {
        switch (spine.type) {
          case 'OptionalMemberExpression':
          case 'MemberExpression':
            spine = spine.object;
            break;
          case 'OptionalCallExpression':
            return null;
          case 'CallExpression':
            spine = spine.callee;
            break;
          default:
            spine = null;
        }
      }
      return t.cloneNode(node, true);
    }
    // ONE queue entry per assignment: the funnel consults this channel from more than one hop of
    // the same store, and a second entry would land a second render over the first (the host-exit
    // flush takes one; a leftover reaches the program-exit backstop and overwrites)
    if (pendingKeptNavCollapses.some(entry => entry.plan.topAssign === plan.topAssign)) return true;
    // a SEQ-rooted or CALL-rooted plan keeps LIVE references instead of the snapshot:
    // its prefix expressions and call arguments carry pending claims (`arr.at(0)` polyfills after
    // this queue point but before the assignment's exit - children complete first), and a
    // clone taken now would freeze them raw. the program-exit backstop skips these plans (see
    // `flushKeptNavCollapses`) - by then the lowering may have moved what they reference
    if (!plan.seqRoot && !plan.call) {
      if (plan.kind === 'nested') {
        const hop = plan.hops[plan.lastUnresolvableIdx];
        const testNode = snapshotNavRenderNode(hop.node);
        if (!testNode) return;
        // the computed-key CONTAINER stays the live one through the snapshot: the live accessor
        // and the flush-time test clone must both read the key's post-claim spelling
        if (hop.node.computed) testNode.property = hop.node.property;
        plan.hops[plan.lastUnresolvableIdx] = { ...hop, node: testNode };
      } else if (plan.kind === 'sequence') {
        const rootValue = snapshotNavRenderNode(plan.rootValueNode);
        if (!rootValue) return;
        plan.rootValueNode = rootValue;
      }
      // the key-SE exprs stay LIVE references on purpose - the same deferral the hop
      // snapshot above makes: children complete first, so a claim inside a kept key
      // (`log.push('k')`) lands before the exit flush clones the spelling; an eager deep
      // clone here froze the pre-claim spelling into the emitted test
    }
    pendingKeptNavCollapses.push({ plan, storeTakesGuard, pureId: injectPureGlobal(pure.entry, pure.hintName) });
  }

  // does a CTOR / STATIC claim own the value this sequence hands on? by the time the eager hook runs the
  // outer guard is already built, so the claim no longer stands above the store - it sits in the
  // conditional's ALTERNATE, spelled through an injected import. a proxy-global ponyfill there is the
  // store's own value, not a claim; an INSTANCE dispatch spells a call to its helper and owns its
  // receiver itself; a claimless tail names no import at all. only a ctor / static host defers
  function ctorClaimOwnsStore(seqPath, anchorPath) {
    // the claim stands in one of two places depending on whether the guard is already built: still
    // ABOVE the store as a source member chain, or inside the conditional's ALTERNATE. read both -
    // which one holds it is pass order, and pass order is exactly what this verdict must not depend on
    let alternate = null;
    for (let up = seqPath?.parentPath, child = seqPath; up?.node; child = up, up = up.parentPath) {
      const { node } = up;
      if (SKIPPABLE_WRAPPER_TYPES.has(node.type) || node.type === 'BinaryExpression') continue;
      if (node.type === 'ConditionalExpression' && node.test === child.node) {
        alternate = node.alternate;
        break;
      }
      if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
        && node.object === child.node) {
        alternate = node;
        continue;
      }
      break;
    }
    let owns = false;
    (function walk(node) {
      if (!node || typeof node !== 'object' || owns) return;
      // the STORE's own subtree is not the claim: its hops are the navigation this verdict is about
      if (node === seqPath?.node) return;
      if (Array.isArray(node)) {
        for (const item of node) walk(item);
        return;
      }
      // a CALL is the instance channel's own spelling - its receiver is not this store's business
      if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') return;
      if (node.type === 'Identifier' && ctorPureImportName(node.name)) owns = true;
      // ... and the SOURCE spelling of the same claim, before any substitution: a dotted key that
      // resolves to a pure global names the ctor / static host the guard channel will own
      if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && !node.computed
        && node.property?.type === 'Identifier' && !POSSIBLE_GLOBAL_OBJECTS.has(node.property.name)
        && resolvePureGlobalEntry?.(node.property.name, anchorPath)) owns = true;
      for (const [key, value] of Object.entries(node)) {
        if (key !== 'type' && key !== 'loc') walk(value);
      }
    })(alternate);
    return owns;
  }

  // an injected pure import that stands for a CTOR or a STATIC, never for the proxy global itself
  function ctorPureImportName(name) {
    const info = getInjector?.()?.getBindingInfo?.(name);
    return !!info?.entry && !POSSIBLE_GLOBAL_OBJECTS.has(info.hint);
  }

  // a QUEUED kept-nav plan owns its assignment's whole emission: any other channel firing
  // inside that span (the suppressed-hop fold, the short-circuit render, a hop's own claim)
  // would detach the nodes the deferred flush renders from, freezing pre-claim spellings into
  // the output ('plan'). only a pristine PROXY-named hop stands down (prefix effects like
  // `arr.at(0)` keep their claims - the render re-emits them). beyond plan ownership, the
  // shared stored-value canon refuses a CLAIMLESS hop collapse over an undefinable receiver
  // ('stored') - the caller renders the kept-nav canon there instead of the plain collapse
  function keptNavHopClaimSuppressed(path) {
    // a guard TEST this emit spelled itself: re-entered by the member visitor it reads as a fresh
    // claim and collapses against a receiver no plan chose - erasing the environment-probe read a
    // seal makes observable. the render owns those nodes exactly like a queued kept-nav plan owns
    // the assignment it will spell
    if (renderedGuardTests.has(path.node)) return 'guard-test';
    if (pendingKeptNavCollapses.length && memberProxyHopName(path.node)) {
      for (let p = path; p; p = p.parentPath) {
        const { node } = p;
        if (node?.type === 'AssignmentExpression'
          && pendingKeptNavCollapses.some(({ plan }) => plan.topAssign === node)) return 'plan';
      }
    }
    const adapter = getAdapter?.();
    if (!adapter || !resolvePureGlobalEntry) return false;
    // the shared canon returns the owning ASSIGNMENT for the stored case - the caller renders
    // the kept value in place through it
    return storedNavHopClaimSuppressed(path, {
      scope: path.scope, adapter, resolvePure: ({ name }) => resolvePureGlobalEntry(name, path),
    });
  }

  // the guards a rendered navigation stacks, taken over by the `delete` its chain runs on into: each
  // short-circuit answers `true`, the defined branch deletes through the value. false when nothing
  // guarded is rendered there, or no `delete` takes the chain. the root's sequence `prefix` runs
  // first, ahead of the whole act (`(c++, null == w ? true : delete _self.k)`)
  function deleteThroughRenderedGuards(renderedPath, prefix) {
    const tests = [];
    let value = renderedPath.node;
    for (let branch = definedBranchOfGuardConditional(value); branch && branch === value.alternate;
      branch = definedBranchOfGuardConditional(value)) {
      tests.push(value.test);
      value = branch;
    }
    const deleteHost = tests.length ? deleteOverOpenContinuation(renderedPath.node, renderedPath.parentPath) : null;
    if (!deleteHost) return false;
    renderedPath.replaceWith(value);
    let guarded = renderDeleteShortCircuitGuard(hostSlot(tests.pop()), hostSlot(deleteHost.node.argument));
    while (tests.length) guarded = conditionalExpression(hostSlot(tests.pop()), literal(true), guarded);
    deleteHost.replaceWith(withSideEffects(estreeToBabel(guarded), prefix));
    return true;
  }

  // a nav standing in an effect-bearing SEQUENCE is that same navigation with its prefix beside
  // it: the plan reads the TAIL and the render lands in the tail's own slot, so the prefix keeps
  // running where the source wrote it. the peels next door bail on such a prefix because their
  // callers DROP the span; the renders through here replace only what they planned
  function navSlotPath(hostPath) {
    const objPath = peelSkippableWrapperPath(hostPath.get('object'));
    return objPath.isSequenceExpression()
      ? objPath.get(`expressions.${ objPath.node.expressions.length - 1 }`) : hostPath.get('object');
  }

  // the WRITE host reads its receiver like every other consumer, but the claim channel stands down
  // for it (the member IS the assignment slot, never a swap) - and with no claim leading a channel,
  // the probe nav under it rode raw off the substituted root: a native `self` read on hosts that
  // have none, where the same source under a READ consumer renders the guard on both emitters.
  // the write target itself is untouched; only the receiver's nav slot takes the guarded value
  function renderWriteHostProbeGuard(anyMemberPath) {
    // normalise to the run's TOP (the member the write addresses), then to its DEEPEST member -
    // the one standing directly on the nav - so the caller may hand any member of the run
    // the chain END through the shared walk - a member above the one handed in consumes whatever
    // this render produces, and the guard channel declines outright when it is not addressed there
    const top = memberChainEndPath({ path: anyMemberPath, unwrap: unwrapRuntimeExpr });
    if (!isMemberWriteHost(top)) return false;
    // a `delete` reads nothing over its navigation - the erase verdict owns that shape - and a nav
    // with no live `?.` has no short-circuit to reproduce: both fold, and rendering a probe test for
    // them would spell a branch the source never takes
    if (deleteHostAboveChain(top, top.node, unwrapRuntimeExpr)) return false;
    let deepest = top;
    for (;;) {
      const objPath = peelSkippableWrapperPath(deepest.get('object'));
      if (!objPath?.isMemberExpression?.() && !objPath?.isOptionalMemberExpression?.()) break;
      deepest = objPath;
    }
    const slot = navSlotPath(deepest);
    if (!slot?.node) return false;
    let live = false;
    for (let cur = unwrapRuntimeExpr(slot.node); isMemberAccessNode(cur); cur = unwrapRuntimeExpr(cur.object)) {
      live ||= !!cur.optional;
    }
    if (!live) return false;
    const rendered = probedNavGuardValueNode(slot.node, top);
    if (!rendered?.node || rendered.rootEffectCall) return false;
    slot.replaceWith(rendered.node);
    return true;
  }

  // eslint-disable-next-line max-statements -- the plan, its declines and the render of one nav are one sequence
  function collapseShortCircuitNavInPlace(memberPath) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return false;
    // the consumer is read through the seal's NODE spelling: a sealed nav's member sits directly
    // above it on the flag dialect and above a paren node on the other, and the raw parent read
    // let the second spelling pass this gate - the claimless channel then rendered a nav whose
    // chain end (and the whole-fold channel behind it) the decline exists to hand over to
    const endSlot = peelParenAndTSSlotPath(memberPath);
    const parent = endSlot.parentPath;
    // a MEMBER consumer means this is not the chain end (the caller climbs there); a CALL
    // consumer is fine - claims over the chain ran before the drive (they sit above the root
    // in traversal order), so a surviving call tail is claimless and rides the chain's own
    // short-circuit outside the render
    if ((parent?.isMemberExpression() || parent?.isOptionalMemberExpression())
      && parent.node.object === endSlot.node) return false;
    // this render spells a SHORT-CIRCUIT: a nav whose value cannot take one has no branch for it to
    // build, and the plain hop collapse owns the run instead (a chain-END member that is itself a
    // pristine proxy hop is the same question - it belongs to the alias / kept canons unless the
    // nav's own value short-circuits). asked of the whole nav through the value canon, so a DEEPER
    // unbacked hop folds like its plain twin instead of earning a probe guard over a read that
    // cannot be absent
    // a KEPT WRITE inside the nav OBSERVES its raw read, so the spine below the probe hop counts
    // as one surface there - the store canon, asked with the flag the value canon reads
    const navObserved = !!peelChainAssignment(unwrapRuntimeExpr(memberPath.node.object)).outer;
    // ... and a `?.` a MUTATING consumer keeps IS that short-circuit, whatever the value canon
    // answers for the probe below it: what a fold drops there is the branch deciding whether the
    // act lands, not a value (the shared exception)
    if (!mutationGuardKeepingHop(memberPath.node, ({ name }) => resolvePureGlobalEntry(name, memberPath),
      { scope: memberPath.scope, adapter, path: memberPath })
      && !navValueCanShortCircuit(memberPath.node, ({ name }) => resolvePureGlobalEntry(name, memberPath),
        { scope: memberPath.scope, adapter, path: memberPath },
        { throughChainAssign: true, observableRead: navObserved })) return false;
    if (claimBelowEndOwnsChain(memberPath,
      { adapter, resolvePureGlobalEntry, resolvePureStaticEntry, resolvePurePrototypeEntry })) return false;
    // TS wrappers on the object erase in the render (`nav!.X`, `(nav as any).X`); the seal
    // distinction lives in the MEMBER's own node type - a paren boundary parses the member
    // above it PLAIN, and the plain/optional render split keeps the source semantics
    // both spellings of a seal peel here: the default parser hangs the flag on the wrapped node,
    // `createParenthesizedExpressions` makes it a NODE, and stopping at that node routed the same
    // source through a different channel - the paren spelling never reached the guard render and
    // its erase dropped the guard the flag spelling keeps
    function planFor(rawObject) {
      const navNode = peelTransparentExpr(rawObject);
      if (navNode?.type !== 'MemberExpression' && navNode?.type !== 'OptionalMemberExpression') return null;
      // an undefinable ROOT (an alias holding a probe, a bare probe name) is this render's own
      // test - asked for, and spelled ahead of the collapsed leaf below
      // this render re-emits the peeled prefix itself (the test spells the run), so it owns a
      // sequence root and descends past its tail - the opt-in every other guard channel here uses.
      // without it the family the claim routes stand down FOR could not render its own shape, and
      // the run rode raw off a substituted root (`(c++, globalThis).window?.self.X`)
      const plan = planProvenNavGuardCollapse({
        rootNode: navNode, scope: memberPath.scope, adapter, path: memberPath,
        resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath), allowUndefinableRoot: true,
        allowSequenceRoot: true, descendSequenceTail: true,
      });
      return plan && !plan.topAssign && (plan.kind === 'nested' || plan.rootUndefinable) ? plan : null;
    }

    // hops the plan does NOT cover (a non-proxy name - `...?.self?.chrome`) read off the value
    // the render produces. while that value is provably defined they belong INSIDE the guarded
    // alternate (`null == test ? void 0 : _self.chrome`, the unplugin emitter's shape): hung off
    // the ternary instead, each one needs a `?.` the ES5 lowering then has to memoize. the
    // FIRST hop reads the always-defined ponyfill leaf, so it pulls in whatever its own
    // spelling; past it the value can be absent, so only PLAIN hops keep pulling and the first
    // live `?.` stays outside, where the ternary's own short-circuit already covers it.
    // gated on a nested plan with no tail of its own (a planned tail can be absent - the hop
    // above it genuinely guards) and on chain membership (a SEALED member keeps its throw)
    function pullUnplannedTail(pullFrom, plan, rendered, prefix) {
      if (plan.kind !== 'nested' && !plan.rootUndefinable) return false;
      // collect the chain steps leaf-outwards, then let the shared rule say how many ride inside
      const paths = [];
      for (let hop = pullFrom; hop?.node;) {
        // a hop the guard channel already lifted into a ternary alternate answers from its OLD
        // slot: the node moved without a path replace, so the cached path has no container left.
        // the chain ends there - the lifted spelling owns everything above it
        if (!hop.container) break;
        const isCall = hop.isOptionalCallExpression() || hop.isCallExpression();
        if (!isCall && !hop.isOptionalMemberExpression()) break;
        if (isCall && unwrapRuntimeExpr(hop.node.callee) !== paths.at(-1)?.node) break;
        // PARENS between the callee and its call keep the chain's REFERENCE (`(w?.self.fn)()`
        // still binds `this`), while ending the short-circuit: folding either the call or the
        // member it reads leaves the callee with a bare value. hand the whole tail back to the
        // lifted spelling, which preserves both
        if (isCall && isWrappedInParens(hop.get('callee'))) return false;
        paths.push(hop);
        // the climb reads each consumer through the seal's NODE spelling - the flag dialect hangs
        // no node between a step and its consumer, and stopping on one routed the same source
        // around the declines above, folding a sealed tag's member into the alternate
        const slot = peelParenAndTSSlotPath(hop);
        const up = slot.parentPath;
        hop = up?.node && (up.node.object === slot.node || up.node.callee === slot.node) ? up : null;
      }
      // no `foreign` step here: this emitter re-queues what it pulls, so a claim inside the
      // tail still gets its own rewrite
      const steps = paths.map(path => ({
        optional: !!path.node.optional,
        isCall: path.isOptionalCallExpression() || path.isCallExpression(),
        // no key gate here: a computed key - opaque or effect-bearing - evaluates INSIDE the
        // alternate exactly where the source evaluates it, and the shared `allPlain` rule
        // already keeps an optional step over an absent-able value outside the fold
      }));
      const definedAtLeaf = plan.hops.length === plan.collapseIdx + 1;
      let taken = guardTailPullCount(steps, definedAtLeaf);
      // `delete` needs the MEMBER itself, not its value: pulled into the alternate the ternary
      // evaluates and deletes nothing, and a tail left outside reads off the guard's `void 0`.
      // hand the WHOLE chain back, for the operator to take the guard whole (`delete` on a
      // short-circuited chain is a no-op `true`).
      // (`new` reads only the VALUE, so it pulls freely)
      // asked through the SHARED climb: a local one stopped at the value CARRIER the source may
      // wrap the chain in, so the same navigation folded its tail under a sequence and kept it
      // outside without one - two spellings of one source, one of them deleting off the alternate
      const tailEnd = paths.at(-1);
      if (tailEnd && deleteHostAboveChain(tailEnd, tailEnd.node, unwrapRuntimeExpr)) taken = 0;
      // a TAGGED template reads its tag as a REFERENCE (`(w?.self.tag)`x`` binds `this`), so a
      // folded tail hands it a bare value - the receiver is lost exactly as under a
      // parenthesized callee. leave the whole tail outside and PLAIN: the source parens ended
      // the chain, so the read off `void 0` throws exactly where the source does
      if (paths.some(path => peelParenAndTSSlotPath(path).parentPath?.isTaggedTemplateExpression())) {
        taggedTemplateTails.add(paths[0].node);
        return false;
      }
      if (!taken) return false;
      // whatever stays outside reads off the guard value - lift it so the short-circuit holds
      const outside = paths[taken];
      if (outside?.isOptionalMemberExpression() && !outside.node.optional) outside.node.optional = true;
      let value = rendered.alternate;
      // once a step carries a live `?.` every step above it stays IN the chain: a plain member
      // there ends the chain (the printer parenthesizes it), so the source's short-circuit
      // would turn into a read off `undefined`
      let inChain = false;
      // the alternate starts AS the ponyfill leaf when the plan re-hung nothing over it, and a realm
      // hop read off a ponyfill folds - the canon's verdict, asked here for the tail the plan does
      // not own (`globalThis.window?.self.window` reads `_self`). the first step that does not fold
      // ends it: what stands above then reads a value the doctrine says nothing about
      let overPure = definedAtLeaf;
      for (const [index, path] of paths.slice(0, taken).entries()) {
        if (overPure && !steps[index].isCall && foldableRealmHop(path.node, { adapter, resolvePure: plan.resolvePure })) {
          continue;
        }
        overPure = false;
        // the FIRST step reads the always-defined leaf, so its `?.` is the vestigial one the
        // shared verdict drops; every later optional guards a value that can be absent
        const optional = !!path.node.optional && !(index === 0 && definedAtLeaf);
        if (steps[index].isCall) {
          // an OPTIONAL call keeps its `?.(` inside the alternate: hung off the ternary the
          // callee reads as a bare value and `this` binds to undefined where the source binds
          // the member it was read from
          const args = path.node.arguments.map(argument => t.cloneNode(argument));
          value = optional || inChain ? t.optionalCallExpression(value, args, optional) : t.callExpression(value, args);
        } else {
          const property = path.node.computed ? t.cloneNode(path.node.property) : t.identifier(path.node.property.name);
          value = optional || inChain
            ? t.optionalMemberExpression(value, property, path.node.computed, optional)
            : t.memberExpression(value, property, path.node.computed);
        }
        inChain ||= optional;
      }
      rendered.alternate = value;
      paths[taken - 1].replaceWith(withSideEffects(rendered, prefix));
      return true;
    }

    // the chain end may sit several NON-proxy hops above the collapsible nav prefix
    // (`window?.self.Array.prototype.customX`): descend member-by-member until the object
    // is the pure proxy-nav - the render lands there, and the plain hops above ride the
    // chain's own short-circuit
    let target = memberPath;
    let plan = planFor(navSlotPath(target).node);
    while (!plan) {
      const objPath = peelSkippableWrapperPath(target.get('object'));
      if (!objPath?.isMemberExpression() && !objPath?.isOptionalMemberExpression()) return false;
      target = objPath;
      // the descent reached the environment PROBE itself (`globalThis.self.window?.X` - the nav ENDS at
      // the hop pure cannot back, so there is no ponyfilled LEAF for a plan to collapse onto). the hops
      // BELOW it still collapse: substitute their ponyfill and leave the probe read - and its `?.` -
      // exactly as written, which is what the unplugin leg emits. without it the emit keeps
      // `_globalThis.self.window`, a NATIVE `self` read off the ponyfill that throws in Node where the
      // same source, spelled by the other leg, short-circuits. effect-free plans with nothing above
      // their collapse only: everything else is the guarded render's business
      if (memberProxyHopName(target.node)) {
        if (collapseHopsBelowProbe({ probePath: target, anchorPath: memberPath, adapter, injectPure: injectPureGlobal,
          resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath) })) return true;
        // ... and where the probe's own object is a navigation this render owns - a SEQUENCE
        // standing around it puts its prefix beside the nav, not in the way - the guard lands in
        // the nav's own slot and the probe read stays outside it, as the source spells it
        plan = planFor(navSlotPath(target).node);
        // ... and with no render owning it either, the run LANDS the way every kept-spelled run
        // lands - on the deepest span pure can back, the hops above it and their `?.` left as
        // written. a channel that stops here instead reads its own refusal as "no spelling exists"
        // and leaves `_globalThis.self.window`, a NATIVE `self` read off the ponyfill in exactly
        // the realms the ponyfill answers for. only where the probe stands DIRECTLY on what pure
        // backs: a foldable hop under it is a realm self-reference the deep-nav collapse drops
        // (`globalThis.self.window.window` reads `_self.window`), and that fold owns the run.
        // the landing SWAPS inside the run here - this caller holds no slot to mint a whole run
        // into, so a node that is not the run itself reports a landing it never made
        if (!plan) {
          return !foldableRealmHop(unwrapRuntimeExpr(target.node.object),
            { adapter, resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath) })
            && landRunHere(target.node, memberPath) === target.node;
        }
        break;
      }
      plan = planFor(navSlotPath(target).node);
    }
    // a nav with NO live `?.` has no short-circuit for a guard to reproduce, so it collapses - what
    // the bare-root spelling of the same source already does through the earlier hop-collapse drive.
    // that drive declines a proven-CALL root, and this render was answering for it with a guard
    const plainNav = plan.hops.every(hop => !hop.optional && !hop.liveOptional);
    // a call-rooted plan carries the buried identifier as its rootId, so gating on `!plan.rootId`
    // left every proven-call plain nav to the leaf render, against the DEFINED-yield -> ROOT
    // ponyfill canon; `plan.call` alone names the call-rooted shape, and the value canon keeps
    // the probe-yield twin out (its value never reached the root the collapse would spell)
    const definedCallRoot = plainNav && plan.call
      && !callValueCanBeUndefined(plan.call, { scope: memberPath.scope, adapter, path: memberPath }, plan.resolvePure);
    if (definedCallRoot && collapseReceiverHops) {
      const collapsed = collapseReceiverHops(memberPath.node.object, memberPath);
      if (collapsed) {
        memberPath.get('object').replaceWith(collapsed);
        return true;
      }
    }
    // a PLAIN navigation on a proven-CALL root that the hop drive could not take (an all-proxy
    // receiver under a non-global key): nothing short-circuits, so the doctrine collapses it - onto
    // the ROOT ponyfill, the same answer the bare-root spelling of this source gives
    if (definedCallRoot && plan.rootName && !plan.topAssign
      && !plan.seqAroundPrefix?.length && !plan.rootEffectCall) {
      const rootPure = proxyRunLandingPure({
        navNode: navSlotPath(target).node,
        ctx: { scope: memberPath.scope, adapter, path: memberPath },
        resolvePure: plan.resolvePure,
        rootName: plan.rootName,
      });
      if (rootPure) {
        navSlotPath(target).replaceWith(injectPureGlobal(rootPure.entry, rootPure.hintName));
        return true;
      }
    }
    const { leafPure: pure } = plan;
    // a `delete` hosting the chain collapses the navigation WHOLE: the probe guard would make the
    // deletion conditional on the host environment where the source deletes unconditionally, and
    // the member `delete` needs is the one the guard's `void 0` branch never has. the unplugin leg
    // spells it the same way
    // ... EXCEPT the delete-DECIDING guard (`deleteGuardKeepingHop`, the one canon every fold
    // asks): a LIVE `?.` there decides whether the delete happens at all and the render below
    // keeps it - this site's own hop-name rule was a third spelling of that question
    const deleteFolds = deleteHostAboveChain(memberPath, memberPath.node, unwrapRuntimeExpr)
      && !deleteGuardKeepingHop(memberPath.node, plan.resolvePure,
        { scope: memberPath.scope, adapter: getAdapter?.(), path: memberPath });
    if (deleteFolds) {
      // a plan whose value the fold cannot spell DECLINES: falling through would build the very
      // guard the erase verdict just refused
      if (!plan.valueFormSpells) return false;
      navSlotPath(target).replaceWith(navPlanValueAst(t, plan,
        injectPureGlobal(pure.entry, pure.hintName), renderedPlanTails));
      // the fold lands an always-defined binding, so the `?.` the source wrote over it guards a
      // value that can no longer be absent - the shared vestigial verdict, spelled here
      if (target.node.optional) target.node.optional = false;
      return true;
    }
    let rendered = renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName), { prefixOutside: true });
    // the ROOT can be absent: the leaf the hops fold to rides a test on the root itself (`null == A
    // ? void 0 : _self` for `A?.self` off `A = globalThis.window`), the shape the other leg spells
    // from the claim verdict - the plan's own hops carry no probe for it
    if (plan.rootUndefinable) {
      rendered = estreeToBabel(renderShortCircuitGuard(
        nullFirstGuardTest(t.cloneNode(plan.rootAssign ?? plan.rootId), { embed: hostSlot }), hostSlot(rendered)));
    }
    // the render replaces the span that held the root's SEQUENCE prefix, so every landing below hangs
    // that prefix outermost, ahead of the test - where the source runs it. a prefix the test's OWN
    // source node encloses (`(c++, globalThis).window` - the sequence sits under the hop) is already
    // re-emitted inside the rendered test, and a second copy would run it twice
    const testSource = plan.hops[plan.lastUnresolvableIdx]?.node ?? null;
    const prefix = (plan.seqRoot ? navRootPrefixNodes(plan, node => node) : [])
      .filter(expr => !testSource || !subtreeContainsNode(testSource, expr))
      .map(expr => navGuardTestNode(expr, null, plan));
    // a SEQUENCE stands between the render's landing slot and the steps above it, so the tail pull
    // has no contiguous chain to walk there - the prefix keeps the tail outside, as the source spells it
    if (!peelSkippableWrapperPath(target.get('object')).isSequenceExpression()
      && pullUnplannedTail(target, plan, rendered, prefix)) return true;
    // parens directly around the RENDERED nav end the chain there, so the read above them is the
    // source's own throw. parens further out (around a tagged template's whole tag) do not - the
    // short-circuit still reaches them, and a plain read would throw before the template's own
    // substitutions ever run
    // through the canon that knows BOTH paren spellings: read off the flag alone this answered false
    // under `createParenthesizedExpressions`, and the same source then lifted the sealed member to
    // `?.` in one parser mode and kept it plain in the other - a SEMANTIC split, not a shape one
    const sealedObject = isWrappedInParens(target.get('object'));
    const [renderedPath] = navSlotPath(target).replaceWith(rendered);
    // a `delete` the navigation runs on into takes its WHOLE act into the guard, the one spelling of
    // the shared hop render. asked only where the member above still continues the chain: a seal the
    // render absorbed, or one around it, ended the chain at parse, and its flag died with the node
    if (target.isOptionalMemberExpression() && !sealedObject && deleteThroughRenderedGuards(renderedPath, prefix)) return true;
    if (prefix.length) renderedPath.replaceWith(withSideEffects(renderedPath.node, prefix));
    // a PLAIN hop above the render would strand outside the guard as an unconditional read -
    // a throw on the very branch the guard proved absent, where the source short-circuits.
    // the ponyfill leaf is always defined, so lifting the hop to `?.` only re-creates the
    // source short-circuit. a SEALED member (plain MemberExpression over the paren boundary)
    // keeps the source's own throw semantics and stays plain
    if (target.isOptionalMemberExpression() && !target.node.optional
      && !(taggedTemplateTails.has(target.node) && sealedObject)) {
      target.node.optional = true;
      // a TAG that is an optional chain is a SyntaxError bare - the source's own parens are what
      // make it legal, and they must survive the lift (the printer re-derives parens from
      // precedence and drops the ones `extra.parenthesized` recorded)
      if (taggedTemplateTails.has(target.node)) reparenthesizeTaggedTag(t, target);
    }
    return true;
  }

  // Bind the common residual value to Babel's source slots. The shared decision retains
  // the throw boundary and reports an observed call root to the residual replay consumer.
  function probedNavGuardValueNode(rootNode, anchorPath) {
    const adapter = getAdapter?.();
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const decision = probedNavGuardValuePlan(rootNode, ({ name }) => resolvePureGlobalEntry(name, anchorPath),
      { scope: anchorPath.scope, adapter, path: anchorPath });
    if (!decision) return null;
    // A raw leaf becomes a value reference, so the host's grammar check still applies.
    const leaf = decision.leafPlan;
    if (leaf && !leaf.leafPure && !leaf.leafIsProbe && !leaf.leafBasePure
      && !t.isValidIdentifier(leaf.leafName)) return null;
    const node = estreeToBabel(renderClaimProbe(decision, {
      injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
      cloneHost: source => t.cloneNode(source), embed: hostSlot,
    }));
    return { node, rootEffectCall: decision.navPlan?.rootEffectCall ?? null };
  }

  // Convert the common immediate-pattern probe at the insertion boundary. The caller owns
  // placement; the decision retains source effects and writes for its residual reconciliation.
  function destructureProbeNode(source, anchorPath) {
    const adapter = getAdapter?.();
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const decision = destructureProbePlan(source, ({ name }) => resolvePureGlobalEntry(name, anchorPath),
      { scope: anchorPath.scope, adapter, path: anchorPath });
    if (!decision) return null;
    const node = estreeToBabel(renderClaimProbe(decision, {
      injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
      cloneHost: value => t.cloneNode(value),
      embed: hostSlot,
    }));
    mintedEffectNodes.add(node);
    return { node, decision };
  }

  // Bind the shared erased-read decision to Babel's scope, imports and node dialect. Source
  // effects and the throw boundary stay in the decision; the emitted node is only marked as
  // an effect owned by this binding, never inspected to recover those facts.
  function sealedClaimThrowProbeNode(memberPath, probeNode = null) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const aliasCtx = { scope: memberPath.scope, adapter, path: memberPath };
    const decision = directClaimProbePlan(
      probeNode ?? memberPath.node,
      ({ name }) => resolvePureGlobalEntry(name, memberPath),
      aliasCtx,
    );
    if (!decision) return null;
    const node = estreeToBabel(renderClaimProbe(decision, {
      injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
      cloneHost: source => t.cloneNode(source),
      embed: hostSlot,
    }));
    mintedEffectNodes.add(node);
    return { node, decision };
  }

  // flush THIS assignment's kept nav-collapse at its own EXIT: every claim resolver over the
  // chain ran during the subtree traversal (the reason the rewrite is deferred at all), and
  // `replaceWith` REQUEUES the render, so every remaining merged pass - the ES5 lowerings
  // included - still visits what it carries. nothing is ever inserted behind the lowering's
  // back (a Program-exit slot mutation froze an unlowered arrow from a kept call argument
  // into the ie11 output)
  function flushKeptNavCollapseAt(assignPath) {
    for (let i = 0; i < pendingKeptNavCollapses.length; i++) {
      const { plan, storeTakesGuard, pureId } = pendingKeptNavCollapses[i];
      if (plan.topAssign !== assignPath.node) continue;
      pendingKeptNavCollapses.splice(i, 1);
      // the render lands in the INNERMOST `=` step's value slot - replacing the outer right
      // obliterated the mid-chain writes (`q = w = nav` lost its `w =`). a nested host is
      // mutated in place, then the outer right re-queues through replaceWith so the remaining
      // merged passes (ES5 lowerings included) still visit what it carries
      const host = plan.topAssignSteps.at(-1);
      // ... and the same tail landing at the flush: `assignPath.get('right')` is the whole stored
      // value, so a SEQUENCE there takes the render in its last expression
      // the VALUE / guard choice: the plan-time half (`storeTakesGuard`) plus the late half - an
      // observer that did not exist when the plan queued (the guard test a claim channel rendered
      // around this store) is in the tree NOW, and only this moment can see it
      const rendered = storeTakesGuard || storedAbsenceObservedAbove(assignPath, {
        resolvePureGlobal: key => resolvePureGlobalEntry?.(key, assignPath),
        resolvePureStatic: (object, key) => resolvePureStaticEntry?.(object, key, assignPath),
      })
        ? renderNavCollapseAst(plan, pureId)
        : navPlanValueAst(t, plan, pureId, renderedPlanTails);
      if (host === assignPath.node) {
        // the same descent, path-shaped: the render replaces the slot the value peel ended on
        const keys = plan.storedValueSeqDescended ? receiverSequenceTailKeys(assignPath.node.right) : [];
        assignPath.get(['right', ...keys].join('.')).replaceWith(rendered);
      } else {
        landStoredValue(plan, host, rendered);
        assignPath.get('right').replaceWith(assignPath.node.right);
      }
      return;
    }
  }

  // Program-exit backstop for a host whose exit hook never fired (a drain-cloned subtree
  // re-planned outside the main walk); the in-tree hosts all flushed at their own exit.
  // a SEQ-rooted or CALL-rooted plan holds live references the lowering may have moved by
  // now - it flushes at its own exit or not at all (the raw spelling stays, claims intact)
  function flushKeptNavCollapses() {
    for (const { plan, pureId } of pendingKeptNavCollapses) {
      if (plan.seqRoot || plan.call) continue;
      // an off-tree host has no observer to ask - the guarded form is the conservative spelling
      landStoredValue(plan, plan.topAssignSteps.at(-1), renderNavCollapseAst(plan, pureId));
    }
    pendingKeptNavCollapses.length = 0;
  }

  // symmetric with `normalizeOptionalChain`'s parent-walk: descend to the deepest-scanned
  // optional link (`chainStart`), remembering the step ABOVE it - the probe-yield fold's
  // landing slot. transparent wrappers re-peel at every hop: a mid-chain `!`
  // between optional links would otherwise abort the chain detection, emit without the
  // null-check guard, and throw on null where native short-circuits the whole chain
  function descendToOptionalChainStart(path, skipOptional) {
    let chainStart = null;
    let current = peelSkippableWrapperPath(path.get('object'));
    let aboveChainStart = path;
    // the topmost polyfillable hop: the chain start where no earlier probe guards the chain
    let skippedHop = null;
    while (isOptionalNode(current.node)) {
      if (current.node.optional) {
        // A static callee's binding is defined after substitution. Erase that call's
        // guard and keep descending: an earlier receiver probe still guards the chain.
        if (current.isOptionalCallExpression() && skipOptional?.(current.node, current.scope, current)) {
          deoptionalizeNode(current);
          const callee = peelSkippableWrapperPath(current.get('callee'));
          if (callee.isOptionalMemberExpression() && callee.node.optional
            && receiverCarriesLiveOptional(callee.node.object)) deoptionalizeNode(callee);
        } else if (current.isOptionalMemberExpression() && skipOptional?.(current.node, current.scope, current)) {
          // ... and so is a polyfillable hop's: a probe below it that can short-circuit is the live one
          skippedHop ??= { chainStart: current, aboveChainStart };
        } else if (!skippedHop || !vestigialOptionalHop(current)) {
          chainStart = current;
          break;
        }
      }
      aboveChainStart = current;
      const next = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
      current = peelSkippableWrapperPath(next);
    }
    return chainStart || !skippedHop ? { chainStart, aboveChainStart } : skippedHop;
  }

  // is this optional hop's `?.` dead text - its object provably defined (the shared vestigial verdict)?
  function vestigialOptionalHop(hopPath) {
    const adapter = getAdapter?.();
    if (!adapter || !resolvePureGlobalEntry || !hopPath.isOptionalMemberExpression()) return false;
    return vestigialNavOptionals(hopPath.node, ({ name }) => resolvePureGlobalEntry(name, hopPath),
      { scope: hopPath.scope, adapter, path: hopPath }).includes(hopPath.node);
  }

  // the APPLICATION half of the probe-yield memo re-target: memoize the recognized span and
  // land the ref in the member above the folded run; null when the shape declines and the
  // ordinary memo owns the check
  function probeYieldMemoRetarget(chainStart, key, path, aboveChainStart) {
    const probeCall = key === 'object' ? probeYieldRealmChainRoot(chainStart, key, path) : null;
    if (!probeCall || !(aboveChainStart === path || aboveChainStart.isOptionalMemberExpression())
      || unwrapRuntimeExpr(aboveChainStart.node.object) !== chainStart.node) return null;
    const [check, ref] = memoize(probeCall, path.scope, chainStart.node);
    aboveChainStart.node.object = seededRefClone(ref, pathType(aboveChainStart.get('object')));
    tagProxyGlobalMemoRef(ref, probeCall, path.scope);
    return check;
  }

  // a PROBE-YIELD call below pristine dotted realm hops, with the asking hop itself one of
  // them: the plan declines every render that reads THROUGH the yield, so the memo takes the
  // CALL itself - its `null ==` test is the source's own guard - and the realm hops fold onto
  // the tested value (the vestigial erase the ident twin gets from the plan). a sequence or a
  // wrapper between the hops keeps the guard channels' own spellings
  function probeYieldRealmChainRoot(chainStart, key, path) {
    const adapter = getAdapter?.();
    if (!adapter || !resolvePureGlobalEntry) return null;
    if (!chainStart.isOptionalMemberExpression() || chainStart.node.computed
      || !memberProxyHopName(chainStart.node)) return null;
    let cur = chainStart.node[key];
    let memoTarget = cur;
    for (;;) {
      const peeled = unwrapRuntimeExpr(peelReceiverSequenceTail(cur));
      if (peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression') {
        if (peeled.computed || !memberProxyHopName(peeled)) return null;
        cur = peeled.object;
        memoTarget = cur;
        continue;
      }
      cur = peeled;
      break;
    }
    if (cur?.type !== 'CallExpression' || cur.optional) return null;
    const ctx = { scope: path.scope, adapter, path };
    if (!inlineCallProxyGlobalRoot({ callNode: cur, ...ctx, rejectConditional: true })) return null;
    // the MEMO target is the raw span below the DEEPEST realm hop, sequence spellings included:
    // the memo runs their prefixes exactly once, in source order, and the test reads the ref
    return callValueCanBeUndefined(cur, ctx, ({ name }) => resolvePureGlobalEntry(name, path))
      ? memoTarget : null;
  }

  // a guard target that is PURE PROXY NAVIGATION over a chain-assign root: the memo must
  // bind the ROOT (the assignment result - the one value that can be undefined), not the hop
  // nav. memoizing the nav lets the natural rewrite self-collapse the memo RHS into an
  // always-defined ponyfill (`(n = w, _self)`) - the guard then never fires (silent wrong
  // value, worse than the sealed throw). the hops re-hang RAW off the ref and their `?.`
  // folds into the root guard - the proxy-collapse assumption (`self` is a realm-local
  // self-reference), the unplugin emitter's canon for the same shape. returns the check or null
  // when the target is not this shape (caller falls back to the plain memoize)
  function memoizeProxyNavRoot(navNode, scope, ownerNode, anchorPath = null) {
    const adapter = getAdapter?.();
    if (!adapter || !scope) return null;
    if (navNode.type !== 'MemberExpression' && navNode.type !== 'OptionalMemberExpression') return null;
    // `anchorPath` feeds the alias-aware walk: an ALIAS chain-assign value (`const w = globalThis
    // .window; (a = w)?...`) resolves only through a path-anchored binding lookup - with a null
    // path the prefix test misses the alias shape and the kept-swap plan drops the root guard
    if (maximalProxyGlobalPrefix(navNode, { scope, adapter, path: anchorPath },
      { throughChainAssign: true }) !== navNode) return null;
    // the hop fold holds only while the hops are ALWAYS DEFINED (a realm self-reference, a
    // ponyfilled forwarder). an UNRESOLVABLE hop is the environment probe itself - the one
    // value the guard exists for - so folding it out of the test leaves an always-defined
    // root under the null-check and runs the branch where the source short-circuits. keep
    // the whole nav in the memo there (the caller's plain memoize), like the unplugin emitter
    if (resolvePureGlobalEntry && navHasUnresolvableProxyHop(navNode,
      ({ name }) => resolvePureGlobalEntry(name, anchorPath),
      { scope: anchorPath.scope, adapter, path: anchorPath })) return null;
    // descend the object spine to the root (the maximal-prefix check proved pure-nav shape);
    // `holder` keeps the member whose object slot receives the ref - a transparent wrapper
    // between it and the root is dropped with the swap (the same tradeoff as the optional
    // method-call rewrite)
    const spine = [];
    let holder = null;
    let root = navNode;
    while (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression') {
      spine.push(root);
      holder = root;
      root = unwrapRuntimeExpr(root.object);
    }
    // a SEQUENCE root (`(sc++, n = gw)`) memoizes WHOLE - its prefix SE then runs exactly
    // once inside the memo, the unplugin emitter's canon; the assign is its tail
    if (peelReceiverSequenceTail(root)?.type !== 'AssignmentExpression') return null;
    // memoize the holder's OBJECT (wrappers included): a transparent wrapper between the last
    // hop and the root rides INSIDE the memo (`_ref = (v = gw) as any`) - the unplugin emitter
    // keeps it verbatim there, and dropping it desynced the spelling. the shape gates above
    // ran on the PEELED root, so the wrapped memo target is the same value
    const [check, ref] = memoize(holder.object, scope, ownerNode, false, anchorPath && {
      scope,
      path: anchorPath,
      adapter,
      injectorState: getInjector(),
    });
    holder.object = t.cloneNode(ref);
    // node-level deoptionalize (the spine holds raw nodes, not paths): the hops ride the
    // root guard now, and a member spine never carries optional CALLS (pure-nav shape).
    // the rebuilt nav re-enters detection naturally: a mutated-landing guard-ref nav is
    // kept raw by the drive-site gate, a resolvable one collapses as usual
    for (const hop of spine) {
      hop.type = 'MemberExpression';
      delete hop.optional;
    }
    return check;
  }

  // a receiver this leg re-emits BY IDENTITY carries the detector's handled-marks with it: they were
  // made because the claim that subsumed those hops owns their render, and inside the rebuilt tree
  // that premise no longer holds - every claim in the receiver was suppressed on the re-visit and a
  // sealed proxy nav stayed spelled raw (`_ref = (ga.window?.self).Array.prototype`) where the same
  // receiver read plainly renders its guard. released here rather than dodged with a copy: the node
  // carries its resolved Type, its ref anchor, its own-output marks and any deferred plan keyed on
  // it, and every one of those is lost by a clone.
  // only a NAVIGATION: the marking is made on a member chain, so nothing else carries it
  function releaseReemittedReceiver(node, path) {
    const nav = unwrapRuntimeExpr(node);
    if (!releaseHandledNode || (nav?.type !== 'MemberExpression' && nav?.type !== 'OptionalMemberExpression')) return node;
    // ... and only where no channel already owns the WHOLE navigation. one this plugin has rendered
    // roots in a MINTED binding, and a `delete` consumer folds the navigation entire and spells it
    // once at the root - releasing there hands the re-visit a fresh claim over a question already
    // answered (`delete (globalThis.window?.self)?.Array...` folds to `_globalThis.Array`; the
    // released hop re-claimed it as `_self.Array`)
    const { root } = descendToChainRoot(nav);
    const rootBinding = root?.type === 'Identifier'
      ? getAdapter?.()?.getBinding({ scope: path?.scope, name: root.name, path }) : null;
    // an INJECTED import binding is the mark of a rendered nav; a source ALIAS of the surface
    // (`const ga = globalThis`) carries the same proxy hint and is still the source's own spelling
    if (rootBinding?.polyfillHint && rootBinding.importSource) return node;
    if (path && deleteHostAboveChain(path, path.node, unwrapRuntimeExpr)) return node;
    for (let hop = nav; hop?.type === 'MemberExpression' || hop?.type === 'OptionalMemberExpression';
      hop = unwrapRuntimeExpr(hop.object)) releaseHandledNode(hop);
    return node;
  }

  // the guard a claim's receiver owes and the receiver read past it, as `[check, object]`: the check
  // is null (no test), the node one test reads, or the list of tests a receiver split at its live
  // link owes ahead of the method's own (`guardChecks`)
  function extractCheck(path, skipOptional, interveningEffects = false) {
    // a KEPT guard memo whose RHS is a SE-harvested SEQUENCE misses the natural proxy-root
    // rewrite (the harvest re-emit skips the original subtree) - a raw `globalThis` rides
    // into the emitted test (ie11 ReferenceError). substitute the seq tail's nav ROOT
    // identifier in place (the standdown-root canon; plain navs keep the natural rewrite)
    function substituteKeptSeqProbeRoot(navNode, anchorPath) {
      if (!anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return;
      const core = unwrapRuntimeExpr(peelChainAssignment(navNode).value ?? navNode);
      if (core?.type !== 'SequenceExpression' || core.expressions.length < 2) return;
      // the canonical descent peels a sequence tail at EVERY hop; the hand-rolled walk this
      // replaced peeled wrappers and members only, so a NESTED sequence tail (`(d++, (c++,
      // globalThis))`) ended the walk on the inner sequence and froze a raw global in the test
      const { root } = descendToChainRoot(core);
      if (root?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(root.name)
        || anchorPath.scope.hasBinding(root.name, true)) return;
      const pure = resolvePureGlobalEntry(root.name, anchorPath);
      if (!pure) return;
      const binding = injectPureGlobal(pure.entry, pure.hintName);
      root.name = binding.name;
    }
    const { node } = path;
    if (node.optional) {
      // pass `path` as third arg so `skipPolyfillableOptional` can anchor TS-runtime
      // shadow detection at the reference site (path-aware `adapter.hasBinding`)
      if (skipOptional?.(node, path.scope, path)) return [null, node.object];
      collapseKeptNavValueNode(node.object, path);
      const navCheck = memoizeProxyNavRoot(node.object, path.scope, node, path);
      if (navCheck) return [navCheck, node.object];
      const memoNav = releaseReemittedReceiver(node.object, path);
      const [memoCheck, memoRef] = memoize(memoNav, path.scope, node, interveningEffects, {
        scope: path.scope,
        path,
        adapter: getAdapter?.(),
        injectorState: getInjector(),
      });
      // a proven-nav memo RHS renders through the shared kept-nav plan (the memo assignment IS
      // the topAssign shape): the raw spelling would read `.self` off a defined receiver where
      // the ponyfill must back the read - the deferred flush swaps in the nested test. a nav
      // carrying its OWN chain-assign already planned through the entry call above - planning
      // the memo assign too would render over the user's write (the peel sees through both)
      substituteKeptSeqProbeRoot(memoNav, path);
      if (!peelChainAssignment(memoNav).outer) collapseKeptNavValueNode(memoCheck, path);
      return [memoCheck, memoRef];
    }
    if (!path.isOptionalMemberExpression()) return [null, node.object];
    const { chainStart, aboveChainStart } = descendToOptionalChainStart(path, skipOptional);
    if (!chainStart) return [null, node.object];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`).
    // reassigning `chainStart.node[key]` swaps the receiver / callee with the memoized ref -
    // computed property nodes (`.property`) and call arguments (`.arguments`) on the same chainStart
    // remain untouched, so computed-property bootstrapping isn't disturbed
    let check = null;
    if (!skipOptional?.(chainStart.node, path.scope, chainStart)) {
      // IMMEDIATE: this caller owns the emission - it is about to memoize or guard the very node,
      // and the deferred flush renders the guarded form unconditionally, where the value form is
      // what a stored PLAIN nav owes (the fold verdict: that nav IS the realm). OBSERVED when the
      // optional hop is the claim's DIRECT object: the ctor's combined render rides the alternate
      // receiver-independently and its test is the only reader of the kept store, so the store
      // spells the guarded value - the shape the other leg renders inside its probe-test clone. a
      // hop deeper below the claim is read on the live tree and keeps the value form (both legs)
      collapseKeptNavValueNode(chainStart.node[key], chainStart,
        { immediate: true, observed: true });
      if (deoptDeadOptionalOverStore(chainStart, key, path)) return [null, node.object];
      const memoType = pathType(chainStart.get(key));
      check = rewriteOptionalMethodCall(chainStart, key, path.scope, memoType, skipOptional);
      if (check === null) check = memoizeProxyNavRoot(chainStart.node[key], path.scope, chainStart.node, chainStart);
      if (check === null) {
        let ref;
        const rootNode = chainStart.node[key];
        const composedCheck = composeNavGuardCheck(chainStart, key, path, memoType);
        if (composedCheck) return [composedCheck, node.object];
        // the probe-yield memo re-target: the CALL is the memo, the realm hops (the asking hop
        // included) fold onto the ref the member above now reads - `null == (_ref = dh()) ?
        // void 0 : _at(_ref2 = _ref.customArr).call(...)`, the unplugin leg's decomposition;
        // the stored-value canon's nested guard (`_ref = null == dh() ? void 0 : _self`) and
        // its actual/self import were the one-leg spelling this replaces
        check = probeYieldMemoRetarget(chainStart, key, path, aboveChainStart);
        if (check === null) {
          const memoNode = releaseReemittedReceiver(rootNode, chainStart);
          const memoCtx = { scope: path.scope, path: chainStart, adapter: getAdapter?.(), injectorState: getInjector() };
          // a hop off a selection the build decides re-reads the name it folds to (`decidedReusableReceiver`),
          // the other leg's hop split: the read above it then takes the identity guard that name's read takes
          const decided = key === 'object' && decidedReusableReceiver(memoNode, memoCtx);
          [check, ref] = decided ? [t.cloneNode(memoNode), t.cloneNode(decided)]
            : memoize(memoNode, path.scope, chainStart.node, false, memoCtx, key === 'callee');
          chainStart.node[key] = seededRefClone(ref, memoType);
          tagProxyGlobalMemoRef(ref, memoNode, path.scope);
          // proven-nav memo RHS: render the nested test via the shared kept-nav plan (see the
          // optional-node arm above) instead of keeping the raw `.self`-reading spelling; an
          // own-chain-assign nav is owned by the entry call's plan
          substituteKeptSeqProbeRoot(memoNode, chainStart);
          if (!peelChainAssignment(memoNode).outer) collapseKeptNavValueNode(check, chainStart);
        }
      }
    }
    deoptionalizeNode(chainStart);
    // `p && p !== path` guard: on orphaned paths parentPath chain can bottom out at null
    // before reaching `path`, which would infinite-loop the original `p !== path` test
    for (let p = chainStart.parentPath; p && p !== path; p = p.parentPath) {
      if (isOptionalNode(p.node)) deoptionalizeNode(p);
    }
    return [check, node.object];
  }

  // the TOP of the in-chain continuation over a replaced node, which a receiver-level guard wraps
  // whole: the NON-optional links (`.x` / `[k]`) and every call pairing with a climbed callee - a
  // CALL climbs even when its own `?.(` is genuine, since severing it from the callee strands `this`.
  // a genuine `?.x` re-guards the guard's RESULT and stays outside; parens / casts end the chain at
  // parse, so the link types stop the climb there and their throw-past-boundary survives. a `!`
  // between two links ends nothing and is climbed past, as the chain normalizer does
  function chainContinuationTip(path) {
    let tip = path;
    for (;;) {
      const par = peelParenAndTSParentPath(tip, SKIPPABLE_WRAPPER_TYPES);
      if (!par || !isOptionalOperand(tip, par) || (par.isOptionalMemberExpression() && par.node.optional)) return tip;
      tip = par;
    }
  }

  // the guard lands on the chain's TOP, never on the claim alone: the links above the claim belong
  // to the chain its receiver's `?.` short-circuits, `!` or not between them
  // (`arr?.at(-1)!.toFixed(2).toString()` keeps `.toString()` inside the alternate)
  function replaceAndWrap({ replacePath, result, check }) {
    // user parens around the replaced expression terminate an optional chain (native throws
    // past them where the chain would short-circuit) - the paren info dies with the replaced
    // node, so record it on the replacement: the erase-refusal's guard climb must NOT hoist
    // a guard past this boundary (it would swallow the user-visible throw)
    const sealed = isWrappedInParens(replacePath);
    if (sealed) parenTerminated.add(result);
    replacePath.replaceWith(result);
    // a replacement that introduced its OWN optional (`_X(recv)?.call(recv)` from an `arr.flat?.()`
    // optional CALL) leaves a trailing chain continuation (`...?.().next()` / `...?.().length`)
    // as an in-chain OptionalMember/Call straight from the parse - it must STAY optional to
    // short-circuit with the new `?.`. normalizeOptionalChain would deoptionalize the trailing
    // to a PLAIN member, and babel codegen then parenthesizes the optional result off it
    // (`(_X?.call(recv)).next()`), severing the trailing from the chain so it throws on the
    // short-circuit path where native yields void 0 (matches unplugin once skipped)
    let wrapPath;
    if (result.type === 'OptionalCallExpression') {
      if (!check) {
        // an OptionalCallExpression standing in NewExpression.callee (`new (arr.flat?.())(z)`)
        // mis-prints without parens under babel codegen: `new _X(arr)?.call(arr)(z)` round-trips
        // to CONSTRUCT the helper instead of calling it. force the grouping so `new` applies to
        // the call's result (oxc/unplugin preserves the source parens, so this is babel-only)
        if (replacePath.parentPath?.isNewExpression()
          && replacePath.parentPath.node.callee === replacePath.node) {
          replacePath.replaceWith(t.parenthesizedExpression(replacePath.node));
        }
        return;
      }
      // a receiver-level guard must wrap the whole SURVIVING chain, leaving the trailing links
      // optional-typed inside it so the live `?.` still short-circuits past them
      wrapPath = chainContinuationTip(replacePath);
    } else {
      wrapPath = normalizeOptionalChain(replacePath) || replacePath;
      // no `check` when the receiver's `?.` was skipped as polyfillable: the replacement consumes it
      if (!check) return;
    }
    // a `delete` the continuation runs on into takes the whole operator into the guard: absorbed into
    // the alternate the member is evaluated and deleted from nothing (`delete a?.b.at.name`), and a
    // `?.` re-hung off the guard's value would take a dispatch yielding `undefined` for the
    // short-circuit (`delete a?.at(-1).j.k` must throw on an empty `a`). the replacement's own seal is
    // the one recorded off the node it replaced
    const deleteHost = deleteOverOpenContinuation(wrapPath.node, wrapPath.parentPath,
      node => !!node.extra?.parenthesized || (sealed && node === result));
    if (deleteHost) {
      deleteHost.replaceWith(estreeToBabel(renderDeleteShortCircuitGuard(
        composeNullGuardTest(guardChecks(check), { embed: hostSlot }), hostSlot(deleteHost.node.argument))));
      return;
    }
    wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
  }

  // walk past transparent runtime wrappers between a member expression and its enclosing
  // call. covers TS expression wrappers (`as`, `satisfies`, `!`, ...) needed when
  // @babel/plugin-transform-typescript runs after us, AND `ParenthesizedExpression`
  // preserved by parser when `createParenthesizedExpressions: true` - without parens-peeling
  // `(arr.includes)(1)` resolves callerPath.parent to ParenthesizedExpression instead of
  // the outer CallExpression, isCall flips to false, and the polyfill emit drops `.call(arr)`

  // detect `(path)` shape across both parser configs:
  //   default parser: `extra.parenthesized` flag on the path itself or any TS-wrapped form
  //   createParens=true: `ParenthesizedExpression` node above the path / TS-wrapped form
  function isWrappedInParens(path) {
    // the paren can BE this node, not only sit above it: `createParenthesizedExpressions` makes
    // the seal a node, and a caller holding the claim's replace path holds that node itself,
    // where the flag spelling would have put the flag on the claim. answering only for the layer
    // ABOVE made every caller mode-dependent - the invoke gate then read a sealed callee as part
    // of the chain and folded the call into the guard's alternate
    if (path.node?.type === 'ParenthesizedExpression') return true;
    if (path.node?.extra?.parenthesized) return true;
    let current = path;
    while (current.parentPath && TS_EXPR_WRAPPERS.has(current.parentPath.node?.type)) {
      current = current.parentPath;
      if (current.node.extra?.parenthesized) return true;
    }
    return current.parentPath?.node?.type === 'ParenthesizedExpression';
  }

  // wrap a result expression in a SequenceExpression preserving side effects collected
  // from the receiver / computed-key. noop when sideEffects is empty - callers can pass
  // unconditionally. single source of truth: index.js imports this off the compat factory
  // (destructured at plugin top-level), it has no own copy
  function withSideEffects(result, sideEffects) {
    if (!sideEffects?.length) return result;
    // marked so the erase-refusal's guard climb can lift THROUGH a plugin-built SE wrap (its
    // leading memo assign + harvested key SE legally move into the guard's non-null branch);
    // a user-written sequence must never lift. a MINTED node (an alias throw probe) inserts
    // AS-IS - cloning one would shed the skip seeding that keeps it from being re-claimed
    const seq = t.sequenceExpression([...sideEffects.map(e => mintedEffectNodes.has(e) ? e : t.cloneWithoutRetiring(e)), result]);
    pluginSeqWraps.add(seq);
    return seq;
  }

  // SE-receiver + key-SE reorder guard: a non-optional (`check` null) side-effecting receiver memo
  // would otherwise be built INSIDE the body, after the prepended key SE, running the key before
  // the receiver. memoize the receiver and prepend its assignment to the SE list so it evaluates
  // first (native order). returns `[receiverNode, sideEffects]` - the receiver ref to emit and the
  // reordered SE list. no-op for optional (receiver already memoized in the guard) / SE-free receivers
  function hoistReceiverSE(object, sideEffects, check, scope, seMode,
    receiverEffectCount = 0, anchorHostPath = null, receiverReads = 2, firstReceiver = object) {
    // optional guard with a side-effecting receiver: the guard's `null == (_ref = receiver) ? ...`
    // memoize already RAN the receiver-SE, so the body wrap must carry ONLY the key-SE. `suppress`
    // (optional MEMBER access) already reduced `sideEffects` to key-SE upstream, so pass it through;
    // otherwise the receiver-SE is still present (a deeper `?.` left `.X` non-optional, so suppress
    // missed it) and must be dropped here - else a chain-root call `(call)?.self.X` double-runs
    if (check && receiverEffectCount > 0) {
      return [object, seMode === 'suppress' ? sideEffects : keySideEffectsOnly(receiverEffectCount, sideEffects)];
    }
    // The first evaluation includes quiet prefix reads too: they can throw before a key.
    // The effect census is only a replay list, not the complete source receiver value.
    if (!check) object = firstReceiver;
    if (!sideEffects?.length) return [object, sideEffects];
    // Without a trailing key effect, the helper argument can own the complete first receiver.
    if (seMode === 'peel' && sideEffects.length <= receiverEffectCount) {
      return [object, sideEffects.slice(receiverEffectCount)];
    }
    // a sole helper argument already evaluates the receiver once. with no KEY effect to put
    // after it, a memo contributes no ordering; the intact receiver carries its own effects.
    if (receiverReads === 1 && seMode !== 'peel' && !keySideEffectsOnly(receiverEffectCount, sideEffects).length) {
      return [object, sideEffects.filter(effect => !subtreeContainsNode(object, effect))];
    }
    // A hidden constant allocation has one helper read, after the computed key. No value
    // escapes between those slots, so the helper can allocate it directly without a snapshot.
    if (!check && receiverReads === 1 && isConstantLiteralReceiver(unwrapRuntimeExpr(object))) {
      return [object, sideEffects.filter(effect => !subtreeContainsNode(object, effect))];
    }
    // a receiver whose EVALUATION may throw (its member get reads off a nullish-able probe
    // value) hoists like a side-effecting one: the plain SE prepend would run the key effect
    // on the branch where native throws before it (ECMA receiver-before-key). probed only once
    // the cheap bails are past - it resolves aliases through the provider canon
    function receiverMayThrow() {
      const adapter = getAdapter?.();
      return !!adapter && !!scope && !!resolvePureGlobalEntry && !!anchorHostPath
        && claimReceiverEvaluationMayThrow(object,
          ({ name }) => resolvePureGlobalEntry(name, anchorHostPath), { scope, adapter, path: anchorHostPath });
    }
    // ECMA evaluates the receiver BEFORE the key, and a member GET runs user code whenever the
    // property is an accessor - so the plain side-effect answer is not enough to leave the receiver
    // in place. that is exactly the superset `reEvaluationObservable` already computes
    const interveningEffects = sideEffects.length > receiverEffectCount;
    const ctx = anchorHostPath && { scope, path: anchorHostPath, adapter: getAdapter?.(), injectorState: getInjector() };
    const liftedPrefix = seMode === 'peel' && !check ? [] : sideEffects.slice(0, receiverEffectCount)
      .filter(effect => !subtreeContainsNode(object, effect));
    if (!reEvaluationObservable(object) && !receiverMayThrow()
      && (!interveningEffects || isReusableReceiver(object, { interveningEffects, ctx }))) {
      // Reuse proves the later value is stable; the first read still precedes the key.
      // A const in its TDZ or `this` before `super()` can throw on that first evaluation.
      return [
        object,
        interveningEffects && !check
        ? [...liftedPrefix, ...observableSequenceElements([t.cloneNode(object)], ctx, { preserveSourceReads: true }),
          ...sideEffects.slice(receiverEffectCount)] : sideEffects,
      ];
    }
    const [memoAssign, ref] = memoize(object, scope, anchorHostPath?.node ?? object, interveningEffects, ctx);
    // the memo `_ref = object` already evaluates the receiver's OWN side effects (a buried chain-root call
    // or hop-key SE the resolver also listed lives inside `object`), so re-emitting the receiver-SE prefix
    // would double-run it. append only the KEY SE (past receiverEffectCount); the memo owns the receiver SE.
    // The intact first receiver owns the peeled prefix; other lifted effects still precede it.
    return [ref, [...liftedPrefix, memoAssign, ...sideEffects.slice(receiverEffectCount)]];
  }

  // classify a (possibly TS-wrapped) member path's relationship to its enclosing call:
  //   - `callerPath`: the path past transparent TS / paren wrappers (the real callee)
  //   - `parent`: that caller path's parent node
  //   - `isCall`: whether `callerPath` is the callee of an enclosing call expression
  //   - `isParenLookupOnly`: the `(arr?.member)()` shape - a parenthesized optional member as
  //     callee of a NON-optional outer call. parens terminate the optional chain, so a nullish
  //     receiver must throw at the outer call instead of short-circuiting to void 0. shared by
  //     `replaceInstanceLike` (.call shape) and `replaceCallWithSimple` (bare get-iterator shape)
  function classifyCallerContext(path) {
    const callerPath = peelParenAndTSSlotPath(path);
    const { parent } = callerPath;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent))
      && parent.callee === callerPath.node;
    const isParenLookupOnly = isCall && !t.isOptionalCallExpression(parent)
      && calleeParenWrapped(parent) && path.isOptionalMemberExpression();
    return { callerPath, parent, isCall, isParenLookupOnly };
  }

  // SequenceExpression-receiver double-emit guard (see `classifyReceiverSE` doc). mutates
  // `path.node.object` for `peel` (non-optional): peel the receiver to its SE tail; the
  // prepended `sideEffects` replay the full prefix the resolver collected. returns the side
  // effects to emit - the whole list for `peel` / no-SE, only the trailing key-SE for
  // `suppress` (optional - the receiver-SE stays in extractCheck's null-guard memoize, so
  // prepending it too would double-eval). shared by `replaceInstanceLike` + `replaceCallWithSimple`
  function applyReceiverSeMode(path, sideEffects, receiverEffectCount) {
    const seMode = classifyReceiverSE(path.node.object,
      path.node.optional || path.isOptionalMemberExpression(), sideEffects);
    if (seMode === 'peel') {
      const peeled = peelReceiverSequenceTail(path.node.object);
      if (peeled !== path.node.object) path.node.object = peeled;
    }
    const effectiveSE = seMode === 'suppress' ? keySideEffectsOnly(receiverEffectCount, sideEffects) : sideEffects;
    return { seMode, effectiveSE };
  }

  // Keep consumed trivia after a surviving receiver, or on the replacement of a dropped one.
  // Folded keys can contain comments below their root; collect the consumed subtrees once.
  // Shared comment identity lets Babel suppress attachments also carried by surviving effects.
  function inheritConsumedMemberComments(id, member, keepsReceiver = false) {
    t.inheritLeadingComments(id, member);
    t.inheritInnerComments(id, member);
    const target = keepsReceiver && member.object || id;
    const trailingComments = [];
    for (const node of [keepsReceiver ? null : member.object, member.property]) {
      if (node) t.traverseFast(node, part => {
        trailingComments.push(...part.leadingComments || [], ...part.innerComments || [], ...part.trailingComments || []);
      });
    }
    trailingComments.push(...member.trailingComments || []);
    t.inheritTrailingComments(target, { trailingComments });
    target.trailingComments?.sort((a, b) => a.start - b.start);
  }

  // parenthesized optional member followed by a NON-optional outer call: `(arr?.includes)(1)`.
  // native semantics:
  //   - arr nullish: `(undefined)(1)` -> TypeError ("not a function") - chain ENDS at `?.`,
  //     outer `()` is non-optional call on void 0
  //   - arr non-nullish: Reference Type preserves `this=arr` through parens (per ECMAScript
  //     spec on GroupingOperator, verified empirically: `([1,2]?.at)(0) === 1`)
  // The guarded lookup stays outside the outer call; the render canon makes its nullish
  // result safe to read `.call` from, so arguments still run before the invocation rejects.
  // optional outer call `(arr?.at)?.(0)` goes through the standard buildMethodCall path
  // since Reference Type preserves through parens and short-circuits properly on nullish
  function replaceInstanceLike({ path, id, skipOptional, sideEffects, receiverEffectCount }) {
    inheritConsumedMemberComments(id, path.node, true);
    const receiverSource = path.node.object;
    const { seMode, effectiveSE } = applyReceiverSeMode(path, sideEffects, receiverEffectCount);
    const { callerPath, parent, isCall, isParenLookupOnly } = classifyCallerContext(path);
    const [check, extracted] = extractCheck(path, skipOptional,
      (effectiveSE?.length ?? 0) > (seMode === 'suppress' ? 0 : receiverEffectCount));
    // the unplugin emitter drops redundant proxy hops INSIDE its receiver render; this leg memoizes the
    // receiver raw and would keep them (`_ref.self.foo` - a native `self` read where its ponyfill
    // is the point). the whole receiver cannot collapse while its `?.` is live, but once the guard
    // memoized the root the tail hangs off a ref carrying that root's provenance and the shared
    // plan recognises it. hops ONLY: resolving a pure root here injects an import this channel
    // never decided on, which is exactly what an earlier unrestricted attempt did
    const object = collapsedSplitReceiver(extracted, check, path);
    // a claim whose RECEIVER is already gone is a claim an earlier render superseded: the guard
    // channel rebuilt this member (the memo now holds what it read), and the path we still hold
    // points at the detached spelling. building an emit off it handed the helper `undefined` and
    // crashed the pass - the surviving render is what the source gets
    if (!object) return;
    if (isParenLookupOnly) {
      // The sealed lookup guards its receiver/key work; arguments remain outside it.
      callerPath.parentPath.replaceWith(buildMethodCall({
        id, object, scope: path.scope, args: parent.arguments, anchorNode: path.node, anchorPath: path,
        sourceReceiver: receiverSource,
        sideEffects: effectiveSE?.filter(effect => !subtreeContainsNode(receiverSource, effect)),
        lookupGuard: composeNullGuardTest(guardChecks(check), { embed: hostSlot }),
      }));
      return;
    }
    // a receiver already rendered as a plugin-minted guarded claim keeps its short-circuit
    // OUTSIDE the wrapper, and any key SE INSIDE the guard's non-null branch (native evaluates
    // a computed key only when the chain does not short-circuit). detected BEFORE the SE hoist:
    // the hoist would memoize the whole ternary and run the SE unconditionally, handing the
    // memoized `void 0` to the helper - a throw exactly where native short-circuits
    // hoist only over a DIRECT un-wrapped receiver: a TS cast / user parens between the claim
    // and this wrapper terminate the chain (native throws there), so the guard stays inside
    const rawObject = path.node.object;
    const guardedRecv = !check && guardedClaims.has(object) && !parenTerminated.has(object)
      && rawObject === object && !rawObject?.extra?.parenthesized ? object : null;
    const ordinaryCall = isCall && !parent.optional && !check && !guardedRecv;
    const [recvNode, hoistedSE] = guardedRecv
      ? [guardedRecv.alternate, null]
      : ordinaryCall ? [receiverSource, null]
        : hoistReceiverSE(object, effectiveSE, check, path.scope, seMode, receiverEffectCount, path, isCall ? 2 : 1, receiverSource);
    const built = isCall
      ? buildMethodCall({
        id,
        object: releaseReemittedReceiver(recvNode, path),
        scope: path.scope,
        args: parent.arguments,
        optionalCall: parent.optional,
        anchorNode: parent,
        anchorPath: path,
        ...ordinaryCall ? { sourceReceiver: receiverSource, sideEffects: effectiveSE, receiverEffectCount } : {},
      })
      : t.callExpression(id, [cloneReceiverForEmit({ t, collapse: collapseKeptNavValueNode, node: recvNode, path, types: resolvedType })]);
    const result = guardedRecv
      ? markGuardedClaim(t.conditionalExpression(guardedRecv.test, guardedRecv.consequent, withSideEffects(built, effectiveSE)))
      : built;
    replaceAndWrap({
      replacePath: isCall ? callerPath.parentPath : path,
      result: withSideEffects(result, hoistedSE),
      check,
    });
  }

  function replaceCallWithSimple(path, id, skipOptional, sideEffects, receiverEffectCount) {
    inheritConsumedMemberComments(id, path.node, true);
    const receiverSource = path.node.object;
    // peel TS wrappers so the call (and not its `as X` / `!` envelope) is what we replace
    const { callerPath, isParenLookupOnly } = classifyCallerContext(path);
    const { seMode, effectiveSE } = applyReceiverSeMode(path, sideEffects, receiverEffectCount);
    // `(arr?.[Symbol.iterator])()`: parens terminate the optional chain, so on nullish `arr`
    // native evaluates `(undefined)()` and throws TypeError - the standard `check == null ?
    // void 0 : _id(arr)` ternary would instead yield `void 0` and swallow the throw (unlike
    // `replaceInstanceLike`'s sibling case, there is no trailing `.call` to re-trigger the
    // throw on the void 0). emit the bare `_id(receiver)` so the polyfill call throws on
    // nullish. caveat: this restores the throw, not the exact error - native throws a
    // call-time `is not a function`, `getIterator(null)` throws `is not iterable`. exact-
    // message parity is unreachable: the only emit matching native's message calls the bare
    // method without `.call`, which drops the `this=receiver` binding the parens preserve and
    // breaks the success case. both are TypeError - same accepted tradeoff as the instance-
    // method paren-lookup. receiver is the sole arg (evaluated once), inner `?.` stays intact,
    // so no memoization / null-guard is needed
    if (isParenLookupOnly) {
      if (!effectiveSE?.length) {
        callerPath.parentPath.replaceWith(t.callExpression(id, [t.cloneNode(path.node.object)]));
        return;
      }
      // the receiver is optional (parens terminate the `?.`), so the receiver-derived SE (a computed
      // key) must fire only when the receiver is non-null - native short-circuits before evaluating
      // it. guard the SE behind the receiver's nullishness (the polyfill still throws on null);
      // prepending it to the whole call would fire it on the short-circuit too
      const [memoAssign, memoRef] = memoize(path.node.object, path.scope, path.node, true, {
        scope: path.scope,
        path,
        adapter: getAdapter?.(),
        injectorState: getInjector(),
      });
      const guardedSE = wrapConditional(memoAssign,
        withSideEffects(t.unaryExpression('void', t.numericLiteral(0)),
          effectiveSE.filter(effect => !subtreeContainsNode(path.node.object, effect))));
      callerPath.parentPath.replaceWith(
        t.sequenceExpression([guardedSE, t.callExpression(id, [t.cloneNode(memoRef)])]),
      );
      return;
    }
    const [check, object] = extractCheck(path, skipOptional,
      (effectiveSE?.length ?? 0) > (seMode === 'suppress' ? 0 : receiverEffectCount));
    const [recvNode, hoistedSE] = hoistReceiverSE(object, effectiveSE, check, path.scope,
      seMode, receiverEffectCount, path, 1, receiverSource);
    replaceAndWrap({
      replacePath: callerPath.parentPath,
      // wrap with the caller's accumulated side effects (e.g. computed-key SE from
      // detect-usage) so they don't drop when the original call is fully replaced
      result: withSideEffects(t.callExpression(id, [cloneReceiverForEmit({
        t, collapse: collapseKeptNavValueNode, node: recvNode, path, types: resolvedType,
      })]), hoistedSE),
      check,
    });
  }

  // rebuild a receiver sub-chain with the inner optional call (`target`) spliced out for
  // `replacement` (the memoized inner result). deep-clones each hop so siblings - call args /
  // computed keys - are fresh, then overrides the chain-child with the recursively-spliced node
  function spliceChainInner(node, target, replacement) {
    if (node === target) return replacement;
    const clone = t.cloneNode(node, true);
    if (node.object) clone.object = spliceChainInner(node.object, target, replacement);
    else if (node.callee) clone.callee = spliceChainInner(node.callee, target, replacement);
    else if (node.expression) clone.expression = spliceChainInner(node.expression, target, replacement);
    return clone;
  }

  // Babel-style OR-chain for `(recv)?.inner?.(ia).outer(oa)`: runs outer directly on
  // `_m.call(_a, ia)` so value-undef (e.g. `[].at(99)`) reaches `_outer()` and throws
  // like native. An adjacent optional result can carry the method's own optional call.
  // the outer is a call OR a bare GET (`recv.m?.().at`) - `outerIsCall` says which, and a GET
  // ends the emit at the member itself, with no arguments to fold and no `.call` receiver.
  // The optional call product and result capture come from the provider. This binding
  // splices source continuations, retains their types and lands the guard on the live path.
  function replaceInstanceChainCombined(outerPath, outerId, { innerCallee, innerCalleePath, innerArgs, innerId,
    chainStartNode, hasHops, sideEffects, outerIsCall = true, chainStartType, outerReturnType = null, skipOptional = null }) {
    const callerPath = peelParenAndTSSlotPath(outerPath);
    // a GET tail has no call to fold: the emit ends at the member itself, and the outer dispatch
    // is the bare helper read (`_at(recv)`) instead of `_at(recv).call(recv, args)`
    const outerCall = outerIsCall ? callerPath.parent : null;
    const emitPath = outerCall ? callerPath.parentPath : callerPath;
    const { scope } = outerPath;

    // the receiver's test is the shared verdict: an optional method member tests the receiver's
    // VALUE (`arr?.flat?.()`); a plain one over a live `?.` splits the receiver at that link, whose
    // object takes the test while the receiver is read plainly past it - a nullish there throws at
    // the method read like native. a receiver with neither keeps the testless form: `arr.flat?.()`
    // must throw on the `.flat` read
    const receiverGuard = optionalCallReceiverGuard(innerCallee);
    const receiverCtx = {
      scope,
      path: outerPath,
      adapter: getAdapter?.(),
      injectorState: getInjector(),
    };
    const linkChecks = receiverGuard === 'link'
      ? guardChecks(extractCheck(innerCalleePath, skipOptional)[0]) : [];
    const receiverNode = prepareMemoReceiver(collapsedSplitReceiver(innerCallee.object, linkChecks, outerPath), receiverCtx);
    const decision = planOptionalMethodCall({
      callee: innerCallee, receiver: receiverNode, call: chainStartNode,
      continuation: hasHops ? null : outerPath.node, ctx: receiverCtx,
    });
    const product = renderOptionalMethodCall(decision, {
      callee: innerCallee,
      args: innerArgs,
      helper: hostSlot(innerId),
      checks: linkChecks.map(hostSlot),
      mintRef: () => generateRef(scope, outerPath.node).name,
      embed: (node, role) => hostSlot(role === 'capture' ? node : t.cloneNode(node)),
      recordCapture(node) {
        const assign = estreeToBabel(node);
        getInjector().recordMemoWrite?.(assign.left.name, assign);
        return hostSlot(assign);
      },
    });
    const mCall = estreeToBabel(product.receiver);
    t.inheritInnerComments(mCall, chainStartNode);
    if (chainStartType) resolvedType?.set(mCall, chainStartType);
    const checks = product.disjuncts.map(estreeToBabel);
    // thread surviving non-optional hops (`.map(...)` between inner `flat?.()` and outer
    // `filter?.()`): splice the memoized inner result into the outer receiver sub-chain so the
    // hops re-emit (own pass polyfills them on the inner result) rather than being dropped
    let outerObject = hasHops ? spliceChainInner(outerPath.node.object, chainStartNode, mCall) : mCall;
    // `?.method` as outer: nullish receiver of the outer call must short-circuit it. capture
    // the hop-spliced `outerObject` (inner result + surviving non-optional hops), NOT the bare
    // `mCall` - testing/binding `mCall` would discard the hops (`arr.flat?.().map(f)?.at(0)`
    // would drop `.map(f)` and call `.at` on the flat() result). with no hops outerObject === mCall
    if (outerPath.node.optional) {
      const memo = renderReceiverMemo({ firstReceiver: outerObject, capture: true }, {
        mintRef: () => generateRef(scope, outerPath.node).name,
        embed: hostSlot,
      });
      checks.push(estreeToBabel(memo.firstRead));
      outerObject = estreeToBabel(memo.makeBase());
    }
    // the JOIN is the canon's: every member of a joined chain spells the literal first, and the
    // fold was written here a second time with the same rule
    const testOr = estreeToBabel(composeNullGuardTest(checks, { embed: hostSlot }));

    // outer-key computed SE (e.g. `arr?.at?.(0)?.[(fn(), 'map')](x => x)`) attaches to
    // `meta.sideEffects` during detection. fold it into the alternate (not around the whole
    // conditional) so it fires only when the chain does NOT short-circuit - native skips the
    // computed-key eval on a nullish receiver; prepending it would run `fn()` unconditionally
    // ECMA evaluates the receiver before the computed key: hoist the threaded receiver's memo
    // AHEAD of the folded key SE and dispatch on the ref (the optional-outer path already
    // memoized into the test's vRef, so the hoist no-ops there on a pure identifier)
    const [outerRecv, foldedSE] = hoistReceiverSE(outerObject, sideEffects, null, scope, undefined, 0, outerPath);
    const replacement = withSideEffects(outerCall ? buildMethodCall({
      id: outerId,
      object: outerRecv,
      scope,
      args: outerCall.arguments,
      optionalCall: outerCall.optional,
      anchorNode: outerPath.node,
      anchorPath: outerPath,
    }) : t.callExpression(t.cloneNode(outerId), [outerRecv]), foldedSE);
    // the OUTER call's own return type, the twin of `chainStartType` above: this node is what a
    // member ABOVE the chain reads off, and the caller's annotation cannot reach it (the render
    // replaces a different path). untyped there, the next claim resolved generic - `.name` off an
    // array value pulled the function-name ponyfill on this leg and on no other
    if (outerReturnType) resolvedType?.set(replacement, outerReturnType);
    // trailing NON-optional in-chain continuations (`...flat?.()?.at(0).length`) ride the
    // SUCCESS branch: native short-circuit skips them, while links left outside would apply
    // to the ternary result and throw on the void 0 path where native yields undefined
    const tipPath = chainContinuationTip(emitPath);
    let alternate = replacement;
    if (tipPath.node !== emitPath.node) {
      alternate = spliceChainInner(tipPath.node, emitPath.node, replacement);
      // over a PLAIN dispatch root the spliced trailing links are DEAD Optional*-typed -
      // retype them plain, else babel codegen parenthesizes the chain boundary. over a LIVE
      // `?.call` root (optional outer call) they stay Optional*: they are genuine chain
      // members and the retype would sever them from the short-circuit. a `!` between two
      // links is stepped over like the climb that took it in
      if (replacement.type !== 'OptionalCallExpression') {
        for (let link = alternate; link && link !== replacement;
          link = TS_EXPR_WRAPPERS.has(link.type) ? link.expression : link.object ?? link.callee) {
          if (TS_EXPR_WRAPPERS.has(link.type)) continue;
          if (link.type === 'OptionalMemberExpression') link.type = 'MemberExpression';
          else if (link.type === 'OptionalCallExpression') link.type = 'CallExpression';
          else break;
          delete link.optional;
        }
      }
    }
    // a `delete` of a member the continuation runs on into takes the whole operator into the guard:
    // inside the alternate the member is read and nothing is deleted. its `?.` links past the tip
    // re-test the guarded value inside the operand
    const deleteHost = deleteOverOpenContinuation(tipPath.node, tipPath.parentPath);
    if (deleteHost && isMemberAccessNode(unwrapRuntimeExpr(deleteHost.node.argument))) {
      deleteHost.replaceWith(estreeToBabel(renderDeleteShortCircuitGuard(hostSlot(testOr),
        hostSlot(spliceChainInner(deleteHost.node.argument, tipPath.node, alternate)))));
      return;
    }
    const conditional = estreeToBabel(renderShortCircuitGuard(hostSlot(testOr), hostSlot(alternate)));
    // chained outer calls read the hint off the result node; relocate the pre-combine
    // `annotateCallReturnType` stamp onto the wrapping conditional so they still resolve.
    // the stamp is placed by the visitor's own `annotateCallReturnType` on the CALL node - the
    // fixture corpus happens not to reach a combined chain whose result is read again, which is
    // why the unit suite carries the case instead
    const outerCallType = outerCall ? resolvedType?.get(outerCall) : undefined;
    if (outerCallType) resolvedType.set(conditional, outerCallType);
    tipPath.replaceWith(conditional);
  }

  return {
    isInTypeAnnotation,
    deoptionalizeDanglingOptionalParent,
    deoptionalizeNode,
    emitGuardedClaim,
    navGuardTestNode,
    collapseKeptNavValueNode,
    keptNavHopClaimSuppressed,
    isRenderedPlanTail: node => renderedPlanTails.has(node),
    collapseClaimlessCallRootedNav: endPath => collapseClaimlessCallRootedNav({ endPath, adapter: getAdapter?.(),
      resolvePureGlobalEntry, resolvePurePrototypeEntry, injectPureGlobal,
      collapseNav: collapseShortCircuitNavInPlace, withSideEffects,
      collapseKeptValue: (stored, path) => collapseKeptNavValueNode(stored, path, { immediate: true }),
      markRenderedPlanTail: node => renderedPlanTails.add(node) }),
    collapseShortCircuitNavInPlace,
    probedNavGuardValueNode,
    destructureProbeNode,
    renderWriteHostProbeGuard,
    sealedClaimThrowProbeNode,
    flushKeptNavCollapseAt,
    flushKeptNavCollapses,
    markThrowingExtraction,
    generateRef,
    generateLocalRef,
    generateUnusedId,
    cloneHost,
    isWrappedInParens,
    normalizeOptionalChain,
    inheritConsumedMemberComments,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    withSideEffects,
    reset,
  };
}
