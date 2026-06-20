// destructure rewrite pipeline. covers parameter-default synth-swap, top-level
// VariableDeclaration extraction, catch-clause rewrite, per-branch fallback synth-swap, and
// the nested proxy-global flatten path (`const {Array:{from}} = globalThis` -> `const from
// = _Array$from`). factory captures closure deps from the outer transform context (code /
// scopeTracker / transforms / injector / Sets / resolver hooks + helpers from the
// PolyfillEmitter factory). pending-collection Maps for in-flight destructure / synth-swap
// rewrites live in factory closure (drained post-traverse via the public methods).
// public surface: `applyDestructuringTransforms`, `applySynthSwaps`, `handleDestructuringPure`,
// `canFullyConsumeProxyDeclarator` (pre-pass speculation)
import {
  isReceiverShapedNode,
  buildFlatSynthEntries,
  paramsHaveInvisibleCallers,
  FUNCTION_LIKE_NODE_TYPES,
  findArrayWrappedDestructureHost,
  getFallbackBranchSlots,
  hasRestSiblingExcept,
  isBindingPosition,
  isFunctionParamDestructureParent,
  computedKeysAllBound,
  dropDeadSequenceTail,
  isIdentifierPropValue,
  isNonReferencePosition,
  isSynthSimpleObjectPattern,
  markAndPeelSkippableWrappers,
  mayHaveSideEffects,
  synthSwapPropKey,
  objectPatternPropNeedsReceiverRewrite,
  peelFallbackBranchInner,
  peelNestedSequenceExpressions,
  peelParenAndTSParentPath,
  peelToExpressionStatement,
  propBindingIdentifier,
  resolveFallbackReceiver,
  sequenceKeyPrefix,
  TS_EXPR_WRAPPERS,
  unwrapParens,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  globalProxyMemberName,
  isAliasProxyRoot,
  markSynthReceiverSkipped,
  memberKeyName,
  symbolKeyToEntry,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import {
  findProxyGlobal,
  isCallShape,
  isStaticPlacement,
  maximalProxyGlobalHop,
  maximalProxyGlobalPrefix,
  proxyGlobalWrappedRoot,
  resolveSynthKeys,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { collectFallbackCollapseLeftSe } from '@core-js/polyfill-provider/detect-usage/members';
import {
  applyNestedParamSynthPlan,
  renderSynthTree,
  classifyCallBranchForSynth,
  buildNestedParamSynthPlan,
  destructureValueBranchesAllProxy,
  outerDestructureReceiver,
  isConstantLiteralReceiver,
  isReReferenceableReceiver,
  isViableBranchForKey,
  nestedAssignmentStatementOf,
  conditionalDestructureLeftUntouchedWarning,
  fallbackDestructureHasPolyfillableBranch,
  planSideEffectKeyStrategy,
  qualifiesForParamBodyExtract,
  resolveNestedReceiverNode,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  buildNestedDestructurePlan,
  peelArrayWrapperPair,
} from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { classifyVariableDeclarationHost } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  canTransformDestructuring,
  findSynthSwapReceiver,
  walkUpNestedDestructureToAssignment,
  walkUpNestedDestructureToDeclaration,
} from './destructure-emit-utils.js';
import { parenthesizeExprStmtHazard, skipDirectivePrologue, walkAstNodes } from './plugin-helpers.js';

// scope-walker constants for `polyfillSiblingReceiverRefs`. hoisted module-level so each
// call doesn't re-allocate the Sets. SwitchStatement creates one shared block scope per
// ES spec; `using` / `await using` are TC39 stage-4 lexical kinds (block-scoped, treated
// like let/const for shadow detection)
const SIBLING_LEXICAL_SCOPE_OWNERS = new Set([
  'BlockStatement',
  'CatchClause',
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'SwitchStatement',
  // class*: id is bound in the class's own body scope (always for ClassExpression, also
  // for ClassDeclaration so methods see the class's own name). without this branch a
  // sibling like `class globalThis { m() { return globalThis; } }` would substitute the
  // inner reference to `_globalThis` even though it semantically points at the class
  'ClassExpression',
  'ClassDeclaration',
]);

const SIBLING_LEXICAL_DECL_KINDS = new Set([
  'let',
  'const',
  'using',
  'await using',
]);

// pure helper: text-range covering `propNode` in `props` PLUS its adjacent comma so the
// resulting source stays a valid ObjectPattern after splicing the range out. shapes:
//   - any prop with a NEXT sibling: [propStart, nextSiblingStart)  -> drops trailing `, `
//   - last prop in a multi-prop list: [prevSiblingEnd, propEnd)    -> drops leading `, `
//   - lone prop: [propStart, propEnd)                              -> empties the pattern
// uniform "trailing-comma except last" rule keeps adjacent removals non-overlapping:
// idx=0 takes [A.start, B.start), idx=1 takes [B.start, C.start), etc. - no two ranges
// share the same comma. an "idx=0 trailing, idx>0 leading" rule would fight over the
// middle comma when two adjacent props are both removed (`{from, of, [SYM]:x}` with
// from+of both polyfilled), tripping `transform-queue: partial overlap`
// `precededByRemoved` signals the immediately-preceding sibling was already removed (its
// trailing-comma range ran up to this prop's start, consuming the shared comma). for the LAST
// prop that flips the leading-comma rule to "own span only", since the leading comma is already
// gone - emitting `[prevEnd, propEnd)` there would partially overlap the predecessor's range and
// trip `transform-queue: partial overlap`. a contiguous tail-run thus leaves a harmless trailing
// comma (`{ x, }`, valid in a binding pattern); single tail removals keep the clean leading-comma
function getPropRemovalRange(props, propNode, precededByRemoved) {
  const idx = props.indexOf(propNode);
  if (idx === -1) return null;
  if (props.length === 1) return { start: propNode.start, end: propNode.end };
  const hasNext = idx < props.length - 1;
  const start = hasNext || precededByRemoved ? propNode.start : props[idx - 1].end;
  const end = hasNext ? props[idx + 1].start : propNode.end;
  return start < end ? { start, end } : null;
}

// pure helper: the `<value> === void 0 ? <default> : <value>` default-guard RHS for a destructured
// entry. when `ref` is given the value is memoized into it (`(ref = value) === void 0 ? d : ref`)
// so an instance-polyfill receiver (`_at(x)`) isn't evaluated twice. shared by the catch-prelude
// and byStatement comma-list emitters; each builds its own LHS / ref-declaration around this
function defaultGuardedRhs({ valueSrc, defaultSrc, ref }) {
  const test = ref ? `(${ ref } = ${ valueSrc })` : valueSrc;
  return `${ test } === void 0 ? ${ defaultSrc } : ${ ref || valueSrc }`;
}

// destructure-emit factory: orchestrates 20+ helpers across handleDestructuringPure /
// applyDestructuringTransforms / cascade / synth-swap pipelines, each with their own
// dedicated state. extracting into sub-factories would split the shared `pendingDestructuring`
// / `pendingSynthSwaps` / `pendingFlatten` / `pendingCascade` accumulators across module
// boundaries, which is what the single-factory shape avoids
/* eslint-disable max-statements -- factory orchestrator, see comment above */
export function createDestructureEmitter({
  paramDefaultNeverOverridden = null,
  estreeAdapter,
  getDebugOutput = null,
  injectPureImport,
  injector,
  isBodylessStatementBody,
  isDisabled,
  nodeSrc,
  resolveGlobalPolyfill,
  resolvePure,
  scopeTracker,
  skippedNodes,
  transforms,
}) {
  // ---------- shared emission helpers ----------

  // wrap multi-statement output in `{...}` when the host sits in an unbraced control body
  // (`if (...) <here>`, `while (...) <here>`, etc.). bodyless slots accept exactly one
  // statement; bare-emitting `s1; s2;` leaks all but the first out of the gate. consumers
  // pass the rendered source text plus an explicit `isMulti` flag - cheaper and clearer
  // than scanning the rendered string for a newline (which mis-fires on rendered tails
  // that legitimately contain a `\n` for cosmetic separation)
  function wrapBodylessIfMulti(src, isMulti, hostPath) {
    return isMulti && isBodylessStatementBody(hostPath) ? `{ ${ src } }` : src;
  }

  // emit the shared "conditional destructure left untouched" debug-warn when a fromFallback prop's
  // per-branch synth-swap could not be registered (no resolvable fallback receiver, or an unviable
  // pattern). gated on a GENUINE candidate (some branch actually polyfills the key) via the shared
  // provider predicate, so a key no branch polyfills does not get the misleading "polyfill candidate"
  // diagnostic. mirrors babel's identical warn via the single-sourced message helper + gate
  function warnConditionalFallbackUntouched(meta, metaPath) {
    // the gate (branch enumeration + resolution) is a debug-only concern - skip it entirely when
    // debug output is off, so the common build path pays nothing for the diagnostic
    const debug = getDebugOutput?.();
    if (!debug || !fallbackDestructureHasPolyfillableBranch(meta, metaPath, estreeAdapter, resolvePure)) return;
    debug.warn?.(conditionalDestructureLeftUntouchedWarning(meta.key));
  }

  // ---------- pending collections (drained post-traverse) ----------

  // ObjectPattern node -> { entries, allProps, declPath, declaratorPath, ... }. populated
  // by `handleDestructuringPure` as the visitor walks; drained by `applyDestructuringTransforms`
  // after traverse completes (full polyfill set per pattern known only after sibling visits)
  const pendingDestructuring = new Map();
  // receiver -> `{p: _polyfill, q: R.q, ...}` synth swaps. two detection shapes feed this map:
  //   - param-default `function({p} = R)`: receiver = AssignmentPattern.right
  //   - IIFE `(({p}) => body)(R)`: receiver = CallExpression.arguments[i]
  // entry shape: `{ receiver, objectPattern, polyfills: Map<key, binding> }`
  const pendingSynthSwaps = new Map();
  // ObjectPattern -> Set of its props already removed by param body-extract. lets each removal
  // see whether the preceding sibling was also removed, so a contiguous tail-run avoids the
  // shared-comma overlap (see `getPropRemovalRange`)
  const removedParamProps = new WeakMap();
  // side-effecting-computed-key props already handled by `tryHandleSideEffectKeyDeclaration` - re-entry
  // guard so a re-visited prop doesn't queue duplicate (conflicting) transforms
  const handledSideEffectKeyProps = new WeakSet();
  // receiver node -> the `_ref` name a body-extract memoized it into, so sibling leaves of the SAME
  // constant-literal receiver (`{ b: { at, flat } } = { b: [..] }`) share one hoist + one text replacement
  // instead of each duplicating the literal (see `memoizeReceiver` in `planSideEffectKeyStrategy`)
  const bodyExtractReceiverRefs = new Map();

  // ---------- nested proxy-global flatten ----------

  // tracks declarations already rewritten by `tryFlattenNestedProxy` so the visitor's
  // re-entry on every property of a flattened decl is a no-op idempotent
  const flattenedNestedDecls = new WeakSet();
  // parallel set for AssignmentExpression rewrites so per-prop visitor calls on the same
  // statement don't re-emit (first call handles ALL polyfilled props of the statement
  // through `rewriteDeclarator`'s upfront walk; subsequent calls short-circuit)
  const flattenedAssignments = new WeakSet();
  // deferred flatten payloads: tryFlattenNestedProxy fires DURING traverse (skip-marking
  // + pure-import injection MUST happen before sibling-subtree visit, otherwise visitor
  // emits parallel polyfill transforms). but the FINAL replacement text depends on
  // scope-tracker `var _ref;` bindings populated DURING the sibling visit. defer the
  // transforms.add registration until applyDestructuringTransforms - by then scope-tracker
  // has full state for `consumeRefBindingsInRange`
  const pendingFlatten = [];
  // mirror queue for AssignmentExpression cascade. same rationale: cascade fires DURING
  // traverse on the first polyfilled prop (must skip-mark before sibling visit), but a
  // sibling visit on the RHS may later register `var _ref;` inserts inside the SE-prefix
  // IIFE body that would land inside our [stmtStart, stmtEnd) overwrite. deferring
  // transforms.add to flush time lets us drain those inserts and bake them into the
  // pre-segment source first
  const pendingCascade = [];
  // SE-key trailing polyfill declarators (`, f = _flat(arr)`) deferred to flush: whether the
  // host declaration gets a whole-statement byStatement render is unknowable at the prop visit
  // (the claiming sibling may not have been visited yet), and a raw end-anchored insert under a
  // claim either trips the insert-inside-overwrite invariant or bakes INTO a wrapped init render
  const pendingSeKeyTrailing = [];
  // deferred instance-receiver copies (a consumed `eliminateResidual` extraction `m = _m(recv)`): the
  // receiver is kept VISIBLE for the natural visitor (so its globals / instance / static polyfill in
  // place, scope-aware - incl. function bodies a node-walk can't reach), then `composedRangeSrc` bakes
  // those substitutions into the receiver copy at flush. matches babel's re-traversed clone
  const pendingReceiverExtracts = [];
  // deferred DUPLICATED instance-receiver copies (the residual SURVIVES, so the receiver is both
  // kept in place AND copied into the extraction). like `pendingReceiverExtracts` the receiver stays
  // VISIBLE for the natural visitor; at flush `composedRangeSrc` bakes the visitor's full substitution
  // (globals / instance / static, incl. function bodies) into the copy text and re-adds it to the
  // surviving residual's receiver range, matching babel's clone+re-traverse duplicate. each entry's
  // `emit(text)` routes the copy to its branch-specific sink (trailing sibling / flatten slot /
  // standalone insert / assignment overwrite)
  const pendingReceiverCopies = [];
  // bodyless-control assignment statement node -> its appended nested-instance overwrites. a
  // bodyless control body (`if (c) STMT;`) holds one statement, so the overwrites must join STMT
  // inside a `{ }` block (else they run unconditionally) - accumulated here and block-wrapped once
  // at flush (a multi-element pattern appends several to the same statement)
  const pendingBodylessAssignOverwrites = new Map();
  // declarator node -> its skipped pendingDestructuring info, for declarators that share a
  // VariableDeclaration with a proxy-global flatten declarator. the byStatement emit skips them
  // (a second whole-declaration overwrite would collide on the flatten's range); instead the
  // flatten render emits their instance/static-method rewrite so the polyfill isn't lost
  const flattenSiblingInfos = new Map();
  // cascade-rewrite cache for AssignmentExpression hosts: stores `{result, unusedIds}`
  // computed once via `rewriteDeclarator` over a synthetic mock-declarator. unusedIds
  // are captured by tracking `injector.generateUnusedName()` calls during the first plan
  // walk - AssignmentExpression LHS slots must be pre-declared via `var _unused;`, unlike
  // VariableDeclarator where the destructure binding declares them directly
  const trackedUnusedNamesByAssign = new WeakMap();

  // `({Array: {from}} = receiver);` (AssignmentExpression in ExpressionStatement) - value is
  // discarded, so the destructure can be rewritten so polyfill always wins. unified cascade
  // path: `cascadeAssignmentExpression` plans the entire LHS via `rewriteDeclarator` (one
  // upfront walk picks up every polyfillable prop), emits SE-prefix lifts + optional
  // `var _unused;` declarations (rest case) + rewritten destructure or per-extraction
  // assigns. `flattenedAssignments` short-circuits sibling per-prop visitor re-entries.
  // a simple-flatten branch (no rest sibling) would emit only the FIRST prop's polyfill and
  // silently drop sibling extractions on multi-prop hosts - this unified path handles all props
  function tryFlattenAssignmentExpression(metaPath) {
    // shape gate: only proceed for shorthand / aliased / default-prop bindings - the same
    // shapes `cascadeAssignmentExpression` -> `rewriteDeclarator` plan walks
    if (!propBindingIdentifier(metaPath.node.value)) return false;
    const assignPath = walkUpNestedDestructureToAssignment(metaPath.parentPath);
    const assignNode = assignPath?.node;
    if (!assignNode || assignNode.operator !== '=') return false;
    // peel transparent wrappers between AssignmentExpression and ExpressionStatement so
    // `({...} = G)` (oxc parens), `({...} = G) as any` (TS cast), `({...} = G)?.x` (chain)
    // and minifier output `(0, ({...} = G))` (SequenceExpression with the AE as TAIL)
    // all reach the cascade. shared helper handles the SE-tail check and accumulates the
    // SE's leading expressions so the cascade can re-emit them as side-effect siblings
    const peeled = peelToExpressionStatement(assignPath);
    if (!peeled) return false;
    // already-flattened statement: per-prop visitor re-entry for sibling polyfills is a
    // no-op (the upfront `rewriteDeclarator` walk on first call already covered all of them)
    if (flattenedAssignments.has(assignNode)) return true;
    return cascadeAssignmentExpression({
      assignNode, stmtPath: peeled.exprStmt, scope: metaPath.scope, outerSequencePrefix: peeled.sequencePrefix,
    });
  }

  // run `fn` with `injector.generateUnusedName` wrapped so every name it emits is also
  // pushed onto `target`. used by the AssignmentExpression cascade path - the names
  // generated during `rewriteDeclarator`'s plan walk land inside the rendered preservedSrc
  // text, but we need them separately to emit `var _unused;` hoist declarations.
  //
  // CONTRACT: monkey-patches `injector.generateUnusedName` for the synchronous scope of `fn`
  // only. `fn` MUST NOT escape its synchronous execution (no async work, no deferred
  // callbacks queued inside that read the patched method after return). try/finally
  // guarantees restoration even on throw; nested calls compose correctly because each
  // restores the previous binding (not the original-original). violation symptom: a later
  // unrelated `generateUnusedName()` call leaks into `target` array
  function withTrackedUnusedNames(target, fn) {
    const orig = injector.generateUnusedName.bind(injector);
    injector.generateUnusedName = () => {
      const name = orig();
      target.push(name);
      return name;
    };
    try { return fn(); } finally {
      injector.generateUnusedName = orig;
    }
  }

  // cascade rewrite for AssignmentExpression with sibling RestElement. one upfront walk
  // through `rewriteDeclarator` finds ALL polyfillable nested-proxy props and renders the
  // mutated destructure pattern (with `_unused` sentinels preserving rest exclusion).
  // emits SE-prefix lifts + `var _unused;` declarations + rewritten assignment + per-
  // extraction polyfill assigns; marks the statement as handled so sibling per-prop
  // visitor calls short-circuit. preserves "polyfill always wins" - the destructure
  // discards each polyfilled key into `_unused`, then `binding = _polyfill;` overrides
  // the captured (maybe buggy native) value with the imported polyfill.
  // bodyless control parent (`if (cond) ({...} = G);`) requires `{...}` wrap when more
  // than one statement is emitted - otherwise siblings to the gated first statement
  // run unconditionally, breaking the guard's runtime semantics
  function cascadeAssignmentExpression({ assignNode, stmtPath, scope, outerSequencePrefix = [] }) {
    const stmtNode = stmtPath.node;
    let cached = trackedUnusedNamesByAssign.get(assignNode);
    if (!cached) {
      const fake = { id: assignNode.left, init: assignNode.right };
      // capture the `_unused` names emitted into preservedSrc; they need explicit
      // `var _unused;` declarations in the AssignmentExpression context (VariableDeclaration
      // host declares them via the destructure binding itself)
      const unusedIds = [];
      const result = withTrackedUnusedNames(unusedIds, () => {
        // the cascade keeps an SE-bearing receiver tail itself (`emitReceiverTail` emits it as a
        // standalone statement) - neutralize the plan-level discard-SE harvest so the setup isn't
        // ALSO re-run by an extraction prefix. planning runs INSIDE the tracked window: it may
        // mint `_unused` sentinel names that need the explicit declarations
        const plan = planDeclarator(fake, scope, stmtPath);
        if (plan?.discardSe) plan.discardSe = null;
        return rewriteDeclarator(fake, scope, stmtPath);
      });
      cached = { result, unusedIds };
      trackedUnusedNamesByAssign.set(assignNode, cached);
    }
    const { result, unusedIds } = cached;
    if (!result.extractions.length && !result.anchored) return false;
    flattenedAssignments.add(assignNode);
    // residual siblings kept verbatim (`other = [1].at(0)` default, a static-method value) stay
    // visible so the natural visitor polyfills them in place; `flushPendingCascade` drains those
    // rewrites and splices them into `result.preservedSrc`. the RHS receiver tail is handled
    // separately below. SE prefix expressions (RHS-internal AND outer SequenceExpression wrappers)
    // stay visitable so their inner Identifiers (`Promise.resolve`) emit their own polyfill imports
    const residualTargets = result.residualTargets ?? [];
    skipPatternExceptResidual(assignNode.left, residualTargets);
    const { prefix: seExprs, tail: receiverTail } = peelNestedSequenceExpressions(assignNode.right);
    // full consume but the retained tail still carries a side effect not liftable as a
    // top-level SE prefix (`[(sideEffect(), globalThis)]` - the SE is nested in an array
    // element): emit the tail as a standalone statement so the effect still runs, and leave
    // its proxy-global root visible for the natural visitor to substitute. otherwise the tail
    // is dropped (effect-free) or folded into preservedSrc, so skip it from the visitor pass
    const emitReceiverTail = result.preservedSrc === null && mayHaveSideEffects(receiverTail);
    // a verbatim init tail (static-object receiver) is a residual target whose contents the
    // natural visitor polyfills in place, so leave it visible; otherwise the tail collapses
    // into preservedSrc or is dropped, so skip it from the visitor pass
    const tailIsResidual = receiverTail && isInsideResidualTarget(receiverTail, residualTargets);
    if (!emitReceiverTail && !tailIsResidual) skipReceiverTailSubtree(receiverTail);
    // defer render + transforms.add: scope-tracker may register `var _ref;` inside the
    // SE-prefix IIFE body during sibling visits AFTER this point. flushPendingCascade
    // drains those inserts and bakes them into per-prefix nodeSrc before adding the
    // statement-range overwrite, keeping the transform queue overlap-free
    pendingCascade.push({ stmtNode, stmtPath, outerSequencePrefix, seExprs, unusedIds, result, receiverTail, emitReceiverTail });
    return true;
  }

  function renderCascadeSegments({ outerSequencePrefix, seExprs, unusedIds, result, receiverTail, emitReceiverTail }, drainedRefs) {
    const segments = [];
    // outer SE wrappers (minifier-shape `(prefix, ({...}=R))` lift) AND RHS-internal SE
    // prefix exprs share the same emit shape: nodeSrc with ref-binding splices baked in.
    // Iteration order keeps user-visible evaluation order: outer prefix first, then RHS
    // prefix, then the destructure body, then per-key polyfill assigns
    for (const expr of outerSequencePrefix) segments.push(`${ bakeRefSplicesInRange(expr, drainedRefs) };`);
    for (const expr of seExprs) segments.push(`${ bakeRefSplicesInRange(expr, drainedRefs) };`);
    if (unusedIds.length) segments.push(`var ${ unusedIds.join(', ') };`);
    if (result.preservedSrc !== null) {
      // parens are REQUIRED only for a `{`-leading LHS (statement-position object pattern);
      // an ArrayPattern-led rebuild stays bare, matching babel's emit byte-for-byte
      segments.push(result.preservedSrc.startsWith('{') ? `(${ result.preservedSrc });` : `${ result.preservedSrc };`);
    } else if (emitReceiverTail) {
      // full-consume receiver with a non-liftable nested side effect: evaluate it for effect
      segments.push(`${ bakeRefSplicesInRange(receiverTail, drainedRefs) };`);
    }
    for (const e of result.extractions) segments.push(`${ e.decl };`);
    return segments;
  }

  // vacate a soon-to-be-overwritten range of BOTH channels MagicString can't host inside an
  // overwrite: scope-tracker ref-bindings and queued point-inserts (e.g. a catch-clause prelude
  // emitted while a sibling SE-prefix was visited). returned as one splice list the caller bakes
  // into the lifted text via spliceInRange; a leftover insert would trip the insert-inside-
  // overwrite invariant
  function consumeRefsAndInserts(start, end) {
    const refs = scopeTracker.consumeRefBindingsInRange(start, end);
    const inserts = transforms.drainInsertsInRange(start, end);
    return inserts.length ? refs.concat(inserts) : refs;
  }

  // polyfilled source text for a sub-expression whose inner transforms would otherwise be
  // orphaned when an outer rewrite replaces the enclosing span with non-original text (the
  // catch-param `_ref` overwrite): drain the contained overwrites/inserts/ref-bindings and bake
  // them into the node's slice. returns the verbatim slice when nothing was queued inside it
  function composedRangeSrc(node) {
    // body-wrap splices (start < end, e.g. an arrow body-wrap around an instance-method call)
    // can cover the SAME range as a queue overwrite on that call; flat-splicing both would have
    // them overlap and corrupt output. re-queue them as overwrites FIRST so composeAndDrainRange
    // folds them via the same equal-range/nesting logic apply() uses (mirrors how applyTransforms
    // re-adds body-wraps to the queue). zero-length inserts (scoped-var / catch-prelude) can't be
    // overwrites - they stay as splices the caller bakes after composition
    const inserts = [];
    for (const s of consumeRefsAndInserts(node.start, node.end)) {
      if (s.start < s.end) transforms.add(s.start, s.end, s.content);
      else inserts.push(s);
    }
    const splices = transforms.composeAndDrainRange(node.start, node.end).concat(inserts);
    return splices.length ? spliceInRange(nodeSrc(node), node.start, splices) : nodeSrc(node);
  }

  function flushPendingCascade() {
    for (const entry of pendingCascade) {
      // bake residual-sibling polyfill rewrites (left visible for the natural visitor) into
      // preservedSrc and drain their queued overwrites before the statement-range overwrite
      // below, so the two don't collide
      bakeResidualIntoSlot(entry.result);
      const drainedRefs = consumeRefsAndInserts(entry.stmtNode.start, entry.stmtNode.end);
      const segments = renderCascadeSegments(entry, drainedRefs);
      transforms.add(entry.stmtNode.start, entry.stmtNode.end,
        wrapBodylessIfMulti(segments.join('\n'), segments.length > 1, entry.stmtPath));
    }
    pendingCascade.length = 0;
  }

  // bake scope-tracker ref-binding inserts (e.g. `var _ref;` anchored inside an SE-prefix
  // arrow body) directly into `node`'s nodeSrc text. shared by `injectForInitSESinks`
  // (for-init SE re-embed) and `liftExtractedSEPrefixesByIdx` (non-for-init SE lift):
  // both build text that's no longer position-aligned with the original source, so the
  // generic `bakePendingSplicesIntoPreserved` path can't reuse them
  function bakeRefSplicesInRange(node, refSplices) {
    const inRange = refSplices.filter(s => s.start >= node.start && s.end <= node.end);
    return spliceInRange(nodeSrc(node), node.start, inRange);
  }

  // for-init can't lift SE-prefix statements standalone (loop header forbids preceding
  // statements), so the SE prefix is re-embedded into the declarator's init at the
  // receiver position to match native `(SE, receiver)` eval order:
  // - full-consume: preservedSrc is null - synth a sink declarator `_unused = (SE, tail)`
  //   carrying the receiver value (a `(SE)` declarator alone isn't valid syntax)
  // - partial-consume: preservedSrc has shape `{ <props> } = <preservedInitSrc>` from
  //   `rewriteDeclarator` (SE was peeled to enable the non-for-init lift path). swap the
  //   trailing receiver slot for `(SE, <preservedInitSrc>)` by slicing off the captured
  //   init source (structural - avoids text-searching for the init separator across
  //   inner-default `=` symbols or receiver MemberExpressions)
  // gated on `extractions.length`: verbatim non-flatten siblings render through `nodeSrc`
  // and must not be rewritten here (would also bake refSplices a second time, since
  // `bakePendingSplicesIntoPreserved` runs after this and still operates on them)
  function injectForInitSESinks(declaration, perDecl) {
    for (let i = 0; i < perDecl.length; i++) {
      if (!perDecl[i].extractions.length) continue;
      const { prefix: seExprs, tail: receiverTail } = peelNestedSequenceExpressions(declaration.declarations[i].init);
      if (!seExprs.length) continue;
      const refSplices = perDecl[i].drainedRefs;
      const sePrefixSrcs = seExprs.map(seExpr => bakeRefSplicesInRange(seExpr, refSplices));
      const tailSrc = resolveSinkTailSrc(perDecl[i], receiverTail, refSplices);
      const seWrappedSrc = `(${ [...sePrefixSrcs, tailSrc].join(', ') })`;
      if (perDecl[i].preservedSrc === null) {
        perDecl[i].preservedSrc = `${ injector.generateUnusedName() } = ${ seWrappedSrc }`;
      } else {
        const initLen = perDecl[i].preservedInitSrc.length;
        perDecl[i].preservedSrc = perDecl[i].preservedSrc.slice(0, -initLen) + seWrappedSrc;
      }
    }
  }

  // tail expression for the SE-sink declarator on a for-init init (`_unused = (SE, <tail>)`).
  // shares dispatch semantics with `receiverEmitSrc` in `rewriteDeclarator`: aliased Identifier
  // tail keeps user binding (matches babel byte-for-byte; alias decl's own init was polyfilled
  // by the natural visitor outside the flatten range), everything else swaps to polyfill
  // binding when the receiver resolves. ref-binding splices bake into the tail source on the
  // non-polyfill path (typical for static-object / aliased / MemberExpression receivers that
  // host inner `var _ref;` inserts)
  function resolveSinkTailSrc(decl, receiverTail, refSplices) {
    const tailSrc = bakeRefSplicesInRange(receiverTail, refSplices);
    const isAliasedIdentifier = receiverTail?.type === 'Identifier' && tailSrc !== decl.receiver;
    const receiverPure = !isAliasedIdentifier && decl.receiver
      ? resolveGlobalPolyfill(decl.receiver) : null;
    return receiverPure
      ? injectPureImport(receiverPure.entry, receiverPure.hintName)
      : tailSrc;
  }

  function tryFlattenNestedProxy(metaPath) {
    // accept `{ from }` / `{ from: alias }` / `{ from = default }` / `{ from: alias = default }`.
    // user's default is dropped since the extracted polyfill is always defined (see `planInnerProp`)
    if (!propBindingIdentifier(metaPath.node.value)) return false;
    const declPath = walkUpNestedDestructureToDeclaration(metaPath.parentPath);
    if (declPath?.node?.type !== 'VariableDeclaration') return false;
    return flattenDeclarationPath(declPath, metaPath.scope);
  }

  // declaration-level flatten core, shared by the leaf dispatch above and the unconditional
  // proxy-hop trigger: plans EVERY declarator of the declaration, accepts the rewrite when
  // any slot extracts OR re-anchors (an anchored hop with zero extractions still rewrites -
  // the re-anchored residual is the point)
  function flattenDeclarationPath(declPath, scope) {
    const declaration = declPath.node;
    if (flattenedNestedDecls.has(declaration)) return true;
    const parentNode = declPath.parentPath?.node;
    const isForInit = parentNode?.type === 'ForStatement' && parentNode.init === declaration;
    const perDecl = declaration.declarations.map(d => rewriteDeclarator(d, scope, declPath));
    if (!perDecl.some(r => r.extractions.length || r.anchored)) return false;
    flattenedNestedDecls.add(declaration);
    seedSkippedForExtractedDeclarators(declaration, perDecl);
    // defer rendering + transforms.add to applyDestructuringTransforms - sibling subtree
    // visits AFTER this point may register `var _ref;` scope-tracker bindings for inner
    // instance-method polyfills. baking those into preservedSrc requires post-traverse state
    pendingFlatten.push({ declaration, declPath, perDecl, isForInit });
    return true;
  }

  // unconditional proxy-hop trigger, wired into the MAIN usage-pure traversal (replaces the
  // text-rewrite + re-parse normalize pre-pass): an anchored plan must fire even when NO
  // leaf resolves (`{ Map: { customY } } = globalThis` - the point is the re-anchored
  // residual), so leaf-driven dispatch alone cannot cover it. cheap shape prefilter before
  // any plan work; a disabled host line opts out like the retired pre-pass did
  function isProxyHopHostShape(pattern, init) {
    if (!init || pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return false;
    const [hopProp] = pattern.properties;
    if (hopProp.type !== 'Property') return false;
    const inner = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
    return inner?.type === 'ObjectPattern';
  }

  function tryFlattenProxyHopHost(path) {
    const { node } = path;
    if (node.type === 'VariableDeclaration') {
      if (!node.declarations.some(d => isProxyHopHostShape(d.id, d.init) && !isDisabled(d))) return;
      flattenDeclarationPath(path, path.scope);
      return;
    }
    if (node.operator !== '=' || !isProxyHopHostShape(node.left, node.right) || isDisabled(node)) return;
    const peeled = peelToExpressionStatement(path);
    if (!peeled) return;
    cascadeAssignmentExpression({
      assignNode: node, stmtPath: peeled.exprStmt, scope: path.scope, outerSequencePrefix: peeled.sequencePrefix,
    });
  }

  // apply position-anchored splices (in original-source coordinates) to `src`, which is a
  // verbatim slice starting at `baseOffset`. splices applied in descending source order so
  // earlier substitutions don't shift later relative offsets. zero-length splices (insert
  // shape: start === end) and span-replacing splices share the same loop body
  function spliceInRange(src, baseOffset, splices) {
    const sorted = splices.toSorted((a, b) => b.start - a.start);
    for (const { start, end, content } of sorted) {
      src = src.slice(0, start - baseOffset) + content + src.slice(end - baseOffset);
    }
    return src;
  }

  // lift extracted-declarator SE prefixes (`(logCall(), globalThis)` -> standalone
  // `logCall();` statements next to the flattened decl). non-extracted siblings keep
  // their SE prefixes verbatim through `nodeSrc` (lifting both would double-execute).
  // returns a per-declarator-index array so `renderFlattened` can place each slot's SE
  // prefixes IMMEDIATELY before its extracted lines instead of collapsing all SE prefixes
  // ahead of everything (pre-siblings between declarators would otherwise execute AFTER
  // an SE from a later slot - observable when both halves emit log() calls).
  // `pendingRefSplices` come from `bakePendingSplicesIntoPreserved` when the declarator
  // was fully consumed: scope-tracker drained `var _ref;` inserts anchored inside the
  // discarded init. those splices typically anchor inside an SE-prefix IIFE's arrow body
  // and get baked into the lifted SE text here so the `_ref` declaration survives next to its uses
  function liftExtractedSEPrefixesByIdx(declaration, perDecl) {
    return declaration.declarations.map((decl, i) => {
      if (!perDecl[i].extractions.length) return [];
      // peel a single-element array wrapper first so a side effect nested in the array
      // element (`[(sideEffect(), globalThis)]`) lifts like a top-level SE prefix - the
      // wrapper is transparent (planDeclarator descended through it to reach the receiver),
      // and the raw array init carries no top-level SE of its own. non-array inits peel to
      // themselves, leaving the bare-receiver path unchanged
      const { init: initSource } = peelArrayWrapperPair({ pattern: decl.id, init: decl.init });
      const { prefix } = peelNestedSequenceExpressions(initSource);
      const refSplices = perDecl[i].drainedRefs ?? [];
      return prefix.map(seExpr => bakeRefSplicesInRange(seExpr, refSplices));
    });
  }

  // full-preserve declarator: preservedSrc is a verbatim slice of the original source
  // anchored at decl.start. all splices must fall within [decl.start, decl.end) - an
  // out-of-range splice would either silently no-op or corrupt source; asserting at the gate
  // isolates the splice contract violation here instead of letting a downstream MagicString
  // chunk-split error surface far from the cause. the throw is UNBRANDED (`destructure-emitter: `
  // subsystem prefix only): the `[core-js] [<id>] ` brand + file tag are owned by the outer
  // `tagError` (runTransform's catch), matching the parse-error / transform-queue throw convention -
  // self-prefixing the brand here would make tagError double-stamp it
  function bakeFullPreserveSplices(slot, decl, splices) {
    for (const s of splices) {
      if (s.start < decl.start || s.end > decl.end) {
        throw new RangeError(`destructure-emitter: splice [${ s.start },${ s.end }) outside declarator [${ decl.start },${ decl.end })`);
      }
    }
    slot.preservedSrc = spliceInRange(slot.preservedSrc, decl.start, splices);
  }

  // partial-consume non-for-init: preservedSrc has the rebuilt `{ preserved } = <initSrc>`
  // shape ending with a verbatim initSrc receiver tail slice (when the receiver was
  // polyfillable, initSrc is the polyfill binding instead and no original-position splices
  // can land inside it). only splices that anchor within the verbatim trailing initSrc range
  // are baked, mapped to the offset within initSrc. splices outside that range (e.g. inside
  // the pattern's original outer keys) are NOT applied here - the SE prefix path
  // (`liftExtractedSEPrefixesByIdx`) covers everything before the receiver tail
  function bakePartialConsumeTailSplices(slot, decl, splices) {
    if (slot.preservedSrc === null || !slot.preservedInitSrc) return;
    const { tail } = peelNestedSequenceExpressions(decl.init);
    if (!tail) return;
    const inRange = splices.filter(s => s.start >= tail.start && s.end <= tail.end);
    if (!inRange.length) return;
    const headLen = slot.preservedSrc.length - slot.preservedInitSrc.length;
    const bakedInit = spliceInRange(slot.preservedInitSrc, tail.start, inRange);
    slot.preservedSrc = slot.preservedSrc.slice(0, headLen) + bakedInit;
    slot.preservedInitSrc = bakedInit;
  }

  // bake polyfill rewrites the natural visitor queued inside verbatim residual content
  // (a residual sibling prop's default / computed-key / value, or a verbatim init tail)
  // into preservedSrc. those ranges were left UNskipped by `seedSkippedForExtractedDeclarators`
  // so the visitor produced its normal instance/static-method rewrite; drain it here and
  // remap from original-source coords to the rebuilt-text offset captured in the target.
  // runs BEFORE `bakePendingSplicesIntoPreserved` so the residual rewrites land first and
  // the trailing-init bake / ref-binding bake operate on the residual-baked text.
  // `composeAndDrainRange` folds nested rewrites into disjoint outermost splices; passing
  // `srcStart - dstStart` as the splice base maps each original-coord splice into preservedSrc
  function bakeResidualIntoSlot(slot) {
    if (slot.preservedSrc === null || !slot.residualTargets?.length) return;
    // `dstStart` is the offset into the pre-bake preservedSrc; `spliceInRange` applies the
    // collected splices descending, so lower-offset targets aren't shifted by higher ones.
    // accumulate the trailing init target's length delta separately to recompute
    // preservedInitSrc (everything spliced before it shifts its start in the baked text)
    const remapped = [];
    // the trailing init target (when present) sits at the end of preservedSrc; its dstStart
    // equals preservedSrc.length minus the verbatim init length. preservedInitSrc is always
    // set alongside a non-null preservedSrc (the early return above guarantees we're past that)
    const initTarget = slot.residualTargets.find(t => t.dstStart === slot.preservedSrc.length - slot.preservedInitSrc.length);
    let initDelta = 0;
    for (const target of slot.residualTargets) {
      const base = target.srcStart - target.dstStart;
      for (const s of transforms.composeAndDrainRange(target.srcStart, target.srcEnd)) {
        remapped.push({ start: s.start - base, end: s.end - base, content: s.content });
        if (initTarget && target !== initTarget && s.start - base < initTarget.dstStart) {
          initDelta += s.content.length - (s.end - s.start);
        }
      }
    }
    if (!remapped.length) return;
    slot.preservedSrc = spliceInRange(slot.preservedSrc, 0, remapped);
    // recompute preservedInitSrc so the downstream trailing-init / for-init slices stay
    // length-aligned. when the init tail itself was a residual target its baked content
    // is the new init; otherwise the init shifted only by preceding residual deltas
    if (initTarget) slot.preservedInitSrc = slot.preservedSrc.slice(initTarget.dstStart + initDelta);
  }

  function bakeResidualContentIntoPreserved(perDecl) {
    for (const slot of perDecl) bakeResidualIntoSlot(slot);
  }

  // bake `var _ref;` ref-binding splices (from scope-tracker, drained per-declarator into
  // `perDecl[i].drainedRefs` in `flushPendingFlatten`) into preservedSrc at original-source
  // positions. dispatch on extraction shape:
  // - non-extracted (full-preserve): `bakeFullPreserveSplices` operates on the whole slice
  // - partial-consume non-for-init: `bakePartialConsumeTailSplices` covers the trailing
  //   initSrc only (the SE prefix path baked the rest in `liftExtractedSEPrefixesByIdx`)
  // - for-init partial-consume: `injectForInitSESinks` already rebuilt initSrc with refs
  //   baked into the SE-sink wrapper; skip to avoid double-baking
  // sibling-receiver-name substitutions (`globalThis -> _globalThis`) are NOT baked here -
  // they're queued on transform-queue by `polyfillSiblingReceiverRefs` so compose handles
  // nested body-wraps correctly
  function bakePendingSplicesIntoPreserved(declaration, perDecl, { isForInit = false } = {}) {
    for (let i = 0; i < perDecl.length; i++) {
      const slot = perDecl[i];
      const splices = slot.drainedRefs;
      if (!splices.length) continue;
      const decl = declaration.declarations[i];
      // an anchored zero-extraction slot carries REBUILT text, not a verbatim slice - route
      // it through the partial-consume tail bake (its binding init hosts no in-range splices)
      if (!slot.extractions.length && !slot.anchored) bakeFullPreserveSplices(slot, decl, splices);
      else if (!isForInit) bakePartialConsumeTailSplices(slot, decl, splices);
    }
  }

  // drain scope-tracker `var _ref;` inserts once per declarator. attaches to
  // `perDecl[i].drainedRefs` so all three consumers (inject / bake / lift) read from a
  // single channel. draining BEFORE the render also keeps applyTransforms from queueing
  // an insert INSIDE the parent overwrite range (MagicString would split-an-edited-chunk)
  function drainRefBindingsByDeclarator(declaration, perDecl) {
    for (let i = 0; i < perDecl.length; i++) {
      const decl = declaration.declarations[i];
      perDecl[i].drainedRefs = consumeRefsAndInserts(decl.start, decl.end);
    }
  }

  // the global name a substitution decision must shadow-check: the proxy-global root
  // (`globalThis` in `globalThis.Array`) when present, else a bare global identifier. a
  // local binding of that name (`function f(globalThis) {}` param, a `let`/`const`) means
  // the reference is NOT the global, so the pure rewrite must bail - matching the
  // main-visitor shadow gate babel honors. position-anchored at the declarator/assignment
  function globalSubstitutionShadowed(info, node) {
    // the live estree-toolkit scope rides on the declarator path; `scopeSnapshot` is the
    // scope-tracker frame (genRef plumbing) and exposes no binding lookup
    const anchorPath = info.declaratorPath;
    const scope = anchorPath?.scope;
    if (!scope) return false;
    const proxyRoot = findProxyGlobal(node);
    const name = proxyRoot ? proxyRoot.name : node.type === 'Identifier' ? node.name : null;
    return name !== null && estreeAdapter.hasBinding(scope, name, anchorPath);
  }

  // alias-resolution context for the proxy-global collapse: lets `findProxyGlobal` follow a
  // const-alias root (`const g = globalThis; g.self.X`) through the canonical resolver. uses the
  // LIVE estree-toolkit scope on the declarator path (like `globalSubstitutionShadowed`) - the
  // scope-tracker `scopeSnapshot` is a numeric frame with no binding lookup. unplugin never mutates
  // the AST, so the alias's `= globalThis` init node is intact at emit time. null -> node-only
  function aliasCtxFor(info) {
    const path = info?.declaratorPath;
    return path?.scope ? { scope: path.scope, adapter: estreeAdapter, path } : null;
  }

  // polyfill each operand of a retained `||` / `??` / `&&` init in place, so neither side
  // ReferenceErrors on old engines: `globalThis.Array || Set` -> `_globalThis.Array || _Set`.
  // bare-global operand -> pure import; proxy-global member chain -> root substitution (keeps
  // the `_globalThis.Array` member shape, matching babel's in-place per-operand rewrite);
  // nested logical -> recurse; any other operand keeps its verbatim source. returns the
  // reassembled init source, or null when no operand referenced a polyfillable global
  function polyfillLogicalInitOperands(node, src, baseStart, info) {
    let any = false;
    const renderOperand = operand => {
      const peeled = unwrapParens(operand);
      const rawSrc = src.slice(operand.start - baseStart, operand.end - baseStart);
      let out = null;
      if (peeled.type === 'LogicalExpression') {
        out = polyfillLogicalInitOperands(peeled, src, baseStart, info);
      } else if (!globalSubstitutionShadowed(info, peeled)) {
        // a shadowed proxy-root / bare global is the user's own binding, not the global
        if (peeled.type === 'Identifier') {
          const pure = resolvePure({ kind: 'global', name: peeled.name }, null);
          if (pure) out = injectPureImport(pure.entry, pure.hintName);
        } else if (findProxyGlobal(peeled, aliasCtxFor(info))) {
          // per-operand parity with the main receiver (polyfillInitGlobals): a PURE-CTOR leaf
          // whole-swaps to the pure binding (`globalThis.self.Map` -> `_Map`), a non-pure leaf
          // collapses its proxy hops (`globalThis.self.Array` -> `_globalThis.Array`, alias-aware
          // `g.self.Array` -> `g.Array`)
          const ctx = aliasCtxFor(info);
          // peel SE prefix + chain to the member for the leaf lookup so a pure ctor is recognised
          // under an SE prefix / optional chain too; else globalProxyMemberName sees the wrapper and
          // falls through to the root-only swap (crashes the queue against the visitor for an SE pure
          // ctor). `prefix` (the SE expressions) gates SE-detection - a ChainExpression is NOT an SE
          const { prefix, tail } = peelNestedSequenceExpressions(peeled);
          const leafName = globalProxyMemberName({ node: tail ?? peeled, ...ctx });
          const leafPolyfill = leafName && resolvePure({ kind: 'global', name: leafName }, null);
          if (leafPolyfill) {
            // pure-ctor: whole-swap a DIRECT, NON-SE operand here (markInitGlobals skip-marks it, so
            // this does not fight the natural visitor). an SE-prefixed or ALIAS pure-ctor operand
            // stays verbatim and the visitor whole-swaps its tail (`(eff(), _Map)` / `_Set`) -
            // swapping here would drop the SE prefix or crash the queue against the visitor
            if (!prefix.length && findProxyGlobal(peeled)) out = injectPureImport(leafPolyfill.entry, leafPolyfill.hintName);
          } else {
            out = substituteProxyGlobalRoot({ node: peeled, src: rawSrc, baseStart: operand.start, aliasCtx: ctx });
          }
        }
      }
      if (out === null) return rawSrc;
      any = true;
      return out;
    };
    const leftSrc = renderOperand(node.left);
    const rightSrc = renderOperand(node.right);
    if (!any) return null;
    // the operator + surrounding whitespace between the two operands, verbatim
    const between = src.slice(node.left.end - baseStart, node.right.start - baseStart);
    return leftSrc + between + rightSrc;
  }

  // when the init expression is retained in emitted output (instance dispatch receiver / rest
  // objRef / flatten-sibling receiver), polyfill any global identifiers it references so older
  // engines don't ReferenceError. cases: whole chain resolves to a known polyfillable global
  // (`globalThis.Array` -> `_Array`); proxy-global root with unknown leaf (`globalThis.unknownArr`
  // -> root-only swap, chain tail survives for instance dispatch); logical operands via the helper
  // above. ternary inits are handled by the per-branch synth-swap path, not here. returns the
  // polyfilled init source or null when no substitution applies
  function polyfillInitGlobals(info) {
    const initNode = unwrapParens(info.initNode);
    if (initNode.type === 'LogicalExpression' && info.initStart !== undefined) {
      return polyfillLogicalInitOperands(initNode, info.initSrc, info.initStart, info);
    }
    // a shadowed proxy-root / bare global is the user's own binding, not the global
    if (globalSubstitutionShadowed(info, initNode)) return null;
    // an SE init (`(gg(), globalThis.Map)`) keeps its side-effecting prefix verbatim; the
    // proxy-global ctor to resolve is the tail. peel to the tail before the leaf lookup so a
    // whole-chain pure ctor is still RECOGNISED under an SE prefix (else `globalProxyMemberName`
    // sees the SequenceExpression and falls through to the root-only swap below, which kept the
    // native `_globalThis.Map` instead of `_Map`)
    const aliasCtx = aliasCtxFor(info);
    const tail = info.initStart !== undefined ? peelNestedSequenceExpressions(initNode).tail ?? initNode : initNode;
    // pass aliasCtx so the leaf is RECOGNISED under a const-alias root too (`const g = globalThis;
    // g.self.Map` -> Map): without it the alias root is unresolved, the leaf is missed, and the
    // proxy-root fallback below collapses `g.self.Map` -> `g.Map` - which CRASHES the queue against
    // the natural visitor's whole-ctor `_Map` transform on the original `g.self.Map` text
    const leafName = info.initIdentName || globalProxyMemberName({ node: tail, ...aliasCtx });
    if (leafName) {
      const leafPolyfill = resolvePure({ kind: 'global', name: leafName }, null);
      if (leafPolyfill) {
        // the canonical member visitor rewrites a proxy-global whole-ctor member in place
        // (`globalThis.Map` -> `_Map`). a skip-marked tail means the visitor was suppressed (the
        // effect-free non-SE init, marked by `markInitGlobals` at the prop visit), so emit the pure
        // binding HERE. otherwise DEFER: the visitor stays live and its in-place transform composes
        // into the verbatim init, so an SE receiver `(gg(), globalThis.Map)` becomes `(gg(), _Map)` -
        // this shadow resolver must not fight it with a root-only swap
        if (!skippedNodes.has(tail)) return null;
        return injectPureImport(leafPolyfill.entry, leafPolyfill.hintName);
      }
    }
    if (info.initStart === undefined) return null;
    return substituteProxyGlobalRoot({ node: initNode, src: info.initSrc, baseStart: info.initStart, aliasCtx });
  }

  function propKeySource(p) {
    return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
  }

  // render one destructure declarator's polyfilled binding-assignment `parts` (memo + per-entry
  // rewrites + residual/rest pattern). drives both the byStatement block/for-init emit (via `ctx`
  // carrying the `const `/`export ` prefixes) and the flatten-sibling fallback (empty prefixes ->
  // bare `lhs = rhs` parts that renderBlockStatements re-prefixes). `preDrainedSplices`, when given,
  // supplies the init's already-consumed body-wrap/insert splices (the flatten path drains per
  // declarator up front) instead of re-draining the queue here
  function emitPolyfilled(info, parts, ctx, preDrainedSplices = null) {
    const { stmtPrefix, memoPrefix, isForInit, isAssignment } = ctx;
    const { entries, allProps, initSrc, scopeSnapshot } = info;
    // this slot's first part index - the assignment-host sentinel `var` splices in here
    // (declare-then-use order, the babel-canon position ahead of the extraction assigns)
    const slotStart = parts.length;
    const { initStart, initEnd } = info;
    const polyfillKeys = new Set(entries.map(e => e.propNode));
    const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    const remaining = allProps.filter(p => !polyfillKeys.has(p));
    const hasInstance = entries.some(e => e.kind === 'instance');
    // a full consume lifts the SE init as a standalone statement (see `liftSE` below); its
    // value is then unread, so an effect-free TAIL is dead either way
    const willLiftSE = !hasInstance && !hasRest && remaining.length === 0 && initSrc
        && info.initNode && mayHaveSideEffects(info.initNode);
    // an effect-free droppable SE tail (a dead proxy-member chain or consumed bare
    // constructor marked by the collection pre-pass, or ANY effect-free tail of a
    // full-consume lift): process only the SE PREFIX, so the kept text receives the same
    // extract + ref-bake treatment a whole init does and the dead tail never reaches the
    // output (babel's lift trims the same class). a for-init SE sink keeps its tail - the
    // sink declarator needs a value
    let liftParts = null;
    if (initStart !== undefined && info.initNode) {
      const { prefix: liftPrefix, tail: liftTail } = peelNestedSequenceExpressions(info.initNode);
      const peeledLiftTail = liftTail !== info.initNode ? unwrapParens(liftTail) : null;
      const tailDead = peeledLiftTail && (skippedNodes.has(peeledLiftTail)
        || (willLiftSE && !isForInit && !mayHaveSideEffects(peeledLiftTail)));
      // trailing PURE prefix elements are as dead as the tail - the shared dead-tail policy
      if (liftPrefix.length && tailDead) liftParts = dropDeadSequenceTail(liftPrefix);
    }
    const procSrc = initSrc;
    // ONE extract-or-bake algorithm for both shapes: the no-drop init is a single part
    // spanning the whole range; a tail-dropped prefix is one part per kept expression
    // (nested sequence parens make it NON-CONTIGUOUS in source - `a, (b, tail)` - so a
    // single range slice would cut through unbalanced parens; the comma join rebuilds the
    // statement babel's lift produces). per part: extracted split text wins; otherwise
    // bake `var _ref;` ref-bindings AND point-inserts anchored inside the part into the
    // raw slice so the replaceNode-spanning overwrite below stays queue-safe. both arise
    // during sibling traversal: inner instance-method polyfills (`[1].at(0)` in an
    // IIFE-bodied init) seed the ref-binding, a catch-clause prelude seeds the insert -
    // left in the queue either lands inside our overwrite and MagicString rejects the
    // chunk split. the bake applies ONLY to RAW source (position-aligned spliceInRange);
    // COMPOSED split text no longer aligns with original coords - its splices stay queued
    // so applyTransforms re-adds body-wraps as range overwrites that fold into our
    // statement overwrite by needle (the split text embeds the raw arg)
    let initTransformed;
    if (initStart === undefined || initEnd === undefined) {
      initTransformed = procSrc;
    } else {
      const initParts = liftParts ?? [{ start: initStart, end: initEnd }];
      initTransformed = initParts.map(p => {
        let text = transforms.extractContent(p.start, p.end) ?? null;
        if (text === null) {
          text = nodeSrc(p);
          const splices = preDrainedSplices?.length
            ? preDrainedSplices.filter(s => s.start >= p.start && s.end <= p.end)
            : consumeRefsAndInserts(p.start, p.end);
          if (splices.length) text = spliceInRange(text, p.start, splices);
        }
        return text;
      }).join(', ');
    }
    for (const e of entries) {
      if (e.propNode.computed) e.polyfillKeyContent = transforms.extractContent(e.propNode.key.start, e.propNode.key.end);
    }
    // gate global-identifier substitution on init-being-used to avoid emitting unused
    // proxy-global imports for the all-bindings-discarded case (`const { from } = globalThis`)
    const initIsUsed = remaining.length > 0 || hasRest || hasInstance;
    if (initIsUsed && initTransformed === procSrc) {
      const polyfilled = polyfillInitGlobals(info);
      if (polyfilled !== null) initTransformed = polyfilled;
    }
    // memo the receiver for multi-use instance entries unless the SUBSTITUTED init is already a bare
    // binding: a lone identifier (`_Array`, `_globalThis`, a user var) is free to re-reference, but a
    // member chain (`_globalThis.navigator`, the proxy-root-swap of a non-polyfillable leaf) or a call
    // would be re-evaluated once per entry - memo it to a single `_ref`, matching babel's receiver memo
    const initIsBareRef = !!initTransformed && !/[^\w$]/.test(initTransformed);
    const needsMemo = hasInstance && !initIsBareRef && (entries.length > 1 || remaining.length > 0 || hasRest);
    let objRef = initTransformed;
    if (needsMemo && initTransformed) {
      objRef = injector.generateLocalRef();
      parts.push(`${ memoPrefix }${ objRef } = ${ initTransformed }`);
    }

    // lift the static-init SE so its evaluation point survives extraction, placed at THIS
    // declarator's slot - `parts` is built in source order, so a preceding sibling's init still
    // evaluates first (pre-sibling -> SE -> extracted -> post-sibling). for-init can't host a
    // statement-level SE (the whole for-head is one comma-list), so there it becomes a `_ref = SE`
    // comma-list member; a statement host emits a standalone (paren-guarded) expression.
    // the lifted text can START a statement (the tail-dropped prefix loses the sequence parens):
    // a `{` / `class` / `function` head needs the hazard parens the minifier split applies
    const liftSE = !hasInstance && !hasRest && remaining.length === 0 && initSrc
        && mayHaveSideEffects(info.initNode);
    if (liftSE) {
      if (isForInit) parts.push(`${ injector.generateLocalRef() } = ${ initTransformed }`);
      else parts.push(parenthesizeExprStmtHazard(initTransformed));
    }

    for (const e of entries) {
      const isInstance = e.kind === 'instance' && initSrc;
      const valueSrc = isInstance ? `${ e.binding }(${ objRef })` : e.binding;
      if (e.defaultSrc) {
        let ref = null;
        if (isInstance) ref = scopeTracker.genRef(scopeSnapshot);
        // raw `e.defaultSrc` here (not composed): the parts text stays the original-source
        // needle `#substituteInners` splices any default-expr polyfill into
        parts.push(`${ stmtPrefix }${ e.localName } = ${ defaultGuardedRhs({ valueSrc, defaultSrc: e.defaultSrc, ref }) }`);
      } else {
        parts.push(`${ stmtPrefix }${ e.localName } = ${ valueSrc }`);
      }
    }

    const entryByProp = hasRest ? new Map(entries.map(e => [e.propNode, e])) : null;
    // sentinel names on an ASSIGNMENT host are plain LHS writes - they must be pre-declared
    // (`var _unused;`) or strict mode throws ReferenceError; a declaration host binds them
    // via the destructure pattern itself
    const sentinelNames = [];
    const rebuiltProps = hasRest
        ? allProps.map(p => {
          const e = entryByProp.get(p);
          if (!e) return nodeSrc(p);
          const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : propKeySource(p);
          const sentinel = injector.generateUnusedName();
          sentinelNames.push(sentinel);
          return `${ keySrc }: ${ sentinel }`;
        })
        : remaining.map(p => nodeSrc(p));
    if (rebuiltProps.length > 0) {
      if (isAssignment && sentinelNames.length) parts.splice(slotStart, 0, `var ${ sentinelNames.join(', ') }`);
      parts.push(isAssignment
          ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
          : `${ stmtPrefix }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
    }
  }

  // post-traverse render: dispatches on host shape. for-init folds extractions + SE-embedded
  // preserved declarators into a comma-joined single declaration (for-loop header forbids
  // newlines between declarators); block-level emits one statement per slot with SE
  // prefixes lifted as standalone statements between extracted lines
  function flushPendingFlatten() {
    for (const entry of pendingFlatten) {
      const { declaration, declPath, perDecl, isForInit } = entry;
      // drain BEFORE the sibling-render below: a sibling's instance-method init can host a
      // scope-tracker body-wrap (`var _ref;` inside an IIFE arrow body), and the render bakes
      // that drained splice into its extraction text - otherwise the `var _ref;` is discarded
      // (its extraction slot's `preservedSrc` is null, so the post-render bake skips it)
      drainRefBindingsByDeclarator(declaration, perDecl);
      // a non-flatten declarator sharing this declaration may carry an instance/static-method
      // destructure the byStatement emit skipped; render its rewrite here (as synthetic
      // extractions) so the polyfill survives instead of emitting the pattern verbatim
      for (let i = 0; i < perDecl.length; i++) {
        if (perDecl[i].extractions.length || perDecl[i].anchored) continue;
        const sibInfo = flattenSiblingInfos.get(declaration.declarations[i]);
        if (!sibInfo) continue;
        let decls;
        {
          // the full emitPolyfilled covers every sibling shape (simple + memo/residual/rest) on
          // BOTH host shapes, so the polyfill survives instead of rendering verbatim. for-init
          // renders bare comma-list declarators (memo and rest-pattern slots are valid
          // declarators; SE lifts through the sink as `_unused = SE`); block-level uses a bare
          // entry prefix (renderBlockStatements re-adds the declaration / export keyword) with
          // a `const ` memoPrefix so the receiver-memo stays out of any `export` list
          const parts = [];
          const siblingCtx = isForInit
            ? { stmtPrefix: '', memoPrefix: '', isForInit: true, isAssignment: false }
            : { stmtPrefix: '', memoPrefix: 'const ', isForInit: false, isAssignment: false };
          emitPolyfilled(sibInfo, parts, siblingCtx, perDecl[i].drainedRefs);
          if (parts.length) decls = parts;
        }
        // drainedRefs already baked into the rendered extraction text -> clear so the
        // post-render bake doesn't try to re-apply them against the null preservedSrc
        if (decls) perDecl[i] = { extractions: decls.map(decl => ({ decl })), preservedSrc: null, receiver: null, drainedRefs: [] };
      }
      const replacement = isForInit
        ? renderForInitFlatten(declaration, perDecl)
        : renderBlockFlatten(declaration, declPath, perDecl);
      // when the host VariableDeclaration sits inside `export const { ... } = X`,
      // expand the transform range to cover the wrapping `ExportNamedDeclaration` so
      // the original `export ` keyword isn't left orphaned before the emitted statements
      // (which carry their own `export ` prefix to re-export every binding)
      const parent = declPath.parentPath?.node;
      const useExportRange = !isForInit && parent?.type === 'ExportNamedDeclaration';
      const [start, end] = useExportRange ? [parent.start, parent.end] : [declaration.start, declaration.end];
      transforms.add(start, end, replacement);
    }
    pendingFlatten.length = 0;
  }

  // for-init: SE prefix re-embeds into preservedSrc receiver slot via `injectForInitSESinks`
  // (loop header forbids preceding statements). `bakePendingSplicesIntoPreserved` runs
  // after on non-extracted siblings to substitute receiver-name refs (`globalThis ->
  // _globalThis`) into their preservedSrc. single-declaration emit: `kind d1, d2, d3` -
  // newline-separated declarators would parse the middle as the for-test slot, syntax error
  function renderForInitFlatten(declaration, perDecl) {
    bakeResidualContentIntoPreserved(perDecl);
    injectForInitSESinks(declaration, perDecl);
    bakePendingSplicesIntoPreserved(declaration, perDecl, { isForInit: true });
    const parts = [];
    for (const r of perDecl) {
      for (const e of r.extractions) parts.push(e.decl);
      if (r.preservedSrc !== null) parts.push(r.preservedSrc);
    }
    return `${ declaration.kind } ${ parts.join(', ') }`;
  }

  // block-level: emit one statement per declarator (matches babel's `splitDeclarators`).
  // walk in original declarator order, flush buffered preserved declarators (consecutive
  // pre-siblings collapse into one `kind` statement) when crossing an extracted slot.
  // each slot's SE prefixes land between flushed pre-buffer and the extracted lines so
  // pre-siblings between declarators evaluate BEFORE the SE of a later slot (observable
  // when both halves call log()). bodyless control parent (`if (cond) <decl>`) needs
  // `{ ... }` wrap when more than one statement is emitted
  function renderBlockFlatten(declaration, declPath, perDecl) {
    bakeResidualContentIntoPreserved(perDecl);
    bakePendingSplicesIntoPreserved(declaration, perDecl);
    const sePrefixesByIdx = liftExtractedSEPrefixesByIdx(declaration, perDecl);
    // `export const { Array: { from }, includes } = X` - each emitted statement must
    // preserve the `export` keyword so both `from` and `includes` are re-exported.
    // mirror babel-plugin's `splitDeclarators(...isExport)` shape
    const isExport = declPath.parentPath?.node?.type === 'ExportNamedDeclaration';
    // count of emitted top-level statements drives wrap-with-{} for bodyless control parents.
    // explicit `count > 1` honors the helper's contract; `text.includes('\n')` would mis-fire
    // on a single statement that happens to render across multiple lines
    const { text, count } = renderBlockStatements(perDecl, declaration.kind, sePrefixesByIdx, isExport);
    return wrapBodylessIfMulti(text, count > 1, declPath);
  }

  // seed skippedNodes ONLY for the consumed parts: the ObjectPattern (id) and the
  // receiver tail (last expr of SE init). SE-prefix expressions are preserved as
  // source text via `sePrefixes` in tryFlattenNestedProxy - their inner Identifiers
  // (e.g. `Promise` in `(Promise.resolve(...).then(noop), globalThis)`) need natural
  // visitor pass to emit their own polyfill imports. seeding the whole declarator
  // would block them. siblings reusing a flattened receiver's name
  // (`{X:{m}}=globalThis, y=globalThis`) get inline substitution via
  // `polyfillSiblingReceiverRefs` so compose's nth-count matches the flattened source
  // shared with `cascadeAssignmentExpression`: walk the receiver tail (peeled through
  // SE prefixes, parens, TS wrappers) and mark its subtree skipped so leaf Identifier
  // visitors don't double-emit polyfills for already-flattened receivers
  // `keepNode` (the harvested discard-SE call) is excluded with its subtree: its source is
  // re-emitted by the flatten, so its inner rewrites (`globalThis -> _globalThis`) must stay
  // queued for the compose splice - and their imports must survive
  function skipReceiverTailSubtree(receiverNode, keepNode = null) {
    if (!receiverNode) return;
    const { tail } = peelNestedSequenceExpressions(receiverNode);
    if (!tail) return;
    walkAstNodes({
      root: tail,
      visit(n) {
        if (!keepNode || n.start < keepNode.start || n.end > keepNode.end) skippedNodes.add(n);
      },
    });
  }

  // true when [node.start, node.end) is fully contained in some residual target's source
  // range. residual targets carry verbatim source whose polyfillable contents the natural
  // visitor must still rewrite, so their inner nodes stay UNskipped (the seed below leaves
  // them visible; `bakeResidualContentIntoPreserved` drains the queued rewrites afterward)
  function isInsideResidualTarget(node, residualTargets) {
    return residualTargets.some(t => node.start >= t.srcStart && node.end <= t.srcEnd);
  }

  // skip a destructure pattern subtree EXCEPT nodes inside a residual target. consumed parts are
  // superseded by the rebuilt flatten/cascade text, so skipping them keeps the natural visitor
  // from queuing transforms that overlap the rewrite's range (MagicString chunk-split). residual
  // targets carry verbatim source whose inner polyfillable content the visitor must still rewrite,
  // so their nodes stay visible (drained back into preservedSrc afterward)
  function skipPatternExceptResidual(root, residualTargets) {
    walkAstNodes({
      root,
      visit(node) {
        if (!isInsideResidualTarget(node, residualTargets)) skippedNodes.add(node);
      },
    });
  }

  function seedSkippedForExtractedDeclarators(declaration, perDecl) {
    const flattenedReceivers = new Set();
    for (let i = 0; i < perDecl.length; i++) {
      if (!perDecl[i].extractions.length && !perDecl[i].anchored) continue;
      const decl = declaration.declarations[i];
      const residualTargets = perDecl[i].residualTargets ?? [];
      // the rebuilt flatten text comes from `nodeSrc` for preserved outer props and synth
      // strings for consumed ones; residual siblings stay visible for in-place polyfill, drained
      // back into preservedSrc by `bakeResidualContentIntoPreserved`
      skipPatternExceptResidual(decl.id, residualTargets);
      // the receiver tail collapses into the flatten's rebuilt init unless it was kept
      // verbatim (a residual target), in which case its polyfillable contents stay visible
      const initTail = decl.init && peelNestedSequenceExpressions(decl.init).tail;
      if (!initTail || !isInsideResidualTarget(initTail, residualTargets)) {
        skipReceiverTailSubtree(decl.init, perDecl[i].discardSeNode);
      }
      if (perDecl[i].receiver) flattenedReceivers.add(perDecl[i].receiver);
    }
    if (flattenedReceivers.size) {
      for (let i = 0; i < perDecl.length; i++) {
        if (!perDecl[i].extractions.length) {
          polyfillSiblingReceiverRefs(declaration.declarations[i], flattenedReceivers);
        }
      }
    }
  }

  // block-level emit: walk declarators in order, buffer consecutive preserved-only slots
  // and flush as `kind <decl>;` statements (matches babel's `splitDeclarators` per-decl
  // shape) when crossing an extracted slot. each extracted slot emits its lifted SE prefix
  // statements first, then the extracted bindings. rest case (same declarator carries BOTH
  // extractions AND a preserved residue) pushes preservedSrc unconditionally
  function renderBlockStatements(perDecl, kind, sePrefixesByIdx, isExport = false) {
    const lines = [];
    const exportPrefix = isExport ? 'export ' : '';
    let preserveBuffer = [];
    function flushPreserveBuffer() {
      for (const p of preserveBuffer) lines.push(`${ exportPrefix }${ kind } ${ p };`);
      preserveBuffer = [];
    }
    for (let i = 0; i < perDecl.length; i++) {
      const r = perDecl[i];
      if (r.extractions.length) {
        flushPreserveBuffer();
        const slotSEPrefixes = sePrefixesByIdx?.[i];
        if (slotSEPrefixes) for (const p of slotSEPrefixes) lines.push(`${ p };`);
        // a sibling-fallback memo extraction carries its own `const ` keyword - an internal ref temp
        // must stay out of the `export` list (mirrors babel's non-exported memo); emit it verbatim
        for (const e of r.extractions) {
          lines.push(/^(?:const|let|var) /.test(e.decl) ? `${ e.decl };` : `${ exportPrefix }${ kind } ${ e.decl };`);
        }
      }
      if (r.preservedSrc !== null) preserveBuffer.push(r.preservedSrc);
    }
    flushPreserveBuffer();
    return { text: lines.join('\n'), count: lines.length };
  }

  // thin wrapper over the provider's shared decision layer (`buildNestedDestructurePlan` -
  // caching, receiver dispatch and the per-prop plan tree live there); this factory only
  // threads the estree adapter and its resolver closures. the cascade rides the provider
  // cache contract: it plans its synthetic host first, the render-time re-entry reads the
  // same cached plan
  function planDeclarator(declarator, scope, usePath = null) {
    return buildNestedDestructurePlan({
      declarator, scope, adapter: estreeAdapter, path: usePath,
      resolvePure, resolveGlobalPolyfill, isDisabledProp: isDisabled,
    });
  }

  // key source for a partially-consumed flatten rebuild: a computed key keeps its `[...]`
  // form and a string-literal key its quotes, so the residual pattern stays valid (a bare
  // name would corrupt `['Array']: { ... }` -> `undefined: ...`)
  function flattenKeySrc(prop) {
    if (prop.computed) return `[${ nodeSrc(prop.key) }]`;
    return prop.key?.type === 'Identifier' ? prop.key.name : nodeSrc(prop.key);
  }

  // render one plan-tree node (see `buildNestedDestructurePlan` for the kinds) to the
  // text-emit record the rewrite loop consumes: `{ extractions?, preservedSrc, residualTargets? }`.
  //   - 'verbatim': the original source slice (the caller registers the residual target)
  //   - 'consumed': extractions only, the prop is dropped (or rest-sentineled by the caller)
  //   - 'symbol-iterator-key': non-binding value under a computed `[Symbol.iterator]` key.
  //     natural visitor would polyfill the standalone key, but the flatten's blanket skip in
  //     `seedSkippedForExtractedDeclarators` suppresses it - emit the polyfilled key directly
  //     so the rebuilt residual carries `[_Symbol$iterator]: <value>` instead of leaking native
  //     `Symbol.iterator` (a TypeError on old runtimes without `Symbol`). value source stays
  //     verbatim - any polyfillable refs inside (e.g. `{next}` binding name) aren't polyfillable
  //   - 'rebuilt': partially-consumed nested pattern, reassembled by `renderRebuiltNestedProp`
  function renderOuterPlan(outer) {
    if (outer.kind === 'consumed') return { extractions: outer.extractions, preservedSrc: null };
    if (outer.kind === 'symbol-iterator-key') {
      const symBinding = injectPureImport('symbol/iterator', 'Symbol$iterator');
      return { preservedSrc: `[${ symBinding }]: ${ nodeSrc(outer.prop.value) }` };
    }
    if (outer.kind === 'rebuilt') return renderRebuiltNestedProp(outer);
    return { preservedSrc: nodeSrc(outer.prop) };
  }

  // reassemble a partially-consumed nested prop as `<key>: { <survivors> }`. a consumed
  // child under an inner RestElement keeps a `key: _unused` sentinel - rest gathers all
  // OTHER own keys, so dropping a fully-consumed key would change runtime semantics
  // (`rest.from` becomes defined, originally excluded); mirrors the outer-level treatment
  // in `rewriteDeclarator`. residual targets re-anchor the natural visitor's rewrites of
  // VERBATIM surviving children (e.g. a default `other = [1].at(0)`) into the rebuilt
  // string - else they leak native APIs in usage-pure. `dstStart` is the offset INSIDE
  // the rebuilt string; the outer rewriteDeclarator loop shifts it by this prop's offset
  // in the outer `{ ... }` text
  function renderRebuiltNestedProp(outer) {
    const preservedInner = [];
    const residualTargets = [];
    const innerHasRest = outer.pattern.properties.some(p => p.type === 'RestElement');
    // running offset into the rebuilt `<key>: { ... }` text: opens with `<key>: { ` before the first
    // entry, each preserved entry is followed by `, ` except the last
    let dstOffset = `${ flattenKeySrc(outer.prop) }: { `.length;
    for (const childPlan of outer.children) {
      const child = childPlan.prop;
      const e = renderOuterPlan(childPlan);
      let emitted = null;
      // rest-sentinel for a fully-consumed child under an inner rest: keep a `<key>: _unused`
      // sentinel, else `...rest` captures the originally-excluded key. route through the SAME
      // synth-aware renderer the OUTER-level sentinel (and babel) use, so a consumed
      // `[Symbol.iterator]` child re-keys through the polyfilled `_Symbol$iterator` binding here
      // too (a plain `flattenKeySrc` would leak the native `[Symbol.iterator]`, a ReferenceError on
      // runtimes without native Symbol). guarded by `extractions?.length` first so a keyless
      // RestElement child never reaches the key renderer
      if (childPlan.extractions?.length && innerHasRest && e.preservedSrc === null) {
        emitted = emitRestSentinel(childPlan, child);
      }
      if (e.preservedSrc !== null && e.preservedSrc !== undefined) {
        emitted = e.preservedSrc;
        if (emitted === nodeSrc(child)) {
          // verbatim child source: re-anchor the natural visitor's rewrite of its polyfillable content
          residualTargets.push({ srcStart: child.start, srcEnd: child.end, dstStart: dstOffset });
        } else if (e.residualTargets?.length) {
          // child was itself partially consumed (nested-nested): its targets are relative to its own
          // rebuilt string, which sits at `dstOffset` within this one
          for (const t of e.residualTargets) {
            residualTargets.push({ srcStart: t.srcStart, srcEnd: t.srcEnd, dstStart: dstOffset + t.dstStart });
          }
        }
      }
      if (emitted !== null) {
        preservedInner.push(emitted);
        dstOffset += emitted.length + 2;
      }
    }
    return {
      extractions: outer.extractions,
      preservedSrc: `${ flattenKeySrc(outer.prop) }: { ${ preservedInner.join(', ') } }`,
      residualTargets,
    };
  }

  // emit one extracted-declarator decl text for an outer-prop extraction record. dispatches
  // on `synth` discriminator: regular static-method extractions resolve via the polyfill
  // entry/hint pair; `symbol-iterator` synth wraps the receiver in `_getIteratorMethod(...)`
  // (mirror of babel-plugin's AST mutation for the same shape). receiver source is supplied
  // by the caller's thunk so it's only evaluated when needed (avoids spurious imports on
  // declarators with only entry-based extractions)
  function emitOuterExtraction(e, scope, getReceiverSrc) {
    if (e.synth === 'symbol-iterator') {
      const binding = injectPureImport('get-iterator-method', 'getIteratorMethod');
      return { decl: `${ e.localName } = ${ binding }(${ getReceiverSrc() })` };
    }
    const binding = injectPureImport(e.entry, e.hint);
    // register the body-extract alias so receiver-narrowing through this binding
    // (`xs = from('hi'); xs.at(0)`) finds the polyfill entry path. matches babel's
    // body-extract paths so multi-method narrowing works on extracted `from` / `of`
    // / etc. (without it, `at` / `includes` fall to generic `_at` / `_includes`)
    injector.registerBodyExtractAlias(e.localName, e.entry, scope?.getBinding(e.localName));
    return { decl: `${ e.localName } = ${ binding }` };
  }

  // build the residual destructure sentinel for a fully-consumed outer prop when the
  // pattern has a `...rest` sibling. without the sentinel `rest` would include the
  // consumed key, changing semantics. two shapes:
  //   - `Foo: _unused` for non-computed Identifier keys (plain proxy-global static-method case)
  //   - `[_Symbol$iterator]: _unused` for synth Symbol.iterator extractions - polyfilled
  //     iterator symbol so old runtimes without native Symbol can still parse the pattern.
  //     directly mirrors babel-plugin's `[_Symbol$iterator]: _unused2` rest-sentinel emit
  // returns null when the prop has no extractable key shape (caller skips push)
  function emitRestSentinel(outer, sourceProp) {
    if (outer.extractions?.[0]?.synth === 'symbol-iterator') {
      const symBinding = injectPureImport('symbol/iterator', 'Symbol$iterator');
      return `[${ symBinding }]: ${ injector.generateUnusedName() }`;
    }
    // the same key renderer the residual rebuild uses: bare Identifier, quoted string
    // literal (`"Array": _unused`), bracketed computed - all stay valid pattern keys
    return sourceProp?.key ? `${ flattenKeySrc(sourceProp) }: ${ injector.generateUnusedName() }` : null;
  }

  // execute the plan: inject polyfill imports, emit extractions. returns
  // `{ extractions: [{ decl }], preservedSrc }` where `preservedSrc` is null when the
  // declarator is fully consumed, raw src when there's no plan to touch, or a rebuilt
  // `{ ... } = init` source when outer siblings remain
  function rewriteDeclarator(declarator, scope, usePath = null) {
    const plan = planDeclarator(declarator, scope, usePath);
    if (!plan) return { extractions: [], preservedSrc: nodeSrc(declarator), receiver: null };
    const extractions = [];
    const preservedOuter = [];
    // receiver source for rebuilt-text slots inside the flatten's overwrite range. used by
    // both synth Symbol.iterator extraction RHS (`_getIteratorMethod(<receiver>)`) and the
    // partial-consume residual destructure init (`{ ... } = <receiver>`). same semantics
    // for both - `skipReceiverTailSubtree` suppresses the natural visitor on the init tail,
    // so leaking native global references would break old runtimes. dispatch:
    //   - aliased Identifier tail (`= obj` where `obj = globalThis`): keep user binding
    //     - matches babel-plugin byte-for-byte; alias decl's own init was polyfilled by
    //     the natural visitor outside the flatten range
    //   - everything else (direct proxy-global Identifier, MemberExpression chains, calls,
    //     etc.): swap to polyfill binding when the receiver resolves to a known global,
    //     else fall back to the raw tail source (static-object receivers)
    // SE prefix is peeled off the init tail upfront - prefix lifts standalone via
    // `liftExtractedSEPrefixes` (VariableDeclaration), `cascadeAssignmentExpression`
    // (AssignmentExpression), or `injectForInitSESinks` re-embed (for-init). embedding the
    // original `(se(), wrapper)` slice here would re-execute every prefix expression
    // harvested discard-SE source, consumed by exactly ONE emission slot: the rebuilt residual
    // init when the receiver swap drops the SE-bearing tail (partial consume), else the last
    // extraction's binding (full consume - matching babel's emit position, whose final per-prop
    // visit performs the discard). single consumption keeps the setup running exactly once
    let discardSeSrc = plan.discardSe ? nodeSrc(plan.discardSe) : null;
    function takeDiscardSe() {
      const src = discardSeSrc;
      discardSeSrc = null;
      return src;
    }
    let cachedReceiverEmitSrc;
    function receiverEmitSrc() {
      if (cachedReceiverEmitSrc !== undefined) return cachedReceiverEmitSrc;
      const { tail } = peelNestedSequenceExpressions(declarator.init);
      const tailSrc = nodeSrc(tail);
      const isAliasedIdentifier = tail?.type === 'Identifier' && tailSrc !== plan.receiver;
      // an SE-bearing tail (harvested discard-SE chain root) is kept VERBATIM instead of swapped
      // to the polyfill binding - the tail itself carries the setup, matching babel, which leaves
      // a kept init untouched; consuming the harvest here prevents the full-consume extraction
      // prefix from double-running it. the verbatim tail registers as a residual target below,
      // so its inner content (`globalThis`) still earns its own substitution
      const receiverPure = isAliasedIdentifier || plan.discardSe ? null : resolveGlobalPolyfill(plan.receiver);
      if (!receiverPure && plan.discardSe) takeDiscardSe();
      // wrap-peeled init: the swap targets the DESCENDED element inside the (SE-peeled) tail's
      // text, keeping the array brackets and sibling elements verbatim
      cachedReceiverEmitSrc = receiverPure
        ? plan.initElement && plan.initElement !== tail
          ? nodeSrc({ start: tail.start, end: plan.initElement.start })
            + injectPureImport(receiverPure.entry, receiverPure.hintName)
            + nodeSrc({ start: plan.initElement.end, end: tail.end })
          : injectPureImport(receiverPure.entry, receiverPure.hintName)
        : tailSrc;
      return cachedReceiverEmitSrc;
    }
    // RestElement in outer pattern - rest gathers all OTHER own keys, so dropping a
    // fully-consumed key from `{Array: {from}, ...rest} = globalThis` would change
    // runtime semantics (`rest.Array` becomes defined, original excluded it). keep
    // a `Foo: _unused` sentinel for each consumed key when rest is present
    // plan.pattern is the effective ObjectPattern (peeled past ArrayPattern wrapper for
    // `[{...}] = [globalThis]`); declarator.id may be the ArrayPattern wrapper itself
    const hasRest = plan.pattern.properties.some(p => p.type === 'RestElement');
    // verbatim residual outer props (and the verbatim init tail) carry the original source
    // slice unchanged. their polyfillable contents (`other = [1].at(0)` default, a computed
    // key, a static-method value) stay VISIBLE to the natural visitor so it queues the
    // polyfill rewrite; `bakeResidualContentIntoPreserved` later drains those queued
    // transforms and splices them into `preservedSrc`. each target records the original
    // source range plus its offset inside the rebuilt `preservedSrc` for the remap
    const residualTargets = [];
    // the consumed pattern may sit under ArrayPattern (and inner-default) wrappers - splice the
    // rebuilt object pattern back into the ORIGINAL LHS text so the wrapper survives and rest
    // keeps reading the matching init element (`[{...rest}] = [R]`); the init side needs nothing:
    // `receiverEmitSrc` falls back to the verbatim whole-init tail for non-proxy receivers
    // an ANCHORED residual drops the hop wrapper entirely (`{ Map: { custom } }` ->
    // `{ custom } = _Map`), so no LHS slices survive; the anchor gate excludes array wrappers
    const keepsWrapper = !plan.anchor && declarator.id !== plan.pattern;
    const lhsPrefix = keepsWrapper ? nodeSrc({ start: declarator.id.start, end: plan.pattern.start }) : '';
    const lhsSuffix = keepsWrapper ? nodeSrc({ start: plan.pattern.end, end: declarator.id.end }) : '';
    // running offset into the rebuilt `<lhsPrefix>{ ... }<lhsSuffix> = init` text: the object
    // pattern opens with `{ ` past the wrapper prefix, each emitted prop is followed by `, `
    // except the last
    let dstOffset = lhsPrefix.length + 2;
    for (let i = 0; i < plan.outerProps.length; i++) {
      const outer = renderOuterPlan(plan.outerProps[i]);
      for (const e of outer.extractions ?? []) {
        extractions.push(emitOuterExtraction(e, scope, receiverEmitSrc));
      }
      let emitted = null;
      if (outer.preservedSrc !== null) {
        emitted = outer.preservedSrc;
        // verbatim source slice (a 'verbatim' plan node): a residual sibling whose inner
        // polyfillable content the natural visitor must still rewrite
        const sourceProp = plan.pattern.properties[i];
        if (sourceProp && emitted === nodeSrc(sourceProp)) {
          residualTargets.push({ srcStart: sourceProp.start, srcEnd: sourceProp.end, dstStart: dstOffset });
        } else if (outer.residualTargets?.length) {
          // partially-consumed NESTED prop: the rebuilt `key: { ... }` string reported the
          // residual targets of its surviving inner children (relative to that string). the string sits
          // at `dstOffset` in the outer `{ ... }` text, so shift each target in - without this the inner
          // survivors' polyfillable content leaks native (the U01 nested-residual drop)
          for (const t of outer.residualTargets) {
            residualTargets.push({ srcStart: t.srcStart, srcEnd: t.srcEnd, dstStart: dstOffset + t.dstStart });
          }
        }
      } else if (hasRest) {
        emitted = emitRestSentinel(outer, plan.pattern.properties[i]);
      }
      if (emitted !== null) {
        preservedOuter.push(emitted);
        dstOffset += emitted.length + 2;
      }
    }
    if (!preservedOuter.length) {
      // full consume discards the whole init: re-emit the harvested SE ahead of the last
      // extraction's binding (unless a synth extraction's receiverEmitSrc already embedded it)
      const sePrefix = extractions.length ? takeDiscardSe() : null;
      if (sePrefix) {
        const last = extractions.at(-1);
        const eq = last.decl.indexOf(' = ');
        last.decl = `${ last.decl.slice(0, eq) } = (${ sePrefix }, ${ last.decl.slice(eq + 3) })`;
      }
      return {
        extractions, preservedSrc: null, receiver: plan.receiver, residualTargets: [],
        discardSeNode: plan.discardSe ?? null, anchored: !!plan.anchor,
      };
    }
    // anchored residual reads through the CONSTRUCTOR binding (`= _Map` - patch-visible for
    // mutated statics, defined on missing-global targets), or a member off the proxy's own
    // binding when the ctor has no whole-constructor pure entry (`= _globalThis.Math`)
    let initSrc;
    if (plan.anchor) {
      if (plan.anchorPure) initSrc = injectPureImport(plan.anchorPure.entry, plan.anchorPure.hintName);
      else {
        const proxyPure = resolveGlobalPolyfill(plan.receiver);
        initSrc = `${ proxyPure ? injectPureImport(proxyPure.entry, proxyPure.hintName) : plan.receiver }.${ plan.anchor }`;
      }
    } else initSrc = receiverEmitSrc();
    const preservedSrc = `${ lhsPrefix }{ ${ preservedOuter.join(', ') } }${ lhsSuffix } = ${ initSrc }`;
    // init tail kept verbatim (receiver not polyfilled, e.g. a static-object receiver): its
    // polyfillable contents stay visible to the natural visitor like a residual prop
    const initTail = peelNestedSequenceExpressions(declarator.init).tail;
    if (initTail && initSrc === nodeSrc(initTail)) {
      residualTargets.push({ srcStart: initTail.start, srcEnd: initTail.end, dstStart: preservedSrc.length - initSrc.length });
    }
    return {
      extractions,
      preservedSrc,
      // captured separately so `injectForInitSESinks` (for-init partial-consume SE re-embed)
      // can slice off the trailing init slot by length without text-searching
      preservedInitSrc: initSrc,
      receiver: plan.receiver,
      residualTargets,
      discardSeNode: plan.discardSe ?? null,
      anchored: !!plan.anchor,
    };
  }

  // pre-pass helper: true when every outer prop was fully consumed - flatten will
  // discard the declarator's init, so `_globalThis` injection can be suppressed
  function canFullyConsumeProxyDeclarator(d, scope, usePath = null) {
    const plan = planDeclarator(d, scope, usePath);
    return !!plan && plan.outerProps.every(p => p.kind === 'consumed');
  }

  // sibling-side companion of `rewriteDeclarator` for multi-decl flatten.
  // walks a preserved-only declarator for Identifiers matching any flattened receiver name,
  // substitutes them with their polyfill binding directly in the rendered source, and seeds
  // skippedNodes so identifier visitor doesn't queue a parallel transform that would mismatch
  // TransformQueue's nth-count compose
  function polyfillSiblingReceiverRefs(declarator, flattenedReceivers) {
    // collect Identifier matches with shadowing + parent-MemberExpression filtering. skip rules:
    //   (1) parent MemberExpression resolves to a polyfillable global (`globalThis.Map`,
    //       `globalThis['Map']`). the outer MemberExpression transform replaces the whole
    //       `globalThis.Map` range with `_Map`; a competing inline `globalThis -> _globalThis`
    //       would land a `_globalThis.Map` substring INSIDE the outer's `_Map` content during
    //       compose, turning the inner needle search into a partial match (`__Map` corruption).
    //       both non-computed `obj.Map` and computed-string `obj['Map']` shapes apply
    //   (2) Identifier shadowed by an ancestor inside the declarator. function-like ancestors
    //       (param / function name), block-level `let`/`const`/`class`/`function` declarations,
    //       catch-param, and for-statement let/const headers all bind names that locally
    //       shadow the outer global. rewriting the inner reference would change semantics
    //       (`function (globalThis) { return globalThis }` returns the param, not `_globalThis`;
    //       `{ let from = userFn; from(); }` calls user fn, not `_Array$from`)
    //   (3) Identifier IS the binding position (declarator.id, function/class.id, catch.param) -
    //       it's the name being introduced, not a reference. parser-side shorthand props /
    //       computed keys would bypass `isNonReferencePosition`'s NON_REF_KEY_BEARING_TYPES
    //       check, but binding positions are a distinct shape parser-wide
    const matches = [];
    const scopeStack = [];

    // own lexical-scope owners are SIBLING_LEXICAL_SCOPE_OWNERS (hoisted module-level).
    // StaticBlock is BOTH a var-scope (per ES2022) AND a lexical-scope owner; treated
    // jointly via `isVarScopeBoundary` (collectFunctionVars bails) + explicit `pushScope`
    // branch (collects both bands of bindings)
    function isVarScopeBoundary(type) {
      return FUNCTION_LIKE_NODE_TYPES.has(type) || type === 'StaticBlock';
    }

    function isScopeOwner(type) {
      return isVarScopeBoundary(type) || SIBLING_LEXICAL_SCOPE_OWNERS.has(type);
    }

    // walk body for `var` declarations, stopping at nested own-var-scope owners (their
    // vars belong to their own scope, not ours). without this gate,
    // `function () { var globalThis; return globalThis; }` would replace the inner ref
    // even though the local `var` shadows the outer global
    function collectFunctionVars(node, locals) {
      if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
      if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        for (const d of node.declarations) walkPatternIdentifiers(d.id, id => locals.add(id.name));
        return;
      }
      if (isVarScopeBoundary(node.type)) return;
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (Array.isArray(value)) for (const v of value) collectFunctionVars(v, locals);
        else collectFunctionVars(value, locals);
      }
    }

    // record `let` / `const` / `using` / `await using` declarators + Class/Function-Declaration
    // ids on `decl` into `locals`. `var` intentionally excluded - collected by
    // `collectFunctionVars` at the enclosing function-scope owner (or here in pushScope's
    // StaticBlock branch). TC39 explicit-resource-management `using` kinds are block-scoped
    // per spec; missing them lets `using globalThis = res();` slip past shadow detection
    function collectLexicalBinding(decl, locals) {
      if (!decl) return;
      if (decl.type === 'VariableDeclaration' && SIBLING_LEXICAL_DECL_KINDS.has(decl.kind)) {
        for (const d of decl.declarations) walkPatternIdentifiers(d.id, id => locals.add(id.name));
      } else if (decl.type === 'ClassDeclaration' && decl.id?.name) locals.add(decl.id.name);
      else if (decl.type === 'FunctionDeclaration' && decl.id?.name) locals.add(decl.id.name);
    }

    // unified scope push: dispatches on node.type to collect bindings native to that
    // scope kind. function-likes get params + own name + body vars; StaticBlock gets
    // both lexical bindings AND vars (own var-scope per ES2022); blocks/loops/catch
    // get only lexical bindings. result pushed to scopeStack regardless of kind
    function pushScope(node) {
      const locals = new Set();
      if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
        for (const param of node.params ?? []) {
          walkPatternIdentifiers(param, id => locals.add(id.name));
        }
        if (node.id?.name) locals.add(node.id.name);
        if (node.body) collectFunctionVars(node.body, locals);
      } else switch (node.type) {
        case 'StaticBlock':
          for (const stmt of node.body ?? []) {
            collectLexicalBinding(stmt, locals);
            collectFunctionVars(stmt, locals);
          }
          break;
        case 'BlockStatement':
          for (const stmt of node.body ?? []) collectLexicalBinding(stmt, locals);
          break;
        case 'CatchClause':
          if (node.param) walkPatternIdentifiers(node.param, id => locals.add(id.name));
          break;
        case 'ForStatement':
          collectLexicalBinding(node.init, locals);
          break;
        case 'ForOfStatement':
        case 'ForInStatement':
          collectLexicalBinding(node.left, locals);
          break;
        case 'ClassExpression':
        case 'ClassDeclaration':
          // class id binds inside the class body (always for ClassExpression, also for
          // ClassDeclaration). property keys and method names don't shadow - they're keys
          // not bindings. PropertyDefinition value runs in this scope too, so initializer
          // references to the class id resolve here
          if (node.id?.name) locals.add(node.id.name);
          break;
        case 'SwitchStatement':
          // ES spec: switch creates one block scope shared across all cases. lexical
          // decls in any case body land here, not at the enclosing block. without this,
          // `switch (x) { case 1: let globalThis = res(); break; case 2: foo(globalThis); }`
          // wouldn't see the shadow when checking case 2's globalThis ref
          for (const c of node.cases ?? []) {
            for (const stmt of c.consequent ?? []) collectLexicalBinding(stmt, locals);
          }
          break;
      }
      scopeStack.push(locals);
    }

    function isShadowed(name) {
      for (const scope of scopeStack) if (scope.has(name)) return true;
      return false;
    }

    // true when `constructorName` names a known constructor (`Object`) and `outerMember`
    // reads a static method off the `innerMember` hop that produced it - mirrors the natural
    // visitor resolving `globalThis.Object.fromEntries` to `_Object$fromEntries`. the outer
    // hop must sit directly on `innerMember` to stay on the chain anchored at the receiver
    function readsStaticOffConstructor(constructorName, outerMember, innerMember) {
      if (!isStaticPlacement(constructorName)) return false;
      if (outerMember?.type !== 'MemberExpression' || outerMember.object !== innerMember) return false;
      const staticKey = memberKeyName(outerMember);
      return staticKey !== null
        && !!resolveBuiltIn({ kind: 'property', object: constructorName, key: staticKey, placement: 'static' });
    }

    // skip the receiver-ref substitution when ANY enclosing member access (at any depth)
    // is polyfillable - the natural visitor overwrites a span that STARTS at this receiver
    // identifier, so a competing inline `globalThis -> _globalThis` would land inside that
    // overwrite and corrupt the inner-needle compose. two polyfillable shapes are detected
    // per enclosing hop, mirroring what the natural visitor resolves:
    //   - whole-constructor global (`globalThis.Map` -> `_Map`): key resolves via
    //     `resolveGlobalPolyfill`. single-hop, but a deeper chain (`globalThis.Map.x`)
    //     still starts at the same receiver so the whole chain is covered
    //   - static method on a known constructor (`globalThis.Object.fromEntries` ->
    //     `_Object$fromEntries`): the receiver hop names a constructor and the NEXT hop's
    //     key resolves as its static. `Object` has no whole-constructor polyfill, so the
    //     single-hop gate alone left this receiver substitutable -> double-substitution crash
    function isPolyfillableMemberAccess(ancestors, identifierNode) {
      // walk UP the enclosing member chain: each hop's `.object` must be the previous hop
      // (the chain rooted at `identifierNode`); stop at the first non-MemberExpression or
      // dynamic key, since that breaks the contiguous chain anchored at the receiver
      let child = identifierNode;
      for (let depth = ancestors.length - 1; depth >= 0; depth--) {
        const member = ancestors[depth];
        if (member?.type !== 'MemberExpression' || member.object !== child) break;
        const key = memberKeyName(member);
        if (key === null) break;
        if (resolveGlobalPolyfill(key)) return true;
        if (readsStaticOffConstructor(key, ancestors[depth - 1], member)) return true;
        child = member;
      }
      return false;
    }

    // `ancestors` accumulates the enclosing-node stack (root-first) so the member-chain
    // skip-check can walk UP from a matched receiver identifier through every enclosing
    // MemberExpression - a single immediate-parent pointer can't see `globalThis.Object`'s
    // OWN parent `globalThis.Object.fromEntries`
    const ancestors = [];
    function walk(node, parent) {
      if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
      const opens = isScopeOwner(node.type);
      if (opens) pushScope(node);
      if (node.type === 'Identifier' && flattenedReceivers.has(node.name)
        && !isShadowed(node.name) && !isPolyfillableMemberAccess(ancestors, node)
        && !isNonReferencePosition(parent, node) && !isBindingPosition(parent, node)) {
        matches.push(node);
      }
      ancestors.push(node);
      for (const key of Object.keys(node)) {
        // skip the `init` slot of a nested VariableDeclarator with ObjectPattern id
        // (potentially flatten-eligible inner destructure). its own inner flatten consumes
        // the receiver via the inner-flatten's overwrite, OR the natural visitor handles
        // the inner Identifier substitution normally. queueing a transform from THIS
        // outer walk for an Identifier consumed by inner-flatten would survive past the
        // inner-flatten's overwrite and trigger transform-queue compose's "needle missing"
        // invariant (inner flatten's rebuilt text drops the receiver entirely)
        if (key === 'init' && node.type === 'VariableDeclarator'
          && node.id?.type === 'ObjectPattern') continue;
        const value = node[key];
        if (Array.isArray(value)) for (const item of value) walk(item, node);
        else walk(value, node);
      }
      ancestors.pop();
      if (opens) scopeStack.pop();
    }

    walk(declarator, null);
    if (!matches.length) return;
    // queue substitutions on the transform queue (NOT as preservedSrc splices). text-splicing
    // preservedSrc breaks transform-queue compose for nested transforms within the
    // sibling: a body-wrap (e.g. instance-method `.values()` on the matched Identifier's
    // ancestor) captures its needle from ORIGINAL source. if preservedSrc already had the
    // substitution baked in, the body-wrap's `globalThis` needle wouldn't match the now-
    // `_globalThis`-substituted preservedSrc, dropping the wrap composition and emitting
    // trailing-paren corruption. queuing transforms here lets compose nest them naturally
    // - the substitution composes into body-wrap content via needle match (mirroring how
    // the standalone non-flatten case works). also skip the natural Identifier visitor on
    // these matches: bespoke shadow tracking here handles nested-function scopes that
    // scope-tracker's setScope walk doesn't always reach
    for (const match of matches) {
      const pure = resolveGlobalPolyfill(match.name);
      if (!pure) continue;
      skippedNodes.add(match);
      transforms.add(match.start, match.end, injectPureImport(pure.entry, pure.hintName));
    }
  }

  // ---------- destructure rewrite pipeline ----------

  // top-level destructure path (`const {from} = cond ? Array : Set`, assignment-target).
  // resolves the wrapper's RHS via the unified slot/IIFE helper, then delegates to the
  // shared per-branch helper. wraps to keep `handleDestructuringPure` under lint statement-cap
  function tryFromFallbackPerBranchSynth(meta, metaPath, propNode) {
    const desc = resolveFallbackReceiver(metaPath.parentPath?.parentPath, metaPath.parent);
    const registered = desc && tryRegisterPerBranchSynth({
      rhs: desc.rhsNode, propNode, objectPattern: metaPath.parent, scope: metaPath.scope, path: metaPath,
    });
    if (!registered) warnConditionalFallbackUntouched(meta, metaPath);
  }

  // ConditionalExpression / LogicalExpression in destructure-receiver position
  // (`= cond ? Array : Set` / `= Array || Set`). `meta.fromFallback` flags this case -
  // the resolved meta tracks ONE branch but runtime picks per-call. for branches
  // statically resolvable to a known global with a viable static polyfill for the
  // destructured key, register a per-branch synth-swap so each branch becomes its own
  // `{key: _Branch$key, ...}` literal. branches without viable polyfill are left raw -
  // the constructor identifier visitor still emits `_Set` etc. for shadow-correct globals.
  // returns true when at least one branch was registered
  function tryRegisterPerBranchSynth({ rhs, propNode, objectPattern, scope, path = null }) {
    if (!rhs || !propNode || !objectPattern) return false;
    // per-branch has no body-extract fallback, so it accepts static-literal computed keys (`['from']`)
    // and synths them rather than dropping the polyfill (resolveSynthKeys folds the key to its value).
    // a SIDE-EFFECTING computed key (`[(eff(), 'from')]`) is accepted too: synthSwapPropKey folds it to
    // its static `["from"]` slot (no effect in the synth literal) while the effect stays in the residual
    // LHS pattern and runs exactly once - so the proxy branch polyfills instead of bailing to native
    if (!isSynthSimpleObjectPattern(objectPattern, { allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true })) return false;
    // a bare-global computed-key sibling (`[Set]`) would be emitted raw into each branch's synth
    // literal and throw ReferenceError on the target engine - bail rather than leak (matches babel)
    if (!computedKeysAllBound(objectPattern, scope)) return false;
    // a user-const computed key (`const k = 'from'; [k]`) resolves to its static name for the branch
    // viability lookup but registers under its synth SLOT key (`[k]`), so the synth literal emits
    // `[k]: _polyfill` instead of dropping the polyfill; the resolved value also polyfills a sibling-
    // aliasing computed key (`{ from, [k]: x }` with k='from'). a dynamic key (lookupKey null) bails
    const { lookupKey, slotKey } = resolveSynthKeys({ node: propNode, scope, adapter: estreeAdapter, path });
    if (!lookupKey) return false;
    // `registerBranchTreeForKey` peels paren / TS / chain / SE wrappers internally - do NOT
    // peel chain-assignment here (`foo = cond ? Array : Set` is intentional escape hatch;
    // rewriting branches as synth literals would change `foo`'s runtime value)
    return registerBranchTreeForKey(rhs, lookupKey, slotKey, objectPattern, scope, path);
  }

  // recurse into nested ConditionalExpression / LogicalExpression branches so every leaf
  // gets per-branch synth-swap. `peelFallbackBranchInner` peels paren / TS / chain AND SE
  // tail so `(logCall(), cond ? A : B)` reaches the inner conditional, slot detection finds
  // the branches, and recursion registers each leaf. SE prefix stays in the source range
  // around the substitution target via `applySynthSwaps`' inner-position overwrite
  function registerBranchTreeForKey(branch, lookupKey, slotKey, objectPattern, scope, path) {
    const inner = peelFallbackBranchInner(branch);
    if (!inner) return false;
    const slots = getFallbackBranchSlots(inner);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        if (registerBranchTreeForKey(inner[slot], lookupKey, slotKey, objectPattern, scope, path)) any = true;
      }
      return any;
    }
    // `lookupKey` is the resolved static name (probes the branch for a polyfillable static); `slotKey`
    // is the synth-literal slot (`[k]` for a computed key) the polyfill is registered + emitted under
    const pure = isViableBranchForKey({ branch, key: lookupKey, scope, adapter: estreeAdapter, resolvePure, path });
    if (!pure) return false;
    // call-shaped branch: viable only for a single fully-polyfilled key (unpolyfilled keys re-read
    // through the receiver, re-running the call); an SE-bearing call is rescued ahead of the synth
    // literal. the call's INNER references stay unmarked below, so their own substitutions
    // (`return Promise` -> `return _Promise`) compose into the re-emitted text
    // call-branch policy (single fully-polyfilled key + SE rescue) lives in the shared
    // `classifyCallBranchForSynth`
    const { callBranch, rescueSe } = classifyCallBranchForSynth({ inner, scope, adapter: estreeAdapter, path });
    const binding = injectPureImport(pure.entry, pure.hintName);
    // mark Paren / TS / ChainExpression wrappers AND the inner resolved receiver
    // (Identifier or proxy-global MemberExpression chain). without marking the wrappers,
    // the inner Identifier visitor fires on `Iterator` / `globalThis` and emits a parallel
    // polyfill that conflicts with the synth-swap emit.
    // the receiver to skip is the same `inner` already resolved above - for a SE branch
    // (`(log(), globalThis.Array)`) that is the peeled SE TAIL, exactly the node the synth
    // swap later overwrites. skip-marking it keeps the natural visitor from substituting
    // `globalThis -> _globalThis` INSIDE that soon-to-be-overwritten span. the SE prefix
    // (`log()`) stays unmarked so its inner identifiers still polyfill and run at runtime
    markAndPeelSkippableWrappers(branch, skippedNodes);
    markSynthReceiverSkipped(inner, skippedNodes);
    let pending = pendingSynthSwaps.get(branch);
    if (!pending) {
      pending = { receiver: branch, objectPattern, polyfills: new Map(), callBranch, rescueSe };
      pendingSynthSwaps.set(branch, pending);
    }
    pending.polyfills.set(slotKey, binding);
    return true;
  }

  // parameter destructure. synth-swap when `findSynthSwapReceiver` identifies a safe
  // Identifier receiver; otherwise inline-default `{p = _polyfill}`.
  // a body-extracted param keeps its receiver as the DEFAULT (`function ({...rest} = R)`),
  // evaluated when the arg is undefined. the natural identifier visitor substitutes only the
  // proxy-global ROOT, so delete just the intermediate proxy hop text (`.self` / `['self']`)
  // to collapse `globalThis.self.Array` to `_globalThis.Array` - keeping `.self` reads an
  // undefined property off the global object on hosts without it (ie:11 pure / Node). deleting
  // only the hop abuts the root-substitution range (no overlap), unlike a full-span overwrite.
  // `maximalProxyGlobalHop` gates on a real intermediate hop, so this no-ops on the bare root
  function collapseRetainedProxyDefault(receiver, aliasCtx = null) {
    // a retained LOGICAL receiver (`globalThis.self.Array || Set`) keeps its operands live; an
    // evaluated operand must not read `_globalThis.self` (undefined on ie:11 / Node, which throws
    // BEFORE `||` can short-circuit). recurse and collapse the proxy hop in EACH non-pure operand
    // - mirrors the babel `collapseRetainedProxyReceiver` recursion. pure-ctor operands are skipped
    // by the per-operand pure-leaf guard below and whole-swapped by the natural visitor. this only
    // applies when the receiver SURVIVES (body-extract / verbatim-gate / inline-default); the
    // whole-logical synth-swap path replaces the operands wholesale, so no hop survives to collapse
    let peeled = receiver;
    while (peeled && (peeled.type === 'ParenthesizedExpression' || peeled.type === 'ChainExpression'
      || peeled.type === 'SequenceExpression' || TS_EXPR_WRAPPERS.has(peeled.type))) {
      // peel a SE tail too (`(effect(), globalThis.self.Array || Set)`) so an SE-wrapped logical
      // reaches the per-operand recursion, matching the babel twin `collapseRetainedProxyReceiver`.
      // without this the logical's `.self` hop survives uncollapsed -> runtime-undefined
      // `_globalThis.self.Array` (ie:11 throw). the SE prefix stays in source; only the tail's hop
      // bytes are edited, so peeling to the tail does not drop the effect
      peeled = peeled.type === 'SequenceExpression' ? peeled.expressions.at(-1) : peeled.expression;
    }
    if (peeled?.type === 'LogicalExpression') {
      collapseRetainedProxyDefault(peeled.left, aliasCtx);
      collapseRetainedProxyDefault(peeled.right, aliasCtx);
      return;
    }
    const prefix = receiver && maximalProxyGlobalHop(receiver, aliasCtx);
    if (!prefix) return;
    // start the hop-deletion at the WRAPPER-inclusive root end, not the peeled identifier's:
    // for a parenthesized root (`(globalThis).self.Array`) the identifier end lies inside the
    // `)`, so the deletion would overlap the paren-inclusive root substitution and throw
    let member = receiver;
    while (member && (member.type === 'ParenthesizedExpression' || member.type === 'ChainExpression'
      || member.type === 'SequenceExpression' || TS_EXPR_WRAPPERS.has(member.type))) {
      // SE tail carries the proxy chain (`(se(), globalThis.self.Array)`); peel to it so the `.self`
      // hop is collapsed in the residual too, not just on the non-SE path
      member = member.type === 'SequenceExpression' ? member.expressions.at(-1) : member.expression;
    }
    if (member?.type !== 'MemberExpression') return;
    // a leaf that itself resolves to a NEEDED constructor polyfill (`globalThis?.self?.['Map']`
    // on ie11) is owned WHOLE by the constructor substitution - any hop edit here would
    // overlap that full-span overwrite
    if (resolveGlobalPolyfill(memberKeyName(member) ?? '')) return;
    let start = proxyGlobalWrappedRoot(receiver, aliasCtx).end;
    // an OPTIONAL root connector belongs to the ROOT substitution (`globalThis?.` rewrites to
    // `_globalThis.` - connector included): start past it or the transforms overlap on those
    // bytes. the replacement then re-establishes exactly one connector for the leaf: none when
    // the root substitution already emitted it, `.` otherwise
    const rootToken = /^\s*\?\./.exec(nodeSrc({ start, end: prefix.end }));
    if (rootToken) start += rootToken[0].length;
    // optional root + computed leaf: the root substitution would deopt `globalThis?.` to
    // `_globalThis.`, but a computed leaf takes NO connector - own the whole receiver-to-
    // bracket span instead and suppress the root's own rewrite
    if (member.computed && rootToken) {
      const rootIdent = findProxyGlobal(receiver, aliasCtx);
      const pure = rootIdent && resolveGlobalPolyfill(rootIdent.name);
      if (!pure) return;
      const bracket = /^\s*(?:\?\.\s*)?\[/.exec(nodeSrc({ start: prefix.end, end: member.property.start }));
      if (!bracket) return;
      skippedNodes.add(rootIdent);
      transforms.add(proxyGlobalWrappedRoot(receiver, aliasCtx).start, prefix.end + bracket[0].length - 1,
        injectPureImport(pure.entry, pure.hintName));
      return;
    }
    let spliceEnd = prefix.end;
    const leafToken = /^\s*(?:\?\.|\.)/.exec(nodeSrc({ start: spliceEnd, end: member.property.start }));
    if (leafToken) spliceEnd += leafToken[0].length;
    // a computed leaf (`['Object']`) needs no connector at all
    transforms.add(start, spliceEnd, member.computed || rootToken ? '' : '.');
  }

  // AssignmentPattern value (`{from = []}`): accept and polyfill via synth-swap - the
  // user's default becomes dead code because synth-polyfilled property is always defined

  // declaration host with a side-effecting computed key (`{ [(eff(), 'from')]: f } = R`), nested or not.
  // the ONE robust emission: keep the key IN PLACE (its value renamed to a throwaway, so the effect runs
  // exactly once and in source order) and bind the polyfill separately. for-init has no room for a
  // preceding statement, so the binding becomes a sibling declarator in the loop header. export (the
  // `export ` keyword precedes `declaration.start`, so it attaches to the new binding), array-wrappers,
  // and nested-sequence keys all fall out for free - the key text is left untouched. an INSTANCE method
  // polyfills only when its receiver resolves to a bare Identifier (top-level or nested). returns false
  // (caller falls to the param synth-swap) for no host declaration, a for-of/for-in head, or an instance
  // receiver the planner can't safely re-reference
  function tryHandleSideEffectKeyDeclaration(meta, metaPath, propNode) {
    if (meta.fromFallback) return false;
    if (handledSideEffectKeyProps.has(propNode)) return true;
    const localId = propBindingIdentifier(propNode.value);
    if (!localId) return false;
    const declPath = walkUpNestedDestructureToDeclaration(metaPath.parentPath);
    const declaration = declPath?.node;
    if (declaration?.type !== 'VariableDeclaration') return false;
    const hostNode = declPath.parentPath?.node;
    // for-of / for-in head binding can host neither a preceding statement nor a sibling declarator
    if (hostNode?.type === 'ForOfStatement' || hostNode?.type === 'ForInStatement') return false;
    const pureResult = resolvePure(meta, metaPath);
    if (!pureResult) return false;
    const isForInit = hostNode?.type === 'ForStatement' && hostNode.init === declaration;
    // top-level: `declarator.init`; nested: the receiver walked from the RHS along the nesting keys
    const receiverNode = resolveNestedReceiverNode(metaPath);
    // the declarator hosting this leaf, plus whether it is the WHOLE declaration's only binding and whether
    // its init carries no side effect - the planner needs these to drop a dead residual / memoize the receiver
    const declarator = declaration.declarations.find(d => d.start <= propNode.start && propNode.end <= d.end);
    // a CONDITIONAL / LOGICAL receiver (`c ? globalThis : userObj`, `m && globalThis`, `g || self`)
    // must NOT extract `const f = _polyfill` unconditionally: on a diverging branch that binds the
    // polyfill where native reads the user's own `undefined`, corrupting it. decline (no emission) so
    // it falls through to the receiver-aware nested mirror, which swaps only the proxy operand(s) and
    // keeps the SE key in the residual LHS (runs once). mirrors babel; a bare receiver keeps the sound
    // SE-extraction (the effect is preserved by the residual and the polyfill always wins)
    // decline (-> receiver-aware mirror) for a DIVERGING receiver (a reachable non-proxy value branch:
    // the case the extraction would corrupt) OR an `&&` guard (babel keeps its `&&` structure and
    // mirrors only the right operand, so match it - a single swap, no composition risk). an all-proxy
    // ternary / `||` collapses to one proxy and extracts on both sides (mirroring would have to swap
    // BOTH branches, which the text composer can't compose). `outerDestructureReceiver` descends array
    // wrappers (`[{ Array: { [se]: f } }] = [c ? gt : u]`); AST intact here, so the proxy check holds
    const recv = outerDestructureReceiver(metaPath.parentPath, metaPath.scope, estreeAdapter);
    const recvType = recv?.type;
    const mirrorReceiver = (recvType === 'ConditionalExpression' || recvType === 'LogicalExpression')
      && (!destructureValueBranchesAllProxy(recv) || (recvType === 'LogicalExpression' && recv.operator === '&&'));
    if (pureResult.kind !== 'instance' && mirrorReceiver) return false;
    let bindingCount = 0;
    if (declarator) walkPatternIdentifiers(declarator.id, () => bindingCount++);
    const plan = planSideEffectKeyStrategy({
      polyfillKind: pureResult.kind,
      isForInit,
      isMultiDeclarator: declaration.declarations.length > 1,
      receiverIsSafe: isReReferenceableReceiver(receiverNode),
      receiverIsConstantLiteral: isConstantLiteralReceiver(receiverNode),
      soleBindingInDeclaration: declaration.declarations.length === 1 && bindingCount === 1,
      initIsPure: !!declarator && !mayHaveSideEffects(declarator.init),
      propKeyIsPure: !(propNode.computed && sequenceKeyPrefix(propNode.key)),
    });
    if (!plan) return false;
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    handledSideEffectKeyProps.add(propNode);
    // body-extract alias so post-rewrite narrowing resolves the local (static only; instance has none)
    if (!plan.instance) injector.registerBodyExtractAlias(localId.name, pureResult.entry, metaPath.scope?.getBinding(localId.name));
    // dead residual: this leaf is the declaration's only binding and the init has no effect to preserve, so
    // the destructure binds nothing observable - replace the whole declaration with just the extracted
    // binding. emitted BEFORE the de-shorthand below (which would otherwise land a transform inside this
    // overwrite). skip the declarator subtree so the visitor doesn't queue a rewrite inside the dropped range
    // (the instance receiver stays visible + defers; a static polyfill carries no receiver, so nothing is stranded)
    if (plan.eliminateResidual) {
      const exportNode = declPath.parentPath?.node?.type === 'ExportNamedDeclaration' ? declPath.parentPath.node : null;
      const [start, end] = exportNode ? [exportNode.start, exportNode.end] : [declaration.start, declaration.end];
      const prefix = `${ exportNode ? 'export ' : '' }${ declaration.kind } ${ localId.name } = `;
      // INSTANCE: the receiver is consumed (this whole declaration is dropped, receiver appears only in
      // the copy). keep the receiver subtree VISIBLE so the natural visitor polyfills it in place, skip
      // the rest of the declarator, and defer the overwrite to flush where `composedRangeSrc` bakes the
      // visitor's substitutions into the copy (one occurrence -> compose-drain is safe). a static
      // polyfill has no receiver, so it emits its bare binding immediately
      if (plan.instance) {
        walkAstNodes({ root: declarator, visit: n => {
          if (n.start < receiverNode.start || n.end > receiverNode.end) skippedNodes.add(n);
        } });
        pendingReceiverExtracts.push({ start, end, prefix, binding, receiverNode });
        return true;
      }
      walkAstNodes({ root: declarator, visit: n => skippedNodes.add(n) });
      transforms.add(start, end, `${ prefix }${ binding };`);
      return true;
    }
    // rename the key's value to a throwaway: the effect stays in the kept key (runs once), the native
    // value + any dead default are read & discarded. skip the whole value SUBTREE so the visitor doesn't
    // polyfill a call inside a dead default (`= (log.push(), 9)`) - that would leave an orphaned transform
    // overlapping the rename. the default is discarded anyway, so its calls never run.
    // a SHORTHAND prop (`{ at }`) has key === value, so renaming only the value span would emit `{ _unused }`
    // (a shorthand reading the WRONG property `_unused`); de-shorthand to `at: _unused` to keep the original
    // key read (getter side effects / `...rest` exclusion). a keyed prop (incl. an SE key `[se()]: a`)
    // already separates key from value, so renaming the value alone preserves the key
    walkAstNodes({ root: propNode.value, visit: n => skippedNodes.add(n) });
    const sentinel = injector.generateUnusedName();
    transforms.add(propNode.value.start, propNode.value.end,
      propNode.shorthand ? `${ flattenKeySrc(propNode) }: ${ sentinel }` : sentinel);
    // resolve the branch sink ONCE; a flatten claim's lookup + bail stays eager (it can refuse the
    // whole handler). `emit(copyExpr, hoist)` then routes `localId = copyExpr` to that sink, shared by
    // the eager paths (static binding / memoized `_ref`) and the deferred duplicated-instance copy
    const isFlattenClaimed = !plan.siblingDeclarator && flattenedNestedDecls.has(declaration);
    let flattenEntry = null;
    let flattenIdx = -1;
    if (isFlattenClaimed) {
      // a flatten already claimed this declaration (a sibling branch dispatched first): a standalone
      // start-anchored insert would land ABOVE the flatten's whole-range render, reordering the
      // extractions against source order. the claimed slot's extraction list emits in plan order
      flattenEntry = pendingFlatten.find(f => f.declaration === declaration);
      flattenIdx = flattenEntry ? declaration.declarations.findIndex(
        d => d.start <= propNode.start && propNode.end <= d.end) : -1;
      if (!flattenEntry || flattenIdx === -1) return false;
    }
    function emit(copyExpr, hoist = '') {
      if (plan.siblingDeclarator) {
        // preceding statement impossible (loop header) or unsafe (multi-declarator instance receiver
        // bound earlier in the same declaration -> TDZ) - append a trailing sibling declarator instead.
        // under a flatten claim the insert is safe (the flatten render re-emits declarators verbatim and
        // bakes end-anchored inserts position-faithfully); otherwise defer to flush, where the byStatement
        // claim set is complete
        if (flattenedNestedDecls.has(declaration)) {
          transforms.insert(declaration.declarations.at(-1).end, `, ${ localId.name } = ${ copyExpr }`);
        } else {
          pendingSeKeyTrailing.push({ declaration, decl: `${ localId.name } = ${ copyExpr }` });
        }
      } else if (isFlattenClaimed) {
        flattenEntry.perDecl[flattenIdx].extractions.push({ decl: `${ localId.name } = ${ copyExpr }` });
      } else {
        // an EXPORTED declaration: emit the extract as its own `export const` BEFORE the `export` keyword,
        // so the original destructure keeps its export (any real sibling binding stays exported). inserting
        // at `declaration.start` instead would land between `export` and `const`, stealing the keyword and
        // dropping the destructure - and every sibling binding - out of the export. matches babel
        const exportNode = declPath.parentPath?.node?.type === 'ExportNamedDeclaration' ? declPath.parentPath.node : null;
        const extraction = `${ exportNode ? 'export ' : '' }${ declaration.kind } ${ localId.name } = ${ copyExpr };`;
        transforms.insert(exportNode ? exportNode.start : declaration.start, `${ hoist }${ extraction }\n`);
      }
    }
    if (!plan.instance) {
      emit(binding);  // static: the bare binding, no receiver
    } else if (plan.memoizeReceiver && !isFlattenClaimed) {
      // standalone constant-literal receiver: capture it into a single `_ref` hoisted BEFORE the residual,
      // dedups so the surviving residual keeps no duplicate AND, for a side-effecting key, reads the
      // receiver ONCE before the key SE (the pre-key value, matching native). sibling leaves of the same
      // receiver reuse the `_ref`
      let hoist = '';
      let refName = bodyExtractReceiverRefs.get(receiverNode);
      if (refName === undefined) {
        refName = injector.generateLocalRef();
        bodyExtractReceiverRefs.set(receiverNode, refName);
        // swap the receiver in the surviving residual for `_ref`; skip-mark it (a constant carries nothing
        // to polyfill, and the range is now owned by this overwrite). `nodeSrc` reads the original literal
        walkAstNodes({ root: receiverNode, visit: n => skippedNodes.add(n) });
        transforms.add(receiverNode.start, receiverNode.end, refName);
        hoist = `${ declaration.kind } ${ refName } = ${ nodeSrc(receiverNode) };\n`;
      }
      emit(`${ binding }(${ refName })`, hoist);
    } else {
      // DUPLICATED instance receiver: keep it VISIBLE for the natural visitor, defer the copy to flush
      // where `composedRangeSrc` bakes the full scope-aware substitution (globals / instance / static,
      // incl. function bodies a node-walk can't reach) into the copy text and re-adds it to the surviving
      // residual's receiver range - babel's clone+re-traverse duplicate
      pendingReceiverCopies.push({ receiverNode, emit: text => emit(`${ binding }(${ text })`) });
    }
    return true;
  }

  // nested INSTANCE method in a destructuring-ASSIGNMENT (`({ y: { flat: m } } = R)`): no declaration to
  // host a `const`, so append `m = _flatMaybeArray(recv)` AFTER the statement - the destructure assigns m
  // natively first (undefined on engines lacking the method), then this overwrite makes the polyfill win.
  // statement-context + bare-Identifier binding only; the receiver must be re-referenceable (Identifier /
  // side-effect-free literal - `resolveNestedReceiverNode` gates it); an expression-context assignment bails
  function tryNestedAssignmentInstanceOverwrite(meta, metaPath, propNode) {
    // canonical binding-Identifier predicate (peels `AssignmentPattern.left`) so a defaulted
    // binding (`{ flat: m = [] }`) overwrites `m`, not just bare-Identifier shapes - a raw
    // `value?.type === 'Identifier'` check drops the overwrite and the polyfill loses to native
    const bindingId = propBindingIdentifier(propNode.value);
    if (!bindingId) return false;
    const statement = nestedAssignmentStatementOf(metaPath);
    if (!statement) return false;
    const receiverNode = resolveNestedReceiverNode(metaPath);
    if (!receiverNode) return false;
    const pureResult = resolvePure(meta, metaPath);
    if (pureResult?.kind !== 'instance') return false;
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    // re-reference the receiver in the overwrite. the in-place destructure keeps + polyfills the receiver,
    // so this is a DUPLICATED copy: defer to flush where `composedRangeSrc` bakes the full scope-aware
    // substitution into the copy text (`m = _flatMaybeArray([1, _Promise])`) and re-adds it to the residual
    pendingReceiverCopies.push({ receiverNode, emit(text) {
      const overwrite = `${ bindingId.name } = ${ binding }(${ text });`;
      if (isBodylessStatementBody(statement)) {
        // bodyless control body: the overwrite must join STMT inside a `{ }` (else it runs even when
        // the guard is false). accumulate per-statement; one block-wrap at flush keeps multi-element
        // patterns (each appends an overwrite) from emitting nested / duplicated braces
        let entry = pendingBodylessAssignOverwrites.get(statement.node);
        if (!entry) pendingBodylessAssignOverwrites.set(statement.node, entry = { statement, overwrites: [] });
        entry.overwrites.push(overwrite);
      } else {
        transforms.insert(statement.node.end, `\n${ overwrite }`);
      }
    } });
    return true;
  }

  function handleParameterDestructurePure(meta, metaPath, propNode) {
    const { value } = propNode;
    if (!isIdentifierPropValue(value)) return;
    if (meta.fromFallback) {
      // receiver lives either on a destructure wrapper slot (`{p} = R`) or as the IIFE
      // call-arg (`(({p}) => body)(R)`) - both shapes unified by `resolveFallbackReceiver`.
      // per-branch synth-swap rewrites each conditional / logical branch to its own
      // polyfill object literal, so a non-Identifier receiver (`cond ? Array : Set`) still
      // gets array narrowing on each branch independently
      const desc = resolveFallbackReceiver(metaPath.parentPath?.parentPath, metaPath.parent);
      const registered = desc && tryRegisterPerBranchSynth({
        rhs: desc.rhsNode, propNode, objectPattern: metaPath.parent, scope: metaPath.scope, path: metaPath,
      });
      if (!registered) warnConditionalFallbackUntouched(meta, metaPath);
      return;
    }
    const isAssign = value.type === 'AssignmentPattern';
    const pureResult = resolvePure(meta, metaPath);
    if (!pureResult || pureResult.kind === 'instance') return;
    const objectPattern = metaPath.parent;
    const receiver = isSynthSimpleObjectPattern(objectPattern, { allowSideEffectComputedKeys: true })
      && computedKeysAllBound(objectPattern, metaPath.scope)
      ? findSynthSwapReceiver(metaPath.parentPath?.parentPath, objectPattern, metaPath.scope, estreeAdapter) : null;
    if (!receiver) {
      // a NESTED / array-wrapped parameter default replaces the DEFAULT itself with a
      // synthesized literal - fully caller-correct (see buildNestedParamSynthPlan)
      if (renderNestedParamSynth({ metaPath, meta })) return;
      // synth-swap bailed (computed-key sibling / non-Identifier shape) - try body-extract
      // first: insert `let from = _polyfill;` at function body top + remove the prop from
      // destructure. preserves "polyfill always wins" even at the cost of caller-
      // passed `{from: customFrom}` being ignored. covers all four prop-value shapes
      // (`{x}` / `{x: alias}` / `{x = default}` / `{x: alias = default}`) via
      // `propBindingIdentifier`'s AssignmentPattern.left peel - matches babel-plugin's
      // unconditional body-extract dispatch. expr-body arrows skip (no statement slot)
      //
      // the receiver stays as the param default in every fallback below, so collapse a
      // proxy-global member chain in it (`globalThis.self.Array` -> `_globalThis.Array`)
      const defaultWrapper = metaPath.parentPath?.parentPath?.node;
      if (defaultWrapper?.type === 'AssignmentPattern') {
        collapseRetainedProxyDefault(defaultWrapper.right,
          metaPath.scope ? { scope: metaPath.scope, adapter: estreeAdapter, path: metaPath } : null);
      }
      // caller-lossy emissions (body-extract ignores a caller-passed value; a leaf inline
      // default polyfills an ABSENT caller leaf that native leaves undefined) are sound only
      // when no invisible caller exists: an assignment-form host (fixed receiver) or an
      // immediately invoked function (every call site visible). a declared / exported
      // function's params stay VERBATIM instead - usage-global injection covers the targets
      if (paramsHaveInvisibleCallers(metaPath, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
      // the import is injected only past the verbatim gate - injecting earlier leaks a dead import
      const binding = injectPureImport(pureResult.entry, pureResult.hintName);
      // a side-effecting computed key (`{ [(eff(), 'from')]: f }`) must NOT body-extract: that
      // removes the key text (dropping the prefix effects) or overlaps an inner-transformed prefix
      // and throws. the inline-default below keeps the key in the pattern (run once) and appends
      // `= _Array$from`, the SE-preserving shape used for every host (block / function body / IIFE)
      const keyHasSideEffect = propNode.computed && sequenceKeyPrefix(propNode.key);
      if (!keyHasSideEffect && tryBodyExtractFromParamDestructurePure({
        propPath: metaPath, propNode, binding, objectPattern, entry: pureResult.entry,
      })) return;
      if (isAssign) transforms.add(value.right.start, value.right.end, binding);
      else transforms.insert(value.end, ` = ${ binding }`);
      return;
    }
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    // the shared classifier flags SE-bearing receivers (buried-SE member spines) for the
    // rescue emission: the re-emitted receiver text keeps the effect AND gives queued inner
    // rewrites their compose needle
    const { callBranch, rescueSe } = classifyCallBranchForSynth({
      inner: receiver, scope: metaPath.scope, adapter: estreeAdapter, path: metaPath,
    });
    // synth-swap owns the receiver chain - identifier visitor would race on the same range.
    // for proxy-global MemberExpression receivers (`globalThis.Map`) walk down `.object` so
    // inner Identifier visitors don't emit `_globalThis` etc. into the now-replaced range.
    // a RESCUED receiver re-emits its own source ahead of the literal, so its inner rewrites
    // must keep firing (they compose into the re-emitted text by needle) - no skip marking.
    let leftSe = null;
    if (receiver.type === 'LogicalExpression') {
      // a fallback-logical default collapses to the literal; narrow the skip to the parts the literal
      // consumes - the dead RIGHT operand and the resolved-left TAIL. the live left PREFIX / a
      // call-rooted left's internals (`IIFE().Array` -> the IIFE body) stay visible so their inner
      // rewrites fire and compose into the rescued leftSe text (babel-twin contract). the rescue plan
      // (structural prefixes + chain-root call, in source order) is computed once here in the shared
      // provider, rendered as text at apply time
      walkAstNodes({ root: receiver.right, visit: n => skippedNodes.add(n) });
      markSynthReceiverSkipped(peelNestedSequenceExpressions(receiver.left).tail, skippedNodes);
      leftSe = collectFallbackCollapseLeftSe({
        leftNode: receiver.left, scope: metaPath.scope, adapter: estreeAdapter, path: metaPath,
      });
    } else if (!rescueSe) markSynthReceiverSkipped(receiver, skippedNodes);
    let pending = pendingSynthSwaps.get(receiver);
    if (!pending) {
      pending = { receiver, objectPattern, polyfills: new Map(), callBranch, rescueSe, leftSe };
      pendingSynthSwaps.set(receiver, pending);
    }
    pending.polyfills.set(synthSwapPropKey(propNode), binding);
  }

  // body-extract fallback when synth-swap can't fire (computed-key sibling / non-Identifier
  // shape / rest sibling). uniform shape across all input variants:
  //   - `{from}`           shorthand
  //   - `{from: alias}`    aliased
  //   - `{from = []}`      shorthand + default
  //   - `{from: alias = []}` aliased + default
  // walk up to function-like, ensure block body, prepend `let <local> = _polyfill;`
  // (let, not const - parameter was reassignable, downstream `from = newValue` must keep
  // working). for rest siblings rewrite the WHOLE prop to `key: _unused` (uniform across
  // shorthand / aliased / default) so the destructure still consumes the key and rest
  // exclusion survives; otherwise remove the prop via a narrow text transform that also
  // consumes the adjacent comma. user-written default is dropped (dead code under polyfill-
  // always-wins). preserves "polyfill always wins" at the cost of caller-passed
  // `{from: customFrom}` being ignored
  // remove a body-extracted param prop from its pattern (no ...rest sibling). props are visited
  // in source order, so a removed predecessor is recorded in `removedParamProps` before the
  // current prop; `getPropRemovalRange` consults that to keep a contiguous tail-run
  // (`{ ..., from, of }`) from overlapping on the shared comma. returns false when no removal
  // range applies, so the caller falls through to inline-default
  function removeBodyExtractedParamProp(objectPattern, props, propNode) {
    let removed = removedParamProps.get(objectPattern);
    if (!removed) removedParamProps.set(objectPattern, removed = new Set());
    const idx = props.indexOf(propNode);
    const range = getPropRemovalRange(props, propNode, idx > 0 && removed.has(props[idx - 1]));
    if (!range) return false;
    transforms.add(range.start, range.end, '');
    removed.add(propNode);
    return true;
  }

  // render the provider-normalized nested-param synth plan as source text replacing the
  // parameter DEFAULT (the semantics - tree mirror, validation, leaf resolution - live in the
  // shared `buildNestedParamSynthPlan`; this is a dumb renderer, babel renders the same plan as AST)
  function renderNestedParamSynth({ metaPath, meta }) {
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: metaPath.parentPath, meta, resolvePure: m => resolvePure(m, metaPath), adapter: estreeAdapter,
    });
    return applyNestedParamSynthPlan({
      plan,
      renderTree: tree => renderSynthTree(tree, {
        polyfill: (entry, hintName) => injectPureImport(entry, hintName),
        object: entries => `{ ${ entries.map(({ key, value }) => `${ key }: ${ value }`).join(', ') } }`,
      }),
      replaceTarget(targetNode, rendered, needsParens) {
        // an arrow's whole expression body replaced by an object literal needs parens in TEXT
        transforms.add(targetNode.start, targetNode.end, needsParens ? `(${ rendered })` : rendered);
        return true;
      },
      skipSubtree: targetNode => walkAstNodes({ root: targetNode, visit: n => skippedNodes.add(n) }),
    });
  }

  function tryBodyExtractFromParamDestructurePure({ propPath, propNode, binding, objectPattern, entry }) {
    // re-entry guard: a previous call's `skippedNodes.add(propNode)` at the bottom signals
    // already-extracted. without it, a second dispatch (e.g. Symbol.iterator + regular prop
    // meta on the same Property) would re-emit `transforms.add` + duplicate `let from = ...`
    // insert. return true to signal "already handled" so the caller suppresses its fallback
    if (skippedNodes.has(propNode)) return true;
    const localId = propBindingIdentifier(propNode.value);
    if (!localId) return false;
    // the qualification chain (caller-lossiness containment / foreign-binding redeclare /
    // block body / param-scope reads / var-redeclare) lives in the shared provider gate so
    // both emitters bail on exactly the same shapes
    const qualified = qualifiesForParamBodyExtract({ propPath, localId });
    if (!qualified) return false;
    const { fnPath } = qualified;
    // place `let X = _polyfill;` AFTER any leading directive prologue (`"use strict"`,
    // `"use asm"`, custom directives) - inserting at body.start+1 would push the
    // directive past position 0 and silently flip the function to sloppy mode
    const bodyOpenAfter = skipDirectivePrologue(fnPath.node.body.body, fnPath.node.body.start + 1);
    const props = objectPattern.properties;
    if (hasRestSiblingExcept(props, propNode)) {
      // keep a computed consumed key in bracket form (`[k]`, not `k`) so the `...rest` exclusion set
      // still excludes the resolved property, not a literal-`k` one (mirror tryExtractArrayWrappedStaticPure)
      const keySrc = propNode.computed ? `[${ nodeSrc(propNode.key) }]` : propNode.key.name;
      transforms.add(propNode.start, propNode.end, `${ keySrc }: ${ injector.generateUnusedName() }`);
    } else if (!removeBodyExtractedParamProp(objectPattern, props, propNode)) {
      return false;
    }
    transforms.insert(bodyOpenAfter, `\n  let ${ localId.name } = ${ binding };`);
    // register the local name -> entry path so receiver-narrowing through this binding
    // (`arr = from('x'); arr.at(-1)`) finds the polyfill's static return type without
    // having to re-derive (Constructor, method) from the destructure pattern shape. matches
    // babel-plugin's body-extract paths which register the same alias post-AST-mutation
    injector.registerBodyExtractAlias(localId.name, entry, propPath.scope.getBinding(localId.name));
    skippedNodes.add(propNode);
    if (propNode.value) skippedNodes.add(propNode.value);
    return true;
  }

  // Symbol.iterator handling is split across `handleSymbolIterator` (member-call form),
  // this fn (property-destructure form `{ [Symbol.iterator]: it } = obj`), and the catch
  // emit loop. unification would require a unified meta shape across the three call sites,
  // not currently warranted - each call site has different bound/unbound receiver semantics
  // resolve the destructure entry's `kind` + import binding for a single Property:
  // - Symbol.iterator special path -> instance kind via _getIteratorMethod
  // - catch+rest passthrough for Symbol.X keys without resolved object -> 'symbol-key'
  //   marker, no own import (standalone Symbol-Identifier visitor handles key-text)
  // - resolvable polyfill -> kind from pureResult, binding via injectPureImport
  function resolveDestructureEntry({ isSymbolIterator, isSymbolKeyPassthrough, pureResult }) {
    if (isSymbolIterator) return { kind: 'instance', binding: injectPureImport('get-iterator-method', 'getIteratorMethod') };
    if (isSymbolKeyPassthrough) return { kind: 'symbol-key', binding: null };
    return { kind: pureResult.kind, binding: injectPureImport(pureResult.entry, pureResult.hintName) };
  }

  // multi-element ArrayPattern wrapping the consumed ObjectPattern (`const [, { from }] = [Set, Array]`,
  // or nested `const [{ Array: { from } }, other] = [globalThis, {...}]`): the cascade flatten can't
  // drop the declarator without losing the sibling / hole bindings, so extract the static into a
  // `const <local> = _Polyfill` before the host and rename the consumed key to `_unused` in place,
  // leaving the residual array destructure (siblings, holes, init array) intact - "polyfill always
  // wins" without disturbing the other targets. mirrors babel-plugin's `tryExtractArrayWrappedStatic`.
  // static keys only: an instance method needs a concrete receiver the residual array slot can't supply
  function tryExtractArrayWrappedStaticPure(meta, metaPath, propNode) {
    const localId = propBindingIdentifier(propNode.value);
    if (!localId) return false;
    const pureResult = resolvePure(meta, metaPath);
    // static keys only: an instance method needs a concrete receiver the residual array can't supply
    if (!pureResult || pureResult.kind === 'instance') return false;
    // a CONDITIONAL / LOGICAL array element (`[, { Array: { from } }] = [0, c ? globalThis : u]`) must
    // NOT extract `const from = _polyfill` unconditionally - the diverging branch reads the user's own
    // value, so the unconditional bind corrupts it. cede to the receiver-aware mirror (it descends the
    // array wrapper and swaps only the proxy branch inside the element); a bare element still extracts
    const recv = outerDestructureReceiver(metaPath.parentPath, metaPath.scope, estreeAdapter);
    if (recv?.type === 'ConditionalExpression' || recv?.type === 'LogicalExpression') return false;
    const host = findArrayWrappedDestructureHost(metaPath.parentPath);
    if (!host?.needsResidualExtraction) return false;
    const declaration = host.declarator.parentPath;
    if (declaration?.node?.type !== 'VariableDeclaration') return false;
    const isExport = declaration.parentPath?.node?.type === 'ExportNamedDeclaration';
    const hostNode = isExport ? declaration.parentPath.node : declaration.node;
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    const kw = isExport ? `export ${ declaration.node.kind }` : declaration.node.kind;
    transforms.insert(hostNode.start, `${ kw } ${ localId.name } = ${ binding };\n`);
    // rename the consumed key to `_unused`: the residual array destructure keeps its shape
    const keySrc = propNode.computed ? `[${ nodeSrc(propNode.key) }]` : propNode.key.name;
    transforms.add(propNode.start, propNode.end, `${ keySrc }: ${ injector.generateUnusedName() }`);
    injector.registerBodyExtractAlias(localId.name, pureResult.entry, metaPath.scope.getBinding(localId.name));
    skippedNodes.add(propNode);
    if (propNode.value) skippedNodes.add(propNode.value);
    return true;
  }

  function handleDestructuringPure(meta, metaPath, propNode) {
    if (isFunctionParamDestructureParent(metaPath.parentPath)) {
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    // a side-effecting computed key (`{ [(eff(), 'from')]: from } = R`): the ONE robust path keeps the
    // key in place (its value renamed to a throwaway, effect once) and binds the polyfill separately -
    // for EVERY shape (top-level / nested / rest / for-init / default / export / array-wrapper / nested-
    // sequence key). `tryHandleSideEffectKeyDeclaration` renders it; a non-declarator host (param /
    // IIFE) falls to `handleParameterDestructurePure` (receiver synth-swap)
    if (propNode.computed && sequenceKeyPrefix(propNode.key)) {
      if (tryHandleSideEffectKeyDeclaration(meta, metaPath, propNode)) return;
      // an assignment host has no declaration: an instance method appends the post-statement overwrite
      // (`m = _m(recv)`), leaving the destructure in place so the in-place key effect still runs once.
      // matches babel - else the SE-key assignment falls to a native bail that drops the polyfill
      if (tryNestedAssignmentInstanceOverwrite(meta, metaPath, propNode)) return;
      // a top-level catch-param prop falls through to the catch extraction: `let v = _at(_ref)`
      // plus the key kept (value renamed) in the combined residual - effect once, default dead
      if (metaPath.parentPath?.parentPath?.node?.type !== 'CatchClause') {
        return handleParameterDestructurePure(meta, metaPath, propNode);
      }
    }
    // peel inner-default AssignmentPattern (`{ Foo: { x } = {} } = R`) so the nested-flatten
    // path fires for the same shape as the bare `{ Foo: { x } } = R` form
    const directParent = metaPath.parentPath?.parentPath;
    let outerHost = directParent;
    if (outerHost?.node?.type === 'AssignmentPattern'
        && outerHost.node.left === metaPath.parentPath?.node) {
      outerHost = outerHost.parentPath;
    }
    // peel single-element ArrayPattern wrapper (`[{x}] = R`) - transparent passthrough,
    // walker drops the whole declaration anyway. `walkUpNestedDestructureToDeclaration`
    // recognises ArrayPattern as an intermediate so the chain still resolves
    if (outerHost?.node?.type === 'ArrayPattern'
        && outerHost.node.elements?.length === 1
        && outerHost.node.elements[0] === metaPath.parentPath?.node) {
      outerHost = outerHost.parentPath;
    }
    // multi-element ArrayPattern wrapper (`[, {from}]` / `[{Array:{from}}, other]`): extract the
    // static + keep the residual; the cascade / inline-default paths below can't preserve siblings
    if (tryExtractArrayWrappedStaticPure(meta, metaPath, propNode)) return;
    // nested INSTANCE method (`{ y: { flat: m } } = { y: arr }`, or array-wrapped `[{ y: { flat } }] = [{ y:
    // arr }]` / `[{ flat }] = [arr]` / `[z, { flat }] = [9, arr]`): the static flatten doesn't apply (the
    // receiver is an instance, not a constructor). residual-extract `_flatMaybeArray(recv)` via the same
    // path the SE-key case uses (no effect to preserve), gated on instance so nested STATICs keep their
    // flatten drop-shape. covers an object-property host, an ArrayPattern element (single- OR multi-element,
    // where the single-element peel didn't fire), and a peeled transparent wrapper; tryHandle resolves the
    // receiver through object keys AND array indices and bails a non-Identifier receiver -> flatten/native
    if ((outerHost?.node?.type === 'Property' || directParent?.node?.type === 'ArrayPattern'
        || directParent?.node !== outerHost?.node)
        && resolvePure(meta, metaPath)?.kind === 'instance') {
      // a declaration host extracts a `const`; an assignment host appends an overwrite. either bails on a
      // non-Identifier receiver -> fall through to the flatten/native paths below
      if (tryHandleSideEffectKeyDeclaration(meta, metaPath, propNode)) return;
      if (tryNestedAssignmentInstanceOverwrite(meta, metaPath, propNode)) return;
    }
    if (outerHost?.node?.type === 'Property') {
      if (tryFlattenNestedProxy(metaPath)) return;
      if (tryFlattenAssignmentExpression(metaPath)) return;
      // conditional receiver: mirror per branch. an un-mirrorable pattern bails to native via the
      // shared plan when a value branch is a non-proxy (avoids a corrupting default); a proxy-only
      // receiver keeps the sound inline default
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    // transparent wrap between ObjectPattern and host (ArrayPattern / AssignmentPattern):
    // no outer Property to inline default on, so flatten-or-bail. tryFlattenNestedProxy handles a
    // VariableDeclaration host; tryFlattenAssignmentExpression handles an AssignmentExpression host
    // (`[{ from }] = [Array]`) - without it the single-element array-wrap assignment renders verbatim
    // and silently drops the static polyfill. both walk the same wrappers via the shared intermediate set
    if (directParent?.node !== outerHost?.node) {
      if (tryFlattenNestedProxy(metaPath)) return;
      if (tryFlattenAssignmentExpression(metaPath)) return;
      return;
    }
    if (propNode.value?.type === 'Identifier'
        && injector.hasGeneratedUnusedName(propNode.value.name)) return;
    if (!canTransformDestructuring(metaPath)) return;
    if (meta.fromFallback) return tryFromFallbackPerBranchSynth(meta, metaPath, propNode);
    const patternHasRest = metaPath.parent?.properties?.some(
      p => p.type === 'RestElement' || p.type === 'SpreadElement');
    // export + rest of a static polyfills like the nested-proxy export+rest path: the consumed
    // key renames to `_unused` (a named export, as nested also emits) rather than skipping and
    // leaving the static native ("polyfill always wins"). matches babel-plugin
    const { value } = propNode;
    // bail BEFORE seeding `skippedNodes` below: a nested ObjectPattern value
    // (`{[Symbol.iterator]: {next}}`) fails `propBindingIdentifier` and exits here. seeding the
    // `Symbol.iterator` key earlier would suppress the standalone Symbol-Identifier visitor
    // from emitting `_Symbol$iterator`, dropping the polyfill entirely
    if (value && !propBindingIdentifier(value)) return;
    const isSymbolIterator = propNode.computed && meta.key === 'Symbol.iterator';
    if (isSymbolIterator) {
      const patternProps = metaPath.parent?.properties;
      const hasRest = patternProps?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
      if (!hasRest) {
        skippedNodes.add(propNode.key);
        if (propNode.key.object) skippedNodes.add(propNode.key.object);
      }
    }
    const pureResult = isSymbolIterator ? null : resolvePure(meta, metaPath);
    // catch + rest with computed `Symbol.X` polyfillable key: handleDestructuringPure normally
    // bails on null pureResult (the meta has no object/placement to resolve), but we need
    // emitCatchClause to fire so the destructuring pattern moves from catch param into a body
    // `let { ... } = _ref;` line. the standalone Symbol-Identifier visitor handles the actual
    // key-text substitution (`Symbol.X` -> `_Symbol$X`); the synthetic entry here exists only
    // to trigger the extraction and reserve the prop's slot in the rebuilt pattern
    const isSymbolKeyPassthrough = !pureResult && !isSymbolIterator && patternHasRest
      && propNode.computed && typeof meta.key === 'string' && symbolKeyToEntry(meta.key)
      && metaPath.parentPath?.parentPath?.node?.type === 'CatchClause';
    if (!pureResult && !isSymbolIterator && !isSymbolKeyPassthrough) return;

    const objectPattern = metaPath.parent;
    const isDefault = value?.type === 'AssignmentPattern';
    const localName = isDefault ? value.left.name : value?.name;
    const defaultSrc = isDefault ? nodeSrc(value.right) : null;
    if (!localName) return;

    const declaratorPath = metaPath.parentPath?.parentPath;
    const isCatchClause = declaratorPath?.node?.type === 'CatchClause';
    if (isCatchClause && !objectPatternPropNeedsReceiverRewrite(propNode)
        && !objectPattern.properties.some(p => p.type === 'RestElement')) {
      let referenced = false;
      // matches babel-plugin's symmetric filter pair in `extractCatchClause`:
      // `isNonReferencePosition` excludes method/property keys / member-access tails /
      // labels / import-export specifier names; `isBindingPosition` additionally excludes
      // declaration-id slots (NFE id, class id, declarator id, nested catch param) -
      // shadow re-declarations like `const fn = function from() {}` inside the catch
      // body are bindings, not references, and would otherwise force an unneeded
      // catch-receiver extract. defensive symmetry with babel-plugin even when the
      // polyfill-gated entry typically can't reach this walker (no receiver context for
      // catch params), guarding against future top-level catch processors that might
      // share this body-reference scan
      walkAstNodes({
        root: declaratorPath.node.body,
        visit(n, parent) {
          if (!referenced && n.type === 'Identifier' && n.name === localName
              && !isNonReferencePosition(parent, n) && !isBindingPosition(parent, n)) referenced = true;
        },
      });
      if (!referenced) return;
    }
    const { kind, binding } = resolveDestructureEntry({ isSymbolIterator, isSymbolKeyPassthrough, pureResult });
    const isAssignment = !isCatchClause && declaratorPath?.node?.type === 'AssignmentExpression';
    // peel Paren / TS wrappers up to the enclosing ExpressionStatement so transforms.add's
    // range owns the statement's trailing `;` (otherwise leftover `;` produces `from = _X;;`)
    const declPath = isCatchClause ? declaratorPath
      : isAssignment ? peelParenAndTSParentPath(declaratorPath) : declaratorPath?.parentPath;
    const initNode = isCatchClause ? null
        : isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;

    if (!pendingDestructuring.has(objectPattern)) {
      const initSrc = isCatchClause ? injector.generateLocalRef() : initNode ? nodeSrc(initNode) : null;
      pendingDestructuring.set(objectPattern, {
        entries: [],
        allProps: objectPattern.properties || [],
        declPath,
        declaratorPath,
        isAssignment,
        isCatchClause,
        initSrc,
        initStart: initNode?.start,
        initEnd: initNode?.end,
        initNode,
        initIdentName: unwrapParens(initNode)?.type === 'Identifier' ? unwrapParens(initNode).name : null,
        // snapshot only `scope` - flushPendingFlatten replays via `scopeTracker.genRef(snapshot)`
        // which falls to the scope path (hoisted `var _ref;`). bodyWrap is intentionally
        // omitted: the flatten emit handles bodyless-stmt / arrow-body wrap itself via
        // `wrapBodylessIfMulti`, and routing the snapshot through bodyWrap would produce
        // a nested wrap around the flatten-emitted block
        scopeSnapshot: { scope: scopeTracker.scope },
      });
      // mark globals in init so they don't generate conflicting transforms; instance
      // methods compose correctly and stay polyfilled (init expression remains as arg)
      if (initNode && !mayHaveSideEffects(initNode)) markInitGlobals(initNode);
    }
    const pending = pendingDestructuring.get(objectPattern);
    // a side-effecting computed key on a catch entry keeps the key in the combined residual
    // (value renamed - effect once, in order); the polyfill always wins, so the user default
    // is dead - skip-mark its subtree so the visitor never polyfills inside dropped code
    const seKeyResidual = isCatchClause && propNode.computed && !!sequenceKeyPrefix(propNode.key);
    if (seKeyResidual && value) walkAstNodes({ root: value, visit: n => skippedNodes.add(n) });
    // the catch default-guard test ref is minted NOW (prop visit, before the default
    // subtree's inner memo refs) so numbering matches babel's pre-order minting; the
    // post-traverse render just consumes it
    const testRef = isCatchClause && kind === 'instance' && defaultSrc && !seKeyResidual ? injector.generateLocalRef() : null;
    pending.entries.push({
      propNode, localName, binding, kind, testRef,
      defaultSrc: seKeyResidual ? null : defaultSrc,
      keepKeyInResidual: seKeyResidual,
    });
    // body-extract alias so post-rewrite narrowing resolves the local (`xs = from('hi');
    // xs.at(0)` -> array-specific helper) - the flatten channel registers the same alias
    // in its extraction emit; without it this channel's locals narrow to generic helpers
    if (kind === 'static' && pureResult) {
      injector.registerBodyExtractAlias(localName, pureResult.entry, metaPath.scope?.getBinding(localName));
    }
    // once EVERY prop of the pattern is collected as a STATIC entry, the flatten will fully
    // consume the declarator and the render lifts only the SE prefix - an effect-free
    // PROXY-MEMBER tail is then dead, so mark its globals NOW (before the visitor reaches the
    // init subtree) to suppress the substitution + import for the dropped slice (matching
    // babel, which drops exactly this tail class while keeping bare-constructor tails).
    // for-init hosts keep the WHOLE init under a sink declarator and stay unmarked
    if (initNode && !isAssignment && !isCatchClause
      && pending.entries.length === objectPattern?.properties?.length
      && pending.entries.every(e => e.kind === 'static')
      && declPath?.node?.type === 'VariableDeclaration'
      // a BODYLESS host keeps the whole init inline (the babel emission keeps the dead tail
      // read there), so its tail globals must keep substituting - only statement-liftable
      // hosts drop the tail
      && !classifyVariableDeclarationHost({
        declaration: declPath.node, declarationParent: declPath.parentPath?.node,
      }).isBodyless
      && declPath.parentPath?.node?.type !== 'ForStatement') {
      const { tail } = peelNestedSequenceExpressions(initNode);
      const peeledTail = tail === initNode ? null : unwrapParens(tail);
      // a bare-Identifier tail (`(eff(), Promise)`) is the consumed receiver itself - as
      // dead as the proxy-member chain once every entry extracted receiver-less
      if ((peeledTail?.type === 'Identifier'
        || ((peeledTail?.type === 'MemberExpression' || peeledTail?.type === 'OptionalMemberExpression')
          && findProxyGlobal(peeledTail)))
        && !mayHaveSideEffects(peeledTail)) markInitGlobals(peeledTail);
    }
  }

  // walk init expression marking proxy-global member chains and bare identifiers as
  // skipped, so identifier-visitor polyfill emits don't duplicate destructure rewrite.
  // logical/sequence/conditional branches walked recursively; instance methods on init
  // (arr.slice) intentionally unmarked - they compose correctly with destructure
  function markInitGlobals(node) {
    let cur = node;
    while (cur) {
      switch (cur.type) {
        case 'LogicalExpression':
          markInitGlobals(cur.left);
          cur = cur.right;
          break;
        case 'SequenceExpression':
          for (const expr of cur.expressions) markInitGlobals(expr);
          cur = null;
          break;
        case 'ConditionalExpression':
          markInitGlobals(cur.consequent);
          cur = cur.alternate;
          break;
        case 'ParenthesizedExpression':
        case 'ChainExpression':
          cur = cur.expression;
          break;
        case 'CallExpression':
        case 'OptionalCallExpression':
        case 'NewExpression':
        case 'TaggedTemplateExpression':
          cur = cur.callee || cur.tag;
          break;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
          if (findProxyGlobal(cur)) skippedNodes.add(cur);
          cur = cur.object;
          break;
        case 'Identifier':
          skippedNodes.add(cur);
          cur = null;
          break;
        default:
          cur = TS_EXPR_WRAPPERS.has(cur.type) ? cur.expression : null;
      }
    }
  }

  // standalone `let X = ...;` extracting an instance / static entry from the catch `ref`. a user
  // default is guarded via `defaultGuardedRhs` with the COMPOSED default (`composedRangeSrc` baked
  // any polyfill in the default expr): the raw `e.defaultSrc` can't compose against the bare `_ref`
  // overwrite - there's no original-text needle for `#substituteInners` (unlike the non-catch path,
  // where the parts text IS the needle), so emitting raw would drop the polyfill and orphan its
  // drained scoped-var. instance entries memo the receiver into a fresh ref to avoid double-eval
  function catchEntryLetDecl(e, ref) {
    const valueSrc = e.kind === 'instance' ? `${ e.binding }(${ ref })` : e.binding;
    if (!e.defaultSrc) return `let ${ e.localName } = ${ valueSrc };`;
    const rhs = defaultGuardedRhs({ valueSrc, defaultSrc: e.composedDefaultSrc, ref: e.testRef });
    return `let ${ e.testRef ? `${ e.testRef }, ` : '' }${ e.localName } = ${ rhs };`;
  }

  // catch clause: replace param with ref, insert polyfilled + remaining in source order.
  // computed keys must have their pending polyfill rewrites extracted upfront - the catch
  // param overwrite below would otherwise contain orphan inner transforms -> compose throws
  // "could not locate inner needle". covers entry keys (Symbol.iterator absorbed by
  // getIteratorMethod) and non-entry siblings (Symbol.asyncIterator polyfilled by standalone
  // visitor) uniformly
  function emitCatchClause(infos, catchNode) {
    const [{ initSrc: ref, allProps }] = infos;
    const entryByProp = new Map(infos.flatMap(i => i.entries.map(e => [e.propNode, e])));
    // the catch param is overwritten to bare `_ref`, so EVERY polyfill transform inside the
    // pattern (a computed-key sub-expression like `[[1].at(0)]`, a default value like
    // `code = arr.at(-1)`) must be drained and baked into the relocated prelude / rebuilt
    // pattern text - left in the queue it can't compose against `_ref` and trips the
    // "could not locate inner needle" invariant. compose key + default per entry prop; whole
    // non-entry props compose as a unit below. the ranges are disjoint, so no double-drain
    for (const e of entryByProp.values()) {
      e.polyfillKeyContent = e.propNode.computed ? composedRangeSrc(e.propNode.key) : null;
      const dflt = e.propNode.value?.type === 'AssignmentPattern' ? e.propNode.value.right : null;
      e.composedDefaultSrc = dflt ? composedRangeSrc(dflt) : null;
    }

    const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    const lines = [];
    // non-entry props collect into ONE combined residual destructure emitted AFTER the extraction lines
    // (per-prop residual lines re-read the receiver once per prop and diverge from the plan-canon
    // `{ survivors } = init` residual); under rest they stay in the rebuilt pattern instead
    const residualProps = [];
    for (const p of allProps) {
      if (p.type === 'RestElement' || p.type === 'SpreadElement') continue;
      const e = entryByProp.get(p);
      // non-entry prop: the composed whole-prop slice (any polyfilled key / default baked
      // in) survives the `_ref` overwrite through the combined residual
      if (!e) {
        if (!hasRest) residualProps.push(composedRangeSrc(p));
        continue;
      }
      // `symbol-key` entries don't extract a value - the rebuilt pattern keeps the prop
      // (with original localName) so `_ref[polyfilledKey]` is bound by destructuring directly
      if (e.kind === 'symbol-key') continue;
      lines.push(catchEntryLetDecl(e, ref));
      // a side-effecting key survives at its residual slot with a throwaway value: the effect runs once,
      // after the extraction lines (the rest-gather rebuild below reserves the same `_unused` slot, so
      // this applies to the no-rest residual only)
      if (e.keepKeyInResidual && !hasRest) {
        residualProps.push(`[${ e.polyfillKeyContent }]: ${ injector.generateUnusedName() }`);
      }
    }
    if (residualProps.length) lines.push(`let { ${ residualProps.join(', ') } } = ${ ref };`);
    if (hasRest) {
      const rebuiltProps = allProps.map(p => {
        const e = entryByProp.get(p);
        if (!e) return composedRangeSrc(p);
        const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : nodeSrc(p.key);
        // symbol-key keeps original localName (the destructure binds it directly) and must
        // re-attach its captured default - the standalone let-decl path that folds defaults is
        // skipped for symbol-key, so omitting it here binds the local to undefined when the key
        // is absent. other entries already extracted via standalone let-decl above, so reserve a
        // `_unused` slot just for the rest gather to skip the polyfilled key
        if (e.kind === 'symbol-key') {
          return `${ keySrc }: ${ e.localName }${ e.composedDefaultSrc ? ` = ${ e.composedDefaultSrc }` : '' }`;
        }
        return `${ keySrc }: ${ injector.generateUnusedName() }`;
      });
      lines.push(`let { ${ rebuiltProps.join(', ') } } = ${ ref };`);
    }
    transforms.add(catchNode.param.start, catchNode.param.end, ref);
    // declare the prelude's own temp vars (memo refs from polyfills baked into the keys / defaults
    // above) at the TOP of the relocated prelude. they were genRef'd into the catch BODY scope, so
    // applyTransforms would otherwise insert `var _ref;` AFTER this prelude - valid via hoisting
    // but reads as use-before-declare. claiming them here mirrors babel's temps-at-top layout
    const hoistedVars = scopeTracker.claimBlockScopedVars(catchNode.body);
    const prelude = hoistedVars.length ? [`var ${ hoistedVars.join(', ') };`, ...lines] : lines;
    transforms.insert(catchNode.body.start + 1, `\n${ prelude.join('\n') }`);
  }

  // byte-precise swap of a chain's proxy-global ROOT identifier (`globalThis` in
  // `globalThis.Array.other`) for its polyfill binding, leaving the rest of the chain text
  // (`.Array.other`) intact for instance / member dispatch. needed wherever the natural
  // visitor was suppressed on the chain (synth-swap / destructure rewrite owns the span), so
  // a bare `globalThis` would otherwise leak and ReferenceError on engines without it (mirrors
  // babel's `_globalThis` substitution). `src` is the verbatim chain text anchored at
  // `baseStart`. returns null when there's no proxy root or its root has no global polyfill -
  // each caller picks its own fallback. whole-chain-polyfillable chains (`globalThis.Map`)
  // never reach here: they're rewritten to `_Map` upstream and stay bare Identifiers
  function substituteProxyGlobalRoot({ node, src, baseStart, aliasCtx = null }) {
    // an SE init (`(track(), globalThis.self.Array)`) keeps its side-effecting prefix verbatim -
    // the proxy-global receiver to collapse is the tail. non-SE nodes peel to themselves, so the
    // member / identifier callers (`synthMemberReceiverSrc`, logical operands) are unaffected
    const target = peelNestedSequenceExpressions(node).tail ?? node;
    const proxyRoot = findProxyGlobal(target, aliasCtx);
    if (!proxyRoot) return null;
    const rootPure = resolveGlobalPolyfill(proxyRoot.name);
    // an ALIAS root (`const g = globalThis; g.self.X`) keeps its (already-rewritten) name and only
    // drops the redundant proxy hops (`g.self.X` -> `g.X`); a direct root with no pure entry (`self.X`
    // where `self` is not polyfilled) still bails to the verbatim fallback
    const isAliasRoot = isAliasProxyRoot(proxyRoot, aliasCtx);
    if (!rootPure && !isAliasRoot) return null;
    // replace the WHOLE proxy-global navigation prefix (root + intermediate proxy hops such as
    // the `self` in `globalThis.self.Array`), not just the root id: keeping `.self` would read an
    // undefined property off the global object on hosts without it (`_globalThis.self` on ie:11
    // pure / Node), breaking the emitted receiver across the target range
    // remove [wrapper-inclusive root start, wrapper-symmetric end). the start spans a wrapper
    // sitting DIRECTLY around the bare root (`(globalThis)` -> the `(`), so the peeled-identifier
    // start would leave a dangling open paren. the end must be symmetric: a bare root's
    // `maximalProxyGlobalPrefix` ends BEFORE the matching `)`, so without the `max` the close paren
    // dangles (`_globalThis).Array`; an SE-prefixed root doubles it). a proxy-hop prefix
    // (`(globalThis).self`) ends past the wrapper, so `max` keeps that wider span unchanged
    const wrappedRoot = proxyGlobalWrappedRoot(target, aliasCtx);
    const prefixEnd = Math.max(maximalProxyGlobalPrefix(target, aliasCtx).end, wrappedRoot.end);
    const start = wrappedRoot.start - baseStart;
    // SE prefixes buried in the root wrapper keep evaluating (root-first order):
    // `(eff(), globalThis).self.X` collapses to `(eff(), _globalThis).X`, not `_globalThis.X`
    const prefixSrcs = [];
    let rootCur = wrappedRoot;
    for (;;) {
      const peeledRoot = unwrapParens(rootCur);
      if (peeledRoot?.type === 'SequenceExpression' && peeledRoot.expressions.length) {
        for (const expr of peeledRoot.expressions.slice(0, -1)) {
          prefixSrcs.push(src.slice(expr.start - baseStart, expr.end - baseStart));
        }
        rootCur = peeledRoot.expressions.at(-1);
      } else break;
    }
    // direct root swaps to its pure binding; an alias root keeps its (already-rewritten) name
    const rootBinding = rootPure ? injectPureImport(rootPure.entry, rootPure.hintName) : nodeSrc(proxyRoot);
    // an IRREGULAR root wrapper (the unwrap does not bottom at the proxy identifier - e.g.
    // an SE wrapping a partial member chain, `((e2(), (e1(), globalThis).self)).Array`) makes
    // the [wrappedRoot.start, prefixEnd) slice structurally unsound (the full-collapse rewrite
    // corrupted the parens) - bail to the caller's verbatim fallback: the chain stays a
    // residual target whose root the NATURAL visitor substitutes (a manual root slice here
    // collided with that queued transform and the compose remapped it onto the hop key)
    if (unwrapParens(rootCur) !== proxyRoot) return null;
    const rootText = prefixSrcs.length ? `(${ [...prefixSrcs, rootBinding].join(', ') })` : rootBinding;
    // drop the leaf's redundant optional connector ONLY where babel does, for parity: a pure-import
    // root (babel's normalizeOptionalChain on the injected `_globalThis`) or a collapsed proxy hop
    // (babel rebuilds the member non-optional). a bare ALIAS root with NO hop keeps `?.` - babel
    // does not normalize user-alias optional chains (`g?.Array` stays `g?.Array`). dotted `?.x` ->
    // `.x` (drop `?`); computed `?.[k]` -> `[k]` (drop `?.`, computed takes no dot). only the
    // connector DIRECTLY on the always-defined root; deeper `?.` on unknown leaves stay
    let tailSrc = src.slice(prefixEnd - baseStart);
    if ((rootPure || prefixEnd > wrappedRoot.end) && tailSrc.startsWith('?.')) {
      tailSrc = /^\?\.\s*\[/.test(tailSrc) ? tailSrc.slice(2) : tailSrc.slice(1);
    }
    return src.slice(0, start) + rootText + tailSrc;
  }

  // receiver source for a synth swap's MemberExpression receiver (`globalThis.Array`),
  // used by unpolyfilled-key fallbacks (`other: <receiver>.other`). the synth swap marks the
  // receiver chain skipped, so the natural visitor never substitutes its proxy-global root and
  // we must do it here. falls back to the verbatim source for non-proxy receivers
  function synthMemberReceiverSrc(member) {
    const src = nodeSrc(member);
    return substituteProxyGlobalRoot({ node: member, src, baseStart: member.start }) ?? src;
  }

  // post-traverse: emit `{p: _polyfill, q: R.q, ...}` over the receiver span. runs
  // after main traverse - full polyfill set per receiver known only after sibling visits.
  // non-polyfilled siblings read from pure receiver when receiver itself is polyfillable
  // (raw `Promise.custom` on IE11 would ReferenceError before the destructure runs).
  // partial-rewrite risk: an exception inside the loop leaves `pendingSynthSwaps` half-applied
  // (some transforms queued, others lost). recovery semantics intentional: catch-and-continue
  // would silently produce inconsistent output, hard fail surfaces the bug to the user
  function applySynthSwaps() {
    for (const [, { receiver, objectPattern, polyfills, callBranch, rescueSe, leftSe: leftSePlan }] of pendingSynthSwaps) {
      if (objectPattern?.type !== 'ObjectPattern') continue;
      // safe-SE peel too: `cond ? (0, Array) : Iterator` registers the branch with the SE as
      // outer receiver. apply step substitutes at the SE TAIL (inner Identifier) so SE prefix
      // remains in the AST around the swap, preserving safe side-effects. mirrors babel-plugin's
      // `unwrapSequenceTail` peel in `registerBranchTreeForKey` for parser-mode-symmetric emission
      const inner = receiver.type === 'LogicalExpression' && receiver.operator !== '&&'
        ? receiver : peelFallbackBranchInner(receiver);
      // accept Identifier (`Array`) and (Optional)MemberExpression (`window.Array`,
      // `globalThis?.Array`) receivers - mirrors `isViableBranchForKey` so `tryRegisterPerBranchSynth`
      // -> `applySynthSwaps` round-trip stays in sync. for member-chain shapes, unpolyfilled
      // keys still re-read through the chain (`window.Array.other`) - each `${ src }.${ key }`
      // reference re-evaluates the receiver expression. typical pattern is all-polyfilled
      // keys (no re-read needed); accept the side-effect re-evaluation trade-off
      if (!isReceiverShapedNode(inner) && inner?.type !== 'LogicalExpression' && !isCallShape(inner)) continue;
      // a fallback-logical receiver reads through its peeled LEFT branch (babel-twin contract):
      // the left decides the value under short-circuit; the dead right global stays unreferenced
      const readReceiver = inner.type === 'LogicalExpression'
        ? peelNestedSequenceExpressions(inner.left).tail : inner;
      const receiverPure = readReceiver.type === 'Identifier' ? resolveGlobalPolyfill(readReceiver.name) : null;
      // an SE-bearing receiver with a key left unresolved memoizes the receiver through a
      // function-IIFE param: it runs exactly once (as the argument) and unresolved keys read the memo
      // instead of re-running it per read (babel-twin emission). `callBranch` (set by the shared
      // classifier for a call / member / fallback-logical SE receiver - a call is always flagged) is
      // the single gate, identical to the babel-plugin twin
      const planEntries = buildFlatSynthEntries(objectPattern, polyfills);
      const needMemo = callBranch && planEntries.some(entry => !entry.polyfill);
      const memoName = needMemo ? injector.generateLocalRef() : null;
      let receiverSrc = null;
      const getReceiverSrc = () => receiverSrc ??= memoName ?? (receiverPure
        ? injectPureImport(receiverPure.entry, receiverPure.hintName)
        : synthMemberReceiverSrc(readReceiver));
      // the per-property classification lives in the shared `buildFlatSynthEntries`; this loop
      // only renders the entries as source text
      const entries = [];
      for (const { keyNode, computed, seName, polyfill } of planEntries) {
        const keySrc = seName !== null ? JSON.stringify(seName)
          : computed ? `[${ nodeSrc(keyNode) }]` : keyNode.name;
        const access = seName !== null ? `[${ JSON.stringify(seName) }]`
          : computed ? `[${ nodeSrc(keyNode) }]` : `.${ keyNode.name }`;
        entries.push(polyfill
          ? `${ keySrc }: ${ polyfill }`
          : `${ keySrc }: ${ getReceiverSrc() }${ access }`);
      }
      // overwrite the INNER (peeled) range so outer TS / paren / chain wrappers survive
      // intact - mirrors babel's AST mutation which replaces only the inner MemberExpression
      // and leaves the wrapper around the synth object. without using `inner.start/.end`,
      // `(globalThis?.Array as any)` would lose its `as any` cast on text emit
      // an SE-bearing call branch is rescued ahead of the literal; its inner substitutions
      // compose into the re-emitted source text
      const literal = `{ ${ entries.join(', ') } }`;
      // a fallback-logical receiver memoizes its resolved LEFT, not the whole `||` / `??`: the left is
      // the always-truthy receiver, so the dead right operand short-circuits and must not survive into
      // the memo argument (keeping it would emit the raw right global - and diverge from the AST
      // emitter, which drops it). matches the all-resolved leftSe path, which collapses to the left
      const memoNode = inner.type === 'LogicalExpression' ? inner.left : inner;
      const body = needMemo
        ? `(function (${ memoName }) { return ${ literal }; })(${ nodeSrc(memoNode) })`
        : rescueSe ? `(${ nodeSrc(inner) }, ${ literal })` : literal;
      // fallbackCollapse (`(logSE(), Array) || Set`, `IIFE().Array || Set`): the whole `||`/`??`
      // collapses to the literal (its left is the always-resolved receiver, its right short-circuits),
      // but the left's side effects must still run when the default fires - re-emit them ahead of the
      // literal in source order via the shared `collectFallbackCollapseLeftSe` plan (structural
      // prefixes + a call-rooted left's chain-root call). inner rewrites compose into each node's
      // source text by needle. a pure left plans nothing, so the clean collapse is unchanged.
      // suppressed when memoizing - the memo argument (the left) already runs its SE once there
      const leftSe = needMemo ? [] : (leftSePlan ?? []).map(node => nodeSrc(node));
      transforms.add(inner.start, inner.end, leftSe.length ? `(${ leftSe.join(', ') }, ${ body })` : body);
    }
  }

  // three drain shapes routing through the single TransformQueue (overwrites + inserts):
  //   1. `applyDestructuringTransforms` - VariableDeclaration rewrite (splits, reorders, extracts)
  //   2. `applySynthSwaps` - function param default synth-swap (receiver-span overwrite)
  //   3. `emitCatchClause` - catch-pattern rewrite (param overwrite + body-prelude insert)
  // share `pendingDestructuring` / `pendingSynthSwaps` accumulators; differ only in the
  // shape of the AST anchor being emitted into. final flush via the host's queue.apply()
  function applyDestructuringTransforms() {
    // deferred consumed instance-receiver extractions: the natural visitor has now polyfilled each
    // receiver in place (full substitution, scope-aware), so `composedRangeSrc` bakes those into the
    // copy and drains them from the queue before the dropped-declaration overwrite replaces the range
    for (const { start, end, prefix, binding, receiverNode } of pendingReceiverExtracts) {
      transforms.add(start, end, `${ prefix }${ binding }(${ composedRangeSrc(receiverNode) });`);
    }
    pendingReceiverExtracts.length = 0;
    // deferred DUPLICATED copies: compose each receiver ONCE per range (sibling leaves of the same
    // receiver share the text), re-add the composed text to the SURVIVING residual's receiver range
    // (only when it changed - an unpolyfilled receiver keeps its verbatim slice, no extra transform),
    // then let each leaf's `emit` route its copy. ordered before the byStatement rebuild and the
    // trailing / flatten / bodyless-assign drains so a re-add folds into the residual render and a
    // routed copy lands in those still-pending lists
    const composedReceiverCopyText = new Map();
    for (const { receiverNode, emit } of pendingReceiverCopies) {
      const key = `${ receiverNode.start }:${ receiverNode.end }`;
      let text = composedReceiverCopyText.get(key);
      if (text === undefined) {
        text = composedRangeSrc(receiverNode);
        composedReceiverCopyText.set(key, text);
        if (text !== nodeSrc(receiverNode)) transforms.add(receiverNode.start, receiverNode.end, text);
      }
      emit(text);
    }
    pendingReceiverCopies.length = 0;
    const byStatement = new Map();
    for (const [, info] of pendingDestructuring) {
      if (!info.declPath?.node || !info.declaratorPath?.node) continue;
      // a declarator sharing a VariableDeclaration with a proxy-global flatten declarator
      // (`const { at } = getArr(), { Array: { from } } = globalThis`) can't emit its own
      // whole-declaration replacement here: it would collide with the flatten's overwrite on the
      // shared range (`mergeEqualRange`). the early `flattenedNestedDecls` bail in
      // `handleDestructuringPure` is order-dependent (misses a destructuring declarator visited
      // before the flatten sibling); this post-traverse skip is order-independent. hand the info
      // to `flushPendingFlatten`, which renders its instance/static-method rewrite inline so the
      // polyfill survives (simple shapes; complex ones still render verbatim)
      if (flattenedNestedDecls.has(info.declPath.node)) {
        flattenSiblingInfos.set(info.declaratorPath.node, info);
        continue;
      }
      // AE analog of the bail above: a standalone-emit prop (`[Symbol.iterator]: it`, global-
      // shorthand `Map`) sharing an assignment-expression destructure with a nested-flatten prop
      // (`Array: { from }`) would queue a second whole-statement overwrite competing with the
      // cascade's -> mergeEqualRange crash. when the cascade already claimed this assignment, drop
      // the standalone overwrite and let cascadeAssignmentExpression emit the sibling prop too
      if (info.isAssignment && flattenedAssignments.has(info.declaratorPath.node)) continue;
      const key = info.declPath.node;
      if (!byStatement.has(key)) byStatement.set(key, []);
      byStatement.get(key).push(info);
    }

    // SE-key trailing declarators: a claimed declaration takes its pair into the rendered
    // statement (appended to the final part below - babel's trailing-sibling canon); an
    // unclaimed one keeps the raw end-anchored insert (the source text stays in place)
    const trailingByDecl = new Map();
    for (const { declaration, decl } of pendingSeKeyTrailing) {
      if (byStatement.has(declaration)) {
        if (!trailingByDecl.has(declaration)) trailingByDecl.set(declaration, []);
        trailingByDecl.get(declaration).push(decl);
      } else {
        transforms.insert(declaration.declarations.at(-1).end, `, ${ decl }`);
      }
    }
    pendingSeKeyTrailing.length = 0;

    // emit catch-clause rewrites BEFORE the flush: a catch prelude is queued as a point-insert
    // that can land inside a sibling flatten declarator's SE-prefix range, and flushPendingFlatten
    // drains inserts within each declarator range to bake them into the lifted prefix text. the
    // catch inserts must already be in the queue when that drain runs, else they stay anchored
    // inside the flatten overwrite and trip the insert-inside-overwrite invariant
    for (const [, infos] of byStatement) {
      if (infos[0].isCatchClause) emitCatchClause(infos, infos[0].declPath.node);
    }

    // drain deferred flatten / cascade payloads - they consume scope-tracker bindings AND the
    // catch inserts above within each preserved declarator / statement range, so subsequent
    // `scopeTracker.applyTransforms` won't queue inserts that fall inside the overwrite
    // (MagicString chunk-split throw)
    flushPendingFlatten();
    flushPendingCascade();

    // emit innermost-first: a declaration nested inside another's init (an inner destructure in a
    // lifted SE-prefix IIFE body - `const { from } = ((() => { const { at } = o; return Array })(),
    // X)`) must emit BEFORE its container, so the container's `consumeRefsAndInserts` over its init
    // range drains the inner's genRef'd scoped-var. left un-drained, `scopeTracker.applyTransforms`
    // re-wraps the inner scope's block over a range overlapping the container overwrite, tripping
    // "could not locate inner needle". start-descending puts the higher-start (nested) declaration
    // first; independent sibling declarations don't overlap, so their relative order is immaterial
    const orderedStatements = [...byStatement].sort(([a], [b]) => b.start - a.start);
    for (const [, infos] of orderedStatements) {
      const [{ declPath, isAssignment, isCatchClause }] = infos;

      if (isCatchClause) continue;

      // shared classifier returns booleans both plugins consume from the same source.
      // assignment hosts skip classification (the booleans are VariableDeclaration-only
      // concerns - export/for-init slots can't host an AssignmentExpression directly)
      const hostShape = isAssignment ? null : classifyVariableDeclarationHost({
        declaration: declPath.node,
        declarationParent: declPath.parentPath?.node,
      });
      const isExport = hostShape?.isExport ?? false;
      const isForInit = hostShape?.isForInit ?? false;
      const replaceNode = isExport ? declPath.parentPath.node : declPath.node;
      const prefix = isExport ? 'export ' : '';
      const keyword = isAssignment ? '' : `${ declPath.node.kind } `;
      const stmtPrefix = isForInit ? '' : `${ prefix }${ keyword }`;
      const memoPrefix = isForInit ? '' : 'const ';

      const emitCtx = { stmtPrefix, memoPrefix, isForInit, isAssignment };

      const parts = [];
      if (isAssignment) {
        for (const info of infos) emitPolyfilled(info, parts, emitCtx);
      } else {
        const polyfilledByDecl = new Map(infos.map(i => [i.declaratorPath.node, i]));
        for (const dec of declPath.node.declarations) {
          const info = polyfilledByDecl.get(dec);
          if (info) emitPolyfilled(info, parts, emitCtx);
          // composed, not raw: a sibling may carry baked-in transforms of its own - an SE-key
          // trailing declarator insert anchored at its end, a polyfill rewrite in its init - and
          // a leftover point-insert inside the whole-declaration overwrite below would throw
          else parts.push(`${ stmtPrefix }${ composedRangeSrc(dec) }`);
        }
      }
      // the pair lands after every rendered declarator: source order put it at the declaration
      // end, and a comma-append onto a statement-shaped part keeps it a sibling declarator
      const trailing = trailingByDecl.get(declPath.node);
      if (trailing?.length) parts[parts.length - 1] += `, ${ trailing.join(', ') }`;

      if (isForInit) {
        transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
      } else {
        transforms.add(replaceNode.start, replaceNode.end,
          wrapBodylessIfMulti(`${ parts.join(';\n') };`, parts.length > 1, declPath));
      }
    }

    // block-wrap bodyless-control nested-instance assignment overwrites: replace the bodyless body
    // statement with `{ <stmt>; <overwrites> }` so the overwrites stay conditional. one overwrite
    // per element of a multi-element pattern, joined into the single block (`composedRangeSrc`
    // folds any inner rewrite of the statement so the range overwrite is queue-safe)
    for (const { statement, overwrites } of pendingBodylessAssignOverwrites.values()) {
      transforms.add(statement.node.start, statement.node.end,
        `{ ${ composedRangeSrc(statement.node) }\n${ overwrites.join('\n') } }`);
    }
    pendingBodylessAssignOverwrites.clear();
  }

  return {
    applyDestructuringTransforms,
    applySynthSwaps,
    canFullyConsumeProxyDeclarator,
    handleDestructuringPure,
    tryFlattenProxyHopHost,
  };
}
