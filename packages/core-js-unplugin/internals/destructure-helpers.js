// Destructure visits queue claims; the drain applies pattern edits after traversal.
// This preserves sibling visits and default values rewritten by ordinary visitors.
// the destructure pipeline's shared vocabulary: pattern/host shape probes, plan builders
// and render spellings both the visit half and the drain half of the emitter speak
import {
  buildPatternRenderPlan,
  conditionalDestructureLeftUntouchedWarning,
  descendReceiverPathByKeys,
  fallbackDestructureHasPolyfillableBranch,
  isConstantLiteralReceiver,
  isReReferenceableAcrossReads,
  isReReferenceableReceiver,
  paramDefaultInstanceSynthAllowed,
  patternHopKeysToHost,
  synthPropDedupKey,
  decidedRunningOperand,
  decidingFallbackLeft,
  discardRescueNodesWithReads,
  liftedRealmNavEffect,
  observablePrefixElements,
  liftedPrefixSplit,
  staticContainerReceiverName,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { maybeRegisterAssignmentAliasWrite, registerBindinglessCtorAlias } from '@core-js/polyfill-provider/helpers/class-walk';
import { harvestDiscardedReceiverSE, readStandsOverAbsentableStore, shouldDropRescueReceiver } from
  '@core-js/polyfill-provider/detect-usage/members';
import {
  discardedInitProbePlan,
  directClaimProbePlan,
  directClaimProbeEffects,
  claimProbeSourceSlot,
  consumableHopSlotName,
  discardRescueNodes,
  findProxyGlobal,
  navValueCanShortCircuit,
  peelChainRootValue,
  peelRealmLogicalDefault,
  peelReceiverSequenceTail,
  guardedNavPassthroughPlan,
  realmSelectionCollapseOperand,
  resolveObjectName,
  agreeingTernaryArm,
  resolveSynthKeys,
  undefinableOptionalGuard,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  allProxySelectingInit,
  computedKeyHasSideEffects,
  dropDeadSequenceElements,
  hasRestSiblingExcept,
  isDestructurePattern,
  isForXStatement,
  isMutatedGlobalSlot,
  isNonReferencePosition,
  isPristineProxyGlobal,
  isValidIdentifierName,
  mayHaveSideEffects,
  memberKeyName,
  observableSequenceElements,
  patternBindingCount,
  pathOfNode,
  patternHasSeveralSeKeys,
  patternLevelKeepsEffectfulHop,
  spelledWriteSlot,
  peelNestedSequenceExpressions,
  peelParenAndTSParentPath,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  propBindingIdentifier,
  proxySurfaceIdentifier,
  receiverCarriesLiveOptional,
  SINGLE_STATEMENT_SLOTS,
  soleChainToProp,
  statementListOf,
  unwrapRuntimeExpr,
  unwrapParens,
  walkAstNodes,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { ownEmittedPatternClaim, ownOutputTests } from '@core-js/polyfill-provider/detect-usage/own-output';
import { forInitNeedsReceiverMemo, sentinelMemoInitShape } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { bodylessSlotReplacement } from '@core-js/polyfill-provider/destructure-host-shape';
import { detectIifeArgReceiverPath } from './destructure-emit-utils.js';
import { cloneStamped, nodeSite } from './nav-spine.js';

import { mintedProxyGlobalName, proxyStoreIsSpellable, replaceNodeInTree, stampReplacementSpan } from './emit-shared.js';
import {
  assignmentExpression,
  callExpression,
  cloneNode,
  expressionStatement,
  identifier,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
  renderClaimProbe,
  renderAliasHeldProbeRead,
  renderInstanceDefaultGuard,
  renderStaticDefaultGuard,
  exportDeclaration,
  renderDestructureStatements,
} from '@core-js/polyfill-provider/render';

// The local binding name, including a slot default (`{ flat: method = fallback }`).
export function propLocalName(prop) {
  return prop.value.type === 'AssignmentPattern' ? prop.value.left.name : prop.value.name;
}

export const SELECTING_INIT_TYPES = new Set(['ConditionalExpression', 'LogicalExpression']);

// a prop whose value is OUR rest sentinel is a prop we already processed (a re-parse of
// our own output): nothing routes it again, ahead of EVERY route in the claim funnel -
// through the shared sibling proof. `symbolIterator`
// derives from the meta - the funnel runs before any entry resolution
export function overwriteRebindEmitted({ metaPath, injectorState, adapter }) {
  return ownEmittedPatternClaim(metaPath, ownOutputTests(injectorState), adapter);
}

// a STATIC nested DEFAULTED sole leaf over a discardable receiver extracts as the overwrite
// (`({ Array: { from = fb } } = _globalThis)` -> `from = _Array$from;`): the extraction always
// defines, so the user default is dead text and drops with the receiver read - a pure nav or a
// statically-selected left. the overwrite replaces the whole assignment, so the host must hold the
// leaf alone: a sibling at any level would lose its write
export function emitAssignStaticDefaultOverwrite({ hostParent, prop, chain, kind, entry, hintName, metaPath }, ctx) {
  if (kind === 'instance' || !chain.length
    || prop.value?.type !== 'AssignmentPattern' || prop.value.left?.type !== 'Identifier'
    || !soleChainToProp(hostParent.node.left, prop)) return false;
  const discardable = isPureNavReceiver(hostParent.node.right)
    || allProxySelectingInit(hostParent.node.right, { adapter: ctx.adapter, injectorState: ctx.injectorState })
    || staticallySelectedLeft({
      selecting: peelTransparentExpr(hostParent.node.right), meta: null, metaPath,
      soleBinding: true,
      chain,
      adapter: ctx.adapter,
      kind,
    });
  if (!discardable) return false;
  const id = ctx.injectPureImport(entry, hintName);
  ctx.markRewrite();
  ctx.markSubtreeSkipped(ctx.skippedNodes, hostParent.node);
  // ... the default is dead text over the pure (always defined) - the canon drops it
  hostParent.replaceWith(assignmentExpression('=', identifier(prop.value.left.name),
    renderStaticDefaultGuard({ read: identifier(id), defaultValue: prop.value.right, reread: identifier(id), alwaysDefined: true })));
  return true;
}

// the receiver a NESTED leaf's level actually reads: the host's own RHS, or - where the level hangs
// under an inner DEFAULT of its own (`{ k: { Map: { groupBy } } = sel } = {}`) - that default, the
// slot the leaf reads exactly when the outer key is missing. the selecting-receiver gates ask it
// ahead of the host's RHS, which alone let a selecting default go unmirrored (the per-branch
// mirror already reads the same slot through `resolveFallbackReceiver`)
export function nestedLeafSelectingReceiver(metaPath, hostRhs) {
  for (let level = metaPath.parentPath; level?.node; level = level.parentPath) {
    if (level.node.type === 'AssignmentPattern') return level.node.right;
    if (level.node.type !== 'ObjectPattern' && level.node.type !== 'Property') break;
  }
  return hostRhs;
}

// a hop level whose DEFAULT carries an EFFECT bars the consume on EVERY host: the consume removes
// the whole chain and the effect leaves with the hop, while the source runs it exactly where that
// slot reads undefined - a condition the extraction no longer spells. the mirror keeps the default
// where it stands and swaps INSIDE it, which is the shape the other binding prints
export function hopDefaultCarriesEffect(chain) {
  return chain.some(level => level.hopProp?.value?.type === 'AssignmentPattern'
    && mayHaveSideEffects(level.hopProp.value.right));
}

// a NESTED instance claim whose init SELECTS nothing names no receiver for the declarator route to
// dispatch on: the leaf is served where the hop's own receiver is - a mirror's literal, an inline
// default - and a dispatch built here reads the HOST instead (`const k = _keys(_ref)` for a leaf
// the mirror already spells). the opaque route asks it, and so does the SENTINEL claim that skips
// that route: its residual survives the whole-init memo, which is the only question the skip owns
export function nestedInstanceWithoutSelectingInit({ chain, kind, init }) {
  return chain.length > 0 && kind === 'instance' && !SELECTING_INIT_TYPES.has(peelTransparentExpr(init)?.type);
}

// hand the per-branch mirror every SIBLING of the selecting hop, not just the one the claim arrived
// on: the branches belong to the host's receiver, so each prop of that pattern reads the same
// selection and owes its own arm. `claimObject` rides along because the type ladder answered it for
// THIS claim and the mirror cannot re-derive it from a sibling's key
export function routeSelectionMirror(metaPath, handlePerBranch, claimObject = null) {
  const outerProp = outermostHopProp(metaPath);
  const patternPath = outerProp.parentPath;
  const propPaths = patternPath?.node?.type === 'ObjectPattern' ? patternPath.get('properties') : null;
  for (const propPath of Array.isArray(propPaths) && propPaths.length ? propPaths : [outerProp]) {
    if (propPath.node?.type === 'Property') handlePerBranch({ metaPath: propPath, claimObject });
  }
}
// the OUTERMOST hop prop of a nested claim - the per-branch mirror anchors there (its
// pattern hangs on the receiver wrapper), while a leaf claim's own path sits levels below.
// the mirror fallbacks route through EVERY hop prop of that pattern: the fromFallback
// dispatch delivers each prop claim on its own, while a fallback fires ONCE (sibling
// claims die on the mirror-owned head gate) - a half-registered multi-hop plan emits nothing
function outermostHopProp(metaPath) {
  let prop = metaPath;
  while (prop.parentPath?.node?.type === 'ObjectPattern'
    && prop.parentPath.parentPath?.node?.type === 'Property') {
    prop = prop.parentPath.parentPath;
  }
  return prop;
}

// the declaration host's slot: a for-init head hosts sibling declarators, an export
// wrapper re-wraps its splits, statement positions split freely; bodyless hosts carry
// their own strategies - staged (null)
export function classifyDeclarationHost(hostParent) {
  const declarator = hostParent.node;
  const declarationPath = hostParent.parentPath;
  const declaration = declarationPath?.node;
  if (declaration?.type !== 'VariableDeclaration') return null;
  const stmtParent = declarationPath.parentPath?.node;
  const forInit = stmtParent?.type === 'ForStatement' && stmtParent.init === declaration;
  const exported = stmtParent?.type === 'ExportNamedDeclaration' && stmtParent.declaration === declaration;
  // a BODYLESS statement slot (`if (c) var {...} = g;`) hosts only `var`; babel wraps the
  // slot in a block of extractions there
  const bodyless = !forInit && !exported && declaration.kind === 'var'
    && !!SINGLE_STATEMENT_SLOTS.get(stmtParent?.type)?.some(slot => stmtParent[slot] === declaration);
  // a for-x HEAD declares the iteration binding and hosts nothing else: no sibling declarator slot
  // the way a for-init has, no statement list, no block to wrap. the one render it can carry is the
  // slot's own default, so it is a host - dropping it here loses the claim outright
  const head = !forInit && !exported && !bodyless
    && isForXStatement(stmtParent) && stmtParent.left === declaration;
  if (!forInit && !exported && !bodyless && !head && !statementListOf(stmtParent)) return null;
  return { declarator, declarationPath, declaration, forInit, exported, bodyless, head };
}

export function defaultedSoleConsumes({ forInit, prop, soleBinding, chain, kind, declarator }) {
  if (forInit || prop.value.type !== 'AssignmentPattern' || !soleBinding || chain.length !== 0) return false;
  if (kind !== 'instance' && mayHaveSideEffects(declarator.init)) return false;
  const inner = peelTransparentExpr(declarator.init);
  return inner?.type !== 'ConditionalExpression' && inner?.type !== 'LogicalExpression';
}

// does the receiver's spine carry a computed HOP KEY with an effect (`globalThis[(c++, 'self')]`)?
// asked on the PRISTINE tree: the collapse folds that key away, and the harvested effect then
// looks like any other statement-level one
export function navSpineHasComputedKeyEffect(initNode) {
  // through the CHAIN wrapper an optional spelling wears: `globalThis?.[(c++, 'self')]` buries the
  // same key effect as its plain twin, and reading only the paren peel called it absent - the
  // effect then lifted to a statement where the plain form keeps it inside the bound value
  for (let cur = unwrapRuntimeExpr(initNode); cur?.type === 'MemberExpression'; cur = unwrapRuntimeExpr(cur.object)) {
    if (cur.computed && mayHaveSideEffects(cur.property)) return true;
  }
  return false;
}

// is the init's OUTERMOST read the computed hop the claim itself resolves through, over a plain
// proxy root (`globalThis[(e++, 'Map')]`)? then the discarded read keeps its whole spelling - the
// collapse folded that key into the ctor's own, and the effect has no slot outside it. a key
// BELOW the claim, or a call root, keeps the ordinary effects-only rescue
// an effectful computed key read DIRECTLY off the root, no hop between: that read is the one the
// source performed and it survives the consume (`globalThis[(e++, 'Object')]`). a hop between them
// collapses the read whole and leaves only the effect (`globalThis.self[(a = f(), 'Array')]`)
export function initRawKeyOnRoot(initNode) {
  // a leading SE sequence is transparent: its own prefix rides the same lift
  // (`(e++, globalThis[(e++, 'Symbol')])`)
  let init = peelTransparentExpr(initNode);
  while (init?.type === 'SequenceExpression') init = peelTransparentExpr(init.expressions.at(-1));
  return init?.type === 'MemberExpression' && init.computed && mayHaveSideEffects(init.property)
    && peelTransparentExpr(init.object)?.type === 'Identifier';
}

// a SEQUENCE root DIRECTLY under the claimed key: the collapse rebuilds the whole read as
// `(eff, _Ctor)`, so lifting only the prefix would drop the ctor's own import
// (`(e++, globalThis).Promise` lifts `(e++, _Promise)`). a PROXY HOP between them is the other
// shape - there the read collapses whole and only the effect survives
export function initSeqDirectClaim(initNode) {
  const init = peelTransparentExpr(initNode);
  if (init?.type !== 'MemberExpression' || init.computed) return false;
  const base = peelTransparentExpr(init.object);
  if (base?.type !== 'SequenceExpression'
    || base.expressions.slice(0, -1).every(expr => !mayHaveSideEffects(expr))) return false;
  // the tail must be the BARE root: a NAV tail collapses whole with its hops and leaves only
  // the effect (`(c++, globalThis.self).Map` -> `c++;`)
  return peelTransparentExpr(base.expressions.at(-1))?.type === 'Identifier';
}

export function buriedKeyClaimInit(initNode) {
  // a leading SE sequence is transparent: the buried key sits in its TAIL
  let init = peelTransparentExpr(initNode);
  while (init?.type === 'SequenceExpression') init = peelTransparentExpr(init.expressions.at(-1));
  if (init?.type !== 'MemberExpression' || !init.computed || !mayHaveSideEffects(init.property)) return false;
  let root = peelTransparentExpr(init.object);
  while (root?.type === 'MemberExpression') root = peelTransparentExpr(root.object);
  return root?.type === 'Identifier';
}

// does the receiver's own SEQUENCE root carry a kept write (`(a = f(), globalThis).Symbol`)?
// asked on the PRISTINE tree: by drain time the collapse may have eaten the member above it, and
// only the source shape tells this from an effect buried in a computed KEY
export function initSeqRootHasKeptWrite(initNode) {
  const init = peelTransparentExpr(initNode);
  const base = init?.type === 'MemberExpression' ? peelTransparentExpr(init.object) : null;
  return base?.type === 'SequenceExpression' && base.expressions.some(expr => {
    const stored = peelTransparentExpr(expr);
    return stored?.type === 'AssignmentExpression' && stored.operator === '=';
  });
}

// the ONE expression a lifted prefix becomes, through the shared trim canon: the value slot is
// gone, so an element with nothing to observe is a comma the source wrote rather than work it did,
// and a prefix left with no observable at all is not a statement the source ran
export function liftedPrefixExpression(prefix, ctx = null) {
  if (!prefix.length) return null;
  const kept = ctx ? observableSequenceElements(prefix, ctx) : dropDeadSequenceElements(prefix);
  if (!kept.length) return null;
  const lifted = kept.length === 1 ? kept[0] : sequenceExpression(kept);
  return ctx || mayHaveSideEffects(lifted) ? lifted : null;
}

export function liftedPrefixStatements(prefix, ctx = null) {
  const lifted = liftedPrefixExpression(prefix, ctx);
  return lifted ? [expressionStatement(lifted)] : [];
}

// the LIVE tail, taken for the reason the prefix is: the registration-time node is a pre-swap
// copy, so a residual bound off it ships the RAW receiver the collapse had already substituted
export function liveTailOf(declarator, { seqPrefix, initTail, ctx }) {
  const { prefix, tail } = liftedPrefixSplit(peelTransparentExpr(declarator.init), ctx);
  return prefix.length === seqPrefix.length ? tail : initTail;
}

// the prefix of a declarator's SOURCE init (`key`: an assignment's `right`), taken off so the declarator
// reads the bare tail: a sequence's, and the live arm's of a selection the build decides (`liftedPrefixSplit`).
// one the collapse MINTED is the value's own spelling and stays whole, which its missing span tells us
function takeSourceSequencePrefix(declarator, key, ctx) {
  const init = peelTransparentExpr(declarator[key]);
  if (!Number.isInteger(init?.start)) return [];
  const { prefix, tail } = liftedPrefixSplit(init, ctx);
  if (prefix.length) declarator[key] = tail;
  return prefix;
}

// the prefix of a for-init declarator's SOURCE sequence init, taken off so the declarator reads the
// bare tail: the elements the shared trim canon keeps, for the caller to place ahead of whatever the
// tail still evaluates - none where an extraction reads the receiver, which spells the init itself
export function takeForInitPrefix(declarator, declJobs, extracted, ctx) {
  if (!extracted.length || declJobs.some(job => job.readsReceiver)) return [];
  const prefix = takeSourceSequencePrefix(declarator, 'init', ctx);
  const lifted = prefix.length ? liftedPrefixExpression(prefix, ctx) : null;
  if (!lifted) return [];
  return lifted.type === 'SequenceExpression' ? lifted.expressions : [lifted];
}

// a for-init hosts no statement of its own, so the prefix taken off its init (`takeForInitPrefix`) rides
// the FIRST extraction's value, which the loop header evaluates where the source ran it
// (`for (var m = (eff(), _Map), { other } = _globalThis; ...)`)
export function carryForInitPrefixIntoFirst(extracted, carried) {
  if (carried.length) extracted[0].init = sequenceExpression([...carried, extracted[0].init]);
}

// the prefix of a SOURCE sequence init, taken off the declarator (`takeSourceSequencePrefix`) so the
// surviving residual reads the bare tail, as statements: an element with nothing to observe is a
// comma the source wrote, not a statement it ran (`var { Map: m, other } = (0, globalThis)`)
export function liftSurvivingInitPrefix(declarator, declJobs, ctx = null, key = 'init') {
  if (!declJobs.length) return [];
  // per element, the grouping the other leg's declarator lift prints for the same shape
  return observableSequenceElements(takeSourceSequencePrefix(declarator, key, ctx), ctx).map(expr => expressionStatement(expr));
}

// a BODYLESS assignment host (`if (c) ({ Map: M } = g);`) has no statement list to splice into:
// it rewrites only when the whole destructure collapses into exactly one assignment, or when a
// memoized receiver braces the slot around both its reads
// eslint-disable-next-line max-statements -- per-form drain dispatch sequence
export function drainBodylessAssignment({ hostNode, jobs }, {
  program,
  markRewrite,
  mintRefName,
  removeConsumedProps,
  reanchorSoleCtorHopResidual,
  surfaceInitInfo = null,
  memoCtx = null,
}) {
  const sentinelKept = jobs.some(job => job.sentinel);
  const statements = renderDestructureStatements(jobs.map(job => ({ id: propBindingTarget(job.prop), init: job.value() })));
  // the lifted SE prefix runs first, once - re-derived from the CURRENT right, the way the statement
  // drain derives its own: the walk rewrites the claims INSIDE the prefix in place, and the nodes the
  // job recorded are the pre-rewrite originals (lifting those printed a native `log.push` where the
  // statement host prints the polyfilled one)
  // ... and a host the retained CAPTURE rendered stands in the slot as that capture: the residual it
  // owes is the live statement, not the pattern the capture replaced (the statement host's handoff)
  const [{ seqPrefix, assignment: bodylessAssign, receiverHolder }] = jobs;
  const peeledRight = peelTransparentExpr(bodylessAssign.right);
  // does anything the jobs did not claim survive in the pattern? asked BEFORE the consume mutates
  // it: a bail below must leave the slot as the source wrote it, extractions and all
  const residualSurvives = patternBindingCount(bodylessAssign.left)
    !== jobs.reduce((count, job) => count + patternBindingCount(job.prop.value), 0);
  // a kept WRITE recorded as the prefix lifts only where the consume DISCARDS it: a surviving
  // residual performs the store where the source did, and the extractions behind it read what it
  // stored (the statement host's rule, in the block this slot opens)
  const writeRight = seqPrefix?.length === 1 && peeledRight?.type === 'AssignmentExpression'
    && spellsSameSource(peeledRight, peelTransparentExpr(seqPrefix[0]));
  // the WHOLE right recorded as the prefix (the sole-consume lift) is no sequence prefix: a sequence
  // it spells is its own, which the lift canon reads below - matched against the record by count, its
  // tail was taken for a quiet receiver (`(log(), mk().Map ?? Set)` lost the `mk()` call)
  const wholeRight = !writeRight && seqPrefix?.length === 1 && seqPrefix[0] === bodylessAssign.right;
  const liftCtx = { ...nodeSite(bodylessAssign.right, jobs[0].metaPath), adapter: memoCtx?.adapter };
  // the right as it stands now, split the way the record was (`liftedPrefixSplit`): the same elements, live
  const liveSplit = !writeRight && !wholeRight && seqPrefix?.length ? liftedPrefixSplit(peeledRight, liftCtx) : null;
  const liveSeq = writeRight ? [peeledRight, peelChainRootValue(peeledRight)]
    : liveSplit && liveSplit.prefix.length === seqPrefix.length ? [...liveSplit.prefix, liveSplit.tail] : null;
  // ... and a WHOLE right the consume discards owes what the lift canon says, as on the statement
  // host: nothing past a deciding left (`if (c) ({ of } = Array ?? (log(), Set))` lifts nothing),
  // spelled as the one expression the statement host prints
  const wholeRightLift = wholeRight && !residualSurvives ? liftedRealmNavEffect(bodylessAssign.right, liftCtx) : null;
  // ... and past it, the elements of that right read through its wrappers, which the trim canon keeps
  // where they run something - the statement host's lift (a TS wrapper leaves with the value it wraps,
  // a quiet tail behind a prefix with nothing it reads: `if (c) ({ of } = (log(), X || Set))` lifts `log()`)
  const wholeRightSeq = wholeRight && !residualSurvives && !wholeRightLift ? peelNestedSequenceExpressions(peeledRight) : null;
  // ... per element ahead of a SURVIVING residual, the statement host's lift there (`f(); g(); m = _Array$from;`)
  const prefixStatements = wholeRightLift ? liftedPrefixStatements(wholeRightLift.effects, liftCtx)
    : wholeRightSeq ? liftedPrefixStatements([...wholeRightSeq.prefix, wholeRightSeq.tail], liftCtx)
    : residualSurvives && liveSeq && !writeRight
      ? observablePrefixElements(liveSeq.slice(0, -1), liftCtx).map(expr => expressionStatement(expr))
      : liftedPrefixStatements(writeRight && residualSurvives ? [] : liveSeq ? liveSeq.slice(0, -1) : seqPrefix ?? []);
  // ... and an extraction that READS the receiver beside a surviving residual needs a memo, which a
  // lifted prefix leaves no slot for - unless the quiet tail is a surface both may re-read for free
  if (residualSurvives && seqPrefix?.length && jobs.some(job => job.readsReceiver)
    && !isPureNavReceiver(liveSeq ? liveSeq.at(-1) : peeledRight)) return;
  statements.unshift(...prefixStatements);
  // the SOURCE slot of every prop, read before the consume empties the pattern: a residual that
  // SPLITS lands each of its hops where the source wrote it, among the extractions
  const sourceProps = bodylessAssign.left?.type === 'ObjectPattern' ? [...bodylessAssign.left.properties] : null;
  removeConsumedProps(jobs);
  // an assignment-position sentinel writes an undeclared name, so its `var` rides whichever branch
  // below renders - the MEMO one owes it exactly as the plain sentinel one does. read AFTER the
  // consumed props leave, which is where the rename mints the name
  const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
  const varDecl = mintedNames.length
    ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
  // a SURVIVING residual then reads the quiet tail the prefix left behind - a kept write stays whole
  if (liveSeq && !writeRight && bodylessAssign.left.properties?.length) bodylessAssign.right = liveSeq.at(-1);
  // the memo verdict needs the residual as it SURVIVES - after the consumed props leave
  const memoRef = assignmentMemoRef(bodylessAssign, jobs, mintRefName, memoCtx);
  const memoInit = memoRef ? bodylessAssign.right : null;
  // a MEMOIZED receiver hosts both reads in ONE block: the `_ref` declaration and the
  // residual reading it belong together, so the slot braces exactly once
  if (memoRef) {
    for (const [index, job] of jobs.entries()) {
      statements[index].expression.right = job.value(memoRef);
    }
    bodylessAssign.right = identifier(memoRef);
    statements.unshift(...renderDestructureStatements([], { capture: { name: memoRef, value: memoInit } }));
    // ... behind the memo, which the extractions read: the declaration order both legs print
    if (varDecl.length) statements.splice(1, 0, ...varDecl);
    if (bodylessAssign.left.properties.length !== 0) statements.push(expressionStatement(bodylessAssign));
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: statements })) markRewrite();
    return;
  }
  // a SENTINEL residual rides the block as it stands: the slot keeps what it renames - a rest must
  // go on excluding the key, an SE key must still run where the source wrote it - and the extraction
  // joins it. the ORDER is what the residual OWES: an SE key runs before the lookup it feeds, so the
  // residual leads there; a rest exclusion owes nothing and follows the extraction
  if (sentinelKept) {
    if (seqPrefix?.length || mayHaveSideEffects(bodylessAssign.right)) return;
    const residual = receiverHolder ? hostNode : expressionStatement(bodylessAssign);
    const seKeyFirst = jobs.some(job => job.sentinel && job.prop.computed
      && computedKeyHasSideEffects(job.prop, { ...nodeSite(job.prop, job.metaPath), adapter: memoCtx?.adapter }));
    // the sentinel `var` LEADS the block whatever the order below: it declares, it does not run, and
    // that is where the other leg plants it
    const body = [...varDecl, ...renderDestructureStatements(statements.map(statement => ({ statement })), {
      residual, residualAt: seKeyFirst ? 0 : statements.length,
    })];
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body })) markRewrite();
    return;
  }
  // a SURVIVING residual rides the same block. a RE-ANCHORED one re-reads the hop's own pure and
  // leads the extractions (`if (c) { ({ customI } = _Iterator); g = _Iterator$zip; }`); a plain one
  // keeps the SOURCE order its props were written in, behind them. without this the consumed props
  // were already gone and their extractions were dropped on the floor - nothing wrote the bindings
  if (bodylessAssign.left.properties.length !== 0) {
    const anchored = anchorAssignmentResidual(bodylessAssign, jobs,
      view => reanchorSoleCtorHopResidual(view, { metaPath: jobs[0]?.metaPath ?? null }), surfaceInitInfo);
    // ... in the cascade the statement host prints: a FLAT extraction runs ahead of the residual, a
    // NESTED hop behind it, and the lifted prefix leads them all - the source ran it first
    const jobStatements = statements.slice(prefixStatements.length);
    const paired = jobs.map((job, index) => ({ job, statement: jobStatements[index] }));
    // ... and SEVERAL anchored hops take one assignment each, every piece - extraction or hop - where
    // the source wrote it, exactly as the statement host orders the same split
    if (anchored?.split) {
      const pieces = [
        ...paired.map(entry => ({
          stmt: entry.statement,
          at: sourceProps?.indexOf(jobOuterProp(entry.job)) ?? -1,
        })),
        ...anchored.split.map(({ hop, view }) => ({
          stmt: expressionStatement(assignmentExpression('=', view.id, view.init)),
          at: sourceProps?.indexOf(hop) ?? -1,
        })),
      ].sort((left, right) => left.at - right.at);
      const split = [...prefixStatements, ...pieces.map(piece => piece.stmt)];
      if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: split })) markRewrite();
      return;
    }
    const flat = paired.filter(entry => !entry.job.chain?.length).map(entry => entry.statement);
    const nested = paired.filter(entry => entry.job.chain?.length).map(entry => entry.statement);
    const residual = receiverHolder ? hostNode : expressionStatement(bodylessAssign);
    const body = [...prefixStatements, ...renderDestructureStatements(flat.map(statement => ({ statement })), {
      residual, residualAt: anchored ? 0 : flat.length,
    }), ...nested];
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body })) markRewrite();
    return;
  }
  // an SE-bearing init has no slot in this shape (the extractions drop it) - staged
  if (jobs.length > 1 && !seqPrefix?.length && mayHaveSideEffects(bodylessAssign.right)) return;
  // several extractions wrap the bodyless slot in a block (babel's scope.push shape);
  // a single one keeps the bare statement
  const replacement = bodylessSlotReplacement(hostNode, statements);
  if (replaceNodeInTree(program, hostNode, replacement)) markRewrite();
}

// the shared `_ref` an assignment-form destructure owes, or null: a receiver read by an extraction
// AND by the surviving residual is read twice, and an unreusable spelling cannot be. `ctx` (adapter
// plus injector state) is what lets the realm clause below run - every caller passes it, so the two
// host spellings answer alike
export function assignmentMemoRef(assignment, jobs, mintRefName, ctx = null) {
  if (jobs.every(job => !job.readsReceiver)) return null;
  const whole = peelTransparentExpr(assignment.right);
  // a lifted sequence PREFIX leaves the readers the tail: one they re-read for free keeps the lift,
  // any other takes the memo, the prefix riding it where the source ran it
  const right = jobs.some(job => job.seqPrefix?.length) ? peelNestedSequenceExpressions(whole).tail : whole;
  const [{ metaPath }] = jobs;
  if (right?.type === 'ThisExpression' || (right?.type === 'Identifier'
    && isReReferenceableAcrossReads(right, { scope: metaPath?.scope, adapter: ctx?.adapter, path: metaPath }))) return null;
  // ... and a selection every value of which IS the realm needs none either: every branch hands back
  // the same object, free to re-read, so its readers share an identity without a ref of their own -
  // the declarator host's `allProxyInit` clause, asked here on the REWRITTEN spelling
  if (ctx && realmSelectionCollapseOperand(right, ctx)) return null;
  // a kept-binding residual reads the RAW right in place and the overwrite re-spells a
  // constant literal - no shared identity to memoize
  if (jobs.every(job => job.keepSentinelBinding) && isConstantLiteralReceiver(right)) return null;
  const residualSurvives = assignment.left?.type !== 'ObjectPattern' || assignment.left.properties.length !== 0;
  return jobs.length + (residualSurvives ? 1 : 0) > 1 ? mintRefName() : null;
}

// the STATEMENT a path sits in - the slot a generated declaration plants beside
// a RE-ANCHORED residual is the declarator the discarded init belongs to: the sink's prefix rides
// that declarator's own value instead of a slot of its own (`for (const { customFR: fr } = (<prefix>,
// _Promise); ...)`), which is where the source wrote it. true when it took the prefix
export function foldSinkPrefixIntoResidual(extracted, slot) {
  const residual = extracted.length === 1 && extracted[0].id?.type === 'ObjectPattern' ? extracted[0] : null;
  const prefix = residual && slot?.type === 'SequenceExpression' ? slot.expressions.slice(0, -1) : null;
  if (!prefix?.length) return false;
  residual.init = sequenceExpression([...prefix, residual.init]);
  return true;
}

export function hostStatementOf(path) {
  let up = path;
  while (up?.node && !statementListOf(up.parentPath?.node)) up = up.parentPath;
  return statementListOf(up?.parentPath?.node)?.includes(up.node) ? up.node : null;
}

// ... found again on the CURRENT tree: the drain that owns the statement may have re-homed it
function statementListSlot(program, stmtNode) {
  let slot = null;
  walkAstNodes({
    root: program,
    visit(node) {
      const list = slot ? null : statementListOf(node);
      if (!list) return;
      const at = list.indexOf(stmtNode);
      if (at !== -1) slot = { body: list, at };
    },
  });
  return slot;
}

// the slot a prop value SPELLS (`spelledWriteSlot`: a member, an asserted binding), cloned as the source
// spells it - a default dropped, a paren or a TS assertion kept around it - or null: the slot an extraction
// writes in place of a declared name
function spelledSlotClone(value) {
  const slot = spelledWriteSlot(value);
  return slot ? cloneNode(slot) : null;
}

// the slot a JOB writes into: a spelled slot (a member, an asserted binding) names it in the source
// itself, so the job has no local of its own to declare - every other job binds the name it RECORDED.
// that fallback is what separates this from `memoJobBindingTarget`, which falls back to
// `propBindingTarget` and so hands a pattern value its own pattern; the two are not interchangeable
export function jobBindingTarget(record) {
  return spelledSlotClone(record?.prop?.value) ?? identifier(record.local);
}

// the extracted declarator's binding slot: a pattern-valued symbol prop moves its whole
// pattern; everything else binds the local name
export function propBindingTarget(prop) {
  if (isDestructurePattern(prop.value)) return prop.value;
  // a SPELLED slot is the target the source itself named - the extraction writes there, and its own
  // DEFAULT goes with the rest of them: the import it takes is never undefined
  const spelled = spelledSlotClone(prop.value);
  if (spelled) return spelled;
  // a DEFAULTED pattern value binds through its OWN pattern: the default rides the extraction's
  // guard ternary, so only the left survives as the target
  if (prop.value.type === 'AssignmentPattern'
    && isDestructurePattern(prop.value.left)) {
    return prop.value.left;
  }
  return identifier(propLocalName(prop));
}

// a computed STRING-LITERAL key (`globalThis['self']`) navigates like the dotted spelling
function plainNavHopKey(node) {
  if (!node.computed) return node.property?.name ?? null;
  const key = peelTransparentExpr(node.property);
  return key?.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
}

// a chain MARKER whose `?.` the guard canon ERASES guards nothing: the source cannot short-circuit
// there, so every receiver question below may read the nav it wraps. asked once, at the route's
// entry - the marker alone otherwise declined the extraction and the claim shipped native, while
// the babel binding (whose parser spells no marker at all) extracted off the same source
export function peelDeadChainMarker(node, guardCtx = null) {
  const cur = peelTransparentExpr(node);
  if (cur?.type !== 'ChainExpression' || !guardCtx?.resolvePure) return node;
  const inner = peelTransparentExpr(cur.expression);
  return undefinableOptionalGuard(inner, guardCtx.resolvePure, guardCtx.aliasCtx ?? null).kind === 'erase'
    ? inner : node;
}

// the one hop walk both nav questions ride - "is this a nav?" and "which surface does it name?":
// they differ in what they READ off the chain, never in what counts as a hop. an ERASED `?.` is
// transparent to the walk, its own hop carrying the marker's flag, so the guard verdict travels
// with the node - a resolver that judged the flags alone answered the opposite for a marked twin
// ... and a `?.` the marker no longer wraps - a canonical resolver peels the wrapper and hands the
// member on - is dead on the same verdict: the value canon says the chain cannot short-circuit
export function navHopChain(node, guardCtx = null, opts = null) {
  const { throughSequenceTails = false } = opts ?? {};
  const peeled = peelDeadChainMarker(node, guardCtx);
  const core = peelTransparentExpr(peeled);
  const deadOptionals = peeled !== node || (!!guardCtx?.resolvePure && receiverCarriesLiveOptional(core)
    && !navValueCanShortCircuit(core, guardCtx.resolvePure, guardCtx.aliasCtx ?? null));
  const keys = [];
  function hopIsNav(hop) {
    return hop?.type === 'MemberExpression' && (deadOptionals || !hop.optional) && plainNavHopKey(hop) !== null;
  }
  let cur = core;
  while (hopIsNav(cur)) {
    keys.unshift(plainNavHopKey(cur));
    cur = peelTransparentExpr(throughSequenceTails ? peelReceiverSequenceTail(cur.object) : cur.object);
  }
  return { root: cur, keys };
}

// the extraction DISCARDS the receiver expression (the init / the assignment RHS): only a
// pure navigation may fall away silently; anything else is the SE-rescue channel - staged.
// the check is ALSO the claim's validity proof: an extraction is polyfill-always-wins only
// over a provable global nav - a conditional / opaque receiver must never extract, rest or
// not (the other branch's miss semantics would be erased)
export function isPureNavReceiver(node, guardCtx = null, opts = null) {
  const { root } = navHopChain(node, guardCtx, opts);
  return root?.type === 'Identifier' || root?.type === 'ThisExpression';
}

// The host carries a sequence's effects before its receiver, so only the final
// value has to be the provable nav, including through nested sequences.
export function isPureNavAfterSePrefix(node, guardCtx = null, opts = null) {
  node = peelTransparentExpr(node);
  if (node?.type === 'SequenceExpression') node = peelNestedSequenceExpressions(node).tail;
  return isPureNavReceiver(node, guardCtx, opts);
}

// the same SOURCE node seen through a rebuild that may have CLONED it: a clone carries the
// span of what it copied, and a minted node has none to answer with
export function spellsSameSource(node, source) {
  return node === source
    || (Number.isInteger(source?.start) && node?.start === source.start && node?.end === source.end);
}

// a kept WRITE of a SPELLABLE pure nav rides the value it stored: the read beside it is that
// same value re-spelled, so lifting the write away would leave the read answering nothing.
// every other harvested effect is the source's own and lands as a statement of its own
export function keptWriteRidesValue(node, { adapter, injectorState, resolveGlobalPolyfill }) {
  const write = peelTransparentExpr(node);
  return write?.type === 'AssignmentExpression' && write.left?.type === 'Identifier'
    && proxyStoreIsSpellable(write.right, resolveGlobalPolyfill,
      name => isMintedOrProxyName(name, injectorState))
    && (isPureNavReceiver(write.right) || allProxySelectingInit(write.right, { adapter, injectorState }));
}

// the prefix a host lifts ahead of its extraction, and the quiet receiver it leaves behind: a
// source SEQUENCE hands over its tail, a chain ASSIGNMENT the value it stored. a hop ANCHOR in a
// sequence slot takes neither - it has no statement ahead of it, so the write rides the
// re-anchored read where the source wrote it (`({ customX } = (wx = _globalThis, _Map))`)
// the sequence is read through the canon split (`liftedPrefixSplit`): a NESTED run (`(f(), (g(), globalThis))`)
// hands over every prefix in source order, a decided selection's live arm its own, and a defensive realm default
// on the tail (`(f(), globalThis ?? {})`) reads as the realm it names - the discarding peel, since the residual
// then reads this receiver
export function planLiftedRhsPrefix(right, { anchorsInSequence, guardCtx = null, ctx = null }) {
  const peeled = peelTransparentExpr(right);
  if (peeled?.type === 'SequenceExpression') {
    const { prefix, tail } = liftedPrefixSplit(peeled, ctx);
    const receiver = peelRealmLogicalDefault(tail, { discarding: true });
    if (isPureNavReceiver(receiver, guardCtx)) return { prefix, receiver };
  }
  // the chain-assign lift re-emits the WRITE as its own statement, and what the pattern then reads -
  // the extraction and a surviving residual alike - is the quiet value it STORED, the way a sequence
  // leaves its tail behind (the drain swaps the residual's right the same way for both shapes)
  if (anchorsInSequence || !chainAssignOverPureNav(peeled, guardCtx)) return null;
  return { prefix: [right], receiver: peelChainRootValue(peeled) };
}

// a chain ASSIGNMENT storing a provable global nav (`(q = globalThis)`): the write is an
// effect of the source's own, and the value it leaves behind is the receiver a claim reads
export function chainAssignOverPureNav(node, guardCtx = null) {
  const assign = peelTransparentExpr(node);
  // the stored VALUE may carry its own SE prefix (`(q = (eff(), globalThis))`): only the TAIL is
  // the nav, and the prefix is an effect the lift re-emits - the sibling predicate that already
  // spells that rule is what answers here, else an SE-bearing write left the claim native
  // ... and a sequence BELOW the hops rides along inside the write this lift re-emits VERBATIM, so
  // here the nav question steps it through the canon peel: stopping at it called the stored value
  // rootless, the lift declined, and the pattern then read its slots off the raw realm object
  return assign?.type === 'AssignmentExpression' && assign.operator === '='
    && isPureNavAfterSePrefix(peelChainRootValue(assign), guardCtx, { throughSequenceTails: true }) ? assign : null;
}

// the shared "conditional destructure left untouched" debug-warn, emitted where the per-branch
// mirror DECLINED: whether the polyfill applies then depends on which branch runs. gated on a
// GENUINE candidate through the shared provider predicate, and the gate itself is skipped when
// debug is off - the common build path pays nothing for a diagnostic nobody reads
export function warnConditionalFallbackUntouched(meta, metaPath, { getDebugOutput, adapter, resolvePure }) {
  const debug = getDebugOutput?.();
  if (!debug || !fallbackDestructureHasPolyfillableBranch({ meta, path: metaPath, adapter, resolvePure })) return;
  debug.warn?.(conditionalDestructureLeftUntouchedWarning(meta.key));
}

// a pattern-valued symbol extraction lands ahead of PLAIN sibling extractions (the locked
// channel order); a sentinel-bearing sibling shares the
// symbol channel and keeps source order
export function orderDeclaratorJobs(jobs) {
  function symbolFirst(job) {
    return job.symbolPattern && job.sentinel;
  }
  const reorder = jobs.some(symbolFirst) && jobs.every(job => job.symbolPattern || !job.sentinel);
  return reorder ? [...jobs.filter(symbolFirst), ...jobs.filter(job => !symbolFirst(job))] : jobs;
}

// the nested-pattern chain climb: plain hop props at every level, stepping through a
// DEFAULTED hop only when the eventual host proves the receiver (declarator /
// assignment / array wrapper) - a param host keeps the default live and rewinds to it
// the KEY each hop reads, receiver-to-leaf: a computed hop spells its BINDING, so the climb's
// folded value is what names the slot (`{ [K]: { groupBy } }` with `const K = 'Object'` -> 'Object')
export function hopChainKeys(chain) {
  return chain.toReversed().map(level => level.foldedKey ?? level.hopProp.key.name ?? level.hopProp.key.value);
}

export function climbPatternChain(patternPath, keyCtx = null) {
  let hostPatternPath = patternPath;
  const chain = [];
  let firstDefault = null;
  for (;;) {
  // a DEFAULTED hop pattern (`{ ns: { entries } = {} }`) climbs through its
  // AssignmentPattern: over a DECLARATOR receiver the resolution proved the hop, so the
  // default is dead and drops with the cascade; a PARAM host keeps the default LIVE
  // (the caller decides), so the climb rewinds to it below
    let up = hostPatternPath.parentPath;
    if (up?.node?.type === 'AssignmentPattern' && up.node.left === hostPatternPath.node) {
      firstDefault ??= {
        hostParent: up,
        hostPatternPath,
        chainLength: chain.length,
        // a default that CARRIES a receiver fires under exactly the condition the outer slot
        // leaves open, so its mirror is correct on every host - not only in a parameter list
        carriesReceiver: !!keyCtx?.carriesReceiver?.(up),
      };
      up = up.parentPath;
    }
    if (up?.node?.type !== 'Property' || up.parentPath?.node?.type !== 'ObjectPattern') break;
    const hopProp = up.node;
    const outerPattern = up.parentPath.node;
    const hopValue = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
    // a computed hop key that FOLDS to a string is the same plain read in its bracket
    // spelling (`{ ['Array']: { from } }` / `{ [K]: { groupBy } }` with `const K = 'Object'`
    // read like `.Array` / `.Object` - the shared key canon the inner keys already ask). a key
    // that EVALUATES something folds too, and must not: a claim riding this chain consumes the
    // hop, and the effect would go with it (`{ [(eff(), 'Array')]: { prototype: { at } } }`)
    const foldedComputedKey = hopProp.computed ? consumableHopSlotName(hopProp, keyCtx) : null;
    if ((hopProp.computed && typeof foldedComputedKey !== 'string') || hopValue !== hostPatternPath.node) return;
    chain.push({ hopProp, outerPattern, outerRest: hasRestSibling(outerPattern, keyCtx), foldedKey: foldedComputedKey || null });
    hostPatternPath = up.parentPath;
  }
  let hostParent = hostPatternPath.parentPath;
  const provableHost = (hostParent?.node?.type === 'VariableDeclarator' && hostParent.node.id === hostPatternPath.node)
  || (hostParent?.node?.type === 'AssignmentExpression' && hostParent.node.left === hostPatternPath.node)
  || hostParent?.node?.type === 'ArrayPattern';
  if (firstDefault && (!provableHost || firstDefault.carriesReceiver)) {
    chain.length = firstDefault.chainLength;
    ({ hostParent, hostPatternPath } = firstDefault);
  }
  return { chain, hostPatternPath, hostParent };
}

// A rendered default guard keeps the dispatch whose receiver accepts an initializer prefix.
const instanceDefaultReads = new WeakMap();

// The binding adapter gives a moved default its own source/comment span. Its receiver's later
// offsets must not flush annotations out of that subtree, including after the default is rewritten.
// A transparent owner survives replacing the expression inside it before the print transfers its span.
export function buildInstanceDefaultGuard({ defaultValue, defaultPattern = null, ...options }) {
  const start = defaultPattern?.defaultCommentsAt ?? unwrapParens(defaultValue).start;
  const end = defaultPattern?.end ?? defaultValue.end;
  const value = renderInstanceDefaultGuard({
    ...options,
    defaultValue: stampReplacementSpan({
      type: 'ParenthesizedExpression',
      expression: defaultValue,
      ownedCommentsAt: start,
      ownedCommentsEnd: end,
    }, { start, end }),
  });
  instanceDefaultReads.set(value, options.call);
  return value;
}

// the guard an overwrite owes: the pure entry answers `it.method` verbatim off a receiver that is not
// the polyfilled surface, so the dispatch may be undefined and something must stand in that case.
// while the RAW destructure SURVIVES that is the slot it already assigned - the read, or the source's
// own default, run exactly once - and re-spelling the default node beside it would run it twice. once
// the slot is PRUNED nothing ran it, and the default node itself is the one reader left
export function overwriteDefaultGuard({ call, localName, ref, defaultNode = null, defaultPattern = null }) {
  return buildInstanceDefaultGuard({
    assignedRef: identifier(ref),
    call,
    defaultValue: defaultNode ?? identifier(localName),
    defaultPattern,
    defaultName: localName,
    reread: identifier(ref),
  });
}

// the SE-keyed DEFAULTED instance prop's overwrite: the destructure stays whole (the key
// runs where the source runs it) and the ponyfill re-binds after. the overwrite re-reads
// the receiver, so it must be safe to spell twice; the binding must be a plain name
export function registerSeKeyDefaultOverwrite({ prop, chain, entry, hintName, hostParent },
  { injectPureImport, markRewrite, recordJob, injector }) {
  const overwriteId = prop.value.left?.type === 'Identifier' ? prop.value.left : null;
  const receiver = peelTransparentExpr(hostParent.node.right);
  const overwriteStmtPath = peelParenAndTSParentPath(hostParent);
  if (!overwriteId || chain.length || overwriteStmtPath?.node?.type !== 'ExpressionStatement'
    || !isReReferenceableReceiver(receiver)) return;
  const id = injectPureImport(entry, hintName);
  const overwriteRef = injector.generateDeclaredRef(hostParent);
  markRewrite();
  recordJob({ hostPath: overwriteStmtPath,
    job: { host: 'assign-overwrite', local: overwriteId.name,
      bodyless: !statementListOf(overwriteStmtPath.parentPath?.node),
      // the receiver is read again at drain time: the walk has replaced a realm root by then, and the
      // node captured above still spells it raw
      value: () => overwriteDefaultGuard({
        call: callExpression(identifier(id), [duplicateReceiver(peelTransparentExpr(hostParent.node.right), injector)]),
        localName: overwriteId.name,
        ref: overwriteRef,
      }) } });
}

// a value-SELECTING init under a sentinel-kept prop: a LOGICAL over KNOWN library surfaces
// keeps extracting - whichever branch selects, the slot answers the polyfill - and so does
// one whose LEFT statically selects (the right is dead text). one carrying a USER operand
// (`sel || globalThis`) declines whole: the extraction would answer
// the ponyfill on the user branch too. the ternary mirror owns its own shapes
export function divergingSentinelSelectorDeclines({ declarator, meta, metaPath, chain, kind },
  { adapter, injectorState, resolveGlobalPolyfill }) {
  const selectingInit = peelTransparentExpr(declarator.init);
  function knownSurfaceOperand(node) {
    let operand = peelTransparentExpr(node);
    if (operand?.type === 'SequenceExpression') operand = peelTransparentExpr(operand.expressions.at(-1));
    if (operand?.type === 'LogicalExpression') {
      return knownSurfaceOperand(operand.left) && knownSurfaceOperand(operand.right);
    }
    if (operand?.type === 'Identifier') {
      return proxySurfaceIdentifier(operand, { adapter, injectorState })
        || (!adapter.getBinding({ scope: nodeSite(operand, metaPath).scope, name: operand.name, path: nodeSite(operand, metaPath).path })
          && !!resolveGlobalPolyfill(operand.name));
    }
    return !!findProxyGlobal(operand, { ...nodeSite(operand, metaPath), adapter });
  }
  return (selectingInit?.type === 'ConditionalExpression'
    || (selectingInit?.type === 'LogicalExpression'
      && !staticallySelectedLeft({ selecting: selectingInit, meta, metaPath, soleBinding: false, chain, adapter, kind })
      && !knownSurfaceOperand(selectingInit)))
    && !allProxySelectingInit(declarator.init, { adapter, injectorState });
}

// the assignment-form twin of the declarator-host alias registrations: the ctor hint /
// fold source is what lets a later read resolve through the extracted alias
export function registerAssignmentExtractAlias({ prop, kind, entry, hintName, hostParent, exprStmtPath, metaPath },
  { adapter, injectorState }) {
  if (prop.value.type !== 'Identifier') return;
  const localName = propLocalName(prop);
  if (kind === 'global' && hintName) {
    const aliasBinding = adapter.getBinding({ scope: metaPath.scope, name: localName, path: metaPath });
    if (!aliasBinding?.node) {
      registerBindinglessCtorAlias({ injector: injectorState, adapter, localName, hint: hintName });
    } else {
      maybeRegisterAssignmentAliasWrite({
        injector: injectorState,
        adapter,
        binding: aliasBinding,
        localName,
        hint: hintName,
        assignNode: hostParent.node,
        stmtPath: exprStmtPath,
      });
    }
  } else if (kind !== 'global' && entry) {
    injectorState?.registerBodyExtractAlias?.(localName, entry, metaPath.scope?.getBinding?.(localName));
  }
}

// a receiver spelled a SECOND time: the clone is taken off the rewritten tree (its claims
// ride along), and the refs the walk planted inside its own functions re-mint - they have
// no declaration in the copy otherwise
export function duplicateReceiver(node, injector) {
  const clone = cloneStamped(node);
  injector?.recloneDeclaredRefs?.(clone);
  return clone;
}

// a nav whose live `?.` sits over an ERASABLE hop renders as the guard the collapse would
// spell: the hop's object is the probe, the hop's own ponyfill the alternate, and the tail
// above it hangs back on. null where no such hop carries the short-circuit
export function guardedNavPassthrough(receiver, metaPath, ctx) {
  const { adapter, resolveGlobalPolyfill } = ctx;
  const plan = guardedNavPassthroughPlan(receiver, ({ name }) => resolveGlobalPolyfill(name),
    { ...nodeSite(receiver, metaPath), adapter });
  return plan && renderPassthroughProbe(plan, metaPath, ctx);
}

// A retained native subtree is cloned at drain time. Its free realm names still need the
// binding's substitution walk; the common renderer owns the guard, tail and sealed read.
function renderPassthroughProbe(plan, metaPath, ctx) {
  return renderClaimProbe(plan, {
    injectImport: ctx.injectPureImport,
    cloneHost: source => substituteProxyRootsInClone(cloneStamped(source), metaPath, ctx),
  });
}

// the sealed receiver READ a swap erases, PLANNED on the pristine tree: the seal's inner nav
// renders the guard the collapse spells (its `?.` object the probe, its own ponyfill the
// alternate, the hop's key effects riding inside it) and the boundary member hangs back on.
// planned, not rendered, because the drain sees a tree the walk has already collapsed - there
// the inner nav no longer answers the undefinability question the probe exists for
export function planSealedNavProbe(receiver, metaPath, ctx) {
  if (!metaPath || !receiver) return null;
  const read = peelTransparentExpr(receiver)?.type === 'LogicalExpression'
    ? peelTransparentExpr(receiver).left : receiver;
  return directClaimProbePlan(receiver, meta => ctx.resolvePure(meta, metaPath),
    { ...nodeSite(read, metaPath), adapter: ctx.adapter }, { preserveRead: true });
}

// Accept a read while its child paths are live, for a queued job or immediate rendering.
// The pure question above is also used speculatively; only acceptance claims leaf effects
// and snapshots the guard spelling.
export function captureSealedNavProbe(receiver, metaPath, ctx) {
  return captureProbePlan(planSealedNavProbe(receiver, metaPath, ctx), metaPath, ctx);
}

// Render the accepted sealed read through the common renderer. A passthrough binds its
// retained native receiver at drain time; the boundary read is part of the same render.
export function renderSealedNavProbe(plan, metaPath, ctx) {
  if (!plan) return null;
  let node;
  if (plan.kind !== 'passthrough') node = renderClaimProbe(plan, {
    injectImport: ctx.injectPureImport, cloneHost: source => duplicateReceiver(source, ctx.injector),
  });
  else {
    const passthrough = guardedNavPassthroughPlan(plan.boundary.inner, ({ name }) => ctx.resolveGlobalPolyfill(name),
      { ...nodeSite(plan.boundary.inner, metaPath), adapter: ctx.adapter });
    node = passthrough && renderPassthroughProbe({ ...passthrough, boundary: plan.boundary, key: plan.key }, metaPath, ctx);
  }
  if (node) probeFacts.set(node, plan.residual);
  return node;
}

// Accept and render one immediate sealed read while its child paths are still available.
export function sealedNavProbeRead(receiver, metaPath, ctx) {
  return renderSealedNavProbe(captureSealedNavProbe(receiver, metaPath, ctx), metaPath, ctx);
}

// the SHAPE of the read a fully-consumed pattern discards, planned on the PRISTINE tree: by
// drain time the walk has collapsed the nav, and the guard render spells its own leaf. null
// where the value cannot be undefined - there is nothing for the read to throw on
export function planDiscardedInitProbe(initNode, metaPath, ctx) {
  return discardedInitProbePlan(initNode, meta => ctx.resolvePure(meta, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath });
}

// Retain native slots before accepting children: a replacement updates the container, not
// the old node or path. Guard/holder proofs stay pristine; their source children settle before
// the snapshot, and source-spine edit paths are then bound to that actual captured spelling.
// Deferred callers register their pristine host facts before accepting this plan.
export function captureProbePlan(plan, metaPath, ctx) {
  if (!plan) return plan;
  const remaining = directClaimProbeEffects({ decision: plan, node: null }, harvestDiscardedReceiverSE(plan.source,
    { ...nodeSite(plan.source, metaPath), adapter: ctx.adapter }));
  const residual = remaining.map(node => ({ node, slot: node && pathOfNode(metaPath, node) }));
  // An alias holder stays live until drain, as before: eagerly walking a stored RHS can
  // rebase its enclosing receiver before the natural claim reaches it.
  if (plan.kind === 'alias' || plan.kind === 'passthrough') return { ...plan, residual };
  const effects = plan.alternateEffects ?? [];
  const sources = [plan.test?.source?.source].filter(Boolean);
  const nodes = [...effects, ...sources];
  const slots = nodes.map(node => pathOfNode(metaPath, node));
  // Only source child slots are independently claimable. Walking the guard spine itself
  // rewrites its root before a sibling pattern key has asked its pristine receiver question.
  ctx.claimLive?.([...effects, ...plan.test?.source?.children ?? []], metaPath);
  const live = nodes.map((node, index) => slots[index]?.container[slots[index].key] ?? node);
  let index = effects.length;
  function capture(source) {
    return source && claimProbeSourceSlot(cloneStamped(live[index++]), meta => ctx.resolvePure(meta, metaPath),
      { ...nodeSite(source.source, metaPath), adapter: ctx.adapter });
  }
  const test = capture(plan.test?.source);
  return {
    ...plan,
    residual,
    alternateEffects: live.slice(0, effects.length),
    test: test ? { ...plan.test, source: test } : plan.test,
  };
}

// the KEY a discarded read spells over a kept store the realm may leave void, or null: by drain time
// the collapse may have folded that key into the extraction, and the lift rebuilds the read from
// this name off the live store. the VERDICT is the shared canon's - this only names its answer
export function absentableStoreReadKeyOf(initNode, ctx) {
  const read = readStandsOverAbsentableStore(initNode, ctx);
  return read ? memberKeyName(read) : null;
}

// Source effects by rendered probe identity. A null slot is the probe's position in the
// common effect order; native slots supply children rewritten after the source decision.
const probeFacts = new WeakMap();

// The complete source effect order, with the rendered read in its decided slot.
export function probeEffectNodes(probe) {
  const slots = probeFacts.get(probe);
  return slots ? slots.map(({ node, slot }) => node ? slot?.container[slot.key] ?? node : probe) : [probe];
}

// Effects left to a host that places the read separately. Carried writes were excluded by
// source identity at acceptance; the drain never searches the generated read for a target name.
export function probeResidualEffects(probe) {
  return probeEffectNodes(probe).filter(node => node !== probe);
}

// Render a captured discarded-initializer read, or accept its late sealed fallback.
export function renderDiscardedInitProbe(jobs, ctx) {
  const rendered = renderDiscardedInitProbeRead(jobs, ctx);
  if (rendered?.plan?.residual) probeFacts.set(rendered.node, rendered.plan.residual);
  return rendered?.node ?? null;
}

function renderDiscardedInitProbeRead(jobs, ctx) {
  const [job] = jobs;
  const plan = job?.initProbePlan;
  const metaPath = job?.metaPath;
  if (!metaPath || jobs.some(item => item.seKey)) return null;
  // a SEALED init reads through its own boundary member, and THAT read is the one native
  // performs (`(globalThis.window?.[(c++, 'self')]).Object` - the pattern key never reaches it)
  const sealed = renderSealedNavProbe(job.sealedProbePlan, metaPath, ctx)
    ?? sealedNavProbeRead(job.declarator?.init ?? job.assignment?.right, metaPath, ctx);
  if (sealed) return { node: sealed, plan: job.sealedProbePlan };
  if (!plan) return null;
  // The alias holder's child slots finish their natural claims before drain. Rebind only
  // source-spelling paths to that live value; the read decision remains the pristine one.
  const captured = plan.kind === 'alias' ? { ...plan, object: claimProbeSourceSlot(plan.aliasProbe.object,
    meta => ctx.resolvePure(meta, metaPath), { ...nodeSite(plan.aliasProbe.object, metaPath), adapter: ctx.adapter }) } : plan;
  const guarded = renderClaimProbe(captured, {
    injectImport: ctx.injectPureImport, cloneHost: source => duplicateReceiver(source, ctx.injector),
  });
  if (plan.kind === 'alias') return { node: guarded, plan };
  const aliasCtx = { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath };
  // The outermost pattern hop is the first read; a logical selection keeps its leaf read.
  const keyProp = job.chain?.length && !job.initProbeReadsLeaf ? job.chain.at(-1).hopProp : job.prop;
  const { lookupKey } = resolveSynthKeys({ node: keyProp, ...aliasCtx });
  if (typeof lookupKey !== 'string') return null;
  return { node: renderAliasHeldProbeRead({ key: lookupKey, computed: !isValidIdentifierName(lookupKey),
    property: keyProp.computed && keyProp.key?.type === 'Identifier' ? cloneNode(keyProp.key) : null }, guarded), plan };
}

// the SE prefix of a RE-ANCHORED assignment init lifts to its own statement: the anchored read
// is not the expression the source wrote, and babel spells the effect once, ahead of it
// (`({ self: { k: v } } = (eff(), globalThis))` -> `eff(); ({ k: v } = _globalThis);`). an
// unbraced control body takes a block for the pair
export function liftAssignInitPrefix(host, metaPath, program) {
  const init = peelTransparentExpr(host.right);
  if (init?.type !== 'SequenceExpression' || !metaPath) return;
  let stmtPath = metaPath;
  while (stmtPath?.node && stmtPath.node.type !== 'ExpressionStatement') stmtPath = stmtPath.parentPath;
  const stmtNode = stmtPath?.node;
  if (!stmtNode || peelTransparentExpr(stmtNode.expression) !== host) return;
  const prefix = init.expressions.slice(0, -1);
  if (!prefix.length) return;
  host.right = init.expressions.at(-1);
  const statements = [...prefix.map(expr => expressionStatement(expr)), stmtNode];
  const parentNode = stmtPath.parentPath?.node;
  const parentList = statementListOf(parentNode);
  const at = parentList ? parentList.indexOf(stmtNode) : -1;
  if (at >= 0) parentList.splice(at, 1, ...statements);
  else replaceNodeInTree(program, stmtNode, { type: 'BlockStatement', body: statements });
}

// the first statement replacing a host inherits its OPENING position: esrap attaches comments
// by offset, so a synthesized leading statement with no span lets the host's leading comment
// flush before the first spanned node inside it (`const _ref = // note\n[4, 5];`). `lifted` leading
// statements are effects taken out of the host's initializers: the comments the host's statement
// (`statementNode`, an export wrapping it included) owns lead the statement after them instead
// (`ownedLeadingComments`), and the printer anchors them there
export function anchorLeadingStatement({ statements, hostNode, statementNode = hostNode, lifted = 0 }) {
  const [first] = statements;
  if (first && Number.isInteger(hostNode?.start) && !Number.isInteger(first.start)) {
    first.start = hostNode.start;
    first.end = hostNode.start;
  }
  if (lifted > 0 && lifted < statements.length && Number.isInteger(statementNode?.start)) {
    statements[lifted].ownedCommentsAt = statementNode.start;
  }
  return statements;
}

// where a passthrough READ off a collapsed proxy run is based: the hops the collapse drops fall
// away, and the deepest one pure can back carries the read - the root answering only where none of
// them is (`globalThis.self.Array.other` reads `_self.Array.other`, `globalThis.window.Array.other`
// reads off the root). an ALIAS root keeps its own identifier by the collapse's alias rule, which
// its caller says with `landsDeep: false`
export function proxyPassthroughBase({ rootName, keys, adapter, resolveGlobalPolyfill, landsDeep = true }) {
  let baseName = rootName;
  let rest = keys;
  while (rest.length && isPristineProxyGlobal(adapter, rest[0])) {
    if (landsDeep && resolveGlobalPolyfill?.(rest[0])) [baseName] = rest;
    rest = rest.slice(1);
  }
  return { baseName, keys: rest };
}

// the identifier a receiver IS, resolved to the pure binding that stands for it: a raw
// `globalThis` / `Map` spelled into a dispatch reads a name the engine may not have, and the
// resolution has already proved the identifier names that global
// (`{ [Symbol.iterator]: it } = Map` -> `_getIteratorMethod(_Map)`). null for anything else
export function bareProxyGlobalPure(node, metaPath, { adapter, resolveGlobalPolyfill }) {
  if (node?.type !== 'Identifier') return null;
  const site = nodeSite(node, metaPath);
  return isPristineProxyGlobal(adapter, node.name)
    || (!adapter.getBinding({ scope: site.scope, name: node.name, path: site.path }) && !isMutatedGlobalSlot(adapter, node.name))
    ? resolveGlobalPolyfill(node.name) : null;
}

// a cloned subtree the traversal will never revisit: every FREE pristine proxy global in
// it substitutes its pure binding, the shape the walk would have produced in place. returns the
// node to USE: a swap lands in its parent's slot, but a clone that IS the bare global has no slot
// to land in (`{ w: globalThis }` consumed down to its value), so the caller takes it back here
export function substituteProxyRootsInClone(root, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport }) {
  function proxyRootSwap(node) {
    if (!POSSIBLE_GLOBAL_OBJECTS.has(node.name) || !isPristineProxyGlobal(adapter, node.name)) return null;
    if (adapter.getBinding({
      scope: nodeSite(node, metaPath).scope,
      name: node.name,
      path: nodeSite(node, metaPath).path,
    })?.node) return null;
    const pure = resolveGlobalPolyfill(node.name);
    return pure ? identifier(injectPureImport(pure.entry, pure.hintName)) : null;
  }
  (function walk(node) {
    if (!node || typeof node !== 'object' || !node.type) return;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach((item, at) => {
          if (item?.type === 'Identifier' && !isNonReferencePosition(node, item)) {
            const swap = proxyRootSwap(item);
            if (swap) value[at] = swap;
            else walk(item);
          } else walk(item);
        });
        continue;
      }
      // a member KEY / object key spells SOURCE TEXT, never a binding - swapping one there
      // rewrites the read itself (`nav.self` would become `nav._self`)
      if (value?.type === 'Identifier') {
        const swap = isNonReferencePosition(node, value) ? null : proxyRootSwap(value);
        if (swap) node[key] = swap;
        continue;
      }
      walk(value);
    }
  })(root);
  return (root?.type === 'Identifier' ? proxyRootSwap(root) : null) ?? root;
}

export function isMintedOrProxyName(name, injectorState) {
  return POSSIBLE_GLOBAL_OBJECTS.has(name) || mintedProxyGlobalName(name, injectorState) !== null;
}

export function reanchoredInit(declarator, info, replacement) {
  const value = replacement ?? cloneNode(info.tail);
  if (info.shape === 'guard') return value;
  if (info.shape === 'ident') return replacement ?? declarator.init;
  if (info.shape === 'seq') {
    return sequenceExpression([...info.init.expressions.slice(0, -1).map(cloneNode), value]);
  }
  return sequenceExpression([info.init, value]);
}

// a ctor-hop job (pattern-valued, the anchored render) stands down when a LIVE sibling
// prop survives in its pattern: the residual must keep reading the proxy root whole
// (`{ Iterator: { a }, navigator: nav } = _globalThis` stays - babel's boundary); a
// consumed sibling (another hop, an extracted leaf) does not block
export function withoutCtorHopJobsWithLiveSiblings(jobs) {
  // a chained job consumes its hop props transitively (`{ Array: { from } }` - the
  // `from` job owns the `Array:` hop)
  const consumedProps = new Set(jobs.flatMap(job => [job.prop, ...(job.chain ?? []).map(level => level.hopProp)]));
  function isHopAnchor(job) {
    return job.prop?.value?.type === 'ObjectPattern' && !job.chain?.length && !job.symbolPattern;
  }
  // a MULTI-hop pattern whose jobs are ALL anchors has nothing consumed to re-home around, so
  // the residual stays native - babel splits the declarator only beside a consumed sibling. a
  // SOLE hop is the anchor route's own shape and keeps it
  function patternHasConsumingJob(pattern) {
    return jobs.some(other => (other.pattern === pattern && !isHopAnchor(other))
      || (other.chain ?? []).some(level => level.outerPattern === pattern));
  }
  const anchorOnlyPatterns = new Set();
  for (const job of jobs) {
    if (isHopAnchor(job) && job.pattern.properties.length > 1 && !patternHasConsumingJob(job.pattern)) {
      anchorOnlyPatterns.add(job.pattern);
    }
  }
  return jobs.filter(job => {
    if (!isHopAnchor(job)) return true;
    if (anchorOnlyPatterns.has(job.pattern)) return false;
    return job.pattern.properties.every(item => item === job.prop || consumedProps.has(item));
  });
}

// a memo-decl job's extraction target: the leaf name when the collapse minted one, the
// prop's own binding otherwise - a PATTERN-valued prop binds its pattern whole
// a SYMBOL-pattern extraction leaves the key SPELLED in a residual of its own even where every
// SIBLING was consumed too: the source reads that slot and the sentinel is what keeps the read
// (`const f = _flat(_ref); const { [_Symbol$iterator]: _unused } = _ref;`). a SOLE prop has no
// residual to keep - the dispatch is the whole declarator
export function keptSymbolSentinelResidual(declarator, declJobs, refName, mintUnusedName) {
  const symbolJob = refName && declarator.id.properties.length > 1
    ? declJobs.find(job => job.symbolPattern) : null;
  if (!symbolJob) return false;
  symbolJob.prop.value = identifier(mintUnusedName());
  symbolJob.prop.shorthand = false;
  declarator.id.properties = [symbolJob.prop];
  declarator.init = identifier(refName);
  return true;
}

// a discarded SEQUENCE-element assignment drains like the statement-position one and folds
// the result back into its slot: the extractions become sequence elements in the order the
// statement drain put them, and the generated declarations hoist ahead of the statement
// (`var _unused; ({ allSettled: _unused, ...r } = _Promise, f = _Promise$allSettled)`)
function drainSequenceAssignment({ hostNode, jobs }, { program, drainAssignment, drainAssignOverwrite, markRewrite, seqDrainedSlots }) {
  const slot = statementListSlot(program, jobs[0].seqHostStatement);
  if (!slot) return;
  const hostStmt = expressionStatement(hostNode);
  const body = [hostStmt];
  // the OVERWRITE kind folds here too: it appends its re-binds after the raw destructure, which is
  // the same statement list this drain turns back into sequence elements. without it the job found
  // no statement list at all and was dropped, leaving the claim native in this host alone
  if (jobs[0].host === 'assign-overwrite') drainAssignOverwrite({ body, at: 0, jobs });
  else drainAssignment({ hostNode: hostStmt, body, at: 0, jobs, inSequence: true });
  // what the enclosing sequence evaluates AHEAD of this element: discarded values, so they lift to
  // statements of their own and a declaration hoisted past them keeps the source's order. without the
  // lift an initialized hoist would read its receiver before those effects ran
  // ... only where a declaration hoists past them: with none, the folded elements keep their slots
  const leading = body.some(stmt => stmt.type !== 'ExpressionStatement') ? liftLeadingSequenceElements(program, hostNode) : null;
  const hoisted = [];
  const exprs = [];
  for (const stmt of body) {
    if (stmt.type === 'ExpressionStatement') {
      exprs.push(stmt.expression);
      continue;
    }
    // a generated memo / sentinel declaration has no slot inside an expression. once the leading
    // elements have lifted, an INITIALIZED one hoists whole - the spelling the other leg prints -
    // and a bare sentinel keeps its `var`, its value (where it had one) writing in place
    if (stmt.type !== 'VariableDeclaration' || stmt.declarations.some(item => item.id?.type !== 'Identifier')) return;
    for (const item of stmt.declarations) {
      if (!item.init) continue;
      if (leading) hoisted.push(variableDeclaration(stmt.kind, [item]));
      else exprs.push(assignmentExpression('=', identifier(item.id.name), item.init));
    }
    const bare = stmt.declarations.filter(item => !item.init || !leading);
    if (bare.length) {
      hoisted.push(variableDeclaration('var', bare.map(item => variableDeclarator(identifier(item.id.name)))));
    }
  }
  // a QUIET prefix element the source wrote to shape a call (`(0, globalThis)`) has no reader
  // left once the receiver re-anchors: it drops with the spelling it guarded
  const live = exprs.filter((expr, index) => index === exprs.length - 1 || mayHaveSideEffects(expr));
  if (!live.length) return;
  const folded = sequenceExpression(live);
  if (live.length > 1) seqDrainedSlots.add(folded);
  replaceNodeInTree(program, hostNode, folded);
  if (leading?.length || hoisted.length) {
    slot.body.splice(slot.at, 0, ...leading ?? [], ...hoisted);
  }
  markRewrite();
}

// the SEQUENCE elements evaluated before this host, as statements - null where the host sits in no
// sequence (nothing to lift, and a hoist past nothing is already order-safe). the elements leave the
// sequence, so the caller splices what comes back ahead of its own hoists
function liftLeadingSequenceElements(program, hostNode) {
  // Only the statement's own sequence can lift ahead of that statement. A nested sequence
  // may sit behind a guard or earlier effects that must stay ahead of its prefix.
  let sequence = null;
  let index = -1;
  walkAstNodes({ root: program, visit: node => {
    if (sequence || node.type !== 'ExpressionStatement') return !sequence;
    const candidate = peelTransparentExpr(node.expression);
    if (candidate?.type !== 'SequenceExpression') return;
    const at = candidate.expressions.findIndex(expr => peelTransparentExpr(expr) === hostNode);
    if (at !== -1) {
      sequence = candidate;
      index = at;
    }
    return !sequence;
  } });
  if (!sequence) return null;
  const at = index;
  if (at <= 0) return [];
  return sequence.expressions.splice(0, at).map(expr => expressionStatement(expr));
}

// every SEQUENCE-element assignment in the ledger, drained before the hosts whose inits hold
// them: that drain lifts the sequence prefix into statements of its own and the slot they fold
// back into stops existing
export function drainSequenceAssignments(ledger, ctx) {
  for (const entry of ledger.values()) {
    // by the SLOT the job named, not by its kind: every job carrying one lands in a sequence
    // element, and the kinds that do so differ only in which inner drain shapes the statements
    const seqJobs = entry.jobs.filter(job => job.seqHostStatement);
    if (!seqJobs.length) continue;
    entry.jobs = entry.jobs.filter(job => !job.seqHostStatement);
    for (const host of new Set(seqJobs.map(job => job.host))) {
      drainSequenceAssignment({ hostNode: entry.hostPath.node, jobs: seqJobs.filter(job => job.host === host) }, ctx);
    }
  }
}

// the declarators sharing a declaration with a claimed one: the residual split replaces that
// declaration node, and the ledger drains by its identity, so splitting a hop-host note's
// declaration early would strand the sibling's own claim
export function jobHostSiblingDeclarators(ledger) {
  const hostSiblings = new Set();
  for (const [, { hostPath, jobs }] of ledger) {
    const declNode = hostPath.node?.type === 'ExportNamedDeclaration' ? hostPath.node.declaration : hostPath.node;
    if (declNode?.type === 'VariableDeclaration'
      && jobs.some(job => job.host === 'declaration' || job.host === 'memo-decl')) {
      for (const item of declNode.declarations) hostSiblings.add(item);
    }
  }
  return hostSiblings;
}

// the pure BINDING a rendered guard hands back on its live branch (`null == x ? void 0 : _self`),
// re-readable wherever the guarded value was - null when the branch is anything else
export function guardedPureBinding(initNode, injectorState) {
  const init = peelTransparentExpr(initNode);
  if (init?.type !== 'ConditionalExpression' || init.consequent?.type !== 'UnaryExpression'
    || init.consequent.operator !== 'void') return null;
  const live = peelTransparentExpr(init.alternate);
  return live?.type === 'Identifier' && isMintedOrProxyName(live.name, injectorState) ? live.name : null;
}

export function memoJobBindingTarget(job) {
  if (job.collapseLeafName ?? job.collapseLeaf?.localName) {
    return identifier(job.collapseLeafName ?? job.collapseLeaf.localName);
  }
  return propBindingTarget(job.prop);
}

// the prop a job's claim occupies on its declarator's own level: a chained claim sits under its
// outermost hop, the prop that level's source order ranks
export function jobOuterProp(job) {
  return job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
}

// the memo route's extractions (`{ job, list }`, in source order) as the other leg's emission groups
// them: each claim binds in a declaration of its own, save a CHAINED claim right after a flat one,
// which joins that claim's declaration (`const keys = _keys(_ref), at = _at(_ref.data);`). an exported
// host and a claim led by a guard ref keep their own statements
export function groupMemoExtractions(extracted, exported) {
  const statements = [];
  let joinable = null;
  for (const { job, list } of extracted) {
    if (joinable && list.length === 1 && job.chain?.length) {
      joinable.declarations.push(...list[0].declarations);
      joinable = null;
      continue;
    }
    statements.push(...list);
    joinable = !exported && list.length === 1 && !job.chain?.length ? list[0] : null;
  }
  return statements;
}

// does the residual still bind something beside the claims' own props - a plain prop, a rest? asked
// by JOB, not by name: the sentinel rename may not have reached the prop yet
export function residualKeepsSibling(declarator, declJobs) {
  const claimed = new Set(declJobs.map(jobOuterProp));
  return declarator.id?.type === 'ObjectPattern'
    && declarator.id.properties.some(item => item.type === 'RestElement' || !claimed.has(item));
}

// Returns the matching logical left, the operand an `&&` the build decides yields, or an agreeing
// ternary arm with no test effects. Instance claims and unproven selections return null.
export function staticallySelectedLeft({ selecting, meta, metaPath, soleBinding, chain, adapter, kind }) {
  // only a STATIC / ctor claim proves the left operand IS the named built-in, so the
  // fallback right is dead. an INSTANCE claim resolved off an opaque receiver proves
  // nothing about its definedness - the whole logical stays the receiver
  // (`{ keys } = Stub ?? Object` -> `_keys(Stub ?? Object)`)
  if (kind === 'instance') return null;
  // a PARTIAL consume leaves the residual reading the whole logical, which is sound while
  // that read carries no effects (`{ from, other } = globalThis.Array || Set` extracts
  // `from` and keeps `{ other } = _globalThis.Array || _Set`)
  // ... and a TERNARY whose ARMS name the same surface selects as one: the branch is the
  // receiver either way, so the test is dead text and the read is the source's own
  // (`{ Array: { of } } = g.setTimeout ? g.window : g.window`)
  if (selecting.type === 'ConditionalExpression') return agreeingTernaryArm(selecting, metaPath, adapter);
  // ... a logical the build decides selects the operand of it that runs (`decidedRunningOperand`), as a decided
  // ternary arm does: a test is a plain read, a `||` / `??` its left decides never runs its right, and the
  // operand's own effects are the receiver's. an `&&` selects nothing otherwise
  if (selecting.type === 'LogicalExpression') {
    const running = decidedRunningOperand(selecting, { ...nodeSite(selecting, metaPath), adapter });
    if (running !== selecting) return running;
    if (selecting.operator === '&&') return null;
  }
  if (selecting.type !== 'LogicalExpression' || !meta?.object || chain.length > 0) return null;
  if (!soleBinding && mayHaveSideEffects(selecting)) return null;
  // an SE-bearing left names its built-in through the sequence TAIL - the prefix is the
  // effect the discarded read re-emits, not part of the name
  // (`{ from } = (e++, globalThis.self.Array) || Set`) - and a static container's slot names the one it
  // holds, as the meta named it (`box.U` over `const box = { U: Map }`)
  const left = peelTransparentExpr(selecting.left);
  const named = peelTransparentExpr(peelReceiverSequenceTail(left));
  const site = { ...nodeSite(left, metaPath), adapter };
  const leftName = resolveObjectName({ objectNode: named, ...site }) ?? staticContainerReceiverName({ node: named, ...site });
  return leftName === meta.object ? left : null;
}

// can the flatten and extraction routes CONSUME this destructure prop as a leaf of its own - bind
// the claim off the prop and take the prop out of the pattern? a plain key with a binding value,
// a defaulted one, or (for a ctor claim, `ctorPattern`) a pattern value that re-anchors on the
// resolved binding; a computed key bare-bound (the meta only exists when the key resolved) or on
// the sentinel + guard channel when it carries an effect or names a symbol; a symbol prop's
// PATTERN value, which destructures the helper result. a rest, a computed key with a pattern
// value, a nested default the routes have no shape for: those keep the prop verbatim, and the
// residual reads it natively. `patternLeft` admits a defaulted pattern value on a static leaf
export function isPlainConsumableProp(prop, {
  symbolProp = false, ctorPattern = false, patternLeft = false, memberSlot = false,
} = {}) {
  if (prop.type !== 'Property') return false;
  // a computed key qualifies bare-bound (the meta only exists when the key resolved; an
  // SE key takes the sentinel route so its effect replays in the residual); a symbol
  // prop's PATTERN value additionally destructures the helper result
  // (`{ [S]: { next } } = obj` -> `const { next } = _getIteratorMethod(obj)`), and its
  // DEFAULT guards it (the helper returns undefined on a genuine non-iterable, so the
  // memoized `=== void 0` test keeps the native-miss semantics)
  if (prop.computed) {
    return prop.value?.type === 'Identifier'
      || memberSlot
      // a DEFAULTED SE-key prop extracts through the sentinel + guard-ternary channel; a key that
      // FOLDS with no effect extracts like its dotted spelling, the default dead over the pure
      || (prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier')
      || (symbolProp && (prop.value?.type === 'ObjectPattern'
        || (prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'ObjectPattern')));
  }
  if (prop.key?.type !== 'Identifier' && prop.key?.type !== 'Literal') return false;
  if (prop.value?.type === 'Identifier') return true;
  // ... and a MEMBER SLOT whose root the caller proved writable consumes exactly like a binding:
  // the extraction writes into the slot the source named instead of declaring a name
  if (memberSlot) return true;
  // a CTOR claim with a pattern value re-anchors the pattern on the resolved binding
  // (`{ Set: { union } } = globalThis` -> `const { union } = _Set`)
  if (ctorPattern && prop.value?.type === 'ObjectPattern') return true;
  if (prop.value?.type !== 'AssignmentPattern') return false;
  if (prop.value.left?.type === 'Identifier') return true;
  // an extraction binds the guard to whatever the value's left spells, so a PATTERN default
  // consumes whichever of the two it is - the instance guard over a memo (`const [first] = (_ref =
  // _at(src)) === void 0 ? [] : _ref`) and the static one over the import binding (`const [o] =
  // _Array$of === void 0 ? [] : _Array$of`), both the babel canon. the caller clears the left,
  // having asked whether its leaves carry claims the composed extraction would own
  return patternLeft;
}

// only a REST sibling blocks: it reads "everything the pattern did not consume", so a
// removed prop changes what it collects (babel renames to `_unused` sentinels - staged).
// computed / defaulted siblings keep their own routing and survive in the residual
export function hasRestSibling(pattern, ctx = null) {
  // ... and a HOP whose key carries an effect keeps its level exactly as a rest does: the hop
  // retires to a sentinel, the key runs once where it stands (the provider plan's own rule)
  return hasRestSiblingExcept(pattern.properties, null) || patternLevelKeepsEffectfulHop(pattern, ctx);
}

// the discarded siblings of a LITERAL CONTAINER the extraction consumed whole: they run ahead
// of the slot the extraction read, so they belong in the value, not in a statement after it.
// every other init shape keeps the statement lift (`rescueEmptiedDeclaratorInit`)
export function literalContainerRescue(declarator, declJobsHere, adapter) {
  const init = peelTransparentExpr(declarator.init);
  if (init?.type !== 'ArrayExpression' && init?.type !== 'ObjectExpression') return [];
  if (declJobsHere.some(job => job.seCarried || job.readsReceiver)) return [];
  const metaPath = declJobsHere[0]?.metaPath;
  if (!metaPath) return [];
  return discardRescueNodes({ node: declarator.init, scope: metaPath.scope, adapter, path: metaPath });
}

// the residual an extraction LEFT BEHIND re-anchors on the hop's own pure exactly as the
// declaration drain does (`({ Iterator: { customI } } = _globalThis)` -> `({ customI } =
// _Iterator)`); the assignment holds the same shape under different field names. a SENTINEL
// residual has its own anchor upstream and never asks twice
// ... and SEVERAL surviving ctor hops split into one anchored assignment EACH, the way a bodyless
// `var` splits them into one declarator each - the same shared split, whose pieces come
// back for the drain to land in the order the source wrote their hops. null from the split (a hop
// that declines) falls through to the sole-hop anchor, which leaves such a residual raw
export function anchorAssignmentResidual(assignment, jobs, reanchor, surfaceInitInfo = null) {
  if (assignment.left?.type !== 'ObjectPattern' || !assignment.left.properties.length
    || jobs.some(job => job.sentinel)) return false;
  const split = surfaceInitInfo
    ? splitCtorHopResidual({ id: assignment.left, init: assignment.right }, { surfaceInitInfo, reanchor }) : null;
  if (split) return { split };
  const view = { id: assignment.left, init: assignment.right };
  if (!reanchor(view)) return false;
  assignment.left = view.id;
  assignment.right = view.init;
  return true;
}

// the SINK slot for a discarded for-init receiver: the pattern consumed the value whole, so only
// what the source OBSERVABLY does survives. a MULTI-hop receiver cannot sink verbatim - its raw
// intermediate hop reads undefined off-browser - so its harvested effects sink alone
// (`sf()[(c++, 'self')].Map` -> `_ref = (sf(), c++)`); every other shape sinks through the shared
// collapse (`(() => globalThis)().self.Promise` -> `_ref = _Promise`)
export function discardedSinkSlot(init, { metaPath, sinkDrop, sinkPlan, planMemoArg, adapter }) {
  // a `||` / `??` its LEFT decides never runs its right - behind a prefix the carry left too: the slot
  // keeps what the rescue canon owes of the init, and none stands where that is nothing
  // (`{ of } = Array ?? (log(), Set)` sinks no slot)
  if (metaPath && decidingFallbackLeft(peelNestedSequenceExpressions(init).tail, { scope: metaPath.scope, adapter, path: metaPath })) {
    const owed = discardRescueNodesWithReads({ node: init, scope: metaPath.scope, adapter, path: metaPath });
    return owed.length ? sequenceExpression(owed) : null;
  }
  // the collapse has already reshaped the receiver, so the surviving effects are read off the
  // CURRENT spelling: a folded hop key still hangs on its member (`(b++, _globalThis).Array`
  // -> `b++`), and a whole-swapped root replays the discarded effects as its sequence prefix
  if (sinkDrop && metaPath) {
    const rescued = discardRescueNodesWithReads({ node: init, scope: metaPath.scope, adapter, path: metaPath });
    if (rescued.length) return sequenceExpression(rescued);
  }
  // the plan is the PRISTINE one the registration made: by drain time the walk has already
  // substituted the hop's own pure in place (`_self.Array`), where the navigation canon spells
  // the root binding (`_globalThis.Array`)
  const memoArgPlan = sinkPlan ?? (metaPath ? planMemoArg(init, metaPath) : null);
  return memoArgPlan ? buildMemoArg({ memoReceiver: init, memoArgPlan }) : init;
}

// an INSTANCE leaf under hops whose host pattern is a DEFAULT's left - a parameter's, a property's or
// an element's (`({ w: { at: m } } = { w: [1, 2] })`, `{ A: { B: { at } } = { B: [1, 2] } }`) - or an
// IIFE parameter: the slot the hops pair with is the receiver, and the mirror lands IN that slot -
// the flat default's instance synth one level down, through the same ledger
// ... never over a slot THIS pass minted (`of: _Array$of` inside a rendered mirror): the static
// mirror hands the leaf below it the ponyfill VALUE, and a second mirror there would dispatch on it
export function registerHopInstanceSynthSlot({ metaPath, kind, entry, hintName },
  { adapter, resolvePure, synthLedger, instanceSynthCtx, injectorState }) {
  if (kind !== 'instance' || !propBindingIdentifier(metaPath.node.value)) return false;
  const innerPattern = metaPath.parentPath;
  // the shared climb admits the host: a default's left or an IIFE parameter, an array wrapper on
  // the way being one of its hops
  const climbed = patternHopKeysToHost(innerPattern, adapter);
  if (!climbed) return false;
  const { host } = climbed;
  const basePath = host.node.type === 'AssignmentPattern' ? host.get('right')
    : detectIifeArgReceiverPath(host, climbed.hostPattern.node, adapter);
  const slotPath = basePath ? descendReceiverPathByKeys(basePath, climbed.hops, adapter) : null;
  if (!slotPath || (slotPath.node.type === 'Identifier'
    && ownOutputTests(injectorState).isOwnPassBinding(slotPath.node.name))) return false;
  return paramDefaultInstanceSynthAllowed({
    objectPatternNode: innerPattern.node,
    receiverNode: slotPath.node,
    scope: metaPath.scope,
    adapter,
    path: metaPath,
    resolvePure: m => resolvePure(m, metaPath),
  }) && registerInstanceSynthSlot({
    metaPath,
    pattern: innerPattern.node,
    entry,
    hintName,
    receiver: slotPath.node,
    synthLedger,
    ctx: instanceSynthCtx,
    receiverPath: slotPath,
  });
}

// `receiverPath`: the receiver's own path - the type resolver descends by PATH (an array literal's common
// element type is a per-element walk), and that is where the receiver's own position lives
export function registerInstanceSynthSlot({
  metaPath, pattern, entry, hintName, receiver, synthLedger, ctx, receiverPath,
}) {
  const dedupKey = synthPropDedupKey(metaPath.node, { scope: metaPath.scope, path: metaPath, adapter: ctx.adapter });
  if (!dedupKey) return false;
  let pending = synthLedger.get(pattern);
  if (!pending) {
    const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter: ctx.adapter });
    if (!plan) return false;
    pending = { plan, receiver, slots: new Map(), metaPath, instanceReceiver: receiver };
    synthLedger.set(pattern, pending);
  }
  const lookupKey = pending.plan.find(item => item.dedupKey === dedupKey)?.lookupKey ?? null;
  const objectHint = lookupKey && receiverPath && ctx.resolveNodeType && ctx.toHint
    ? ctx.toHint(ctx.resolveNodeType(receiverPath)) : null;
  const typed = objectHint
    ? ctx.resolvePure({ kind: 'property', object: objectHint, key: lookupKey, placement: 'prototype' }, metaPath)
    : null;
  const use = typed?.kind === 'instance' ? typed : { entry, hintName };
  ctx.skippedNodes.add(receiver);
  pending.slots.set(dedupKey, { helper: ctx.injectPureImport(use.entry, use.hintName), receiver });
  return true;
}

// the anchoring bar the slot DEFAULTS set: a re-anchored render spells a default verbatim, so
// one that would need its own injection defers the whole anchor. an INERT default (a literal,
// an empty object / array) needs none and lets the anchor through (`{ [S]: d = null }`)
const INERT_DEFAULT_TYPES = new Set(['Literal', 'TemplateLiteral', 'Identifier']);
export function patternHasPolyfillableDefault(node) {
  while (node?.type === 'RestElement' || node?.type === 'SpreadElement') node = node.argument;
  switch (node?.type) {
    case 'AssignmentPattern': {
      const value = peelTransparentExpr(node.right);
      const inert = INERT_DEFAULT_TYPES.has(value?.type)
        || ((value?.type === 'ObjectExpression' && !value.properties.length)
          || (value?.type === 'ArrayExpression' && !value.elements.length));
      return !inert || patternHasPolyfillableDefault(node.left);
    }
    case 'ArrayPattern': return node.elements.some(patternHasPolyfillableDefault);
    case 'ObjectPattern': return node.properties.some(prop => patternHasPolyfillableDefault(
      prop.type === 'RestElement' || prop.type === 'SpreadElement' ? prop.argument : prop.value));
    default: return false;
  }
}

// a plain SE PREFIX ahead of a HOP nav, with the pattern consuming the declarator WHOLE: the
// prefix lifts as its own statement ahead of the extraction (source order, exactly once). a
// chain-assignment in the prefix is not liftable - it replays whole through its own channel
// `tailRoot`: the proxy global a CALL tail provably yields (the caller's inline-canon answer) - the
// nav question is asked of it instead of the call, which the lift then drops for that global.
// `initNode` is the running operand where the caller has already decided the initializer.
export function seCarriedHopNav({ forInit, chain, declarator, prop, kind = null, tailRoot = null, initNode = declarator.init }) {
  const init = peelTransparentExpr(initNode);
  // ... and a kept WRITE is a prefix of its own: the statement it lifts to STORES the same value the
  // nav then reads (`(kw = globalThis)` -> `kw = _globalThis;` + the dispatch off `_globalThis`), so
  // the write survives where re-spelling it inside the dispatch would run it twice.
  // INSTANCE only: a static leaf binds its pure directly and both legs already carry the write inside
  // that value (`const from = (a = _globalThis, _Array$from)`) - lifting there would part them
  // ... and a SEQUENCE that ends in that write is the same shape one layer out: the whole init lifts,
  // its last expression included, and the nav reads what the write stored
  const writeTail = init?.type === 'AssignmentExpression' ? init
    : init?.type === 'SequenceExpression' && peelTransparentExpr(init.expressions.at(-1))?.type === 'AssignmentExpression'
      ? peelTransparentExpr(init.expressions.at(-1)) : null;
  // a FOR-HEAD takes it too: its init runs exactly once, so the lifted write ahead of the loop
  // stores what the header would have stored, in the same order
  if (kind === 'instance' && chain.length > 0 && writeTail
    && patternBindingCount(declarator.id) === patternBindingCount(prop.value)) {
    return isPureNavReceiver(peelChainRootValue(writeTail));
  }
  // a WRITE among the lifted expressions is no obstacle for an INSTANCE claim: the whole prefix
  // becomes statements ahead of the extraction, so the write runs where it ran, exactly once - the
  // refusal below stands for the other kinds, whose value carries the prefix instead of lifting it
  return !forInit && chain.length > 0 && init?.type === 'SequenceExpression'
    && patternBindingCount(declarator.id) === patternBindingCount(prop.value)
    && (kind === 'instance'
      || init.expressions.slice(0, -1).every(expr => peelTransparentExpr(expr)?.type !== 'AssignmentExpression'))
    && (tailRoot ? isPureNavReceiver(tailRoot) : isPureNavAfterSePrefix(init));
}

// the STATEMENTS an init performs ahead of the value it yields, and that value: a sequence's leading
// expressions and its tail, a kept WRITE whole (the store is an effect and what the nav then reads)
// with the stored value's own tail, null where the init is neither shape
export function liftableInitPrefix(initNode) {
  const init = peelTransparentExpr(initNode);
  if (init?.type === 'AssignmentExpression') return { prefix: [init], tail: peelChainRootValue(init) };
  if (init?.type !== 'SequenceExpression') return null;
  const { prefix, tail } = peelNestedSequenceExpressions(init);
  const storesTail = peelTransparentExpr(tail)?.type === 'AssignmentExpression';
  return { prefix: storesTail ? [...prefix, tail] : prefix, tail: peelChainRootValue(init) };
}

// the EXPRESSIONS an SE-carrying init performs before it yields the receiver - the lift shape's
// prefix, asked only where a claim carries it. The binding supplies its effect-trimming context.
export function carriedInitPrefix(declarator, declJobs, ctx) {
  if (declJobs.every(job => !job.seCarried)) return [];
  // The live operand of a decided selection owes the same prefix as a bare sequence.
  return observablePrefixElements(liftableInitPrefix(decidedRunningOperand(declarator.init, ctx))?.prefix ?? [], ctx);
}

// the prefix travels WITH the extraction's value: inside the dispatch ARGUMENT where the claim has
// one, including the read in its default guard; otherwise it prefixes the value (`from = (eff(), _Array$from)`).
// this is the ONE shape every host accepts - a control slot hosts no statements at all - which is why
// no host analysis is left here and why both legs print it
export function carryInitPrefix(value, prefix) {
  if (!prefix.length) return value;
  const read = instanceDefaultReads.get(value) ?? value;
  if (read?.type === 'CallExpression' && read.arguments.length === 1) {
    read.arguments[0] = sequenceExpression([...prefix, read.arguments[0]]);
    return value;
  }
  return sequenceExpression([...prefix, value]);
}

// the PROXY-NAV base a synth receiver reduces to: pristine hops fold away, the root identifier
// carries the literal, and the keys that survive become the passthrough prefix. an ALIAS of a
// proxy global roots the nav too (`const g = globalThis; g.self.Map`) - the passthrough resolves
// through the canonical surface either way. a SEQUENCE holding the nav is transparent: the swap
// replaces the receiver WHOLE, so an effect-free prefix dies with it and an effect-bearing one
// re-runs ahead of the literal; only the OUTERMOST one may carry effects, a deeper prefix has no
// slot in the render order. `?.` hops qualify like plain ones - the collapse anchors on
// always-defined pure bindings, so the short-circuit is moot
export function proxyNavSynthBase(receiver, { scope, adapter, path, resolveGlobalPolyfill }) {
  if (receiver?.type !== 'MemberExpression' && receiver?.type !== 'SequenceExpression') return null;
  let keys = [];
  let cur = receiver;
  let seqPrefix = null;
  for (;;) {
    if (cur?.type === 'MemberExpression' && !cur.computed) {
      keys.unshift(cur.property?.name);
      cur = unwrapRuntimeExpr(cur.object);
      continue;
    }
    if (cur?.type === 'SequenceExpression'
      && !(seqPrefix && cur.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr)))) {
      seqPrefix ??= cur;
      cur = unwrapRuntimeExpr(cur.expressions.at(-1));
      continue;
    }
    break;
  }
  // an INLINE-resolvable CALL root names its proxy global through the shared resolver, and the
  // literal replaces the whole receiver anyway - so the nav reads off that global's own pure
  // (`(() => globalThis)().self.Array` -> `_globalThis.Array`, the call dropping with the rest)
  if (cur?.type === 'CallExpression' && !cur.optional) {
    const called = resolveObjectName({ objectNode: cur, scope, adapter, path });
    if (called && POSSIBLE_GLOBAL_OBJECTS.has(called) && isPristineProxyGlobal(adapter, called)) {
      cur = { type: 'Identifier', name: called };
    }
  }
  const proxyRoot = cur?.type === 'Identifier'
    && (POSSIBLE_GLOBAL_OBJECTS.has(cur.name) || findProxyGlobal(receiver, { scope, adapter, path }) === cur);
  if (!keys.length || !keys.every(Boolean) || !proxyRoot) return null;
  // the dropped hops land where every other collapse lands - on the deepest one pure can back,
  // the root answering only where none of them is (`globalThis.self.Array` reads off `_self`)
  // ... except off an ALIAS root, which keeps its own identifier by the collapse's alias rule -
  // the hops drop onto the binding the source named (`const g = globalThis; g.self.Object`)
  const base = proxyPassthroughBase({
    rootName: cur.name,
    keys,
    adapter,
    resolveGlobalPolyfill,
    landsDeep: POSSIBLE_GLOBAL_OBJECTS.has(cur.name),
  });
  keys = base.keys;
  return {
    baseIdent: base.baseName === cur.name ? cur : { type: 'Identifier', name: base.baseName },
    passthroughPrefix: keys,
    leadingEffects: seqPrefix?.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr)) ? seqPrefix : null,
  };
}

export function insideParamPosition(metaPath) {
  for (let cur = metaPath; cur; cur = cur.parentPath) {
    if (cur.listKey === 'params' || cur.key === 'params') return true;
    if (cur.node?.type === 'VariableDeclarator' || cur.node?.type === 'ExpressionStatement') return false;
  }
  return false;
}

// does a discarded receiver DROP instead of sinking verbatim? asked on the PRISTINE tree - by
// drain time the collapse has reshaped the spine into a sequence and the shape is gone. the
// canonical decision needs a confirmed rescue node, so the harvest is asked first
export function sinkDropsReceiver(init, metaPath, adapter) {
  const inner = peelTransparentExpr(init);
  return discardRescueNodes({ node: inner, ...nodeSite(inner, metaPath), adapter }).length > 0
    && shouldDropRescueReceiver(inner);
}

// a DIVERGING selection in a wrapped slot is the per-branch MIRROR's shape: an extraction
// off it would answer the ponyfill on the USER branch too
export function divergingSelection(node, ctx) {
  const inner = peelTransparentExpr(node);
  return (inner?.type === 'ConditionalExpression' || inner?.type === 'LogicalExpression')
    && !allProxySelectingInit(inner, ctx);
}

// Allocate the loop-header refs selected by the shared evaluation decision.
export function forInitMemoVerdicts(byDeclarator, mintRefName, ctx = null) {
  const memoRefs = new Map();
  for (const [declarator, claims] of byDeclarator) {
    const [{ metaPath }] = claims;
    if (forInitNeedsReceiverMemo(declarator, claims, {
      scope: metaPath?.scope, path: metaPath?.parentPath?.parentPath,
      adapter: ctx?.adapter, injectorState: ctx?.injectorState,
    })) memoRefs.set(declarator, mintRefName());
  }
  return memoRefs;
}

// The bodyless overwrite keeps the native assignment before its rebinds,
// wrapping multiple statements in the existing body slot.
export function drainBodylessWrapKinds({ kind, kindJobs, hostNode }, { program, consumedAssignmentRemains }) {
  if (kind === 'assign-overwrite' && kindJobs[0]?.bodyless) {
    const overwrites = kindJobs.map(job => expressionStatement(
      assignmentExpression('=', jobBindingTarget(job), job.value())));
    // the consumed slot leaves in a bodyless slot too, and a slot left with ONE statement keeps its
    // bare shape - the block is what holds two (the surviving destructure and the dispatch)
    const body = [...consumedAssignmentRemains(kindJobs) ?? [hostNode], ...overwrites];
    replaceNodeInTree(program, hostNode, body.length === 1 ? body[0] : { type: 'BlockStatement', body });
    return true;
  }

  return false;
}

// the memo statement a declarator's split emits. a chain job dispatching on the RESOLVED
// NESTED element memoizes THAT element: the residual keeps the wrapper with the element
// slot swapped to the ref, so both readers share one identity (`const _ref = [5, [6]];
// ... = { y: _ref };`). a memo LIFTED out of a multi-declarator host is a statement of
// its own, and babel gives it `const`; one that stays inside keeps the host's kind
// the receivers a residual could ALSO have spelled twice for free - a constant literal, an SE-free
// member or branch. those keep the comma join; an opaque one (a call, a member off a call) has to be
// memoized outright, and there both legs plant a statement ahead of the split
export function emitDeclaratorMemo({ refName, declarator, statements, declJobs, kind }) {
  if (!refName) return null;
  const memoisedInit = splitDeclaratorMemo({ refName, declarator, declJobs });
  statements.push(...renderDestructureStatements([], { capture: { name: refName, value: memoisedInit, kind } }));
  return memoisedInit;
}

// ... the split itself: what the memo holds, and the residual's init reading the ref in its place
export function splitDeclaratorMemo({ refName, declarator, declJobs }) {
  const nestedMemoNode = declJobs.find(job => job.nestedMemoNode)?.nestedMemoNode ?? null;
  const memoisedInit = nestedMemoNode ?? declarator.init;
  if (nestedMemoNode) replaceNodeInTree(declarator.init, nestedMemoNode, identifier(refName));
  else declarator.init = identifier(refName);
  return memoisedInit;
}

// the memo declarators a render minted into a declaration, so the declarators ahead of them run first: the
// split giving each declarator its own statement declares these `const`, as a memo standing apart is declared -
// it binds nothing the source named
const memoDeclarators = new WeakSet();
export function markMemoDeclarators(declarators) {
  for (const item of declarators) memoDeclarators.add(item);
}

// a re-anchored declarator standing beside siblings takes its own statement: the flatten
// rebuilds the declaration, and every sibling keeps its own slot (babel's split)
export function splitMultiDeclaratorHost({ program, declarator, declaration, body, markRewrite }) {
  let target = declaration && body ? { declaration, body } : null;
  if (!target) walkAstNodes({
    root: program,
    visit(node, parent) {
      if (target || node.type !== 'VariableDeclaration' || node.declarations.length < 2) return;
      const list = statementListOf(parent);
      if (!node.declarations.includes(declarator) || !list) return;
      target = { declaration: node, body: list };
    },
  });
  if (!target) return;
  // A sibling drain can replace the statement while retaining its declarators. Follow
  // those same nodes in their current statement list.
  const source = new Set(target.declaration.declarations);
  const statements = target.body.filter(statement => statement.type === 'VariableDeclaration'
    && statement.declarations.some(item => source.has(item)));
  for (const statement of statements) {
    if (statement.declarations.length <= 1) continue;
    const at = target.body.indexOf(statement);
    target.body.splice(at, 1, ...statement.declarations.flatMap(item => renderDestructureStatements([item], {
      kind: memoDeclarators.has(item) ? 'const' : statement.kind,
    })));
    markRewrite();
  }
}

// do the jobs of one declarator all keep an SE-KEY sentinel - the claims the sibling join serves?
function seKeySentinelJobs(declJobs, adapter = null) {
  return declJobs.every(job => job.sentinel
    && computedKeyHasSideEffects(job.prop, { ...nodeSite(job.prop, job.metaPath), adapter }));
}

// the bodyless `var` slot's sentinel memo join: the memo the LEADING declarator, the residual, its
// extractions (segmented per key) and the trailing siblings in ONE statement (`if (c) var _ref =
// eff(), { [k]: _unused, z } = _ref, s = _at(_ref), q = 2;`) - a `var` slot takes the memo as a
// declarator whatever the residual holds, since a statement of its own would brace the slot
function joinBodylessSentinelMemo({ declaration, byDeclarator, adapter }, { mintRefName, removeConsumedProps, markRewrite }) {
  const declarators = [];
  for (const declarator of declaration.declarations) {
    const declJobs = byDeclarator.get(declarator) ?? [];
    if (!declJobs.length) {
      declarators.push(declarator);
      continue;
    }
    for (const job of declJobs) job.bindingTarget = jobBindingTarget(job);
    const memoRef = declJobs.some(job => job.needsMemo) ? mintRefName() : null;
    if (memoRef) {
      declarators.push(variableDeclarator(identifier(memoRef), splitDeclaratorMemo({ refName: memoRef, declarator, declJobs })));
    }
    const values = declJobs.map(job => job.value(memoRef));
    removeConsumedProps(declJobs);
    if (declarator.id.type !== 'ObjectPattern' || declarator.id.properties.length !== 0) {
      declarators.push(...seKeySegmentedDeclarators(declarator, declJobs, memoRef, adapter));
    } else declarators.push(...declJobs.map((job, at) => variableDeclarator(jobBindingTarget(job), values[at])));
  }
  declaration.declarations = declarators;
  markRewrite();
}

// the bodyless MULTI-declarator slot without a memo: the statement fits the slot as it is, each
// jobbed declarator keeping its (renamed) residual beside its extractions. the ORDER is what the
// residual OWES, the statement host's rule: an SE key runs before the dispatch that reads its
// receiver, so that residual leads (`var first = init, { [SE]: _unused } = rows, fm = _flatMap(rows);`);
// a claim reading nothing off it (a static, a ctor) binds ahead, where the split prints it
export function joinBodylessSiblingExtractions({ declaration, jobs, adapter = null }, { removeConsumedProps, markRewrite }) {
  const byDeclarator = Map.groupBy(jobs, job => job.declarator);
  const declarators = [];
  for (const declarator of declaration.declarations) {
    const declJobs = byDeclarator.get(declarator) ?? [];
    const extracted = declJobs.map(job => ({ job, item: variableDeclarator(jobBindingTarget(job), job.value()) }));
    removeConsumedProps(declJobs);
    const emptied = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0;
    declarators.push(...extracted.filter(({ job }) => !bodylessExtractionFollows(job, adapter)).map(({ item }) => item));
    if (!emptied) declarators.push(declarator);
    declarators.push(...extracted.filter(({ job }) => bodylessExtractionFollows(job, adapter)).map(({ item }) => item));
  }
  declaration.declarations = declarators;
  markRewrite();
}

// ... the claims that follow their residual there (asked of the prop: a bodyless job carries no `seKey`)
function bodylessExtractionFollows(job, adapter) {
  return !!(job.sentinel && job.readsReceiver && job.prop?.computed
    && computedKeyHasSideEffects(job.prop, { ...nodeSite(job.prop, job.metaPath), adapter }));
}

// the bodyless MULTI-declarator slot whose jobs need a memo: SE-key sentinels over a `var` take the
// sibling join above; a rest-kept residual takes the split shape (extraction ahead), and a lifted
// prefix without a memo needs its statements - those slots become a block, each declarator its own
// statement
export function drainBodylessMultiMemo({ hostNode, declaration, jobs, adapter = null },
  { program, mintRefName, removeConsumedProps, markRewrite }) {
  const byDeclarator = new Map();
  for (const job of jobs) {
    if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
    byDeclarator.get(job.declarator).push(job);
  }
  if (declaration.kind === 'var' && byDeclarator.values().every(declJobs => seKeySentinelJobs(declJobs, adapter)
    && (declJobs.some(job => job.needsMemo) || !declJobs[0].seqPrefix?.length))) {
    return joinBodylessSentinelMemo({ declaration, byDeclarator, adapter }, { mintRefName, removeConsumedProps, markRewrite });
  }
  const statements = [];
  for (const declarator of declaration.declarations) {
    const declJobs = byDeclarator.get(declarator) ?? [];
    if (!declJobs.length) {
      statements.push(variableDeclaration(declaration.kind, [declarator]));
      continue;
    }
    const memoRef = declJobs.some(job => job.needsMemo) ? mintRefName() : null;
    // the lifted SE prefix runs FIRST, once, and the residual reads the quiet tail; a
    // MEMOIZED init keeps its sequence WHOLE - the memo is where it evaluates
    const [{ seqPrefix, initTail }] = declJobs;
    if (seqPrefix?.length && !memoRef) {
      const { metaPath } = declJobs.at(0);
      const lifted = adapter ? observablePrefixElements(seqPrefix, { scope: metaPath.scope, adapter, path: metaPath })
        : observableSequenceElements(seqPrefix);
      for (const expr of lifted) statements.push(expressionStatement(expr));
      declarator.init = initTail;
    }
    const values = declJobs.map(job => job.value(memoRef));
    emitDeclaratorMemo({ refName: memoRef, declarator, statements, declJobs, kind: 'const' });
    removeConsumedProps(declJobs);
    const residualLives = declarator.id.type !== 'ObjectPattern' || declarator.id.properties.length !== 0;
    // a REST-kept residual follows its extraction, each a statement of its own - the split shape
    // (`var s = _at(_ref); var { at: _unused, ...r } = _ref;`)
    if (residualLives && !seKeySentinelJobs(declJobs, adapter)) {
      statements.push(
        ...declJobs.map((job, at) => variableDeclaration(declaration.kind, [variableDeclarator(jobBindingTarget(job), values[at])])),
        variableDeclaration(declaration.kind, [declarator]),
      );
      continue;
    }
    // ... a claim binding AHEAD of the residual takes a statement of its own there, the split's shape
    const extracted = declJobs.map((job, at) => ({ job, item: variableDeclarator(jobBindingTarget(job), values[at]) }));
    const joined = [
      ...residualLives ? [declarator] : [],
      ...extracted.filter(({ job }) => bodylessExtractionFollows(job, adapter)).map(({ item }) => item),
    ];
    statements.push(
      ...extracted.filter(({ job }) => !bodylessExtractionFollows(job, adapter))
        .map(({ item }) => variableDeclaration(declaration.kind, [item])),
      ...joined.length ? [variableDeclaration(declaration.kind, joined)] : [],
    );
  }
  if (replaceNodeInTree(program, hostNode, bodylessSlotReplacement(hostNode, statements))) markRewrite();
}

// does `root` hold `target` anywhere in its subtree? node identity, so a foreign binding's
// declaration never answers yes for a host's own init
export function nodeHoldsSubtree(root, target) {
  let found = false;
  walkAstNodes({
    root,
    visit(node) {
      if (node === target) found = true;
    },
  });
  return found || root === target;
}

// the declarator a wrapper eventually stands in: wrappers nest, and a KEY may stand between two of
// them (`{ pair: [{ at }] } = { pair: [arr] }`), so the climb takes pattern levels of either kind
export function arrayWrapperDeclarator(patternPath) {
  let top = patternPath;
  for (;;) {
    const up = top.parentPath?.node;
    if (up?.type === 'ArrayPattern' || up?.type === 'AssignmentPattern' || up?.type === 'ObjectPattern') {
      top = top.parentPath;
      continue;
    }
    if ((up?.type === 'Property' || up?.type === 'ObjectProperty') && up.value === top.node && !up.computed) {
      top = top.parentPath;
      continue;
    }
    break;
  }
  return top.parentPath?.node?.type === 'VariableDeclarator' ? top.parentPath.node : null;
}

// the statement a job's host lives in NOW: the one it was recorded against, or - once another drain
// rewrote the declaration around its own declarator, or moved that declarator out of it - whichever
// statement (export wrapper included) holds the job's declarator. `declaration` is that statement's
// VariableDeclaration, or null
export function liveHostStatement(body, hostNode, declaratorNode) {
  function holds(statement) {
    return (statement?.type === 'ExportNamedDeclaration' ? statement.declaration : statement)?.declarations?.includes(declaratorNode);
  }
  let at = body.indexOf(hostNode);
  if (declaratorNode?.type === 'VariableDeclarator' && (at === -1 || !holds(body[at]))) {
    const moved = body.findIndex(holds);
    if (moved !== -1 || at === -1) at = moved;
  }
  if (at === -1) return null;
  const statement = body[at];
  const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
  return { at, declaration: declaration?.type === 'VariableDeclaration' ? declaration : null };
}

// literal-route receiver memo: `const _ref = <recv>` ahead, the residual's slot swaps to it - once per
// shared ref; an in-slot memo writes the ref into the slot instead and declares nothing
export function emitLiteralReceiverMemos({ declarator, jobs, statements, kind, mintRefName, hostRef = null, hostInit = null }) {
  // a memo binds nothing the source named, so it takes `const` wherever it stands as a statement of
  // its own. an SE-KEY group is the exception both legs share: there the memo joins the host's own
  // declaration, and a joined declarator carries that host's kind
  const memoKind = jobs.some(job => job.seKey) ? kind : 'const';
  const memoEmitted = new Set();
  // ONE memo per receiver NODE: two claims of the same declarator read what the source read
  // once (`{ [(k(), 'toSorted')]: ts, [S]: { length } } = holder.p`), so the second plan joins
  // the first's binding instead of declaring a second copy of the same read
  const byNode = new Map();
  if (hostRef && hostInit) byNode.set(hostInit, hostRef);
  for (const job of jobs) {
    const memo = job.memoRecv;
    if (!memo) continue;
    const shared = byNode.get(memo.node);
    if (shared) {
      memo.refName = shared;
      if (memo.ident) memo.ident.name = shared;
      continue;
    }
    // a DEFERRED plan takes its number here, once per receiver node
    if (memo.deferred && !memo.refName) {
      memo.refName = mintRefName();
      memo.ident.name = memo.refName;
    }
    if (memoEmitted.has(memo.refName)) continue;
    memoEmitted.add(memo.refName);
    byNode.set(memo.node, memo.refName);
    // the memo takes what the SLOT holds NOW, never the node the plan captured: a claim inside the
    // receiver renders by replacing it, and memoizing the stale copy left the residual evaluating
    // the same thing a second time (`const [{ at: a, ...rst }] = [eff().slice()]` ran `eff` twice)
    const live = memo.slot ? memo.slot.owner[memo.slot.key] ?? memo.node : memo.node;
    // an IN-SLOT memo declares no statement of its own: the write stands where the source evaluates
    // the element, and the ref it publishes is already declared
    if (memo.inSlot && memo.slot) {
      memo.slot.owner[memo.slot.key] = assignmentExpression('=', identifier(memo.refName), live);
      continue;
    }
    statements.push(variableDeclaration(memoKind, [variableDeclarator(identifier(memo.refName), live)]));
    // the memoized node may BE the init itself - the in-tree walk only sees children
    if (memo.slot) memo.slot.owner[memo.slot.key] = identifier(memo.refName);
    else if (declarator.init === memo.node) declarator.init = identifier(memo.refName);
    else replaceNodeInTree(declarator.init, memo.node, identifier(memo.refName));
  }
}

// The memo argument keeps the planned target behind its live prefix effects, whose claims
// landed during the walk. Without a plan, keep the live receiver for its caller to duplicate.
export function buildMemoArg(pending) {
  const { memoReceiver, memoArgPlan } = pending;
  if (!memoArgPlan) return memoReceiver;
  // drain-time clones of the LIVE harvested se: the walk's in-place claims already landed
  const ahead = [...memoArgPlan.prefix, ...(memoArgPlan.liveSe ?? []).map(node => cloneNode(node))];
  return ahead.length ? sequenceExpression([...ahead, memoArgPlan.target]) : memoArgPlan.target;
}

// the sentinel memo's name, taken during the WALK so it lands ahead of the DEFAULT guard ref the
// claim is about to mint - babel allocates the receiver memo first and the guards read it after.
// only a claim owing a guard of its own qualifies: elsewhere the mint order has nothing to beat
// and an early name would shift every drain-minted slot after it
export function eagerSentinelMemoName({
  keepKey,
  memoRecv,
  kind,
  forInit,
  prop,
  declarator,
  allProxyInit,
}, sentinelMemoNames, mintRefName) {
  if (!keepKey || memoRecv || kind !== 'instance' || forInit || sentinelMemoNames.has(declarator)
    || prop.value.type !== 'AssignmentPattern'
    || !sentinelMemoInitShape(unwrapRuntimeExpr(declarator.init), allProxyInit)) return;
  sentinelMemoNames.set(declarator, mintRefName());
}

// the residual + extractions of ONE declarator: segmented where several jobs or several SE keys
// interleave, else the plain residual-then-extractions
export function seKeySegmentedDeclarators(declarator, jobs, refName, adapter = null) {
  // ... never around a REST: it gathers by exclusion of its own pattern's keys, and a segment of its
  // own would gather the claimed keys too (babel keeps the batch there, a documented boundary)
  // ... and only over the declarator's OWN props: a NESTED claim's key runs inside its level, which
  // the residual keeps whole, and a segmentation of the outer props never meets its extraction
  const rest = declarator.id.type === 'ObjectPattern' && declarator.id.properties.some(item => item.type === 'RestElement');
  if (!rest && jobs.every(job => !job.chain?.length) && (jobs.length > 1
    || patternHasSeveralSeKeys(declarator.id, 2, { ...nodeSite(declarator.id, jobs[0]?.metaPath), adapter }))) {
    return interleavedSeKeySegments(declarator, jobs, refName);
  }
  return [declarator, ...jobs.map(job => variableDeclarator(job.bindingTarget, job.value(refName)))];
}

// SEVERAL SE keys on one pattern INTERLEAVE with their extractions: native evaluates key,
// read, default, next key - so each key's residual segment sits immediately before the
// extraction that reads its slot, instead of every key running ahead of every read
export function interleavedSeKeySegments(declarator, jobs, refName) {
  const jobByProp = new Map(jobs.map(job => [job.prop, job]));
  const declarators = [];
  let buffered = [];
  for (const prop of declarator.id.properties) {
    const job = jobByProp.get(prop);
    buffered.push(prop);
    if (!job) continue;
    declarators.push(
      variableDeclarator({ type: 'ObjectPattern', properties: buffered }, cloneNode(declarator.init)),
      variableDeclarator(job.bindingTarget, job.value(refName)),
    );
    buffered = [];
  }
  if (buffered.length) {
    declarators.push(variableDeclarator({ type: 'ObjectPattern', properties: buffered }, cloneNode(declarator.init)));
  }
  return declarators;
}

// the slot value under a DEFAULT: the polyfill result decides through its own `=== void 0`,
// the default riding the alternate. a receiver-reading dispatch memoizes into the guard ref so
// the alternate reads it back instead of dispatching twice; a receiverless static needs none
export function guardedSlotValue(built, valueNode, guardRef) {
  if (!guardRef) return built;
  // the VALUE node is CAPTURED at registration - a sentinel rename detaches it from the prop
  // before the drain, and `.right` still reads lazily so later in-place rewrites land through it.
  // which of the canon's two default guards applies is the same question both of them answer by:
  // a plain binding re-reads for free, a dispatch result has to be memoized to be re-read
  return built.type === 'Identifier'
    ? renderStaticDefaultGuard({ read: built, defaultValue: valueNode.right, reread: built, alwaysDefined: true })
    : buildInstanceDefaultGuard({
      assignedRef: identifier(guardRef),
      call: built,
      defaultValue: valueNode.right,
      defaultPattern: valueNode,
      defaultName: valueNode.left?.name,
      reread: identifier(guardRef),
    });
}

export function joinSeKeySiblingDeclarator({
  hostNode,
  declarator,
  declJobsHere,
  exported,
  statements,
  markRewrite,
  refName = null,
  adapter = null,
}) {
  if (!declJobsHere.length || declarator.init?.type !== 'Identifier') return false;
  // a SOLE declarator with ONE job joins only when that job is DEFAULTED: its guard must read
  // PAST the key effect, so the residual runs first. a plain single job keeps the split,
  // extraction ahead. SEVERAL jobs join either way - the interleave gives each its own segment,
  // and so do several EFFECTFUL keys whoever claims them
  if (hostNode.declarations.length <= 1 && declJobsHere.length === 1 && !declJobsHere[0].defaulted
    && !patternHasSeveralSeKeys(declarator.id, 2, { ...nodeSite(declarator.id, declJobsHere[0].metaPath), adapter })) {
    return false;
  }
  // ... and a REST-kept sole declarator keeps the split too: no segment may take the rest - unless a
  // DEFAULT reads past the key effect, which is the join's own order
  if (hostNode.declarations.length <= 1 && declarator.id.properties.some(item => item.type === 'RestElement')
    && declJobsHere.every(job => !job.defaulted)) return false;
  if (declJobsHere.some(job => !(job.sentinel && job.seKey && !job.catchBorn && !job.chain?.length))) return false;
  if (declJobsHere.some(job => !job.readsReceiver)) return false;
  const jobs = orderDeclaratorJobs(declJobsHere);
  statements.push(exportDeclaration(variableDeclaration(hostNode.kind,
    // ... and props AFTER the job's own read segment the same way: the source reads them past
    // the extraction, so they follow it in their own declarator (`{ [k]: _unused } = _ref, m =
    // ..., { other } = _ref`)
    seKeySegmentedDeclarators(declarator, jobs, refName, adapter)),
  exported));
  markRewrite();
  return true;
}

// the declarators a bodyless block hosts, in the order the source wrote their props: the claims'
// extractions, and the ctor hops the claims left in an OBJECT residual re-anchored on their pure ctors
// (the statement host's own rule - `{ AggregateError: { customZ } } = _globalThis` -> `{ customZ } =
// _AggregateError`): several hops split into one declarator each, a sole one re-anchors the residual in
// place and takes its slot in that order; `residualTaken` says the residual is among them. the consume
// runs here, after the source order is taken and before the residual is asked
export function orderResidualDeclarators({ declarator, jobs, values }, { removeConsumedProps, surfaceInitInfo, reanchor }) {
  const sourceOrder = [...declarator.id.properties];
  function at(node) {
    return sourceOrder.includes(node) ? sourceOrder.indexOf(node) : sourceOrder.length;
  }
  removeConsumedProps(jobs);
  const pieces = jobs.map((job, index) => ({
    at: at(jobOuterProp(job)),
    item: variableDeclarator(jobBindingTarget(job), values[index]),
  }));
  let residualTaken = false;
  const split = splitCtorHopResidual(declarator, { surfaceInitInfo, reanchor });
  if (split) {
    pieces.push(...split.map(({ hop, view }) => ({ at: at(hop), item: variableDeclarator(view.id, view.init) })));
    declarator.id.properties = [];
  } else if (declarator.id.properties.length) {
    const [first] = declarator.id.properties;
    if (reanchor(declarator)) {
      pieces.push({ at: at(first), item: declarator });
      residualTaken = true;
    }
  }
  return { declarators: pieces.sort((left, right) => left.at - right.at).map(piece => piece.item), residualTaken };
}

// a residual left holding SEVERAL ctor hops over a plain surface identifier, each a sole-hop
// residual of its own once split: the pieces, or null where any hop declines (the whole residual
// then keeps its raw shape, as it does beside a sole hop that declines)
function splitCtorHopResidual(declarator, { surfaceInitInfo, reanchor }) {
  const pattern = declarator.id;
  if (pattern?.type !== 'ObjectPattern' || pattern.properties.length < 2) return null;
  if (surfaceInitInfo(declarator)?.shape !== 'ident') return null;
  const pieces = [];
  for (const hop of pattern.properties) {
    const view = { id: { type: 'ObjectPattern', properties: [hop] }, init: cloneNode(declarator.init) };
    if (!reanchor(view)) return null;
    pieces.push({ hop, view });
  }
  return pieces;
}
