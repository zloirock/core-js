// the destructure pipeline's shared vocabulary: pattern/host shape probes, plan builders
// and render spellings both the visit half and the drain half of the emitter speak
import {
  synthPropDedupKey,
  buildPatternRenderPlan,
  conditionalDestructureLeftUntouchedWarning,
  fallbackDestructureHasPolyfillableBranch,
  isConstantLiteralReceiver,
  isSeFreeBranchingReceiver,
  isSeFreeMemberReceiver,
  isReReferenceableReceiver,
  receiverPerformsEveryInitEffect,
  resolveNestedReceiverNode,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { maybeRegisterAssignmentAliasWrite, registerBindinglessCtorAlias } from '@core-js/polyfill-provider/helpers/class-walk';
import { shouldDropRescueReceiver } from '@core-js/polyfill-provider/detect-usage/members';
import {
  aliasHeldClaimProbe,
  discardRescueNodes,
  findProxyGlobal,
  foldableRealmHopKey,
  peelChainRootValue,
  peelReceiverSequenceTail,
  proxyGlobalMemberCtorPure,
  proxyReceiverValueCanBeUndefined,
  resolveObjectName,
  resolveSynthKeys,
  sealedChainBoundary,
  sealedClaimLeafGuardPlan,
  undefinableOptionalGuard,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  computedKeyHasSideEffects,
  patternKeepsEffectfulKey,
  followConstLiteralAlias,
  hasRestSiblingExcept,
  isDestructurePattern,
  isNonReferencePosition,
  isPristineProxyGlobal,
  isSynthSimpleObjectPattern,
  isValidIdentifierName,
  dropDeadSequenceElements,
  mayHaveSideEffects,
  observableSequenceElements,
  peelNestedSequenceExpressions,
  memberKeyName,
  patternBindingCount,
  peelParenAndTSParentPath,
  peelSkippableWrapperPath,
  peelTransparentExpr,
  POSSIBLE_GLOBAL_OBJECTS,
  SINGLE_STATEMENT_SLOTS,
  spreadShiftsIndex,
  isForXStatement,
  statementListOf,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapRuntimeExpr,
  arrayWrapperNeighbourEffect,
  propertyKeyName,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { ownEmittedPatternClaim, ownOutputTests } from '@core-js/polyfill-provider/detect-usage/own-output';
import { walkAstNodes } from './plugin-helpers.js';
import { cloneStamped, nodeSite } from './nav-spine.js';

import {
  memberFromKeyName,
  mintedProxyGlobalName,
  proxyStoreIsSpellable,
  replaceNodeInTree,
  stampReplacementSpan,
} from './emit-shared.js';
import {
  assignmentExpression,
  callExpression,
  cloneNode,
  expressionStatement,
  identifier,
  literal,
  memberExpression,
  sequenceExpression,
  variableDeclaration,
  variableDeclarator,
  nullFirstGuardTest,
  renderAliasHeldProbeRead,
  renderInstanceDefaultGuard,
  renderShortCircuitGuard,
  renderStaticDefaultGuard,
} from './builders.js';

// the AST engine's destructure pipeline - the STAGED port of babel's destructure-emitter
// (the design's MIG-14 blueprint): the plan layer's decisions replay over estree nodes.
// an unported shape BAILS with the pattern untouched - raw source is the honest divergence.
//
// the port's own architectural choice: the per-prop visits only VALIDATE and record into a
// per-host ledger; every pattern surgery runs in ONE drain over the final tree, after the
// traversal. babel mutates per prop and re-queues; a live estree walk would skip the sibling
// that shifts into the removed prop's slot, and the drain sidesteps that class entirely -
// it also means a prop VALUE rewritten by the ordinary visitors (a polyfilled default) is
// already in place when the residual is rebuilt
export function propLocalName(prop) {
  return prop.value.type === 'AssignmentPattern' ? prop.value.left.name : prop.value.name;
}

export const SELECTING_INIT_TYPES = new Set(['ConditionalExpression', 'LogicalExpression']);

// a prop whose value is OUR rest sentinel is a prop we already processed (a re-parse of
// our own output): nothing routes it again, ahead of EVERY route in the claim funnel -
// through the shared sibling proof. `symbolIterator`
// derives from the meta - the funnel runs before any entry resolution
// the prop's LOCAL binding name - through a slot default (`{ flat: m = fb }` binds `m`)
export function overwriteRebindEmitted({ metaPath, injectorState }) {
  return ownEmittedPatternClaim(metaPath, ownOutputTests(injectorState));
}

// the OUTERMOST hop prop of a nested claim - the per-branch mirror anchors there (its
// pattern hangs on the receiver wrapper), while a leaf claim's own path sits levels below.
// the mirror fallbacks route through EVERY hop prop of that pattern: the fromFallback
// dispatch delivers each prop claim on its own, while a fallback fires ONCE (sibling
// claims die on the mirror-owned head gate) - a half-registered multi-hop plan emits nothing
// a STATIC nested DEFAULTED sole leaf over a discardable receiver extracts as the overwrite
// babel spells (`({ Array: { from = fb } } = _globalThis)` -> `from = _Array$from;`): the
// extraction always defines, so the user default is dead, and the receiver read - a pure
// nav or a statically-selected left - drops with it
export function emitAssignStaticDefaultOverwrite({ hostParent, prop, pattern, chain, kind, entry, hintName, metaPath }, ctx) {
  if (kind === 'instance' || !chain.length
    || prop.value?.type !== 'AssignmentPattern' || prop.value.left?.type !== 'Identifier'
    || patternBindingCount(pattern) !== 1) return false;
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
  hostParent.replaceWith(assignmentExpression('=', identifier(prop.value.left.name), identifier(id)));
  return true;
}

export function routeSelectionMirror(metaPath, handlePerBranch) {
  const outerProp = outermostHopProp(metaPath);
  const patternPath = outerProp.parentPath;
  const propPaths = patternPath?.node?.type === 'ObjectPattern' ? patternPath.get('properties') : null;
  for (const propPath of Array.isArray(propPaths) && propPaths.length ? propPaths : [outerProp]) {
    if (propPath.node?.type === 'Property') handlePerBranch({ metaPath: propPath });
  }
}
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

// the receiver of an assignment-form destructure is read once per extraction plus once by a
// surviving residual: an unreusable spelling read twice takes the memo the declaration form
// already mints (`const _ref = obj.list;` - a second read would re-run the getter)
// a BODYLESS assignment host (`if (c) ({ Map: M } = g);`) has no statement list to splice into:
// it rewrites only when the whole destructure collapses into exactly one assignment, or when a
// memoized receiver braces the slot around both its reads
// the ONE expression a lifted prefix becomes, through the shared trim canon: the value slot is
// gone, so an element with nothing to observe is a comma the source wrote rather than work it did,
// and a prefix left with no observable at all is not a statement the source ran
export function liftedPrefixExpression(prefix) {
  if (!prefix.length) return null;
  const kept = dropDeadSequenceElements(prefix);
  const lifted = kept.length === 1 ? kept[0] : sequenceExpression(kept);
  return mayHaveSideEffects(lifted) ? lifted : null;
}

export function liftedPrefixStatements(prefix) {
  const lifted = liftedPrefixExpression(prefix);
  return lifted ? [expressionStatement(lifted)] : [];
}

// the LIVE tail, taken for the reason the prefix is: the registration-time node is a pre-swap
// copy, so a residual bound off it ships the RAW receiver the collapse had already substituted
export function liveTailOf(declarator, seqPrefix, initTail) {
  const liveInit = peelTransparentExpr(declarator.init);
  return liveInit?.type === 'SequenceExpression' && liveInit.expressions.length === seqPrefix.length + 1
    ? liveInit.expressions.at(-1) : initTail;
}

// a for-init hosts no statement of its own, so the prefix of a SURVIVING residual's receiver rides
// the FIRST extraction's value, which the loop header evaluates where the source ran it
// (`for (var m = (eff(), _Map), { other } = _globalThis; ...)`)
export function carryForInitPrefixIntoFirst(declarator, declJobs, extracted) {
  // a FLAT consume off a plain residual only: a nested hop or a rest sibling re-reads the
  // receiver through the residual, and there the whole read stays with it
  if (!extracted.length || declJobs.some(job => job.chain?.length)
    || (declarator.id.properties ?? [])
      .some(item => item.type === 'RestElement' || item.value?.type === 'ObjectPattern')) return;
  const init = peelTransparentExpr(declarator.init);
  if (init?.type !== 'SequenceExpression' || !Number.isInteger(init.start)) return;
  const { prefix, tail } = peelNestedSequenceExpressions(init);
  if (!prefix.length) return;
  declarator.init = tail;
  const lifted = liftedPrefixExpression(prefix);
  if (!lifted) return;
  const carried = lifted.type === 'SequenceExpression' ? lifted.expressions : [lifted];
  extracted[0].init = sequenceExpression([...carried, extracted[0].init]);
}

// the prefix of a SOURCE sequence init, taken off the declarator so the surviving residual reads
// the bare tail. one the collapse MINTED is the value's own spelling and stays whole, which its
// missing span tells us; an element with nothing to observe is a comma the source wrote, not a
// statement it ran (`var { Map: m, other } = (0, globalThis)`)
export function liftSurvivingInitPrefix(declarator, declJobs) {
  if (!declJobs.length) return [];
  const init = peelTransparentExpr(declarator.init);
  if (init?.type !== 'SequenceExpression' || !Number.isInteger(init.start)) return [];
  const { prefix, tail } = peelNestedSequenceExpressions(init);
  if (!prefix.length) return [];
  declarator.init = tail;
  // per element, the grouping the other leg's declarator lift prints for the same shape
  return observableSequenceElements(prefix).map(expr => expressionStatement(expr));
}

export function drainBodylessAssignment({ hostNode, jobs }, {
  program,
  markRewrite,
  mintRefName,
  removeConsumedProps,
  reanchorSoleCtorHopResidual,
}) {
  const sentinelKept = jobs.some(job => job.sentinel);
  const statements = jobs.map(job => expressionStatement(
    assignmentExpression('=', propBindingTarget(job.prop), job.value())));
  // the lifted SE prefix runs first, once - re-derived from the CURRENT right, the way the statement
  // drain derives its own: the walk rewrites the claims INSIDE the prefix in place, and the nodes the
  // job recorded are the pre-rewrite originals (lifting those printed a native `log.push` where the
  // statement host prints the polyfilled one)
  const [{ seqPrefix, assignment: bodylessAssign }] = jobs;
  const peeledRight = peelTransparentExpr(bodylessAssign.right);
  const liveSeq = seqPrefix?.length && peeledRight?.type === 'SequenceExpression'
    && peeledRight.expressions.length === seqPrefix.length + 1 ? peeledRight.expressions : null;
  const prefixExprs = liveSeq ? liveSeq.slice(0, -1) : seqPrefix ?? [];
  const prefixStatements = liftedPrefixStatements(prefixExprs);
  statements.unshift(...prefixStatements);
  removeConsumedProps(jobs);
  // an assignment-position sentinel writes an undeclared name, so its `var` rides whichever branch
  // below renders - the MEMO one owes it exactly as the plain sentinel one does. read AFTER the
  // consumed props leave, which is where the rename mints the name
  const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
  const varDecl = mintedNames.length
    ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
  // a SURVIVING residual then reads the quiet tail the prefix left behind
  if (liveSeq && bodylessAssign.left.properties?.length) bodylessAssign.right = liveSeq.at(-1);
  // the memo verdict needs the residual as it SURVIVES - after the consumed props leave
  const memoRef = assignmentMemoRef(bodylessAssign, jobs, mintRefName);
  const memoInit = memoRef ? bodylessAssign.right : null;
  // a MEMOIZED receiver hosts both reads in ONE block: the `_ref` declaration and the
  // residual reading it belong together, so the slot braces exactly once
  if (memoRef) {
    for (const [index, job] of jobs.entries()) {
      statements[index].expression.right = job.value(memoRef);
    }
    bodylessAssign.right = identifier(memoRef);
    statements.unshift(variableDeclaration('const',
      [variableDeclarator(identifier(memoRef), memoInit)]));
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
    const residual = expressionStatement(bodylessAssign);
    const seKeyFirst = jobs.some(job => job.sentinel && job.prop.computed && computedKeyHasSideEffects(job.prop));
    // the sentinel `var` LEADS the block whatever the order below: it declares, it does not run, and
    // that is where the other leg plants it
    const body = seKeyFirst
      ? [...varDecl, residual, ...statements]
      : [...varDecl, ...statements, residual];
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body })) markRewrite();
    return;
  }
  // a SURVIVING residual rides the same block. a RE-ANCHORED one re-reads the hop's own pure and
  // leads the extractions (`if (c) { ({ customI } = _Iterator); g = _Iterator$zip; }`); a plain one
  // keeps the SOURCE order its props were written in, behind them. without this the consumed props
  // were already gone and their extractions were dropped on the floor - nothing wrote the bindings
  if (bodylessAssign.left.properties.length !== 0) {
    // a lift we could not re-derive as a TAIL would be re-run by the residual beside it
    if (prefixExprs.length && !liveSeq) return;
    const view = { id: bodylessAssign.left, init: bodylessAssign.right };
    const reanchored = reanchorSoleCtorHopResidual(view);
    if (reanchored) {
      bodylessAssign.left = view.id;
      bodylessAssign.right = view.init;
    } else if (jobs.some(job => job.readsReceiver)) {
      // ... and an extraction that READS the receiver needs the memo this shape has no slot for:
      // the residual reads it too, and native reads once
      return;
    }
    // ... in the cascade the statement host prints: a FLAT extraction runs ahead of the residual, a
    // NESTED hop behind it, and the lifted prefix leads them all - the source ran it first
    const jobStatements = statements.slice(prefixStatements.length);
    const paired = jobs.map((job, index) => ({ job, statement: jobStatements[index] }));
    const flat = paired.filter(entry => !entry.job.chain?.length).map(entry => entry.statement);
    const nested = paired.filter(entry => entry.job.chain?.length).map(entry => entry.statement);
    const residual = expressionStatement(bodylessAssign);
    const body = reanchored
      ? [...prefixStatements, residual, ...flat, ...nested]
      : [...prefixStatements, ...flat, residual, ...nested];
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body })) markRewrite();
    return;
  }
  // an SE-bearing init has no slot in this shape (the extractions drop it) - staged
  if (jobs.length > 1 && !seqPrefix?.length && mayHaveSideEffects(bodylessAssign.right)) return;
  // several extractions wrap the bodyless slot in a block (babel's scope.push shape);
  // a single one keeps the bare statement
  const replacement = statements.length === 1
    ? statements[0] : { type: 'BlockStatement', body: statements };
  if (replaceNodeInTree(program, hostNode, replacement)) markRewrite();
}

export function assignmentMemoRef(assignment, jobs, mintRefName) {
  if (jobs.every(job => !job.readsReceiver) || jobs.some(job => job.seqPrefix?.length)) return null;
  const right = peelTransparentExpr(assignment.right);
  if (right?.type === 'Identifier' || right?.type === 'ThisExpression') return null;
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

// an SE buried in a consumed array WRAPPER lifts once, ahead of the extraction: the literal
// evaluates whole before the pattern binds, so every prefix keeps its source order there and the
// residual reads the quiet spine (`[(m(), [g])]` -> `m();` + `[[_g]]`). mutates the declarator
export function liftArrayWrapperPrefixes(declarator) {
  const lifted = [];
  function strip(node) {
    const core = peelTransparentExpr(node);
    if (core?.type !== 'ArrayExpression') return;
    for (const [index, element] of core.elements.entries()) {
      if (!element) continue;
      let peeled = peelTransparentExpr(element);
      if (peeled?.type === 'SequenceExpression') {
        lifted.push(...peeled.expressions.slice(0, -1));
        peeled = peelTransparentExpr(peeled.expressions.at(-1));
        core.elements[index] = peeled;
      }
      // ... and a kept WRITE in the slot lifts WHOLE, leaving its TARGET behind: the lifted statement
      // performs the write (its own value included, effects and all) and the slot then READS the
      // binding it stored (`[(kw = (eff(), globalThis))]` -> `kw = (eff(), _globalThis);` + `kw`).
      // leaving the VALUE there instead would evaluate it a second time - measured as a doubled
      // effect log. only a plain binding target qualifies: a member one would fire its getter twice
      if (peeled?.type === 'AssignmentExpression' && peeled.operator === '='
        && peeled.left?.type === 'Identifier') {
        lifted.push(peeled);
        peeled = peeled.left;
        core.elements[index] = peeled;
      }
      strip(core.elements[index]);
    }
  }
  const initCore = peelTransparentExpr(declarator.init);
  if (initCore?.type === 'SequenceExpression'
    && peelTransparentExpr(initCore.expressions.at(-1))?.type === 'ArrayExpression') {
    lifted.push(...initCore.expressions.slice(0, -1));
    declarator.init = peelTransparentExpr(initCore.expressions.at(-1));
  }
  strip(declarator.init);
  return lifted;
}

export function propBindingTarget(prop) {
  if (isDestructurePattern(prop.value)) return prop.value;
  // a DEFAULTED pattern value binds through its OWN pattern: the default rides the extraction's
  // guard ternary, so only the left survives as the target
  if (prop.value.type === 'AssignmentPattern'
    && isDestructurePattern(prop.value.left)) {
    return prop.value.left;
  }
  return identifier(propLocalName(prop));
}

// a prop the port consumes: plain (non-computed identifier / string key), value a bare
// binding Identifier or a defaulted one, not a rest element
// a computed STRING-LITERAL key (`globalThis['self']`) navigates like the dotted spelling
export function plainNavHopKey(node) {
  if (!node.computed) return node.property?.name ?? null;
  const key = peelTransparentExpr(node.property);
  return key?.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
}

// the extracted declarator's binding slot: a pattern-valued symbol prop moves its whole
// pattern; everything else binds the local name
// the extraction DISCARDS the receiver expression (the init / the assignment RHS): only a
// pure navigation may fall away silently; anything else is the SE-rescue channel - staged.
// the check is ALSO the claim's validity proof: an extraction is polyfill-always-wins only
// over a provable global nav - a conditional / opaque receiver must never extract, rest or
// not (the other branch's miss semantics would be erased)
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
export function navHopChain(node, guardCtx = null, opts = null) {
  const { throughSequenceTails = false } = opts ?? {};
  const peeled = peelDeadChainMarker(node, guardCtx);
  const deadOptionals = peeled !== node;
  const keys = [];
  function hopIsNav(hop) {
    return hop?.type === 'MemberExpression' && (deadOptionals || !hop.optional) && plainNavHopKey(hop) !== null;
  }
  let cur = peelTransparentExpr(peeled);
  while (hopIsNav(cur)) {
    keys.unshift(plainNavHopKey(cur));
    cur = peelTransparentExpr(throughSequenceTails ? peelReceiverSequenceTail(cur.object) : cur.object);
  }
  return { root: cur, keys };
}

export function isPureNavReceiver(node, guardCtx = null, opts = null) {
  const { root } = navHopChain(node, guardCtx, opts);
  return root?.type === 'Identifier' || root?.type === 'ThisExpression';
}

// the for-init variant keeps a side-effecting init alive in the `_unused` dummy, so only
// the SEQUENCE TAIL has to be the provable nav
export function isPureNavAfterSePrefix(node, guardCtx = null, opts = null) {
  node = peelTransparentExpr(node);
  if (node?.type === 'SequenceExpression') node = node.expressions.at(-1);
  return isPureNavReceiver(node, guardCtx, opts);
}

// the same SOURCE node seen through a rebuild that may have CLONED it: a clone carries the
// span of what it copied, and a minted node has none to answer with
export function spellsSameSource(node, source) {
  return node === source
    || (Number.isInteger(source?.start) && node?.start === source.start && node?.end === source.end);
}

// does the OUTER source spelling cover the inner one? a receiver the dispatch SPELLS may sit
// inside a wider harvested expression (or the other way round), and the rewrite has already moved
// the nodes, so identity no longer answers - the source span still does
export function sourceSpanCovers(outer, inner) {
  return Number.isInteger(outer?.start) && Number.isInteger(inner?.start)
    && outer.start <= inner.start && outer.end >= inner.end;
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
export function planLiftedRhsPrefix(right, { anchorsInSequence, residualSurvives = false, guardCtx = null }) {
  const peeled = peelTransparentExpr(right);
  if (peeled?.type === 'SequenceExpression' && isPureNavReceiver(peeled.expressions.at(-1), guardCtx)) {
    return { prefix: peeled.expressions.slice(0, -1), receiver: peeled.expressions.at(-1) };
  }
  // the chain-assign lift re-emits the WRITE as its own statement, and a surviving residual keeps
  // reading the source's right - so the write (and any effect its value carries) would run TWICE.
  // only a whole consume, where nothing is left to read it, may take this lift
  if (anchorsInSequence || residualSurvives || !chainAssignOverPureNav(peeled, guardCtx)) return null;
  return { prefix: [right], receiver: peeled.right };
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
    && isPureNavAfterSePrefix(assign.right, guardCtx, { throughSequenceTails: true }) ? assign : null;
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

// re-wrap a split statement for an export host; a minted memo stays module-local
export function exportWrap(statement, exported) {
  if (!exported) return statement;
  return { type: 'ExportNamedDeclaration', declaration: statement, specifiers: [], source: null, attributes: [] };
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
    // read like `.Array` / `.Object` - the shared key canon the inner keys already ask)
    const foldedComputedKey = hopProp.computed
      && (keyCtx ? resolveSynthKeys({ node: hopProp, ...keyCtx }).lookupKey
        : (hopProp.key?.type === 'Literal' && typeof hopProp.key.value === 'string' ? hopProp.key.value : null));
    if ((hopProp.computed && typeof foldedComputedKey !== 'string') || hopValue !== hostPatternPath.node) return;
    chain.push({ hopProp, outerPattern, outerRest: hasRestSibling(outerPattern), foldedKey: foldedComputedKey || null });
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

// one surgery per host, on the final tree. consumed props leave their pattern; an emptied
// pattern takes its declarator (or assignment) with it; the extracted declarations land
// ahead of the residual in source prop order

// the literal-route receiver resolution shared state: the strict walk first, the SE-free
// single-read relaxation second - direct when the residual dies with the extraction, else
// through the `_ref` memo (the memo is the single source read - getter fires once)
// the residual is DEAD when this extraction takes every binding of a single-declarator
// declaration - the shared plan's `soleBindingInDeclaration`
export function planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav }) {
  const declaratorConsumedWhole = patternBindingCount(declarator.id) === patternBindingCount(prop.value);
  const soleBinding = declaration.declarations.length === 1 && declaratorConsumedWhole;
  let literalReceiver = null;
  let relaxedReceiver = false;
  let carriedLive = null;
  if (!pureNav && chain.length > 0) {
    literalReceiver = resolveNestedReceiverNode(metaPath) ?? null;
    if (!literalReceiver) {
      const relaxed = resolveNestedReceiverNode(metaPath, { allowSeFreeSingleRead: true }) ?? null;
      // a SENTINEL leaves a residual that reads the fragment a second time, so only a
      // value-SELECTING one qualifies for the relaxation: its memo is what makes the branch
      // select once for both readers
      if (relaxed && (!sentinel
        || relaxed.type === 'ConditionalExpression' || relaxed.type === 'LogicalExpression')) {
        literalReceiver = relaxed;
        relaxedReceiver = true;
      }
      // ... and an EFFECT-bearing slot answers for itself through the shared canon: the effects only
      // matter while a residual survives to re-evaluate them, and a receiver that performs every
      // effect its init would leaves that residual nothing to do - the dispatch is the one read
      // ... asked of THIS DECLARATOR's own pattern, not of the declaration: a sibling declarator
      // keeps its own binding, and the consumed one splits off beside it - the split the other leg
      // already performs (`const { y: { at } } = { y: nb.y }, zn = 1`)
      if (!literalReceiver && declaratorConsumedWhole && !sentinel) {
        const carried = resolveNestedReceiverNode(metaPath, { allowInitCarriedEffects: true }) ?? null;
        if (carried && receiverPerformsEveryInitEffect(declarator.init, carried)) {
          literalReceiver = carried;
          relaxedReceiver = true;
          // the slot is re-resolved at DRAIN: a claim INSIDE it renders by replacing its node, and
          // this plan-time copy predates that rewrite
          carriedLive = () => resolveNestedReceiverNode(metaPath, { allowInitCarriedEffects: true }) ?? carried;
        }
      }
    }
  }
  return { soleBinding, declaratorConsumedWhole, literalReceiver, relaxedReceiver, carriedLive };
}

// the guard an overwrite owes: the pure entry answers `it.method` verbatim off a receiver that is not
// the polyfilled surface, so the dispatch may be undefined and something must stand in that case.
// while the RAW destructure SURVIVES that is the slot it already assigned - the read, or the source's
// own default, run exactly once - and re-spelling the default node beside it would run it twice. once
// the slot is PRUNED nothing ran it, and the default node itself is the one reader left
export function overwriteDefaultGuard({ call, localName, ref, defaultNode = null }) {
  return renderInstanceDefaultGuard({
    assignedRef: identifier(ref),
    call,
    defaultValue: defaultNode ?? identifier(localName),
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
      value: () => overwriteDefaultGuard({
        call: callExpression(identifier(id), [duplicateReceiver(receiver, injector)]),
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
        || (!adapter.getBinding(nodeSite(operand, metaPath).scope, operand.name, nodeSite(operand, metaPath).path)
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
    const aliasBinding = adapter.getBinding(metaPath.scope, localName, metaPath);
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

// swap the surface VALUE slot for `replacement` (null = re-read the surface itself)
// a receiver spelled a SECOND time: the clone is taken off the rewritten tree (its claims
// ride along), and the refs the walk planted inside its own functions re-mint - they have
// no declaration in the copy otherwise
export function duplicateReceiver(node, injector) {
  const clone = cloneNode(node);
  injector.recloneDeclaredRefs?.(clone);
  return clone;
}

// a nav whose live `?.` sits over an ERASABLE hop renders as the guard the collapse would
// spell: the hop's object is the probe, the hop's own ponyfill the alternate, and the tail
// above it hangs back on. null where no such hop carries the short-circuit
export function guardedNavPassthrough(receiver, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport }) {
  const tail = [];
  let cur = peelTransparentExpr(receiver);
  while (cur?.type === 'MemberExpression' && !cur.optional) {
    if (cur.computed || cur.property?.type !== 'Identifier') return null;
    tail.unshift(cur.property.name);
    cur = peelTransparentExpr(cur.object);
  }
  if (cur?.type !== 'MemberExpression') return null;
  // a COMPUTED leaf key folds to its literal spelling, and the effects it carries ride the
  // ALTERNATE - where native runs them, past the short-circuit and before the read
  // (`(g.window?.[(c++, 'self')])` -> `null == _g.window ? void 0 : (c++, _self)`)
  const keyEffects = [];
  let hopName = cur.computed ? null : cur.property?.type === 'Identifier' ? cur.property.name : null;
  if (cur.computed) {
    let key = peelTransparentExpr(cur.property);
    if (key?.type === 'SequenceExpression') {
      keyEffects.push(...key.expressions.slice(0, -1));
      key = peelTransparentExpr(key.expressions.at(-1));
    }
    hopName = key?.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
  }
  const hopPure = hopName ? resolveGlobalPolyfill(hopName) : null;
  if (!hopPure) return null;
  const probe = cloneStamped(cur.object);
  substituteProxyRootsInClone(probe, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
  const navTail = tail.reduce((base, hop) => memberFromKeyName(base, hop),
    identifier(injectPureImport(hopPure.entry, hopPure.hintName)));
  const alternate = keyEffects.length
    ? sequenceExpression([...keyEffects.map(expr => cloneNode(expr)), navTail]) : navTail;
  return renderShortCircuitGuard(nullFirstGuardTest(probe), alternate);
}

// the effects a sealed nav's LEAF hop key carries (`?.[(c++, 'self')]`): native runs them past
// the short-circuit and before the read, which is inside the guard's alternate
function sealedLeafKeyEffects(nav) {
  const leaf = peelTransparentExpr(nav);
  if (leaf?.type !== 'MemberExpression' || !leaf.computed) return [];
  const key = peelTransparentExpr(leaf.property);
  return key?.type === 'SequenceExpression' ? key.expressions.slice(0, -1) : [];
}

// the sealed receiver READ a swap erases, PLANNED on the pristine tree: the seal's inner nav
// renders the guard the collapse spells (its `?.` object the probe, its own ponyfill the
// alternate, the hop's key effects riding inside it) and the boundary member hangs back on.
// planned, not rendered, because the drain sees a tree the walk has already collapsed - there
// the inner nav no longer answers the undefinability question the probe exists for
export function planSealedNavProbe(receiver, metaPath, ctx) {
  if (!metaPath || !receiver) return null;
  // a FALLBACK operand changes what the pattern binds, never whether the LEFT read ran: the
  // seal's own throw is the source's either way (`(g.window?.self).Object || {}`)
  const read = peelTransparentExpr(receiver)?.type === 'LogicalExpression'
    ? peelTransparentExpr(receiver).left : receiver;
  const boundary = sealedChainBoundary(read);
  if (!boundary) return null;
  const key = memberKeyName(boundary.member);
  if (key === null) return null;
  const aliasCtx = { ...nodeSite(read, metaPath), adapter: ctx.adapter };
  function resolveHere(meta) {
    return ctx.resolvePure(meta, metaPath);
  }
  if (!proxyReceiverValueCanBeUndefined(boundary.inner, resolveHere, aliasCtx,
    { throughChainAssign: true })) return null;
  const leafPlan = sealedClaimLeafGuardPlan(boundary.inner, resolveHere, aliasCtx);
  if (!leafPlan?.leafPure && !leafPlan?.leafName) {
    return { boundary, key, passthrough: true };
  }
  // a leaf pure CANNOT back is not a global of its own: it reads off the collapsed base the
  // guard proved, where a bare spelling would be a ReferenceError on an engine without it
  const leafBase = leafPlan.leafPure ? null : unwrapRuntimeExpr(boundary.inner)?.object;
  const basePure = leafBase && proxyGlobalMemberCtorPure({ receiver: leafBase, aliasCtx, resolvePure: resolveHere });
  // the effect nodes this plan will RE-EMIT stay claim-live: a claim inside the kept key
  // (`log.push('k')`) fires later in the walk and must land on the (soon detached) original,
  // which the render-time harvest off `effectsHost` then picks up rewritten
  for (const expr of sealedLeafKeyEffects(boundary.inner)) ctx.keepLive?.add(expr);
  return {
    boundary,
    key,
    leafPlan,
    basePure,
    // ... and over a ponyfill base that read FOLDS: the leaf names the realm the ponyfill already
    // is, and off-browser the ponyfill cannot answer it (`(globalThis.window?.self.window)` reads
    // `_self`) - the canon's verdict, the same one the nav plan reaches for a hop read through
    foldLeafOntoBase: !!basePure && foldableRealmHopKey(leafPlan.leafName, { adapter: ctx.adapter, resolvePure: resolveHere }),
    guardObject: cloneStamped(leafPlan.guardObject),
    effectsHost: boundary.inner,
  };
}

export function renderSealedNavProbe(plan, metaPath, ctx) {
  if (!plan) return null;
  const { boundary, key } = plan;
  let navRead;
  if (plan.passthrough) navRead = guardedNavPassthrough(boundary.inner, metaPath, ctx);
  else {
    const probe = cloneStamped(plan.guardObject);
    substituteProxyRootsInClone(probe, metaPath, ctx);
    const baseId = plan.basePure
      && identifier(ctx.injectPureImport(plan.basePure.entry, plan.basePure.hintName));
    let leaf = plan.leafPlan.leafPure
      ? identifier(ctx.injectPureImport(plan.leafPlan.leafPure.entry, plan.leafPlan.leafPure.hintName))
      : baseId
        ? plan.foldLeafOntoBase ? baseId : memberExpression(baseId, identifier(plan.leafPlan.leafName))
        : identifier(plan.leafPlan.leafName);
    const liveEffects = sealedLeafKeyEffects(plan.effectsHost).map(expr => cloneNode(expr));
    if (liveEffects.length) leaf = sequenceExpression([...liveEffects, leaf]);
    navRead = renderShortCircuitGuard(nullFirstGuardTest(probe), leaf);
  }
  if (!navRead) return null;
  return boundary.member.computed
    ? memberExpression(navRead, literal(key), { computed: true })
    : memberFromKeyName(navRead, key);
}

export function sealedNavProbeRead(receiver, metaPath, ctx) {
  return renderSealedNavProbe(planSealedNavProbe(receiver, metaPath, ctx), metaPath, ctx);
}

// the SHAPE of the read a fully-consumed pattern discards, planned on the PRISTINE tree: by
// drain time the walk has collapsed the nav, and the guard render spells its own leaf. null
// where the value cannot be undefined - there is nothing for the read to throw on
export function planDiscardedInitProbe(initNode, metaPath, ctx) {
  // an ARRAY-wrapped pattern reads its ELEMENT, and that read is the one native performs;
  // the chain wrapper an inner `?.` wears is transparent to the plan
  const peeled = unwrapRuntimeExpr(initNode);
  let nav = peeled?.type === 'ArrayExpression' && peeled.elements.length === 1
    ? unwrapRuntimeExpr(peeled.elements[0]) : peeled;
  // an AGREEING ternary reads its arm whichever way the test goes - that read is the one the
  // consume discards, and the dead test drops with the selection
  if (nav?.type === 'ConditionalExpression') nav = agreeingTernaryArm(nav, metaPath, ctx.adapter) ?? nav;
  if (!nav) return null;
  // `probeLeaf`: a full consume of the PROBE ITSELF has no hop to read off the guard - the test
  // operand doubles as the alternate (`{ Array: { of } } = globalThis.window`)
  const plan = sealedClaimLeafGuardPlan(nav, m => ctx.resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath }, { probeLeaf: true });
  if (plan) return plan;
  // an alias BINDING holding an absent-able value makes the discarded read observable with no
  // `?.` for the guard plan to key on (`{ of } = a.Array` off `a = globalThis.window` - native
  // throws reading `.Array` where the extraction just binds): the alias arm's probe re-emits
  // the init read verbatim, the other leg's spelling
  const aliasProbe = aliasHeldClaimProbe(nav, m => ctx.resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath });
  return aliasProbe ? { aliasProbe } : null;
}

// ... and its emission: the planned guard, the slot key hanging back on
export function renderDiscardedInitProbe(jobs, ctx) {
  const [job] = jobs;
  const plan = job?.initProbePlan;
  const metaPath = job?.metaPath;
  if (!metaPath || jobs.some(item => item.seKey)) return null;
  // a SEALED init reads through its own boundary member, and THAT read is the one native
  // performs (`(globalThis.window?.[(c++, 'self')]).Object` - the pattern key never reaches it)
  const sealed = renderSealedNavProbe(job.sealedProbePlan, metaPath, ctx)
    ?? sealedNavProbeRead(job.declarator?.init ?? job.assignment?.right, metaPath, ctx);
  if (sealed) return sealed;
  if (!plan) return null;
  // the alias-arm probe is the init read spelled verbatim - no guard to build, nothing to
  // substitute (the alias is the user's own binding, and the drain's inserts are not re-visited)
  if (plan.aliasProbe) {
    return renderAliasHeldProbeRead(plan.aliasProbe, identifier(plan.aliasProbe.object.name));
  }
  const aliasCtx = { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath };
  // a HOP chain reads its OUTERMOST key off the init - that is the read native performs
  // (`{ Math: { cbrt } } = (guard)` probes `(guard).Math`)
  const keyProp = job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
  const { lookupKey } = resolveSynthKeys({ node: keyProp, ...aliasCtx });
  if (typeof lookupKey !== 'string') return null;
  const probe = cloneStamped(plan.guardObject);
  substituteProxyRootsInClone(probe, metaPath, ctx);
  // a leaf the ctor canon could not back may still BE a possible-global with a pure of its own
  // (`dh().window?.self` -> `_self`): a bare spelling there is a ReferenceError off-browser
  const leafGlobal = plan.leafPure || plan.leafIsProbe ? null : ctx.resolveGlobalPolyfill?.(plan.leafName);
  // a plan whose LEAF is the probe itself spells the test operand twice - the read the source
  // performs off a value only the probe proved absent-able (`null == _globalThis.window ? void 0
  // : _globalThis.window`)
  const leaf = plan.leafIsProbe ? cloneNode(probe)
    : plan.leafPure ? identifier(ctx.injectPureImport(plan.leafPure.entry, plan.leafPure.hintName))
    : leafGlobal ? identifier(ctx.injectPureImport(leafGlobal.entry, leafGlobal.hintName))
    : identifier(plan.leafName);
  const guarded = renderShortCircuitGuard(nullFirstGuardTest(probe), leaf);
  // a computed key BOUND to a name reads through the spelling the walk left in the pattern - a
  // well-known symbol through its polyfilled binding (`[_Symbol$iterator]`), never through the
  // name it resolves to; a literal spelling normalises to the dotted read below
  if (keyProp.computed && keyProp.key?.type === 'Identifier') {
    return memberExpression(guarded, cloneNode(keyProp.key), { computed: true });
  }
  return isValidIdentifierName(lookupKey)
    ? memberExpression(guarded, identifier(lookupKey))
    : memberExpression(guarded, literal(lookupKey), { computed: true });
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
// flush before the first spanned node inside it (`const _ref = // note\n[4, 5];`)
export function anchorLeadingStatement(statements, hostNode) {
  const [first] = statements;
  if (first && Number.isInteger(hostNode?.start) && !Number.isInteger(first.start)) {
    first.start = hostNode.start;
    first.end = hostNode.start;
  }
  return statements;
}

// a cloned subtree the traversal will never revisit: every FREE pristine proxy global in
// it substitutes its pure binding, the shape the walk would have produced in place
export function substituteProxyRootsInClone(root, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport }) {
  function proxyRootSwap(node) {
    if (!POSSIBLE_GLOBAL_OBJECTS.has(node.name) || !isPristineProxyGlobal(adapter, node.name)) return null;
    if (adapter.getBinding(nodeSite(node, metaPath).scope, node.name, nodeSite(node, metaPath).path)?.node) return null;
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
}

export function isMintedOrProxyName(name, injectorState) {
  return POSSIBLE_GLOBAL_OBJECTS.has(name) || mintedProxyGlobalName(name, injectorState) !== null;
}

// does this nav spine bottom out on a CALL? that read belongs to the source, so a full
// consume owes it a throw probe - a plain proxy nav from a bare root owes nothing
export function navSpineHasCall(node) {
  // through the CHAIN wrapper an optional spelling wears: `mk()?.self.Object` roots in the same
  // call as its plain twin, and the paren-only peel stopped at the wrapper - the discarded read
  // then lost the throw probe the call root owes
  for (let cur = unwrapRuntimeExpr(node); cur;) {
    if (cur.type === 'CallExpression') return true;
    if (cur.type === 'MemberExpression') {
      cur = unwrapRuntimeExpr(cur.object);
      continue;
    }
    return false;
  }
  return false;
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
  const leading = liftLeadingSequenceElements(program, hostNode);
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
  const folded = live.length === 1 ? live[0] : sequenceExpression(live);
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
  // the element may sit under grouping parens, so the match peels each expression before comparing
  let sequence = null;
  let index = -1;
  walkAstNodes({ root: program, visit: node => {
    if (sequence || node.type !== 'SequenceExpression') return !sequence;
    const at = node.expressions.findIndex(expr => peelTransparentExpr(expr) === hostNode);
    if (at !== -1) {
      sequence = node;
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

// the nodes an extraction already OWNS: a hop-host note for one of them would apply its anchor
// a second time, on top of the drain's own. `hostSiblings` are the declarators sharing a
// declaration with one - the residual split replaces that declaration node, and the ledger
// drains by its identity, so splitting early would strand the sibling's own claim
export function jobOwnedNodes(ledger) {
  const owned = new Set();
  const hostSiblings = new Set();
  for (const [hostNode, { hostPath, jobs }] of ledger) {
    for (const job of jobs) if (job.declarator) owned.add(job.declarator);
    const declNode = hostPath.node?.type === 'ExportNamedDeclaration' ? hostPath.node.declaration : hostPath.node;
    if (declNode?.type === 'VariableDeclaration'
      && jobs.some(job => job.host === 'declaration' || job.host === 'memo-decl')) {
      for (const item of declNode.declarations) hostSiblings.add(item);
    }
    // an ASSIGNMENT host is keyed by its own expression, a SEQUENCE-element one by the
    // expression itself
    const assignExpr = hostNode?.type === 'AssignmentExpression' ? hostNode
      : hostNode?.type === 'ExpressionStatement' ? peelTransparentExpr(hostNode.expression) : null;
    if (assignExpr?.type === 'AssignmentExpression') owned.add(assignExpr);
  }
  return { owned, hostSiblings };
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

export function planSentinelMemo({ sentinel, declarator, metaPath, adapter, kind, allProxyInit }) {
  // the init is asked through its parens - and through the chain wrapper an optional call
  // wears: an SE-bearing SEQUENCE reads once into the memo and the residual reads the ref, so
  // the prefix does not re-run (`var _ref = (se(), arr), { [(k(), 'at')]: _unused } = _ref,
  // at = _at(_ref);`)
  const init = unwrapRuntimeExpr(declarator.init);
  // a value-SELECTING init memoizes too, but only under an INSTANCE claim: the Maybe-dispatch
  // stays value-correct on a branch the polyfill does not own, and the memo is what makes the
  // branch select exactly once for the two readers (extraction and residual)
  // ... but an ALL-PROXY selection needs none: every branch is the same realm surface, free to
  // re-read (`c ? globalThis : self` extracts off the ponyfill and keeps the branching residual)
  const branching = kind === 'instance' && !allProxyInit
    && (init?.type === 'ConditionalExpression' || init?.type === 'LogicalExpression');
  const sentinelMemoEligible = sentinel && (init?.type === 'MemberExpression'
    || init?.type === 'CallExpression' || init?.type === 'SequenceExpression'
    || branching || isConstantLiteralReceiver(init));
  // a CALL init, a branching one and a proxy-rooted member keep the split-statement shape
  const memoSibling = sentinelMemoEligible && init?.type !== 'CallExpression' && !branching
    && !(init?.type === 'MemberExpression'
      && findProxyGlobal(init, { scope: metaPath.scope, adapter, path: metaPath }));
  return { sentinelMemoEligible, memoSibling };
}

// the fallback logical whose LEFT detection statically selected (the meta's object
// resolved through it, no fromFallback): the plain-ctor extraction stands and the dead
// right drops with the residual - null everywhere else (the per-branch mirror's shapes)
// the ARM a ternary selects when both name the same surface - null when they differ or when
// the test itself observes something (its read would be dropped with the selection)
function agreeingTernaryArm(selecting, metaPath, adapter) {
  if (mayHaveSideEffects(selecting.test)) return null;
  function armName(arm) {
    return resolveObjectName({
      objectNode: peelTransparentExpr(peelReceiverSequenceTail(peelTransparentExpr(arm))), ...nodeSite(arm, metaPath), adapter,
    });
  }
  const name = armName(selecting.consequent);
  return name && name === armName(selecting.alternate) ? peelTransparentExpr(selecting.consequent) : null;
}

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
  if (selecting.type !== 'LogicalExpression' || !meta?.object || chain.length > 0) return null;
  if (!soleBinding && mayHaveSideEffects(selecting)) return null;
  // an SE-bearing left names its built-in through the sequence TAIL - the prefix is the
  // effect the discarded read re-emits, not part of the name
  // (`{ from } = (e++, globalThis.self.Array) || Set`)
  const left = peelTransparentExpr(selecting.left);
  const leftName = resolveObjectName({
    objectNode: peelTransparentExpr(peelReceiverSequenceTail(left)), ...nodeSite(left, metaPath), adapter,
  });
  return leftName === meta.object ? left : null;
}

export function isPlainConsumableProp(prop, { symbolProp = false, ctorPattern = false, instancePatternLeft = false } = {}) {
  if (prop.type !== 'Property') return false;
  // a computed key qualifies bare-bound (the meta only exists when the key resolved; an
  // SE key takes the sentinel route so its effect replays in the residual); a symbol
  // prop's PATTERN value additionally destructures the helper result
  // (`{ [S]: { next } } = obj` -> `const { next } = _getIteratorMethod(obj)`), and its
  // DEFAULT guards it (the helper returns undefined on a genuine non-iterable, so the
  // memoized `=== void 0` test keeps the native-miss semantics)
  if (prop.computed) {
    return prop.value?.type === 'Identifier'
      // a DEFAULTED SE-key prop extracts through the sentinel + guard-ternary channel
      || (prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier'
        && (symbolProp || computedKeyHasSideEffects(prop)))
      || (symbolProp && (prop.value?.type === 'ObjectPattern'
        || (prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'ObjectPattern')));
  }
  if (prop.key?.type !== 'Identifier' && prop.key?.type !== 'Literal') return false;
  if (prop.value?.type === 'Identifier') return true;
  // a CTOR claim with a pattern value re-anchors the pattern on the resolved binding
  // (`{ Set: { union } } = globalThis` -> `const { union } = _Set`)
  if (ctorPattern && prop.value?.type === 'ObjectPattern') return true;
  if (prop.value?.type !== 'AssignmentPattern') return false;
  if (prop.value.left?.type === 'Identifier') return true;
  // an INSTANCE extraction binds the guard to whatever the value's left spells, so a
  // PATTERN default consumes whichever of the two it is (`const [first] = (_ref =
  // _at(src)) === void 0 ? [] : _ref` - the babel canon). the caller clears the left,
  // having asked whether its leaves carry claims the composed extraction would own
  return instancePatternLeft;
}

// only a REST sibling blocks: it reads "everything the pattern did not consume", so a
// removed prop changes what it collects (babel renames to `_unused` sentinels - staged).
// computed / defaulted siblings keep their own routing and survive in the residual
export function hasRestSibling(pattern) {
  return hasRestSiblingExcept(pattern.properties, null);
}

// the pristine proxy surface an operand names, or null. a branch the walker already
// substituted (`_globalThis`) is the same surface - the minted import's hint says which
// global it holds
export function proxySurfaceIdentifier(node, { adapter, injectorState }) {
  const inner = peelTransparentExpr(node);
  if (inner?.type !== 'Identifier') return null;
  return isPristineProxyGlobal(adapter, inner.name)
    || POSSIBLE_GLOBAL_OBJECTS.has(injectorState?.getPureImport?.(inner.name)?.hint) ? inner : null;
}

// a selecting init whose EVERY LIVE branch lands on the same pristine proxy surface
// (`c ? globalThis : self`): the claim extracts like a plain proxy receiver and the
// discarded init drops whole - no branch diverges, nothing observable dies with it
export function allProxySelectingInit(node, { adapter, injectorState }) {
  const stack = [{ node, branch: false }];
  while (stack.length) {
    const { node: raw, branch } = stack.pop();
    const inner = peelTransparentExpr(raw);
    if (inner?.type === 'ConditionalExpression') {
      // an SE-bearing test must keep the destructure (the mirror's shape) - the extraction
      // would discard the init and its effect with it
      if (mayHaveSideEffects(inner.test)) return false;
      stack.push({ node: inner.consequent, branch: true }, { node: inner.alternate, branch: true });
      continue;
    }
    if (inner?.type === 'LogicalExpression' && inner.operator !== '&&') {
      // a proxy surface DECIDES a `||` / `??` on its own - an object is always truthy and
      // never nullish, so the right operand never evaluates and dies with the init
      if (proxySurfaceIdentifier(inner.left, { adapter, injectorState })) continue;
      stack.push({ node: inner.left, branch: true }, { node: inner.right, branch: true });
      continue;
    }
    // a chain ASSIGNMENT is transparent to a BRANCH's verdict: what the selection yields is
    // the value it stores (`c ? (q = globalThis) : (w = globalThis)`). a BARE write init is
    // not a selection at all and keeps its own channels
    let value = inner;
    if (branch) {
      while (value?.type === 'AssignmentExpression' && value.operator === '=') value = peelTransparentExpr(value.right);
    }
    if (!proxySurfaceIdentifier(value, { adapter, injectorState })) return false;
  }
  return true;
}

// a DECLINED mirror's leaf defaults still take the sound polyfill (the slot fires only where
// the destructured value reads undefined, whatever the receiver held)
export function swapInlineDefaults({ leafPattern, ctorName, metaPath, insertOnUndefaulted = false },
  { resolvePure, markSubtreeSkipped, skippedNodes, injectPureImport, markRewrite }) {
  for (const leafProp of leafPattern.properties) {
    if (leafProp.type !== 'Property' || leafProp.computed) continue;
    const defaulted = leafProp.value?.type === 'AssignmentPattern';
    // an UNDEFAULTED identifier leaf takes the sound default too, but ONLY on the
    // `&&`-declined shapes (proxy-only value - babel INSERTS `of = _Array$of` there);
    // a ternary / `||` decline carries a USER branch, and an inserted default would fire
    // on that branch's legitimate undefined
    if (!defaulted && !(insertOnUndefaulted && leafProp.value?.type === 'Identifier')) continue;
    const keyName = leafProp.key?.name ?? leafProp.key?.value;
    if (typeof keyName !== 'string') continue;
    const pure = resolvePure({ kind: 'property', object: ctorName, key: keyName, placement: 'static' }, metaPath);
    if (!pure || pure.kind === 'instance') continue;
    if (defaulted) {
      markSubtreeSkipped(skippedNodes, leafProp.value.right);
      leafProp.value.right = identifier(injectPureImport(pure.entry, pure.hintName));
    } else {
      leafProp.value = {
        type: 'AssignmentPattern', left: leafProp.value,
        right: identifier(injectPureImport(pure.entry, pure.hintName)),
      };
      leafProp.shorthand = false;
    }
    markRewrite();
  }
}

// the sound fallback wherever the RECEIVER must survive the rewrite: the polyfill lands
// exactly where the destructured slot is undefined, whatever the receiver held. it
// REPLACES a user-written default (polyfill always wins)
export function applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped }) {
  const id = injectPureImport(entry, hintName);
  markRewrite();
  if (prop.value.type === 'AssignmentPattern') {
    markSubtreeSkipped(skippedNodes, prop.value.right);
    prop.value.right = identifier(id);
  } else if (prop.value.type === 'Identifier') {
    const left = prop.value;
    prop.value = { type: 'AssignmentPattern', left, right: identifier(id) };
    prop.shorthand = false;
  }
  skippedNodes.add(prop);
  if (prop.value) skippedNodes.add(prop.value);
}

// does the surviving residual sit SOURCE-EARLIER than everything the extraction consumed?
// then it keeps that slot and the extractions follow it
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
export function anchorAssignmentResidual(assignment, jobs, reanchor) {
  if (assignment.left?.type !== 'ObjectPattern' || !assignment.left.properties.length
    || jobs.some(job => job.sentinel)) return false;
  const view = { id: assignment.left, init: assignment.right };
  if (!reanchor(view)) return false;
  assignment.left = view.id;
  assignment.right = view.init;
  return true;
}

// does the surviving residual sit ahead of every extraction in SOURCE order? `sharedHop`
// admits the extraction's own hop as "ahead": a DECLARATION splits the hop into its own
// statement and the extraction leads it, while an ASSIGNMENT cascade keeps the nested
// extraction behind the residual it came out of - babel's own asymmetry between the two
export function residualPrecedesExtractions(declarator, declJobs, sourceProps, { sharedHop = false } = {}) {
  const props = declarator.id?.type === 'ObjectPattern' ? declarator.id.properties : null;
  if (!props?.length || !sourceProps || !declJobs.length) return false;
  const consumedAt = Math.min(...declJobs.map(job => {
    const outer = job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
    const index = sourceProps.indexOf(outer);
    return index === -1 ? sourceProps.length : index;
  }));
  return props.every(item => {
    const index = sourceProps.indexOf(item);
    return index !== -1 && (sharedHop ? index <= consumedAt : index < consumedAt);
  });
}

// does the leaf take the sound INLINE DEFAULT instead of an extraction? two load-bearing
// selections say so. a `&&` receiver: its falsy left must still throw, so nothing may extract
// off it - and only where the per-branch MIRROR could not take the shape (it owns every pattern
// it can render, and a chain-assigned receiver is one it has no slot for), or where the branches
// carry writes the extraction would drop. a FLAT prop whose computed KEY carries an effect over
// the same `&&`: the residual stays to run the key, and an extraction beside it would need a
// second read of a slot the selection does not prove
export function takesInlineDefault({ host, prop, pattern, chain, kind, sentinel, adapter, injectorState }) {
  if (kind === 'instance') return false;
  // a for-x HEAD has no other render: it hosts no statement, and the binding it declares is
  // rebound each iteration, so the slot's own default is where the polyfill goes
  if (host.head) return true;
  const init = peelTransparentExpr(host.declarator?.init);
  if (chain.length > 0 && prop.value?.type !== 'ObjectPattern') {
    return (init?.type === 'AssignmentExpression'
        || !isSynthSimpleObjectPattern(pattern))
      && andSelectedProxyInit(init, { adapter, injectorState })
      || selectionHoldsChainWrites(init, { adapter, injectorState });
  }
  return chain.length === 0 && sentinel && prop.value?.type === 'Identifier'
    && prop.computed && computedKeyHasSideEffects(prop) && init?.operator === '&&';
}

// an ALL-PROXY selection whose branches are chain ASSIGNMENTS: the writes must survive the
// destructure, so nothing may extract off it - the leaf takes the sound inline default instead
function selectionHoldsChainWrites(node, ctx) {
  const inner = peelTransparentExpr(node);
  if (inner?.type !== 'ConditionalExpression' && inner?.type !== 'LogicalExpression') return false;
  if (!allProxySelectingInit(inner, ctx)) return false;
  const stack = [inner];
  while (stack.length) {
    const branch = peelTransparentExpr(stack.pop());
    if (branch?.type === 'ConditionalExpression') {
      stack.push(branch.consequent, branch.alternate);
      continue;
    }
    if (branch?.type === 'LogicalExpression') {
      stack.push(branch.left, branch.right);
      continue;
    }
    if (branch?.type === 'AssignmentExpression') return true;
  }
  return false;
}

// a `&&` receiver yields its RIGHT operand on every path a destructure can survive (a falsy
// left throws), so the leaf's slot is the proxy surface's own - the sound inline default
function andSelectedProxyInit(node, { adapter, injectorState }) {
  // a chain assignment is transparent to the verdict: what the destructure reads is the
  // value it stores (`w = m && globalThis`)
  let inner = peelTransparentExpr(node);
  while (inner?.type === 'AssignmentExpression' && inner.operator === '=') inner = peelTransparentExpr(inner.right);
  return inner?.type === 'LogicalExpression' && inner.operator === '&&'
    && !!proxySurfaceIdentifier(inner.right, { adapter, injectorState });
}

// the surface an all-proxy selecting init reads - its first branch's pristine root
export function firstProxyBranch(node) {
  let inner = peelTransparentExpr(node);
  while (inner?.type === 'ConditionalExpression' || inner?.type === 'LogicalExpression') {
    inner = peelTransparentExpr(inner.type === 'ConditionalExpression' ? inner.consequent : inner.left);
  }
  return inner;
}

// climb ArrayPattern levels from a pattern path down the matching init elements:
// `[{ ... }, other] = [globalThis, 1]` pairs the pattern element with `globalThis`.
// sequence/paren layers peel per level
// is this member rooted in a PROXY SURFACE - the global itself, a minted spelling of it, or
// a const alias? such a read is re-readable by construction (plain hops off a stable root),
// so a sentinel residual reads it a second time instead of memoizing
// the SINK slot for a discarded for-init receiver: the pattern consumed the value whole, so only
// what the source OBSERVABLY does survives. a MULTI-hop receiver cannot sink verbatim - its raw
// intermediate hop reads undefined off-browser - so its harvested effects sink alone
// (`sf()[(c++, 'self')].Map` -> `_ref = (sf(), c++)`); every other shape sinks through the shared
// collapse (`(() => globalThis)().self.Promise` -> `_ref = _Promise`)
export function discardedSinkSlot(init, { metaPath, sinkDrop, sinkPlan, planMemoArg, adapter }) {
  // the collapse has already reshaped the receiver, so the surviving effects are read off the
  // CURRENT spelling: a folded hop key still hangs on its member (`(b++, _globalThis).Array`
  // -> `b++`), while a whole-swapped root left a bare sequence whose TAIL is the erased value
  if (sinkDrop && metaPath) {
    const rescued = discardRescueNodes({ node: init, scope: metaPath.scope, adapter, path: metaPath });
    if (rescued.length) return rescued.length === 1 ? rescued[0] : sequenceExpression(rescued);
    if (init?.type === 'SequenceExpression') {
      const kept = init.expressions.slice(0, -1);
      return kept.length === 1 ? kept[0] : sequenceExpression(kept);
    }
  }
  // the plan is the PRISTINE one the registration made: by drain time the walk has already
  // substituted the hop's own pure in place (`_self.Array`), where the navigation canon spells
  // the root binding (`_globalThis.Array`)
  const memoArgPlan = sinkPlan ?? (metaPath ? planMemoArg(init, metaPath) : null);
  return memoArgPlan ? buildMemoArg({ memoReceiver: init, memoArgPlan }) : init;
}

// can a synth slot spell this receiver more than once? the canonical RE-EVAL gate decides: a
// value that constructs (or a bare binding) is inert, while a call - or a literal carrying an
// ACCESSOR - re-fires on every emitted copy
// the INSTANCE param-default synth: the default becomes `{ key: helper(default) }`, the
// helper dispatching on a CLONE of the value it replaces. the key's own resolution against
// that value picks the TYPED helper over the generic dispatcher (`_atMaybeArray`, not `_at`)
export function registerInstanceSynthSlot({ metaPath, pattern, hostParent, entry, hintName, receiver, synthLedger, ctx }) {
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
  // the resolver descends by PATH (an array literal's common element type is a per-element
  // walk), so the default is asked through its own path - a wrapped one has none
  const receiverPath = hostParent.node.right === receiver ? hostParent.get('right')
    : iifeArgumentPathFor(hostParent, receiver);
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

// the ARGUMENT path holding an immediately-invoked host's receiver: the CALL is found past the
// wrappers the source may spell (`(0, (({ at }) => at))([1, 2])`), then its argument paths are
// peeled the same way the receiver was, descending an inline-array SPREAD (`(...)(...[[1, 2]])`
// pairs its slot inside the array). the type resolver descends by PATH, and this is where the
// receiver's own position lives
function iifeArgumentPathFor(hostParent, receiver) {
  function peeledPath(path) {
    return peelSkippableWrapperPath(path, TRANSPARENT_EXPR_WRAPPER_TYPES);
  }
  let callPath = null;
  for (let cur = hostParent, up = cur.parentPath; up?.node; cur = up, up = cur.parentPath) {
    if (up.node.type === 'CallExpression') {
      if (up.node.callee === cur.node) callPath = up;
      break;
    }
    if (!(TRANSPARENT_EXPR_WRAPPER_TYPES.has(up.node.type)
      || (up.node.type === 'SequenceExpression' && up.node.expressions.at(-1) === cur.node))) break;
  }
  for (const argPath of callPath?.get('arguments') ?? []) {
    const peeled = peeledPath(argPath);
    if (peeled?.node === receiver) return peeled;
    if (argPath.node?.type !== 'SpreadElement' || argPath.node.argument?.type !== 'ArrayExpression') continue;
    const found = argPath.get('argument').get('elements').map(el => peeledPath(el))
      .find(el => el?.node === receiver);
    if (found) return found;
  }
  return null;
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
export function seCarriedHopNav({ forInit, chain, declarator, prop, kind = null }) {
  const init = peelTransparentExpr(declarator.init);
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
    && isPureNavAfterSePrefix(init);
}

// the EXPRESSIONS an SE-carrying init performs before it yields the receiver: a sequence's leading
// ones, and a kept WRITE whole (it is both the effect and the store of the value read after it, so a
// sequence ENDING in one carries its last expression too)
export function carriedInitPrefix(declarator, declJobs) {
  if (declJobs.every(job => !job.seCarried)) return [];
  const init = peelTransparentExpr(declarator.init);
  if (init?.type === 'AssignmentExpression') return [init];
  const keepsTail = peelTransparentExpr(init.expressions.at(-1))?.type === 'AssignmentExpression';
  return keepsTail ? init.expressions : init.expressions.slice(0, -1);
}

// the prefix travels WITH the extraction's value: inside the dispatch ARGUMENT where the claim has
// one (`_m((eff(), recv))`), on the value itself where it does not (`const from = (eff(), _Array$from)`).
// this is the ONE shape every host accepts - a control slot hosts no statements at all - which is why
// no host analysis is left here and why both legs print it
export function carryInitPrefix(value, prefix) {
  if (!prefix.length) return value;
  if (value?.type === 'CallExpression' && value.arguments.length === 1) {
    value.arguments[0] = sequenceExpression([...prefix, value.arguments[0]]);
    return value;
  }
  return sequenceExpression([...prefix, value]);
}

// does this claim sit inside a function PARAMETER? the walk stops at the first binding host it
// meets, so a declarator / statement below the params answers no
// the PROXY-NAV base a synth receiver reduces to: pristine hops fold away, the root identifier
// carries the literal, and the keys that survive become the passthrough prefix. an ALIAS of a
// proxy global roots the nav too (`const g = globalThis; g.self.Map`) - the passthrough resolves
// through the canonical surface either way. a SEQUENCE holding the nav is transparent: the swap
// replaces the receiver WHOLE, so an effect-free prefix dies with it and an effect-bearing one
// re-runs ahead of the literal; only the OUTERMOST one may carry effects, a deeper prefix has no
// slot in the render order. `?.` hops qualify like plain ones - the collapse anchors on
// always-defined pure bindings, so the short-circuit is moot
export function proxyNavSynthBase(receiver, { scope, adapter, path }) {
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
  while (keys.length && isPristineProxyGlobal(adapter, keys[0])) keys = keys.slice(1);
  return {
    baseIdent: cur,
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

// the for-init memo verdict, per declarator. a SENTINEL residual re-reads the receiver:
// anything but a bare identifier / `this` memoizes first (`_ref = getArr(), findIndex =
// _f(_ref), { ..._unused } = _ref`) - but only where the extraction READS it too: a
// receiverless static leaves the residual as the only reader, and that read happens in
// place (the block-hosted rule). SEVERAL plain dispatches - or one beside a SURVIVING
// residual - must read ONE evaluation of the init the same way: the memo is a sibling
// declarator and every reader spells the ref (babel's head shape)
export function forInitMemoVerdicts(byDeclarator, mintRefName) {
  const memoRefs = new Map();
  for (const [declarator, declJobs] of byDeclarator) {
    const init = declarator?.init;
    const reusableInit = init?.type === 'Identifier' || init?.type === 'ThisExpression';
    if (!init || reusableInit || declJobs.some(job => job.chain?.length)) continue;
    const readers = declJobs.filter(job => job.readsReceiver).length;
    const consumed = declJobs.reduce((total, job) => total + patternBindingCount(job.prop.value), 0);
    const residualLives = patternBindingCount(declarator.id) !== consumed;
    if (declJobs.some(job => job.sentinel && job.readsReceiver) || readers > 1
      || (readers === 1 && residualLives && declJobs.every(job => !job.sentinel))) {
      memoRefs.set(declarator, mintRefName());
    }
  }
  return memoRefs;
}

// the bodyless kinds that wrap their slot in a block: an OVERWRITE host (and its
// array-wrapped twin) keeps the raw destructure first with the re-binds after (babel's
// shape - the native slot assigns first); a bodyless ARRAY-DECL host drains against a
// SYNTHETIC one-statement list and the slot takes the result back as a block
export function drainBodylessWrapKinds({ kind, kindJobs, hostNode, declNode },
  { program, drainArrayDeclaration, consumedAssignmentRemains }) {
  if ((kind === 'assign-overwrite' || kind === 'array-assign') && kindJobs[0]?.bodyless) {
    const overwrites = kindJobs.map(job => expressionStatement(
      assignmentExpression('=', identifier(job.local), job.value())));
    // the consumed slot leaves in a bodyless slot too, and a slot left with ONE statement keeps its
    // bare shape - the block is what holds two (the surviving destructure and the dispatch)
    const body = [...consumedAssignmentRemains(kindJobs) ?? [hostNode], ...overwrites];
    replaceNodeInTree(program, hostNode, body.length === 1 ? body[0] : { type: 'BlockStatement', body });
    return true;
  }
  if (kind === 'array-decl' && kindJobs[0]?.bodylessWrap) {
    const synthetic = [declNode];
    drainArrayDeclaration({ hostNode: declNode, body: synthetic, at: 0, jobs: kindJobs });
    if (synthetic.length !== 1 || synthetic[0] !== declNode) {
      replaceNodeInTree(program, declNode, { type: 'BlockStatement', body: synthetic });
    }
    return true;
  }
  return false;
}

// the per-job extraction pass of the array-decl drain, extracted for its size: builds the
// extraction declarations, renames (or removes) the consumed props, and groups jobs per
// declarator - see drainArrayDeclaration for the residual placement that follows
export function collectArrayDeclExtractions({ hostNode, jobs, sentinelNames, byDeclarator, extracted },
  { probeRenderCtx, mintUnusedName, removeConsumedProps, markSubtreeSkipped, skippedNodes }) {
  // the props EVERY job consumes, taken before the first removal: the verdict below asks whether
  // a prop the pattern KEEPS survives, and asking it against the shrinking pattern made the
  // answer depend on job ORDER - the first consumed prop left, the last one (by then the only
  // one left) stayed a sentinel
  const consumedProps = new Set(jobs.map(item => item.chain?.length ? item.chain.at(-1).hopProp : item.prop));
  for (const job of jobs) {
  // the wrapper element a pattern consumed WHOLE is still READ by native: the extraction
  // leads with that read, the same probe the plain declaration owes one level up
    const probeLead = extracted.length === 0 ? renderDiscardedInitProbe([job], probeRenderCtx) : null;
    const extractValue = probeLead ? sequenceExpression([probeLead, job.value()]) : job.value();
    const extractDecl = variableDeclaration(hostNode.kind, [variableDeclarator(job.bindingTarget, extractValue)]);
    extracted.push(exportWrap(stampReplacementSpan(extractDecl, hostNode), job.exported));
    // a fully-consumed NESTED hop takes the sentinel at the HOP, not at its leaf: the rest
    // sibling lives on the hop's OWN pattern, and it is the hop key that has to keep
    // excluding (`{ Array: { from: f }, ...r }` -> `{ Array: _unused, ...r }`)
    const sentinelProp = job.chain?.length === 1 && job.chain[0].outerRest
    && job.pattern.properties.length === 1 && job.pattern.properties[0] === job.prop
    ? job.chain[0].hopProp : job.prop;
    // ... but only a REST sibling forces the rename, and only where a real binding SURVIVES the
    // cascade: the consumed prop then LEAVES the residual with its emptied hop levels
    // (`[[{ Array: { from }, keep }]]` -> `[[{ keep }]]`). emptied whole, the element keeps its
    // renamed skeleton - babel drops only the shape that has nothing left to bind
    const topPattern = job.chain?.length ? job.chain.at(-1).outerPattern : job.pattern;
    const topConsumed = job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
    // the consumed prop LEAVES when a sibling prop still binds - and, whatever the pattern has
    // left, when the extraction READS the receiver: the residual re-reading the same key fires
    // its getter a second time, which native never does. a receiver-LESS static reads nothing,
    // so its slot keeps the sentinel (both legs' static canon). a REST gathers what the pattern
    // does not name, so a consumed key there stays excluded by its sentinel
    if (!hasRestSibling(job.pattern) && !job.chain?.some(level => level.outerRest)
    && topPattern?.type === 'ObjectPattern'
    // ... and never a prop whose KEY carries an effect: the key runs where it stands, so the
    // slot has to stay (renamed) or the effect leaves with it - and the removal takes the whole
    // SUBTREE, so a key deeper down leaves with it just the same
    // (`[{ y: { [(log.push("k"), "at")]: a } }] = [{ y: eff() }]` dropped the `k`)
    && !computedKeyHasSideEffects(topConsumed) && !patternKeepsEffectfulKey(topConsumed.value)
    && (job.kind === 'instance'
      || topPattern.properties.some(item => item !== topConsumed && !consumedProps.has(item)))) {
      removeConsumedProps([{ ...job, sentinel: false }]);
      if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, job);
      continue;
    }
    markSubtreeSkipped(skippedNodes, sentinelProp.value);
    const name = mintUnusedName();
    sentinelNames.add(name);
    sentinelProp.value = identifier(name);
    sentinelProp.shorthand = false;
    if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, job);
  }
}

// a fully-consumed NESTED hop takes the sentinel at the HOP, not at its leaf: the rest
// sibling lives on the hop's OWN pattern, so it is the hop key that has to keep excluding
// (`[{ Array: { fromAsync: fa }, ...r }]` -> `[{ Array: _unused, ...r }]`)
export function retargetSoleHopRestSentinels(jobs, { markSubtreeSkipped, skippedNodes }) {
  for (const job of jobs) {
    if (job.chain?.length !== 1 || !job.sentinel) continue;
    if (job.pattern.properties.length !== 1 || job.pattern.properties[0] !== job.prop) continue;
    const [{ hopProp, outerRest }] = job.chain;
    if (!outerRest) continue;
    markSubtreeSkipped(skippedNodes, hopProp.value);
    hopProp.value = identifier(job.mintSentinel());
    hopProp.shorthand = false;
    // the hop is consumed BY the sentinel, so the removal cascade has nothing left to walk
    job.sentinel = false;
    job.chain = [];
  }
}

// the memo statement a declarator's split emits. a chain job dispatching on the RESOLVED
// NESTED element memoizes THAT element: the residual keeps the wrapper with the element
// slot swapped to the ref, so both readers share one identity (`const _ref = [5, [6]];
// ... = { y: _ref };`). a memo LIFTED out of a multi-declarator host is a statement of
// its own, and babel gives it `const`; one that stays inside keeps the host's kind
// the receivers a residual could ALSO have spelled twice for free - a constant literal, an SE-free
// member or branch. those keep the comma join; an opaque one (a call, a member off a call) has to be
// memoized outright, and there both legs plant a statement ahead of the split
export function cheaplyRereadableInit(init) {
  const peeled = peelTransparentExpr(init);
  return isConstantLiteralReceiver(peeled) || isSeFreeMemberReceiver(peeled) || isSeFreeBranchingReceiver(peeled);
}

export function emitDeclaratorMemo({ refName, declarator, statements, declJobs, kind }) {
  if (!refName) return null;
  const nestedMemoNode = declJobs.find(job => job.nestedMemoNode)?.nestedMemoNode ?? null;
  const memoisedInit = nestedMemoNode ?? declarator.init;
  statements.push(variableDeclaration(kind, [variableDeclarator(identifier(refName), memoisedInit)]));
  if (nestedMemoNode) replaceNodeInTree(declarator.init, nestedMemoNode, identifier(refName));
  else declarator.init = identifier(refName);
  return memoisedInit;
}

// a re-anchored declarator standing beside siblings takes its own statement: the flatten
// rebuilds the declaration, and every sibling keeps its own slot (babel's split)
export function splitMultiDeclaratorHost({ program, declarator, markRewrite }) {
  let target = null;
  walkAstNodes({
    root: program,
    visit(node, parent) {
      if (target || node.type !== 'VariableDeclaration' || node.declarations.length < 2) return;
      const list = statementListOf(parent);
      if (!node.declarations.includes(declarator) || !list) return;
      target = { declaration: node, body: list };
    },
  });
  const at = target ? target.body.indexOf(target.declaration) : -1;
  if (at === -1) return;
  target.body.splice(at, 1, ...target.declaration.declarations.map(item => variableDeclaration(target.declaration.kind, [item])));
  markRewrite();
}

// does a pattern bind nothing any more - every object level emptied, every array element with it?
export function patternDead(node) {
  if (!node) return true;
  if (node.type === 'ArrayPattern') return node.elements.every(element => patternDead(element));
  if (node.type === 'ObjectPattern') return node.properties.length === 0;
  return false;
}

// the discarded ARRAY WRAPPER of a for-init sink: its own prefixes and those of the element it
// held run in SOURCE order, and the element's quiet tail is the value that survives
// (`(eff('outer'), [(eff('inner'), globalThis)])` -> `(eff('outer'), eff('inner'), _globalThis)`).
// a multi-element wrapper keeps its shape - the siblings still evaluate
export function flattenArrayWrapInit(node) {
  const effects = [];
  let cur = peelTransparentExpr(node);
  for (;;) {
    if (cur?.type === 'SequenceExpression') {
      effects.push(...cur.expressions.slice(0, -1));
      cur = peelTransparentExpr(cur.expressions.at(-1));
      continue;
    }
    if (cur?.type === 'ArrayExpression' && cur.elements.length === 1 && cur.elements[0]) {
      cur = peelTransparentExpr(cur.elements[0]);
      continue;
    }
    break;
  }
  return effects.length ? sequenceExpression([...effects, cur]) : cur;
}

// an array wrapper with no resolvable element: the for-init sink takes it, else a wrapper the
// resolver DECLINED (a sibling element whose effects the drop would erase) keeps its destructure
// and its NESTED leaf takes the sound inline default - the captured-result rule, one host over
// (`[[{ Object: { hasOwn = _Object$hasOwn } }]]`)
export function declinedWrapperTakesDefault(args, ctx) {
  if (ctx.registerForInitWrapJob(args)) return true;
  if (args.chain.length && ctx.nestedSynth?.()) return true;
  const { kind, entry, hintName, prop, chain, hostPatternPath } = args;
  if (!chain.length || kind === 'instance' || prop.value.type !== 'Identifier'
    || !arrayWrapperInDeclarator(hostPatternPath)) return false;
  applyInlineDefault({ prop, entry, hintName, ...ctx });
  return true;
}

// the bodyless MULTI-declarator slot whose jobs need a memo: the statement becomes a block, each
// declarator its own statement, and the jobbed one keeps the residual-then-extraction join a
// lifted memo asks for (`if (c) { var { keys } = _g.Array; const _ref = arr; var { ..._unused } =
// _ref, a = _at(_ref); }`)
export function drainBodylessMultiMemo({ hostNode, declaration, jobs },
  { program, mintRefName, removeConsumedProps, markRewrite }) {
  const byDeclarator = new Map();
  for (const job of jobs) {
    if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
    byDeclarator.get(job.declarator).push(job);
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
      for (const expr of observableSequenceElements(seqPrefix)) statements.push(expressionStatement(expr));
      declarator.init = initTail;
    }
    const values = declJobs.map(job => job.value(memoRef));
    if (memoRef) {
      statements.push(variableDeclaration('const', [variableDeclarator(identifier(memoRef), declarator.init)]));
      declarator.init = identifier(memoRef);
    }
    removeConsumedProps(declJobs);
    const residualLives = declarator.id.type !== 'ObjectPattern' || declarator.id.properties.length !== 0;
    statements.push(variableDeclaration(declaration.kind, [
      ...residualLives ? [declarator] : [],
      ...declJobs.map((job, at) => variableDeclarator(identifier(job.local), values[at])),
    ]));
  }
  if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: statements })) markRewrite();
}

// will every key of this synth plan resolve to a polyfill SLOT? a fully covered pattern takes the
// flat rescue at drain, so its IIFE param is never read - and a name minted for it strands the slot
// the LIVE param would have taken. only a STATIC resolution fills a slot: a key answering with an
// INSTANCE dispatch leaves the pattern uncovered and the drain builds the IIFE after all
export function synthPlanFullyCovered(plan, receiver, metaPath, { adapter, resolvePure }) {
  // a FALLBACK operand changes nothing about which keys the LEFT can answer - the literal is
  // built over that left, exactly as every other route peels it
  const named = peelTransparentExpr(receiver)?.type === 'LogicalExpression'
    ? peelTransparentExpr(receiver).left : receiver;
  const objectName = named
    ? resolveObjectName({ objectNode: named, ...nodeSite(named, metaPath), adapter }) : null;
  if (!objectName) return false;
  return plan.every(entry => typeof entry.lookupKey === 'string' && resolvePure({
    kind: 'property', object: objectName, key: entry.lookupKey, placement: 'static',
  }, metaPath)?.kind === 'static');
}

// does this array-wrapped pattern hang off a DECLARATOR? a param slot has its own synth route
// (its caller supplies the value), and the inline default would preempt it
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

function arrayWrapperInDeclarator(patternPath) {
  return !!arrayWrapperDeclarator(patternPath);
}

// one descent step into a literal: an INDEX reads an array element, a KEY an object property.
// a spread anywhere could supply either, so a literal carrying one answers for neither
function stepIntoLiteral(node, step) {
  if (step.key === undefined) {
    return node?.type === 'ArrayExpression' && !spreadShiftsIndex(node.elements, step.index)
      ? node.elements[step.index] ?? null : null;
  }
  if (node?.type !== 'ObjectExpression'
    || node.properties.some(item => item.type === 'SpreadElement')) return null;
  const prop = node.properties.find(item => (item.type === 'Property' || item.type === 'ObjectProperty')
    && !item.computed && propertyKeyName(item) === step.key);
  return prop?.value ?? null;
}

// does a KEYED level carry an effect anywhere but on the step's own property?
function objectLevelNeighbourEffect(node, key) {
  return node?.type === 'ObjectExpression'
    && node.properties.some(item => propertyKeyName(item) !== key && mayHaveSideEffects(item.value));
}

// `readsReceiver`: the claim's own dispatch reads the paired element (an instance / symbol
// extraction), so hoisting it ahead of the declaration moves that read
// eslint-disable-next-line max-statements -- the wrapper climb and its two host descents
export function resolveArrayWrappedReceiver(patternPath, aliasCtx = null,
  { allowForInit = false, allowBodylessMulti = false, readsReceiver = false } = {}) {
  const indices = [];
  let sole = true;
  let neighbourEffect = false;
  let precedingPure = true;
  let wrapperRest = false;
  let cur = patternPath;
  for (;;) {
    const parent = cur.parentPath?.node;
    // an element DEFAULT is dead once the matched element provably exists - the claims
    // below only resolve off a proven receiver, so stepping through is sound
    // (`[, { from } = {}] = [Set, Array]` - babel extracts through it)
    if (parent?.type === 'AssignmentPattern' && parent.left === cur.node) {
      cur = cur.parentPath;
      continue;
    }
    // a KEY may stand between two wrapper levels (`{ pair: [{ at }] } = { pair: [arr] }`): the
    // pattern's key picks the literal's property exactly as its slot picks an element, so the climb
    // takes both and the descent below reads each step in its own dialect
    if ((parent?.type === 'Property' || parent?.type === 'ObjectProperty') && parent.value === cur.node) {
      if (parent.computed || indices.length === 0) break;
      const key = propertyKeyName(parent);
      if (typeof key !== 'string') return null;
      const owner = cur.parentPath?.parentPath?.node;
      if (owner?.type !== 'ObjectPattern') return null;
      if (owner.properties.length !== 1) sole = false;
      if (owner.properties.some(item => item?.type === 'RestElement')) wrapperRest = true;
      indices.unshift({ key });
      cur = cur.parentPath.parentPath;
      continue;
    }
    if (parent?.type !== 'ArrayPattern') break;
    const index = parent.elements.indexOf(cur.node);
    if (index === -1) return null;
    // a SIBLING element pins the positions: a consumed prop there renames to `_unused`
    // instead of leaving, so only an all-single wrapper chain may drop whole
    if (parent.elements.length !== 1) sole = false;
    // ... and a REST element keeps the wrapper whatever the claims take, so its residual stays a
    // SECOND reader of this element
    if (parent.elements.some(item => item?.type === 'RestElement')) wrapperRest = true;
    indices.unshift({ index });
    cur = cur.parentPath;
  }
  if (!indices.length) return null;
  const hostParent = cur.parentPath;
  // the ASSIGNMENT twin: `[{ ... }] = [recv]` at statement position - the residual is the
  // RHS array kept as an expression (its element SEs still run), the overwrite lands after
  if (hostParent?.node?.type === 'AssignmentExpression' && hostParent.node.left === cur.node
    && hostParent.node.operator === '=') {
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && TRANSPARENT_EXPR_WRAPPER_TYPES.has(exprStmtPath.node?.type)) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    if (exprStmtPath?.node?.type !== 'ExpressionStatement') return null;
    // a BODYLESS slot (`if (c) [{ flat }] = [a];`) has no list to splice into - flagged, the
    // registration gates it and the drain wraps the slot in a block
    const bodyless = !statementListOf(exprStmtPath.parentPath?.node);
    // a SIBLING element (`[{ of }, other] = [Array, 1]`) keeps the whole destructure raw - it still
    // binds - so the claim there lands the way the BODYLESS slot's does: the slot stays verbatim and
    // the overwrite appends after it, which makes the element a SECOND read the registration gates
    const multi = !sole || (cur.node.type === 'ArrayPattern' && cur.node.elements.length !== 1);
    let element = hostParent.node.right;
    for (const step of indices) {
      element = followConstLiteralAlias(peelTransparentExpr(element), aliasCtx);
      if (element?.type === 'SequenceExpression') element = peelTransparentExpr(element.expressions.at(-1));
      element = stepIntoLiteral(element, step);
      if (!element) return null;
    }
    element = peelTransparentExpr(element);
    // the UNPEELED spelling rides along, as it does on the declaration branch: what a claim inside
    // the element may lift into the residual is a property of the node the source wrote, and the
    // peel below hides exactly that (a second pass sees `(prefix, tail)` where the first saw the
    // prefix buried inside the tail's own receiver)
    const elementNode = element;
    if (element?.type === 'SequenceExpression') element = peelTransparentExpr(element.expressions.at(-1));
    return { assignment: hostParent.node, exprStmtPath, element, elementNode, bodyless, multi };
  }
  if (hostParent?.node?.type !== 'VariableDeclarator' || hostParent.node.id !== cur.node) return null;
  // the wrapper does not change WHERE the declaration lives, so the shared host
  // classification answers for it too - an EXPORTED slot and a BODYLESS one included
  const host = classifyDeclarationHost(hostParent);
  if (!host || (host.forInit && !allowForInit)) return null;
  // a BODYLESS slot is hosted only through the block-wrapping registration: a sole-element
  // wrapper takes the shared bodyless job, a pinned SIBLING position keeps its renamed
  // residual and only the array-decl route (which opts in) may block-wrap it
  if (host.bodyless && !sole && !allowBodylessMulti) return null;
  const { declarationPath, exported } = host;
  // `aliasCtx` opts into the canonical const-alias follow (`const wrap = [Promise]; const
  // [{ resolve }] = wrap`); a caller whose extraction re-reads the element passes none
  // ... unless the wrapper was reached through a CONST ALIAS: the array literal lives in its own
  // declaration and evaluates there, so dropping this destructure erases none of its elements
  let element = hostParent.node.init;
  let aliased = false;
  for (const step of indices) {
    const peeledElement = peelTransparentExpr(element);
    // EVERY level follows its alias: an alias inside an alias (`const inner = [Array]; const outer =
    // [inner]; const [[{ from }]] = outer`) is followed at the second level exactly like the first -
    // folding the follow into the `aliased ||=` update short-circuited it away once one level had
    // aliased, and the leg stayed native where the babel plan flattened
    element = followConstLiteralAlias(peeledElement, aliasCtx);
    aliased ||= element !== peeledElement;
    if (element?.type === 'SequenceExpression') element = peelTransparentExpr(element.expressions.at(-1));
    if (step.key !== undefined) {
      const next = stepIntoLiteral(element, step);
      if (!next) return null;
      // a keyed level's OTHER properties are neighbours the same way an element's are: they
      // evaluate before the read a hoist would perform, and the walk has no route that reorders
      // them, so an effect there keeps the extraction behind the residual
      neighbourEffect ||= readsReceiver && !aliased && objectLevelNeighbourEffect(element, step.key);
      precedingPure &&= !objectLevelNeighbourEffect(element, step.key);
      element = next;
      continue;
    }
    const { index } = step;
    if (element?.type !== 'ArrayExpression' || spreadShiftsIndex(element.elements, index)) return null;
    // an element the pattern does not bind still EVALUATES - a spread ITERATES its argument, a
    // call runs. a SOLE slot drops the wrapper whole, which would ERASE that value
    if (sole && !aliased && arrayWrapperNeighbourEffect(element, index)) return null;
    // ... and with the residual surviving, the value is safe but the ORDER is not: native
    // evaluates every element before reading a property off any of them, so a READING
    // extraction hoisted ahead of the declaration would read first (runtime-checked: native
    // `g() | read at`, hoisted `read at | g()`). such a claim extracts AFTER the residual
    neighbourEffect ||= readsReceiver && !aliased && arrayWrapperNeighbourEffect(element, index);
    // ... and whether a MEMO of this element would keep source order: hoisting it ahead of the
    // declaration evaluates it before every element, so only a slot whose PREDECESSORS are pure
    // may take one (`[recv, g()]` memoizes, `[g(), recv]` does not)
    precedingPure &&= element.elements.slice(0, index).every(item => !mayHaveSideEffects(item));
    element = element.elements[index];
    if (!element) return null;
  }
  // the element AS WRITTEN stays available for the spellers: a TS cast / non-null on it is the
  // receiver's own spelling and both legs keep it in the dispatch (`_at(arr as any)` - the flat
  // canon), while the classifiers below want it peeled
  const writtenElement = element;
  element = peelTransparentExpr(element);
  // the SEQUENCE spelling stays available too: a host that lifts the prefix itself needs the
  // whole element, the value consumers want its quiet tail
  const elementNode = element;
  if (element?.type === 'SequenceExpression') element = peelTransparentExpr(element.expressions.at(-1));
  return {
    declarator: hostParent.node,
    declarationPath,
    element,
    elementNode,
    exported,
    host,
    single: sole,
    wrapperRest,
    neighbourEffect,
    precedingPure,
    writtenElement,
  };
}

// literal-route receiver memo: `const _ref = <recv>` ahead, the residual's slot swaps
// to it - once per shared ref
// a claimed declarator whose OWN pattern still binds a plain prop takes its single extraction as a
// DECLARATOR right after itself, with whatever the source wrote BEHIND it split into a statement of
// its own: that surviving prop is what pins the pair together. a pattern left holding nothing but a
// rest, or one with nothing written behind it, reads through the memo from its own statement instead
export function groupExtractionBesideResidual({ hostNode, body, at, declarations, claimed, extracted, leading }) {
  if (!leading.length || body[at] !== hostNode) return false;
  if (extracted.length !== 1 || extracted[0].type !== 'VariableDeclaration'
    || extracted[0].kind !== hostNode.kind || extracted[0].declarations.length !== 1) return false;
  const surviving = declarations.filter(declarator => claimed.has(declarator));
  if (surviving.length !== 1) return false;
  const patterns = surviving[0].id?.type === 'ArrayPattern' ? surviving[0].id.elements : [surviving[0].id];
  const keepsPlainProp = patterns.some(item => item?.type === 'ObjectPattern'
    && item.properties.some(prop => prop.type !== 'RestElement'
      && !(prop.value?.type === 'Identifier' && prop.value.name.startsWith('_unused'))));
  const pivot = declarations.indexOf(surviving[0]);
  if (!keepsPlainProp || pivot === declarations.length - 1) return false;
  hostNode.declarations = [...declarations.slice(0, pivot + 1), extracted[0].declarations[0]];
  body.splice(at, 0, ...leading);
  body.splice(body.indexOf(hostNode) + 1, 0,
    variableDeclaration(hostNode.kind, declarations.slice(pivot + 1)));
  return true;
}

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
    statements.push(variableDeclaration(memoKind, [variableDeclarator(identifier(memo.refName), live)]));
    // the memoized node may BE the init itself - the in-tree walk only sees children
    if (memo.slot) memo.slot.owner[memo.slot.key] = identifier(memo.refName);
    else if (declarator.init === memo.node) declarator.init = identifier(memo.refName);
    else replaceNodeInTree(declarator.init, memo.node, identifier(memo.refName));
  }
}

export function buildMemoArg(pending) {
  const { memoReceiver, memoArgPlan } = pending;
  if (!memoArgPlan) return memoReceiver;
  // drain-time clones of the LIVE harvested se: the walk's in-place claims already landed
  const ahead = [...memoArgPlan.prefix, ...(memoArgPlan.liveSe ?? []).map(node => cloneNode(node))];
  return ahead.length ? sequenceExpression([...ahead, memoArgPlan.target]) : memoArgPlan.target;
}

// per-group sentinel residuals: walk the pattern's props (sentinels already renamed),
// each job prop opens a group holding its sentinel and the trailing non-job props; the
// group's residual re-reads the identifier init, and the extraction's side is decided by
// the job's defaultedness
export function emitSentinelGroups({ hostNode, declarator, declJobs, statements }) {
  const jobByProp = new Map(declJobs.map(job => [job.prop, job]));
  // non-job props flow FORWARD into the next job's group (`{ [se1]: ks = d, message,
  // [se2]: fi }` puts `message` with fi's residual); a trailing run joins the last group
  const groups = [];
  let buffered = [];
  for (const prop of declarator.id.properties) {
    const job = jobByProp.get(prop);
    if (job) {
      groups.push({ job, props: [...buffered, prop] });
      buffered = [];
    } else buffered.push(prop);
  }
  if (buffered.length && groups.length) groups.at(-1).props.push(...buffered);
  for (const group of groups) {
    const residual = variableDeclaration(hostNode.kind, [variableDeclarator(
      { type: 'ObjectPattern', properties: group.props }, cloneNode(declarator.init))]);
    if (!group.job) {
      statements.push(residual);
      continue;
    }
    const declarators = [variableDeclarator(group.job.bindingTarget, group.job.value())];
    if (group.job.value.leadRef) declarators.unshift(variableDeclarator(identifier(group.job.value.leadRef)));
    const extraction = variableDeclaration(hostNode.kind, declarators);
    if (group.job.defaulted) statements.push(residual, extraction);
    else statements.push(extraction, residual);
  }
}

// a receiverless-STATIC SE-key sentinel in a MULTI declaration: the extraction lands
// ahead as its own statement and the declaration stays WHOLE - untouched siblings and
// the renamed residual in one (`const from = _Array$from; const first = 1, { [(eff(),
// 'from')]: _unused } = Array;` - babel's shape)
export function splitStaticSeKeyAhead({ hostNode, body, at, jobs, markRewrite }) {
  if (hostNode.declarations.length <= 1) return false;
  if (jobs.some(job => !(job.sentinel && job.seKey && !job.readsReceiver && !job.chain?.length && !job.exported))) return false;
  if (jobs.some(job => job.host === 'memo-decl')) return false;
  const ahead = orderDeclaratorJobs(jobs).map(job => variableDeclaration(hostNode.kind,
    [variableDeclarator(job.bindingTarget, job.value())]));
  // ... but the extraction may not hoist over an init the SOURCE runs first, and the receiver's own
  // sequence prefix runs before either. where one of those pins the order the declaration SPLITS at
  // its slot and the pair lands inside that split (`zPre = pre(); eff(); const from = _Array$from;`)
  const slot = hostNode.declarations.find(declarator => jobs.some(job => job.pattern === declarator.id));
  const index = slot ? hostNode.declarations.indexOf(slot) : -1;
  const pinned = index > 0
    && hostNode.declarations.slice(0, index).some(declarator => mayHaveSideEffects(declarator.init));
  const peeled = slot ? peelNestedSequenceExpressions(slot.init) : { prefix: [], tail: null };
  if (!pinned && !peeled.prefix.length) {
    body.splice(at, 0, ...ahead);
    markRewrite();
    return true;
  }
  if (peeled.prefix.length) slot.init = peeled.tail;
  const lifted = liftedPrefixStatements(peeled.prefix);
  const before = hostNode.declarations.slice(0, index);
  const rest = hostNode.declarations.slice(index);
  body.splice(at, 1, ...before.length ? [variableDeclaration(hostNode.kind, before)] : [],
    ...lifted, ...ahead, variableDeclaration(hostNode.kind, rest));
  markRewrite();
  return true;
}

// an all-SE-key sentinel declarator in an ORIGINALLY-multi declaration joins as ONE
// declaration, residual first (`const { [(eff(), 'at')]: _unused } = arr, a = _at(arr);`
// - babel's sibling shape); the single-declarator twin keeps the extraction-first split,
// and a receiverless STATIC splits too (`of = _Array$of` reads nothing off the residual)
// SEVERAL SE keys on one pattern INTERLEAVE with their extractions: native evaluates key,
// read, default, next key - so each key's residual segment sits immediately before the
// extraction that reads its slot, instead of every key running ahead of every read
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
  firstDeclarator,
}, sentinelMemoNames, mintRefName) {
  if (!keepKey || memoRecv || kind !== 'instance' || forInit || sentinelMemoNames.has(declarator)
    || prop.value.type !== 'AssignmentPattern'
    || !sentinelMemoInitShape(unwrapRuntimeExpr(declarator.init), allProxyInit, firstDeclarator)) return;
  sentinelMemoNames.set(declarator, mintRefName());
}

// which INIT shapes need the sentinel memo: the residual re-reads the receiver, so a read the
// second reader cannot repeat verbatim (a member / call / sequence, a value-SELECTING branch, a
// constant literal) memoizes once. an ALL-PROXY selection re-reads for free
export function sentinelMemoInitShape(init, allProxyInit, firstDeclarator = true) {
  return init?.type === 'MemberExpression' || init?.type === 'CallExpression'
    || init?.type === 'SequenceExpression'
    || ((init?.type === 'ConditionalExpression' || init?.type === 'LogicalExpression') && !allProxyInit)
    // ... a CONSTANT literal only on the FIRST declarator: a later one re-reads the literal in
    // both places rather than hoisting a second memo out of the comma list
    // (`..., { [(e(), 'toSorted')]: _unused } = [4], s1 = _toSorted([4])`)
    || (isConstantLiteralReceiver(init) && firstDeclarator);
}

// the residual + extractions of ONE declarator: segmented when the source reads props past the
// last job's own slot (or when several jobs interleave), else the plain residual-then-extractions
export function seKeySegmentedDeclarators(declarator, jobs, refName) {
  if (jobs.length > 1 || (jobs.length === 1 && trailingSeKeyProps(declarator, jobs[0]))) {
    return interleavedSeKeySegments(declarator, jobs, refName);
  }
  return [declarator, ...jobs.map(job => variableDeclarator(job.bindingTarget, job.value(refName)))];
}

// props the source reads PAST the job's own slot - and only ORDINARY ones: a REST read takes the
// whole remainder and stays in the residual beside the sentinel, which is what babel spells
export function trailingSeKeyProps(declarator, job) {
  // ... and only under a DEFAULT: there the guard reads past the key effect, so the source reads
  // the trailing props after the extraction. a plain job leaves them in the residual
  if (!job.defaulted || declarator.id.type !== 'ObjectPattern') return false;
  const after = declarator.id.properties.slice(declarator.id.properties.indexOf(job.prop) + 1);
  return after.length > 0 && after.every(prop => prop.type === 'Property');
}

export function interleavedSeKeySegments(declarator, jobs, refName) {
  const jobByProp = new Map(jobs.map(job => [job.prop, job]));
  const declarators = [];
  let buffered = [];
  for (const prop of declarator.id.properties) {
    buffered.push(prop);
    const job = jobByProp.get(prop);
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
    ? renderStaticDefaultGuard({ read: built, defaultValue: valueNode.right, reread: built })
    : renderInstanceDefaultGuard({
      assignedRef: identifier(guardRef),
      call: built,
      defaultValue: valueNode.right,
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
}) {
  if (!declJobsHere.length || declarator.init?.type !== 'Identifier') return false;
  // a SOLE declarator with ONE job joins only when that job is DEFAULTED: its guard must read
  // PAST the key effect, so the residual runs first. a plain single job keeps the split,
  // extraction ahead. SEVERAL jobs join either way - the interleave gives each its own segment
  if (hostNode.declarations.length <= 1 && declJobsHere.length === 1 && !declJobsHere[0].defaulted) {
    return false;
  }
  if (declJobsHere.some(job => !(job.sentinel && job.seKey && !job.catchBorn && !job.chain?.length))) return false;
  if (declJobsHere.some(job => !job.readsReceiver)) return false;
  const jobs = orderDeclaratorJobs(declJobsHere);
  statements.push(exportWrap(variableDeclaration(hostNode.kind,
    // ... and props AFTER the job's own read segment the same way: the source reads them past
    // the extraction, so they follow it in their own declarator (`{ [k]: _unused } = _ref, m =
    // ..., { other } = _ref`)
    seKeySegmentedDeclarators(declarator, jobs, refName)),
  exported));
  markRewrite();
  return true;
}
