import {
  applyNestedParamSynthPlan, buildNestedParamSynthPlan, classifyCallBranchForSynth,
  conditionalDestructureLeftUntouchedWarning, fallbackBranchSwapKeepsSelection,
  fallbackDestructureHasPolyfillableBranch,
  isConstantLiteralReceiver, isReReferenceableReceiver, isViableBranchForKey, renderSynthTree,
  resolveNestedReceiverNode, resolvePassthroughRef,
  qualifiesForParamBodyExtract,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { symbolIteratorInstanceLeaf } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import {
  maybeRegisterAssignmentAliasWrite, registerBindinglessCtorAlias, registerDeclAliasIfSound,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  computedPropKeyHostsMachinery, planProxyReceiver, shouldDropRescueReceiver,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  discardRescueNodes, findProxyGlobal, inlineCallHasObservableEffects, inlineCallReturnExpression,
  isStaticPlacement, navValueCanShortCircuit, peelReceiverSequenceTail, proxyReceiverValueCanBeUndefined,
  proxyGlobalMemberCtorPure, proxyGlobalMemberCtorPureSwap, resolveObjectName, resolveSynthKeys, sealedChainBoundary,
  sealedClaimLeafGuardPlan,
} from '@core-js/polyfill-provider/detect-usage/resolve';

import {
  patternBindingCount,
  POSSIBLE_GLOBAL_OBJECTS, SINGLE_STATEMENT_SLOTS, TS_EXPR_WRAPPERS,
  assignmentInStatementPosition, catchPropRewriteObservable, computedKeyHasSideEffects,
  computedKeysAllBound, followConstLiteralAlias, getFallbackBranchSlots, isNonReferencePosition, isPristineProxyGlobal,
  isValidIdentifierName, memberKeyName,
  isMutatedGlobalSlot, isSynthSimpleObjectPattern, mayHaveSideEffects, receiverCarriesLiveOptional, statementListOf,
  peelFallbackBranchInner, peelNestedSequenceExpressions,
  reEvaluationObservable,
  relocatedCatchPattern, relocatedCatchPropUnobservable, resolveFallbackReceiver, synthSlotName,
  hasRestSiblingExcept, paramsHaveInvisibleCallers, propBindingIdentifier,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { detectIifeArgReceiver, findSynthSwapReceiver } from '../destructure-emit-utils.js';
import {
  ownEmittedPatternClaim,
  ownOutputTests,
  restSentinelExtractionSibling,
} from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  isDirectiveStatement, walkAstNodes,
} from '../plugin-helpers.js';
import { mintedProxyGlobalName,
  discardedSequenceElement, memberFromKeyName, proxyStoreIsSpellable, receiverCarriesOptional,
  renderProxyReceiverPlan, replaceNodeInTree } from './emit-shared.js';
import {
  assignmentExpression, binaryExpression, callExpression, chainExpression, cloneNode, conditionalExpression,
  expressionStatement, identifier, literal, memberExpression, objectExpression, objectProperty, sequenceExpression,
  variableDeclaration, variableDeclarator, voidZero,
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
function peelWrappers(node) {
  while (node && (node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(node.type))) node = node.expression;
  return node;
}

// ... and through the chain wrapper an inner `?.` wears, which a NAV walk reads past: the
// short-circuit itself lives on the hop nodes, not on the wrapper
function peelNavWrappers(node) {
  let cur = peelWrappers(node);
  while (cur?.type === 'ChainExpression') cur = peelWrappers(cur.expression);
  return cur;
}

function propLocalName(prop) {
  return prop.value.type === 'AssignmentPattern' ? prop.value.left.name : prop.value.name;
}

const SELECTING_INIT_TYPES = new Set(['ConditionalExpression', 'LogicalExpression']);

// a prop whose value is OUR rest sentinel is a prop we already processed (a re-parse of
// our own output): nothing routes it again, ahead of EVERY route in the claim funnel -
// the text dispatcher's twin skip, through the shared sibling proof. `symbolIterator`
// derives from the meta - the funnel runs before any entry resolution
// the prop's LOCAL binding name - through a slot default (`{ flat: m = fb }` binds `m`)
function overwriteRebindEmitted({ metaPath, injectorState }) {
  return ownEmittedPatternClaim(metaPath, ownOutputTests(injectorState));
}

function sentinelAlreadyProcessed({ metaPath, meta, symbolIterator, injectorState }) {
  const prop = metaPath.node;
  return prop.value?.type === 'Identifier' && injectorState.hasGeneratedUnusedName(prop.value.name)
    && (!injectorState.isAdoptedUnusedName(prop.value.name) || restSentinelExtractionSibling(metaPath, {
      key: typeof meta?.key === 'string' ? meta.key : prop.key?.name ?? prop.key?.value,
      symbolIterator,
      injector: injectorState,
    }));
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
function emitAssignStaticDefaultOverwrite({ hostParent, prop, pattern, chain, kind, entry, hintName, metaPath }, ctx) {
  if (kind === 'instance' || !chain.length
    || prop.value?.type !== 'AssignmentPattern' || prop.value.left?.type !== 'Identifier'
    || patternBindingCount(pattern) !== 1) return false;
  const discardable = isPureNavReceiver(hostParent.node.right)
    || allProxySelectingInit(hostParent.node.right, { adapter: ctx.adapter, injectorState: ctx.injectorState })
    || staticallySelectedLeft({
      selecting: peelWrappers(hostParent.node.right), meta: null, metaPath,
      soleBinding: true, chain, adapter: ctx.adapter, kind,
    });
  if (!discardable) return false;
  const id = ctx.injectPureImport(entry, hintName);
  ctx.markRewrite();
  ctx.markSubtreeSkipped(ctx.skippedNodes, hostParent.node);
  hostParent.replaceWith(assignmentExpression('=', identifier(prop.value.left.name), identifier(id)));
  return true;
}

function routeSelectionMirror(metaPath, handlePerBranch) {
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
function classifyDeclarationHost(hostParent) {
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
  if (!forInit && !exported && !bodyless && !statementListOf(stmtParent)) return null;
  return { declarator, declarationPath, declaration, forInit, exported, bodyless };
}

function defaultedSoleConsumes({ forInit, prop, soleBinding, chain, kind, declarator }) {
  if (forInit || prop.value.type !== 'AssignmentPattern' || !soleBinding || chain.length !== 0) return false;
  if (kind !== 'instance' && mayHaveSideEffects(declarator.init)) return false;
  const inner = peelWrappers(declarator.init);
  return inner?.type !== 'ConditionalExpression' && inner?.type !== 'LogicalExpression';
}

// does the receiver's spine carry a computed HOP KEY with an effect (`globalThis[(c++, 'self')]`)?
// asked on the PRISTINE tree: the collapse folds that key away, and the harvested effect then
// looks like any other statement-level one
function navSpineHasComputedKeyEffect(initNode) {
  for (let cur = peelWrappers(initNode); cur?.type === 'MemberExpression'; cur = peelWrappers(cur.object)) {
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
function initRawKeyOnRoot(initNode) {
  // a leading SE sequence is transparent: its own prefix rides the same lift
  // (`(e++, globalThis[(e++, 'Symbol')])`)
  let init = peelWrappers(initNode);
  while (init?.type === 'SequenceExpression') init = peelWrappers(init.expressions.at(-1));
  return init?.type === 'MemberExpression' && init.computed && mayHaveSideEffects(init.property)
    && peelWrappers(init.object)?.type === 'Identifier';
}

// a SEQUENCE root DIRECTLY under the claimed key: the collapse rebuilds the whole read as
// `(eff, _Ctor)`, so lifting only the prefix would drop the ctor's own import
// (`(e++, globalThis).Promise` lifts `(e++, _Promise)`). a PROXY HOP between them is the other
// shape - there the read collapses whole and only the effect survives
function initSeqDirectClaim(initNode) {
  const init = peelWrappers(initNode);
  if (init?.type !== 'MemberExpression' || init.computed) return false;
  const base = peelWrappers(init.object);
  if (base?.type !== 'SequenceExpression'
    || base.expressions.slice(0, -1).every(expr => !mayHaveSideEffects(expr))) return false;
  // the tail must be the BARE root: a NAV tail collapses whole with its hops and leaves only
  // the effect (`(c++, globalThis.self).Map` -> `c++;`)
  return peelWrappers(base.expressions.at(-1))?.type === 'Identifier';
}

function buriedKeyClaimInit(initNode) {
  // a leading SE sequence is transparent: the buried key sits in its TAIL
  let init = peelWrappers(initNode);
  while (init?.type === 'SequenceExpression') init = peelWrappers(init.expressions.at(-1));
  if (init?.type !== 'MemberExpression' || !init.computed || !mayHaveSideEffects(init.property)) return false;
  let root = peelWrappers(init.object);
  while (root?.type === 'MemberExpression') root = peelWrappers(root.object);
  return root?.type === 'Identifier';
}

// does the receiver's own SEQUENCE root carry a kept write (`(a = f(), globalThis).Symbol`)?
// asked on the PRISTINE tree: by drain time the collapse may have eaten the member above it, and
// only the source shape tells this from an effect buried in a computed KEY
function initSeqRootHasKeptWrite(initNode) {
  const init = peelWrappers(initNode),
        base = init?.type === 'MemberExpression' ? peelWrappers(init.object) : null;
  return base?.type === 'SequenceExpression' && base.expressions.some(expr => {
    const stored = peelWrappers(expr);
    return stored?.type === 'AssignmentExpression' && stored.operator === '=';
  });
}

// the receiver of an assignment-form destructure is read once per extraction plus once by a
// surviving residual: an unreusable spelling read twice takes the memo the declaration form
// already mints (`const _ref = obj.list;` - a second read would re-run the getter)
// a BODYLESS assignment host (`if (c) ({ Map: M } = g);`) has no statement list to splice into:
// it rewrites only when the whole destructure collapses into exactly one assignment, or when a
// memoized receiver braces the slot around both its reads
function drainBodylessAssignment({ hostNode, jobs }, {
  program, markRewrite, mintRefName, removeConsumedProps, reanchorSoleCtorHopResidual,
}) {
  if (jobs.some(job => job.sentinel)) return;
  const statements = jobs.map(job => expressionStatement(
    assignmentExpression('=', propBindingTarget(job.prop), job.value())));
  // the lifted SE prefix runs first, once
  const [{ seqPrefix }] = jobs;
  if (seqPrefix?.length) statements.unshift(...seqPrefix.map(expr => expressionStatement(expr)));
  removeConsumedProps(jobs);
  const [{ assignment: bodylessAssign }] = jobs;
  // the memo verdict needs the residual as it SURVIVES - after the consumed props leave
  const memoRef = assignmentMemoRef(bodylessAssign, jobs, mintRefName),
        memoInit = memoRef ? bodylessAssign.right : null;
  // a MEMOIZED receiver hosts both reads in ONE block: the `_ref` declaration and the
  // residual reading it belong together, so the slot braces exactly once
  if (memoRef) {
    for (const [index, job] of jobs.entries()) {
      statements[index].expression.right = job.value(memoRef);
    }
    bodylessAssign.right = identifier(memoRef);
    statements.unshift(variableDeclaration('const',
      [variableDeclarator(identifier(memoRef), memoInit)]));
    if (bodylessAssign.left.properties.length !== 0) statements.push(expressionStatement(bodylessAssign));
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: statements })) markRewrite();
    return;
  }
  // a SURVIVING residual rides the same block: it re-anchors on the hop's own pure and
  // runs FIRST, the extractions after it (`if (c) { ({ customI } = _Iterator); g =
  // _Iterator$zip; }`). without this the consumed props were already gone and their
  // extractions were dropped on the floor - the bindings never got written
  if (bodylessAssign.left.properties.length !== 0) {
    if (seqPrefix?.length || mayHaveSideEffects(bodylessAssign.right)) return;
    const view = { id: bodylessAssign.left, init: bodylessAssign.right };
    if (!reanchorSoleCtorHopResidual(view)) return;
    bodylessAssign.left = view.id;
    bodylessAssign.right = view.init;
    statements.unshift(expressionStatement(bodylessAssign));
    if (replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: statements })) markRewrite();
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

function assignmentMemoRef(assignment, jobs, mintRefName) {
  if (jobs.every(job => !job.readsReceiver) || jobs.some(job => job.seqPrefix?.length)) return null;
  const right = peelWrappers(assignment.right);
  if (right?.type === 'Identifier' || right?.type === 'ThisExpression') return null;
  // a kept-binding residual reads the RAW right in place and the overwrite re-spells a
  // constant literal - no shared identity to memoize (the text emitter's shape)
  if (jobs.every(job => job.keepSentinelBinding) && isConstantLiteralReceiver(right)) return null;
  const residualSurvives = assignment.left?.type !== 'ObjectPattern' || assignment.left.properties.length !== 0;
  return jobs.length + (residualSurvives ? 1 : 0) > 1 ? mintRefName() : null;
}

// the STATEMENT a path sits in - the slot a generated declaration plants beside
// a RE-ANCHORED residual is the declarator the discarded init belongs to: the sink's prefix rides
// that declarator's own value instead of a slot of its own (`for (const { customFR: fr } = (<prefix>,
// _Promise); ...)`), which is where the source wrote it. true when it took the prefix
function foldSinkPrefixIntoResidual(extracted, slot) {
  const residual = extracted.length === 1 && extracted[0].id?.type === 'ObjectPattern' ? extracted[0] : null;
  const prefix = residual && slot?.type === 'SequenceExpression' ? slot.expressions.slice(0, -1) : null;
  if (!prefix?.length) return false;
  residual.init = sequenceExpression([...prefix, residual.init]);
  return true;
}

function hostStatementOf(path) {
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

// does anything in this pattern still bind a REAL name, or is every leaf a minted sentinel?
// the whole-consume drop asks it before removing the declarator
function hasRealBinding(root, sentinelNames) {
  const queue = [root];
  while (queue.length) {
    const node = queue.pop();
    if (!node || typeof node !== 'object' || !node.type) continue;
    switch (node.type) {
      case 'Identifier':
        if (!sentinelNames.has(node.name)) return true;
        break;
      case 'ObjectPattern':
        for (const item of node.properties) queue.push(item.type === 'Property' ? item.value : item);
        break;
      case 'ArrayPattern':
        queue.push(...node.elements.filter(Boolean));
        break;
      case 'AssignmentPattern':
        queue.push(node.left);
        break;
      case 'RestElement':
        queue.push(node.argument);
        break;
      default:
    }
  }
  return false;
}

// an SE buried in a consumed array WRAPPER lifts once, ahead of the extraction: the literal
// evaluates whole before the pattern binds, so every prefix keeps its source order there and the
// residual reads the quiet spine (`[(m(), [g])]` -> `m();` + `[[_g]]`). mutates the declarator
function liftArrayWrapperPrefixes(declarator) {
  const lifted = [];
  function strip(node) {
    const core = peelWrappers(node);
    if (core?.type !== 'ArrayExpression') return;
    for (const [index, element] of core.elements.entries()) {
      if (!element) continue;
      let peeled = peelWrappers(element);
      if (peeled?.type === 'SequenceExpression') {
        lifted.push(...peeled.expressions.slice(0, -1));
        peeled = peelWrappers(peeled.expressions.at(-1));
        core.elements[index] = peeled;
      }
      strip(core.elements[index]);
    }
  }
  const initCore = peelWrappers(declarator.init);
  if (initCore?.type === 'SequenceExpression'
    && peelWrappers(initCore.expressions.at(-1))?.type === 'ArrayExpression') {
    lifted.push(...initCore.expressions.slice(0, -1));
    declarator.init = peelWrappers(initCore.expressions.at(-1));
  }
  strip(declarator.init);
  return lifted;
}

function propBindingTarget(prop) {
  if (prop.value.type === 'ObjectPattern') return prop.value;
  // a DEFAULTED pattern value binds through its OWN pattern: the default rides the extraction's
  // guard ternary, so only the left survives as the target
  if (prop.value.type === 'AssignmentPattern' && prop.value.left?.type === 'ObjectPattern') {
    return prop.value.left;
  }
  return identifier(propLocalName(prop));
}

// a prop the port consumes: plain (non-computed identifier / string key), value a bare
// binding Identifier or a defaulted one, not a rest element
// a computed STRING-LITERAL key (`globalThis['self']`) navigates like the dotted spelling
function plainNavHopKey(node) {
  if (!node.computed) return node.property?.name ?? null;
  const key = peelWrappers(node.property);
  return key?.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
}

function buildSynthProp(key, value) {
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(key);
  if (bracket) return objectProperty(identifier(bracket.groups.name), value, { computed: true });
  if (/^[$a-z_][\w$]*$/i.test(key)) return objectProperty(identifier(key), value);
  return objectProperty(literal(key), value);
}

// the extracted declarator's binding slot: a pattern-valued symbol prop moves its whole
// pattern; everything else binds the local name
// the extraction DISCARDS the receiver expression (the init / the assignment RHS): only a
// pure navigation may fall away silently; anything else is the SE-rescue channel - staged.
// the check is ALSO the claim's validity proof: an extraction is polyfill-always-wins only
// over a provable global nav - a conditional / opaque receiver must never extract, rest or
// not (the other branch's miss semantics would be erased)
function isPureNavReceiver(node) {
  node = peelWrappers(node);
  while (node?.type === 'MemberExpression' && !node.optional && plainNavHopKey(node) !== null) {
    node = peelWrappers(node.object);
  }
  return node?.type === 'Identifier' || node?.type === 'ThisExpression';
}

// the for-init variant keeps a side-effecting init alive in the `_unused` dummy, so only
// the SEQUENCE TAIL has to be the provable nav
function isPureNavAfterSePrefix(node) {
  node = peelWrappers(node);
  if (node?.type === 'SequenceExpression') node = node.expressions.at(-1);
  return isPureNavReceiver(node);
}

// the same SOURCE node seen through a rebuild that may have CLONED it: a clone carries the
// span of what it copied, and a minted node has none to answer with
function spellsSameSource(node, source) {
  return node === source
    || (Number.isInteger(source?.start) && node?.start === source.start && node?.end === source.end);
}

// a kept WRITE of a SPELLABLE pure nav rides the value it stored: the read beside it is that
// same value re-spelled, so lifting the write away would leave the read answering nothing.
// every other harvested effect is the source's own and lands as a statement of its own
function keptWriteRidesValue(node, { adapter, injectorState, resolveGlobalPolyfill }) {
  const write = peelWrappers(node);
  return write?.type === 'AssignmentExpression' && write.left?.type === 'Identifier'
    && proxyStoreIsSpellable(write.right, resolveGlobalPolyfill,
      name => isMintedOrProxyName(name, injectorState))
    && (isPureNavReceiver(write.right) || allProxySelectingInit(write.right, { adapter, injectorState }));
}

// the prefix a host lifts ahead of its extraction, and the quiet receiver it leaves behind: a
// source SEQUENCE hands over its tail, a chain ASSIGNMENT the value it stored. a hop ANCHOR in a
// sequence slot takes neither - it has no statement ahead of it, so the write rides the
// re-anchored read where the source wrote it (`({ customX } = (wx = _globalThis, _Map))`)
function planLiftedRhsPrefix(right, { anchorsInSequence }) {
  const peeled = peelWrappers(right);
  if (peeled?.type === 'SequenceExpression' && isPureNavReceiver(peeled.expressions.at(-1))) {
    return { prefix: peeled.expressions.slice(0, -1), receiver: peeled.expressions.at(-1) };
  }
  if (anchorsInSequence || !chainAssignOverPureNav(peeled)) return null;
  return { prefix: [right], receiver: peeled.right };
}

// a chain ASSIGNMENT storing a provable global nav (`(q = globalThis)`): the write is an
// effect of the source's own, and the value it leaves behind is the receiver a claim reads
function chainAssignOverPureNav(node) {
  const assign = peelWrappers(node);
  return assign?.type === 'AssignmentExpression' && assign.operator === '='
    && isPureNavReceiver(assign.right) ? assign : null;
}

// the shared "conditional destructure left untouched" debug-warn, emitted where the per-branch
// mirror DECLINED: whether the polyfill applies then depends on which branch runs. gated on a
// GENUINE candidate through the shared provider predicate, and the gate itself is skipped when
// debug is off - the common build path pays nothing for a diagnostic nobody reads
function warnConditionalFallbackUntouched(meta, metaPath, { getDebugOutput, adapter, resolvePure }) {
  const debug = getDebugOutput?.();
  if (!debug || !fallbackDestructureHasPolyfillableBranch({ meta, path: metaPath, adapter, resolvePure })) return;
  debug.warn?.(conditionalDestructureLeftUntouchedWarning(meta.key));
}

// re-wrap a split statement for an export host; a minted memo stays module-local
function exportWrap(statement, exported) {
  if (!exported) return statement;
  return { type: 'ExportNamedDeclaration', declaration: statement, specifiers: [], source: null, attributes: [] };
}

// a pattern-valued symbol extraction lands ahead of PLAIN sibling extractions (the text
// leg's channel order, locked by its sidecars); a sentinel-bearing sibling shares the
// symbol channel and keeps source order
function orderDeclaratorJobs(jobs) {
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
function hopChainKeys(chain) {
  return chain.toReversed().map(level => level.foldedKey ?? level.hopProp.key.name ?? level.hopProp.key.value);
}

function climbPatternChain(patternPath, keyCtx = null) {
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
        hostParent: up, hostPatternPath, chainLength: chain.length,
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
// the literal spelling of one render-plan entry: the source key node when the prop was
// plain, the resolved plain name when a literal-computed spelling collapsed onto it, the
// computed identifier for a `[k]` slot
function synthEntryKey({ keyNode, dedupKey, slotKey, lookupKey, computedKey = false }, { resolvedSpelling = false } = {}) {
  // the nested mirror spells the RESOLVED name (`{ Array: { from: _X } }`); the flat
  // literal keeps the source spelling (`['from']: _X` / `[k]: _X`), both the babel shapes
  if (resolvedSpelling) return { key: identifier(lookupKey), computed: false };
  if (keyNode) {
    // a NUMERIC source key respells as its string form in the synth literal (`0:` ->
    // `"0":`, the passthrough reading `Object["0"]`) - the babel spelling
    if (keyNode.type === 'Literal' && typeof keyNode.value === 'number') {
      return { key: literal(String(keyNode.value)), computed: computedKey };
    }
    return { key: cloneNode(keyNode), computed: computedKey };
  }
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(slotKey);
  if (slotKey === dedupKey && bracket) return { key: identifier(bracket.groups.name), computed: true };
  // a FOLDED computed key (an SE prefix, a literal spelling) lands as its string literal,
  // and its passthrough reads back computed with the same literal - the babel spelling
  return { key: literal(lookupKey), computed: false };
}

// the pattern's synth render plan, computed once per pending: one entry per distinct
// SLOT (duplicate spellings of one static name collapse - `{ of, ['of']: x }` reads one
// property), with the first occurrence's spelling and the lookup name for passthrough
function buildPatternRenderPlan(patternNode, { scope, path, adapter }) {
  const keys = [];
  const seen = new Set();
  for (const prop of patternNode.properties) {
    if (prop.type !== 'Property') return null;
    const { lookupKey: resolvedKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
    // a BOUND-identifier computed key (`[X]`) never folds, but the literal replays it
    // verbatim and the passthrough reads computed (`[X]: Array[X]`) - the bracket slot
    // is its own lookup marker
    const lookupKey = resolvedKey ?? (slotKey && /^\[[$a-z_][\w$]*\]$/i.test(slotKey) ? slotKey : null);
    if (!lookupKey || !slotKey) return null;
    const dedupKey = synthSlotName(prop) ?? slotKey;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    // an SE-free computed key keeps its SOURCE spelling in the literal (`['from']: _X`);
    // an SE-bearing one folds to the resolved string (the effect cannot re-run)
    const sourceKey = prop.computed && computedKeyHasSideEffects(prop) ? null : prop.key;
    keys.push({
      dedupKey, lookupKey, keyNode: sourceKey, slotKey,
      computedKey: prop.computed && !!sourceKey,
    });
  }
  return keys;
}

// the literal-route receiver resolution shared state: the strict walk first, the SE-free
// single-read relaxation second - direct when the residual dies with the extraction, else
// through the `_ref` memo (the memo is the single source read - getter fires once)
// the residual is DEAD when this extraction takes every binding of a single-declarator
// declaration - the shared plan's `soleBindingInDeclaration`
function planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav }) {
  const soleBinding = declaration.declarations.length === 1
    && patternBindingCount(declarator.id) === patternBindingCount(prop.value);
  let literalReceiver = null;
  let relaxedReceiver = false;
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
    }
  }
  return { soleBinding, literalReceiver, relaxedReceiver };
}

// the SE-keyed DEFAULTED instance prop's overwrite: the destructure stays whole (the key
// runs where the source runs it) and the ponyfill re-binds after. the overwrite re-reads
// the receiver, so it must be safe to spell twice; the binding must be a plain name
function registerSeKeyDefaultOverwrite({ prop, chain, entry, hintName, hostParent },
  { injectPureImport, markRewrite, recordJob, injector }) {
  const overwriteId = prop.value.left?.type === 'Identifier' ? prop.value.left : null;
  const receiver = peelWrappers(hostParent.node.right);
  let overwriteStmtPath = hostParent.parentPath;
  while (overwriteStmtPath && (overwriteStmtPath.node?.type === 'ParenthesizedExpression'
    || TS_EXPR_WRAPPERS.has(overwriteStmtPath.node?.type))) {
    overwriteStmtPath = overwriteStmtPath.parentPath;
  }
  if (!overwriteId || chain.length || overwriteStmtPath?.node?.type !== 'ExpressionStatement'
    || !isReReferenceableReceiver(receiver)) return;
  const id = injectPureImport(entry, hintName);
  markRewrite();
  recordJob({ hostPath: overwriteStmtPath,
    job: { host: 'assign-overwrite', local: overwriteId.name,
      bodyless: !statementListOf(overwriteStmtPath.parentPath?.node),
      value: () => callExpression(identifier(id), [duplicateReceiver(receiver, injector)]) } });
}

// a value-SELECTING init under a sentinel-kept prop: a LOGICAL over KNOWN library surfaces
// keeps extracting - whichever branch selects, the slot answers the polyfill - and so does
// one whose LEFT statically selects (the right is dead text). one carrying a USER operand
// (`sel || globalThis`) declines whole, like the text emitter: the extraction would answer
// the ponyfill on the user branch too. the ternary mirror owns its own shapes
function divergingSentinelSelectorDeclines({ declarator, meta, metaPath, chain, kind },
  { adapter, injectorState, resolveGlobalPolyfill }) {
  const selectingInit = peelWrappers(declarator.init);
  function knownSurfaceOperand(node) {
    let operand = peelWrappers(node);
    if (operand?.type === 'SequenceExpression') operand = peelWrappers(operand.expressions.at(-1));
    if (operand?.type === 'LogicalExpression') {
      return knownSurfaceOperand(operand.left) && knownSurfaceOperand(operand.right);
    }
    if (operand?.type === 'Identifier') {
      return proxySurfaceIdentifier(operand, { adapter, injectorState })
        || (!adapter.getBinding(metaPath.scope, operand.name, metaPath) && !!resolveGlobalPolyfill(operand.name));
    }
    return !!findProxyGlobal(operand, { scope: metaPath.scope, adapter, path: metaPath });
  }
  return (selectingInit?.type === 'ConditionalExpression'
    || (selectingInit?.type === 'LogicalExpression'
      && !staticallySelectedLeft({ selecting: selectingInit, meta, metaPath, soleBinding: false, chain, adapter, kind })
      && !knownSurfaceOperand(selectingInit)))
    && !allProxySelectingInit(declarator.init, { adapter, injectorState });
}

// the assignment-form twin of the declarator-host alias registrations: the ctor hint /
// fold source is what lets a later read resolve through the extracted alias
function registerAssignmentExtractAlias({ prop, kind, entry, hintName, hostParent, exprStmtPath, metaPath },
  { adapter, injectorState }) {
  if (prop.value.type !== 'Identifier') return;
  const localName = propLocalName(prop);
  if (kind === 'global' && hintName) {
    const aliasBinding = adapter.getBinding(metaPath.scope, localName, metaPath);
    if (!aliasBinding?.node) {
      registerBindinglessCtorAlias({ injector: injectorState, adapter, localName, hint: hintName });
    } else {
      maybeRegisterAssignmentAliasWrite({
        injector: injectorState, adapter, binding: aliasBinding, localName, hint: hintName,
        assignNode: hostParent.node, stmtPath: exprStmtPath,
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
function duplicateReceiver(node, injector) {
  const clone = cloneNode(node);
  injector.recloneDeclaredRefs?.(clone);
  return clone;
}

// a nav whose live `?.` sits over an ERASABLE hop renders as the guard the collapse would
// spell: the hop's object is the probe, the hop's own ponyfill the alternate, and the tail
// above it hangs back on. null where no such hop carries the short-circuit
function guardedNavPassthrough(receiver, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport }) {
  const tail = [];
  let cur = peelWrappers(receiver);
  while (cur?.type === 'MemberExpression' && !cur.optional) {
    if (cur.computed || cur.property?.type !== 'Identifier') return null;
    tail.unshift(cur.property.name);
    cur = peelWrappers(cur.object);
  }
  if (cur?.type !== 'MemberExpression') return null;
  // a COMPUTED leaf key folds to its literal spelling, and the effects it carries ride the
  // ALTERNATE - where native runs them, past the short-circuit and before the read
  // (`(g.window?.[(c++, 'self')])` -> `null == _g.window ? void 0 : (c++, _self)`)
  const keyEffects = [];
  let hopName = cur.computed ? null : cur.property?.type === 'Identifier' ? cur.property.name : null;
  if (cur.computed) {
    let key = peelWrappers(cur.property);
    if (key?.type === 'SequenceExpression') {
      keyEffects.push(...key.expressions.slice(0, -1));
      key = peelWrappers(key.expressions.at(-1));
    }
    hopName = key?.type === 'Literal' && typeof key.value === 'string' ? key.value : null;
  }
  const hopPure = hopName ? resolveGlobalPolyfill(hopName) : null;
  if (!hopPure) return null;
  const probe = cloneNode(cur.object);
  substituteProxyRootsInClone(probe, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
  const navTail = tail.reduce((base, hop) => memberFromKeyName(base, hop),
    identifier(injectPureImport(hopPure.entry, hopPure.hintName)));
  const alternate = keyEffects.length
    ? sequenceExpression([...keyEffects.map(expr => cloneNode(expr)), navTail]) : navTail;
  return conditionalExpression(binaryExpression('==', literal(null), probe), voidZero(), alternate);
}

// the effects a sealed nav's LEAF hop key carries (`?.[(c++, 'self')]`): native runs them past
// the short-circuit and before the read, which is inside the guard's alternate
function sealedLeafKeyEffects(nav) {
  const leaf = peelWrappers(nav);
  if (leaf?.type !== 'MemberExpression' || !leaf.computed) return [];
  const key = peelWrappers(leaf.property);
  return key?.type === 'SequenceExpression' ? key.expressions.slice(0, -1) : [];
}

// the sealed receiver READ a swap erases, PLANNED on the pristine tree: the seal's inner nav
// renders the guard the collapse spells (its `?.` object the probe, its own ponyfill the
// alternate, the hop's key effects riding inside it) and the boundary member hangs back on.
// planned, not rendered, because the drain sees a tree the walk has already collapsed - there
// the inner nav no longer answers the undefinability question the probe exists for
function planSealedNavProbe(receiver, metaPath, ctx) {
  if (!metaPath || !receiver) return null;
  // a FALLBACK operand changes what the pattern binds, never whether the LEFT read ran: the
  // seal's own throw is the source's either way (`(g.window?.self).Object || {}`)
  const read = peelWrappers(receiver)?.type === 'LogicalExpression'
    ? peelWrappers(receiver).left : receiver;
  const boundary = sealedChainBoundary(read);
  if (!boundary) return null;
  const key = memberKeyName(boundary.member);
  if (key === null) return null;
  const aliasCtx = { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath };
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
  // guard proved (`(globalThis.window?.self.window)` -> `_self.window`), where a bare spelling
  // would be a ReferenceError on an engine without it
  const leafBase = leafPlan.leafPure ? null : peelNavWrappers(boundary.inner)?.object;
  // the effect nodes this plan will RE-EMIT stay claim-live: a claim inside the kept key
  // (`log.push('k')`) fires later in the walk and must land on the (soon detached) original,
  // which the render-time harvest off `effectsHost` then picks up rewritten
  for (const expr of sealedLeafKeyEffects(boundary.inner)) ctx.keepLive?.add(expr);
  return {
    boundary, key, leafPlan,
    basePure: leafBase && proxyGlobalMemberCtorPure({ receiver: leafBase, aliasCtx, resolvePure: resolveHere }),
    guardObject: cloneNode(leafPlan.guardObject),
    effectsHost: boundary.inner,
  };
}

function renderSealedNavProbe(plan, metaPath, ctx) {
  if (!plan) return null;
  const { boundary, key } = plan;
  let navRead;
  if (plan.passthrough) navRead = guardedNavPassthrough(boundary.inner, metaPath, ctx);
  else {
    const probe = cloneNode(plan.guardObject);
    substituteProxyRootsInClone(probe, metaPath, ctx);
    let leaf = plan.leafPlan.leafPure
      ? identifier(ctx.injectPureImport(plan.leafPlan.leafPure.entry, plan.leafPlan.leafPure.hintName))
      : plan.basePure
        ? memberExpression(identifier(ctx.injectPureImport(plan.basePure.entry, plan.basePure.hintName)),
          identifier(plan.leafPlan.leafName))
        : identifier(plan.leafPlan.leafName);
    const liveEffects = sealedLeafKeyEffects(plan.effectsHost).map(expr => cloneNode(expr));
    if (liveEffects.length) leaf = sequenceExpression([...liveEffects, leaf]);
    navRead = conditionalExpression(binaryExpression('==', literal(null), probe), voidZero(), leaf);
  }
  if (!navRead) return null;
  return boundary.member.computed
    ? memberExpression(navRead, literal(key), { computed: true })
    : memberFromKeyName(navRead, key);
}

function sealedNavProbeRead(receiver, metaPath, ctx) {
  return renderSealedNavProbe(planSealedNavProbe(receiver, metaPath, ctx), metaPath, ctx);
}

// the SHAPE of the read a fully-consumed pattern discards, planned on the PRISTINE tree: by
// drain time the walk has collapsed the nav, and the guard render spells its own leaf. null
// where the value cannot be undefined - there is nothing for the read to throw on
function planDiscardedInitProbe(initNode, metaPath, ctx) {
  // an ARRAY-wrapped pattern reads its ELEMENT, and that read is the one native performs;
  // the chain wrapper an inner `?.` wears is transparent to the plan
  const peeled = peelNavWrappers(initNode);
  let nav = peeled?.type === 'ArrayExpression' && peeled.elements.length === 1
    ? peelNavWrappers(peeled.elements[0]) : peeled;
  // an AGREEING ternary reads its arm whichever way the test goes - that read is the one the
  // consume discards, and the dead test drops with the selection
  if (nav?.type === 'ConditionalExpression') nav = agreeingTernaryArm(nav, metaPath, ctx.adapter) ?? nav;
  if (!nav) return null;
  // `probeLeaf`: a full consume of the PROBE ITSELF has no hop to read off the guard - the test
  // operand doubles as the alternate (`{ Array: { of } } = globalThis.window`)
  return sealedClaimLeafGuardPlan(nav, m => ctx.resolvePure(m, metaPath),
    { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath }, { probeLeaf: true });
}

// ... and its emission: the planned guard, the slot key hanging back on
function renderDiscardedInitProbe(jobs, ctx) {
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
  const aliasCtx = { scope: metaPath.scope, adapter: ctx.adapter, path: metaPath };
  // a HOP chain reads its OUTERMOST key off the init - that is the read native performs
  // (`{ Math: { cbrt } } = (guard)` probes `(guard).Math`)
  const keyProp = job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
  const { lookupKey } = resolveSynthKeys({ node: keyProp, ...aliasCtx });
  if (typeof lookupKey !== 'string') return null;
  const probe = cloneNode(plan.guardObject);
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
  const guarded = conditionalExpression(binaryExpression('==', literal(null), probe), voidZero(), leaf);
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
function liftAssignInitPrefix(host, metaPath, program) {
  const init = peelWrappers(host.right);
  if (init?.type !== 'SequenceExpression' || !metaPath) return;
  let stmtPath = metaPath;
  while (stmtPath?.node && stmtPath.node.type !== 'ExpressionStatement') stmtPath = stmtPath.parentPath;
  const stmtNode = stmtPath?.node;
  if (!stmtNode || peelWrappers(stmtNode.expression) !== host) return;
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
function anchorLeadingStatement(statements, hostNode) {
  const [first] = statements;
  if (first && Number.isInteger(hostNode?.start) && !Number.isInteger(first.start)) {
    first.start = hostNode.start;
    first.end = hostNode.start;
  }
  return statements;
}

// a cloned subtree the traversal will never revisit: every FREE pristine proxy global in
// it substitutes its pure binding, the shape the walk would have produced in place
function substituteProxyRootsInClone(root, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport }) {
  function proxyRootSwap(node) {
    if (!POSSIBLE_GLOBAL_OBJECTS.has(node.name) || !isPristineProxyGlobal(adapter, node.name)) return null;
    if (adapter.getBinding(metaPath.scope, node.name, metaPath)?.node) return null;
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

function isMintedOrProxyName(name, injectorState) {
  return POSSIBLE_GLOBAL_OBJECTS.has(name) || mintedProxyGlobalName(name, injectorState) !== null;
}

// does this nav spine bottom out on a CALL? that read belongs to the source, so a full
// consume owes it a throw probe - a plain proxy nav from a bare root owes nothing
function navSpineHasCall(node) {
  for (let cur = peelWrappers(node); cur;) {
    if (cur.type === 'CallExpression') return true;
    if (cur.type === 'MemberExpression') {
      cur = peelWrappers(cur.object);
      continue;
    }
    return false;
  }
  return false;
}

function reanchoredInit(declarator, info, replacement) {
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
function withoutCtorHopJobsWithLiveSiblings(jobs) {
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
function keptSymbolSentinelResidual(declarator, declJobs, refName, mintUnusedName) {
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
function drainSequenceAssignment({ hostNode, jobs }, { program, drainAssignment, markRewrite, seqDrainedSlots }) {
  const slot = statementListSlot(program, jobs[0].seqHostStatement);
  if (!slot) return;
  const hostStmt = expressionStatement(hostNode),
        body = [hostStmt];
  drainAssignment({ hostNode: hostStmt, body, at: 0, jobs, inSequence: true });
  const hoisted = [],
        exprs = [];
  for (const stmt of body) {
    if (stmt.type === 'ExpressionStatement') {
      exprs.push(stmt.expression);
      continue;
    }
    // a generated memo / sentinel declaration has no slot inside an expression: the binding
    // hoists as a bare `var` and its value, where it had one, writes in place
    if (stmt.type !== 'VariableDeclaration' || stmt.declarations.some(item => item.id?.type !== 'Identifier')) return;
    for (const item of stmt.declarations) {
      if (item.init) exprs.push(assignmentExpression('=', identifier(item.id.name), item.init));
    }
    hoisted.push(variableDeclaration('var',
      stmt.declarations.map(item => variableDeclarator(identifier(item.id.name)))));
  }
  // a QUIET prefix element the source wrote to shape a call (`(0, globalThis)`) has no reader
  // left once the receiver re-anchors: it drops with the spelling it guarded
  const live = exprs.filter((expr, index) => index === exprs.length - 1 || mayHaveSideEffects(expr));
  if (!live.length) return;
  const folded = live.length === 1 ? live[0] : sequenceExpression(live);
  if (live.length > 1) seqDrainedSlots.add(folded);
  replaceNodeInTree(program, hostNode, folded);
  if (hoisted.length) slot.body.splice(slot.at, 0, ...hoisted);
  markRewrite();
}

// every SEQUENCE-element assignment in the ledger, drained before the hosts whose inits hold
// them: that drain lifts the sequence prefix into statements of its own and the slot they fold
// back into stops existing
function drainSequenceAssignments(ledger, ctx) {
  for (const entry of ledger.values()) {
    const seqJobs = entry.jobs.filter(job => job.host === 'assign-seq');
    if (!seqJobs.length) continue;
    entry.jobs = entry.jobs.filter(job => job.host !== 'assign-seq');
    drainSequenceAssignment({ hostNode: entry.hostPath.node, jobs: seqJobs }, ctx);
  }
}

// will this pattern still hold a binding once the ledger's jobs take theirs? the cascade removes a
// hop prop only when its nested pattern empties, so the question is whether any leaf survives
function residualSurvivesAfterJobs(patternNode, consumedProps) {
  if (patternNode?.type !== 'ObjectPattern') return true;
  return patternNode.properties.some(prop => {
    if (prop.type !== 'Property') return !consumedProps.has(prop);
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    // a consumed prop holding a NESTED pattern drops only once that pattern empties, so its
    // other leaves still keep the residual alive
    if (value?.type === 'ObjectPattern') return residualSurvivesAfterJobs(value, consumedProps);
    return !consumedProps.has(prop);
  });
}

// a slice an anchored residual REPLAYS is re-emitted verbatim, so its own hop host may not fold
// there (`{ Promise: { customFR: fr } } = (({ self: { onoffline } } = globalThis), globalThis)`
// keeps the buried `self:`); a slice a FULL consume LIFTS becomes an ordinary statement and folds
function replayedPrefixHopHosts(ledger, hopHosts) {
  const replayed = new Set();
  if (!hopHosts.size) return replayed;
  for (const [, { jobs }] of ledger) {
    const consumed = new Set(jobs.map(job => job.prop));
    for (const job of jobs) {
      const init = job.declarator?.init && peelWrappers(job.declarator.init);
      if (init?.type !== 'SequenceExpression'
        || !residualSurvivesAfterJobs(job.declarator.id, consumed)) continue;
      for (const expr of init.expressions.slice(0, -1)) {
        for (const host of hopHosts.keys()) if (nodeHoldsSubtree(expr, host)) replayed.add(host);
      }
    }
  }
  return replayed;
}

// the nodes an extraction already OWNS: a hop-host note for one of them would apply its anchor
// a second time, on top of the drain's own. `hostSiblings` are the declarators sharing a
// declaration with one - the residual split replaces that declaration node, and the ledger
// drains by its identity, so splitting early would strand the sibling's own claim
function jobOwnedNodes(ledger) {
  const owned = new Set(),
        hostSiblings = new Set();
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
      : hostNode?.type === 'ExpressionStatement' ? peelWrappers(hostNode.expression) : null;
    if (assignExpr?.type === 'AssignmentExpression') owned.add(assignExpr);
  }
  return { owned, hostSiblings };
}

// the pure BINDING a rendered guard hands back on its live branch (`null == x ? void 0 : _self`),
// re-readable wherever the guarded value was - null when the branch is anything else
function guardedPureBinding(initNode, injectorState) {
  const init = peelWrappers(initNode);
  if (init?.type !== 'ConditionalExpression' || init.consequent?.type !== 'UnaryExpression'
    || init.consequent.operator !== 'void') return null;
  const live = peelWrappers(init.alternate);
  return live?.type === 'Identifier' && isMintedOrProxyName(live.name, injectorState) ? live.name : null;
}

function memoJobBindingTarget(job) {
  if (job.collapseLeafName ?? job.collapseLeaf?.localName) {
    return identifier(job.collapseLeafName ?? job.collapseLeaf.localName);
  }
  return propBindingTarget(job.prop);
}

function planSentinelMemo({ sentinel, declarator, metaPath, adapter, kind, allProxyInit }) {
  // the init is asked through its parens - and through the chain wrapper an optional call
  // wears: an SE-bearing SEQUENCE reads once into the memo and the residual reads the ref, so
  // the prefix does not re-run (`var _ref = (se(), arr), { [(k(), 'at')]: _unused } = _ref,
  // at = _at(_ref);`)
  const init = peelNavWrappers(declarator.init);
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

function synthPropDedupKey(prop, { scope, path, adapter }) {
  const { lookupKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
  if (!slotKey || (!lookupKey && !/^\[[$a-z_][\w$]*\]$/i.test(slotKey))) return null;
  return synthSlotName(prop) ?? slotKey;
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
      objectNode: peelWrappers(peelReceiverSequenceTail(peelWrappers(arm))), scope: metaPath.scope, adapter, path: metaPath,
    });
  }
  const name = armName(selecting.consequent);
  return name && name === armName(selecting.alternate) ? peelWrappers(selecting.consequent) : null;
}

function staticallySelectedLeft({ selecting, meta, metaPath, soleBinding, chain, adapter, kind }) {
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
  const left = peelWrappers(selecting.left);
  const leftName = resolveObjectName({
    objectNode: peelWrappers(peelReceiverSequenceTail(left)), scope: metaPath.scope, adapter, path: metaPath,
  });
  return leftName === meta.object ? left : null;
}

function isPlainConsumableProp(prop, { symbolProp = false, ctorPattern = false } = {}) {
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
  return prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier';
}

// only a REST sibling blocks: it reads "everything the pattern did not consume", so a
// removed prop changes what it collects (babel renames to `_unused` sentinels - staged).
// computed / defaulted siblings keep their own routing and survive in the residual
function hasRestSibling(pattern) {
  return hasRestSiblingExcept(pattern.properties, null);
}

// the pristine proxy surface an operand names, or null. a branch the walker already
// substituted (`_globalThis`) is the same surface - the minted import's hint says which
// global it holds
function proxySurfaceIdentifier(node, { adapter, injectorState }) {
  const inner = peelWrappers(node);
  if (inner?.type !== 'Identifier') return null;
  return isPristineProxyGlobal(adapter, inner.name)
    || POSSIBLE_GLOBAL_OBJECTS.has(injectorState?.getPureImport?.(inner.name)?.hint) ? inner : null;
}

// a selecting init whose EVERY LIVE branch lands on the same pristine proxy surface
// (`c ? globalThis : self`): the claim extracts like a plain proxy receiver and the
// discarded init drops whole - no branch diverges, nothing observable dies with it
function allProxySelectingInit(node, { adapter, injectorState }) {
  const stack = [{ node, branch: false }];
  while (stack.length) {
    const { node: raw, branch } = stack.pop();
    const inner = peelWrappers(raw);
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
      while (value?.type === 'AssignmentExpression' && value.operator === '=') value = peelWrappers(value.right);
    }
    if (!proxySurfaceIdentifier(value, { adapter, injectorState })) return false;
  }
  return true;
}

// a DECLINED mirror's leaf defaults still take the sound polyfill (the slot fires only where
// the destructured value reads undefined, whatever the receiver held)
function swapInlineDefaults({ leafPattern, ctorName, metaPath, insertOnUndefaulted = false },
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
function applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped }) {
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
function literalContainerRescue(declarator, declJobsHere, adapter) {
  const init = peelWrappers(declarator.init);
  if (init?.type !== 'ArrayExpression' && init?.type !== 'ObjectExpression') return [];
  if (declJobsHere.some(job => job.seLifted || job.readsReceiver)) return [];
  const metaPath = declJobsHere[0]?.metaPath;
  if (!metaPath) return [];
  return discardRescueNodes({ node: declarator.init, scope: metaPath.scope, adapter, path: metaPath });
}

// the residual an extraction LEFT BEHIND re-anchors on the hop's own pure exactly as the
// declaration drain does (`({ Iterator: { customI } } = _globalThis)` -> `({ customI } =
// _Iterator)`); the assignment holds the same shape under different field names. a SENTINEL
// residual has its own anchor upstream and never asks twice
function anchorAssignmentResidual(assignment, jobs, reanchor) {
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
function residualPrecedesExtractions(declarator, declJobs, sourceProps, { sharedHop = false } = {}) {
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
function takesInlineDefault({ host, prop, pattern, chain, kind, sentinel, adapter, injectorState }) {
  if (kind === 'instance') return false;
  const init = peelWrappers(host.declarator?.init);
  if (chain.length > 0 && prop.value?.type !== 'ObjectPattern') {
    return (init?.type === 'AssignmentExpression'
        || !isSynthSimpleObjectPattern(pattern,
          { allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true }))
      && andSelectedProxyInit(init, { adapter, injectorState })
      || selectionHoldsChainWrites(init, { adapter, injectorState });
  }
  return chain.length === 0 && sentinel && prop.value?.type === 'Identifier'
    && prop.computed && computedKeyHasSideEffects(prop) && init?.operator === '&&';
}

// an ALL-PROXY selection whose branches are chain ASSIGNMENTS: the writes must survive the
// destructure, so nothing may extract off it - the leaf takes the sound inline default instead
function selectionHoldsChainWrites(node, ctx) {
  const inner = peelWrappers(node);
  if (inner?.type !== 'ConditionalExpression' && inner?.type !== 'LogicalExpression') return false;
  if (!allProxySelectingInit(inner, ctx)) return false;
  const stack = [inner];
  while (stack.length) {
    const branch = peelWrappers(stack.pop());
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
  let inner = peelWrappers(node);
  while (inner?.type === 'AssignmentExpression' && inner.operator === '=') inner = peelWrappers(inner.right);
  return inner?.type === 'LogicalExpression' && inner.operator === '&&'
    && !!proxySurfaceIdentifier(inner.right, { adapter, injectorState });
}

// the surface an all-proxy selecting init reads - its first branch's pristine root
function firstProxyBranch(node) {
  let inner = peelWrappers(node);
  while (inner?.type === 'ConditionalExpression' || inner?.type === 'LogicalExpression') {
    inner = peelWrappers(inner.type === 'ConditionalExpression' ? inner.consequent : inner.left);
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
function discardedSinkSlot(init, { metaPath, sinkDrop, sinkPlan, planMemoArg, adapter }) {
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
function registerInstanceSynthSlot({ metaPath, pattern, hostParent, entry, hintName, receiver, synthLedger, ctx }) {
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
    let cur = path;
    while (cur?.node && (cur.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(cur.node.type))) {
      cur = cur.get('expression');
    }
    return cur;
  }
  let callPath = null;
  for (let cur = hostParent, up = cur.parentPath; up?.node; cur = up, up = cur.parentPath) {
    if (up.node.type === 'CallExpression') {
      if (up.node.callee === cur.node) callPath = up;
      break;
    }
    if (!(up.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(up.node.type)
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
function patternHasPolyfillableDefault(node) {
  while (node?.type === 'RestElement' || node?.type === 'SpreadElement') node = node.argument;
  switch (node?.type) {
    case 'AssignmentPattern': {
      const value = peelWrappers(node.right);
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
function seLiftedHopNav({ forInit, chain, declarator, prop }) {
  const init = peelWrappers(declarator.init);
  return !forInit && chain.length > 0 && init?.type === 'SequenceExpression'
    && patternBindingCount(declarator.id) === patternBindingCount(prop.value)
    && init.expressions.slice(0, -1).every(expr => peelWrappers(expr)?.type !== 'AssignmentExpression')
    && isPureNavAfterSePrefix(init);
}

// the statements an SE-LIFTED nav owes ahead of its extraction
function liftedSePrefixStatements(declarator, declJobs) {
  if (declJobs.every(job => !job.seLifted)) return [];
  return peelWrappers(declarator.init).expressions.slice(0, -1).map(expr => expressionStatement(expr));
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
function proxyNavSynthBase(receiver, { scope, adapter, path }) {
  if (receiver?.type !== 'MemberExpression' && receiver?.type !== 'SequenceExpression') return null;
  let keys = [];
  let cur = receiver;
  let seqPrefix = null;
  for (;;) {
    if (cur?.type === 'MemberExpression' && !cur.computed) {
      keys.unshift(cur.property?.name);
      cur = peelNavWrappers(cur.object);
      continue;
    }
    if (cur?.type === 'SequenceExpression'
      && !(seqPrefix && cur.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr)))) {
      seqPrefix ??= cur;
      cur = peelNavWrappers(cur.expressions.at(-1));
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

function insideParamPosition(metaPath) {
  for (let cur = metaPath; cur; cur = cur.parentPath) {
    if (cur.listKey === 'params' || cur.key === 'params') return true;
    if (cur.node?.type === 'VariableDeclarator' || cur.node?.type === 'ExpressionStatement') return false;
  }
  return false;
}

function isReusableSynthReceiver(node) {
  return !!node && !reEvaluationObservable(node);
}

// does a discarded receiver DROP instead of sinking verbatim? asked on the PRISTINE tree - by
// drain time the collapse has reshaped the spine into a sequence and the shape is gone. the
// canonical decision needs a confirmed rescue node, so the harvest is asked first
function sinkDropsReceiver(init, metaPath, adapter) {
  const inner = peelWrappers(init);
  return discardRescueNodes({ node: inner, scope: metaPath.scope, adapter, path: metaPath }).length > 0
    && shouldDropRescueReceiver(inner);
}

// a DIVERGING selection in a wrapped slot is the per-branch MIRROR's shape: an extraction
// off it would answer the ponyfill on the USER branch too
function divergingSelection(node, ctx) {
  const inner = peelWrappers(node);
  return (inner?.type === 'ConditionalExpression' || inner?.type === 'LogicalExpression')
    && !allProxySelectingInit(inner, ctx);
}

// a SPREAD makes every position PAST it a POSSIBLE one, never a certain one - the slot may
// hold any of the spread's own items, and a substituted binding would compute the wrong
// value. a slot strictly BEFORE it still pairs exactly
function spreadShiftsIndex(elements, index) {
  const spreadAt = elements.findIndex(item => item?.type === 'SpreadElement');
  return spreadAt !== -1 && index >= spreadAt;
}

// the for-init memo verdict, per declarator. a SENTINEL residual re-reads the receiver:
// anything but a bare identifier / `this` memoizes first (`_ref = getArr(), findIndex =
// _f(_ref), { ..._unused } = _ref`) - but only where the extraction READS it too: a
// receiverless static leaves the residual as the only reader, and that read happens in
// place (the block-hosted rule). SEVERAL plain dispatches - or one beside a SURVIVING
// residual - must read ONE evaluation of the init the same way: the memo is a sibling
// declarator and every reader spells the ref (babel's head shape)
function forInitMemoVerdicts(byDeclarator, mintRefName) {
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
function drainBodylessWrapKinds({ kind, kindJobs, hostNode, declNode }, { program, drainArrayDeclaration }) {
  if ((kind === 'assign-overwrite' || kind === 'array-assign') && kindJobs[0]?.bodyless) {
    replaceNodeInTree(program, hostNode, { type: 'BlockStatement', body: [hostNode,
      ...kindJobs.map(job => expressionStatement(
        assignmentExpression('=', identifier(job.local), job.value())))] });
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
function collectArrayDeclExtractions({ hostNode, jobs, sentinelNames, byDeclarator, extracted },
  { probeRenderCtx, mintUnusedName, removeConsumedProps, markSubtreeSkipped, skippedNodes }) {
  for (const job of jobs) {
  // the wrapper element a pattern consumed WHOLE is still READ by native: the extraction
  // leads with that read, the same probe the plain declaration owes one level up
    const probeLead = extracted.length === 0 ? renderDiscardedInitProbe([job], probeRenderCtx) : null,
          extractValue = probeLead ? sequenceExpression([probeLead, job.value()]) : job.value(),
          extractDecl = variableDeclaration(hostNode.kind, [variableDeclarator(job.bindingTarget, extractValue)]);
    extracted.push(exportWrap(extractDecl, job.exported));
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
    const topPattern = job.chain?.length ? job.chain.at(-1).outerPattern : job.pattern,
          topConsumed = job.chain?.length ? job.chain.at(-1).hopProp : job.prop;
    if (!hasRestSibling(job.pattern) && !job.chain?.some(level => level.outerRest)
    && topPattern?.type === 'ObjectPattern' && topPattern.properties.some(item => item !== topConsumed)) {
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
function retargetSoleHopRestSentinels(jobs, { markSubtreeSkipped, skippedNodes }) {
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
function emitDeclaratorMemo({ refName, declarator, statements, declJobs, kind }) {
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
function splitMultiDeclaratorHost({ program, declarator, markRewrite }) {
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
function patternDead(node) {
  if (!node) return true;
  if (node.type === 'ArrayPattern') return node.elements.every(element => patternDead(element));
  if (node.type === 'ObjectPattern') return node.properties.length === 0;
  return false;
}

// the discarded ARRAY WRAPPER of a for-init sink: its own prefixes and those of the element it
// held run in SOURCE order, and the element's quiet tail is the value that survives
// (`(eff('outer'), [(eff('inner'), globalThis)])` -> `(eff('outer'), eff('inner'), _globalThis)`).
// a multi-element wrapper keeps its shape - the siblings still evaluate
function flattenArrayWrapInit(node) {
  const effects = [];
  let cur = peelWrappers(node);
  for (;;) {
    if (cur?.type === 'SequenceExpression') {
      effects.push(...cur.expressions.slice(0, -1));
      cur = peelWrappers(cur.expressions.at(-1));
      continue;
    }
    if (cur?.type === 'ArrayExpression' && cur.elements.length === 1 && cur.elements[0]) {
      cur = peelWrappers(cur.elements[0]);
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
function declinedWrapperTakesDefault(args, ctx) {
  if (ctx.registerForInitWrapJob(args)) return true;
  if (args.chain.length && ctx.nestedSynth?.()) return true;
  const { kind, entry, hintName, prop, chain, hostPatternPath } = args;
  if (!chain.length || kind === 'instance' || prop.value.type !== 'Identifier'
    || !arrayWrapperInDeclarator(hostPatternPath)) return false;
  applyInlineDefault({ prop, entry, hintName, ...ctx });
  return true;
}

// does the (post-rename) pattern still spell a computed key with an effect?
function patternKeepsEffectfulKey(patternNode) {
  let kept = false;
  walkAstNodes({
    root: patternNode,
    visit(item) {
      if (item?.type === 'Property' && item.computed && computedKeyHasSideEffects(item)) kept = true;
    },
  });
  return kept;
}

// the bodyless MULTI-declarator slot whose jobs need a memo: the statement becomes a block, each
// declarator its own statement, and the jobbed one keeps the residual-then-extraction join a
// lifted memo asks for (`if (c) { var { keys } = _g.Array; const _ref = arr; var { ..._unused } =
// _ref, a = _at(_ref); }`)
function drainBodylessMultiMemo({ hostNode, declaration, jobs },
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
      for (const expr of seqPrefix) statements.push(expressionStatement(expr));
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
function synthPlanFullyCovered(plan, receiver, metaPath, { adapter, resolvePure }) {
  // a FALLBACK operand changes nothing about which keys the LEFT can answer - the literal is
  // built over that left, exactly as every other route peels it
  const named = peelWrappers(receiver)?.type === 'LogicalExpression'
    ? peelWrappers(receiver).left : receiver;
  const objectName = named
    ? resolveObjectName({ objectNode: named, scope: metaPath.scope, adapter, path: metaPath }) : null;
  if (!objectName) return false;
  return plan.every(entry => typeof entry.lookupKey === 'string' && resolvePure({
    kind: 'property', object: objectName, key: entry.lookupKey, placement: 'static',
  }, metaPath)?.kind === 'static');
}

// does this array-wrapped pattern hang off a DECLARATOR? a param slot has its own synth route
// (its caller supplies the value), and the inline default would preempt it
// does `root` hold `target` anywhere in its subtree? node identity, so a foreign binding's
// declaration never answers yes for a host's own init
function nodeHoldsSubtree(root, target) {
  let found = false;
  walkAstNodes({
    root,
    visit(node) {
      if (node === target) found = true;
    },
  });
  return found || root === target;
}

function arrayWrapperDeclarator(patternPath) {
  let top = patternPath;
  while (top.parentPath?.node
    && (top.parentPath.node.type === 'ArrayPattern' || top.parentPath.node.type === 'AssignmentPattern')) {
    top = top.parentPath;
  }
  return top.parentPath?.node?.type === 'VariableDeclarator' ? top.parentPath.node : null;
}

function arrayWrapperInDeclarator(patternPath) {
  return !!arrayWrapperDeclarator(patternPath);
}

function resolveArrayWrappedReceiver(patternPath, aliasCtx = null, { allowForInit = false, allowBodylessMulti = false } = {}) {
  const indices = [];
  let sole = true,
      cur = patternPath;
  for (;;) {
    const parent = cur.parentPath?.node;
    // an element DEFAULT is dead once the matched element provably exists - the claims
    // below only resolve off a proven receiver, so stepping through is sound
    // (`[, { from } = {}] = [Set, Array]` - babel extracts through it)
    if (parent?.type === 'AssignmentPattern' && parent.left === cur.node) {
      cur = cur.parentPath;
      continue;
    }
    if (parent?.type !== 'ArrayPattern') break;
    const index = parent.elements.indexOf(cur.node);
    if (index === -1) return null;
    // a SIBLING element pins the positions: a consumed prop there renames to `_unused`
    // instead of leaving, so only an all-single wrapper chain may drop whole
    if (parent.elements.length !== 1) sole = false;
    indices.unshift(index);
    cur = cur.parentPath;
  }
  if (!indices.length) return null;
  const hostParent = cur.parentPath;
  // the ASSIGNMENT twin: `[{ ... }] = [recv]` at statement position - the residual is the
  // RHS array kept as an expression (its element SEs still run), the overwrite lands after
  if (hostParent?.node?.type === 'AssignmentExpression' && hostParent.node.left === cur.node
    && hostParent.node.operator === '=') {
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && (exprStmtPath.node?.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(exprStmtPath.node?.type))) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    if (exprStmtPath?.node?.type !== 'ExpressionStatement') return null;
    // a BODYLESS slot (`if (c) [{ flat }] = [a];`) has no list to splice into - flagged, the
    // registration gates it and the drain wraps the slot in a block
    const bodyless = !statementListOf(exprStmtPath.parentPath?.node);
    // the assignment twin fires on SINGLE-element wrappers only - a sibling element
    // (`[{ of }, other] = [Array, 1]`) keeps the whole destructure raw (babel declines)
    // ... except in a BODYLESS slot, whose drain keeps the destructure RAW anyway: each
    // consumed element just appends its own overwrite
    if (!bodyless && (cur.node.type === 'ArrayPattern' ? cur.node.elements.length !== 1 : false)) return null;
    let element = hostParent.node.right;
    for (const index of indices) {
      element = followConstLiteralAlias(peelWrappers(element), aliasCtx);
      if (element?.type === 'SequenceExpression') element = peelWrappers(element.expressions.at(-1));
      if (element?.type !== 'ArrayExpression' || spreadShiftsIndex(element.elements, index)) return null;
      element = element.elements[index];
      if (!element) return null;
    }
    element = peelWrappers(element);
    if (element?.type === 'SequenceExpression') element = peelWrappers(element.expressions.at(-1));
    return { assignment: hostParent.node, exprStmtPath, element, bodyless };
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
  let element = hostParent.node.init,
      aliased = false;
  for (const index of indices) {
    const peeledElement = peelWrappers(element);
    aliased ||= (element = followConstLiteralAlias(peeledElement, aliasCtx)) !== peeledElement;
    if (element?.type === 'SequenceExpression') element = peelWrappers(element.expressions.at(-1));
    if (element?.type !== 'ArrayExpression' || spreadShiftsIndex(element.elements, index)) return null;
    // an element the pattern does not bind still EVALUATES - a spread ITERATES its argument,
    // a call runs - and a SOLE slot drops the wrapper whole, which would erase it. a pinned
    // sibling position keeps the residual, so the value survives there and only this shape
    // declines (the text emitter's own verdict)
    if (sole && !aliased
      && element.elements.some((item, at) => at !== index && mayHaveSideEffects(item))) return null;
    element = element.elements[index];
    if (!element) return null;
  }
  element = peelWrappers(element);
  // the SEQUENCE spelling stays available: a host that lifts the prefix itself needs the
  // whole element, the value consumers want its quiet tail
  const elementNode = element;
  if (element?.type === 'SequenceExpression') element = peelWrappers(element.expressions.at(-1));
  return {
    declarator: hostParent.node, declarationPath, element, elementNode, exported, host,
    single: sole,
  };
}

// literal-route receiver memo: `const _ref = <recv>` ahead, the residual's slot swaps
// to it - once per shared ref
function emitLiteralReceiverMemos({ declarator, jobs, statements, kind, mintRefName, hostRef = null, hostInit = null }) {
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
    statements.push(variableDeclaration(kind, [variableDeclarator(identifier(memo.refName), memo.node)]));
    // the memoized node may BE the init itself - the in-tree walk only sees children
    if (declarator.init === memo.node) declarator.init = identifier(memo.refName);
    else replaceNodeInTree(declarator.init, memo.node, identifier(memo.refName));
  }
}

function buildMemoArg(pending) {
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
function emitSentinelGroups({ hostNode, declarator, declJobs, statements }) {
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
function splitStaticSeKeyAhead({ hostNode, body, at, jobs, markRewrite }) {
  if (hostNode.declarations.length <= 1) return false;
  if (jobs.some(job => !(job.sentinel && job.seKey && !job.readsReceiver && !job.chain?.length && !job.exported))) return false;
  if (jobs.some(job => job.host === 'memo-decl')) return false;
  const ahead = orderDeclaratorJobs(jobs).map(job => variableDeclaration(hostNode.kind,
    [variableDeclarator(job.bindingTarget, job.value())]));
  body.splice(at, 0, ...ahead);
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
function eagerSentinelMemoName({
  keepKey, memoRecv, kind, forInit, prop, declarator, allProxyInit, firstDeclarator,
}, sentinelMemoNames, mintRefName) {
  if (!keepKey || memoRecv || kind !== 'instance' || forInit || sentinelMemoNames.has(declarator)
    || prop.value.type !== 'AssignmentPattern'
    || !sentinelMemoInitShape(peelNavWrappers(declarator.init), allProxyInit, firstDeclarator)) return;
  sentinelMemoNames.set(declarator, mintRefName());
}

// which INIT shapes need the sentinel memo: the residual re-reads the receiver, so a read the
// second reader cannot repeat verbatim (a member / call / sequence, a value-SELECTING branch, a
// constant literal) memoizes once. an ALL-PROXY selection re-reads for free
function sentinelMemoInitShape(init, allProxyInit, firstDeclarator = true) {
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
function seKeySegmentedDeclarators(declarator, jobs, refName) {
  if (jobs.length > 1 || (jobs.length === 1 && trailingSeKeyProps(declarator, jobs[0]))) {
    return interleavedSeKeySegments(declarator, jobs, refName);
  }
  return [declarator, ...jobs.map(job => variableDeclarator(job.bindingTarget, job.value(refName)))];
}

// props the source reads PAST the job's own slot - and only ORDINARY ones: a REST read takes the
// whole remainder and stays in the residual beside the sentinel, which is what babel spells
function trailingSeKeyProps(declarator, job) {
  // ... and only under a DEFAULT: there the guard reads past the key effect, so the source reads
  // the trailing props after the extraction. a plain job leaves them in the residual
  if (!job.defaulted || declarator.id.type !== 'ObjectPattern') return false;
  const after = declarator.id.properties.slice(declarator.id.properties.indexOf(job.prop) + 1);
  return after.length > 0 && after.every(prop => prop.type === 'Property');
}

function interleavedSeKeySegments(declarator, jobs, refName) {
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
function guardedSlotValue(built, valueNode, guardRef) {
  if (!guardRef) return built;
  // the VALUE node is CAPTURED at registration - a sentinel rename detaches it from the prop
  // before the drain, and `.right` still reads lazily so later in-place rewrites land through it
  const tested = built.type === 'Identifier' ? built
    : assignmentExpression('=', identifier(guardRef), built);
  return conditionalExpression(binaryExpression('===', tested, voidZero()),
    valueNode.right, built.type === 'Identifier' ? built : identifier(guardRef));
}

function joinSeKeySiblingDeclarator({
  hostNode, declarator, declJobsHere, exported, statements, markRewrite, refName = null,
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

export default function createAstDestructureEmitter({
  adapter, injector, injectorState, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped, program,
  resolvePure, resolveGlobalPolyfill, mintUnusedName, mintRefName, paramDefaultNeverOverridden = null,
  resolveNodeType = null, toHint = null, isDisabled = null, getDebugOutput = null,
}) {
  // hostNode (VariableDeclaration | ExpressionStatement) -> { hostPath, jobs } ledger;
  // the per-function insertion cursor keeping consecutive body-extracts in SOURCE order;
  // literal-route receiver memo names, shared per receiver NODE across that receiver's leaves
  // `hopHosts`: a sole ctor hop the extraction never touched still flattens - over a
  // MUTATED slot (no static behind the shim resolves, so no job records) and over a
  // PRISTINE proxy one; the proxy-root claim notes the host, the drain re-anchors
  const [ledger, bodyExtractInsertAt, literalMemoNames, hopHosts, navMemoPlans, sentinelMemoNames] = [
          new Map(), new Map(), new Map(), new Map(), new Map(), new Map(),
        ],
        // leaf patterns whose param-default synth already applied (every consumable prop of the
        // pattern fires its own meta, and the plan renders them all in one shot), and the SIMPLE
        // synth-swap ledger (a classifiable receiver, `{ from } = Array`: per-prop metas
        // register their slots; the drain renders ONE literal per pattern over the receiver)
        [synthDone, synthLedger, instanceSynthCtx] = [
          new WeakSet(), new Map(),
          { adapter, resolvePure, injectPureImport, skippedNodes, resolveNodeType, toHint },
        ],
        // the per-branch mirror (`= cond ? Array : Iterator`): each viable branch collects its
        // own slots and becomes its own literal
        pendingBranchSynths = new Map(),
        // the OUTER patterns a nested mirror owns: its literal already spells every leaf, so the
        // ordinary declarator route must not extract them a second time
        branchMirrorPatterns = new WeakSet(),
        // the SEQUENCE-element assignments this drain folded back into ONE comma slot: babel
        // spelled their extractions as statements of its own, so a lift that reaches such a
        // slot splits it back per element instead of joining the whole comma
        seqDrainedSlots = new WeakSet(),
        // ... and what the module-scope probe rebuilders need from this closure
        probeRenderCtx = { adapter, resolvePure, resolveGlobalPolyfill, injectPureImport,
          keepLive: skippedNodes.keepLive };

  // the provider-normalized nested-param synth plan rendered as NODES replacing the
  // parameter DEFAULT (the semantics - tree mirror, validation, leaf resolution - live in
  // the shared `buildNestedParamSynthPlan`; the text leg renders the same plan as source)
  function renderNestedParamSynth({ metaPath, meta, withinNode = null }) {
    const leafPattern = metaPath.parentPath;
    if (synthDone.has(leafPattern.node)) return true;
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: leafPattern, meta, resolvePure: m => resolvePure(m, metaPath), adapter,
    });
    const applied = applyNestedParamSynthPlan({
      plan,
      renderTree: (tree, recv) => renderSynthTree(tree, {
        polyfill: (entry, hintName) => identifier(injectPureImport(entry, hintName)),
        object: entries => objectExpression(entries.map(({ key, value }) => buildSynthProp(key, value))),
        passthrough: keyPath => {
          const ref = resolvePassthroughRef({
            keyPath, ...recv, resolveGlobalPolyfill,
            isMutatedStatic: (object, key) => adapter.isMutatedStatic(object, key),
          });
          let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
          for (const key of ref.path) base = memberFromKeyName(base, key);
          return base;
        },
      }),
      replaceTarget: (targetNode, rendered) => {
        // ... and never OUTSIDE the host the caller owns: a receiver reached through an alias
        // binding belongs to that binding's own declaration, and swapping a literal in there
        // rewrites what every other reader sees (`const w3 = [globalThis]` stays)
        if (withinNode && !nodeHoldsSubtree(withinNode, targetNode)) return false;
        if (!replaceNodeInTree(program, targetNode, rendered)) return false;
        markRewrite();
        return true;
      },
      skipSubtree: targetNode => markSubtreeSkipped(skippedNodes, targetNode),
    });
    if (applied) synthDone.add(leafPattern.node);
    return applied;
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
        ? peelWrappers(hostParent.node.right)
        : peelWrappers(detectIifeArgReceiver(hostParent, pattern));
      // ... and a receiver whose re-evaluation IS observable may still be spelled once: a
      // SOLE-prop pattern gives its one slot that single spelling (`{ at } = Array.prototype` ->
      // `{ at: _atMaybeArray(Array.prototype) }`). a second slot would read it twice, and a CALL
      // receiver stays out whatever the count - where both other emitters stand down too
      // ... a receiver reading off a GUARDED value stands down whole: by synth time the
      // walk has rendered the source's `?.` as its ternary, and the slot literal would spell
      // that read unconditionally where the source short-circuits - babel keeps the raw
      // destructure there (a source-written selecting receiver declines the same way)
      const spelledOnce = pattern.properties.length === 1
        && instanceReceiver?.type === 'MemberExpression' && !mayHaveSideEffects(instanceReceiver)
        && !receiverCarriesOptional(instanceReceiver)
        && peelWrappers(instanceReceiver.object)?.type !== 'ConditionalExpression';
      return entry !== 'get-iterator-method'
        && (isReusableSynthReceiver(instanceReceiver) || spelledOnce)
        && registerInstanceSynthSlot({
          metaPath, pattern, hostParent, entry, hintName, receiver: instanceReceiver,
          synthLedger, ctx: instanceSynthCtx,
        });
    }
    if (!isSynthSimpleObjectPattern(pattern, { allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true })
      || !computedKeysAllBound(pattern, metaPath.scope)) return false;
    const receiver = findSynthSwapReceiver(hostParent, pattern, metaPath.scope, adapter, resolvePure);
    let baseIdent = receiver;
    let leadingEffects = null;
    let passthroughPrefix = null;
    // the SE policy decides the channel BEFORE any direct route: an SE-bearing receiver
    // (a call, a rescue-carrying member / logical left) memoizes through the IIFE param -
    // the direct swap would re-run its setup on every unresolved re-read
    const sePolicy = receiver
      ? classifyCallBranchForSynth({ inner: receiver, scope: metaPath.scope, adapter, path: metaPath })
      : { callBranch: false };
    // a pure proxy-nav MEMBER receiver (`globalThis.self.Array`): the literal's passthrough
    // reads through the kept root and the surviving nav keys - an ALIAS root resolves the
    // same surface (`const g = globalThis; g.self.Map` reads `_Map` / `g.Object` per key)
    let baseIsProxy = false;
    const navBase = sePolicy.callBranch ? null
      : proxyNavSynthBase(receiver?.type === 'LogicalExpression' ? peelWrappers(receiver.left) : receiver,
        { scope: metaPath.scope, adapter, path: metaPath });
    // a fallback LEFT takes the nav base only when it spells NO effect of its own: an
    // SE-bearing one routes through the callBranch memo, which owns the re-emission order
    if (navBase && !(receiver?.type === 'LogicalExpression' && navBase.leadingEffects)) {
      ({ baseIdent, passthroughPrefix, leadingEffects } = navBase);
      baseIsProxy = true;
    } else if (!sePolicy.callBranch && receiver?.type === 'LogicalExpression') {
      // a fallback-shaped receiver (`(SE, Array) || Set`) collapses LEFT: the literal replaces
      // the whole logical, the left's sequence prefix re-runs ahead of it (its own claims stay
      // live), the dropped branch dies whole
      let left = peelWrappers(receiver.left);
      if (left?.type === 'SequenceExpression') {
        // capture the LIVE sequence, not its elements: the walker still rewrites the prefix
        // in place, and the drain reads the current state
        leadingEffects = left;
        left = peelWrappers(left.expressions.at(-1));
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
    } else if (baseIdent?.type !== 'Identifier' && baseIdent?.type !== 'ThisExpression') return false;
    const dedupKey = synthPropDedupKey(metaPath.node, { scope: metaPath.scope, path: metaPath, adapter });
    if (!dedupKey) return false;
    let pending = synthLedger.get(pattern);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
      if (!plan) return false;
      pending = {
        plan, receiver, baseName: callBranch || baseIdent.type !== 'Identifier' ? null : baseIdent.name,
        baseIsProxy, leadingEffects, passthroughPrefix,
        callBranch,
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
      for (const rescue of discardRescueNodes({ node, scope: metaPath.scope, adapter, path: metaPath })) {
        skippedNodes.keepLive?.add(rescue);
      }
      markSubtreeSkipped(skippedNodes, node, skippedNodes.keepLive?.size ? skippedNodes.keepLive : null);
    }
    if (callBranch) {
      if (receiver.type === 'LogicalExpression') markSubtreeSkipped(skippedNodes, receiver.right);
      // the top node must survive to the drain (a whole-member claim would detach it). a
      // canonically-planned tail is consumed whole; without a plan the inner nodes stay
      // live so the memo argument carries their in-place claims
      skippedNodes.add(receiver);
      if (memoArgPlan) markSkippedKeepingRescues(memoArgPlan.tail);
    } else if (receiver.type === 'LogicalExpression') {
      markSubtreeSkipped(skippedNodes, receiver.right);
      // a NAV left dies whole with the swap - a tail-only skip would leave a dropped
      // sequence prefix's globals visible and leak a dead import
      if (baseIsProxy) markSkippedKeepingRescues(receiver.left);
      else skippedNodes.add(baseIdent);
    } else if (receiver.type === 'MemberExpression') markSkippedKeepingRescues(receiver);
    else skippedNodes.add(receiver);
    pending.slots.set(dedupKey, injectPureImport(entry, hintName));
    return true;
  }

  // the per-branch mirror over a conditional / logical receiver: only a VIABLE branch (its
  // ctor carries a static polyfill for the key) becomes a literal; the rest keep their own
  // routing (the ctor identifier arm still swaps `Set` -> `_Set`)
  function handlePerBranch({ metaPath }) {
    const prop = metaPath.node;
    if (prop.type !== 'Property') return;
    const patternPath = metaPath.parentPath;
    const pattern = patternPath?.node;
    if (pattern?.type !== 'ObjectPattern') return;
    // the assignment's VALUE is the receiver itself: a branch swapped for a synth literal
    // would change what the expression yields, so a CONSUMED assignment declines the mirror
    // (`const host = ({ assign: a } = shim || Object)` keeps `Object`)
    if (patternPath.parentPath?.node?.type === 'AssignmentExpression'
      && !assignmentInStatementPosition(patternPath.parentPath)) return;
    // an ARRAY-WRAPPED pattern names no receiver slot of its own - the matching ELEMENT is
    // the value it destructures, and a selecting element is the same per-branch shape
    const desc = resolveFallbackReceiver(patternPath.parentPath, pattern)
      ?? (element => element ? { rhsNode: element } : null)(resolveArrayWrappedReceiver(patternPath)?.element);
    if (!desc?.rhsNode) return;
    // a HOP prop (its value another pattern): the mirror descends into the leaf and
    // resolves each leaf slot as a static of the hop's constructor - the branch literal
    // then nests back up (`cond ? { Array: { from: _Array$from } } : userObj`)
    if (prop.value?.type === 'ObjectPattern') {
      if (prop.computed) return;
      // every outer prop a plain hop: each registers its own subtree, the drain merges
      // them into ONE branch literal (`{ Array: {...}, JSON: {...} }`)
      const mirrorable = pattern.properties.length === 1
        || pattern.properties.every(item => item.type === 'Property' && !item.computed
          && item.value?.type === 'ObjectPattern');
      const chainKeys = [];
      let hopProp = prop;
      while (hopProp.value?.type === 'ObjectPattern' && !hopProp.computed) {
        const keyName = hopProp.key?.name ?? hopProp.key?.value;
        if (typeof keyName !== 'string') return;
        chainKeys.push(keyName);
        const innerPattern = hopProp.value;
        if (innerPattern.properties.length === 1 && innerPattern.properties[0]?.value?.type === 'ObjectPattern') {
          [hopProp] = innerPattern.properties;
          continue;
        }
        if (mirrorable && registerNestedBranchMirror({
          branch: desc.rhsNode, leafPattern: innerPattern, chainKeys, metaPath, outerPattern: pattern,
        })) return;
        // the mirror declined (a `&&` / diverging shape / hop siblings): a DEFAULTED leaf
        // still takes the sound inline default - the polyfill lands only where the
        // destructured slot is undefined, whatever the receiver held
        swapInlineDefaults({
          leafPattern: innerPattern, ctorName: chainKeys.at(-1), metaPath,
          insertOnUndefaulted: peelWrappers(desc.rhsNode)?.type === 'LogicalExpression'
            && peelWrappers(desc.rhsNode).operator === '&&',
        }, { resolvePure, markSubtreeSkipped, skippedNodes, injectPureImport, markRewrite });
        return;
      }
      return;
    }
    if (!isSynthSimpleObjectPattern(pattern, { allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true })
      || !computedKeysAllBound(pattern, metaPath.scope)) return;
    const { lookupKey } = resolveSynthKeys({ node: prop, scope: metaPath.scope, adapter, path: metaPath });
    const dedupKey = synthPropDedupKey(prop, { scope: metaPath.scope, path: metaPath, adapter });
    if (!lookupKey || !dedupKey) return;
    registerBranchTree({ branch: desc.rhsNode, key: lookupKey, dedupKey, pattern, metaPath });
  }

  // the nested mirror registers only on a PRISTINE proxy-root branch: leading hops must be
  // pristine proxy steps, the last one names the constructor whose statics fill the slots
  function registerNestedBranchMirror({ branch, leafPattern, chainKeys, metaPath, outerPattern = null }) {
    // the LEFT of an `&&` is the selection's TEST value, not a branch the destructure
    // consumes: its read substitutes normally and only the RIGHT mirrors
    // (`self && globalThis` -> `_self && { Array: { of: _Array$of } }` - the text shape)
    {
      let host = metaPath;
      while (host?.node && host.node.type !== 'VariableDeclarator'
        && host.node.type !== 'AssignmentExpression') host = host.parentPath;
      const selecting = peelWrappers(host?.node?.init ?? host?.node?.right ?? null);
      if (selecting?.type === 'LogicalExpression' && selecting.operator === '&&'
        && peelWrappers(selecting.left) === branch) return false;
    }
    if (chainKeys.slice(0, -1).some(key => !isPristineProxyGlobal(adapter, key))) return false;
    if (!isSynthSimpleObjectPattern(leafPattern, { allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true })
      || !computedKeysAllBound(leafPattern, metaPath.scope)) return false;
    let inner = peelFallbackBranchInner(branch);
    if (!inner) return false;
    // an INLINE-resolvable CALL branch yields its own RETURN expression: the literal replaces
    // that, so the call still runs and its body's effects stay where the source wrote them
    // (`c ? (() => { hits++; return globalThis; })() : ...`, `(() => m && globalThis)()`)
    if (inner.type === 'CallExpression' && !inner.optional) {
      const returned = inlineCallReturnExpression({
        callNode: inner, scope: metaPath.scope, adapter, seen: new Set(), path: metaPath, rejectConditional: true,
      });
      // an IDENTITY call hands back its ARGUMENT: the literal lands on that value's own tail,
      // so a sequence prefix keeps running where the source wrote it
      let value = returned && peelWrappers(returned);
      while (value?.type === 'SequenceExpression') value = peelWrappers(value.expressions.at(-1));
      // ... and only the shapes whose yield is ONE surface: a bare proxy root, or an `&&` GATE
      // whose right operand is that root (`() => m && globalThis`). a selection between two
      // different surfaces keeps its own channels - the mirror there would spell both arms
      const gatedRoot = value?.type === 'LogicalExpression' && value.operator === '&&'
        && !proxySurfaceIdentifier(peelWrappers(value.left), { adapter, injectorState });
      if (value && (gatedRoot || (value.type === 'Identifier' && isPristineProxyGlobal(adapter, value.name)))) {
        inner = value;
      }
    }
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        if (!fallbackBranchSwapKeepsSelection({
          hostNode: inner, slot, branchNode: inner[slot], scope: metaPath.scope, adapter, path: metaPath,
        })) continue;
        if (registerNestedBranchMirror({
          branch: inner[slot], leafPattern, chainKeys, metaPath, outerPattern,
        })) any = true;
        // a FALLBACK logical is decided by its LEFT, and the mirror puts an always-truthy
        // literal there: the right can no longer run, so it stays verbatim (babel's dead-side
        // canon). a CONDITIONAL keeps both - either arm is still reachable
        if (any && inner.type === 'LogicalExpression' && inner.operator !== '&&') break;
      }
      return any;
    }
    if (inner.type !== 'Identifier' || !isPristineProxyGlobal(adapter, inner.name)) return false;
    const plan = buildPatternRenderPlan(leafPattern, { scope: metaPath.scope, path: metaPath, adapter });
    if (!plan) return false;
    const slotMap = new Map();
    for (const planEntry of plan) {
      const pure = resolvePure({
        kind: 'property', object: chainKeys.at(-1), key: planEntry.lookupKey, placement: 'static',
      }, metaPath);
      if (!pure || pure.kind === 'instance') return false;
      slotMap.set(planEntry.dedupKey, injectPureImport(pure.entry, pure.hintName));
    }
    markSubtreeSkipped(skippedNodes, inner);
    let pending = pendingBranchSynths.get(inner);
    if (!pending?.nestedTrees) {
      pending = { receiver: inner, nestedTrees: [] };
      pendingBranchSynths.set(inner, pending);
    }
    // BOTH claims of a hop pair (the leaf's and the hop's own) can reach a mirror route -
    // the registry dedups by identity, or the branch literal doubles its prop
    if (pending.nestedTrees.some(tree => tree.outerPattern === outerPattern
      && tree.chainKeys.join('.') === chainKeys.join('.'))) return true;
    pending.nestedTrees.push({ plan, slots: slotMap, chainKeys: [...chainKeys], outerPattern });
    if (outerPattern) branchMirrorPatterns.add(outerPattern);
    return true;
  }

  function registerBranchTree({ branch, key, dedupKey, pattern, metaPath }) {
    const inner = peelFallbackBranchInner(branch);
    if (!inner) return false;
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        // a value-selecting operand that can be nullish must not become an always-defined
        // literal - the swap would flip which branch runs (the shared predicate's contract)
        if (!fallbackBranchSwapKeepsSelection({
          hostNode: inner, slot, branchNode: inner[slot], scope: metaPath.scope, adapter, path: metaPath,
        })) continue;
        if (registerBranchTree({ branch: inner[slot], key, dedupKey, pattern, metaPath })) any = true;
      }
      return any;
    }
    const pure = isViableBranchForKey({
      branch, key, scope: metaPath.scope, adapter, resolvePure: m => resolvePure(m, metaPath), path: metaPath,
    });
    if (!pure || pure.kind === 'instance') return false;
    // an SE-carrying branch (a buried effect along the spine, a call root) swaps WITH its
    // rescue through the shared callBranch drain channel - the receiver re-emits ahead of
    // the literal (`cond ? ((eff2(), _globalThis).Object, { keys: _Object$keys }) : ...`);
    // partial key coverage takes the IIFE instead, the branch value passed as its memo
    const sePolicy = inner.type === 'Identifier' ? { callBranch: false }
      : classifyCallBranchForSynth({ inner, scope: metaPath.scope, adapter, path: metaPath });
    if (sePolicy.callBranch) {
      let pending = pendingBranchSynths.get(inner);
      if (!pending) {
        const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
        if (!plan) return false;
        pending = {
          plan, receiver: inner, slots: new Map(), callBranch: true, branchMirror: true, metaPath,
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
      let hopKeys = [];
      let cur = inner;
      while (cur?.type === 'MemberExpression' && !cur.computed) {
        hopKeys.unshift(cur.property?.name);
        cur = peelWrappers(cur.object);
      }
      if (!hopKeys.length || hopKeys.some(hop => !hop)) return false;
      let rootName = cur?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(cur.name) ? cur.name : null;
      if (!rootName && cur) {
        // an inline-resolvable PURE root (`(() => globalThis)().Promise`, an alias): the
        // root falls away (the canonical discard keeps nothing) and the passthrough reads
        // through the resolved surface (`_Promise.baz`)
        const resolved = resolveObjectName({ objectNode: cur, scope: metaPath.scope, adapter, path: metaPath });
        if (resolved && POSSIBLE_GLOBAL_OBJECTS.has(resolved)
          && !discardRescueNodes({ node: cur, scope: metaPath.scope, adapter, path: metaPath }).length) {
          rootName = resolved;
        }
      }
      if (!rootName) return false;
      while (hopKeys.length && isPristineProxyGlobal(adapter, hopKeys[0])) hopKeys = hopKeys.slice(1);
      branchBase = { baseName: rootName, passthroughPrefix: hopKeys, baseIsProxy: true };
    }
    let pending = pendingBranchSynths.get(inner);
    if (!pending) {
      const plan = buildPatternRenderPlan(pattern, { scope: metaPath.scope, path: metaPath, adapter });
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

  // the array-wrapped ASSIGNMENT twin's registration, extracted for its size - see the
  // arrayHost branch in handleObjectPropertyResult
  function registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath, symbolProp }) {
    // a BODYLESS twin and an INSTANCE-defaulted prop both keep the raw destructure (the
    // native slot assigns first, the overwrite re-binds after), so the element is read
    // TWICE - only a re-referenceable one qualifies. a STATIC default is DEAD (the pairing
    // proved the element) and the consume drops it with the destructure, the declaration
    // route's own rule
    const defaulted = prop.value.type === 'AssignmentPattern' && kind === 'instance';
    if ((wrapped.bodyless || defaulted) && !isReReferenceableReceiver(wrapped.element)) return;
    const chainKeys = hopChainKeys(chain);
    // the dead default peels out of the VALUE only - the raw prop keeps its own binding
    const twinProp = prop.value.type === 'AssignmentPattern' ? { ...prop, value: prop.value.left } : prop;
    // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
    // wrapper pairing proved the element, and a chain reads through the literal to the
    // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
    // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
    const twinDeepReceiver = kind === 'instance' && chain.length
        ? resolveNestedReceiverNode(metaPath) : null;
    const twinReceiver = twinDeepReceiver ?? wrapped.element;
    const value = buildValue({
      kind, entry, hintName, receiverNode: twinReceiver, prop: twinProp,
      nested: !twinDeepReceiver && chain.length > 0, chainKeys, metaPath,
      // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
      // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
      literalRoute: kind === 'instance' && (isConstantLiteralReceiver(peelWrappers(twinReceiver))
          || (isReReferenceableReceiver(twinReceiver)
            && !(peelWrappers(twinReceiver)?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(peelWrappers(twinReceiver).name)))),
    });
    if (!value) return;
    markRewrite();
    recordJob({
      hostPath: wrapped.exprStmtPath,
      job: (() => {
        const job = {
          prop, pattern, chain,
          // a rest sibling keeps the residual reading past the consumed key - the prop
          // renames to `_unused` there; without one the prop leaves and the left dies
          sentinel: defaulted || hasRestSibling(pattern) || chain.some(level => level.outerRest),
          // ... except a SYMBOL target, which has no declaration to host an extraction: the
          // destructure assigns it natively first and the overwrite rebinds it through the
          // helper, so the prop keeps its own binding (`[{ [S]: it, ...r }] = [arr]`) -
          // and a DEFAULTED one, whose default must run natively before the re-bind
          keepSentinelBinding: symbolProp || defaulted,
          local: propLocalName(prop), value,
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

  function handleObjectPropertyResult({ metaPath, meta, kind, entry, hintName }) {
    const prop = metaPath.node;
    // a PRISTINE proxy hop holding a nested pattern is pure NAVIGATION, not a ctor alias:
    // the flatten owns it, and an extraction here would bind the hop's OWN surface where
    // the source reads through it to the root (`{ self: { X } } = globalThis` -> `_globalThis`)
    if (meta?.guardedAliasHint || (meta?.chainAssignInsertAt !== null && meta?.chainAssignInsertAt !== undefined)
      || (kind === 'global' && !prop.computed && prop.value?.type === 'ObjectPattern'
        && POSSIBLE_GLOBAL_OBJECTS.has(hintName) && isPristineProxyGlobal(adapter, hintName))) return;
    // harvested effects: only pure RECEIVER effects pass (the memo path keeps the whole
    // init alive, effects included); a mixed channel stays staged. KEY effects never reach
    // the meta here - they live in the prop's own key subtree, probed directly below
    const receiverSeOnly = !!meta?.sideEffects?.length && meta.receiverEffectCount === meta.sideEffects.length;
    if ((meta?.sideEffects?.length || meta?.receiverEffectCount) && !receiverSeOnly) return;
    const symbolProp = entry === 'get-iterator-method',
          // the ctor-pattern re-anchor serves only a pattern the FLATTEN leaves whole: one
          // resolvable leaf routes the claim through the leaf's own chain climb instead, and a
          // mixed pattern's split residual stays staged
          ctorPattern = kind === 'global' && prop.value?.type === 'ObjectPattern'
      && prop.value.properties.every(leaf => leaf.type === 'Property' && !leaf.computed
        && leaf.value?.type === 'Identifier' && (leaf.key?.type === 'Identifier' || leaf.key?.type === 'Literal')
        && !resolvePure({
          kind: 'property', object: hintName, key: leaf.key.name ?? leaf.key.value, placement: 'static',
        }, metaPath));
    if (!isPlainConsumableProp(prop, { symbolProp, ctorPattern })) return;
    const patternPath = metaPath.parentPath,
          pattern = patternPath?.node;
    // a RELOCATED catch pattern reaches this ledger as an ordinary declarator - the shared
    // liveness gate keeps a binding the catch body never reads a native read
    if (pattern?.type !== 'ObjectPattern' || relocatedCatchPropUnobservable({
      declaratorPath: patternPath.parentPath, propNode: prop, patternNode: pattern,
      localName: propLocalName(prop) ?? null, walkNode: (root, visit) => walkAstNodes({ root, visit }),
    })) return;
    // a rest sibling reads "everything the pattern did not consume": the consumed prop then
    // RENAMES to an `_unused` sentinel instead of leaving (the key keeps excluding it) - and
    // an SE computed key takes the same rename, its effect replaying in the residual
    const sentinel = hasRestSibling(pattern) || (prop.computed && computedKeyHasSideEffects(prop));
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
      scope: metaPath.scope, adapter, path: metaPath,
      carriesReceiver(defaultPath) {
        // a default carrying no receiver (`= {}`) has no slots to mirror
        let core = peelWrappers(defaultPath.node.right);
        if (core?.type === 'ChainExpression') core = peelWrappers(core.expression);
        if (core?.type !== 'Identifier' && core?.type !== 'MemberExpression') return false;
        // ... and a resolvable OUTER chain leaves its default dead: the receiver proves the hop
        // (`{ Set: { union } = Set } = globalThis` flattens), an opaque host does not
        let host = defaultPath.parentPath;
        while (host?.node && host.node.type !== 'VariableDeclarator' && host.node.type !== 'AssignmentExpression'
          && host.node.type !== 'CatchClause' && host.node.type !== 'ForOfStatement'
          && host.node.type !== 'ForInStatement') host = host.parentPath;
        const hostInit = host?.node?.init ?? host?.node?.right ?? null;
        return !hostInit || !findProxyGlobal(hostInit, { scope: metaPath.scope, adapter, path: metaPath });
      },
    });
    if (!climbed) return;
    const { chain, hostPatternPath, hostParent } = climbed,
          // a pattern living in FUNCTION PARAMS (under a default / array wrapper): the
          // synth-swap family - the DEFAULT (or the classifiable receiver) is replaced by a
          // synthetic literal carrying the polyfilled slots
          // non-symbol nested instance leaves resolve through the declarator literal walk, or
          // through the ASSIGNMENT host's overwrite channel (no declaration to host a `const`,
          // so the ponyfill re-binds the local after the statement); every other host stays staged
          nestedPlainInstance = chain.length > 0 && kind === 'instance' && entry !== 'get-iterator-method';
    // an ARRAY-WRAPPED pattern with a literal init: the receiver is the MATCHING element;
    // the leaf renames to `_unused` (array positions cannot shrink) and the declaration
    // drops whole only when no real binding survives
    const assignHost = hostParent?.node?.type === 'AssignmentExpression'
      && hostParent.node.left === hostPatternPath.node && hostParent.node.operator === '=';
    // ... an ARRAY-WRAPPED host stays in: the wrapper branch below resolves its element and
    // the canonical nested walk reads through the literal to the dispatching receiver
    const arrayWrapHost = hostParent?.node?.type === 'ArrayPattern'
      || (hostParent?.node?.type === 'AssignmentPattern' && hostParent.parentPath?.node?.type === 'ArrayPattern');
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
      // a wrapper reached through a CONST BINDING resolves like the inline literal only for a
      // claim that never RE-READS the element: a static substitutes its own pure and spells no
      // receiver, while an instance / symbol extraction would re-read a value the wrapper's own
      // statement holds (`const chain = [arr]; const [{ at }] = chain` stays native)
      const wrapped = resolveArrayWrappedReceiver(hostPatternPath,
        kind === 'instance' || symbolProp ? null : { scope: metaPath.scope, adapter, path: metaPath },
        { allowBodylessMulti: true });
      // a BODYLESS slot has no statement list for the array drain to splice into: the
      // element is the receiver and the shared bodyless registration owns the rewrite,
      // its own SE lift included
      if (wrapped?.host?.bodyless && wrapped.single) {
        return registerBodylessDeclJob({
          host: wrapped.host, kind, entry, hintName, prop, pattern, chain, sentinel, metaPath, initNode: wrapped.elementNode,
        });
      }
      if (receiverSeOnly || (wrapped && divergingSelection(wrapped.element, { adapter, injectorState }))) return;
      if (wrapped?.assignment) {
        registerArrayAssignTwinJob({ wrapped, prop, pattern, chain, kind, entry, hintName, metaPath, symbolProp });
        return;
      }
      // a FOR-INIT wrapper has no statement list to splice into either: the loop header hosts
      // the extraction as a sibling declarator and the discarded wrapper rides the same sink
      // the plain for-init route uses, flattened out of its array. a MULTI-element wrapper
      // stays the conservative native bail - its siblings still bind
      if (!wrapped && declinedWrapperTakesDefault({
        metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostPatternPath, symbolProp,
      }, {
        registerForInitWrapJob, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped,
        // ... and a DECLINED wrapper still mirrors its NESTED leaf where the shared plan reaches
        // the element: the literal replaces the element's own value and the siblings run on
        // (`[(eff('e'), { Object: { fromEntries: _Object$fromEntries } }), eff('f')]`)
        nestedSynth: () => renderNestedParamSynth({
          metaPath, meta, withinNode: arrayWrapperDeclarator(hostPatternPath)?.init ?? null,
        }),
      })) return;
      if (wrapped) {
        const chainKeys = hopChainKeys(chain);
        // the dead default peels out of the VALUE only - the job keeps the source prop, so
        // removal / rename still match by identity
        const valueProp = kind !== 'instance' && prop.value.type === 'AssignmentPattern'
          ? { ...prop, value: prop.value.left } : prop;
        // an INSTANCE claim resolves its receiver through the canonical NESTED walk - the
        // wrapper pairing proved the element, and a chain reads through the literal to the
        // value that actually dispatches (`[{ y: { flat: m } }] = [{ y: arr }]` ->
        // `_flatMaybeArray(arr)`); the pairing-proven single read is the literal route
        const deepReceiver = kind === 'instance' && chain.length
          ? resolveNestedReceiverNode(metaPath) : null;
        const declReceiver = deepReceiver ?? wrapped.element;
        const value = buildValue({
          kind, entry, hintName, receiverNode: declReceiver, prop: valueProp,
          nested: !deepReceiver && chain.length > 0, chainKeys, metaPath,
          // ... a POSSIBLE-GLOBAL identifier stays off the literal route: the barePure /
          // proxy machinery owns its substitution (`globalThis` -> `_globalThis`)
          literalRoute: kind === 'instance' && (isConstantLiteralReceiver(peelWrappers(declReceiver))
            || (isReReferenceableReceiver(declReceiver)
              && !(peelWrappers(declReceiver)?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(peelWrappers(declReceiver).name)))),
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
            prop, pattern, chain, sentinel: true, declarator: wrapped.declarator,
            local: propLocalName(prop), value, host: 'array-decl', exported: wrapped.exported,
            bodylessWrap: wrapped.host?.bodyless === true,
            bindingTarget: propBindingTarget(prop), metaPath,
            initProbePlan: planDiscardedInitProbe(wrapped.declarator.init, metaPath, { adapter, resolvePure }),
            sealedProbePlan: planSealedNavProbe(wrapped.declarator.init, metaPath,
              { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
          },
        });
        return;
      }
    }
    // a receiver-bearing DEFAULT one level in (`{ inner: { at } = [1, 2] } = {}`): the climb sees
    // THROUGH the AssignmentPattern and lands the claim on the outer host, but the swap belongs to
    // the default - the same simple synth the parameter form takes, whatever that outer host is
    // (a declarator, an assignment, a catch param: it decides where the residual lives, not
    // whether the default is live - `handleParamHost`'s own rule for the shape one level up)
    if (chain.length > 0 && !receiverSeOnly && patternPath?.parentPath?.node?.type === 'AssignmentPattern'
      && patternPath.parentPath.node.left === patternPath.node
      && registerSimpleSynthSlot({
        metaPath, pattern, hostParent: patternPath.parentPath, kind, entry, hintName,
      })) return;
    if (hostParent?.node?.type === 'AssignmentPattern' || hostParent?.node?.type === 'ArrayPattern') {
      if (receiverSeOnly) return;
      return handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath });
    }
    // a bare param pattern (`(({ resolve }) => ...)(Promise)`): the IIFE call-arg is the
    // receiver, the same simple-synth route (findSynthSwapReceiver resolves the arg)
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
      return handleAssignmentHost({ metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent });
    }
  }

  function handleParamHost({ metaPath, meta, kind, entry, hintName, pattern, chain, hostParent, hostPatternPath }) {
    for (let from = hostPatternPath, cur = hostPatternPath.parentPath; cur; from = cur, cur = cur.parentPath) {
      const { type } = cur.node ?? {};
      if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') {
        if (from.listKey !== 'params' && from.key !== 'params') return;
        // the SIMPLE receiver swap first (mirrors the text dispatcher's order), the
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
        // where the residual lives, not whether the default is live
        if (chain.length === 0 && hostParent.node.type === 'AssignmentPattern') {
          registerSimpleSynthSlot({ metaPath, pattern, hostParent, kind, entry, hintName });
        }
        break;
      }
    }
  }

  // synth-swap and the nested mirror both bailed: body-extract `let X = _polyfill;` at the
  // function body head (the prop leaves, or renames to `_unused` under a rest sibling), or
  // the inline default `{ p = _polyfill }` when an SE computed key must stay spelled -
  // babel's fallback chain, gated by the SAME shared predicates (caller-lossiness first)
  function paramExtractFallback({ metaPath, kind, entry, hintName, pattern }) {
    const prop = metaPath.node;
    if (kind === 'instance') return;
    if (paramsHaveInvisibleCallers(metaPath, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
    const keyHasSideEffect = computedKeyHasSideEffects(prop);
    if (!keyHasSideEffect && tryBodyExtractParam({ metaPath, prop, pattern, entry, hintName })) return;
    applyInlineDefault({ prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped });
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
    if (at === undefined) {
      at = 0;
      while (at < body.length && isDirectiveStatement(body[at])) at++;
    }
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
    kind, entry, sentinel, declarator, declaration, soleBinding, literalReceiver, relaxedReceiver, exported,
    symbolPatternResidual = false, allProxyInit = false, forInit = false,
  }) {
    // the key is kept when the residual still needs it. a SOLE binding leaves none, and
    // there the extraction may carry the init whole - including its effects, when the
    // receiver IS that init (`{ flat } = (c++, gt.self).Array.prototype || {}`)
    const carriesInitWhole = !!literalReceiver && literalReceiver === declarator.init;
    // a symbol-PATTERN sibling leaves a residual that still spells the key, so the memo
    // decision below must see the kept key - not learn about it after the fact
    // ... and a FOR-INIT host keeps the residual whatever the binding count: babel never
    // drops the loop-header declarator, the extraction appends as a sibling after it
    const keepKey = sentinel || symbolPatternResidual
      || (kind === 'instance' && entry !== 'get-iterator-method' && !!literalReceiver
        && (forInit || !(soleBinding
          && (relaxedReceiver || carriesInitWhole || !mayHaveSideEffects(declarator.init)))));
    // a MULTI-declarator host keeps the one declaration and appends the extraction as a
    // sibling declarator - the receiver is spelled twice there, so the memo never applies
    // (`const z = 1, { ..._unused } = R, m = _f(R);`)
    const siblingAppend = keepKey && !sentinel && !!literalReceiver && declaration.declarations.length > 1;
    let memoRecv = null;
    // a SENTINEL's residual re-reads its receiver, so a value-SELECTING one may not stay
    // spelled - the branch would be taken twice. the fragment memoizes and both readers take
    // the ref (`{ y: { [(k(), 'values')]: v } } = { y: c ? [1] : [] }`); an ALL-PROXY selection
    // re-reads for free and keeps its own shape
    const branchingReceiver = !allProxyInit && !!literalReceiver
      && (literalReceiver.type === 'ConditionalExpression' || literalReceiver.type === 'LogicalExpression');
    if (keepKey && (!sentinel || branchingReceiver) && literalReceiver && literalReceiver.type !== 'Identifier') {
      const relaxedMemoizable = relaxedReceiver
        && literalReceiver.type !== 'ArrayExpression' && literalReceiver.type !== 'ObjectExpression';
      const memoizable = (relaxedMemoizable || branchingReceiver
        || isConstantLiteralReceiver(literalReceiver)) && !siblingAppend && !forInit;
      // a receiver safe to SPELL TWICE duplicates instead (the identifier route's shape,
      // one level up): the extraction clones it and the residual keeps the original. the
      // clone is taken at drain time off the already-rewritten tree, so the copy carries
      // the walk's own scope-aware claims (`[Set]` -> `[_Set]` in both, a shadowed `Map`
      // raw in both)
      if (!memoizable) {
        if (!isReReferenceableReceiver(literalReceiver)) return null;
      } else {
        // shared per receiver NODE: two leaves off one receiver read the same `_ref`
        // a BRANCHING fragment defers its number to the drain, where every other whole-init
        // memo takes one: minting during the walk would run ahead of them and babel numbers
        // by its own emission order
        let memo = literalMemoNames.get(literalReceiver);
        if (!memo) {
          memo = branchingReceiver
            ? { ident: identifier(''), node: literalReceiver, deferred: true }
            : { refName: mintRefName(), node: literalReceiver };
          literalMemoNames.set(literalReceiver, memo);
        }
        memoRecv = memo;
      }
    }
    if (siblingAppend && exported) return null;
    return { keepKey, memoRecv, siblingAppend };
  }

  // a sentinel-kept declarator whose init cannot be re-read RAW (a member's getter, a
  // constant literal's bloat) memoizes into a shared leading `_ref` declarator; the for-init
  // sentinel is implementable exactly there. a PROXY-rooted member init keeps the
  // split-statement memo shape (its collapse channel owns the ordering); a plain member /
  // constant literal joins as sibling declarators
  // an OPAQUE / effect-bearing init with no direct receiver: the defaulted sole-consume
  // takes it whole, the statically selected logical LEFT extracts, everything else records
  // the whole-init memo job ('handled') or stands down
  function routeOpaqueInit({
    metaPath, meta, kind, entry, hintName, prop, pattern, chain, declarator, declarationPath,
    forInit, exported, soleBinding,
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
    const defaultedIdent = prop.value.type === 'AssignmentPattern' && chain.length === 0
      && (prop.value.left?.type === 'Identifier'
        || (prop.value.left?.type === 'ObjectPattern' && entry === 'get-iterator-method'))
      && (kind === 'instance' || kind === 'static');
    if (forInit) return 'handled';
    if (chain.length > 0 && kind === 'instance' && peelWrappers(declarator.init)?.type !== 'ConditionalExpression'
      && peelWrappers(declarator.init)?.type !== 'LogicalExpression') return 'handled';
    // a value-SELECTING init (a conditional / logical) is the per-branch mirror's shape:
    // an unconditional extraction here would erase the other branch's semantics - EXCEPT
    // a fallback logical whose LEFT detection statically selected (the meta's object
    // resolved through it): the plain-ctor extraction stands and the dead right drops
    // with the residual (`{ from } = Array || Iterator` -> `const from = _Array$from`).
    // ordered AHEAD of the AssignmentPattern bail: a DEFAULTED leaf under a selection
    // belongs to the mirror / the statically-selected extraction exactly like its
    // undefaulted twin - the flat bail left the claim unrendered
    const selecting = peelWrappers(declarator.init);
    if (selecting?.type === 'ConditionalExpression' || selecting?.type === 'LogicalExpression') {
      const left = staticallySelectedLeft({ selecting, meta, metaPath, soleBinding, chain, adapter, kind });
      if (left) {
        // the init dies with a SOLE binding, so its claims are consumed; a surviving
        // residual keeps reading it and its own claims must still render
        // ... but an init carrying OBSERVABLES keeps its claims live: the drain re-emits the
        // whole selection as a discarded statement, and that spelling is the collapsed one
        if (soleBinding && !mayHaveSideEffects(declarator.init)) {
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
      // the ternary mirror declines outright, like the text emitter
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
        routeSelectionMirror(metaPath, handlePerBranch);
        return 'handled';
      }
    }
    if (prop.value.type === 'AssignmentPattern' && !defaultedIdent) return 'handled';
    if (chain.length > 0 && kind === 'instance') return 'handled';
    recordJob({
      hostPath: exported ? declarationPath.parentPath : declarationPath,
      job: {
        prop, pattern, chain, kind, entry, hintName, declarator,
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
        // the SOURCE spine had a call root: its read is the source's own, so a full consume
        // re-emits it as a throw probe. asked here - by drain time the nav has collapsed
        callRootedInit: navSpineHasCall(declarator.init),
        seqRootWrite: initSeqRootHasKeptWrite(declarator.init),
        // ... and the same timing for a KEY effect buried in the spine: it rides the extraction's
        // own sequence, where the source ran it - inside the read, not ahead of it
        buriedKeyEffect: navSpineHasComputedKeyEffect(declarator.init),
        keyClaimInit: buriedKeyClaimInit(declarator.init),
        seqDirectClaimInit: initSeqDirectClaim(declarator.init),
        rawKeyRootInit: initRawKeyOnRoot(declarator.init),
        // ... and the same timing for the guard the discarded read renders through
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        // ... and the SEALED shape of the same read, for the same reason
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
      },
    });
    return 'handled';
  }

  // the for-init array-wrap registration, extracted for its size - see the arrayHost branch
  function registerForInitWrapJob({
    metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostPatternPath, symbolProp,
  }) {
    const wrap = resolveArrayWrappedReceiver(hostPatternPath,
      kind === 'instance' || symbolProp ? null : { scope: metaPath.scope, adapter, path: metaPath },
      { allowForInit: true });
    if (!wrap?.host?.forInit || !wrap.single || prop.value.type !== 'Identifier') return false;
    // a REST-kept prop renames to `_unused` and the residual re-reads its init in place, so
    // only a receiverless STATIC qualifies - an instance extraction would read it a second
    // time (a multi-declarator head extracts too: babel plants the sibling ahead of the
    // jobbed declarator)
    if (sentinel && kind === 'instance') return false;
    const value = buildValue({
      kind, entry, hintName, receiverNode: wrap.element, prop,
      nested: chain.length > 0, chainKeys: hopChainKeys(chain), metaPath,
    });
    if (!value) return false;
    recordJob({
      hostPath: wrap.declarationPath,
      job: {
        prop, pattern, chain, sentinel, declarator: wrap.declarator, local: propLocalName(prop), value,
        host: 'for-init', metaPath, arrayWrapSink: true, sinkKeep: mayHaveSideEffects(wrap.declarator.init),
      },
    });
    return true;
  }

  // the bodyless-slot registration, extracted for its size - see drainBodylessDeclaration
  function registerBodylessDeclJob({
    host, kind, entry, hintName, prop, pattern, chain, sentinel, metaPath, initNode = null,
  }) {
    // the bodyless slot extracts every resolvable prop; an INSTANCE read requires a
    // reusable receiver (the extraction re-reads it), a SENTINEL (SE key / rest) keeps
    // its renamed residual beside the extractions
    let initValue = peelWrappers(initNode ?? host.declarator.init);
    // an SE SEQUENCE init lifts its prefix as block statements; only the TAIL is the
    // receiver and must be quiet (`(eff('a'), globalThis)` -> `eff('a'); var from = ...`)
    let seqPrefix = null;
    if (initValue?.type === 'SequenceExpression') {
      seqPrefix = initValue.expressions.slice(0, -1);
      initValue = peelWrappers(initValue.expressions.at(-1));
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
            && patternBindingCount(host.declarator.id) === patternBindingCount(prop.value),
          initEvaluatesOnce = kind === 'instance'
            && (soleConsume || (sentinel && prop.computed && computedKeyHasSideEffects(prop))),
          // ... and a MEMO bounds any other instance shape the same way: the init evaluates in
          // the `_ref` declaration alone - the extraction dispatches on the ref, a surviving
          // residual reads the same ref (`if (c) var { at, ...rest } = getObj();` -> the block
          // memo - babel's shape)
          memoBoundsInit = kind === 'instance' && !chain.length && !soleConsume;
    const nestedReceiver = kind === 'instance' && chain.length
      ? resolveNestedReceiverNode(metaPath) : null;
    if (kind === 'instance' && chain.length && !isReReferenceableReceiver(nestedReceiver)) return;
    // a resolved ELEMENT living inside the init memoizes when a residual survives: the memo
    // holds the element, the kept init reads the ref in its slot, and the dispatch shares
    // the identity (`{ a, y: { flat: m } } = { a: se(), y: [3, [1, 2]] }` -> the block memo)
    const nestedMemoNode = nestedReceiver && nodeHoldsSubtree(initValue, nestedReceiver)
      && !mayHaveSideEffects(nestedReceiver) ? nestedReceiver : null;
    if ((prop.value.type !== 'Identifier' && !defaulted)
      || (mayHaveSideEffects(initValue) && !initEvaluatesOnce && !memoBoundsInit && !nestedMemoNode)) return;
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
    const guardRef = defaulted ? injector.generateDeclaredRef(metaPath) : null,
          defaultNode = defaulted ? prop.value : null;
    // a LITERAL receiver memoizes (`var _ref = [1, 2, 3];` - the residual and the
    // dispatch share the one identity); a reusable identifier - or a resolved hop node, which
    // the walk proved re-referenceable - re-reads inline
    // ... and so does a SOLE consume (above): with the whole pattern gone there is no second
    // reader for the memo to serve, and the dispatch spells the init itself
    const dispatchReceiver = nestedReceiver ?? initValue,
          needsMemo = kind === 'instance' && !reusableInit && !soleConsume
            && (!nestedReceiver || !!nestedMemoNode);
    recordJob({
      hostPath: host.declarationPath,
      job: {
        prop, pattern, chain, sentinel, declarator: host.declarator, declaration: host.declaration,
        local: propLocalName(prop), host: 'bodyless-decl', needsMemo, seqPrefix, initTail: initValue,
        nestedMemoNode,
        // the ARRAY-wrapped host keeps its wrapper: the quiet tail replaces the ELEMENT,
        // not the whole init
        initHost: initNode ?? null,
        defaulted,
        value: kind !== 'instance'
          ? () => guardedSlotValue(identifier(injectPureImport(entry, hintName)), defaultNode, guardRef)
          : needsMemo
            ? ref => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)), [identifier(ref)]), defaultNode, guardRef)
            : () => guardedSlotValue(
              callExpression(identifier(injectPureImport(entry, hintName)), [cloneNode(dispatchReceiver)]), defaultNode, guardRef),
      },
    });
  }

  function handleDeclaratorHost({ metaPath, meta = null, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    // a pattern a per-branch mirror already owns is spelled whole by its literal - an extraction
    // here would bind the same leaf a second time and lift the branch as a bare statement
    const host = classifyDeclarationHost(hostParent);
    if (!host || chain.some(level => branchMirrorPatterns.has(level.outerPattern))) return;
    if (takesInlineDefault({ host, prop, pattern, chain, kind, sentinel, adapter, injectorState })) {
      return applyInlineDefault({
        prop, entry, hintName, injectPureImport, markRewrite, skippedNodes, markSubtreeSkipped,
      });
    }
    if (host.bodyless) return registerBodylessDeclJob({
      host, kind, entry, hintName, prop, pattern, chain, sentinel, metaPath,
    });
    const { declarator, declarationPath, declaration, forInit, exported } = host;
    // a literal / wrapper receiver resolves through the shared nested walk (`{ y: { [S]: it } }
    // = { y: arr }` extracts `_gim(arr)`, the hop keys consumed positionally); the SE-free
    // single-read relaxation only where the extraction is the receiver's ONLY read - a
    // sentinel residual re-reads the init
    const allProxyInit = allProxySelectingInit(declarator.init, { adapter, injectorState }),
          symbolPatternProp = entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern';
    let { sentinelMemoEligible, memoSibling } =
      planSentinelMemo({ sentinel, declarator, metaPath, adapter, kind, allProxyInit });
    // a for-init SENTINEL needs a receiver the residual can read a second time: the memo
    // gives it one, and a bare IDENTIFIER init already is one (`{ at, ...rest } = arr` ->
    // `at = _at(arr), { at: _unused, ...rest } = arr`)
    if (forInit && sentinel && !sentinelMemoEligible && kind === 'instance'
      && peelWrappers(declarator.init)?.type !== 'Identifier') return;
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
    const pureNav = (forInit || seLiftedHopNav({ forInit, chain, declarator, prop })
      ? isPureNavAfterSePrefix(declarator.init) : isPureNavReceiver(declarator.init))
      || allProxyInit;
    const literalRoute = planLiteralRoute({ metaPath, prop, sentinel, chain, declarator, declaration, pureNav });
    const { soleBinding, relaxedReceiver } = literalRoute;
    let { literalReceiver } = literalRoute;
    // a SENTINEL-kept flat prop over a single-declarator CONSTANT literal re-reads the
    // literal directly (`{ [(se, 'flat')]: m } = [1, P]` -> `const m = _flat([1, P]);` +
    // the `_unused` residual - babel re-emits, no memo); multi-declarator keeps the memo
    if (sentinel && !literalReceiver && !pureNav && chain.length === 0 && !forInit
      && declaration.declarations.length === 1
      && (declarator.init?.type === 'ArrayExpression' || declarator.init?.type === 'ObjectExpression')
      && isReReferenceableReceiver(declarator.init)) {
      literalReceiver = declarator.init;
      sentinelMemoEligible = false;
      memoSibling = false;
    }
    // a sentinel KEEPS the declarator (and its init) alive, so the discard-safety proof is
    // not needed there; the instance value builder still bounds receiver reads on its own
    if ((chain.length > 0 && (kind === 'instance' && entry !== 'get-iterator-method' && !literalReceiver
      // an ANCHORED symbol prop keeps its key-swap instead of extracting when the extraction
      // would change what the slot answers: a DEFAULT fires on the raw read's undefined, which
      // the helper result need not be, and an SE KEY has no slot outside the kept key
      // ... and a SIBLING hop makes the host an anchored residual of its own: the symbol prop
      // rides it re-keyed rather than leaving (`{ Map: { [S]: a }, Object: { fromEntries } }`)
      || (entry === 'get-iterator-method'
        && (prop.value.type === 'AssignmentPattern' || computedKeyHasSideEffects(prop)
          || declarator.id?.properties?.length > 1))))
      // ... and a symbol-PATTERN prop beside a SIBLING DECLARATOR stays native whatever its
      // depth: its extraction would have to split the declaration, and babel splits none -
      // the inner defaults render in place and the source destructure keeps its slot read
      || (symbolPatternProp && declaration.declarations.length > 1)) return;
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
    if (!sentinel && !literalReceiver && !pureNav
      && !(forInit && chain.length === 0
        && patternBindingCount(declarator.id) === patternBindingCount(prop.value))) {
      const opaque = routeOpaqueInit({
        metaPath, meta, kind, entry, hintName, prop, pattern, chain, declarator, declarationPath,
        forInit, exported, soleBinding,
      });
      if (opaque === 'handled') return;
      ({ literalReceiver, forInitLiteral } = opaque);
    }
    // the ctor-alias registration is independent of the extraction: the destructured
    // local holds the surface ctor whether or not a value renders (`{ Array } = globalThis`
    // keeps the destructure, later `Array.from` still resolves through the alias)
    if (kind === 'global' && hintName && prop.value.type === 'Identifier') {
      registerExtractAliases({ metaPath, kind, entry, hintName, prop, declaration, declarationPath });
    }
    const literalPlan = planLiteralKeepKey({
      kind, entry, sentinel, declarator, declaration, soleBinding, forInit,
      literalReceiver: forInitLiteral ? null : literalReceiver, relaxedReceiver, exported,
      // ... and an ALL-PROXY SELECTING init is re-readable the same way a bare proxy root is:
      // every branch names the same surface, so the sibling needs no kept key
      symbolPatternResidual: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern'
        && pattern.properties.length > 1 && !allProxyInit
        && !findProxyGlobal(declarator.init, { scope: metaPath.scope, adapter, path: metaPath }),
      allProxyInit,
    });
    if (!literalPlan) return;
    let { keepKey, memoRecv, siblingAppend } = literalPlan;
    memoRecv ??= planNavReceiverMemo({ pureNav, sentinel, forInit, exported, chain, kind, entry, declarator, pattern });
    // the sentinel memo's name mints HERE, ahead of the claim's own guard ref that `buildValue`
    // is about to take: babel allocates the receiver memo first and the guards read it after
    eagerSentinelMemoName({
      keepKey, memoRecv, kind, forInit, prop, declarator, allProxyInit,
      firstDeclarator: declaration?.declarations?.[0] === declarator,
    }, sentinelMemoNames, mintRefName);
    const catchBorn = !!relocatedCatchPattern(hostParent),
          chainKeys = hopChainKeys(chain);
    let value = buildValue({
      kind, entry, hintName,
      receiverNode: memoRecv ? (memoRecv.ident ?? identifier(memoRecv.refName))
        : literalReceiver ?? (allProxyInit ? firstProxyBranch(declarator.init) : declarator.init), prop,
      nested: !literalReceiver && chain.length > 0, chainKeys, metaPath,
      literalRoute: (!!literalReceiver && !memoRecv) || sentinelMemoEligible,
      liveReceiver: memoRecv || literalReceiver || allProxyInit ? null : () => declarator.init,
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
        prop, pattern, chain, sentinel: keepKey, exported, declarator, local: propLocalName(prop), value, collapseLeafName,
        eagerMemoName: sentinelMemoNames.get(declarator) ?? null,
        metaPath, sinkDrop: forInit && sinkDropsReceiver(declarator.init, metaPath, adapter),
        sinkKeep: forInit && mayHaveSideEffects(declarator.init),
        // the sink's re-read target resolves on the PRISTINE tree, like every other memo arg -
        // asked only of a MULTI-HOP nav that survives the sink, the one shape whose root the
        // walk would otherwise respell as its own hop pure (`_self.Array` for `_globalThis.Array`)
        sinkPlan: forInit && peelWrappers(peelWrappers(declarator.init)?.object)?.type === 'MemberExpression'
          && !sinkDropsReceiver(declarator.init, metaPath, adapter)
          && patternBindingCount(declarator.id) === patternBindingCount(prop.value)
          ? planMemoArg(declarator.init, metaPath) : null,
        symbolPattern: entry === 'get-iterator-method' && prop.value.type === 'ObjectPattern',
        defaulted: prop.value.type === 'AssignmentPattern',
        // the shape of the read a full consume discards, planned on the PRISTINE tree: by drain
        // time the walk has collapsed the nav and the probe's own question is unanswerable
        initProbePlan: planDiscardedInitProbe(declarator.init, metaPath, { adapter, resolvePure }),
        sealedProbePlan: planSealedNavProbe(declarator.init, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
        seKey: prop.computed && computedKeyHasSideEffects(prop),
        readsReceiver: kind === 'instance',
        seLifted: seLiftedHopNav({ forInit, chain, declarator, prop }),
        catchBorn,
        memoRecv, siblingAppend, memoSibling,
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

  // ctor alias, the text emitter's trust-register twin: the drain swaps the value in
  // place, and the registered hint is what lets a later read resolve through the alias
  // (`const { self: { Symbol: S } } = globalThis; obj[iterator]` folds off `S`'s hops) -
  // babel reaches the same via its in-place rewrite, which the walk-time judges then see
  // a MULTI-prop pattern whose receiver an extraction actually reads hoists the collapsed
  // nav once (`const _ref = _globalThis.Array; const it = _gim(_ref); ...` - babel's
  // shape); a single prop reads the collapsed spelling inline, and a pure-ctor leaf
  // (`_Promise`) stays reusable inline too
  function planNavReceiverMemo({ pureNav, sentinel, forInit, chain, kind, entry, declarator, pattern }) {
    // an EXPORTED host is no obstacle: the memo lands as its own plain declaration ahead of
    // the extractions, which keep the export wrapper each
    if (!pureNav || sentinel || forInit || chain.length !== 0) return null;
    if (kind !== 'instance' && entry !== 'get-iterator-method') return null;
    if (peelWrappers(declarator.init)?.type !== 'MemberExpression' || pattern.properties.length <= 1) return null;
    if ((resolveProxyNavReceiver(peelWrappers(declarator.init))?.() ?? declarator.init)?.type !== 'MemberExpression') return null;
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
          injector: injectorState, adapter, kind: declaration.kind, localName, hint: hintName,
          stmtPath: declarationPath, bindingNode: aliasBinding.node, binding: aliasBinding,
        });
      }
    } else if (kind !== 'global' && entry
      && (prop.value.type === 'Identifier' || prop.value.type === 'AssignmentPattern')) {
      injectorState?.registerBodyExtractAlias?.(propLocalName(prop), entry, metaPath.scope?.getBinding?.(propLocalName(prop)));
    }
  }

  function handleAssignmentHost({ metaPath, kind, entry, hintName, prop, pattern, chain, sentinel, hostParent }) {
    // a DEFAULTED instance prop whose computed KEY carries an effect keeps the babel
    // overwrite channel: the destructure stays whole so the key runs where the source runs
    // it, and the ponyfill re-binds after. a plain key takes the `=== void 0` guard cascade
    if (prop.value.type === 'AssignmentPattern' && kind === 'instance' && computedKeyHasSideEffects(prop)) {
      return registerSeKeyDefaultOverwrite({ prop, chain, entry, hintName, hostParent },
        { injectPureImport, markRewrite, recordJob, injector });
    }
    // only a statement-position assignment whose value nobody reads: a captured result
    // (`x = ({ from } = Array)`) keeps the full object flowing - staged. oxc preserves the
    // grouping parens the spelling requires, so the climb peels them
    let exprStmtPath = hostParent.parentPath;
    while (exprStmtPath && (exprStmtPath.node?.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(exprStmtPath.node?.type))) {
      exprStmtPath = exprStmtPath.parentPath;
    }
    // ... but a SHORTHAND flat prop keeps the whole destructure: the binding it writes is the
    // key's own name, and babel leaves that line spelled as the source wrote it
    const seqHostStatement = exprStmtPath?.node?.type !== 'ExpressionStatement'
            && (chain.length > 0 || !prop.shorthand) && discardedSequenceElement(hostParent)
            ? hostStatementOf(hostParent) : null,
          bodyless = !seqHostStatement
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
    // the declarator host's decline (babel and the text leg both mirror; the extraction
    // route discards the selection and drags the substituted root in as a dead import)
    if (kind !== 'instance' && chain.length > 0
      && SELECTING_INIT_TYPES.has(peelWrappers(hostParent.node.right)?.type)
      && !allProxySelectingInit(hostParent.node.right, { adapter, injectorState })) {
      routeSelectionMirror(metaPath, handlePerBranch);
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
    if (kind === 'instance' && chain.length > 0 && entry !== 'get-iterator-method') {
      const bindingId = propBindingIdentifier(prop.value);
      const copyReceiver = bindingId && resolveNestedReceiverNode(metaPath, { allowSePeeledFragment: true });
      if (copyReceiver && isReReferenceableReceiver(copyReceiver)) {
        const id = injectPureImport(entry, hintName);
        markRewrite();
        recordJob({ hostPath: exprStmtPath,
          job: { host: 'assign-overwrite', local: bindingId.name, bodyless,
            value: () => callExpression(identifier(id), [duplicateReceiver(copyReceiver, injector)]) } });
        return;
      }
      if (bodyless) return;
    }
    // an opaque receiver still consumes when the extraction is its ONLY read: a sole
    // plain prop, instance kind (the dispatch reads once - `mapOfKept = _mapMaybeArray(X ?? {})`)
    // or an SE-free receiver a static may discard
    // an ALL-proxy selecting RHS reads like a plain proxy receiver: every LIVE branch lands
    // on the same surface, so the claim extracts off the first and the selection drops whole
    const allProxyRhs = allProxySelectingInit(hostParent.node.right, { adapter, injectorState }),
          pureNavRhs = allProxyRhs || isPureNavReceiver(hostParent.node.right),
          // the read a full consume DISCARDS, planned on the PRISTINE tree: by drain time the
          // walk has rendered the guard and the probe's own question is unanswerable
          initProbePlan = planDiscardedInitProbe(hostParent.node.right, metaPath, { adapter, resolvePure });
    // a BODYLESS host with an SE SEQUENCE init lifts its prefix into the wrapping block
    // (`if (x) ({ Map: { g } } = (eff(), globalThis));` -> `{ eff(); g = _Map$groupBy; }`);
    // the receiver is the quiet TAIL
    let bodylessSeqPrefix = null,
        receiverNode = allProxyRhs ? firstProxyBranch(hostParent.node.right) : hostParent.node.right;
    // the STATEMENT host lifts the same prefix as its own statements ahead
    // (`sideEffect(); from = _Array$from;` - babel's flatten); a SENTINEL residual then
    // reads the quiet tail
    const liftPlan = pureNavRhs ? null : planLiftedRhsPrefix(hostParent.node.right,
      { anchorsInSequence: !!seqHostStatement && prop.value?.type === 'ObjectPattern' });
    if (liftPlan) {
      bodylessSeqPrefix = liftPlan.prefix;
      receiverNode = liftPlan.receiver;
    }
    // an SE-carrying NAV receiver (`({ from: from2 } = (eff3(), globalThis).Array)`): a
    // SOLE full consume lifts the receiver WHOLE as its own statement - claims land in
    // place, the assign reads the pure (`(eff3(), _globalThis).Array; from2 =
    // _Array$from;`, babel's flatten); multi-prop and residual shapes stay staged
    if (!pureNavRhs && !bodylessSeqPrefix && !sentinel
      && pattern.properties.length === 1 && prop.value.type === 'Identifier' && kind !== 'instance'
      && classifyCallBranchForSynth({
        inner: peelWrappers(hostParent.node.right), scope: metaPath.scope, adapter, path: metaPath,
      }).callBranch) {
      bodylessSeqPrefix = [hostParent.node.right];
    }
    const soleConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length === 1 && prop.value.type === 'Identifier'
            && (kind === 'instance' || !mayHaveSideEffects(hostParent.node.right)),
          // a MULTI-prop instance consume rides the same literal route: several dispatches
          // (and any surviving residual) read ONE receiver, which the drain memoizes
          // (`({ at, includes } = [1, 2, 3])` -> `const _ref = [1, 2, 3]; at = _atMaybeArray(_ref); ...`)
          multiInstanceConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length > 1 && prop.value.type === 'Identifier' && kind === 'instance'
            && !bodyless,
          // an SE-keyed INSTANCE prop over a CONSTANT literal keeps its raw residual (the key
          // effect runs in place) and the overwrite re-spells the literal
          // (`a = _atMaybeArray([3, [7]])` - the text emitter's shape, no memo)
          seKeyLiteralOverwrite = !pureNavRhs && !bodylessSeqPrefix && sentinel && chain.length === 0
            && kind === 'instance' && prop.value.type === 'Identifier'
            && prop.computed && computedKeyHasSideEffects(prop)
            && isConstantLiteralReceiver(peelWrappers(hostParent.node.right)),
          // a receiverless STATIC in a MULTI-prop consume rides along: the memo (or the kept
          // RHS statement) evaluates the init, and the static spells its own pure
          // (`({ of, name, from } = seCall())` -> `of = _Array$of; name = _name(_ref); ...`)
          staticInMultiConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length === 0
            && pattern.properties.length > 1 && prop.value.type === 'Identifier' && kind !== 'instance'
            && !bodyless && !seqHostStatement,
          // a NESTED receiver-less claim over a literal RHS consumes the destructure whole: the
          // statement becomes the plain re-bind (`({ a: { from: f } } = { a: Array })` ->
          // `f = _Array$from`), the discarded literal observing nothing
          // ... and a GUARDED nav receiver consumes the same way, whatever its depth: the read the
          // consume discards re-emits as the extraction's own probe prefix, and the live branch is
          // a pure binding the value reads directly (`v = ((null == _g.window ? void 0 : _self).Math,
          // _Math$sign)`)
          guardedPureRhs = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
            && kind !== 'instance' && prop.value.type === 'Identifier' && pattern.properties.length === 1
            && !!initProbePlan;
    // ... and a SENTINEL residual keeps the receiver SPELLED, so a live `?.` in it is no
    // obstacle: the walk renders that nav as its guard in place and the slot still takes the
    // inline default (`({ [(k(), 'keys')]: v = _Object$keys } = null == _g.window ? ... )`)
    const sentinelGuardedRhs = !pureNavRhs && sentinel && chain.length === 0 && kind !== 'instance'
            && prop.value.type === 'Identifier'
            && (!!initProbePlan
              || !!planSealedNavProbe(hostParent.node.right, metaPath, probeRenderCtx)),
          nestedLiteralConsume = !pureNavRhs && !bodylessSeqPrefix && !sentinel && chain.length > 0
      && kind !== 'instance' && prop.value.type === 'Identifier'
      && pattern.properties.length === 1 && !mayHaveSideEffects(hostParent.node.right)
      && !!resolveNestedReceiverNode(metaPath, {});
    // ... and a DEFAULTED nested leaf over an OPAQUE receiver has no slot for its default: the
    // overwrite spells the dispatch alone, and one answering undefined would skip the default the
    // source wrote (`({ codes: { findIndex: m = d() } } = recvF)` stays native)
    if ((!pureNavRhs && !soleConsume && !multiInstanceConsume && !seKeyLiteralOverwrite
      && !staticInMultiConsume
      && !bodylessSeqPrefix && !nestedLiteralConsume && !guardedPureRhs && !sentinelGuardedRhs)
      || (chain.length > 0 && prop.value.type === 'AssignmentPattern' && !nestedLiteralConsume
        && !resolveProxyNavReceiver(peelWrappers(receiverNode)))) return;
    const chainKeys = hopChainKeys(chain);
    const value = buildValue({
      kind, entry, hintName, receiverNode, prop, nested: chain.length > 0, chainKeys, metaPath,
      literalRoute: soleConsume || multiInstanceConsume || seKeyLiteralOverwrite,
      liveReceiver: receiverNode === hostParent.node.right ? () => hostParent.node.right : null,
    });
    if (!value) return;
    // the assignment-form twin of the declarator-host registrations: the ctor hint / fold
    // source is what lets a later read resolve through the extracted alias
    registerAssignmentExtractAlias({ prop, kind, entry, hintName, hostParent, exprStmtPath, metaPath },
      { adapter, injectorState });
    markRewrite();
    const keepSentinelBinding = sentinel && !hasRestSibling(pattern) && prop.value.type === 'Identifier'
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
    // re-reads the member in the residual and the overwrite would read it again - the text
    // emitter declines the same shape (a CONSTANT literal re-spells freely instead, below)
    if (keepSentinelBinding && kind === 'instance' && prop.computed && computedKeyHasSideEffects(prop)
      && peelWrappers(hostParent.node.right)?.type === 'MemberExpression') return;
    // an SE-keyed SYMBOL prop under an ANCHORED hop keeps the key-swap ALONE: the kept key
    // already reads through the polyfilled symbol, and a re-bind would render the claim
    // twice (the text emitter's own stand-down); the PLAIN assignment keeps its overwrite
    if (keepSentinelBinding && entry === 'get-iterator-method' && chain.length > 0
      && prop.computed && computedKeyHasSideEffects(prop)) return;
    const job = {
      prop, pattern, chain, sentinel, bodyless, local: propLocalName(prop), value,
      host: seqHostStatement ? 'assign-seq' : 'assignment',
      assignment: hostParent.node, seqPrefix: bodylessSeqPrefix,
      // an INSTANCE extraction re-READS the receiver - two reads of an unreusable one need
      // the memo the declaration form already mints
      readsReceiver: kind === 'instance',
      // the same pristine verdict the declaration host takes: an effectful computed key read
      // off the ROOT is the read the source performed, and the consume discards it
      rawKeyRootInit: initRawKeyOnRoot(hostParent.node.right),
      seqHostStatement, metaPath,
      // the shape of the read a full consume DISCARDS, planned on the PRISTINE tree - the
      // declaration host's own pair, asked of the assignment's right
      initProbePlan,
      sealedProbePlan: planSealedNavProbe(hostParent.node.right, metaPath, { adapter, resolvePure, keepLive: skippedNodes.keepLive }),
      mintedSentinels: [],
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
    // an assignment-position sentinel writes an undeclared name: the drain plants its
    // `var _unusedN;` immediately before the rewritten statement, babel's shape
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
    recordJob({ hostPath: seqHostStatement ? hostParent : exprStmtPath, job });
  }

  // a pure member nav rooted in a POSSIBLE-GLOBAL identifier, rendered via the shared
  // passthrough resolution; null when the receiver is not that shape
  function resolveProxyNavReceiver(receiver) {
    let keys = [];
    let cur = receiver;
    while (cur?.type === 'MemberExpression' && !cur.optional && plainNavHopKey(cur) !== null) {
      keys.unshift(plainNavHopKey(cur));
      cur = peelWrappers(cur.object);
    }
    if (!keys.length || keys.some(key => !key) || cur?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(cur.name)) return null;
    // leading pristine possible-global hops are pure navigation into the same surface - the
    // kept-root canon drops them (`globalThis.self.Array` reads as root + ['Array'])
    while (keys.length > 1 && isPristineProxyGlobal(adapter, keys[0])) keys = keys.slice(1);
    const ref = resolvePassthroughRef({
      keyPath: keys,
      receiverName: cur.name,
      receiverIsProxy: true,
      resolveGlobalPolyfill,
      isMutatedStatic: (object, key) => adapter.isMutatedStatic(object, key),
    });
    return () => {
      let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      for (const key of ref.path) base = memberFromKeyName(base, key);
      return base;
    };
  }

  // the extracted binding's value: a static / global claim is the import binding itself;
  // an instance claim is the method lookup over the (reusable) receiver. a DEFAULT on the
  // prop keeps native-miss semantics at the top level (`_Symbol === void 0 ? d : _Symbol`,
  // the instance form through a memo ref); a default under the nested flatten drops - the
  // extracted static always wins there, exactly babel's split
  function buildValue({
    kind, entry, hintName, receiverNode, prop, nested, chainKeys, metaPath,
    memoJoin = false, literalRoute = false, liveReceiver = null, reusedReceiver = false,
  }) {
    const withDefault = prop.value.type === 'AssignmentPattern' && !nested;
    if (kind === 'instance') {
      let receiver = peelWrappers(receiverNode);
      // a lifted SE prefix leaves the TAIL as the nav (the prefix runs as its own statement)
      if (receiver?.type === 'SequenceExpression') receiver = peelWrappers(receiver.expressions.at(-1));
      // the SPELLED receiver keeps its TS cast (`_atMaybeArray(arr as number[])` - babel's
      // memo canon); only parens are printer trivia
      let receiverSpelling = receiverNode;
      while (receiverSpelling?.type === 'ParenthesizedExpression') receiverSpelling = receiverSpelling.expression;
      // ... and where the RESIDUAL re-reads it, an init that peels to a bare identifier is
      // freely re-referenceable: both reads spell the identifier, not the wrapper the source
      // put around it (`{ [(k(), 'at')]: a, other } = arr as any` - one lone read keeps it)
      if (reusedReceiver && (receiver?.type === 'Identifier' || receiver?.type === 'ThisExpression')) {
        receiverSpelling = receiver;
      }
      // a literal-route receiver was already proved single-read / re-referenceable by the
      // shared canon walk - the nav gate below is for raw declarator inits
      if (literalRoute && !withDefault) {
        const literalId = injectPureImport(entry, hintName);
        return override => callExpression(identifier(literalId),
          [override ? identifier(override) : duplicateReceiver(receiverSpelling, injector)]);
      }
      // a pure member nav qualifies like a bare name: the lookup reads it once. a nav off a
      // PROXY-GLOBAL root renders through the canonical passthrough resolution - the pure
      // ctor when one exists (`_Promise`), else the proxy member read (`_globalThis.navigator`) -
      // because the detection may have claimed the nav for the destructure and suppressed the
      // in-place substitution the clone would otherwise carry
      if (!literalRoute && !isPureNavReceiver(receiver)) return null;
      const proxyNav = resolveProxyNavReceiver(receiver);
      // a DEFAULTED prop over a proxy-global receiver stays in the residual (the ordinary
      // key / receiver substitution serves it) - babel extracts the guarded form only off
      // a plain reusable receiver
      if (proxyNav) {
        if (withDefault) return null;
        const id0 = injectPureImport(entry, hintName);
        // the passthrough exists because the in-place substitution may have been SUPPRESSED
        // for this nav - but when the tree shows it DID run (a claim on the leaf rendered its
        // own dispatch), that rewrite is the authoritative spelling and the re-render would
        // ship the raw member instead (`{ name } = self.Array.prototype.at`)
        return override => callExpression(identifier(id0), [override ? identifier(override)
          : liveReceiver && liveReceiver() !== receiverNode ? cloneNode(liveReceiver()) : proxyNav()]);
      }
      // a BARE pristine proxy-global receiver substitutes its pure binding: the clone is
      // built after the traversal, so the ordinary identifier claim never reaches it
      // (!nested: hop chains resolve through the passthrough below, keys intact)
      // ... and a bare CTOR receiver substitutes the same way - the resolution already proved
      // the identifier IS that global, and a raw `Map` here reads a binding the engine may
      // not have (`{ [Symbol.iterator]: it } = Map` -> `_getIteratorMethod(_Map)`)
      const barePure = !nested && receiver?.type === 'Identifier'
        && (isPristineProxyGlobal(adapter, receiver.name)
          || (!adapter.getBinding(metaPath.scope, receiver.name, metaPath)
            && !isMutatedGlobalSlot(adapter, receiver.name)))
        ? resolveGlobalPolyfill(receiver.name) : null;
      if (barePure) {
        if (withDefault) return null;
        const id1 = injectPureImport(entry, hintName);
        const recvId = injectPureImport(barePure.entry, barePure.hintName);
        return override => callExpression(identifier(id1), [identifier(override ?? recvId)]);
      }
      const id = injectPureImport(entry, hintName);
      if (nested) {
        // the symbol leaf under hop props: its receiver is the RESOLVED hop nav - the pure
        // ctor when one exists (`_Map`), else the proxy member read (`_globalThis.Array`);
        // leading pristine proxy hops are pure navigation into the same surface and drop
        // (`{ self: { [S]: it } } = globalThis` reads `_gim(_globalThis)`)
        if (receiver?.type !== 'Identifier' || !chainKeys?.length) return null;
        let hopKeys = chainKeys;
        if (POSSIBLE_GLOBAL_OBJECTS.has(receiver.name)) {
          while (hopKeys.length && isPristineProxyGlobal(adapter, hopKeys[0])) hopKeys = hopKeys.slice(1);
        }
        if (!hopKeys.length) {
          const rootPure = resolveGlobalPolyfill(receiver.name);
          if (!rootPure) return null;
          const rootId = injectPureImport(rootPure.entry, rootPure.hintName);
          return () => callExpression(identifier(id), [identifier(rootId)]);
        }
        const ref = resolvePassthroughRef({
          keyPath: hopKeys,
          receiverName: receiver.name,
          receiverIsProxy: POSSIBLE_GLOBAL_OBJECTS.has(receiver.name),
          resolveGlobalPolyfill,
          isMutatedStatic: (object, key) => adapter.isMutatedStatic(object, key),
        });
        return () => {
          let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
          for (const key of ref.path) base = memberFromKeyName(base, key);
          return callExpression(identifier(id), [base]);
        };
      }
      if (!withDefault) {
        return override => callExpression(identifier(id),
          [override ? identifier(override) : duplicateReceiver(receiverSpelling, injector)]);
      }
      // a literal-route receiver is single-read (the residual died): the dispatch may hold
      // any expression; other receivers must be re-readable tokens
      if (receiver?.type !== 'Identifier' && receiver?.type !== 'ThisExpression' && !literalRoute) return null;
      const ref = memoJoin ? mintRefName() : injector.generateDeclaredRef(metaPath);
      // the VALUE node is captured (a sentinel rename detaches it from the prop before the
      // drain), but `.right` reads LAZILY: the walker's later in-place rewrites replace the
      // default THROUGH that slot, and the moved node must carry them - never a clone
      const valueNode = prop.value;
      function thunk(override) {
        const recv = override ? identifier(override) : duplicateReceiver(receiverSpelling, injector);
        return conditionalExpression(
          binaryExpression('===',
            assignmentExpression('=', identifier(ref), callExpression(identifier(id), [recv])), voidZero()),
          valueNode.right,
          identifier(ref),
        );
      }
      if (memoJoin) thunk.leadRef = ref;
      return thunk;
    }
    const id = injectPureImport(entry, hintName);
    if (!withDefault) return () => identifier(id);
    const staticValueNode = prop.value;
    return () => conditionalExpression(
      binaryExpression('===', identifier(id), voidZero()),
      staticValueNode.right,
      identifier(id),
    );
  }

  function recordJob({ hostPath, job }) {
    const key = hostPath.node;
    if (!ledger.has(key)) ledger.set(key, { hostPath, jobs: [] });
    ledger.get(key).jobs.push(job);
  }

  // render one pattern's synth literal over a receiver: polyfilled slots take their import,
  // the rest read through the receiver (its pure proxy import when it has one) - the
  // caller's own value still wins, the literal only serves the defaulted path
  function renderPatternLiteral({
    plan, receiver, baseName = null, baseIsProxy = false, passthroughPrefix = null, slots,
    requireFullCoverage = false, memoBaseName = null, instanceReceiver = null, metaPath = null,
    sealedProbePlan = null,
  }) {
    const entries = [];
    for (const planEntry of plan) {
      const { key, computed } = synthEntryKey(planEntry, { resolvedSpelling: requireFullCoverage });
      const binding = slots.get(planEntry.dedupKey);
      if (binding) {
        // an INSTANCE slot dispatches on a CLONE of the receiver the literal replaces
        // (`{ at } = [1, 2]` -> `{ at: _atMaybeArray([1, 2]) }`)
        entries.push(objectProperty(key, typeof binding === 'string' ? identifier(binding)
          : callExpression(identifier(binding.helper), [cloneNode(binding.receiver)]), { computed }));
        continue;
      }
      // a memoized receiver: unresolved slots read the memo param (`other: _ref.other`)
      if (memoBaseName) {
        const literalKey = planEntry.keyNode?.type === 'Literal';
        const read = memberExpression(identifier(memoBaseName),
          literalKey ? cloneNode(planEntry.keyNode) : computed ? cloneNode(key) : identifier(planEntry.lookupKey),
          { computed: computed || literalKey });
        entries.push(objectProperty(key, read, { computed }));
        continue;
      }
      // an INSTANCE-synth receiver is re-readable by construction, so an uncovered slot
      // reads through a clone of it (`other: [1, 2].other` - a fresh read, matching the
      // native fresh-value semantics)
      if (instanceReceiver) {
        entries.push(objectProperty(key, memberExpression(cloneNode(instanceReceiver),
          computed ? cloneNode(key) : identifier(planEntry.lookupKey), { computed }), { computed }));
        continue;
      }
      // a `this` receiver is re-readable by construction: an uncovered slot reads through a
      // fresh clone of it (`custom: this.custom` - the static-`this` synth's own passthrough)
      if (receiver?.type === 'ThisExpression') {
        entries.push(objectProperty(key, memberExpression({ type: 'ThisExpression' },
          computed ? cloneNode(key) : identifier(planEntry.lookupKey), { computed }), { computed }));
        continue;
      }
      // a receiver whose navigation SHORT-CIRCUITS cannot be re-read off the collapsed root:
      // that answers a defined value where the source answers undefined. re-read through the
      // SOURCE nav instead, its own root substituted (`(_globalThis.window?.Array).other`)
      // ... unless the LEAF whole-swaps to a pure ctor: that binding is always defined and the
      // read goes through it (`globalThis.window?.Map` -> `_Map.other`)
      const navAliasCtx = metaPath ? { scope: metaPath.scope, adapter, path: metaPath } : null;
      // ... and only a `?.` that can GENUINELY short-circuit: one over a proven root is dead
      // text and the nav collapses like its plain twin
      const navPassthrough = navAliasCtx && receiver && receiverCarriesLiveOptional(receiver)
        && navValueCanShortCircuit(receiver, m => resolvePure(m, metaPath), navAliasCtx)
        && !proxyGlobalMemberCtorPureSwap({
          receiver, aliasCtx: navAliasCtx, resolvePure: m => resolvePure(m, metaPath),
        });
      if (navPassthrough) {
        // the GUARDED collapse when the live `?.` sits over an erasable hop: its object is the
        // probe, its own ponyfill the alternate, the tail hanging back on
        // (`globalThis.window?.self.Object` -> `(null == _globalThis.window ? void 0 : _self.Object)`)
        const navRead = guardedNavPassthrough(receiver, metaPath,
          { adapter, resolveGlobalPolyfill, injectPureImport }) ?? (() => {
          const clone = cloneNode(receiver);
          substituteProxyRootsInClone(clone, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
          // the read sits OUTSIDE the chain the nav carries: fused in, it would short-circuit too
          return chainExpression(clone);
        })();
        entries.push(objectProperty(key, memberExpression(navRead,
          computed ? cloneNode(key) : identifier(planEntry.lookupKey), { computed }), { computed }));
        continue;
      }
      // a nested mirror has no passthrough base (the hop nav was consumed) - every slot
      // must be a polyfill
      if (requireFullCoverage) return null;
      // a SEALED receiver reads through the guard the source's own read performs: the collapsed
      // root would answer a defined value where the seal throws. the plan is the PRISTINE one -
      // by drain time the walk has erased the `?.` this passthrough is about
      // (`customK: (null == _g.window ? void 0 : _self.window).Object.customK`)
      const sealedBase = sealedProbePlan ? renderSealedNavProbe(sealedProbePlan, metaPath, probeRenderCtx) : null;
      if (sealedBase) {
        entries.push(objectProperty(key, memberExpression(sealedBase,
          computed ? cloneNode(key) : identifier(planEntry.lookupKey), { computed }), { computed }));
        continue;
      }
      // passthrough needs a NAMED base to read through; a bare member receiver without one
      // serves only a fully-covered pattern
      const passthroughName = baseName ?? (receiver.type === 'Identifier' ? receiver.name : null);
      if (!passthroughName) return null;
      const ref = resolvePassthroughRef({
        keyPath: [...passthroughPrefix ?? [], planEntry.lookupKey],
        receiverName: passthroughName,
        receiverIsProxy: baseIsProxy || POSSIBLE_GLOBAL_OBJECTS.has(passthroughName),
        resolveGlobalPolyfill,
        isMutatedStatic: (object, dedupKey) => adapter.isMutatedStatic(object, dedupKey),
      });
      let base = ref.pure ? identifier(injectPureImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
      // a string-spelled source key reads back computed with the same literal
      // (`"z": Array["z"]`), and a `[k]`-slot passthrough reads through the same computed
      // identifier (`[k]: Array[k]`) - the babel spellings
      for (const hop of ref.path) {
        if (hop === planEntry.lookupKey && (computed || key.type === 'Literal')) {
          base = memberExpression(base, cloneNode(key), { computed: true });
        } else base = memberFromKeyName(base, hop);
      }
      entries.push(objectProperty(key, base, { computed }));
    }
    return objectExpression(entries);
  }

  // canonical re-read target for a MEMOIZED receiver, peeled to its SE tail - the babel
  // `buildMemoArg` twin: a pure-ctor leaf whole-swaps (the erased navigation's harvested
  // effects re-run ahead of the binding), an alias / proxy chain collapses through the
  // shared plan. resolved at REGISTRATION (pristine tree); null leaves the receiver live
  function planMemoArg(memoReceiver, metaPath) {
    const aliasCtx = { scope: metaPath.scope, adapter, path: metaPath };
    const { prefix, tail } = peelNestedSequenceExpressions(memoReceiver);
    const ctorSwap = proxyGlobalMemberCtorPureSwap({
      receiver: tail, aliasCtx, resolvePure: m => resolvePure(m, metaPath),
    });
    let target = null;
    if (ctorSwap) target = identifier(injectPureImport(ctorSwap.pure.entry, ctorSwap.pure.hintName));
    else {
      const proxyPlan = planProxyReceiver(tail, {
        aliasCtx, throughChainAssign: false, resolvePure: m => resolvePure(m, metaPath),
      });
      if (proxyPlan) target = renderProxyReceiverPlan(proxyPlan, injectPureImport);
    }
    if (!target) return null;
    // the plan's clones detach from the walk before their own claims land: a pristine
    // proxy-global root inside a harvested effect substitutes its pure binding here
    // (`(() => (n++, globalThis))()` -> `(() => (n++, _globalThis))()`)
    substituteClonedProxyRoots(target, metaPath);
    // the harvested se nodes stay LIVE - the keepLive span the registration marks lets
    // their claims land in place during the walk - and the DRAIN clones them, so the memo
    // argument carries the rewritten spelling instead of a pre-claim snapshot (a
    // registration-time clone froze `getObj().at(0)` raw and dropped the claim)
    return { prefix, liveSe: ctorSwap?.se ?? [], target, tail };
  }

  function substituteClonedProxyRoots(root, metaPath) {
    walkAstNodes({
      root,
      visit(node, parent) {
        if (node.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(node.name)) return;
        if (parent && isNonReferencePosition(parent, node)) return;
        if (!isPristineProxyGlobal(adapter, node.name) || adapter.getBinding(metaPath.scope, node.name, metaPath)) return;
        const pure = resolveGlobalPolyfill(node.name);
        if (pure) node.name = injectPureImport(pure.entry, pure.hintName);
      },
    });
  }

  // the memo argument: the planned canonical target behind the receiver's own LIVE prefix
  // effects (their claims landed during the walk), or the live receiver when no plan held
  // markRewrite fires ONLY on a landed mutation: a registration whose drain drops (partial
  // coverage, a failed replace) must leave the engine's ABSTAIN untouched - a spurious mark
  // turns the abstain into a reprint the structural gate then compares strictly
  // every key resolved: no re-read, so the receiver's observable setup rescues AHEAD of the
  // plain literal instead of the memo (`(_at(...), { from: _Array$from })`); harvested from
  // the LIVE tree - the walk's in-place rewrites already landed. true when it rendered
  function renderFlatRescueLiteral(pending) {
    const { plan, receiver, slots, metaPath, branchMirror } = pending;
    const flatLiteral = renderPatternLiteral({ plan, receiver, slots });
    if (!flatLiteral) return false;
    const rescueSource = receiver.type === 'LogicalExpression' ? receiver.left : receiver;
    // ... and in a per-BRANCH mirror a hop whose object is not a bare binding drops too: the
    // literal REPLACES the branch value, so re-emitting the read adds a member access off the
    // ponyfilled root that nothing consumes (`(e(), globalThis).Array` sinks to `e()` alone).
    // a PARAM-default host keeps it - babel spells the read there
    const rescueOverBinding = rescueSource?.type === 'MemberExpression'
      && peelWrappers(rescueSource.object)?.type === 'Identifier';
    // a SEALED left is an observable read the swap erases - it re-emits whole, the way the
    // non-logical twin does (`((null == _globalThis.window ? void 0 : (c5++, _self)).Object, ...)`);
    // every other logical left keeps the harvest, its value being one the literal replaces
    const sealedLeft = receiver.type === 'LogicalExpression' || branchMirror
      ? renderSealedNavProbe(pending.sealedProbePlan, metaPath, probeRenderCtx) : null;
    const rescue = sealedLeft ? [sealedLeft]
      : shouldDropRescueReceiver(rescueSource) || receiver.type === 'LogicalExpression'
      || (branchMirror && !insideParamPosition(metaPath)
        && rescueSource?.type === 'MemberExpression' && !rescueOverBinding)
      ? discardRescueNodes({ node: rescueSource, scope: metaPath.scope, adapter, path: metaPath })
        .map(node => cloneNode(node))
      : [cloneNode(rescueSource)];
    // the clone is built at DRAIN time, past the walk: a proxy root the registration
    // suppressed (its spine was the memo plan's tail) would ship raw, so the clone
    // substitutes it here (`(() => { eff(); return globalThis; })().self.Array`)
    for (const node of rescue) {
      substituteProxyRootsInClone(node, metaPath, { adapter, resolveGlobalPolyfill, injectPureImport });
    }
    const resolved = rescue.length ? sequenceExpression([...rescue, flatLiteral]) : flatLiteral;
    if (replaceNodeInTree(program, receiver, resolved)) {
      markRewrite();
      markSubtreeSkipped(skippedNodes, receiver);
    }
    return true;
  }

  function drainSynthLiterals() {
    // both ledgers are Maps - the entry iteration yields [key, pending] pairs
    for (const [, pending] of [...synthLedger, ...pendingBranchSynths]) {
      const { plan, receiver, baseName, baseIsProxy, leadingEffects, passthroughPrefix, slots, nestedOnly } = pending;
      // the call-branch memo channel: `function (_ref) { return { g: _G$g, other: _ref.other }; }(<recv>)`
      // - the receiver (already claimed in place) runs once as the argument
      if (pending.callBranch) {
        // every key resolved: no re-read, so the receiver's observable setup rescues AHEAD
        // of the plain literal instead of the memo (`(_at(...), { from: _Array$from })`);
        // harvested from the LIVE tree - the walk's in-place rewrites already landed
        if (plan.every(entry => slots.has(entry.dedupKey)) && renderFlatRescueLiteral(pending)) continue;
        // the memo arg RE-PLANS at DRAIN time: an in-place claim REPLACES its node, so a
        // registration-time render (or captured se refs) re-emits pre-claim snapshots -
        // `log.push(...)` reached the arg raw and its injected import died unreferenced
        // with the discarded original. a re-plan that no longer matches (the walk already
        // substituted the roots past its shape checks) keeps the registration target and
        // re-harvests only the LIVE se off the surviving container
        if (pending.memoArgPlan && pending.metaPath) {
          const replanned = planMemoArg(pending.memoReceiver, pending.metaPath);
          if (replanned) pending.memoArgPlan = replanned;
          else if (pending.memoArgPlan.liveSe?.length) {
            pending.memoArgPlan.liveSe = discardRescueNodes({
              node: pending.memoArgPlan.tail, scope: pending.metaPath.scope, adapter, path: pending.metaPath,
            });
          }
        }
        // the param name MINTS at registration (see `registerSimpleSynthSlot`): the pattern is
        // visited before its own init, and babel numbers by that order
        const memoName = pending.memoName ?? mintRefName();
        const synthLiteral = renderPatternLiteral({ plan, receiver, slots, memoBaseName: memoName });
        if (!synthLiteral) continue;
        const iife = callExpression({
          type: 'FunctionExpression', id: null, params: [identifier(memoName)], generator: false, async: false,
          body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: synthLiteral }] },
        }, [buildMemoArg(pending)]);
        if (replaceNodeInTree(program, receiver, iife)) markRewrite();
        continue;
      }
      // merged nested mirrors: one literal per subtree, wrapped up its own hop chain and
      // joined at the top level - rendered only when every outer hop prop registered
      if (pending.nestedTrees) {
        const [{ outerPattern }] = pending.nestedTrees;
        if (outerPattern && outerPattern.properties.length > 1
          && pending.nestedTrees.length !== outerPattern.properties.length) continue;
        const topProps = [];
        for (const tree of pending.nestedTrees) {
          let sub = renderPatternLiteral({ plan: tree.plan, receiver, slots: tree.slots, requireFullCoverage: true });
          if (!sub) {
            topProps.length = 0;
            break;
          }
          for (const key of tree.chainKeys.slice(1).toReversed()) {
            sub = objectExpression([objectProperty(identifier(key), sub)]);
          }
          topProps.push(objectProperty(identifier(tree.chainKeys[0]), sub));
        }
        if (!topProps.length) continue;
        const renderedTree = objectExpression(topProps);
        const consumedBranch = receiver;
        if (replaceNodeInTree(program, receiver, renderedTree)) {
          markRewrite();
          markSubtreeSkipped(skippedNodes, consumedBranch);
        }
        continue;
      }
      let rendered = renderPatternLiteral({
        plan, receiver, baseName, baseIsProxy, passthroughPrefix, slots, requireFullCoverage: nestedOnly,
        instanceReceiver: pending.instanceReceiver ?? null, metaPath: pending.metaPath ?? null,
        sealedProbePlan: pending.sealedProbePlan ?? null,
      });
      if (!rendered) continue;
      // a SEALED receiver read is observable - the source paren ends the chain, so the read past
      // it throws off-engine where the swapped literal just answers. it re-emits as a discarded
      // throw probe ahead of the literal, which is the source's own spelling of what the swap erases
      const sealedProbe = pending.sealedProbePlan
        ? renderSealedNavProbe(pending.sealedProbePlan, pending.metaPath, probeRenderCtx)
        : sealedNavProbeRead(receiver, pending.metaPath, probeRenderCtx);
      if (sealedProbe) rendered = sequenceExpression([sealedProbe, rendered]);
      // a collapsed logical re-runs its left sequence prefix ahead of the literal
      if (leadingEffects) rendered = sequenceExpression([...leadingEffects.expressions.slice(0, -1), rendered]);
      const consumed = receiver;
      if (replaceNodeInTree(program, receiver, rendered)) {
        markRewrite();
        markSubtreeSkipped(skippedNodes, consumed);
      }
    }
    synthLedger.clear();
    pendingBranchSynths.clear();
  }

  function drain() {
    drainSynthLiterals();
    const { owned: jobDeclarators, hostSiblings: jobHostSiblings } = jobOwnedNodes(ledger);
    const replayedHosts = replayedPrefixHopHosts(ledger, hopHosts);
    for (const [host, options] of hopHosts) {
      if (replayedHosts.has(host)) continue;
      // every note here speaks for a host the extraction never entered - one that did has
      // its own residual shape (and its own drain, which would emit a second statement
      // beside this one); babel anchors only what it consumed
      if (jobDeclarators.has(host)) continue;
      // an ASSIGNMENT host holds the same shape under different field names - the re-anchor
      // reads a view of it and the result writes back
      if (!options.assignHost) {
        if (reanchorSoleCtorHopResidual(host, options) && !jobHostSiblings.has(host)) {
          splitMultiDeclaratorHost({ program, declarator: host, markRewrite });
        }
        continue;
      }
      const view = { id: host.left, init: host.right };
      // the prefix a lift may take is the SOURCE's own sequence: a kept-write re-read the
      // re-anchor synthesises stays INSIDE the assignment, where the value it stored is what
      // the pattern reads (`({ cr } = (q2 = _globalThis, _globalThis))`). asked before the
      // re-anchor rewrites the init - after it, the two spellings are the same node type
      const sourceSeqInit = peelWrappers(host.right)?.type === 'SequenceExpression';
      if (reanchorSoleCtorHopResidual(view, options)) {
        host.left = view.id;
        host.right = view.init;
        if (sourceSeqInit) liftAssignInitPrefix(host, options.metaPath, program);
      }
    }
    drainSequenceAssignments(ledger, { program, drainAssignment, markRewrite, seqDrainedSlots });
    for (const [, { hostPath, jobs }] of ledger) {
      const hostNode = hostPath.node;
      // one host may collect jobs of DIFFERENT kinds (a plain destructure declarator next
      // to an opaque-init one) - each drain sees only its own, and the body index is
      // re-taken between them (each splices)
      const declNode = hostNode.type === 'ExportNamedDeclaration' ? hostNode.declaration : hostNode;
      const kinds = new Map();
      for (const job of jobs) {
        if (!kinds.has(job.host)) kinds.set(job.host, []);
        kinds.get(job.host).push(job);
      }
      // memo-decl and plain declaration jobs drain TOGETHER, per declarator in source
      // order - separate passes lost the statement order across sibling declarators
      if (kinds.has('memo-decl')) {
        const merged = [...kinds.get('declaration') ?? [], ...kinds.get('memo-decl')];
        kinds.delete('memo-decl');
        kinds.set('declaration', merged);
      }
      for (const [kind, kindJobs] of kinds) {
        if (kind === 'for-init') {
          drainForInit({ hostNode: declNode, jobs: kindJobs });
          continue;
        }
        if (kind === 'assignment' && kindJobs[0]?.bodyless) {
          drainAssignment({ hostNode, body: null, at: -1, jobs: kindJobs });
          continue;
        }
        if (kind === 'bodyless-decl') {
          drainBodylessDeclaration({ hostNode: declNode, jobs: kindJobs });
          continue;
        }
        if (drainBodylessWrapKinds({ kind, kindJobs, hostNode, declNode },
          { program, drainArrayDeclaration })) continue;
        const body = statementListOf(hostPath.parentPath?.node);
        if (!body) continue;
        const at = body.indexOf(hostNode);
        if (at === -1) continue;
        if (kind === 'assign-overwrite') {
          body.splice(at + 1, 0, ...kindJobs.map(job => expressionStatement(
            assignmentExpression('=', identifier(job.local), job.value()))));
          continue;
        }
        switch (kind) {
          case 'array-decl':
            drainArrayDeclaration({ hostNode: declNode, body, at, jobs: kindJobs });
            break;
          case 'array-assign':
            drainArrayAssignment({ body, at, jobs: kindJobs });
            break;
          case 'declaration':
            drainDeclaration({ hostNode: declNode, body, at, jobs: kindJobs });
            break;
          default: drainAssignment({ hostNode, body, at, jobs: kindJobs });
        }
      }
    }
    ledger.clear();
  }

  // the opaque / effect-bearing init, consumed whole. two spellings, babel's split:
  // a group that READS the receiver (an instance / symbol extraction) memoizes the whole
  // init (`const _ref = (eff(), X); const it = _getIteratorMethod(_ref); ...`); a
  // static-only group LIFTS the init's observables as statements and drops the pure tail
  // (`(class {...}); var from = _Array$from;`). partial consumption drops the jobs and the
  // source stays raw
  // one declarator's opaque-init memo emission into the caller's statement sink; returns
  // 'consumed' when the declarator dissolved, true when statements landed with a residual,
  // false when nothing applied
  // the ctor-pattern re-anchor arm of the memo declarator, extracted for its size
  function emitCtorPatternReanchor({ hostNode, declarator, soleJob, rescues, statements, exported }) {
    // a pristine proxy KEY peels - the inner pattern reads the (already substituted)
    // surface init whole (`{ navigator: nav } = (eff(), _globalThis)`); a ctor key
    // anchors on its pure with the rescues riding the init seq
    if (POSSIBLE_GLOBAL_OBJECTS.has(soleJob.hintName) && isPristineProxyGlobal(adapter, soleJob.hintName)) {
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(soleJob.prop.value, declarator.init)]), exported));
      markSubtreeSkipped(skippedNodes, soleJob.prop.key);
      return 'consumed';
    }
    // a HOP over a GUARD-shaped init reads off the guarded VALUE, never off a ctor binding: the
    // ponyfill would answer where the source's own probe yields undefined and its read throws
    // (`{ Map: { customY } } = (globalThis.window?.self)` -> `{ customY } = (guard).Map`)
    const guardInfo = surfaceInitInfo(declarator);
    if (guardInfo?.shape === 'guard') {
      const guardRead = memberExpression(cloneNode(guardInfo.tail), cloneNode(soleJob.prop.key),
        { computed: soleJob.prop.computed });
      statements.push(exportWrap(
        variableDeclaration(hostNode.kind, [variableDeclarator(soleJob.prop.value, guardRead)]), exported));
      markSubtreeSkipped(skippedNodes, soleJob.prop.key);
      return 'consumed';
    }
    const id = injectPureImport(soleJob.entry, soleJob.hintName);
    const init = rescues.length
      ? sequenceExpression([...rescues, identifier(id)]) : identifier(id);
    statements.push(exportWrap(variableDeclaration(hostNode.kind,
      [variableDeclarator(soleJob.prop.value, init)]), exported));
    markSubtreeSkipped(skippedNodes, soleJob.prop.key);
    return 'consumed';
  }

  // one extracted binding's VALUE off the whole-init memo. a DEFAULTED prop keeps
  // native-miss semantics through the guard ternary; a STATIC re-reads its import
  // directly (`_Array$from === void 0 ? [] : _Array$from`), an instance dispatch
  // memoizes through a ref
  function memoJobValue({ job, refName, guardRefs }) {
    const id = injectPureImport(job.entry, job.hintName);
    let value = job.kind === 'instance'
      ? callExpression(identifier(id), [identifier(refName)])
      : identifier(id);
    // the collapsed symbol leaf dispatches on what the extraction just built
    if (job.collapseLeaf) {
      value = callExpression(
        identifier(injectPureImport(job.collapseLeaf.instanceEntry, job.collapseLeaf.instanceHint)), [value]);
    }
    if (job.prop.value?.type !== 'AssignmentPattern') return value;
    if (job.kind === 'instance') {
      const guardRef = guardRefs.get(job) ?? injector.generateDeclaredRef(job.metaPath);
      return conditionalExpression(
        binaryExpression('===', assignmentExpression('=', identifier(guardRef), value), voidZero()),
        job.prop.value.right,
        identifier(guardRef),
      );
    }
    return conditionalExpression(
      binaryExpression('===', identifier(id), voidZero()),
      job.prop.value.right,
      identifier(id),
    );
  }

  // the receiverless-STATIC rescue arm of the memo declarator, extracted for its size:
  // the discard rescues, the seq-callee keep, the ctor-pattern re-anchor and the lift.
  // returns 'consumed' when the re-anchor took the declarator whole
  function emitStaticMemoRescues({ hostNode, declarator, declJobs, statements, exported, seqRescues }) {
    const [{ metaPath }] = declJobs;
    const rescues = discardRescueNodes({
      node: declarator.init, scope: metaPath.scope, adapter, path: metaPath,
    });
    // the collapse rewrote the init in place, so what the spine bottoms out on NOW is what
    // survived it: a call the nav read THROUGH but could not erase (`wrap(g()).Object`), or a
    // pure binding it folded onto (`mk().self.Array` -> `_self.Array`)
    const initSpine = peelWrappers(declarator.init);
    let spineRoot = initSpine;
    while (spineRoot?.type === 'MemberExpression') spineRoot = peelWrappers(spineRoot.object);
    // a CALL the collapse left standing stays as a statement: the receiver resolution reads
    // THROUGH it (an inline fold), so dropping it would drop the call the source performs
    // (`const { from } = (a => a)(Array)` keeps `(a => a)(Array);`). the one exception is a
    // BARE call whose argument list is nothing but ERASABLE proxy surfaces - those reads
    // collapse everywhere else too, and the call goes with them (`(g => g)(globalThis)`); a
    // nav hop ABOVE the call reads its RESULT, and that read is the source's own
    // the walk may already have substituted the surface, so the minted spelling counts as
    // the proxy read it replaced
    function erasableProxyArgument(argument) {
      const value = peelWrappers(argument);
      return value?.type === 'Identifier' && isMintedOrProxyName(value.name, injectorState)
        && !adapter.getBinding(metaPath.scope, value.name, metaPath)?.node;
    }
    const erasableCall = spineRoot === initSpine && spineRoot?.type === 'CallExpression'
      && spineRoot.arguments.length > 0 && spineRoot.arguments.every(erasableProxyArgument);
    // a SEQUENCE root carrying a kept WRITE keeps its READ too: the write is the source's own
    // effect and the member above it is the read the source performed
    // (`const { isInteger } = (a5 = Array.from('ab'), globalThis).Number`)
    const seqWriteRoot = (spineRoot !== initSpine || declJobs.some(job => job.seqRootWrite))
      && spineRoot?.type === 'SequenceExpression'
      && spineRoot.expressions.some(expr => {
        const stored = peelWrappers(expr);
        return stored?.type === 'AssignmentExpression' && stored.operator === '=';
      });
    // ... and only where the collapse actually FOLDED that key into a claim binding: a key the
    // claim never resolved is still a raw member read, and re-emitting it spells a read the
    // source's own effects already carried (`_globalThis[(a = f(), 'Array')]` keeps `a = f()`)
    // ... or where the key stayed a raw computed read off the ROOT: that read is the one the
    // source performed, and lifting only its key effect drops it
    // (`globalThis[(e++, 'Object')]` lifts `_globalThis[(e++, 'Object')]`)
    const buriedKeyInit = declJobs.some(job => job.keyClaimInit && !job.chain?.length
      && (spineRoot === initSpine || job.rawKeyRootInit));
    const seqClaimInit = spineRoot === initSpine && spineRoot?.type === 'SequenceExpression'
      && declJobs.some(job => job.seqDirectClaimInit && !job.chain?.length);
    // a KEPT WRITE at the spine ROOT with LATER harvested effects re-emits the read whole
    // too: the split channels would lift those effects AHEAD of the write that led them in
    // the source (`{ of } = (r = globalThis)[(se(), 'Array')]` - the write runs first)
    const keptWriteRootAhead = spineRoot !== initSpine && spineRoot?.type === 'AssignmentExpression'
      && rescues.length > 1;
    // ... but a REBUILT spine (the collapse minted the sequence - no source span) is not a
    // read the source performed: its effect prefix splices as ONE ordered unit, and a
    // resolvable ctor LEAF leaves its pure binding as the probe (`a6 = ..., _Symbol;` -
    // the throw-probe canon); a probe-less leaf drops with the read (babel's
    // `r = _globalThis, c++;`). the source's OWN sequence re-emits whole, read included
    // (the a5-case right above)
    if (seqWriteRoot && typeof spineRoot.start !== 'number') {
      // the collapse folds a resolvable ctor leaf into the seq TAIL (`..., _Symbol`) - that
      // binding read IS the throw probe and stays; an environment-root tail (`_globalThis`)
      // reads nothing the claim still needs and drops with the rebuilt read above it
      const tail = spineRoot.expressions.at(-1);
      const keepTail = !(tail?.type === 'Identifier' && isMintedOrProxyName(tail.name, injectorState));
      const spliced = keepTail ? [...spineRoot.expressions] : spineRoot.expressions.slice(0, -1);
      rescues.length = 0;
      rescues.push(spliced.length > 1 ? sequenceExpression(spliced) : spliced[0]);
    } else if (seqWriteRoot || buriedKeyInit || seqClaimInit || keptWriteRootAhead
      || (spineRoot?.type === 'CallExpression' && !erasableCall)) {
      // the whole read re-emits verbatim, so every effect harvested out of it rides inside
      // it already - keeping both would run them twice
      rescues.length = 0;
      rescues.push(declarator.init);
    }
    // a full consume DISCARDS the read the source performs: a receiver ending in a
    // resolvable CTOR off a proxy surface re-emits that read as a THROW PROBE on its own
    // binding (`const { iterator } = f().self.Symbol` keeps `_Symbol;`), which is what
    // preserves the native throw on an absent host
    if (!rescues.length) {
      // the walk already collapsed the receiver nav onto its pure BINDING: the full consume
      // discards that read, so it re-emits as a throw probe of its own (`const { iterator }
      // = f().self.Symbol` keeps `_Symbol;`) - what preserves the native throw off-host
      const collapsedInit = declJobs.some(job => job.callRootedInit) ? peelWrappers(declarator.init) : null;
      // the probe is the whole collapsed READ: a bare binding (`_Symbol`) or a member off
      // one (`_self.Array` - the ctor has no pure entry of its own)
      let collapsedRoot = collapsedInit;
      while (collapsedRoot?.type === 'MemberExpression') collapsedRoot = peelWrappers(collapsedRoot.object);
      const minted = collapsedRoot?.type === 'Identifier'
        && [...injectorState?.pureImports ?? []].some(([, name]) => name === collapsedRoot.name);
      if (minted) rescues.push(collapsedInit);
    }
    // the ctor-pattern re-anchor: a PATTERN-valued sole job reads the pure ctor whole,
    // the harvested rescues riding the init seq (`{ customB } = (eff(), _Set)`)
    const [soleJob] = declJobs;
    if (declJobs.length === 1 && soleJob.kind !== 'instance' && soleJob.prop.value?.type === 'ObjectPattern') {
      return emitCtorPatternReanchor({ hostNode, declarator, soleJob, rescues, statements, exported });
    }
    // a KEPT WRITE of a pure NAV rides the first extraction's own seq (`const from =
    // (a = _globalThis, _Array$from)` - babel's rescue slot); every other effect,
    // fallback writes included, lifts ahead - joined into ONE comma statement
    // (`x++, y++;`, babel's lift spelling)
    const liftedRescues = [];
    for (const rescue of rescues) {
      const rescueAssign = peelWrappers(rescue);
      // an EFFECT-BEARING call that IS the discarded receiver rides the extraction's own
      // sequence prefix (`const from = (IIFE(), _Array$from)`, babel's inject shape); a
      // fragment of the init, a kept READ over the call, and a call whose body proves pure
      // (the statement is all that survives of it) stay statements of their own
      // ... and a KEY effect buried in a CHAINED consume's spine rides too: the source ran it
      // inside the read the extraction replaced (`{ Symbol: { iterator } } = globalThis[(c++,
      // 'self')]` -> `const iterator = (c++, _Symbol$iterator)`)
      // ... and only a SPELLABLE store rides it: a window-terminated value has no pure of its
      // own, so the write is its own statement and the extraction reads nothing off it
      // (`const { of } = (d = globalThis.window).self.Array` lifts `d = _globalThis.window;`)
      const ridesTheValue = keptWriteRidesValue(rescueAssign, { adapter, injectorState, resolveGlobalPolyfill })
        || (rescueAssign?.type === 'CallExpression' && rescueAssign === peelWrappers(declarator.init)
          && inlineCallHasObservableEffects({
            callNode: rescueAssign, scope: metaPath.scope, adapter, path: metaPath,
          }))
        || declJobs.some(job => job.buriedKeyEffect && job.chain?.length);
      if (ridesTheValue) seqRescues.push(rescue);
      else liftedRescues.push(rescue);
    }
    // the CHANNEL decides the grouping: the nested-flatten chain lifts per statement
    // (`new _Set(arr); new _Map();`), the chainless consume joins as one comma
    // nested seq/paren layers flatten first (`a++, b++, c++;`, babel's flat spelling)
    function flattenLift(expr) {
      const peeledLift = peelWrappers(expr);
      if (peeledLift?.type === 'SequenceExpression') return peeledLift.expressions.flatMap(flattenLift);
      return [peeledLift];
    }
    // ... and a slot the SEQUENCE drain folded keeps a statement per extraction: babel wrote
    // those as statements and only the comma grouping was ours
    const drainedSlot = liftedRescues.some(rescue => seqDrainedSlots.has(peelWrappers(rescue)));
    const flatLift = liftedRescues.flatMap(flattenLift),
          joinLift = flatLift.length > 1 && !drainedSlot && declJobs.every(job => !job.chain?.length),
          liftedAt = statements.length;
    if (joinLift) statements.push(expressionStatement(sequenceExpression(flatLift)));
    else for (const rescue of flatLift) statements.push(expressionStatement(rescue));
    reanchorLiftedAssignments(statements, liftedAt);
    return null;
  }

  function emitMemoDeclarator({ hostNode, declarator, declJobs, statements, exported }) {
    const consumed = new Set(declJobs.map(job => job.prop));
    // full consumption reaches through hop levels: a hop prop counts consumed when its
    // nested pattern does
    function patternFullyConsumed(patternNode) {
      return patternNode.properties.every(item => consumed.has(item)
        || (item.type === 'Property' && !item.computed && item.value?.type === 'ObjectPattern'
          && patternFullyConsumed(item.value)));
    }
    if (!patternFullyConsumed(declarator.id)) {
      return emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported });
    }
    const needsValue = declJobs.some(job => job.kind === 'instance');
    let refName = null;
    const seqRescues = [];
    // a chain-assignment init with a pure-nav RHS inlines: the assignment rescues as the
    // extraction's own prefix and the read runs on the RHS value directly
    // (`{ [S]: it } = (g = globalThis)` -> `const it = (g = _globalThis, _gim(_globalThis))`)
    const chainAssignInline = needsValue && declJobs.length === 1
      ? chainAssignOverPureNav(declarator.init) : null;
    if (chainAssignInline) {
      const [job] = declJobs;
      const id = injectPureImport(job.entry, job.hintName);
      const read = callExpression(identifier(id), [cloneNode(peelWrappers(chainAssignInline.right))]);
      statements.push(exportWrap(variableDeclaration(hostNode.kind, [variableDeclarator(
        memoJobBindingTarget(job), sequenceExpression([chainAssignInline, read]))]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
      return 'consumed';
    }
    // a SOLE instance extraction reads the init exactly once inside its dispatch, so it
    // inlines with no memo slot (`const at = _atMaybeArray((foo(), [1]))`, babel's inline
    // consume) - the memo exists for the SECOND read, and there is none
    // ... and a SYMBOL-pattern value is that same single read: the extracted pattern binds off
    // the helper result, so the receiver rides inside the dispatch with no memo of its own.
    // a COLLAPSED leaf is not that shape - its dispatch reads the memo, like the plain route's
    if (needsValue && declJobs.length === 1 && !declJobs[0].collapseLeaf
      && (declJobs[0].prop.value?.type !== 'ObjectPattern' || declJobs[0].symbolPattern)) {
      const [job] = declJobs;
      const id = injectPureImport(job.entry, job.hintName);
      const dispatch = callExpression(identifier(id), [duplicateReceiver(declarator.init, injector)]);
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(memoJobBindingTarget(job), dispatch)]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
      return 'consumed';
    }
    // an SE-prefixed re-readable receiver needs no memo of its own: the prefix lifts as its
    // own statements and the tail IS the token every extraction reads (`(se(), globalThis)`
    // -> `se(); const it = _gim(_globalThis)`, babel's lift)
    const seqInit = peelWrappers(declarator.init),
          seqTail = seqInit?.type === 'SequenceExpression' ? peelWrappers(seqInit.expressions.at(-1)) : null;
    // ... but only a token the emitter itself MINTED: a source identifier may be shadowed or
    // rebound between the lifted statement and the read, so its residual keeps the memo
    if (needsValue && seqTail?.type === 'Identifier' && isMintedOrProxyName(seqTail.name, injectorState)) {
      for (const expr of seqInit.expressions.slice(0, -1)) statements.push(expressionStatement(expr));
      declarator.init = seqInit.expressions.at(-1);
      refName = seqTail.name;
    }
    // a GUARDED init the walk collapsed onto a pure BINDING needs no memo of its own: the
    // binding is re-readable, and the guarded read the consume discards re-emits as the
    // extraction's own probe (`((null == _globalThis.window ? void 0 : _self)[_S], _gim(_self))`)
    const guardedPureTail = !refName && needsValue && guardedPureBinding(declarator.init, injectorState);
    if (guardedPureTail) refName = guardedPureTail;
    const guardRefs = new Map();
    if (needsValue && !refName) {
      // ref order mirrors babel's requeue: the FIRST claim's guard ref mints before the
      // memo, later guards after it (`var _ref, _ref3; const _ref2 = getObj();`)
      if (declJobs[0].prop.value?.type === 'AssignmentPattern') {
        guardRefs.set(declJobs[0], injector.generateDeclaredRef(declJobs[0].metaPath));
      }
      refName = mintRefName();
      statements.push(variableDeclaration(hostNode.kind, [variableDeclarator(identifier(refName), declarator.init)]));
    } else if (!needsValue) {
      const consumedCtor = emitStaticMemoRescues({ hostNode, declarator, declJobs, statements, exported, seqRescues });
      if (consumedCtor) return consumedCtor;
    }
    // the pattern consumed WHOLE leaves nothing to carry the read native performs off the init's
    // value: an init that can be undefined THROWS there while the extracted bindings just answer.
    // the first extraction leads with that read, rebuilt off the rendered init. a MEMO'd init is
    // already read by its own slot and owes nothing here
    const probePrefix = refName && !guardedPureTail ? null
      : renderDiscardedInitProbe(declJobs, probeRenderCtx);
    for (const job of declJobs) {
      let value = memoJobValue({ job, refName, guardRefs });
      if (seqRescues.length || (probePrefix && job === declJobs[0])) {
        value = sequenceExpression([...seqRescues.map(expr => cloneNode(expr)),
          ...probePrefix && job === declJobs[0] ? [probePrefix] : [], value]);
        seqRescues.length = 0;
      }
      statements.push(exportWrap(variableDeclaration(hostNode.kind,
        [variableDeclarator(memoJobBindingTarget(job), value)]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    return keptSymbolSentinelResidual(declarator, declJobs, refName, mintUnusedName) ? true : 'consumed';
  }

  // array-wrapped extraction: leaf sentinels keep the structure; a declarator left with no
  // real binding drops whole, its init's observables lifted as statements
  function drainArrayDeclaration({ hostNode, body, at, jobs }) {
    const sentinelNames = new Set();
    const byDeclarator = new Map();
    const extracted = [];
    collectArrayDeclExtractions({ hostNode, jobs, sentinelNames, byDeclarator, extracted },
      { probeRenderCtx, mintUnusedName, removeConsumedProps, markSubtreeSkipped, skippedNodes });
    const dropped = new Set();
    const rescueExprs = [];
    const rescueStatements = [];
    for (const [declarator, job] of byDeclarator) {
      if (hasRealBinding(declarator.id, sentinelNames)) {
        rescueStatements.push(...liftArrayWrapperPrefixes(declarator).map(expr => expressionStatement(expr)));
        continue;
      }
      // a MULTI-element pattern keeps its renamed skeleton (`const [{ from: _unused },
      // { of: _unused2 }] = [Array, Array]` - babel drops only the single-element shape)
      if (declarator.id?.type === 'ArrayPattern' && declarator.id.elements.length > 1) continue;
      // ... and so does one whose KEPT key still carries an effect: native runs the key
      // once, and dropping the skeleton would erase it
      // (`[{ [(log.push("e"), "from")]: _unused }] = [Array]` keeps its residual)
      if (patternKeepsEffectfulKey(declarator.id)) continue;
      dropped.add(declarator);
      // a FLAT extraction absorbs its discarded-init effects as a sequence prefix
      // (`const from = (IIFE(), _Array$from);`); the nested flatten lifts them as
      // statements ahead (`sideEffect(); const from = _Array$from;`), babel's split
      // ... and a nested one whose receiver IS that call absorbs it the same way (the sole
      // wrapped element is the read, not an effect running ahead of it)
      const soleElement = declarator.init?.type === 'ArrayExpression' && declarator.init.elements.length === 1
        ? peelWrappers(declarator.init.elements[0]) : null;
      function rescueLift(rescueNode) {
        // a rescued sequence whose tail is a pure nav lifts only its prefixes - the tail
        // was the discarded receiver itself
        const peeled = peelWrappers(rescueNode);
        if (peeled?.type === 'SequenceExpression' && isPureNavReceiver(peeled.expressions.at(-1))) {
          return peeled.expressions.slice(0, -1);
        }
        // ... and a sequence whose tail is another discarded ARRAY WRAPPER is one more level
        // of the same flatten: its own buried effects lift too, in source order
        // (`(m(), [(i(), R)])` -> `m(); i();`)
        if (peeled?.type === 'SequenceExpression'
          && peelWrappers(peeled.expressions.at(-1))?.type === 'ArrayExpression') {
          return [...peeled.expressions.slice(0, -1), ...discardRescueNodes({
            node: peelWrappers(peeled.expressions.at(-1)), scope: job.metaPath.scope, adapter, path: job.metaPath,
          }).flatMap(rescueLift)];
        }
        // a rescued MEMBER read off a kept write trims to the write - the pristine hop
        // above it has no observer (`(a = _globalThis).Array` -> `a = _globalThis`) - and a
        // COMPUTED hop hands its key's effect prefix over in source order (object before
        // key, inner hop before outer): `[(r = _globalThis)[(se(), "Array")]]` splices to
        // `r = _globalThis, se()` - babel's flat spelling. an exotic key (a bare call) keeps
        // the whole read - its evaluation is not separable from the hop
        let trimmed = peeled;
        const keyEffects = [];
        while (trimmed?.type === 'MemberExpression') {
          if (trimmed.computed) {
            const keyExpr = peelWrappers(trimmed.property);
            if (keyExpr?.type === 'SequenceExpression') keyEffects.unshift(...keyExpr.expressions.slice(0, -1));
            else if (keyExpr?.type !== 'Literal' && keyExpr?.type !== 'Identifier') break;
          }
          trimmed = peelWrappers(trimmed.object);
        }
        // ... and a SEQUENCE root keeps only its prefix, for the same reason: the pristine
        // hops above the tail observe nothing (`(n++, _globalThis).Object` -> `n++`)
        if (trimmed !== peeled && trimmed?.type === 'SequenceExpression'
          && isPureNavReceiver(trimmed.expressions.at(-1))) {
          return [...trimmed.expressions.slice(0, -1), ...keyEffects];
        }
        if (trimmed !== peeled && trimmed?.type === 'AssignmentExpression') {
          const writtenValue = peelWrappers(trimmed.right);
          const writtenCallee = writtenValue?.type === 'CallExpression' ? peelWrappers(writtenValue.callee) : null;
          if ((writtenValue?.type === 'Identifier' && isMintedOrProxyName(writtenValue.name, injectorState))
            || writtenCallee?.type === 'ArrowFunctionExpression' || writtenCallee?.type === 'FunctionExpression') {
            return [trimmed, ...keyEffects];
          }
        }
        // a provably pure LITERAL call falls away (`[(() => Array)()]` - babel drops it);
        // the effects canon mirrors the inline fold, so a body effect keeps the rescue.
        // asked of the call the plain hops sit ON: a member read off it observes nothing
        // and its value is discarded (`[(() => { c++; return globalThis; })().Array]`
        // re-emits the CALL alone)
        const bottom = trimmed?.type === 'CallExpression' ? trimmed : peeled;
        if (bottom?.type === 'CallExpression') {
          const rescueCallee = peelWrappers(bottom.callee);
          if ((rescueCallee?.type === 'ArrowFunctionExpression' || rescueCallee?.type === 'FunctionExpression')
            && !inlineCallHasObservableEffects({
              callNode: bottom, scope: job.metaPath.scope, adapter, path: job.metaPath,
            })) return [];
          if (bottom !== peeled) return [bottom];
        }
        return [rescueNode];
      }
      const exprs = discardRescueNodes({
        node: declarator.init, scope: job.metaPath.scope, adapter, path: job.metaPath,
      }).flatMap(rescueLift);
      const intoSeq = !job.chain?.length
        || (exprs.length === 1 && soleElement?.type === 'CallExpression' && peelWrappers(exprs[0]) === soleElement
          && inlineCallHasObservableEffects({
            callNode: soleElement, scope: job.metaPath.scope, adapter, path: job.metaPath,
          }));
      if (intoSeq) rescueExprs.push(...exprs);
      else rescueStatements.push(...exprs.map(expr => expressionStatement(expr)));
    }
    if (rescueExprs.length && extracted.length) {
      // an EXPORTED extraction carries its declaration under the export wrapper
      const first = extracted[0].type === 'ExportNamedDeclaration' ? extracted[0].declaration : extracted[0];
      const [firstDeclarator] = first.declarations;
      firstDeclarator.init = sequenceExpression([...rescueExprs, firstDeclarator.init]);
    }
    const declarations = hostNode.declarations.filter(declarator => !dropped.has(declarator)),
          statements = [...rescueStatements, ...extracted];
    if (!declarations.length) {
      body.splice(at, 1, ...statements);
      return;
    }
    // survivors keep their SOURCE SLOT around the lift: the ones written before the consumed
    // declarator stay ahead of it, the ones after it follow - each as its own statement
    // (`const keep = 1; outer(); const groupBy = ...; const keep2 = 2;`)
    const firstDropped = hostNode.declarations.findIndex(declarator => dropped.has(declarator));
    const lastDropped = hostNode.declarations.findLastIndex(declarator => dropped.has(declarator));
    const ahead = hostNode.declarations.slice(0, firstDropped);
    const behind = declarations.filter(declarator => !ahead.includes(declarator));
    if (body[at] === hostNode && ahead.length && behind.length) {
      body.splice(at, 1, variableDeclaration(hostNode.kind, ahead), ...statements,
        variableDeclaration(hostNode.kind, behind));
      return;
    }
    const trailing = declarations.every(declarator => hostNode.declarations.indexOf(declarator) < lastDropped);
    hostNode.declarations = declarations;
    body.splice(trailing ? at + 1 : at, 0, ...statements);
  }

  // PARTIAL consumption still memoizes when the group READS the receiver: the memo holds
  // one eval, the residual re-anchors on it (`export const { at, other } = getArr()` ->
  // `const _ref = getArr(); export const at = _at(_ref); export const { other } = _ref;`)
  function emitPartialMemo({ hostNode, declarator, declJobs, consumed, statements, exported }) {
    // receiverless STATICS need no memo: each extracts pure, the leftover residual keeps
    // the init (its SE runs there once) and re-anchors when a sole ctor hop remains
    // (`tryFn = _Promise$try; { customP } = (eff(), _Promise);` - babel's lift-not-replay)
    // a GLOBAL claim is receiverless the same way a static is: it substitutes its own binding
    // and the leftover residual keeps the init (`{ Map, parseInt } = (eff(), globalThis)`)
    if (declJobs.every(job => job.kind === 'static' || job.kind === 'global')) {
      const surface = surfaceInitInfo(declarator);
      const extracted = [];
      for (const job of declJobs) {
        const extractedId = identifier(injectPureImport(job.entry, job.hintName));
        extracted.push(exportWrap(variableDeclaration(hostNode.kind,
          [variableDeclarator(propBindingTarget(job.prop), extractedId)]), exported));
        markSubtreeSkipped(skippedNodes, job.prop);
      }
      removeConsumedProps(declJobs);
      const initBeforeReanchor = declarator.init;
      if (surface) reanchorSoleCtorHopResidual(declarator);
      // the prefix lifts FIRST - source order, the init runs and then the extractions bind
      // (`log(); const from = _Array$from; ...`) - but only off a RE-READABLE identifier
      // tail: a residual left on a NAV keeps the sequence, where its effect runs
      // (`(se(), _globalThis.Array)`)
      const peeledInit = peelWrappers(declarator.init);
      const seqTail = peeledInit?.type === 'SequenceExpression'
        ? peelWrappers(peeledInit.expressions.at(-1)) : null;
      // ... and only a STATIC extraction lifts it: a GLOBAL claim leaves the whole read to the
      // residual, prefix included (`{ parseInt } = (eff(), _globalThis)`). a KEY effect the
      // collapse folded out of the spine stays there too - the surviving residual re-reads that
      // hop, and the source ran the key inside the read
      // (`{ Promise: { resolve }, other } = globalThis[(d++, 'self')]` keeps `(d++, _self)`)
      // ... and not off a RE-ANCHORED residual: that init is one the drain rebuilt onto the hop's
      // own pure, and the prefix rides the rebuild where the source wrote it
      // (`{ Promise: { try: tryFn, customP } } = (eff(), globalThis)` -> `const tryFn =
      // _Promise$try; const { customP } = (eff(), _Promise);`). a residual left at the SOURCE
      // level re-reads the receiver the prefix fed, and there the lift is the single run
      const init = seqTail?.type === 'Identifier' && declarator.init === initBeforeReanchor
        && declJobs.every(job => job.kind === 'static' && !(job.buriedKeyEffect && job.chain?.length))
        ? peeledInit : null;
      if (init?.type === 'SequenceExpression') {
        for (const expr of init.expressions.slice(0, -1)) statements.push(expressionStatement(expr));
        declarator.init = init.expressions.at(-1);
      }
      statements.push(...extracted);
      return true;
    }
    if (declJobs.every(job => job.kind !== 'instance') || declJobs.some(job => job.chain?.length)) return false;
    const refName = mintRefName();
    statements.push(variableDeclaration(hostNode.kind, [variableDeclarator(identifier(refName), declarator.init)]));
    // the SAME value the fully-consumed memo builds - dispatch, collapsed symbol leaf and
    // defaulted guard alike; a partial residual changes what SURVIVES, not what binds
    for (const job of declJobs) {
      const bound = variableDeclarator(memoJobBindingTarget(job), memoJobValue({ job, refName, guardRefs: new Map() }));
      statements.push(exportWrap(variableDeclaration(hostNode.kind, [bound]), exported));
      markSubtreeSkipped(skippedNodes, job.prop);
    }
    // a SYMBOL-pattern extraction leaves the key SPELLED in the residual: the source reads that
    // slot there, and the sentinel is what keeps the read (`{ [_Symbol$iterator]: _unused, other }`)
    for (const job of declJobs) {
      if (!job.symbolPattern) continue;
      consumed.delete(job.prop);
      job.prop.value = identifier(mintUnusedName());
      job.prop.shorthand = false;
    }
    declarator.id.properties = declarator.id.properties.filter(item => !consumed.has(item));
    declarator.init = identifier(refName);
    return true;
  }

  // for-init: consumed declarators are replaced IN PLACE by the extracted siblings, and an
  // effect-bearing consumed init stays live as an `_unused` dummy declarator

  function drainForInit({ hostNode, jobs }) {
    jobs = withoutCtorHopJobsWithLiveSiblings(jobs);
    if (!jobs.length) return;
    const byDeclarator = new Map();
    for (const job of jobs) {
      if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
      byDeclarator.get(job.declarator).push(job);
      // the extraction's binding target is the SOURCE spelling (a ctor-pattern re-anchor
      // moves its whole pattern), captured before the removal pass
      job.bindingTarget = job.collapseLeafName ? identifier(job.collapseLeafName) : propBindingTarget(job.prop);
    }
    // sentinel-kept declarators with an unre-readable init memoize like the block-hosted
    // twin: `var _ref = <init>, { ..._unused } = _ref, f = _flat(_ref), i = 0;`
    const memoRefs = forInitMemoVerdicts(byDeclarator, mintRefName);
    removeConsumedProps(jobs);
    const declarations = [];
    for (const declarator of hostNode.declarations) {
      const declJobs = byDeclarator.get(declarator);
      if (!declJobs) {
        declarations.push(declarator);
        continue;
      }
      const memoRef = memoRefs.get(declarator);
      if (memoRef) {
        const memoDeclarator = variableDeclarator(identifier(memoRef), declarator.init);
        declarator.init = identifier(memoRef);
        const seKeyJobs = declJobs.filter(job => job.sentinel && job.seKey);
        function declare(list) {
          return list.map(job => variableDeclarator(job.bindingTarget, job.value(memoRef)));
        }
        // the SE-KEY residual runs its key before the extraction reads the slot; every other
        // one follows the extraction it left behind, and a PLAIN sibling keeps its place
        // ahead of the residual (its slot read owes the key nothing)
        if (seKeyJobs.length) {
          declarations.push(memoDeclarator, ...declare(declJobs.filter(job => !seKeyJobs.includes(job))),
            declarator, ...declare(seKeyJobs));
        } else {
          declarations.push(memoDeclarator, ...declare(declJobs));
          if (!patternDead(declarator.id)) declarations.push(declarator);
        }
        continue;
      }
      const emptied = patternDead(declarator.id);
      // an init only the PROBE proved absent-able keeps its own read: the consume discards it,
      // and off-env that read is what throws (the block-hosted rule, same shape here)
      const probeRead = emptied && declJobs.every(job => !job.readsReceiver && !job.seLifted)
        ? renderDiscardedInitProbe(declJobs, probeRenderCtx) : null;
      const extracted = declJobs.map((job, at) => variableDeclarator(job.bindingTarget,
        at === 0 && probeRead ? sequenceExpression([probeRead, job.value()]) : job.value()));
      if (!emptied) {
        // residual keeps the init: extracted siblings go ahead of it - except under an
        // SE-KEY sentinel, whose key effect must run before the extraction reads the slot.
        // SEVERAL such keys interleave, each segment ahead of the extraction reading it
        if (declJobs.length > 1 && declJobs.every(job => job.sentinel && job.seKey)) {
          declarations.push(...interleavedSeKeySegments(declarator, orderDeclaratorJobs(declJobs), null));
        } else if (declJobs.some(job => (job.sentinel && job.seKey) || (job.chain?.length && job.readsReceiver))) {
          declarations.push(declarator, ...extracted);
        } else declarations.push(...extracted, declarator);
        continue;
      }
      // the sink question is the PRISTINE init's: a receiver that carried a call collapses
      // to a quiet spelling, and babel still keeps the loop-header slot for it
      // (`(() => globalThis)().self.Promise` -> `_ref = _Promise`)
      if (declJobs.every(job => !job.sinkKeep) && !mayHaveSideEffects(declarator.init)) {
        declarations.push(...extracted);
        continue;
      }
      // a SOLE instance extraction reads the SE init exactly once inside its dispatch -
      // no memo slot needed (`var at = _at(getObj())`, babel's inline consume)
      if (declJobs.length === 1 && declJobs[0].readsReceiver && !declJobs[0].chain?.length) {
        declarations.push(...extracted);
        continue;
      }
      // the discarded SE init keeps a declarator slot; its ORDER splits on the CHANNEL:
      // the nested flatten route rides AFTER the extractions as `_unused` (its sink's
      // accepted reorder), flat claims memoize FIRST as `_ref` (source order - the effect
      // runs before the bindings it fed)
      // the discarded init respells bare - a TS wrapper around it has nothing left to
      // assert (`(se(), _globalThis) as any` -> `(se(), _globalThis)`, babel's peel)
      if (declJobs.some(job => job.chain?.length)) {
        const sinkValue = declJobs.some(job => job.arrayWrapSink)
          ? flattenArrayWrapInit(declarator.init) : peelWrappers(declarator.init);
        declarations.push(...extracted, variableDeclarator(identifier(mintUnusedName()), sinkValue));
      } else {
        const slot = discardedSinkSlot(peelWrappers(declarator.init),
          {
            metaPath: declJobs[0]?.metaPath, sinkDrop: declJobs.some(job => job.sinkDrop),
            sinkPlan: declJobs.find(job => job.sinkPlan)?.sinkPlan ?? null, planMemoArg, adapter,
          });
        if (!foldSinkPrefixIntoResidual(extracted, slot) && slot) {
          declarations.push(variableDeclarator(identifier(mintRefName()), slot));
        }
        declarations.push(...extracted);
      }
    }
    hostNode.declarations = declarations;
  }

  // remove every consumed prop - or, under a rest sibling, RENAME its binding to an
  // `_unused` sentinel (the key stays, so rest keeps excluding it) - then cascade: a hop
  // prop whose nested pattern emptied is itself consumed, up the recorded chain
  function removeConsumedProps(jobs) {
    for (const job of jobs) {
      const mint = job.mintSentinel ?? mintUnusedName;
      if (job.sentinel) {
        if (!job.keepSentinelBinding) {
          markSubtreeSkipped(skippedNodes, job.prop.value);
          job.prop.value = identifier(mint());
          job.prop.shorthand = false;
        }
        continue;
      }
      job.pattern.properties = job.pattern.properties.filter(item => item !== job.prop);
      markSubtreeSkipped(skippedNodes, job.prop);
      for (const { hopProp, outerPattern, outerRest } of job.chain ?? []) {
        const hopPatternNode = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
        if (hopPatternNode.properties.length) break;
        if (outerRest) {
          markSubtreeSkipped(skippedNodes, hopProp.value);
          hopProp.value = identifier(mint());
          hopProp.shorthand = false;
          break;
        }
        outerPattern.properties = outerPattern.properties.filter(item => item !== hopProp);
      }
    }
  }

  // the sentinel MEMO keeps one declaration: `var _ref = <init>, { ..._unused } = _ref,
  // a = _at(_ref), z = 1;` - memo first, residual, extractions after (babel's shape). an
  // EXPORT host splits instead (the memo must not be exported), and so does a
  // SINGLE-declarator constant-literal host (the text leg's channel for it)
  function drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator }) {
    if (!memoByDeclarator.size
      || jobs.some(job => memoByDeclarator.has(job.declarator) && !job.memoSibling)
      // a HOP-anchored sibling renders its own declarator whole (the flatten's slots), so the
      // comma join would bake this memo into a declaration that emitter is about to replace
      || jobs.some(job => !memoByDeclarator.has(job.declarator) && job.chain?.length)
      // a SOLE declarator splits per statement instead - the memo, the extraction, then the
      // residual (`var _ref = holder.p; var m = _flat(_ref); var { ..._unused } = _ref;`);
      // the sibling join is the MULTI-declarator / for-init shape
      || hostNode.declarations.length === 1) return false;
    const exported = jobs.some(job => job.exported);
    // an EXPORTED host whose SIBLING was consumed whole splits per statement instead: that
    // sibling's extraction is its own export, and the join would put the memo behind it
    if (exported && hostNode.declarations.some(item => item.id?.type === 'ObjectPattern'
      && !item.id.properties.length)) return false;
    // an EXPORTED host keeps the comma join, and only the FIRST declarator's memo lifts out
    // ahead of it: a later one would run its receiver read before an earlier declarator's init,
    // so it keeps the comma slot - and its `_ref` on the module surface, the documented residue
    const ahead = [];
    const declarators = [];
    for (const [index, declarator] of hostNode.declarations.entries()) {
      const declJobs = jobsByDeclarator.get(declarator) ?? [];
      const refName = memoByDeclarator.get(declarator);
      if (refName) {
        const memoDeclarator = variableDeclarator(identifier(refName), declarator.init);
        if (exported && index === 0) ahead.push(variableDeclaration(hostNode.kind, [memoDeclarator]));
        else declarators.push(memoDeclarator);
        declarator.init = identifier(refName);
        declarators.push(...seKeySegmentedDeclarators(declarator, orderDeclaratorJobs(declJobs), refName));
        continue;
      }
      const emptiedHere = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0,
            // a DEFAULTED job reads its slot PAST the key effect, so the residual runs first - the
            // same order the sole-declarator join spells (`{ [(e(), 'k')]: _unused } = [4], s = ...`)
            residualFirst = !emptiedHere && declJobs.some(job => job.defaulted && job.sentinel);
      if (residualFirst) declarators.push(declarator);
      for (const job of orderDeclaratorJobs(declJobs)) {
        declarators.push(variableDeclarator(job.bindingTarget, job.value()));
      }
      if (!emptiedHere && !residualFirst) declarators.push(declarator);
    }
    hostNode.declarations = declarators;
    if (ahead.length) body.splice(at, 0, ...ahead);
    markRewrite();
    return true;
  }

  // partition drain jobs per declarator; a sentinel-kept declarator whose init cannot be
  // re-read raw takes a shared memo ref, and every job captures its binding target before
  // the sentinel rename mutates the prop
  function partitionDeclarationJobs(jobs, hostNode) {
    const memoByDeclarator = new Map();
    const jobsByDeclarator = new Map();
    const memoDeclJobs = new Map();
    for (const job of jobs) {
      if (job.host === 'memo-decl') {
        if (!memoDeclJobs.has(job.declarator)) memoDeclJobs.set(job.declarator, []);
        memoDeclJobs.get(job.declarator).push(job);
        continue;
      }
      const init = peelNavWrappers(job.declarator?.init);
      // the memo exists to give TWO readers one identity: a job that does not read the
      // receiver leaves the residual as its only reader, and that read happens in place
      // (`{ [(k(), 'freeze')]: _unused } = (guard).Object` + `freeze = _Object$freeze`)
      // ... an SE-bearing SEQUENCE / CALL init would otherwise re-run its effects in the
      // residual, and a value-SELECTING one would take its branch twice - the same rule
      if (job.sentinel && !job.memoRecv && job.readsReceiver
        && sentinelMemoInitShape(init, job.allProxyInit,
          !hostNode?.declarations || hostNode.declarations[0] === job.declarator)
        && !memoByDeclarator.has(job.declarator)) {
        // the name was minted during the WALK, ahead of this claim's own guard ref: babel
        // allocates the receiver memo before the default guard of the claim that reads it
        memoByDeclarator.set(job.declarator, job.eagerMemoName ?? mintRefName());
      }
      if (!jobsByDeclarator.has(job.declarator)) jobsByDeclarator.set(job.declarator, []);
      jobsByDeclarator.get(job.declarator).push(job);
      // the sentinel rename mutates the prop in place - the extraction's binding target is
      // the SOURCE spelling, captured before the removal pass
      job.bindingTarget = job.collapseLeafName ? identifier(job.collapseLeafName) : propBindingTarget(job.prop);
    }
    return { memoByDeclarator, jobsByDeclarator, memoDeclJobs };
  }

  // multi-declarator SE-key sentinels stay ONE declaration: each declarator keeps its
  // residual (the key effect runs in place) and the extraction follows as a sibling
  // declarator (`{ [(e1(), 'at')]: _unused } = arr, a = _at(arr), ...` - babel's shape);
  // a single declarator splits with the extraction ahead instead
  function drainSeKeySentinelSiblings({ hostNode, jobsByDeclarator, memoDeclJobs }) {
    // an EXPORT host keeps the same shape - the declaration is rewritten in place and its
    // wrapper rides along, so every binding stays exported from the one statement
    if (hostNode.declarations.length <= 1 || !jobsByDeclarator.size) return false;
    // a MEMO-DECL sibling owns its own emission (a hoisted `_ref` and the extractions off it):
    // rewriting the declaration in place here would leave that declarator raw, its claim lost
    if (memoDeclJobs?.size) return false;
    if (jobsByDeclarator.values().some(list => list.some(job => !job.sentinel || !job.seKey
      || job.catchBorn || job.chain?.length
      // a receiverless STATIC splits its extraction out instead (`const from = _Array$from;`
      // first, the residual keeps its own statement - babel's known-global shape)
      || !job.readsReceiver))) return false;
    if (jobsByDeclarator.keys().some(declarator => declarator.init?.type !== 'Identifier')) return false;
    const declarators = [];
    for (const declarator of hostNode.declarations) {
      const declJobs = orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? []);
      // SEVERAL keys on one pattern interleave with their own extractions - the same
      // per-prop evaluation order the single-declarator join spells
      if (declJobs.length > 1 || (declJobs.length === 1 && trailingSeKeyProps(declarator, declJobs[0]))) {
        declarators.push(...seKeySegmentedDeclarators(declarator, declJobs, null));
        continue;
      }
      declarators.push(declarator, ...declJobs.map(job => variableDeclarator(job.bindingTarget, job.value())));
    }
    hostNode.declarations = declarators;
    markRewrite();
    return true;
  }

  // a lifted SE-prefix statement may itself be a destructure ASSIGNMENT whose hop the anchor
  // owns: the lift is what puts it in statement position, so the trigger re-fires here
  function reanchorLiftedAssignments(statements, from) {
    for (let at = from; at < statements.length; at++) {
      const lifted = statements[at]?.type === 'ExpressionStatement'
        ? peelWrappers(statements[at].expression) : null;
      if (lifted?.type !== 'AssignmentExpression' || lifted.left?.type !== 'ObjectPattern') continue;
      const view = { id: lifted.left, init: lifted.right };
      if (reanchorSoleCtorHopResidual(view)) {
        lifted.left = view.id;
        lifted.right = view.init;
      }
      // ... and the lift is also the statement slot a buried host never had: the effects riding
      // ahead of the anchored read spell what the source ran, so they land as statements of
      // their own (`c++; ({ customW } = _Map);` - `liftAssignInitPrefix`'s shape off a slot it
      // could not reach). a kept WRITE is not one of them - it rides the value it stored
      const initSeq = peelWrappers(lifted.right);
      if (initSeq?.type !== 'SequenceExpression'
        || initSeq.expressions.slice(0, -1)
          .some(expr => keptWriteRidesValue(expr, { adapter, injectorState, resolveGlobalPolyfill }))) continue;
      lifted.right = initSeq.expressions.at(-1);
      const prefix = initSeq.expressions.slice(0, -1).map(expr => expressionStatement(expr));
      statements.splice(at, 0, ...prefix);
      at += prefix.length;
    }
  }

  function rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements, insertAt = -1 }) {
    // an SE-LIFTED nav already re-emitted its prefix ahead of the extraction
    if (declJobsHere.some(job => job.seLifted)) return;
    // the emptied declarator's init keeps its observables (the discard-rescue harvest, a
    // kept call with a claim-bearing body included)
    // an extraction that READS the receiver already spells the init inside its own dispatch
    // (`at = _at((sideEffect(), getObj()))`) - rescuing it again would run the effects twice
    if (declJobsHere.some(job => job.readsReceiver)) return;
    const dropMetaPath = declJobsHere[0].metaPath;
    const dropExprs = dropMetaPath ? discardRescueNodes({
      node: declarator.init, scope: dropMetaPath.scope, adapter, path: dropMetaPath,
    }) : [];
    const droppedInit = peelWrappers(declarator.init);
    // a value-SELECTING init re-emits WHOLE: an effect buried in an operand (a proxy-hop KEY)
    // has no slot of its own, and the selection reads exactly what the source wrote
    // ... and it LEADS the extraction: the source evaluates the init before it binds
    if (!dropExprs.length
      && (droppedInit?.type === 'LogicalExpression' || droppedInit?.type === 'ConditionalExpression')
      && mayHaveSideEffects(droppedInit)) {
      if (insertAt >= 0) {
        statements.splice(insertAt, 0, expressionStatement(declarator.init));
        return;
      }
      dropExprs.push(declarator.init);
    }
    for (const expr of dropExprs) statements.push(expressionStatement(expr));
  }

  // the array-wrapped ASSIGNMENT: when every binding of the left died into extractions,
  // the destructure drops whole - the RHS array stays as an expression statement (its
  // element SEs run in place), the overwrites follow (babel's shape)
  function drainArrayAssignment({ body, at, jobs }) {
    retargetSoleHopRestSentinels(jobs, { markSubtreeSkipped, skippedNodes });
    removeConsumedProps(jobs);
    const [{ assignment }] = jobs;
    const extracted = jobs.map(job => expressionStatement(assignmentExpression('=', identifier(job.local), job.value())));
    const mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
    const varDecl = mintedNames.length
      ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
    if (!patternDead(assignment.left)) {
      // a surviving residual (a rest exclusion) runs first, the overwrites follow
      body.splice(at, 1, ...varDecl, body[at], ...extracted);
      return;
    }
    // the dead left drops whole; the RHS stays as an expression only for its effects - and a
    // SOURCE sequence splits per element, each buried effect keeping its own statement while
    // the discarded tail keeps one of its own (`(o(), [(i(), R)])` -> `o(); [(i(), R)];`)
    const rhsCore = peelWrappers(assignment.right);
    const keepRhs = !mayHaveSideEffects(assignment.right) ? []
      : rhsCore?.type === 'SequenceExpression' && Number.isInteger(rhsCore.start)
        ? rhsCore.expressions.map(expr => expressionStatement(expr))
        : [expressionStatement(assignment.right)];
    body.splice(at, 1, ...keepRhs, ...extracted);
  }

  // sibling-declarator mode: the declaration stays ONE statement, each extraction appended
  // as a declarator after its residual (babel's multi-declarator kept-key shape)
  function drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator }) {
    if (jobs.every(job => !job.siblingAppend)) return false;
    const appendExported = jobs.some(job => job.exported);
    const appendStatements = [];
    let group = [];
    function flushGroup() {
      if (group.length) appendStatements.push(exportWrap(variableDeclaration(hostNode.kind, group), appendExported));
      group = [];
    }
    for (const declarator of hostNode.declarations) {
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      const extractions = declJobsHere.map(job => variableDeclarator(job.bindingTarget, job.value()));
      // a declarator the extraction consumed WHOLE splits off as its own statement, its
      // emptied residual dropped (`const { Array: { from } } = globalThis, <rest>` ->
      // `const from = _Array$from;` ahead of the rest) - babel's shape
      if (declarator.id.type === 'ObjectPattern' && !declarator.id.properties.length) {
        flushGroup();
        appendStatements.push(exportWrap(variableDeclaration(hostNode.kind, extractions), appendExported));
        if (declJobsHere.length) rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements: appendStatements });
        continue;
      }
      group.push(declarator, ...extractions);
    }
    flushGroup();
    markRewrite();
    body.splice(at, 1, ...appendStatements);
    return true;
  }

  function drainDeclaration({ hostNode, body, at, jobs }) {
    jobs = withoutCtorHopJobsWithLiveSiblings(jobs);
    if (!jobs.length) return;
    const { memoByDeclarator, jobsByDeclarator, memoDeclJobs } = partitionDeclarationJobs(jobs, hostNode);
    // the SOURCE prop order, taken before the consumed ones leave: a re-anchored residual
    // is emitted at the position its surviving hop was written in
    const sourceProps = new Map(hostNode.declarations
      .filter(declarator => declarator.id?.type === 'ObjectPattern')
      .map(declarator => [declarator, [...declarator.id.properties]]));
    removeConsumedProps(jobs.filter(job => job.host !== 'memo-decl'));
    if (drainSentinelMemoSiblings({ hostNode, body, at, jobs, jobsByDeclarator, memoByDeclarator })) return;
    if (drainSeKeySentinelSiblings({ hostNode, jobsByDeclarator, memoDeclJobs })) return;
    // sibling-declarator mode: the declaration stays ONE statement, each extraction appended
    // as a declarator after its residual (babel's multi-declarator kept-key shape)
    if (drainSiblingAppend({ hostNode, body, at, jobs, jobsByDeclarator })) return;
    if (splitStaticSeKeyAhead({ hostNode, body, at, jobs, markRewrite })) return;
    // statement-per-declarator split, in SOURCE order: each declarator's extractions land
    // ahead of its own residual, and untouched siblings keep their own statements
    const exported = jobs.some(job => job.exported),
          statements = [];
    let touched = jobsByDeclarator.size > 0;
    for (const declarator of hostNode.declarations) {
      const declMemoJobs = memoDeclJobs.get(declarator);
      if (declMemoJobs) {
        const emitted = emitMemoDeclarator({ hostNode, declarator, declJobs: declMemoJobs, statements, exported });
        touched ||= emitted;
        if (emitted !== 'consumed') statements.push(exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported));
        continue;
      }
      const declJobsHere = jobsByDeclarator.get(declarator) ?? [];
      // an ALL-sentinel declarator off a plain identifier splits its residual PER GROUP:
      // each job prop opens a group (its sentinel + the non-job props after it), a
      // DEFAULTED job places its extraction after the group's residual (the guard reads
      // past the key effect), a plain one before - the catch SE-key evaluation order
      if (declJobsHere.length && declarator.init?.type === 'Identifier'
        && declJobsHere.every(job => job.sentinel && job.seKey && job.catchBorn && !job.chain?.length)
        && !exported && declarator.id.type === 'ObjectPattern'
        // the split changes evaluation shape only where a DEFAULTED SE-key needs its
        // residual ahead, or several key effects interleave with extractions - and it is
        // the CATCH relocation's channel; block hosts keep the single residual
        && declJobsHere.some(job => job.defaulted || declJobsHere.length > 1)) {
        emitSentinelGroups({ hostNode, declarator, declJobs: declJobsHere, statements });
        touched = true;
        continue;
      }
      // the memo lands FIRST: the join reads a re-readable identifier init, which is what
      // the memo just made this one (`const _ref = getArr(), { ..._unused } = _ref, fl = ...`)
      // the node that memo HOLDS: a literal-receiver plan naming the same read joins this
      // binding instead of declaring a second copy of it
      const refName = memoByDeclarator.get(declarator);
      const memoisedInit = emitDeclaratorMemo({
        refName, declarator, statements,
        declJobs: jobsByDeclarator.get(declarator) ?? [],
        kind: hostNode.declarations.length > 1 ? 'const' : hostNode.kind,
      });
      if (joinSeKeySiblingDeclarator({
        hostNode, declarator, declJobsHere, exported, statements, markRewrite, refName,
      })) {
        touched = true;
        continue;
      }
      emitLiteralReceiverMemos({
        declarator, jobs: jobsByDeclarator.get(declarator) ?? [], statements, kind: hostNode.kind, mintRefName,
        hostRef: refName, hostInit: memoisedInit,
      });
      const emptied = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0,
            emptiedAt = statements.length;
      // a LITERAL CONTAINER's discarded siblings evaluate BEFORE the slot the extraction
      // read, so they ride the value as a sequence prefix (`{ 1: { keys } } = [bump(),
      // Object]` -> `const keys = (bump(), _Object$keys)`); every other rescued init lifts
      // as its own statement ahead of the extraction, which is the sequence-init canon
      const containerPrefix = emptied ? literalContainerRescue(declarator, declJobsHere, adapter) : [],
            // ... and an init only the PROBE proved absent-able keeps its own read: the consume
            // discards it, and off-env that read is what throws
            // (`{ Array: { of } } = globalThis.window` leads with `(null == _globalThis.window
            // ? void 0 : _globalThis.window).Array`)
            probeRead = emptied && !containerPrefix.length
              && declJobsHere.every(job => !job.readsReceiver && !job.seLifted)
              ? renderDiscardedInitProbe(declJobsHere, probeRenderCtx) : null,
            extractedHere = [];
      for (const job of orderDeclaratorJobs(jobsByDeclarator.get(declarator) ?? [])) {
        const leading = extractedHere.length !== 0 ? []
          : [...containerPrefix.map(expr => cloneNode(expr)), ...probeRead ? [probeRead] : []],
              value = leading.length ? sequenceExpression([...leading, job.value(refName)]) : job.value(refName);
        const declarators = [variableDeclarator(job.bindingTarget, value)];
        if (job.value.leadRef) declarators.unshift(variableDeclarator(identifier(job.value.leadRef)));
        extractedHere.push(exportWrap(variableDeclaration(hostNode.kind, declarators), exported));
      }
      if (!emptied) {
        // the re-anchor serves a residual the extraction LEFT BEHIND; an untouched
        // sibling declarator keeps its raw pattern (babel anchors only what it consumed)
        // ... and it keeps its own SOURCE slot: a hop written before every consumed one is
        // emitted first (`{ [S]: kept } = _Map; const fe = _Object$fromEntries;`). asked
        // BEFORE the re-anchor, which swaps the pattern for the hop's own inner one
        const residualFirst = residualPrecedesExtractions(declarator, declJobsHere, sourceProps.get(declarator));
        const anchored = declJobsHere.length > 0 && reanchorSoleCtorHopResidual(declarator);
        if (anchored) touched = true;
        const residual = exportWrap(variableDeclaration(hostNode.kind, [declarator]), exported);
        // only an ANCHORED residual re-homes: a raw one stays where the extraction left it
        if (residualFirst && anchored) statements.push(residual, ...extractedHere);
        else statements.push(...extractedHere, residual);
      } else {
        statements.push(...liftedSePrefixStatements(declarator, declJobsHere), ...extractedHere);
        if (declJobsHere.length && !containerPrefix.length) {
          rescueEmptiedDeclaratorInit({ declarator, declJobsHere, statements, insertAt: emptiedAt });
        }
      }
    }
    if (!touched) return;
    markRewrite();
    body.splice(at, 1, ...anchorLeadingStatement(statements, hostNode));
  }

  // a residual whose SOLE prop is a ctor hop over the surface re-anchors on the pure ctor
  // (`{ Promise: { customZ } } = _globalThis` -> `{ customZ } = _Promise`); pristine proxy
  // KEYS peel first (`{ globalThis: { Map: { g } } }` anchors at Map). a sibling key at the
  // outer level keeps the proxy-root residual (the boundary babel holds)
  // the init's SURFACE view: a bare identifier, a sequence whose tail reads the surface,
  // or a kept write storing it - each re-anchors by swapping only the VALUE slot
  function surfaceInitInfo(declarator) {
    const init = peelWrappers(declarator.init);
    let tail = init;
    let shape = 'ident';
    if (tail?.type === 'SequenceExpression') {
      shape = 'seq';
      tail = peelWrappers(tail.expressions.at(-1));
    }
    if (tail?.type === 'AssignmentExpression') {
      shape = shape === 'seq' ? null : 'assign';
      tail = peelWrappers(tail.right);
    }
    // an ALL-proxy SELECTING tail names the same surface on every live branch, so the
    // selection drops with the re-anchor (`c ? globalThis : self` -> `_globalThis.Array`)
    if ((tail?.type === 'ConditionalExpression' || tail?.type === 'LogicalExpression')
      && allProxySelectingInit(tail, { adapter, injectorState })) tail = firstProxyBranch(tail);
    // a GUARD-shaped tail (the probe render) yields the surface its ALTERNATE names, and the
    // residual reads the hop off the WHOLE guard - the source's own read, undefined where the
    // probe is (`(null == _globalThis.window ? void 0 : _self).Object`)
    const guarded = shape === 'ident' && tail?.type === 'ConditionalExpression'
      && tail.consequent?.type === 'UnaryExpression' && tail.consequent.operator === 'void'
      && !!proxySurfaceIdentifier(tail.alternate, { adapter, injectorState });
    if (guarded) return { init, tail, shape: 'guard' };
    if (!shape || !proxySurfaceIdentifier(tail, { adapter, injectorState })) return null;
    return { init, tail, shape };
  }

  function reanchorSoleCtorHopResidual(declarator,
    { forceMutatedHop = false, wholeDeclarator = false, metaPath = null, hopKeyName = null } = {}) {
    const info = surfaceInitInfo(declarator);
    if (!info) return false;
    let changed = false;
    for (;;) {
      const pattern = declarator.id;
      if (pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return changed;
      const [hop] = pattern.properties;
      // a slot DEFAULT on the hop is dead for a step that navigates the same surface - the
      // pattern under it is what binds (`{ self: { a } = {} }` anchors like `{ self: { a } }`)
      const hopPattern = hop.value?.type === 'AssignmentPattern' ? hop.value.left : hop.value;
      if (hop.type !== 'Property' || hopPattern?.type !== 'ObjectPattern' || !hopPattern.properties.length) {
        return changed;
      }
      // a DEFAULT at any depth defers (the re-anchored render would drop a polyfillable
      // default); a `core-js-disable` mark on the hop or a leaf keeps the residual raw
      // a REST inside the hop anchors too - its exclusion set rides the pure ctor (the
      // symbol-extract channel's locked shape)
      // a polyfillable default on the hop's OWN prop rides the re-anchor - the residual keeps it
      // spelled and its claim renders in place; one NESTED deeper would be re-rendered verbatim
      // and lose that claim (`Set: { union, nested: { customA = [1].at(0) } }` bails)
      if (hopPattern.properties.some(item => item.type !== 'Property' && item.type !== 'RestElement')
        || hopPattern.properties.some(item => {
          const leaf = item.type === 'Property' && item.value?.type === 'AssignmentPattern'
            ? item.value.left : item.value;
          return leaf?.type === 'ObjectPattern' && patternHasPolyfillableDefault(leaf);
        })) return changed;
      if (isDisabled?.(hop) || hopPattern.properties.some(item => isDisabled?.(item))) return changed;
      const key = hop.computed ? peelWrappers(hop.key) : hop.key;
      const keyName = hop.computed
        ? (key?.type === 'Literal' && typeof key.value === 'string' ? key.value : hopKeyName)
        : key?.name ?? (typeof key?.value === 'string' ? key.value : null);
      if (typeof keyName !== 'string') return changed;
      // a possible-global HOP over a guarded value navigates the same surface, so it drops with
      // the guard standing - the ctor-hop arm below is the one the guard shape serves
      if (POSSIBLE_GLOBAL_OBJECTS.has(keyName) && info.shape !== 'guard') {
        // a REST under the proxy key stays put - babel keeps the hop spelled (the
        // exclusion set reads the hop's own surface)
        if (!isPristineProxyGlobal(adapter, keyName)
          || hopPattern.properties.some(item => item.type === 'RestElement')) return changed;
        declarator.id = hopPattern;
        // the flatten rewrote the pattern, so the init re-emits as the surface it resolved to: a
        // TS assertion about the SOURCE spelling asserts nothing about that
        // (`((eff(), globalThis) as any)` -> `(eff(), _globalThis)`)
        if (info.init !== declarator.init) declarator.init = info.init;
        // a kept-write init re-reads the surface AFTER the write (`(q = _globalThis,
        // _globalThis)`); ident / seq spellings already read it
        if (info.shape === 'assign') {
          declarator.init = reanchoredInit(declarator, info, null);
          // the re-read is CLONED, and a flatten running DURING the walk clones a root the
          // substitution has not reached yet - it swaps here, as every detached copy does
          if (metaPath) {
            substituteProxyRootsInClone(declarator.init, metaPath,
              { adapter, resolveGlobalPolyfill, injectPureImport });
          }
        }
        changed = true;
        continue;
      }
      // a MUTATED slot holds the user's shim: no static behind it resolves, so the residual
      // re-anchors on the hop's own member READ (`{ groupBy } = _globalThis.Map`) - it
      // flattens whether or not the extraction consumed anything inside
      // a residual an extraction LEFT BEHIND keeps its nested spelling on a mutated hop
      // (babel anchors only what it consumed); a whole-declarator mutated hop flattens,
      // and only the drain's own note reaches here with that proof
      const mutatedHop = adapter.isMutatedStatic('globalThis', keyName);
      if (mutatedHop && !forceMutatedHop) return changed;
      // under a GUARD the hop is read off the guarded VALUE, never off a ctor binding: the
      // ponyfill would answer where the source's probe yields undefined
      const pure = mutatedHop || info.shape === 'guard' ? null : resolveGlobalPolyfill(keyName);
      // the member-read anchor serves a hop the extraction consumed INSIDE (a sentinel
      // rename or a rest exclusion prove it); an untouched hop - a duplicate-key bail's
      // survivor included - keeps the raw residual (babel anchors only what it consumed)
      // ... and a POLYFILLABLE DEFAULT on the hop's own prop is that proof too: its claim
      // rendered in place, so the residual is no longer the raw one the source wrote
      if (!mutatedHop && !pure && !wholeDeclarator && !patternHasPolyfillableDefault(hopPattern)
        && hopPattern.properties.every(item => !(item.type === 'RestElement'
          || (item.type === 'Property' && item.value?.type === 'Identifier'
            && item.value.name?.startsWith('_unused'))))) return changed;
      declarator.id = hopPattern;
      // no pure ctor: the residual re-anchors on the hop's member READ off the surface
      // (`{ from: _unused, ...arrRest } = _globalThis.Array` - babel's shape)
      declarator.init = reanchoredInit(declarator, info, pure
        ? identifier(injectPureImport(pure.entry, pure.hintName))
        : memberFromKeyName(cloneNode(info.tail), keyName));
      return true;
    }
  }

  function drainAssignment({ hostNode, body, at, jobs, inSequence = false }) {
    if (jobs[0].bodyless) {
      drainBodylessAssignment({ hostNode, jobs },
        { program, markRewrite, mintRefName, removeConsumedProps, reanchorSoleCtorHopResidual });
      return;
    }
    // an ALL-ANCHORED line has no consumed sibling to drive the split: every job would only
    // re-read its own hop off the pure ctor, and babel leaves that line whole on the substituted
    // global proxy (`({ Set: { intersection }, WeakSet: { customW } } = _globalThis)`)
    // (a SOLE hop keeps its own re-anchor - that shape is the sole-ctor-hop residual's)
    if (jobs.length > 1 && jobs.every(job => job.prop?.value?.type === 'ObjectPattern')) return;
    // babel's cascade order: FLAT extractions run before the residual, NESTED-hop
    // extractions after it; a SE-keyed sentinel keeps the residual FIRST (its key effect
    // must precede the lookup). the seKey view reads the prop's key before any rename
    // the demotion is asked PER JOB: a rest-forced hop follows the residual, but a FLAT
    // sibling beside it keeps its place ahead (its own slot read owes the hop nothing)
    function demotedBehindResidual(job) {
      return !!job.chain?.length
        || (job.sentinel && job.prop.computed && computedKeyHasSideEffects(job.prop));
    }
    const seKeyResidualFirst = jobs.some(job => job.sentinel
      && job.prop.computed && computedKeyHasSideEffects(job.prop));
    const flatJobs = jobs.filter(job => !demotedBehindResidual(job)),
          nestedJobs = jobs.filter(job => demotedBehindResidual(job));
    const flatExtracted = flatJobs
      .map(job => expressionStatement(assignmentExpression('=', propBindingTarget(job.prop), job.value())));
    const nestedExtracted = nestedJobs
            .map(job => expressionStatement(assignmentExpression('=', propBindingTarget(job.prop), job.value()))),
          // the SOURCE slot of the residual, read before the removal empties the pattern: an
          // anchored residual keeps its own place among the extractions (babel's cascade)
          assignSourceProps = jobs[0].assignment.left?.type === 'ObjectPattern'
            ? [...jobs[0].assignment.left.properties] : null;
    removeConsumedProps(jobs);
    const [{ assignment }] = jobs,
          residualPrecedes = residualPrecedesExtractions({ id: assignment.left }, jobs, assignSourceProps,
            { sharedHop: true }),
          // an effectful read the consume DISCARDS still runs: the whole read lifts as its own
          // statement ahead of the extractions (`({ any } = globalThis[(e++, 'Promise')])`)
          discardedRead = assignment.left?.type === 'ObjectPattern' && !assignment.left.properties.length
            && jobs.some(job => job.rawKeyRootInit) ? assignment.right : null;
    // the receiver read by an extraction AND by the surviving residual memoizes once - the
    // verdict needs the residual as it survives, so the values re-render onto the ref here
    const memoRef = assignmentMemoRef(assignment, jobs, mintRefName),
          memoDecl = memoRef ? [variableDeclaration('const',
            [variableDeclarator(identifier(memoRef), assignment.right)])] : [];
    if (memoRef) {
      for (const [index, job] of [...flatJobs, ...nestedJobs].entries()) {
        [...flatExtracted, ...nestedExtracted][index].expression.right = job.value(memoRef);
      }
      assignment.right = identifier(memoRef);
    }
    // an INNER-rest hop re-anchors: the outer hop drops, the inner pattern reads the hop
    // nav directly (`({ Object: { k: _unused, ...inner } } = g)` ->
    // `({ k: _unused, ...inner } = _g.Object)`)
    // ... and so does a CONSUMED one that left survivors behind: the outer hop has nothing but
    // the inner pattern under it, so the residual reads the hop directly - through the pure CTOR
    // where the hop names one (`({ allSettled: _unused, ...r } = _Promise)`)
    if (jobs.length === 1 && jobs[0].chain?.length
      && (jobs[0].sentinel || jobs[0].pattern.properties?.length)) {
      const [job] = jobs;
      const outer = job.chain.at(-1).outerPattern;
      if (outer.properties.length === 1 && job.chain.every(level => !level.outerRest)) {
        const ctorView = { id: assignment.left, init: assignment.right };
        if (reanchorSoleCtorHopResidual(ctorView)) {
          assignment.left = ctorView.id;
          assignment.right = ctorView.init;
        } else {
          assignment.left = job.pattern;
          assignment.right = job.chain.reduceRight(
            (acc, level) => memberExpression(acc, cloneNode(level.hopProp.key), { computed: level.hopProp.computed }),
            assignment.right,
          );
        }
      }
    }
    const anchoredResidual = anchorAssignmentResidual(assignment, jobs, reanchorSoleCtorHopResidual),
          // sentinel names declare ADJACENT to their statement (babel plants the `var` right there)
          mintedNames = jobs.flatMap(job => job.mintedSentinels ?? []);
    const varDecl = mintedNames.length
      ? [variableDeclaration('var', mintedNames.map(name => variableDeclarator(identifier(name))))] : [];
    // the lifted SE prefix of a consumed seq receiver runs first, once; a SURVIVING
    // residual then reads the quiet tail (`log(); ({ other } = wrapper);` - babel's lift)
    // the prefix is re-derived HERE: the collapse may have rebuilt the receiver since the job
    // recorded, so the recorded nodes can be the detached originals. only a sequence the
    // SOURCE wrote lifts - one the collapse MINTED (a kept write re-emitted beside the pure)
    // is the value's own spelling and stays whole, which its missing span tells us
    const peeledRhs = peelWrappers(assignment.right);
    // the WHOLE right recorded as the prefix is the call-branch lift (`(() => ...)();`) - it
    // re-emits as a statement whatever the receiver shape is now
    const wholeRhsLift = jobs[0].seqPrefix?.length === 1 && jobs[0].seqPrefix[0] === assignment.right;
    // ... and a MINTED sequence counts as that source one where the collapse rebuilt it AROUND
    // the recorded prefix: the very nodes the job recorded still lead it, so the tail is the
    // resolved receiver and the prefix lifts to where the source ran it
    const rebuiltSeqPrefix = !!jobs[0].seqPrefix?.length && peeledRhs?.type === 'SequenceExpression'
      && !Number.isInteger(peeledRhs.start)
      && peeledRhs.expressions.length === jobs[0].seqPrefix.length + 1
      && jobs[0].seqPrefix.every((node, index) => spellsSameSource(peeledRhs.expressions[index], node));
    const rhsExprs = !wholeRhsLift && jobs[0].seqPrefix?.length && peeledRhs?.type === 'SequenceExpression'
      && (Number.isInteger(peeledRhs.start) || rebuiltSeqPrefix) ? peeledRhs.expressions : null;
    // a hop ANCHOR re-emits the receiver as its extraction's own RHS, and inside a SEQUENCE
    // slot there is no statement ahead of it to lift into: the prefix rides that RHS, where the
    // source wrote it (`({ customW } = (c++, _Map))`)
    const anchorRhsPrefix = inSequence && !wholeRhsLift && rhsExprs && jobs.length === 1
      && jobs[0].prop?.value?.type === 'ObjectPattern' ? rhsExprs.slice(0, -1) : null;
    const stmtSeqPrefix = anchorRhsPrefix ? []
      : wholeRhsLift ? [expressionStatement(assignment.right)]
      : rhsExprs ? rhsExprs.slice(0, -1).map(expr => expressionStatement(expr)) : [];
    if (rhsExprs && stmtSeqPrefix.length && assignment.left.properties.length !== 0) {
      assignment.right = rhsExprs.at(-1);
    }
    if (assignment.left.properties.length === 0) {
      // with no residual left there is nothing for the cascade to order against: the extractions
      // run in the order the SOURCE wrote their hops (`from = _Array$from; ({ union } = _Set);`)
      const bySource = [...flatJobs, ...nestedJobs].map((job, index) => ({
        stmt: [...flatExtracted, ...nestedExtracted][index],
        at: assignSourceProps?.indexOf(job.chain?.length ? job.chain.at(-1).hopProp : job.prop) ?? -1,
      })).sort((left, right) => left.at - right.at).map(entry => entry.stmt);
      if (anchorRhsPrefix?.length && bySource.length) {
        bySource[0].expression.right = sequenceExpression([...anchorRhsPrefix, bySource[0].expression.right]);
      }
      // the consume DISCARDS the read the source performs off a guarded init: the first
      // extraction leads with it, rebuilt off the rendered guard (`v = ((null ==
      // _globalThis.window ? void 0 : _self).Math, _Math$sign)`) - the declaration's own rule
      const probeLead = discardedRead ? null : renderDiscardedInitProbe(jobs, probeRenderCtx);
      if (probeLead && bySource.length) {
        bySource[0].expression.right = sequenceExpression([probeLead, bySource[0].expression.right]);
      }
      // an SE init NOTHING evaluated (no memo, no lifted prefix, no reader) keeps its own
      // discarded statement ahead - dropping it would erase the call the source performs;
      // an ANCHOR job (a pattern-valued hop) and a SEQUENCE slot own their RHS already
      const rhsKept = !inSequence && !memoDecl.length && !stmtSeqPrefix.length && !discardedRead && !probeLead
        && jobs.every(job => !job.readsReceiver && job.prop?.value?.type !== 'ObjectPattern')
        && mayHaveSideEffects(assignment.right)
        ? [expressionStatement(assignment.right)] : [];
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl,
        ...discardedRead ? [expressionStatement(discardedRead)] : [], ...rhsKept, ...bySource);
    } else if (seKeyResidualFirst || (anchoredResidual && residualPrecedes)) {
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, body[at], ...flatExtracted, ...nestedExtracted);
    } else if (anchoredResidual) {
      // an ANCHORED residual re-homes to its own source slot - past every extraction whose
      // hop the source wrote first (`g2 = _Object$fromEntries; ({ [S]: f2 } = _Set);`)
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, ...flatExtracted, ...nestedExtracted, body[at]);
    } else {
      body.splice(at, 1, ...stmtSeqPrefix, ...memoDecl, ...varDecl, ...flatExtracted, body[at], ...nestedExtracted);
    }
  }

  // a bodyless `var` destructure whose EVERY binding extracts replaces the slot with a
  // block of `var local = pure;` statements (babel's scope.push shape); a partial consume
  // keeps the declaration raw - the residual would still need its receiver
  function drainBodylessDeclaration({ hostNode, jobs }) {
    const [{ declaration }] = jobs;
    // MULTI-declarator: the statement fits the slot as-is - each jobbed declarator keeps
    // its (renamed) residual and appends the extraction as a SIBLING declarator after it
    // (`var first = init, { [SE]: _unused } = rows, fm = _flatMapMaybeArray(rows);`)
    if (declaration.declarations.length > 1) {
      // a job needing a MEMO cannot ride the comma list: the memo is a statement, so the slot
      // becomes a block and each declarator lands as its own statement inside it
      if (jobs.some(job => job.needsMemo || job.seqPrefix?.length)) {
        return drainBodylessMultiMemo({ hostNode, declaration, jobs },
          { program, mintRefName, removeConsumedProps, markRewrite });
      }
      const byDeclarator = new Map();
      for (const job of jobs) {
        if (!byDeclarator.has(job.declarator)) byDeclarator.set(job.declarator, []);
        byDeclarator.get(job.declarator).push(job);
      }
      const declarators = [];
      for (const declarator of declaration.declarations) {
        const declJobs = byDeclarator.get(declarator) ?? [];
        const extracted = declJobs.map(job => variableDeclarator(identifier(job.local), job.value()));
        removeConsumedProps(declJobs);
        const emptied = declarator.id.type === 'ObjectPattern' && declarator.id.properties.length === 0;
        if (!emptied) declarators.push(declarator);
        declarators.push(...extracted);
      }
      declaration.declarations = declarators;
      markRewrite();
      return;
    }
    const [declarator] = declaration.declarations;
    // an ARRAY-wrapped pattern hosts the same way - only its residual spelling differs: the
    // quiet tail lands in the ELEMENT slot and the wrapper survives with it
    const arrayWrapped = declarator.id?.type === 'ArrayPattern';
    if (!arrayWrapped && declarator.id?.type !== 'ObjectPattern') return;
    const memoRef = jobs.some(job => job.needsMemo) ? mintRefName() : null;
    // SE-KEY sentinels over a re-readable init interleave into ONE declaration, so the slot
    // needs no block at all (`if (c) var { [k1]: _u } = r, a = ..., { [k2]: _u2 } = r, b = ...`)
    // ... but only under a DEFAULT: the guard must read PAST its own key effect, so segment and
    // extraction have to alternate. plain slots keep the block, extractions ahead of the residual
    if (!arrayWrapped && !memoRef && jobs.every(job => !job.seqPrefix?.length)
      && jobs.some(job => job.defaulted)
      && declarator.init?.type === 'Identifier' && declarator.id?.type === 'ObjectPattern'
      && jobs.every(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop)
        && !job.chain?.length && job.pattern === declarator.id)) {
      for (const job of jobs) job.bindingTarget = identifier(job.local);
      removeConsumedProps(jobs);
      declaration.declarations = interleavedSeKeySegments(declarator, jobs, null);
      markRewrite();
      return;
    }
    const statements = [];
    // the lifted SE prefix runs FIRST, once; the residual (and the memo) read the tail
    const [{ seqPrefix, initTail }] = jobs;
    const values = jobs.map(job => job.value(memoRef));
    // a SOLE extraction that READS its receiver (a dispatch with one argument) carries the
    // prefix INSIDE that argument, and the slot keeps its single statement (`if (c) var
    // iter = _getIteratorMethod((se(), obj));`). a receiver-LESS static discards the read,
    // so its prefix must lift and the slot becomes a block
    const ridesArgument = !!seqPrefix?.length && !memoRef && jobs.length === 1
      && values[0]?.type === 'CallExpression' && values[0].arguments.length === 1;
    // ... and a MEMOIZED init keeps its sequence WHOLE: the memo is where it evaluates, and
    // lifting the prefix out of it would take the claims rendered inside that prefix with it
    if (seqPrefix?.length && !memoRef) {
      if (ridesArgument) {
        values[0].arguments[0] = sequenceExpression([
          ...seqPrefix.map(expr => cloneNode(expr)), values[0].arguments[0],
        ]);
      } else for (const expr of seqPrefix) statements.push(expressionStatement(expr));
      const [{ initHost }] = jobs;
      if (arrayWrapped && initHost) replaceNodeInTree(declarator.init, initHost, initTail);
      else declarator.init = initTail;
    }
    if (memoRef) {
      // the memo is the synthetic block's own binding, and its kind follows the SE-KEY
      // sentinel alone: that residual is planted by the same `var` channel as the segments it
      // interleaves with, while a plain or REST-kept one takes the `const` the block scopes
      // (measured on the other emitters, either host)
      // ... and a job carrying a resolved ELEMENT memoizes THAT node, the kept init reading
      // the ref in its slot
      const elementNode = jobs.find(job => job.nestedMemoNode)?.nestedMemoNode ?? null;
      statements.push(variableDeclaration(
        jobs.some(job => job.sentinel && job.prop?.computed && computedKeyHasSideEffects(job.prop)) ? 'var' : 'const',
        [variableDeclarator(identifier(memoRef), elementNode ?? declarator.init)]));
      if (elementNode) replaceNodeInTree(declarator.init, elementNode, identifier(memoRef));
      else declarator.init = identifier(memoRef);
    }
    statements.push(...jobs.map((job, at) => variableDeclaration('var',
      [variableDeclarator(identifier(job.local), values[at])])));
    removeConsumedProps(jobs);
    // a PARTIAL consume keeps the residual as its own `var` declaration inside the block
    // (`if (c) var { from, isArray } = Array;` -> `{ var from = _X; var { isArray } = Array; }`)
    const residualLives = arrayWrapped
      ? declarator.id.elements.some(element => element
        && !(element.type === 'ObjectPattern' && element.properties.length === 0))
      : declarator.id.properties.length !== 0;
    if (residualLives) statements.push(declaration);
    const replacement = statements.length === 1
      ? statements[0] : { type: 'BlockStatement', body: statements };
    if (replaceNodeInTree(program, hostNode, replacement)) markRewrite();
  }

  // catch-clause receiver relocation, the babel emitter's `extractCatchClause` on the estree
  // substrate: `catch ({ pattern }) {` becomes `catch (_ref) { let { pattern } = _ref;` and the
  // relocated declaration rides the ordinary declarator machinery of this ledger. runs from the
  // CatchClause visitor BEFORE the pattern's props fire their metas, so every gate below decides
  // on the source shape; both gates are the shared provider predicates the babel twin asks
  function extractCatchClause(path) {
    const { param } = path.node;
    if (param?.type !== 'ObjectPattern' || !param.properties?.length) return;
    const resolvableProps = param.properties.filter(prop => {
      if ((prop.type !== 'Property' && prop.type !== 'ObjectProperty') || prop.computed) return false;
      const key = prop.key?.name ?? prop.key?.value ?? null;
      return key !== null && !!resolvePure({ kind: 'property', object: null, key, placement: null }, path);
    });
    const hasMachinery = param.properties.some(prop => computedPropKeyHostsMachinery({
      propNode: prop, scope: path.scope, adapter, path, resolvePure: m => resolvePure(m, path),
    }));
    if (!hasMachinery && !resolvableProps.length) return;
    const unobservable = resolvableProps.filter(prop => !catchPropRewriteObservable({
      propNode: prop, patternNode: param, bodyNode: path.node.body,
      localName: prop.value?.type === 'Identifier' ? prop.value.name : null,
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
    }));
    if (!hasMachinery && unobservable.length === resolvableProps.length) return;
    for (const prop of unobservable) skippedNodes.add(prop);
    const refName = mintRefName();
    path.node.body.body.unshift(variableDeclaration('let', [variableDeclarator(param, identifier(refName))]));
    path.node.param = identifier(refName);
  }

  return {
    extractCatchClause, handleObjectPropertyResult, handlePerBranch, drain,
    sentinelAlreadyProcessed: args => sentinelAlreadyProcessed({ ...args, injectorState }),
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
      const init = host?.node?.type === 'VariableDeclarator' ? peelWrappers(host.node.init) : null;
      if (init?.type !== 'CallExpression' || init.optional) return false;
      const returned = inlineCallReturnExpression({
        callNode: init, scope: metaPath.scope, adapter, seen: new Set(), path: metaPath, rejectConditional: true,
      });
      // ... and only where the yielded value carries an EFFECT the extraction would drop: the
      // call evaluation runs its argument, and the harvest has no channel for argument effects.
      // a quiet identity call discards cleanly and keeps the ordinary extraction
      let value = returned && peelWrappers(returned);
      let effectful = false;
      while (value?.type === 'SequenceExpression') {
        effectful ||= value.expressions.slice(0, -1).some(expr => mayHaveSideEffects(expr));
        value = peelWrappers(value.expressions.at(-1));
      }
      return effectful && value?.type === 'Identifier' && isPristineProxyGlobal(adapter, value.name);
    },
    // an ARRAY-WRAPPED pattern resolves no receiver of its own in the meta funnel - the
    // element is positional, so a SELECTING one never reaches the mirror through the meta's
    // fallback flag. the host shape answers instead (`[{ Array: { from } }] = [c ? gw : o]`)
    arrayWrappedSelectingHost(metaPath) {
      if (metaPath.parentPath?.node?.type !== 'ObjectPattern') return false;
      const element = peelWrappers(resolveArrayWrappedReceiver(metaPath.parentPath)?.element);
      return !!element && !!getFallbackBranchSlots(element);
    },
    noteMutatedCtorHopHost: declarator => hopHosts.set(declarator, { forceMutatedHop: true }),
    // a CTOR hop nothing extracted from re-anchors on its own member READ (`{ A$b: { from } }
    // = globalThis` -> `{ from } = _globalThis.A$b`) - only where the key qualifies as a
    // CONSTRUCTOR name the anchor may spell (the shared ctor-key-anchor gate): a lowercase
    // `constructor` names no global slot, and a non-identifier key has no member form
    noteUntouchedCtorHopHost(declarator, keyName, assignHost = false) {
      if (!hopHosts.has(declarator) && isStaticPlacement(keyName)) {
        // the key the WALK resolved travels with the note: a computed spelling bound to a
        // constant (`{ [hopKey]: { viaKey } }`) names no literal the re-anchor could read
        hopHosts.set(declarator, { untouched: true, wholeDeclarator: true, assignHost, hopKeyName: keyName });
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
    isAllProxySelectingInit: node => allProxySelectingInit(node, { adapter, injectorState }),
    // has any claim of this pattern reached the pipeline? the usage emitter's hop-collapse
    // verdict asks it: an UNCLAIMED pattern has no channel that re-renders its receiver, so a
    // collapse there would be the ONLY spelling - and under a value-observing carrier the hops
    // the source wrote have to survive. the pattern is visited before the init, so the answer
    // is complete by the time the init's claims land
    patternClaimed(patternNode) {
      for (const [, { jobs }] of ledger) {
        if (jobs.some(job => job.pattern === patternNode)) return true;
      }
      return false;
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
        localName, hint: hopKey, stmtPath: declarationPath,
        bindingNode: aliasBinding.node, binding: aliasBinding,
      });
    },
  };
}
