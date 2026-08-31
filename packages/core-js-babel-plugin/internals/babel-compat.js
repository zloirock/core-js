// babel-specific AST primitives + optional-chain handling. covers ref memoization,
// optional-chain deoptionalization, instance-method replacement strategies, TS-wrapper
// peeling. destructure emission moved out to `internals/destructure-emitter.js`.
import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  aliasHeldClaimProbe,
  composableNavGuardPlan,
  planProvenNavGuardCollapse,
  claimReceiverEvaluationMayThrow,
  classifyReceiverSE,
  descendToChainRoot,
  keySideEffectsOnly,
  maximalProxyGlobalPrefix,
  chainReadsThroughSeal,
  collectChainAssignsThroughMemberChain,
  guardTailPullCount,
  navHasUnresolvableProxyHop,
  navValueCanShortCircuit,
  peelChainAssignment,
  peelChainRootValue,
  peelReceiverSequenceTail,
  inlineCallProxyGlobalRoot,
  receiverSequenceTailKeys,
  inlineCallHasObservableEffects,
  navHopSequencePrefixes,
  storedNavHopClaimSuppressed,
  navGuardTestBase,
  proxyReceiverValueCanBeUndefined,
  sealedChainBoundary,
  sealedClaimLeafGuardPlan,
  foldableRealmHop,
  resolveObjectName,
  vestigialNavOptionals,
  proxyGlobalRootName,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  chainValueCarrier,
  isNullLiteralNode,
  isUndefinedNode,
  isDeoptedGlobalSlotRead,
  createTypeAnnotationChecker,
  deleteHostAboveChain,
  isDestructurePattern,
  memberChainEndPath,
  isMemberWriteHost,
  isMemberAccessNode,
  isReusableReceiver,
  markRenderedStoredValue,
  mayHaveSideEffects,
  memberKeyName,
  memberProxyHopName,
  migratableClaimSe,
  nodeSpan,
  peelParenAndTSParentPath,
  peelParenAndTSSlotPath,
  peelSkippableWrapperPath,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  receiverCarriesLiveOptional,
  reEvaluationObservable,
  SKIPPABLE_WRAPPER_TYPES,
  staticMemberKeyName,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  unwrapCollectingSePrefixes,
  unwrapRuntimeExpr,
  hasDeferredContextAncestor,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  chainExpression,
  composeNullGuardTest,
  hostSlot,
  nullFirstGuardTest,
  nullGuardTest,
  renderAliasHeldProbeRead,
  renderNavCollapseLeaf,
  renderNavCollapseTail,
  renderNavGuardTestBase,
  renderShortCircuitGuard,
  sequenceExpression,
} from '@core-js/polyfill-provider/render';
import estreeToBabel from './estree-to-babel.js';

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

// the babel dialect spells the two optional-chain links as their own node TYPES. asking by type
// keeps the path-form and node-form callers on one predicate - both spellings occur, and a
// path-only predicate leaves the node-form ones re-deriving it
const OPTIONAL_CHAIN_LINK_TYPES = new Set(['OptionalMemberExpression', 'OptionalCallExpression']);

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
  const clone = t.cloneNode(node);
  // `cloneNode` drops source POSITIONS, and the kept-nav trust proof reads them - a write earlier in
  // the same sequence than the read is what proves the alias. re-stamp them from the original: the
  // copy is structurally identical, so one deterministic walk of each pairs the nodes in order, and
  // the positions they carry are the same source positions either way
  const originals = [];
  t.traverseFast(node, inner => originals.push(inner));
  let at = 0;
  t.traverseFast(clone, inner => {
    const origin = originals[at++];
    if (origin?.type === inner.type && typeof origin.start === 'number') {
      inner.start = origin.start;
      inner.end = origin.end;
    }
    if (inner.type === 'AssignmentExpression') collapse(inner, path);
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
  for (let step = fromPath; step?.node; step = step.parentPath) {
    const parent = step.parentPath;
    if (parent?.isTaggedTemplateExpression() && parent.node.tag === step.node) {
      step.replaceWith(t.parenthesizedExpression(step.node));
      return;
    }
    if (!parent?.isMemberExpression() && !parent?.isOptionalMemberExpression()) return;
  }
}

// the nav-collapse descent reached the environment PROBE itself (`globalThis.self.window?.X` - the nav
// ENDS at the hop pure cannot back, so there is no ponyfilled LEAF for a plan to collapse onto). the hops
// BELOW it still collapse: substitute their ponyfill and leave the probe read - and its `?.` - exactly as
// written, which is what the unplugin emitter spells. without it the emit keeps `_globalThis.self.window`, a
// NATIVE `self` read off the ponyfill that throws in Node where the same source, spelled by the other
// leg, short-circuits. effect-free plans with nothing above their collapse only - everything else is the
// guarded render's business
// the VALUE a nav-collapse plan answers - its ponyfill leaf plus the hops above it, with no test around
// it. the guarded render is the other half of the same plan (`renderNavCollapseAst`); this one is what a
// slot holding the nav's VALUE takes when nothing about that value short-circuits
function navPlanValueAst(t, plan, pureId, renderedPlanTails) {
  let out = t.cloneNode(pureId);
  for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
    out = t.memberExpression(out, t.identifier(hop.name));
    renderedPlanTails.add(out);
  }
  // the COLLAPSED hops go away with their computed keys, so the value replays those keys' effects
  // ahead of the leaf - the order native evaluates them in, and the sequence the other emitter writes
  const keySe = plan.liveKeySeExprs();
  return keySe.length ? t.sequenceExpression([...keySe.map(node => t.cloneNode(node)), out]) : out;
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
function claimBelowEndOwnsChain(memberPath, adapter, resolvePureGlobalEntry, resolvePureStaticEntry = null) {
  const deleteFolds = deleteHostAboveChain(memberPath, memberPath.node, unwrapRuntimeExpr);
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
    // an INSTANCE answer belongs to the instance channel, which renders its own receiver
    const belowHost = belowKey ? staticMemberKeyName(belowEnd.object) : null;
    if (belowHost && belowKey && !POSSIBLE_GLOBAL_OBJECTS.has(belowHost)
      && resolvePureStaticEntry?.(belowHost, belowKey, memberPath)?.kind === 'static') return true;
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

// a CLAIMLESS proxy nav rooted in an inline-resolvable CALL (`(() => globalThis)().window.self
// .userSlot`): every claim channel here is driven by a claim, and there is none, so nothing
// rendered the hops and they rode raw - a native `self` read where the ponyfill is the point,
// while the unplugin leg collapses the same source through its own suppressed-hop callback. climb to
// the chain END and hand it to the collapse a claimed nav takes. an IDENTIFIER root is not this:
// its own visitor substitutes the root and the hop drive owns the rest
function collapseClaimlessCallRootedNav({ endPath, adapter, resolvePureGlobalEntry, injectPureGlobal, collapseNav }) {
  if (!adapter || !endPath?.scope || !injectPureGlobal || !resolvePureGlobalEntry) return false;
  // a MEMBER consumer only - the same callback also fires for a destructure property, whose node
  // has no navigation at all
  if (!endPath.isMemberExpression?.() && !endPath.isOptionalMemberExpression?.()) return false;
  // every step down to the call must be a dotted proxy hop: a computed or non-hop key is a claim's.
  // a `?.` among them is the GUARD channel's shape - and with no claim leading a channel here, that
  // render has to be driven from this entry too, or the hops ride raw with nobody owning them
  // ... read through a SEQUENCE around the nav: its prefix runs beside the navigation, and the
  // render lands in the tail's own slot, so the run below it is this same chain
  let root = unwrapRuntimeExpr(peelReceiverSequenceTail(endPath.node.object));
  if (root?.type !== 'MemberExpression' && root?.type !== 'OptionalMemberExpression') return false;
  let guardedRun = false;
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    if (root.computed || !memberProxyHopName(root)) return false;
    guardedRun ||= !!root.optional;
    root = unwrapRuntimeExpr(peelReceiverSequenceTail(root.object));
  }
  if (guardedRun) return collapseNav(endPath);
  if (root?.type !== 'CallExpression' && root?.type !== 'OptionalCallExpression' || root.optional) return false;
  const ctx = { scope: endPath.scope, adapter, path: endPath };
  if (!inlineCallProxyGlobalRoot({ callNode: root, ...ctx, rejectConditional: true })) return false;
  // the collapse drops the call with the nav and has no slot to replay what it DID on the way
  if (inlineCallHasObservableEffects({ callNode: root, ...ctx })) return false;
  function resolvePure({ name }) {
    return resolvePureGlobalEntry(name, endPath);
  }
  // a call yielding a DEFINED global collapses onto the ROOT ponyfill, the canon every other
  // spelling of that source takes. one yielding the PROBE (`() => globalThis.window`) does not:
  // its root names a global the value never reached, so the nav collapses onto the ponyfill of
  // what it NAVIGATES instead - the leaf, which is what the unplugin leg spells for this shape
  if (!proxyReceiverValueCanBeUndefined(root, resolvePure, ctx)) return collapseNav(endPath);
  const navPath = endPath.get('object');
  const name = resolveObjectName({ objectNode: navPath.node, ...ctx });
  const pure = name && POSSIBLE_GLOBAL_OBJECTS.has(name) && resolvePureGlobalEntry(name, endPath);
  if (!pure) return false;
  navPath.replaceWith(injectPureGlobal(pure.entry, pure.hintName));
  return true;
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

// RENDER half of the alias-held claim probe (the decision is the shared
// `aliasHeldClaimProbe`): the claim's own member read spelled verbatim - the alias binding
// IS the test, no guard render needed. reached with NO sealed boundary and as the FALLBACK
// of a sealed path that renders nothing (a value-transparent seal over the bare alias,
// `(a as any).of` - it hides no short-circuit, so the alias question stands)
function aliasHeldClaimProbeNode(memberPath, member, { t, adapter, resolvePureGlobalEntry, mintedEffectNodes }) {
  // a SYNTHETIC member (no source span) is a render, not a source read - the probes this
  // arm spells are themselves such members (re-cloned by the SE wrap), and probing one
  // would loop the visitor
  if (!Number.isInteger(member?.start)) return null;
  const probe = aliasHeldClaimProbe(member,
    ({ name }) => resolvePureGlobalEntry(name, memberPath),
    { scope: memberPath.scope, adapter, path: memberPath });
  if (!probe) return null;
  const read = estreeToBabel(renderAliasHeldProbeRead(probe, hostSlot(t.cloneNode(probe.object))));
  mintedEffectNodes.add(read);
  return { keySeExprs: [], navStart: probe.navStart, node: read };
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
  resolvePureStaticEntry = null, injectPureGlobal,
  collapseReceiverHops = null, releaseHandledNode = null } = {}) {
  const { resolveNodeType, resolvedType } = typeResolvers ?? {};
  const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

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

  // `anchorNode` - a RANGE-BEARING node at the use site for `var _ref` placement. defaults
  // to `node`, but callers memoizing a CLONE or a synthesized subtree (optional-method-call
  // methodNode, combined-chain spliced receivers) must pass the live source node instead: a
  // range-less useNode fails the param/loop-header escape check and strands the `var` in the
  // function body, unreachable from a parameter-default use (ReferenceError at call time for
  // a TS parameter-property default)
  function memoize(node, scope, anchorNode = node) {
    if (isReusableReceiver(node)) return [t.cloneNode(node), t.cloneNode(node)];
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
  // render-minted effect nodes (alias throw probes): inserted AS-IS by the SE wrap, so
  // the consumer's skip seeding survives to the visitor that would otherwise re-claim
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
    const p = basePath.parentPath;
    if (!p) return null;
    if (p.isCallExpression() && isHelperCall(p.node, basePath.node)) {
      if (throwingExtractions.has(p.node)) return null;
      return [p, t.callExpression(t.cloneNode(p.node.callee), [body]), 'helper'];
    }
    if (p.isAssignmentExpression() && p.node.operator === '='
      && p.node.right === basePath.node && p.node.left.type === 'Identifier') {
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
      && p.node.object === basePath.node && !p.node.computed && p.node.property.name === 'call') {
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
    const tailMember = p.node.object === basePath.node && !parenTerminated.has(basePath.node)
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
    const tailCall = p.node.callee === basePath.node && prevKind === 'tail'
      && (p.isOptionalCallExpression() || p.isCallExpression());
    if (tailCall) {
      const rebuiltArgs = p.node.arguments.map(a => t.cloneNode(a));
      return [p, p.node.optional
        ? t.optionalCallExpression(body, rebuiltArgs, true)
        : t.callExpression(body, rebuiltArgs), 'tail'];
    }
    return null;
  }

  // re-hangs a claim inside the guard its receiver's `?.` provides. FALSE when no guard of this
  // shape expresses the source - the caller owns what happens then, and its plain arm spells the
  // claim behind a throw probe, so a stand-down here never costs the polyfill
  function emitGuardedClaim({ path, replacePath, id, sideEffects, receiverEffectCount, guardObject, substituteGlobal = null }) {
    if (!guardObject) return false;
    // a kept chain-assign VALUE with collapsible pony hops spells through the shared plan
    // (`v = _globalThis.self.window` -> `v = _self.window`) before the test freezes it
    collapseKeptNavValueNode(guardObject, path);
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
    // the kept test still holds the chain's ROOT proxy-global (a bare `globalThis.window`
    // prefix or one BURIED in an inline-provable call arg): the member visitor's subtree-skip
    // means the identifier visitor never reaches it, and the claim freezes the kept text - a
    // raw `globalThis` would ReferenceError on ie:11. no tree walk: the canonical spine
    // descent + inline proof land on the ONE identifier, substituted by name in place. its own
    // `?.` spelling is the shared verdict below, applied once for every root shape
    if (substituteGlobal) {
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
    }
    // the peeled probe rides both slots: a top-level prefix now has a slot of its own (leading),
    // so the test-spelling exception must not re-freeze it - only hop-buried sequences remain
    // inside the probe and keep riding the source spelling
    rootNode = navGuardTestNode(rootNode, path, null, probeObject);
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
    // a `delete` above the climbed tail needs a REFERENCE: a member absorbed into the
    // ternary alternate evaluates and deletes nothing. re-hang the LAST climbed member
    // OUTSIDE the guard behind `?.` - the claim binding is always defined, so the `?.`
    // only re-creates the source short-circuit on the guarded branch
    const deleteWalk = peelParenAndTSParentPath(target);
    const deleteTail = !!deleteWalk?.isUnaryExpression() && deleteWalk.node.operator === 'delete'
      && (claimBody.type === 'MemberExpression' || claimBody.type === 'OptionalMemberExpression');
    // the `delete` shape re-hangs the tail OUTSIDE the guard, and a sequence prefix around a
    // delete target deletes nothing - keep the raw stand-down for a leading effect there
    if (deleteTail && leadingSe.length) return false;
    if (deleteTail) {
      const guard = markGuardedClaim(estreeToBabel(renderShortCircuitGuard(
        nullFirstGuardTest(test, { embed: hostSlot }), hostSlot(claimBody.object))));
      target.replaceWith(t.optionalMemberExpression(
        guard, t.cloneNode(claimBody.property), claimBody.computed, true));
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

  function wrapConditional(check, result) {
    // the SHAPE spelling of the canon (`x == null` for an identifier-like check, `null == (_ref = x)`
    // otherwise); the nav-guard channels take the literal-first form through `nullTest` instead
    return estreeToBabel(renderShortCircuitGuard(
      nullGuardTest(check, { embed: hostSlot }), hostSlot(result)));
  }

  function buildMethodCall({ id, object, scope, args, optionalCall, anchorNode }) {
    const [assign, ref] = memoize(object, scope, anchorNode ?? object);
    // clone args: originals may belong to a parent being replaced (stale Babel path containers)
    const callArgs = [t.cloneNode(ref), ...args.map(a => t.cloneNode(a))];
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, callArgs, false)
      : t.callExpression(callMember, callArgs);
  }

  // strip Optional{Member,Call}Expression wrappers above a replaced node
  // stripFirstOptional: also deoptionalize the first user-written ?. in the chain
  // (used when the replacement is always defined, e.g., polyfill imports)
  function normalizeOptionalChain(path, stripFirstOptional) {
    let { parentPath } = path;
    // walk past TS / Paren / Chain wrappers between the replaced node and the optional
    // chain. without these peels, `(arr.includes)?.(1)` / ESTree-wrapped chains wouldn't
    // deopt. symmetric with `peelTransparentChildPath` (extractCheck's child-walk)
    while (parentPath && SKIPPABLE_WRAPPER_TYPES.has(parentPath.node?.type)) {
      ({ parentPath } = parentPath);
    }
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
      ({ parentPath } = parentPath);
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
  // free function `fn?.()` or a receiver-key chainStart), leaving the caller's plain-memo path
  function rewriteOptionalMethodCall(chainStart, key, scope, memoType) {
    const calleePath = key === 'callee' ? peelSkippableWrapperPath(chainStart.get(key)) : null;
    if (!calleePath || (!calleePath.isMemberExpression() && !calleePath.isOptionalMemberExpression())) return null;
    const receiverNode = calleePath.node.object;
    const methodNode = t.cloneNode(calleePath.node);
    let callReceiver;
    let receiverMemo = null;
    if (t.isSuper(receiverNode)) {
      callReceiver = t.thisExpression();
    } else if (isReusableReceiver(receiverNode)) {
      callReceiver = t.cloneNode(receiverNode);
    } else {
      const [assign, receiverRef] = memoize(receiverNode, scope, chainStart.node);
      // the memo may hold a resolvable surface (a proxy global, or a CTOR read off one):
      // tag the ref so the re-traversed method read keeps resolving through it
      // (`_ref = (t = _globalThis, _globalThis).Array` serves `_ref?.from` -> `_Array$from`)
      tagProxyGlobalMemoRef(receiverRef, receiverNode, scope);
      receiverMemo = assign;
      callReceiver = t.cloneNode(receiverRef);
      // rebind the method's receiver to the memoized ref so it (and any inner `?.`) evaluates once
      methodNode.object = t.cloneNode(receiverRef);
      // a receiver carrying its OWN live `?.` short-circuits the whole chain, so reading the
      // method off its memo must short-circuit too - otherwise the guard test throws where
      // native yields undefined
      if (receiverCarriesLiveOptional(receiverNode)) {
        methodNode.type = 'OptionalMemberExpression';
        methodNode.optional = true;
      }
    }
    const [methodMemo, methodRef] = memoize(methodNode, scope, chainStart.node);
    chainStart.node.callee = t.memberExpression(seededRefClone(methodRef, memoType), t.identifier('call'));
    chainStart.node.arguments = [callReceiver, ...chainStart.node.arguments.map(arg => t.cloneNode(arg))];
    // when recv is memoized, fold its assignment ahead of the method memo so it runs first
    return receiverMemo ? t.sequenceExpression([receiverMemo, methodMemo]) : methodMemo;
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
    let name = null;
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
  function navGuardTestNode(node, anchorPath, plan = null, guardObject = null, { detached = false } = {}) {
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
    // the test takes the PLAN's own value: a read no deeper than the environment probe off the
    // ponyfill. spelling the source instead dereferences a value that is undefined off-window and
    // throws THERE - inside the polyfilled output, which the ponyfill exists to keep working - so a
    // seal is no reason to keep it: the seal decides where a `?.` guards, not whether hops collapse.
    // a hop-object SEQUENCE still rides the source spelling: the plan renders the VALUE and its
    // prefix has no slot there, so taking it dropped the effect entirely (`(n++, gw).self?.X`)
    const testPrefix = guardObject
      ? navHopSequencePrefixes(guardObject, { unwrap: unwrapRuntimeExpr }).all : [];
    // ... with ONE exception, and it is the seal canon, not a spelling preference: a chain that READS
    // THROUGH a seal over a short-circuit performs that read itself (`((w = gw).window?.self).Symbol`
    // throws off-window), and collapsing the test both erases the throw and drops the write the
    // source performs on the way. keep the source spelling there - what the unplugin leg spells too
    if (guardObject && injectPureGlobal
      && !chainReadsThroughSeal(guardObject, resolvePure, ctx)) {
      // the plan models PROXY hops, so a guard object ending in a claim hop (`(gw).self.Array`) has
      // none - peel those keys off, plan the navigation under them, and hang them back on the
      // collapsed value. left unpeeled the test spelled the source chain and threw off-window
      let testRoot = guardObject;
      const rehang = [];
      // this caller re-emits the peeled prefix itself (below), so it may ask the plan to own a
      // sequence root and descend past its tail - the opt-in the probe channels use for the same reason
      function planFor(root) {
        return planProvenNavGuardCollapse({ rootNode: root, ...ctx, resolvePure,
          allowSequenceRoot: true, descendSequenceTail: true });
      }
      let testPlan = planFor(testRoot);
      while (!testPlan && !rehang.length
        && (testRoot.type === 'MemberExpression' || testRoot.type === 'OptionalMemberExpression')
        && !testRoot.computed && testRoot.property?.type === 'Identifier') {
        rehang.unshift({ name: testRoot.property.name, optional: !!testRoot.optional });
        testRoot = unwrapRuntimeExpr(testRoot.object);
        testPlan = planFor(testRoot);
      }
      // an OBSERVABLE root below the hops - a write, a sequence prefix, an effect-bearing call - is
      // spelled by nothing here: this collapse replaces the whole prefix and has no slot for it, so
      // taking it deletes an assignment the source performs (`((w = globalThis).self.window?.self)
      // ?.Array.of` left `w` unwritten) or reorders an effect past a read that throws. keep the
      // source spelling there - the owner-decided base price buys an always-defined base, not this
      if (testPlan && !testPlan.topAssign && testPlan.leafPure) {
        // the WRITE below the hops is what the collapse replaces along with them, and it is the
        // source's own first act: it rides INSIDE the collapsed value, ahead of the leaf, so the
        // hops above read off the ponyfill and the store still happens where the source performs it
        // (`(u = _globalThis, _self).window` - the unplugin leg's own spelling). declining the collapse
        // for it instead left `_globalThis.self` standing: a host read off the ponyfill, undefined
        // in exactly the realms the polyfill exists for
        let spelled = injectPureGlobal(testPlan.leafPure.entry, testPlan.leafPure.hintName);
        // the prefix wraps the LEAF, not the whole read: `(dh(), _self).window` is the spelling both
        // emitters keep for a collapsed sequence root, and hanging the hops outside it is what makes
        // the two legs print the same bytes
        if (testPlan.rootAssign || testPrefix.length) {
          spelled = t.sequenceExpression([...testPrefix.map(expr => t.cloneNode(expr)),
            ...testPlan.rootAssign ? [t.cloneNode(testPlan.rootAssign, true)] : [], spelled]);
        }
        for (const hop of [...testPlan.hops.slice(testPlan.collapseIdx + 1), ...rehang]) {
          spelled = hop.liveOptional
            ? t.optionalMemberExpression(spelled, t.identifier(hop.name), false, true)
            : t.memberExpression(spelled, t.identifier(hop.name));
        }
        markGuardTestRendered(spelled);
        return spelled;
      }
    }
    // `detached`: the caller's own render lifts this test out of the tree, so no visitor reaches
    // its root again - a raw `globalThis` frozen there is a ReferenceError on exactly the engines
    // the ponyfill serves. an ATTACHED test keeps the live node, whose root substitutes on re-entry
    const clone = detached
      ? cloneWithSubstitutedProxyRoot(node, anchorPath ?? ctx.path, { t, resolvePureGlobalEntry, injectPureGlobal })
      : t.cloneNode(node, true);
    const dead = vestigialNavOptionals(clone, resolvePure, ctx);
    // a nav BURIED in a call root still owes its own collapse, and the claim's walk already marked
    // the original subtree handled - handing that back freezes it raw while the unplugin emitter renders
    // it. the clone resets identity, so the visitors re-enter and spell the same guard there
    if (!dead.length) {
      const { root } = descendToChainRoot(node, true);
      const buriedCall = (root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression')
        && inlineCallProxyGlobalRoot({ callNode: root, ...ctx });
      return markGuardTestRendered(detached || buriedCall ? clone : node);
    }
    for (const hop of dead) {
      hop.type = 'MemberExpression';
      delete hop.optional;
    }
    return markGuardTestRendered(clone);
  }

  // the AST spelling of a nav-collapse plan: the leaf and its tail are the canon's, this binding
  // clones its host nodes into them and keeps the traversal bookkeeping the canon knows nothing of
  function renderNavCollapseAst(plan, pureId) {
    function cloneHost(node) {
      return hostSlot(t.cloneNode(node));
    }
    // the flush may land in a suppressed region no visitor re-enters, so the render reads the
    // key effects through the plan's LIVE accessor - the one liveness rule both emitters share.
    // the test's share is already inside the rendered prefix - only the hops ABOVE it re-emit here
    const leaf = renderNavCollapseLeaf(plan, cloneHost(pureId), { cloneHost });
    const tailHops = plan.hops.slice(plan.collapseIdx + 1);
    // the TAIL hangs off the leaf INSIDE the guarded alternate (`null == X ? void 0 : _self
    // .window`) - hung off the whole ternary it would read `.window` off the short-circuited
    // void 0. the sequence / bare spellings keep the tail outside (`(dh(), _self).window`)
    function withTail(base) {
      if (!tailHops.length) return estreeToBabel(base);
      const built = renderNavCollapseTail(plan, base, { cloneHost });
      // a live `?.` in the tail is spelled as the estree chain the converter lowers to babel's
      // Optional* dialect - a bare optional member has no meaning on that side
      const out = estreeToBabel(tailHops.some(hop => hop.liveOptional) ? chainExpression(built) : built);
      // the render already decided each hop's fate; re-entering the traversal they would look
      // like fresh redundant hops and collapse against a receiver the plan never chose
      for (let cur = out, left = tailHops.length; left > 0; left--, cur = cur.object) renderedPlanTails.add(cur);
      return out;
    }
    function collapsedTestNode() {
      const base = navGuardTestBase(plan);
      if (!base) return null;
      // the WRITE below the hops is replaced along with them, and it is the source's own first act:
      // it rides INSIDE the collapsed value, ahead of the base, so the probe reads off the ponyfill
      // and the store still happens where the source performs it (`(w = _globalThis, _self).window`)
      return estreeToBabel(renderNavGuardTestBase(base, {
        rootAssign: plan.rootAssign,
        injectImport: (entry, hintName) => injectPureGlobal(entry, hintName).name,
        embed: hostSlot,
      }));
    }
    function keptPrefix(node) {
      return navGuardTestNode(node, null, plan);
    }
    if (plan.kind === 'nested') {
      // the deferred flush may land inside a SUPPRESSED guard region no visitor re-enters, so
      // the proven root substitutes EAGERLY in the test - a raw `globalThis` frozen there reads
      // the engine global where the ponyfill belongs. an ALIAS root keeps its name (its own
      // declaration is rewritten where it lives); the injected binding survives any re-visit
      if (plan.rootId?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(plan.rootId.name)) {
        const rootPure = plan.resolvePure({ kind: 'global', name: plan.rootName });
        if (rootPure) plan.rootId.name = injectPureGlobal(rootPure.entry, rootPure.hintName).name;
      }
      // a DEEP CLONE resets node identity: the original prefix members were marked handled by
      // the claim's own walk, so the flush requeue would skip their subtree and freeze a prefix
      // effect's polyfill raw (`arr.at(0)` in the test); fresh nodes re-enter the visitors
      const probeTest = collapsedTestNode()
        ?? t.cloneNode(keptPrefix(plan.hops[plan.lastUnresolvableIdx].node), true);
      const wrapAssign = plan.assignWrap;
      return estreeToBabel(renderShortCircuitGuard(
        nullFirstGuardTest(wrapAssign
          ? t.assignmentExpression(wrapAssign.operator, t.cloneNode(wrapAssign.left), probeTest) : probeTest,
        { embed: hostSlot }), hostSlot(withTail(leaf))));
    }
    if (plan.kind === 'sequence') {
      // a SEQUENCE root carries only its PREFIX expressions into the render: the sequence's own
      // tail is the proxy-root read the collapse replaces - re-emitting the whole sequence left
      // it as a dead middle element dragging a dead import (`(se, _globalThis, _self)` where the
      // unplugin emitter spells `(se, _self)`). every other 'sequence' root (a chain-assign write,
      // an effectful call) IS the effect and re-emits whole
      const rootValue = plan.seqRoot
        ? plan.rootValueNode.expressions.slice(0, -1).map(expr => keptPrefix(expr))
        : [keptPrefix(plan.rootValueNode)];
      // the leaf FLATTENS into the root's own sequence - nested it would print its own parens
      const leafParts = leaf.type === 'SequenceExpression' ? leaf.expressions : [leaf];
      return withTail(sequenceExpression([...rootValue.map(expr => hostSlot(expr)), ...leafParts]));
    }
    return withTail(leaf);
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
  // lands in the same slot so the prefix keeps running where the source wrote it - replacing the
  // whole value dropped its effects. the descent is the PLAN's own peel, replayed by its keys:
  // walking raw `SequenceExpression` nodes instead read a parser that KEEPS wrapper nodes as
  // "nothing to descend" and landed on the whole value. only where the plan says it peeled: a plan
  // that read the whole value re-emits the effects itself, and its render owns the whole slot.
  // every channel that writes a stored value goes through here - in place, at the host's exit, and
  // at the program-exit backstop
  function landStoredValue(plan, step, rendered) {
    let holder = step;
    let key = 'right';
    if (plan.storedValueSeqDescended) {
      for (const next of receiverSequenceTailKeys(step.right)) {
        holder = holder[key];
        key = next;
      }
    }
    holder[key] = rendered;
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
    const composed = resolvePureGlobalEntry && composableNavGuardPlan(chainStart.node[key], {
      scope: path.scope, adapter: getAdapter?.(), path,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, path),
    });
    if (!composed) return null;
    chainStart.node[key] = seededRefClone(
      injectPureGlobal(composed.pure.entry, composed.pure.hintName), memoType);
    deoptionalizeNode(chainStart);
    for (let up = chainStart.parentPath; up && up !== path; up = up.parentPath) {
      if (isOptionalNode(up.node)) deoptionalizeNode(up);
    }
    return t.cloneNode(composed.probe);
  }

  // one dug assignment's collapse: plan, then render - immediately in place, or deferred to
  // the assignment's own exit flush. true only when a render actually landed
  function collapseKeptChainAssign(rootNode, anchorPath, { immediate = false } = {}) {
    const adapter = getAdapter?.();
    // the whole resolver-option family or nothing: this one omitted `injectPureGlobal` while
    // calling it at the tail, so a harness wired with only some of them would TypeError there
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return;
    const plan = planProvenNavGuardCollapse({
      rootNode, scope: anchorPath.scope, adapter, path: anchorPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, anchorPath),
      allowSequenceRoot: true, storedValueSequenceTail: true,
    });
    if (!plan?.topAssign) return;
    const { leafPure: pure } = plan;
    // a stored nav that cannot SHORT-CIRCUIT is the proxy global it navigates, so the value slot takes
    // the plan's VALUE, not its guarded render: spelled as a guard the store read `window` off the
    // ponyfill and handed the user's variable `void 0` off-window, where the same nav read bare answers
    // the ponyfill leaf. effect-free, identifier-rooted plans only - a sequence prefix, a key SE and an
    // effectful root all re-emit INSIDE the guarded render, and the claims living in them go with it
    // the WRITE observes the raw read by construction - this channel exists for it - so the value
    // question is asked with that flag: the proxy spine below the probe hop is one surface here,
    // where a plain read of the same nav folds it whole
    // the verdict is the PLAN's - see `storedValueFormSpells`. this channel only renders it
    const { storedValueSpells } = plan;
    // a channel that OWNS the assignment's emission (the unguarded static claim re-emits it as a
    // side effect, possibly on a REBUILT receiver whose nodes the deferred flush can never match
    // by identity) collapses in place: the caller replaceWith-inserts the host right after, so
    // the render re-enters traversal and the ES5 lowerings still visit it.
    // the render replaces the INNERMOST `=` step's value slot - the plan peels the whole `=`
    // chain to the nav, so writing the OUTER right would obliterate every mid-chain write
    // (`q = w = nav` must keep `w =`)
    // a render that has to CARRY a source subtree - a surviving hop's computed key with effects in
    // it - cannot land in the IMMEDIATE path while the host is LIVE in the tree: that write is a raw
    // slot mutation, so the traversal keeps its queued paths into the subtree it detaches and
    // reaches a claim inside that key only as an ORPHAN (`[(log.push(1), 'window')]` kept its raw
    // `push`, the polyfill silently missing from the output). such a plan takes the deferred flush
    // instead - it renders at the host's own exit, after those claims landed, reading the key
    // through the plan's live accessor, exactly as the queue's own snapshot rule intends.
    // a host that is NOT reachable from the anchor is a CLONE this channel owns (the receiver copy
    // an emit builds): the flush could never match it by identity, and the original subtree - with
    // the claim in it - is still in the tree being visited, so rendering now loses nothing
    const carriesSourceKey = plan.hops.some((hop, i) => hop.keySeExprs && i > plan.collapseIdx);
    let hostIsLive = false;
    if (carriesSourceKey) {
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
        && hasDeferredContextAncestor(t, up) && ctorClaimOwnsStore(up.parentPath, anchorPath);
      break;
    }
    if (immediate && !deferToFlush && !(carriesSourceKey && hostIsLive)) {
      // the stored-canon render is MARKED: for classification it IS the navigation it
      // replaced, so the provider's alias follows bypass the guarded-read gate on it (a
      // user-written conditional never gets the mark and keeps the gate)
      landStoredValue(plan, plan.topAssignSteps.at(-1), markRenderedStoredValue(storedValueSpells
        ? navPlanValueAst(t, plan, injectPureGlobal(pure.entry, pure.hintName), renderedPlanTails)
        : renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName))));
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
    // a SEQ-rooted plan keeps LIVE references instead of the snapshot: its prefix expressions
    // carry their own pending claims (`arr.at(0)` polyfills after this queue point but before
    // the assignment's exit, where the primary flush lands - children complete first), and a
    // clone taken now would freeze them raw. the program-exit backstop skips these plans (see
    // `flushKeptNavCollapses`) - by then the lowering may have moved what they reference
    if (!plan.seqRoot) {
      if (plan.kind === 'nested') {
        const hop = plan.hops[plan.lastUnresolvableIdx];
        const testNode = snapshotNavRenderNode(hop.node);
        if (!testNode) return;
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
    pendingKeptNavCollapses.push({ plan, storedValueSpells, pureId: injectPureGlobal(pure.entry, pure.hintName) });
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

  function collapseShortCircuitNavInPlace(memberPath) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return false;
    const parent = memberPath.parentPath;
    // a MEMBER consumer means this is not the chain end (the caller climbs there); a CALL
    // consumer is fine - claims over the chain ran before the drive (they sit above the root
    // in traversal order), so a surviving call tail is claimless and rides the chain's own
    // short-circuit outside the render
    if ((parent?.isMemberExpression() || parent?.isOptionalMemberExpression())
      && parent.node.object === memberPath.node) return false;
    // this render spells a SHORT-CIRCUIT: a nav whose value cannot take one has no branch for it to
    // build, and the plain hop collapse owns the run instead (a chain-END member that is itself a
    // pristine proxy hop is the same question - it belongs to the alias / kept canons unless the
    // nav's own value short-circuits). asked of the whole nav through the value canon, so a DEEPER
    // unbacked hop folds like its plain twin instead of earning a probe guard over a read that
    // cannot be absent
    // a KEPT WRITE inside the nav OBSERVES its raw read, so the spine below the probe hop counts
    // as one surface there - the store canon, asked with the flag the value canon reads
    const navObserved = !!peelChainAssignment(unwrapRuntimeExpr(memberPath.node.object)).outer;
    if (!navValueCanShortCircuit(memberPath.node, ({ name }) => resolvePureGlobalEntry(name, memberPath),
      { scope: memberPath.scope, adapter, path: memberPath },
      { throughChainAssign: true, observableRead: navObserved })) return false;
    if (claimBelowEndOwnsChain(memberPath, adapter, resolvePureGlobalEntry, resolvePureStaticEntry)) return false;
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
      const plan = planProvenNavGuardCollapse({
        rootNode: navNode, scope: memberPath.scope, adapter, path: memberPath,
        resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath),
      });
      return plan && !plan.topAssign && plan.kind === 'nested' ? plan : null;
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
    function pullUnplannedTail(pullFrom, plan, rendered) {
      if (plan.kind !== 'nested') return false;
      // collect the chain steps leaf-outwards, then let the shared rule say how many ride inside
      const paths = [];
      for (let hop = pullFrom; hop?.node;) {
        // a hop the guard channel already lifted into a ternary alternate answers from its OLD
        // slot: the node moved without a path replace, so the cached path has no container left.
        // the chain ends there - the lifted spelling owns everything above it
        if (!hop.container) break;
        const isCall = hop.isOptionalCallExpression() || hop.isCallExpression();
        if (!isCall && !hop.isOptionalMemberExpression()) break;
        if (isCall && hop.node.callee !== paths.at(-1)?.node) break;
        // PARENS between the callee and its call keep the chain's REFERENCE (`(w?.self.fn)()`
        // still binds `this`), while ending the short-circuit: folding either the call or the
        // member it reads leaves the callee with a bare value. hand the whole tail back to the
        // lifted spelling, which preserves both
        if (isCall && isWrappedInParens(hop.get('callee'))) return false;
        paths.push(hop);
        const up = hop.parentPath;
        hop = up?.node && (up.node.object === hop.node || up.node.callee === hop.node) ? up : null;
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
      // hand the WHOLE chain back to the lifted spelling, where the `?.` re-creates the source
      // short-circuit (`delete` on a short-circuited chain is a no-op `true`).
      // (`new` reads only the VALUE, so it pulls freely)
      for (let step = paths.at(-1)?.parentPath; step?.node; step = step.parentPath) {
        if (TS_EXPR_WRAPPERS.has(step.node.type)) continue;
        if (step.isUnaryExpression({ operator: 'delete' })) taken = 0;
        if (!step.isOptionalMemberExpression() && !step.isMemberExpression()
          && !step.isOptionalCallExpression() && !step.isCallExpression()) break;
      }
      // a TAGGED template reads its tag as a REFERENCE (`(w?.self.tag)`x`` binds `this`), so a
      // folded tail hands it a bare value - the receiver is lost exactly as under a
      // parenthesized callee. leave the whole tail outside and PLAIN: the source parens ended
      // the chain, so the read off `void 0` throws exactly where the source does
      if (paths.some(path => path.parentPath?.isTaggedTemplateExpression())) {
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
      paths[taken - 1].replaceWith(rendered);
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
        if (!plan) return false;
        break;
      }
      plan = planFor(navSlotPath(target).node);
    }
    // the plan calls a hop a PROBE when its name resolves to no ponyfill, but the boundary is
    // positional: only the FIRST hop off the root reads the host environment, a deeper one is a
    // realm self-reference the collapse assumes present. the plan cannot tell them apart because
    // the discriminator lives ABOVE it - a seal over the chain makes every short-circuit below
    // observable, and only this caller can see one. unsealed and deep: no probe to guard, so the
    // redundant hops go to the shared collapse instead, which is where the unplugin emitter takes them
    // a nav with NO live `?.` has no short-circuit for a guard to reproduce, so it collapses - what
    // the bare-root spelling of the same source already does through the earlier hop-collapse drive.
    // that drive declines a proven-CALL root, and this render was answering for it with a guard
    const plainNav = plan.hops.every(hop => !hop.optional && !hop.liveOptional);
    if ((plan.lastUnresolvableIdx > 0 || plainNav && !plan.rootId && plan.call) && collapseReceiverHops
      && !chainReadsThroughSeal(memberPath.node, ({ name }) => resolvePureGlobalEntry(name, memberPath),
        { scope: memberPath.scope, adapter, path: memberPath })) {
      const collapsed = collapseReceiverHops(memberPath.node.object, memberPath);
      if (collapsed) {
        memberPath.get('object').replaceWith(collapsed);
        return true;
      }
    }
    // a PLAIN navigation on a proven-CALL root that the hop drive could not take (an all-proxy
    // receiver under a non-global key): nothing short-circuits, so the doctrine collapses it - onto
    // the ROOT ponyfill, the same answer the bare-root spelling of this source gives
    if (plainNav && !plan.rootId && plan.call && plan.rootName && !plan.topAssign
      && !plan.keySeExprs.length && !plan.seqAroundPrefix?.length && !plan.rootEffectCall) {
      const rootPure = plan.resolvePure({ kind: 'global', name: plan.rootName });
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
    // ... EXCEPT where a live `?.` NAMES the unresolvable hop: there the guard decides whether the
    // delete happens at all, and the canon keeps it - that shape falls through to the render below
    // ... asked of the hops the fold REPLACES, not of the tail it re-hangs: a `?.` up there rides
    // the spelling the fold leaves behind, which is what the other roots of this shape already print
    const deleteFolds = deleteHostAboveChain(memberPath, memberPath.node, unwrapRuntimeExpr)
      && plan.hops.slice(0, plan.collapseIdx + 1)
        .every(hop => !hop.optional || !!plan.resolvePure({ kind: 'global', name: hop.name }));
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
    const rendered = renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName));
    // a SEQUENCE stands between the render's landing slot and the steps above it, so the tail pull
    // has no contiguous chain to walk there - the prefix keeps the tail outside, as the source spells it
    if (!peelSkippableWrapperPath(target.get('object')).isSequenceExpression()
      && pullUnplannedTail(target, plan, rendered)) return true;
    // parens directly around the RENDERED nav end the chain there, so the read above them is the
    // source's own throw. parens further out (around a tagged template's whole tag) do not - the
    // short-circuit still reaches them, and a plain read would throw before the template's own
    // substitutions ever run
    // through the canon that knows BOTH paren spellings: read off the flag alone this answered false
    // under `createParenthesizedExpressions`, and the same source then lifted the sealed member to
    // `?.` in one parser mode and kept it plain in the other - a SEMANTIC split, not a shape one
    const sealedObject = isWrappedInParens(target.get('object'));
    navSlotPath(target).replaceWith(rendered);
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

  // guard-value render of a bare undefinable probe nav (`globalThis.window?.self` and its
  // sealed spelling) as a NODE: the shared plan's 'nested' collapse (`null == _globalThis
  // .window ? void 0 : _self`), for channels re-emitting a discarded probed nav - the
  // anchored destructure residual base. null when the plan does not resolve this shape
  // (no ponyfillable leaf / assign-wrapped / SE hop key) - callers keep their defined-nav
  // renders there
  function probedNavGuardValueNode(rootNode, anchorPath) {
    const adapter = getAdapter?.();
    if (!adapter || !anchorPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const plan = planProvenNavGuardCollapse({
      rootNode, scope: anchorPath.scope, adapter, path: anchorPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, anchorPath),
    });
    // a nav the collapse plan does not own AT ALL (its explicit declines - kept assign /
    // sequence root / SE key - keep their reasons) still has two guarded spellings:
    //   - a SEALED read (`(globalThis.window?.self).Array` - the seal makes the read
    //     observable): the boundary probe IS the guarded value, `(null == ... ? void 0 :
    //     _self).Array` throws exactly where the source does;
    //   - a leaf that is a claimable constructor (`globalThis.window?.Array`): the two-halves
    //     guard - the erase verdict's `?.` object as the test, the ctor ponyfill alternate
    if (!plan) {
      const boundaryProbe = sealedChainBoundary(rootNode)
        ? sealedClaimThrowProbeNode(anchorPath, rootNode) : null;
      if (boundaryProbe && !boundaryProbe.keySeExprs.length) {
        return { node: boundaryProbe.node, rootEffectCall: null };
      }
      const leafGuard = sealedClaimLeafGuardNode(rootNode, anchorPath,
        { scope: anchorPath.scope, adapter, path: anchorPath }, { probeLeaf: true });
      return leafGuard ? { node: leafGuard, rootEffectCall: null } : null;
    }
    if (plan.topAssign || plan.kind !== 'nested' || plan.keySeExprs.length) return null;
    const { leafPure: pure } = plan;
    // CLONE the guard-test prefix and PRE-substitute its proxy root: the caller discards
    // (skip-seeds) the original init subtree and may insert this render only at program
    // exit, so neither the live node nor the clone ever meets the natural identifier
    // rewrite - a raw `globalThis` would ride into the test (ie11 ReferenceError)
    const hop = plan.hops[plan.lastUnresolvableIdx];
    plan.hops[plan.lastUnresolvableIdx] = {
      ...hop,
      node: cloneWithSubstitutedProxyRoot(hop.node, anchorPath, { t, resolvePureGlobalEntry, injectPureGlobal }),
    };
    // the render runs an effect-bearing CALL root exactly once inside the test - report it
    // so destructure replay channels filter it out instead of re-running it
    return { node: renderNavCollapseAst(plan, injectPureGlobal(pure.entry, pure.hintName)), rootEffectCall: plan.rootEffectCall ?? null };
  }

  // a RECEIVERLESS static erase loses the read the source performs on a value that can be
  // absent - through a SEAL (`(globalThis.window?.self.window).Array.of(6)` - an absent `window`
  // throws at `.Array` where the erased claim just runs). build that read back as a THROW
  // PROBE the erase re-emits ahead of the claim: the sealed value renders through the shared
  // guard plan (probe test, ponyfill leaf), the member key re-spells the source read. an
  // SE-bearing computed key stays with its own migration canon (a re-read would double its
  // effect), and a defined sealed value (all-plain nav) has no throw to reproduce - both bail
  function sealedClaimThrowProbeNode(memberPath, probeNode = null) {
    const adapter = getAdapter?.();
    if (!adapter || !memberPath?.scope || !resolvePureGlobalEntry || !injectPureGlobal) return null;
    const boundary = sealedChainBoundary(probeNode ?? memberPath.node);
    if (!boundary) {
      return aliasHeldClaimProbeNode(memberPath, probeNode ?? memberPath.node,
        { t, adapter, resolvePureGlobalEntry, mintedEffectNodes });
    }
    const key = memberKeyName(boundary.member);
    if (key === null) {
      return aliasHeldClaimProbeNode(memberPath, boundary.member,
        { t, adapter, resolvePureGlobalEntry, mintedEffectNodes });
    }
    const aliasCtx = { scope: memberPath.scope, adapter, path: memberPath };
    if (!proxyReceiverValueCanBeUndefined(boundary.inner,
      ({ name }) => resolvePureGlobalEntry(name, memberPath), aliasCtx, { throughChainAssign: true })) return null;
    const plan = planProvenNavGuardCollapse({
      rootNode: boundary.inner, scope: memberPath.scope, adapter, path: memberPath,
      resolvePure: ({ name }) => resolvePureGlobalEntry(name, memberPath), throughKeptAssign: true,
      allowSequenceRoot: true, descendSequenceTail: true,
    });
    // the plan renders a guard whose LEAF is a proxy hop; a sealed nav that ends AT the claim
    // (`(globalThis.window?.Array).of`) has none, and the read the seal makes observable would be
    // dropped. build the same shape from its two halves - the erase verdict's `?.` object as the
    // test, the claim's own ponyfill as the always-defined alternate
    const rendered = plan && !plan.topAssign && plan.kind === 'nested'
      ? renderNavCollapseAst(plan, injectPureGlobal(plan.leafPure.entry, plan.leafPure.hintName))
      : sealedClaimLeafGuardNode(boundary.inner, memberPath, aliasCtx);
    // a seal the guard renders cannot own (a value-transparent layer over a bare alias -
    // `(a as any).of`) hides no short-circuit: the alias question stands, fall through to it
    if (!rendered) {
      return aliasHeldClaimProbeNode(memberPath, boundary.member,
        { t, adapter, resolvePureGlobalEntry, mintedEffectNodes });
    }
    // the probe CARRIES the nav's key SE (native order: test, key effect, read) - hand the
    // plan's SE nodes back so the claim's own SE channel does not re-run them
    // a SEQUENCE prefix inside the nav is dropped by the plan's transparent unwrap, and the effect
    // channel replays it AFTER the probe - where the probe's own throw never reaches it. the source
    // runs it BEFORE the read, so it is spelled here, ahead of the probe, and reported so no other
    // channel repeats it. only the prefix a hop OBJECT carries: the key effects the render already
    // spells inside its own alternate are not ours to repeat - nor is one the RENDERED test carries:
    // babel builds that test by cloning the source subtree, so a sequence inside its span comes along
    const bareRead = boundary.member.computed
      ? t.memberExpression(rendered, t.stringLiteral(key), true)
      : t.memberExpression(rendered, t.identifier(key));
    // a test synthesized from resolved names carries no source span - and no effects - so
    // everything is spelled ahead of it
    const testNode = rendered?.type === 'ConditionalExpression' ? rendered.test?.right : null;
    const navPrefix = navHopSequencePrefixes(boundary.inner,
      { unwrap: unwrapRuntimeExpr, renderedSpans: [nodeSpan(testNode)].filter(Boolean) });
    const probeRead = navPrefix.spell.length
      ? t.sequenceExpression([...navPrefix.spell.map(expr => t.cloneNode(expr)), bareRead]) : bareRead;
    return {
      // the guard test runs an effect-bearing CALL root exactly once - carry it like a key
      // SE so every consumer's identity filter keeps other channels from re-running it
      keySeExprs: [...plan?.keySeExprs ?? [], ...plan?.rootEffectCall ? [plan.rootEffectCall] : [],
        ...plan?.assignWrap ? [plan.assignWrap] : [], ...plan?.rootAssign ? [plan.rootAssign] : [],
        ...navPrefix.all],
      // the probe RENDERS the nav, so an effect the source wrote BEFORE it (a sequence prefix on
      // the receiver) still runs first - consumers split their residual effects on this position
      navStart: boundary.inner.start,
      node: probeRead,
    };
  }

  // the guarded VALUE of a sealed nav that ends AT a claim, as a NODE: the erase verdict names the
  // `?.` object to test, the claim's own ponyfill is the always-defined alternate. null when no
  // single `?.` expresses the short-circuit or the leaf resolves to no pure entry
  function sealedClaimLeafGuardNode(nav, anchorPath, aliasCtx, { probeLeaf = false } = {}) {
    const plan = sealedClaimLeafGuardPlan(nav, ({ name }) => resolvePureGlobalEntry(name, anchorPath), aliasCtx, { probeLeaf });
    const alternate = !plan ? null
      : plan.leafPure ? injectPureGlobal(plan.leafPure.entry, plan.leafPure.hintName)
      // the value IS the probe: the test operand doubles as the alternate (a second read of
      // the same slot, benign on the proxy globals every render here already reads freely)
      : plan.leafIsProbe ? cloneWithSubstitutedProxyRoot(plan.guardObject, anchorPath,
        { t, resolvePureGlobalEntry, injectPureGlobal })
      : t.isValidIdentifier(plan.leafName) ? t.identifier(plan.leafName) : null;
    if (!alternate) return null;
    // the guard OBJECT is what the test spells, so it is handed over as one too: without it the
    // shared spelling only clones the source, and a write below the hops kept `_globalThis.self`
    // standing there - a host read off the ponyfill, undefined in the realms the polyfill is for.
    // the operand is CLONED with its proxy root pre-substituted - consumers may insert this
    // render where no identifier rewrite runs again
    const testObject = cloneWithSubstitutedProxyRoot(plan.guardObject, anchorPath,
      { t, resolvePureGlobalEntry, injectPureGlobal });
    return estreeToBabel(renderShortCircuitGuard(
      nullFirstGuardTest(navGuardTestNode(testObject, anchorPath, null, testObject), { embed: hostSlot }),
      hostSlot(alternate)));
  }

  // does anything ABOVE the store observe its value's ABSENCE? a `?.` the source wrote over the
  // store, the null test a claim channel already emitted for it, or a test position all read the
  // store as a value that can be undefined - folding the nav to its always-defined value there
  // kills the very test. a plain read above it does not observe: it throws off-realm exactly as
  // the fold verdict accepts. the climb walks only value-transparent carriers, so the FIRST real
  // parent answers
  function storeAbsenceObservedAbove(assignPath) {
    for (let child = assignPath, up = child.parentPath; up?.node; child = up, up = up.parentPath) {
      const { node } = up;
      if (SKIPPABLE_WRAPPER_TYPES.has(node.type)) continue;
      // a sequence hands ITS TAIL on; an element before the tail is discarded, and a value nothing
      // reads is a value nothing can observe as absent
      if (node.type === 'SequenceExpression') {
        if (node.expressions.at(-1) !== child.node) return false;
        continue;
      }
      if (node.type === 'OptionalMemberExpression' || node.type === 'OptionalCallExpression') return true;
      if (node.type === 'BinaryExpression') {
        return (node.operator === '==' || node.operator === '!=' || node.operator === '===' || node.operator === '!==')
          && (isNullLiteralNode(node.left) || isNullLiteralNode(node.right) || isUndefinedNode(node.left)
            || isUndefinedNode(node.right));
      }
      return node.type === 'LogicalExpression' || node.type === 'ConditionalExpression'
        || node.type === 'UnaryExpression';
    }
    return false;
  }

  // flush THIS assignment's kept nav-collapse at its own EXIT: every claim resolver over the
  // chain ran during the subtree traversal (the reason the rewrite is deferred at all), and
  // `replaceWith` REQUEUES the render, so every remaining merged pass - the ES5 lowerings
  // included - still visits what it carries. nothing is ever inserted behind the lowering's
  // back (a Program-exit slot mutation froze an unlowered arrow from a kept call argument
  // into the ie11 output)
  function flushKeptNavCollapseAt(assignPath) {
    for (let i = 0; i < pendingKeptNavCollapses.length; i++) {
      const { plan, storedValueSpells, pureId } = pendingKeptNavCollapses[i];
      if (plan.topAssign !== assignPath.node) continue;
      pendingKeptNavCollapses.splice(i, 1);
      // the render lands in the INNERMOST `=` step's value slot - replacing the outer right
      // obliterated the mid-chain writes (`q = w = nav` lost its `w =`). a nested host is
      // mutated in place, then the outer right re-queues through replaceWith so the remaining
      // merged passes (ES5 lowerings included) still visit what it carries
      const host = plan.topAssignSteps.at(-1);
      // ... and the same tail landing at the flush: `assignPath.get('right')` is the whole stored
      // value, so a SEQUENCE there takes the render in its last expression
      // the VALUE / guard choice belongs to the plan, not to the route that reached it: rendering
      // the guarded form unconditionally spelled a stored PLAIN nav as a probe where the immediate
      // channel and the other emitter both hand the store the nav's own value
      const rendered = markRenderedStoredValue(storedValueSpells && !storeAbsenceObservedAbove(assignPath)
        ? navPlanValueAst(t, plan, pureId, renderedPlanTails)
        : renderNavCollapseAst(plan, pureId));
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
  // a SEQ-rooted plan holds live un-snapshotted references the lowering may have moved by
  // now - it flushes at its own exit or not at all (the raw spelling stays, claims intact)
  function flushKeptNavCollapses() {
    for (const { plan, pureId } of pendingKeptNavCollapses) {
      if (plan.seqRoot) continue;
      landStoredValue(plan, plan.topAssignSteps.at(-1), markRenderedStoredValue(renderNavCollapseAst(plan, pureId)));
    }
    pendingKeptNavCollapses.length = 0;
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
      { allowSideEffectKeys: true, throughChainAssign: true }) !== navNode) return null;
    // the hop fold holds only while the hops are ALWAYS DEFINED (a realm self-reference, a
    // ponyfilled forwarder). an UNRESOLVABLE hop is the environment probe itself - the one
    // value the guard exists for - so folding it out of the test leaves an always-defined
    // root under the null-check and runs the branch where the source short-circuits. keep
    // the whole nav in the memo there (the caller's plain memoize), like the unplugin emitter
    if (resolvePureGlobalEntry && navHasUnresolvableProxyHop(navNode,
      ({ name }) => resolvePureGlobalEntry(name, anchorPath))) return null;
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
    const [check, ref] = memoize(holder.object, scope, ownerNode);
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
      ? getAdapter?.()?.getBinding(path?.scope, root.name, path) : null;
    // an INJECTED import binding is the mark of a rendered nav; a source ALIAS of the surface
    // (`const ga = globalThis`) carries the same proxy hint and is still the source's own spelling
    if (rootBinding?.polyfillHint && rootBinding.importSource) return node;
    if (path && deleteHostAboveChain(path, path.node, unwrapRuntimeExpr)) return node;
    for (let hop = nav; hop?.type === 'MemberExpression' || hop?.type === 'OptionalMemberExpression';
      hop = unwrapRuntimeExpr(hop.object)) releaseHandledNode(hop);
    return node;
  }

  function extractCheck(path, skipOptional) {
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
      // the substitution owes the HOP COLLAPSE too, not only the root: a redundant proxy hop left
      // above the pure binding reads an engine `self` off it (undefined off-browser), so the test
      // fires where the collapsed spelling - the one the unplugin emitter prints for this same nav -
      // answers. only a tail that is proxy navigation WHOLE collapses; anything else keeps its shape
      // the tail sits at the bottom of the NESTED sequences, which is also the slot to write
      let seq = core;
      for (;;) {
        const next = unwrapRuntimeExpr(seq.expressions.at(-1));
        if (next?.type !== 'SequenceExpression' || !next.expressions.length) break;
        seq = next;
      }
      const tail = unwrapRuntimeExpr(seq.expressions.at(-1));
      const ctx = { scope: anchorPath.scope, adapter: getAdapter?.(), path: anchorPath };
      // a value that can be UNDEFINED at runtime is the environment probe itself (`globalThis
      // .window` off-browser, a live `?.` over such a read) - collapsing it to the always-defined
      // binding answers on the branch the source skips. THE shared verdict owns that question
      if (tail !== root && ctx.adapter && maximalProxyGlobalPrefix(tail, ctx) === tail
        && !proxyReceiverValueCanBeUndefined(tail, ({ name }) => resolvePureGlobalEntry(name, anchorPath), ctx)) {
        seq.expressions[seq.expressions.length - 1] = t.identifier(binding.name);
        return;
      }
      root.name = binding.name;
    }
    const { node } = path;
    if (node.optional) {
      // pass `path` as third arg so `skipPolyfillableOptional` can anchor TS-runtime
      // shadow detection at the reference site (path-aware `adapter.hasBinding`)
      if (skipOptional?.(node, path.scope, path)) return [null, node.object, false];
      collapseKeptNavValueNode(node.object, path);
      const navCheck = memoizeProxyNavRoot(node.object, path.scope, node, path);
      if (navCheck) return [navCheck, node.object, false];
      const memoNav = releaseReemittedReceiver(node.object, path);
      const [memoCheck, memoRef] = memoize(memoNav, path.scope, node);
      // a proven-nav memo RHS renders through the shared kept-nav plan (the memo assignment IS
      // the topAssign shape): the raw spelling would read `.self` off a defined receiver where
      // the ponyfill must back the read - the deferred flush swaps in the nested test. a nav
      // carrying its OWN chain-assign already planned through the entry call above - planning
      // the memo assign too would render over the user's write (the peel sees through both)
      if (!peelChainAssignment(memoNav).outer) collapseKeptNavValueNode(memoCheck, path);
      substituteKeptSeqProbeRoot(memoNav, path);
      return [memoCheck, memoRef, false];
    }
    if (!path.isOptionalMemberExpression()) return [null, node.object, false];
    let chainStart = null;
    // symmetric with `normalizeOptionalChain`'s parent-walk above. `throughTS` flag tracks
    // whether the INITIAL receiver was wrapped - signals `replaceAndWrap` to embed the
    // guard directly (path references would otherwise go stale on the two-step replace)
    let current = path.get('object');
    const throughTS = current.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(current.node.type);
    current = peelSkippableWrapperPath(current);
    while (isOptionalNode(current.node)) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      const next = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
      // re-peel transparent wrappers at every hop. mid-chain `!` (TSNonNullExpression)
      // between optional links (`arr?.b!.c.d.includes(2)`) would otherwise abort the
      // chain detection, emit without the null-check guard, and throw TypeError on null
      // arr where native short-circuits the entire chain to undefined
      current = peelSkippableWrapperPath(next);
    }
    if (!chainStart) return [null, node.object, throughTS];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`).
    // reassigning `chainStart.node[key]` swaps the receiver / callee with the memoized ref -
    // computed property nodes (`.property`) and call arguments (`.arguments`) on the same chainStart
    // remain untouched, so computed-property bootstrapping isn't disturbed
    let check = null;
    if (!skipOptional?.(chainStart.node, path.scope, chainStart)) {
      // IMMEDIATE: this caller owns the emission - it is about to memoize or guard the very node,
      // and the deferred flush renders the guarded form unconditionally, where the value form is
      // what a stored PLAIN nav owes (the fold verdict: that nav IS the realm)
      collapseKeptNavValueNode(chainStart.node[key], chainStart, { immediate: true });
      if (deoptDeadOptionalOverStore(chainStart, key, path)) return [null, node.object, throughTS];
      const memoType = pathType(chainStart.get(key));
      check = rewriteOptionalMethodCall(chainStart, key, path.scope, memoType);
      if (check === null) check = memoizeProxyNavRoot(chainStart.node[key], path.scope, chainStart.node, chainStart);
      if (check === null) {
        let ref;
        const rootNode = chainStart.node[key];
        const composedCheck = composeNavGuardCheck(chainStart, key, path, memoType);
        if (composedCheck) return [composedCheck, node.object, throughTS];
        const memoNode = releaseReemittedReceiver(rootNode, chainStart);
        [check, ref] = memoize(memoNode, path.scope, chainStart.node);
        chainStart.node[key] = seededRefClone(ref, memoType);
        tagProxyGlobalMemoRef(ref, memoNode, path.scope);
        // proven-nav memo RHS: render the nested test via the shared kept-nav plan (see the
        // optional-node arm above) instead of keeping the raw `.self`-reading spelling; an
        // own-chain-assign nav is owned by the entry call's plan
        if (!peelChainAssignment(memoNode).outer) collapseKeptNavValueNode(check, chainStart);
        substituteKeptSeqProbeRoot(memoNode, chainStart);
      }
    }
    deoptionalizeNode(chainStart);
    // `p && p !== path` guard: on orphaned paths parentPath chain can bottom out at null
    // before reaching `path`, which would infinite-loop the original `p !== path` test
    for (let p = chainStart.parentPath; p && p !== path; p = p.parentPath) {
      if (isOptionalNode(p.node)) deoptionalizeNode(p);
    }
    return [check, node.object, throughTS];
  }

  function replaceAndWrap({ replacePath, result, check, embedGuard }) {
    // user parens around the replaced expression terminate an optional chain (native throws
    // past them where the chain would short-circuit) - the paren info dies with the replaced
    // node, so record it on the replacement: the erase-refusal's guard climb must NOT hoist
    // a guard past this boundary (it would swallow the user-visible throw)
    if (isWrappedInParens(replacePath)) parenTerminated.add(result);
    // when check came through a TS wrapper (arr?.at(-1)!.includes), embed the guard
    // directly - Babel's path references become stale after replaceWith and the two-step
    // replace-then-wrap approach loses the guard. for normal chains (no TS wrapper),
    // use the two-step approach so normalizeOptionalChain correctly lifts the guard
    // past chain continuations like .valueOf(). `embedGuard` may pair with `check=null`
    // when `extractCheck` peeled a TS wrapper but `skipOptional` skipped the chainStart
    // (no memoize, no check) - emit plain `result` to avoid `wrapConditional(null,...)`
    // synthesising an invalid `null == null` BinaryExpression
    if (embedGuard) {
      replacePath.replaceWith(check ? wrapConditional(check, result) : result);
      normalizeOptionalChain(replacePath);
    } else {
      replacePath.replaceWith(result);
      // a replacement that introduced its OWN optional (`_X(recv)?.call(recv)` from an `arr.flat?.()`
      // optional CALL) leaves a trailing chain continuation (`...?.().next()` / `...?.().length`)
      // as an in-chain OptionalMember/Call straight from the parse - it must STAY optional to
      // short-circuit with the new `?.`. normalizeOptionalChain would deoptionalize the trailing
      // to a PLAIN member, and babel codegen then parenthesizes the optional result off it
      // (`(_X?.call(recv)).next()`), severing the trailing from the chain so it throws on the
      // short-circuit path where native yields void 0 (matches unplugin once skipped)
      if (result.type === 'OptionalCallExpression') {
        if (check) {
          // a receiver-level guard must wrap the whole SURVIVING chain: climb the NON-optional
          // in-chain continuations (`.x` / `[k]` / a call pairing with the climbed member) and
          // put the ternary around the tip, leaving the trailing links optional-typed inside it
          // so the live `?.` still short-circuits past them. a genuine `?.x` continuation
          // re-guards the ternary RESULT and stays outside; parens / casts end the chain at
          // parse, so the climb stops there and their native throw-past-boundary survives
          let tip = replacePath;
          for (;;) {
            const par = tip.parentPath;
            if ((par?.isOptionalMemberExpression() && !par.node.optional && par.node.object === tip.node)
              || (par?.isOptionalCallExpression() && par.node.callee === tip.node)) {
              tip = par;
              continue;
            }
            break;
          }
          tip.replaceWith(wrapConditional(check, tip.node));
          return;
        }
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
      const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
      if (check) {
        wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
      }
    }
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
    const seq = t.sequenceExpression([...sideEffects.map(e => mintedEffectNodes.has(e) ? e : t.cloneNode(e)), result]);
    pluginSeqWraps.add(seq);
    return seq;
  }

  // SE-receiver + key-SE reorder guard: a non-optional (`check` null) side-effecting receiver memo
  // would otherwise be built INSIDE the body, after the prepended key SE, running the key before
  // the receiver. memoize the receiver and prepend its assignment to the SE list so it evaluates
  // first (native order). returns `[receiverNode, sideEffects]` - the receiver ref to emit and the
  // reordered SE list. no-op for optional (receiver already memoized in the guard) / SE-free receivers
  function hoistReceiverSE(object, sideEffects, check, scope, seMode, receiverEffectCount = 0, anchorHostPath = null) {
    // skip the peel case: there the receiver-SE is already replayed in the SE list, and `object`
    // is the peeled tail - hoisting it would reorder the peeled prefix vs the tail (matches the
    // unplugin `seMode !== 'peel'` gate). a CHECK skips the hoist only when receiver-borne SE
    // exists (the guard's own memoize replays it); a KEY-only SE list still hoists - the
    // receiver must evaluate BEFORE the key effects, like native member-call evaluation order
    // optional guard with a side-effecting receiver: the guard's `null == (_ref = receiver) ? ...`
    // memoize already RAN the receiver-SE, so the body wrap must carry ONLY the key-SE. `suppress`
    // (optional MEMBER access) already reduced `sideEffects` to key-SE upstream, so pass it through;
    // otherwise the receiver-SE is still present (a deeper `?.` left `.X` non-optional, so suppress
    // missed it) and must be dropped here - else a chain-root call `(call)?.self.X` double-runs
    if (check && receiverEffectCount > 0) {
      return [object, seMode === 'suppress' ? sideEffects : keySideEffectsOnly(receiverEffectCount, sideEffects)];
    }
    if (seMode === 'peel' || !sideEffects?.length) return [object, sideEffects];
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
    if (!reEvaluationObservable(object) && !receiverMayThrow()) return [object, sideEffects];
    const [memoAssign, ref] = memoize(object, scope);
    // the memo `_ref = object` already evaluates the receiver's OWN side effects (a buried chain-root call
    // or hop-key SE the resolver also listed lives inside `object`), so re-emitting the receiver-SE prefix
    // would double-run it. append only the KEY SE (past receiverEffectCount); the memo owns the receiver SE
    return [ref, [memoAssign, ...sideEffects.slice(receiverEffectCount)]];
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
      && isWrappedInParens(path) && path.isOptionalMemberExpression();
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

  // parenthesized optional member followed by a NON-optional outer call: `(arr?.includes)(1)`.
  // native semantics:
  //   - arr nullish: `(undefined)(1)` -> TypeError ("not a function") - chain ENDS at `?.`,
  //     outer `()` is non-optional call on void 0
  //   - arr non-nullish: Reference Type preserves `this=arr` through parens (per ECMAScript
  //     spec on GroupingOperator, verified empirically: `([1,2]?.at)(0) === 1`)
  // emit `(arr == null ? void 0 : _includes(arr)).call(arr, 1)`:
  //   - nullish path: `(undefined).call(...)` accesses `.call` on undefined -> TypeError
  //     (matches native throw shape; "Cannot read properties of undefined" rather than "not
  //     a function" - both are TypeError, error message differs)
  //   - success path: `_includes(arr).call(arr, 1)` preserves `this=arr` (matches native)
  // args eval order: nullish path skips arg evaluation where native evaluates them. minor
  // divergence acceptable - the throw still fires; literal args (the common case) are
  // semantically identical
  // optional outer call `(arr?.at)?.(0)` goes through the standard buildMethodCall path
  // since Reference Type preserves through parens and short-circuits properly on nullish
  function replaceInstanceLike({ path, id, skipOptional, sideEffects, receiverEffectCount }) {
    const { seMode, effectiveSE } = applyReceiverSeMode(path, sideEffects, receiverEffectCount);
    const { callerPath, parent, isCall, isParenLookupOnly } = classifyCallerContext(path);
    const [check, extracted, embed] = extractCheck(path, skipOptional);
    // the unplugin emitter drops redundant proxy hops INSIDE its receiver render; this leg memoizes the
    // receiver raw and would keep them (`_ref.self.foo` - a native `self` read where its ponyfill
    // is the point). the whole receiver cannot collapse while its `?.` is live, but once the guard
    // memoized the root the tail hangs off a ref carrying that root's provenance and the shared
    // plan recognises it. hops ONLY: resolving a pure root here injects an import this channel
    // never decided on, which is exactly what an earlier unrestricted attempt did
    const object = (check && collapseReceiverHops?.(extracted, path, { hopsOnly: true })) || extracted;
    if (isParenLookupOnly) {
      // build `(check == null ? void 0 : _id(_ref = obj)).call(_ref, ...args)` so:
      //   - throw-on-nullish preserved: ternary -> void 0, `.call` access on undefined throws
      //   - `this`-binding-on-success preserved: `_ref` captures obj, `.call(_ref, ...)` binds it
      //   - obj evaluated ONCE: deep chains `(arr?.b.includes)(1)` would otherwise re-eval
      //     `arr.b` in callArgs (single-eval matters for receivers with side effects)
      // memoize unconditionally - bare Identifier hits `isReusableReceiver` and inlines without _ref
      const [objAssign, objRef] = memoize(object, path.scope, path.node);
      const lookup = t.callExpression(id, [objAssign]);
      // check=null path: extractCheck saw a polyfillable optional and skipped the null-guard
      // memo (replacement consumes `?.`). drop the ternary wrap to avoid synthesising an
      // invalid `null == null ? ...` BinaryExpression - mirrors the same `wrapConditional(
      // null, ...)` defense in `replaceAndWrap`.
      // when a nullish guard IS present, the receiver-derived SE (e.g. a computed key) must fire
      // only on the non-null branch - native short-circuits `?.` before evaluating the key. fold
      // the SE INTO the conditional alternate (`check==null ? void 0 : (SE, lookup)`); prepending
      // it to the whole result would fire it even on the short-circuit. no guard -> SE stays outside
      const wrappedCallee = check ? wrapConditional(check, withSideEffects(lookup, effectiveSE)) : lookup;
      const callArgs = [t.cloneNode(objRef), ...parent.arguments.map(a => t.cloneNode(a))];
      const result = t.callExpression(t.memberExpression(wrappedCallee, t.identifier('call')), callArgs);
      callerPath.parentPath.replaceWith(check ? result : withSideEffects(result, effectiveSE));
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
    const [recvNode, hoistedSE] = guardedRecv
      ? [guardedRecv.alternate, null]
      : hoistReceiverSE(object, effectiveSE, check, path.scope, seMode, receiverEffectCount, path);
    const built = isCall
      ? buildMethodCall({
        id,
        object: releaseReemittedReceiver(recvNode, path),
        scope: path.scope, args: parent.arguments, optionalCall: parent.optional, anchorNode: parent,
      })
      : t.callExpression(id, [cloneReceiverForEmit({ t, collapse: collapseKeptNavValueNode, node: recvNode, path, types: resolvedType })]);
    const result = guardedRecv
      ? markGuardedClaim(t.conditionalExpression(guardedRecv.test, guardedRecv.consequent, withSideEffects(built, effectiveSE)))
      : built;
    replaceAndWrap({
      replacePath: isCall ? callerPath.parentPath : path,
      result: withSideEffects(result, hoistedSE), check, embedGuard: embed,
    });
  }

  function replaceCallWithSimple(path, id, skipOptional, sideEffects, receiverEffectCount) {
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
      const [memoAssign, memoRef] = memoize(path.node.object, path.scope);
      const guardedSE = wrapConditional(memoAssign,
        withSideEffects(t.unaryExpression('void', t.numericLiteral(0)), effectiveSE));
      callerPath.parentPath.replaceWith(
        t.sequenceExpression([guardedSE, t.callExpression(id, [t.cloneNode(memoRef)])]),
      );
      return;
    }
    const [check, object, embed] = extractCheck(path, skipOptional);
    const [recvNode, hoistedSE] = hoistReceiverSE(object, effectiveSE, check, path.scope, seMode, receiverEffectCount, path);
    replaceAndWrap({
      replacePath: callerPath.parentPath,
      // wrap with the caller's accumulated side effects (e.g. computed-key SE from
      // detect-usage) so they don't drop when the original call is fully replaced
      result: withSideEffects(t.callExpression(id, [t.cloneNode(recvNode)]), hoistedSE),
      check, embedGuard: embed,
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

  function assignTo(ref, value) {
    return t.assignmentExpression('=', t.cloneNode(ref), value);
  }

  // Babel-style OR-chain for `(recv)?.inner?.(ia).outer(oa)`: runs outer directly on
  // `_m.call(_a, ia)` so value-undef (e.g. `[].at(99)`) reaches `_outer()` and throws
  // like native, while each `?.` contributes its own `null == ...` test.
  // the outer is a call OR a bare GET (`recv.m?.().at`) - `outerIsCall` says which, and a GET
  // ends the emit at the member itself, with no arguments to fold and no `.call` receiver.
  // the other leg re-implements the same combined chain: both build nodes now, and both spell
  // their tests through the render canon, but the shapes are built differently - this one
  // recurses (stacked optional-poly hops nest naturally), the other emits one flat OR-chain in
  // a single pass; semantically identical, and where the shape diverges the unplugin fixture
  // carries an output-unplugin.mjs sidecar
  function replaceInstanceChainCombined(outerPath, outerId,
    { innerCallee, innerArgs, innerId, chainStartNode, hasHops, sideEffects, outerIsCall = true, chainStartType,
      outerReturnType = null }) {
    const callerPath = peelParenAndTSSlotPath(outerPath);
    // a GET tail has no call to fold: the emit ends at the member itself, and the outer dispatch
    // is the bare helper read (`_at(recv)`) instead of `_at(recv).call(recv, args)`
    const outerCall = outerIsCall ? callerPath.parent : null;
    const emitPath = outerCall ? callerPath.parentPath : callerPath;
    const { scope } = outerPath;

    // a receiver carrying a LIVE `?.` short-circuits the WHOLE chain natively, so it must be
    // TESTED before the (nullish-intolerant) maybe-helper reads its member - the same shape an
    // optional method access already produces. a receiver WITHOUT one keeps the testless form:
    // `arr.flat?.()` must throw on the `.flat` read like native
    const receiverShortCircuits = receiverCarriesLiveOptional(innerCallee.object);
    const [anAssign, aRef] = memoize(innerCallee.object, scope, outerPath.node);
    const mRef = generateRef(scope, outerPath.node);
    const mCall = t.callExpression(
      t.memberExpression(t.cloneNode(mRef), t.identifier('call')),
      [t.cloneNode(aRef), ...innerArgs.map(a => t.cloneNode(a))]);
    if (chainStartType) resolvedType?.set(mCall, chainStartType);

    // `arr.flat?.()`: the `?.` guards the CALL, not the `.flat` access - reading `.flat` on a
    // nullish `arr` must THROW like native, so emit NO `null == receiver` test (it would swallow
    // the throw into void 0). guard the receiver only when ITS access is optional too
    // (`arr?.flat?.()`). either way the method-get assigns `mRef`; fold the receiver assignment
    // into it in the non-optional case so a non-bare receiver still evaluates exactly once
    const testsReceiver = innerCallee.optional || receiverShortCircuits;
    const methodGet = t.callExpression(t.cloneNode(innerId),
      [testsReceiver ? t.cloneNode(aRef) : anAssign]);
    const checks = testsReceiver ? [anAssign, assignTo(mRef, methodGet)] : [assignTo(mRef, methodGet)];
    // thread surviving non-optional hops (`.map(...)` between inner `flat?.()` and outer
    // `filter?.()`): splice the memoized inner result into the outer receiver sub-chain so the
    // hops re-emit (own pass polyfills them on the inner result) rather than being dropped
    let outerObject = hasHops ? spliceChainInner(outerPath.node.object, chainStartNode, mCall) : mCall;
    // `?.method` as outer: nullish receiver of the outer call must short-circuit it. capture
    // the hop-spliced `outerObject` (inner result + surviving non-optional hops), NOT the bare
    // `mCall` - testing/binding `mCall` would discard the hops (`arr.flat?.().map(f)?.at(0)`
    // would drop `.map(f)` and call `.at` on the flat() result). with no hops outerObject === mCall
    if (outerPath.node.optional) {
      const vRef = generateRef(scope, outerPath.node);
      checks.push(assignTo(vRef, outerObject));
      outerObject = t.cloneNode(vRef);
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
    const [outerRecv, foldedSE] = hoistReceiverSE(outerObject, sideEffects, null, scope);
    const replacement = withSideEffects(outerCall ? buildMethodCall({
      id: outerId, object: outerRecv, scope, args: outerCall.arguments, optionalCall: outerCall.optional,
      anchorNode: outerPath.node,
    }) : t.callExpression(t.cloneNode(outerId), [outerRecv]), foldedSE);
    // the OUTER call's own return type, the twin of `chainStartType` above: this node is what a
    // member ABOVE the chain reads off, and the caller's annotation cannot reach it (the render
    // replaces a different path). untyped there, the next claim resolved generic - `.name` off an
    // array value pulled the function-name ponyfill on this leg and on no other
    if (outerReturnType) resolvedType?.set(replacement, outerReturnType);
    // trailing NON-optional in-chain continuations (`...flat?.()?.at(0).length`) ride the
    // SUCCESS branch: native short-circuit skips them, while links left outside would apply
    // to the ternary result and throw on the void 0 path where native yields undefined. a
    // surviving optional continuation (`?.x`) guards the ternary RESULT and stays outside;
    // parens / casts end the chain at parse (plain Member parent), so the climb stops there
    // and their native throw-past-boundary semantics survive
    let tipPath = emitPath;
    for (;;) {
      const par = tipPath.parentPath;
      // a CALL continuation climbs even when ITS `?.(` is genuine: the call pairs with the
      // climbed member callee (severing them would strand `this` / sever later links), and
      // inside the alternate its own `?.` still short-circuits the rest of the chain
      if ((par?.isOptionalMemberExpression() && !par.node.optional && par.node.object === tipPath.node)
        || (par?.isOptionalCallExpression() && par.node.callee === tipPath.node)) {
        tipPath = par;
        continue;
      }
      break;
    }
    let alternate = replacement;
    if (tipPath.node !== emitPath.node) {
      alternate = spliceChainInner(tipPath.node, emitPath.node, replacement);
      // over a PLAIN dispatch root the spliced trailing links are DEAD Optional*-typed -
      // retype them plain, else babel codegen parenthesizes the chain boundary. over a LIVE
      // `?.call` root (optional outer call) they stay Optional*: they are genuine chain
      // members and the retype would sever them from the short-circuit
      if (replacement.type !== 'OptionalCallExpression') {
        for (let link = alternate; link && link !== replacement; link = link.object ?? link.callee) {
          if (link.type === 'OptionalMemberExpression') link.type = 'MemberExpression';
          else if (link.type === 'OptionalCallExpression') link.type = 'CallExpression';
          else break;
          delete link.optional;
        }
      }
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
      resolvePureGlobalEntry, injectPureGlobal, collapseNav: collapseShortCircuitNavInPlace }),
    collapseShortCircuitNavInPlace,
    probedNavGuardValueNode,
    renderWriteHostProbeGuard,
    sealedClaimThrowProbeNode,
    flushKeptNavCollapseAt,
    flushKeptNavCollapses,
    markThrowingExtraction,
    generateRef,
    generateLocalRef,
    generateUnusedId,
    isWrappedInParens,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    withSideEffects,
    reset,
  };
}
