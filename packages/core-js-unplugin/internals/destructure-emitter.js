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
  findEnclosingFunctionLikePath,
  FUNCTION_LIKE_NODE_TYPES,
  getFallbackBranchSlots,
  hasRestSiblingExcept,
  isBindingPosition,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isNonReferencePosition,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  objectPatternPropNeedsReceiverRewrite,
  peelFallbackWrappers,
  peelNestedSequenceExpressions,
  peelToExpressionStatement,
  propBindingIdentifier,
  resolveFallbackReceiver,
  TS_EXPR_WRAPPERS,
  unwrapExpressionChain,
  unwrapParens,
  unwrapRuntimeExpr,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  globalProxyMemberName,
  markSynthReceiverSkipped,
  symbolKeyToEntry,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { findProxyGlobal, resolveObjectName as sharedResolveObjectName } from '@core-js/polyfill-provider/detect-usage/resolve';
import { isViableBranchForKey, walkStaticReceiverChain } from '@core-js/polyfill-provider/detect-usage/destructure';
import { classifyVariableDeclarationHost } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  canTransformDestructuring,
  findSynthSwapReceiver,
  walkUpNestedDestructureToAssignment,
  walkUpNestedDestructureToDeclaration,
} from './destructure-emit-utils.js';
import { walkAstNodes } from './plugin-helpers.js';

// scope-walker constants for `polyfillSiblingReceiverRefs`. hoisted module-level so each
// call doesn't re-allocate the Sets. SwitchStatement creates one shared block scope per
// ES spec; `using` / `await using` are TC39 stage-4 lexical kinds (block-scoped, treated
// like let/const for shadow detection)
const SIBLING_BLOCK_SCOPE_TYPES = new Set([
  'BlockStatement',
  'CatchClause',
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'SwitchStatement',
]);

const SIBLING_LEXICAL_DECL_KINDS = new Set([
  'let',
  'const',
  'using',
  'await using',
]);

// pure helper: text-range covering `propNode` in `props` PLUS its adjacent comma so the
// resulting source stays a valid ObjectPattern after splicing the range out. shapes:
//   - first prop with siblings: [propStart, nextSiblingStart)  -> drops trailing `, `
//   - last/middle prop: [prevSiblingEnd, propEnd)              -> drops leading `, `
//   - lone prop: [propStart, propEnd)                          -> empties the pattern
// returns null when prop isn't in the list (orphaned mid-traversal) or the range is empty
function getPropRemovalRange(props, propNode) {
  const idx = props.indexOf(propNode);
  if (idx === -1) return null;
  const start = idx === 0 ? propNode.start : props[idx - 1].end;
  const end = idx === 0 && props.length > 1 ? props[idx + 1].start : propNode.end;
  return start < end ? { start, end } : null;
}

export function createDestructureEmitter({
  estreeAdapter,
  injectPureImport,
  injector,
  isBodylessStatementBody,
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

  // ---------- nested proxy-global flatten ----------

  // pre-pass walks every declarator for `canFullyConsumeProxyDeclarator`; main pass walks
  // the same declarators again via `tryFlattenNestedProxy`. cache by node identity to avoid
  // double work - amortizes the double traverse to one logical plan per declarator (O(1)
  // lookup on the second visit instead of re-scanning every property)
  const planCache = new WeakMap();
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
  // previous simple-flatten branch (used when no rest sibling) emitted only the FIRST prop's
  // polyfill and silently dropped sibling extractions on multi-prop hosts - eliminated here
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
    return cascadeAssignmentExpression(assignNode, peeled.exprStmt, metaPath.scope, peeled.sequencePrefix);
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
  function cascadeAssignmentExpression(assignNode, stmtPath, scope, outerSequencePrefix = []) {
    const stmtNode = stmtPath.node;
    let cached = trackedUnusedNamesByAssign.get(assignNode);
    if (!cached) {
      const fake = { id: assignNode.left, init: assignNode.right };
      // capture the `_unused` names emitted into preservedSrc; they need explicit
      // `var _unused;` declarations in the AssignmentExpression context (VariableDeclaration
      // host declares them via the destructure binding itself)
      const unusedIds = [];
      const result = withTrackedUnusedNames(unusedIds, () => rewriteDeclarator(fake, scope));
      cached = { result, unusedIds };
      trackedUnusedNamesByAssign.set(assignNode, cached);
    }
    const { result, unusedIds } = cached;
    if (!result.extractions.length) return false;
    flattenedAssignments.add(assignNode);
    // skip both halves of the assignment from the normal visitor pass: LHS pattern's
    // identifiers are now superseded by the rebuilt destructure text, RHS receiver tail
    // is already substituted to the polyfilled binding inside `result.preservedSrc`.
    // SE prefix expressions (RHS-internal AND outer SequenceExpression wrappers) stay
    // visitable so their inner Identifiers (`Promise.resolve`) emit their own polyfill
    // imports during traversal
    walkAstNodes(assignNode.left, node => skippedNodes.add(node));
    const { prefix: seExprs, tail: receiverTail } = peelNestedSequenceExpressions(assignNode.right);
    if (receiverTail) walkAstNodes(receiverTail, node => skippedNodes.add(node));
    const segments = [];
    for (const expr of outerSequencePrefix) segments.push(`${ nodeSrc(expr) };`);
    for (const expr of seExprs) segments.push(`${ nodeSrc(expr) };`);
    if (unusedIds.length) segments.push(`var ${ unusedIds.join(', ') };`);
    if (result.preservedSrc !== null) segments.push(`(${ result.preservedSrc });`);
    for (const e of result.extractions) segments.push(`${ e.decl };`);
    transforms.add(stmtNode.start, stmtNode.end,
      wrapBodylessIfMulti(segments.join('\n'), segments.length > 1, stmtPath));
    return true;
  }

  // for-init+SE+fully-consumed post-rewrite step: rewriteDeclarator returns preservedSrc
  // = null when every outer prop was consumed, but the SE in init must still evaluate
  // (loop header forbids external statement-lift). install a `_unused = (se(), _globalThis)`
  // sink declarator on each affected entry; the proxy-global tail is substituted manually
  // since `seedSkippedForExtractedDeclarators` already added the tail Identifier to
  // skippedNodes (it expected the init to be discarded). non-SE inits and partial-consume
  // entries are left as-is - they reach `renderFlattened` through the regular path
  function injectForInitSESinks(declaration, perDecl) {
    for (let i = 0; i < declaration.declarations.length; i++) {
      const { init } = declaration.declarations[i];
      // peel parens AND TS expression wrappers (`as` / `satisfies` / `!` / chain): SE prefix
      // through TS casts (`(se(), R) as any`) must reach the SE check the same as bare SE
      const peeled = unwrapRuntimeExpr(init);
      if (peeled?.type !== 'SequenceExpression' || perDecl[i].preservedSrc !== null) continue;
      const receiverPure = perDecl[i].receiver ? resolveGlobalPolyfill(perDecl[i].receiver) : null;
      const { prefix: seExprs, tail: receiverTail } = peelNestedSequenceExpressions(init);
      const tailSrc = receiverPure
        ? injectPureImport(receiverPure.entry, receiverPure.hintName)
        : nodeSrc(receiverTail);
      const seSrc = seExprs.length
        ? `(${ [...seExprs.map(nodeSrc), tailSrc].join(', ') })`
        : tailSrc;
      perDecl[i].preservedSrc = `${ injector.generateUnusedName() } = ${ seSrc }`;
    }
  }

  function tryFlattenNestedProxy(metaPath) {
    // accept `{ from }` / `{ from: alias }` / `{ from = default }` / `{ from: alias = default }`.
    // user's default is dropped since the extracted polyfill is always defined (see `planInnerProp`)
    if (!propBindingIdentifier(metaPath.node.value)) return false;
    const declPath = walkUpNestedDestructureToDeclaration(metaPath.parentPath);
    const declaration = declPath?.node;
    if (declaration?.type !== 'VariableDeclaration') return false;
    if (flattenedNestedDecls.has(declaration)) return true;
    const parentNode = declPath.parentPath?.node;
    const isForInit = parentNode?.type === 'ForStatement' && parentNode.init === declaration;
    const perDecl = declaration.declarations.map(d => rewriteDeclarator(d, metaPath.scope));
    if (!perDecl.some(r => r.extractions.length)) return false;
    flattenedNestedDecls.add(declaration);
    seedSkippedForExtractedDeclarators(declaration, perDecl);
    if (isForInit) injectForInitSESinks(declaration, perDecl);
    // defer rendering + transforms.add to applyDestructuringTransforms - sibling subtree
    // visits AFTER this point may register `var _ref;` scope-tracker bindings for inner
    // instance-method polyfills. baking those into preservedSrc requires post-traverse state
    pendingFlatten.push({ declaration, declPath, perDecl, isForInit });
    return true;
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
  // `logCall();` statements before the flattened decl). non-extracted siblings keep their
  // SE prefixes verbatim through `nodeSrc` (lifting both would double-execute)
  function liftExtractedSEPrefixes(declaration, perDecl) {
    const sequencePrefixes = [];
    for (let i = 0; i < declaration.declarations.length; i++) {
      if (!perDecl[i].extractions.length) continue;
      const { prefix } = peelNestedSequenceExpressions(declaration.declarations[i].init);
      for (const seExpr of prefix) sequencePrefixes.push(nodeSrc(seExpr));
    }
    return sequencePrefixes;
  }

  // bake all per-decl splices into preservedSrc using the original-source coordinate
  // system. two independent splice sources, both at original positions:
  //   - `siblingSubstSplices` (`globalThis -> _globalThis` from `polyfillSiblingReceiverRefs`,
  //     populated during traverse)
  //   - scope-tracker ref-binding splices (`var _ref;` inserts at nested-function body
  //     anchors, populated post-traverse via sibling-subtree visits)
  // both flow through `spliceInRange`'s descending-order traversal so neither set's
  // mutations invalidate the other's anchor positions
  function bakePendingSplicesIntoPreserved(declaration, perDecl) {
    for (let i = 0; i < perDecl.length; i++) {
      const decl = declaration.declarations[i];
      // even fully-extracted declarators must drain scope-tracker ref-bindings whose
      // anchor positions fall in [decl.start, decl.end). without this consume, applyTransforms
      // would later queue `var _ref;` insert inside the parent overwrite range and
      // MagicString throws "Cannot split a chunk that has already been edited"
      const refSplices = scopeTracker.consumeRefBindingsInRange(decl.start, decl.end);
      if (perDecl[i].preservedSrc === null) continue;
      const substSplices = perDecl[i].siblingSubstSplices ?? [];
      const splices = [...substSplices, ...refSplices];
      if (!splices.length) continue;
      // invariant: every splice must fall within [decl.start, decl.end). spliceInRange
      // anchors at decl.start and indexes into preservedSrc; an out-of-range splice would
      // either silently no-op or corrupt source. asserting at the gate isolates the splice
      // contract violation to this function instead of letting a downstream MagicString /
      // applyTransforms surface emit a confusing chunk-split error far from the cause
      for (const s of splices) {
        if (s.start < decl.start || s.end > decl.end) {
          throw new RangeError(`bakePendingSplicesIntoPreserved: splice [${ s.start },${ s.end }) outside decl [${ decl.start },${ decl.end })`);
        }
      }
      perDecl[i].preservedSrc = spliceInRange(perDecl[i].preservedSrc, decl.start, splices);
    }
  }

  // post-traverse render: bake pending splices, build replacement, queue the overwrite.
  // without consume-and-bake, scope-tracker would queue insert at a position INSIDE this
  // overwrite range and MagicString would split-an-edited-chunk
  function flushPendingFlatten() {
    for (const { declaration, declPath, perDecl, isForInit } of pendingFlatten) {
      bakePendingSplicesIntoPreserved(declaration, perDecl);
      let replacement = renderFlattened(perDecl, declaration.kind, isForInit);
      if (!isForInit) {
        const prefixes = liftExtractedSEPrefixes(declaration, perDecl);
        if (prefixes.length) replacement = `${ prefixes.map(p => `${ p };`).join('\n') }\n${ replacement }`;
        replacement = wrapBodylessIfMulti(replacement, replacement.includes('\n'), declPath);
      }
      transforms.add(declaration.start, declaration.end, replacement);
    }
    pendingFlatten.length = 0;
  }

  // seed skippedNodes ONLY for the consumed parts: the ObjectPattern (id) and the
  // receiver tail (last expr of SE init). SE-prefix expressions are preserved as
  // source text via `sePrefixes` in tryFlattenNestedProxy - their inner Identifiers
  // (e.g. `Promise` in `(Promise.resolve(...).then(noop), globalThis)`) need natural
  // visitor pass to emit their own polyfill imports. seeding the whole declarator
  // would block them. siblings reusing a flattened receiver's name
  // (`{X:{m}}=globalThis, y=globalThis`) get inline substitution via
  // `polyfillSiblingReceiverRefs` so compose's nth-count matches the flattened source
  function seedSkippedForExtractedDeclarators(declaration, perDecl) {
    const flattenedReceivers = new Set();
    for (let i = 0; i < perDecl.length; i++) {
      if (!perDecl[i].extractions.length) continue;
      const decl = declaration.declarations[i];
      walkAstNodes(decl.id, n => skippedNodes.add(n));
      // peel parens AND TS wrappers (`as` / `satisfies` / `!` / chain): SE prefixes
      // through TS casts (`(logCall(), globalThis) as any`) must lift the same as bare
      // SE. without TS unwrap, the SE prefix sits inside a TSAsExpression that doesn't
      // get scanned, and the call gets silently dropped when the declarator is flattened
      const initInner = unwrapRuntimeExpr(decl.init);
      const consumedTail = initInner?.type === 'SequenceExpression' ? initInner.expressions.at(-1) : initInner;
      if (consumedTail) walkAstNodes(consumedTail, n => skippedNodes.add(n));
      if (perDecl[i].receiver) flattenedReceivers.add(perDecl[i].receiver);
    }
    if (flattenedReceivers.size) {
      for (let i = 0; i < perDecl.length; i++) {
        if (!perDecl[i].extractions.length) {
          perDecl[i].siblingSubstSplices = polyfillSiblingReceiverRefs(declaration.declarations[i], flattenedReceivers);
        }
      }
    }
  }

  // for-init: single `kind d1, d2, d3` - `\n`-separated statements parse as for-init-test-
  // update with the middle declaration as test, a syntax error.
  // block-level: extractions split to separate statements (match babel), preserved
  // declarators collapse into one trailing `kind` statement
  function renderFlattened(perDecl, kind, isForInit) {
    if (isForInit) {
      const parts = [];
      for (const r of perDecl) {
        for (const e of r.extractions) parts.push(e.decl);
        if (r.preservedSrc !== null) parts.push(r.preservedSrc);
      }
      return `${ kind } ${ parts.join(', ') }`;
    }
    const extractedLines = perDecl.flatMap(r => r.extractions.map(e => `${ kind } ${ e.decl };`));
    const preservedDecls = perDecl.map(r => r.preservedSrc).filter(s => s !== null);
    return extractedLines.join('\n')
      + (preservedDecls.length ? `\n${ kind } ${ preservedDecls.join(', ') };` : '');
  }

  // plan factory: classify every outer prop of a destructure declarator without side
  // effects. returned shape:
  //   { receiver, outerProps: [{ extractions?, preservedSrc }] }
  // preservedSrc === null -> outer prop was fully consumed (drop).
  // null when the init isn't a recognisable host shape or nothing matches.
  // peel parallel transparent destructure wrappers:
  //   - single-element ArrayPattern + matching ArrayExpression layer (`[{...}] = [globalThis]`,
  //     `[[{...}]] = [[globalThis]]`, etc.)
  //   - inner AssignmentPattern default (`[{...} = {}] = [globalThis]`) - default never fires
  //     for proxy-global receivers since runtime value is always defined under polyfill-wins
  // mirrors provider-side `peelDestructureWrappers` + `descendArrayWrapperInit`. bail
  // (stop iterating) on depth divergence or non-array intermediate - downstream shape
  // check will reject ambiguous shapes
  function peelArrayWrapperPair(pattern, initSource) {
    for (;;) {
      // strip AssignmentPattern wrapper on the destructure side - init has no AssignmentPattern
      // equivalent (defaults sit on the LHS slot), so we only peel pattern here
      if (pattern?.type === 'AssignmentPattern') {
        pattern = pattern.left;
        continue;
      }
      if (pattern?.type !== 'ArrayPattern' || pattern.elements.length !== 1
        || initSource?.type !== 'ArrayExpression') return { pattern, initSource };
      const [innerPattern] = pattern.elements;
      const [innerInit] = initSource.elements;
      if (!innerPattern || !innerInit) return { pattern, initSource };
      pattern = innerPattern;
      initSource = innerInit;
    }
  }

  // dispatches across two complementary host shapes:
  //   - proxy-global: `{Array: {from}} = globalThis` - outer key IS the constructor name
  //   - static-object: `{a: {from}} = wrapper` where `wrapper = {a: Array}` - constructor
  //     hidden behind const-bound ObjectExpression, walk init through outer-key path to
  //     locate it. mirrors babel-plugin's `tryFlattenNestedProxyDestructure` so both
  //     pipelines emit the same `const from = _Array$from` extraction (full polyfill-wins
  //     semantics) instead of unplugin's older inline-default fallback
  function planDeclarator(declarator, scope) {
    if (planCache.has(declarator)) return planCache.get(declarator);
    let plan = null;
    const { pattern, initSource } = peelArrayWrapperPair(declarator.id, declarator.init);
    if (pattern?.type === 'ObjectPattern' && pattern.properties.length) {
      // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
      // (and nested forms like `(se(), (R as any))`) reach the receiver. without this,
      // TS-wrapped destructure inits bail the flatten path and the SE prefix never lifts
      const init = unwrapExpressionChain(initSource);
      const receiver = init ? sharedResolveObjectName(init, scope, estreeAdapter) : null;
      if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
        const outerProps = pattern.properties.map(planOuterProp);
        if (outerProps.some(p => p.extractions?.length)) plan = { receiver, outerProps, pattern };
      } else if (init) {
        const outerProps = pattern.properties.map(p => planOuterPropStatic(p, init, [], scope));
        if (outerProps.some(p => p.extractions?.length)) plan = { receiver: null, outerProps, pattern };
      }
    }
    planCache.set(declarator, plan);
    return plan;
  }

  // peel AssignmentPattern wrapping the inner pattern (`{ Foo: { x } = {} } = R`).
  // proxy-global / static-object receivers always defined, so default never fires;
  // transparent under "polyfill always wins". returns the bare value for non-wrapper
  // shapes unchanged
  function peelInnerDefault(value) {
    return value?.type === 'AssignmentPattern' ? value.left : value;
  }

  // static-object descent. given an outer prop `key: ObjectPattern` at depth N (path =
  // [k1, k2, ...] from declarator-root to here), walk hostInit through `path + key`:
  //   - leaf Identifier (constructor name): plan inner ObjectPattern via `planInnerProp`
  //     so `from` / `from: alias` / `from = default` get extracted
  //   - intermediate ObjectExpression: recurse one level deeper, descending into the
  //     inner ObjectPattern with extended path
  // non-Property / computed / non-ObjectPattern values bail to opaque preservedSrc.
  // shorthand / Identifier-valued outer props are NOT supported here - they would name a
  // local binding outside the static path, so static-object descent doesn't apply
  function planOuterPropStatic(outerProp, hostInit, path, scope) {
    if (outerProp.type !== 'Property' || outerProp.computed
      || outerProp.key?.type !== 'Identifier') {
      return { preservedSrc: nodeSrc(outerProp) };
    }
    const value = peelInnerDefault(outerProp.value);
    if (value?.type !== 'ObjectPattern') return { preservedSrc: nodeSrc(outerProp) };
    const newPath = [...path, outerProp.key.name];
    const constructor = walkStaticReceiverChain(hostInit, newPath, scope, estreeAdapter);
    // proxy-global hop (`{root: {Array: {from}}} = {root: globalThis}`): walkStaticReceiverChain
    // resolves the first segment to `globalThis` / `self` / `window` — that's a proxy-global
    // intermediate, NOT a constructor. continue descent so the next hop reaches the real
    // constructor (`Array`) via `walkStaticReceiverStep`'s proxy-global mid-chain lift.
    // without this gate, planInnerProp would fire with `object: 'globalThis'` and resolvePure
    // bails, leaving the leaf `from` unpolyfilled
    if (constructor && !POSSIBLE_GLOBAL_OBJECTS.has(constructor)) {
      return foldNestedPattern(outerProp, value, innerProp => planInnerProp(innerProp, constructor));
    }
    return foldNestedPattern(outerProp, value, innerProp => planOuterPropStatic(innerProp, hostInit, newPath, scope));
  }

  // proxy-global outer prop: four shapes
  //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
  //   - `{ Self: { ... } }` where Self is itself a proxy-global - alias hop, recurse keeping
  //     the chain transparent. enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
  //   - `{ Foo }` shorthand - polyfill Foo as a global
  //   - `{ Foo: alias }` aliased - same, different local name
  function planOuterProp(outerProp) {
    if (outerProp.type !== 'Property' || outerProp.computed
      || outerProp.key?.type !== 'Identifier') {
      return { preservedSrc: nodeSrc(outerProp) };
    }
    const { name } = outerProp.key;
    const value = peelInnerDefault(outerProp.value);
    if (value?.type === 'ObjectPattern') {
      const planChild = POSSIBLE_GLOBAL_OBJECTS.has(name)
        ? planOuterProp
        : innerProp => planInnerProp(innerProp, name);
      return foldNestedPattern(outerProp, value, planChild);
    }
    if (value?.type === 'Identifier') {
      const pure = resolveGlobalPolyfill(name);
      if (!pure) return { preservedSrc: nodeSrc(outerProp) };
      return {
        extractions: [{ entry: pure.entry, hint: pure.hintName, localName: value.name }],
        preservedSrc: null,
      };
    }
    return { preservedSrc: nodeSrc(outerProp) };
  }

  // fold an ObjectPattern-valued outer prop: plan each child, concat extractions,
  // rebuild preserved shape. empty extractions -> bail as opaque; all consumed -> null
  // preservedSrc (caller drops the prop); partial -> `name: { a, b }` with survivors.
  // inner-level RestElement (`{ Array: { from, ...rest } }`) needs sentinel exclusion: rest
  // gathers all OTHER own keys, so a fully-consumed key without placeholder would change
  // runtime semantics (`rest.from` becomes defined, originally excluded). mirrors the
  // outer-level treatment in `rewriteDeclarator`
  function foldNestedPattern(outerProp, innerPattern, planChild) {
    // innerPattern defaults to outerProp.value when not provided - back-compat for callers
    // that don't peel AssignmentPattern themselves
    const pattern = innerPattern ?? outerProp.value;
    const extractions = [];
    const preservedInner = [];
    const innerHasRest = pattern.properties.some(p => p.type === 'RestElement');
    for (const child of pattern.properties) {
      const e = planChild(child);
      if (e.extractions?.length) {
        extractions.push(...e.extractions);
        if (innerHasRest && e.preservedSrc === null && child.type === 'Property' && child.key?.name) {
          preservedInner.push(`${ child.key.name }: ${ injector.generateUnusedName() }`);
        }
      }
      if (e.preservedSrc !== null && e.preservedSrc !== undefined) preservedInner.push(e.preservedSrc);
    }
    if (!extractions.length) return { preservedSrc: nodeSrc(outerProp) };
    if (!preservedInner.length) return { extractions, preservedSrc: null };
    return { extractions, preservedSrc: `${ outerProp.key.name }: { ${ preservedInner.join(', ') } }` };
  }

  // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on
  // `Array`. only simple Identifier values; rest / default / non-Identifier / unknown
  // keys fall back to `preservedSrc`. uses the bare `resolveBuiltIn` meta resolver first
  // to filter instance kind - `resolvePure` with no path would crash on `enhanceMeta`'s
  // `isMemberLike(path)` for instance resolutions
  function planInnerProp(prop, receiverName) {
    if (prop.type !== 'Property' || prop.computed
      || prop.key?.type !== 'Identifier') {
      return { preservedSrc: nodeSrc(prop) };
    }
    // accept `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`.
    // user's default is dropped: polyfill is always defined, the user's default would be
    // dead code (fires only on undefined property, which polyfill rules out)
    const valueNode = propBindingIdentifier(prop.value);
    if (!valueNode) return { preservedSrc: nodeSrc(prop) };
    const meta = { kind: 'property', object: receiverName, key: prop.key.name, placement: 'static' };
    if (resolveBuiltIn(meta)?.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
    const pure = resolvePure(meta);
    if (!pure || pure.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
    return {
      extractions: [{ entry: pure.entry, hint: pure.hintName, localName: valueNode.name }],
      preservedSrc: null,
    };
  }

  // execute the plan: inject polyfill imports, emit extractions. returns
  // `{ extractions: [{ decl }], preservedSrc }` where `preservedSrc` is null when the
  // declarator is fully consumed, raw src when there's no plan to touch, or a rebuilt
  // `{ ... } = init` source when outer siblings remain
  function rewriteDeclarator(declarator, scope) {
    const plan = planDeclarator(declarator, scope);
    if (!plan) return { extractions: [], preservedSrc: nodeSrc(declarator), receiver: null };
    const extractions = [];
    const preservedOuter = [];
    // RestElement in outer pattern - rest gathers all OTHER own keys, so dropping a
    // fully-consumed key from `{Array: {from}, ...rest} = globalThis` would change
    // runtime semantics (`rest.Array` becomes defined, original excluded it). keep
    // a `Foo: _unused` sentinel for each consumed key when rest is present
    // plan.pattern is the effective ObjectPattern (peeled past ArrayPattern wrapper for
    // `[{...}] = [globalThis]`); declarator.id may be the ArrayPattern wrapper itself
    const hasRest = plan.pattern.properties.some(p => p.type === 'RestElement');
    for (let i = 0; i < plan.outerProps.length; i++) {
      const outer = plan.outerProps[i];
      for (const e of outer.extractions ?? []) {
        const binding = injectPureImport(e.entry, e.hint);
        // register the body-extract alias so receiver-narrowing through this binding
        // (`xs = from('hi'); xs.at(0)`) finds the polyfill entry path. matches babel's
        // body-extract paths so multi-method narrowing works on extracted `from` / `of`
        // / etc. (without it, `at` / `includes` fall to generic `_at` / `_includes`)
        injector.registerBodyExtractAlias(e.localName, e.entry);
        extractions.push({ decl: `${ e.localName } = ${ binding }` });
      }
      if (outer.preservedSrc !== null) {
        preservedOuter.push(outer.preservedSrc);
      } else if (hasRest) {
        const sourceProp = plan.pattern.properties[i];
        const keyName = sourceProp?.key?.name;
        if (keyName) preservedOuter.push(`${ keyName }: ${ injector.generateUnusedName() }`);
      }
    }
    if (!preservedOuter.length) return { extractions, preservedSrc: null, receiver: plan.receiver };
    // partial flatten: preserved declarator still destructures from the receiver,
    // so polyfill it - old runtimes without `globalThis` / `self` would crash otherwise
    const receiverPure = resolveGlobalPolyfill(plan.receiver);
    const initSrc = receiverPure
      ? injectPureImport(receiverPure.entry, receiverPure.hintName)
      : nodeSrc(declarator.init);
    return {
      extractions,
      preservedSrc: `{ ${ preservedOuter.join(', ') } } = ${ initSrc }`,
      receiver: plan.receiver,
    };
  }

  // pre-pass helper: true when every outer prop was fully consumed - flatten will
  // discard the declarator's init, so `_globalThis` injection can be suppressed
  function canFullyConsumeProxyDeclarator(d, scope) {
    const plan = planDeclarator(d, scope);
    return !!plan && plan.outerProps.every(p => p.preservedSrc === null);
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

    // own lexical-scope owners are SIBLING_BLOCK_SCOPE_TYPES (hoisted module-level).
    // StaticBlock is BOTH a var-scope (per ES2022) AND a lexical-scope owner; treated
    // jointly via `isVarScopeBoundary` (collectFunctionVars bails) + explicit `pushScope`
    // branch (collects both bands of bindings)
    function isVarScopeBoundary(type) {
      return FUNCTION_LIKE_NODE_TYPES.has(type) || type === 'StaticBlock';
    }

    function isScopeOwner(type) {
      return isVarScopeBoundary(type) || SIBLING_BLOCK_SCOPE_TYPES.has(type);
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

    // LIMITATION: 1-hop check only. recognises `identifierNode.<polyfillName>` but NOT
    // multi-hop proxy chains like `globalThis.Map.from` where the polyfillable name is
    // two members deep. acceptable for the destructure-emitter callsite: the substituter
    // walks identifier-by-identifier, and the OUTER MemberExpression range covers the
    // full chain - skipping at the 1-hop level prevents inline `globalThis -> _globalThis`
    // substitution INSIDE the outer transform's `_Map.from` replacement
    function isPolyfillableMemberAccess(parent, identifierNode) {
      if (parent?.type !== 'MemberExpression' || parent.object !== identifierNode) return false;
      const { property } = parent;
      if (!parent.computed) {
        return property?.type === 'Identifier' && !!resolveGlobalPolyfill(property.name);
      }
      // computed-string `obj['Map']` / `` obj[`Map`] ``: parser shape varies. babel emits
      // StringLiteral; oxc emits Literal with string .value; single-quasi TemplateLiteral
      // (no interpolations) is also a static-string key. both must apply the same skip -
      // the outer rewrite's range covers the whole `obj[<literal>]` MemberExpression
      const literalValue = property?.type === 'StringLiteral' ? property.value
        : property?.type === 'Literal' && typeof property.value === 'string' ? property.value
          : property?.type === 'TemplateLiteral' && !property.expressions?.length && property.quasis?.length === 1
            ? property.quasis[0].value?.cooked ?? null
            : null;
      return literalValue !== null && !!resolveGlobalPolyfill(literalValue);
    }

    function walk(node, parent) {
      if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
      const opens = isScopeOwner(node.type);
      if (opens) pushScope(node);
      if (node.type === 'Identifier' && flattenedReceivers.has(node.name)
        && !isShadowed(node.name) && !isPolyfillableMemberAccess(parent, node)
        && !isNonReferencePosition(parent, node) && !isBindingPosition(parent, node)) {
        matches.push(node);
      }
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (Array.isArray(value)) for (const item of value) walk(item, node);
        else walk(value, node);
      }
      if (opens) scopeStack.pop();
    }

    walk(declarator, null);
    if (!matches.length) return [];
    // collect splices at ORIGINAL source positions; defer apply to `flushPendingFlatten`
    // so post-traverse scope-tracker ref-binding splices (`var _ref;` insertions inside
    // the sibling decl's nested function bodies) can be merged into a single spliceInRange
    // pass. applying substitutions inline here would shift positions in `preservedSrc`,
    // and subsequent ref-binding splices computed from original positions would land at
    // the wrong offset (corruption shape: `var _ref;` sliced into the middle of an
    // identifier when nested-function body anchor sits AFTER a substitution site)
    const splices = [];
    for (const match of matches) {
      const pure = resolveGlobalPolyfill(match.name);
      if (!pure) continue;
      skippedNodes.add(match);
      splices.push({
        start: match.start,
        end: match.end,
        content: injectPureImport(pure.entry, pure.hintName),
      });
    }
    return splices;
  }

  // ---------- destructure rewrite pipeline ----------

  // top-level destructure path (`const {from} = cond ? Array : Set`, assignment-target).
  // resolves the wrapper's RHS via the unified slot/IIFE helper, then delegates to the
  // shared per-branch helper. wraps to keep `handleDestructuringPure` under lint statement-cap
  function tryFromFallbackPerBranchSynth(metaPath, propNode) {
    const desc = resolveFallbackReceiver(metaPath.parentPath?.parentPath, metaPath.parent);
    if (!desc) return;
    tryRegisterPerBranchSynth(desc.rhsNode, propNode, metaPath.parent, metaPath.scope);
  }

  // ConditionalExpression / LogicalExpression in destructure-receiver position
  // (`= cond ? Array : Set` / `= Array || Set`). `meta.fromFallback` flags this case -
  // the resolved meta tracks ONE branch but runtime picks per-call. for branches
  // statically resolvable to a known global with a viable static polyfill for the
  // destructured key, register a per-branch synth-swap so each branch becomes its own
  // `{key: _Branch$key, ...}` literal. branches without viable polyfill are left raw -
  // the constructor identifier visitor still emits `_Set` etc. for shadow-correct globals.
  // returns true when at least one branch was registered
  function tryRegisterPerBranchSynth(rhs, propNode, objectPattern, scope) {
    if (!rhs || !propNode || !objectPattern) return false;
    if (!isSynthSimpleObjectPattern(objectPattern)) return false;
    if (propNode.computed || propNode.key?.type !== 'Identifier') return false;
    // peel ParenthesizedExpression + TS expression wrappers so paren-wrapped or TS-cast
    // fallback receivers (`(cond ? A : B) as any`) reach the slot resolver. NOTE: do NOT
    // peel chain-assignment here - `foo = cond ? Array : Set` is intentional escape hatch
    // (rewriting branches as synth literals would change `foo`'s runtime value)
    const inner = peelFallbackWrappers(rhs);
    const slots = getFallbackBranchSlots(inner);
    if (!slots) return false;
    const key = propNode.key.name;
    let registered = false;
    for (const slot of slots) {
      const branch = inner[slot];
      const pure = isViableBranchForKey(branch, key, scope, estreeAdapter, resolvePure);
      if (!pure) continue;
      const binding = injectPureImport(pure.entry, pure.hintName);
      // skip the wrapper chain (ParenthesizedExpression / TS expression) AND the inner
      // resolved receiver (Identifier or proxy-global MemberExpression chain) - otherwise
      // the inner Identifier visitor fires on `Iterator` / `globalThis` and emits a parallel
      // polyfill that conflicts with the synth-swap emit (`{from: _Iterator$from}`).
      // wrappers walked inline; MemberExpression hop delegated to `markSynthReceiverSkipped`
      // so `globalThis.Array` -> skip `globalThis` Identifier too
      let cur = branch;
      while (cur && (cur.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(cur.type))) {
        skippedNodes.add(cur);
        cur = cur.expression;
      }
      markSynthReceiverSkipped(cur, skippedNodes);
      let pending = pendingSynthSwaps.get(branch);
      if (!pending) {
        pending = { receiver: branch, objectPattern, polyfills: new Map() };
        pendingSynthSwaps.set(branch, pending);
      }
      pending.polyfills.set(key, binding);
      registered = true;
    }
    return registered;
  }

  // parameter destructure. synth-swap when `findSynthSwapReceiver` identifies a safe
  // Identifier receiver; otherwise inline-default `{p = _polyfill}`.
  // AssignmentPattern value (`{from = []}`): accept and polyfill via synth-swap - the
  // user's default becomes dead code because synth-polyfilled property is always defined
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
      if (desc) tryRegisterPerBranchSynth(desc.rhsNode, propNode, metaPath.parent, metaPath.scope);
      return;
    }
    const isAssign = value.type === 'AssignmentPattern';
    const pureResult = resolvePure(meta, metaPath);
    if (!pureResult || pureResult.kind === 'instance') return;
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    const objectPattern = metaPath.parent;
    const receiver = isSynthSimpleObjectPattern(objectPattern)
      ? findSynthSwapReceiver(metaPath.parentPath?.parentPath, objectPattern) : null;
    if (!receiver) {
      // synth-swap bailed (computed-key sibling / non-Identifier shape) - try body-extract
      // first: insert `let from = _polyfill;` at function body top + remove the prop from
      // destructure. preserves "polyfill always wins" even at the cost of caller-
      // passed `{from: customFrom}` being ignored. covers all four prop-value shapes
      // (`{x}` / `{x: alias}` / `{x = default}` / `{x: alias = default}`) via
      // `propBindingIdentifier`'s AssignmentPattern.left peel - matches babel-plugin's
      // unconditional body-extract dispatch. expr-body arrows skip (no statement slot)
      if (tryBodyExtractFromParamDestructurePure(metaPath, propNode, binding, objectPattern, pureResult.entry)) return;
      if (isAssign) transforms.add(value.right.start, value.right.end, binding);
      else transforms.insert(value.end, ` = ${ binding }`);
      return;
    }
    // synth-swap owns the receiver chain - identifier visitor would race on the same range.
    // for proxy-global MemberExpression receivers (`globalThis.Map`) walk down `.object` so
    // inner Identifier visitors don't emit `_globalThis` etc. into the now-replaced range
    markSynthReceiverSkipped(receiver, skippedNodes);
    let pending = pendingSynthSwaps.get(receiver);
    if (!pending) {
      pending = { receiver, objectPattern, polyfills: new Map() };
      pendingSynthSwaps.set(receiver, pending);
    }
    pending.polyfills.set(propNode.key.name, binding);
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
  function tryBodyExtractFromParamDestructurePure(propPath, propNode, binding, objectPattern, entry) {
    const localId = propBindingIdentifier(propNode.value);
    if (!localId) return false;
    const fnPath = findEnclosingFunctionLikePath(propPath);
    if (!fnPath || fnPath.node.body?.type !== 'BlockStatement') return false;
    const bodyOpenAfter = fnPath.node.body.start + 1;
    const props = objectPattern.properties;
    if (hasRestSiblingExcept(props, propNode)) {
      transforms.add(propNode.start, propNode.end, `${ propNode.key.name }: ${ injector.generateUnusedName() }`);
    } else {
      const range = getPropRemovalRange(props, propNode);
      if (!range) return false;
      transforms.add(range.start, range.end, '');
    }
    transforms.insert(bodyOpenAfter, `\n  let ${ localId.name } = ${ binding };`);
    // register the local name -> entry path so receiver-narrowing through this binding
    // (`arr = from('x'); arr.at(-1)`) finds the polyfill's static return type without
    // having to re-derive (Constructor, method) from the destructure pattern shape. matches
    // babel-plugin's body-extract paths which register the same alias post-AST-mutation
    injector.registerBodyExtractAlias(localId.name, entry);
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

  function handleDestructuringPure(meta, metaPath, propNode) {
    if (isFunctionParamDestructureParent(metaPath.parentPath)) {
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    // peel inner-default AssignmentPattern (`{ Foo: { x } = {} } = R`) so the nested-flatten
    // path fires for the same shape as the bare `{ Foo: { x } } = R` form
    let outerHost = metaPath.parentPath?.parentPath;
    if (outerHost?.node?.type === 'AssignmentPattern'
        && outerHost.node.left === metaPath.parentPath?.node) {
      outerHost = outerHost.parentPath;
    }
    if (outerHost?.node?.type === 'Property') {
      if (tryFlattenNestedProxy(metaPath)) return;
      if (tryFlattenAssignmentExpression(metaPath)) return;
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    if (propNode.value?.type === 'Identifier'
        && injector.hasGeneratedUnusedName(propNode.value.name)) return;
    if (!canTransformDestructuring(metaPath)) return;
    if (meta.fromFallback) return tryFromFallbackPerBranchSynth(metaPath, propNode);
    const patternHasRest = metaPath.parent?.properties?.some(
      p => p.type === 'RestElement' || p.type === 'SpreadElement');
    if (patternHasRest && metaPath.parentPath?.parentPath?.parentPath?.parentPath?.node?.type
        === 'ExportNamedDeclaration') return;
    if (propNode.computed && meta.key === 'Symbol.iterator') {
      const patternProps = metaPath.parent?.properties;
      const hasRest = patternProps?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
      if (!hasRest) {
        skippedNodes.add(propNode.key);
        if (propNode.key.object) skippedNodes.add(propNode.key.object);
      }
    }
    const { value } = propNode;
    if (value && !propBindingIdentifier(value)) return;
    const isSymbolIterator = propNode.computed && meta.key === 'Symbol.iterator';
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
      // walkAstNodes visits every Identifier node, including ones in non-reference slots
      // (`Math.it` has `.it` as MemberExpression.property, not a binding ref). filter via
      // `isNonReferencePosition` so the catch transform doesn't fire for unused bindings -
      // pre-fix `try {} catch ({ [Symbol.iterator]: it }) { Math.it; }` over-emitted because
      // `.it` was counted as a reference to `it`
      walkAstNodes(declaratorPath.node.body, (n, parent) => {
        if (!referenced && n.type === 'Identifier' && n.name === localName
            && !isNonReferencePosition(parent, n)) referenced = true;
      });
      if (!referenced) return;
    }
    const { kind, binding } = resolveDestructureEntry({ isSymbolIterator, isSymbolKeyPassthrough, pureResult });
    const isAssignment = !isCatchClause && declaratorPath?.node?.type === 'AssignmentExpression';
    let declPath = isCatchClause ? declaratorPath : declaratorPath?.parentPath;
    if (isAssignment) {
      while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
    }
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
        scopeSnapshot: { scope: scopeTracker.scope, arrow: scopeTracker.arrow },
      });
      // mark globals in init so they don't generate conflicting transforms; instance
      // methods compose correctly and stay polyfilled (init expression remains as arg)
      if (initNode && !mayHaveSideEffects(initNode)) markInitGlobals(initNode);
    }
    pendingDestructuring.get(objectPattern).entries.push({ propNode, localName, binding, kind, defaultSrc });
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

  // catch clause: replace param with ref, insert polyfilled + remaining in source order.
  // computed keys must have their pending polyfill rewrites extracted upfront - the catch
  // param overwrite below would otherwise contain orphan inner transforms -> compose throws
  // "could not locate inner needle". covers entry keys (Symbol.iterator absorbed by
  // getIteratorMethod) and non-entry siblings (Symbol.asyncIterator polyfilled by standalone
  // visitor) uniformly
  function emitCatchClause(infos, catchNode) {
    const [{ initSrc: ref, allProps }] = infos;
    const entryByProp = new Map(infos.flatMap(i => i.entries.map(e => [e.propNode, e])));
    const computedKeyContent = new Map();
    for (const p of allProps) {
      if (p.type !== 'Property' || !p.computed) continue;
      const content = transforms.extractContent(p.key.start, p.key.end);
      if (content !== null) computedKeyContent.set(p, content);
    }
    for (const e of entryByProp.values()) {
      if (e.propNode.computed) e.polyfillKeyContent = computedKeyContent.get(e.propNode) ?? null;
    }
    // non-entry prop source: use polyfilled key when extracted, else original slice.
    // shared between no-rest prelude and hasRest pattern rebuild
    const nonEntryPropSrc = p => {
      const polyfilledKey = computedKeyContent.get(p);
      return polyfilledKey === undefined
        ? nodeSrc(p)
        : `[${ polyfilledKey }]: ${ nodeSrc(p.value) }`;
    };
    const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    const lines = [];
    for (const p of allProps) {
      if (p.type === 'RestElement' || p.type === 'SpreadElement') continue;
      const e = entryByProp.get(p);
      if (!e) {
        if (!hasRest) lines.push(`let { ${ nonEntryPropSrc(p) } } = ${ ref };`);
        continue;
      }
      // `symbol-key` entries don't extract a value - the rebuilt pattern keeps the prop
      // (with original localName) so `_ref[polyfilledKey]` is bound by destructuring directly
      if (e.kind === 'symbol-key') continue;
      const valueSrc = e.kind === 'instance' ? `${ e.binding }(${ ref })` : e.binding;
      if (e.defaultSrc) {
        const testRef = e.kind === 'instance' ? injector.generateLocalRef() : null;
        const test = testRef ? `(${ testRef } = ${ valueSrc })` : valueSrc;
        lines.push(`let ${ testRef ? `${ testRef }, ` : '' }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ testRef || valueSrc };`);
      } else {
        lines.push(`let ${ e.localName } = ${ valueSrc };`);
      }
    }
    if (hasRest) {
      const rebuiltProps = allProps.map(p => {
        const e = entryByProp.get(p);
        if (!e) return nonEntryPropSrc(p);
        const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : nodeSrc(p.key);
        // symbol-key keeps original localName (the destructure binds it directly);
        // other entries already extracted via standalone let-decl above, so reserve a
        // `_unused` slot just for the rest gather to skip the polyfilled key
        const valueName = e.kind === 'symbol-key' ? e.localName : injector.generateUnusedName();
        return `${ keySrc }: ${ valueName }`;
      });
      lines.push(`let { ${ rebuiltProps.join(', ') } } = ${ ref };`);
    }
    transforms.add(catchNode.param.start, catchNode.param.end, ref);
    transforms.insert(catchNode.body.start + 1, `\n${ lines.join('\n') }`);
  }

  // post-traverse: emit `{p: _polyfill, q: R.q, ...}` over the receiver span. runs
  // after main traverse - full polyfill set per receiver known only after sibling visits.
  // non-polyfilled siblings read from pure receiver when receiver itself is polyfillable
  // (raw `Promise.custom` on IE11 would ReferenceError before the destructure runs).
  // partial-rewrite risk: an exception inside the loop leaves `pendingSynthSwaps` half-applied
  // (some transforms queued, others lost). recovery semantics intentional: catch-and-continue
  // would silently produce inconsistent output, hard fail surfaces the bug to the user
  function applySynthSwaps() {
    for (const [, { receiver, objectPattern, polyfills }] of pendingSynthSwaps) {
      if (objectPattern?.type !== 'ObjectPattern') continue;
      const inner = peelFallbackWrappers(receiver);
      // accept Identifier (`Array`) and MemberExpression (`window.Array`) receivers. for
      // MemberExpression, unpolyfilled keys still re-read through the chain (`window.Array
      // .other`) - each `${ src }.${ key }` reference re-evaluates the receiver expression.
      // typical pattern is all-polyfilled keys (no re-read needed); accept the side-effect
      // re-evaluation trade-off for partial-polyfill cases
      if (inner?.type !== 'Identifier' && inner?.type !== 'MemberExpression') continue;
      const receiverPure = inner.type === 'Identifier' ? resolveGlobalPolyfill(inner.name) : null;
      let receiverSrc = null;
      const getReceiverSrc = () => receiverSrc ??= receiverPure
        ? injectPureImport(receiverPure.entry, receiverPure.hintName)
        : nodeSrc(inner);
      const entries = [];
      for (const p of objectPattern.properties) {
        if (p.type !== 'Property' || p.computed || p.key?.type !== 'Identifier') continue;
        const polyfill = polyfills.get(p.key.name);
        entries.push(polyfill
          ? `${ p.key.name }: ${ polyfill }`
          : `${ p.key.name }: ${ getReceiverSrc() }.${ p.key.name }`);
      }
      transforms.add(receiver.start, receiver.end, `{ ${ entries.join(', ') } }`);
    }
  }

  // three drain shapes routing through the single TransformQueue (overwrites + inserts):
  //   1. `applyDestructuringTransforms` - VariableDeclaration rewrite (splits, reorders, extracts)
  //   2. `applySynthSwaps` - function param default synth-swap (receiver-span overwrite)
  //   3. `emitCatchClause` - catch-pattern rewrite (param overwrite + body-prelude insert)
  // share `pendingDestructuring` / `pendingSynthSwaps` accumulators; differ only in the
  // shape of the AST anchor being emitted into. final flush via the host's queue.apply()
  function applyDestructuringTransforms() {
    // drain deferred flatten payloads first - they consume scope-tracker bindings within
    // each preserved declarator's range, so subsequent scopeTracker.applyTransforms won't
    // queue inserts that fall inside the flatten overwrite (MagicString chunk-split throw)
    flushPendingFlatten();
    const byStatement = new Map();
    for (const [, info] of pendingDestructuring) {
      if (!info.declPath?.node || !info.declaratorPath?.node) continue;
      const key = info.declPath.node;
      if (!byStatement.has(key)) byStatement.set(key, []);
      byStatement.get(key).push(info);
    }

    for (const [, infos] of byStatement) {
      const [{ declPath, isAssignment, isCatchClause }] = infos;

      if (isCatchClause) {
        emitCatchClause(infos, declPath.node);
        continue;
      }

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

      function propKeySource(p) {
        return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
      }

      // when the init expression is retained in emitPolyfilled output (instance dispatch
      // receiver / rest objRef), polyfill any global identifiers it references so older
      // engines don't ReferenceError. two cases handled:
      //   1. whole chain resolves to a known polyfillable global (`globalThis.Array`) -
      //      replace entire init with the polyfill binding (`_Array`)
      //   2. proxy-global root with unknown leaf (`globalThis.unknownArr`) - replace just
      //      the root identifier in-place via byte-precise slice so the rest of the chain
      //      text (`.unknownArr`) survives for instance dispatch
      // returns the polyfilled init source or null when no substitution applies
      function polyfillInitGlobals(info) {
        const initNode = unwrapParens(info.initNode);
        const leafName = info.initIdentName || globalProxyMemberName(initNode);
        if (leafName) {
          const leafPolyfill = resolvePure({ kind: 'global', name: leafName }, null);
          if (leafPolyfill) return injectPureImport(leafPolyfill.entry, leafPolyfill.hintName);
        }
        if (info.initStart === undefined) return null;
        const proxyRoot = findProxyGlobal(initNode);
        if (!proxyRoot) return null;
        const rootPolyfill = resolveGlobalPolyfill(proxyRoot.name);
        if (!rootPolyfill) return null;
        const rootBinding = injectPureImport(rootPolyfill.entry, rootPolyfill.hintName);
        const offset = proxyRoot.start - info.initStart;
        return info.initSrc.slice(0, offset) + rootBinding
          + info.initSrc.slice(offset + (proxyRoot.end - proxyRoot.start));
      }

      function emitPolyfilled(info, parts, deferredSEs) {
        const { entries, allProps, initSrc, initIdentName, initStart, initEnd, scopeSnapshot } = info;
        let initTransformed = (initStart !== undefined && initEnd !== undefined
            ? transforms.extractContent(initStart, initEnd) : null) ?? initSrc;
        for (const e of entries) {
          if (e.propNode.computed) e.polyfillKeyContent = transforms.extractContent(e.propNode.key.start, e.propNode.key.end);
        }
        const polyfillKeys = new Set(entries.map(e => e.propNode));
        const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
        const remaining = allProps.filter(p => !polyfillKeys.has(p));
        const hasInstance = entries.some(e => e.kind === 'instance');
        const resolvedGlobalName = initIdentName || globalProxyMemberName(unwrapParens(info.initNode));
        // gate global-identifier substitution on init-being-used to avoid emitting unused
        // proxy-global imports for the all-bindings-discarded case (`const { from } = globalThis`)
        const initIsUsed = remaining.length > 0 || hasRest || hasInstance;
        if (initIsUsed && initTransformed === initSrc) {
          const polyfilled = polyfillInitGlobals(info);
          if (polyfilled !== null) initTransformed = polyfilled;
        }
        const needsMemo = hasInstance && !resolvedGlobalName && (entries.length > 1 || remaining.length > 0 || hasRest);
        let objRef = initTransformed;
        if (needsMemo && initTransformed) {
          objRef = injector.generateLocalRef();
          parts.push(`${ memoPrefix }${ objRef } = ${ initTransformed }`);
        }

        for (const e of entries) {
          const isInstance = e.kind === 'instance' && initSrc;
          const valueSrc = isInstance ? `${ e.binding }(${ objRef })` : e.binding;
          if (e.defaultSrc) {
            let ref = null;
            if (isInstance) ref = scopeTracker.genRef(scopeSnapshot);
            const test = ref ? `(${ ref } = ${ valueSrc })` : valueSrc;
            parts.push(`${ stmtPrefix }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ ref || valueSrc }`);
          } else {
            parts.push(`${ stmtPrefix }${ e.localName } = ${ valueSrc }`);
          }
        }

        if (!hasInstance && !hasRest && remaining.length === 0 && initSrc
            && mayHaveSideEffects(info.initNode)) {
          deferredSEs.push(isForInit
              ? `${ injector.generateLocalRef() } = ${ initTransformed }`
              : initTransformed);
        }

        const entryByProp = hasRest ? new Map(entries.map(e => [e.propNode, e])) : null;
        const rebuiltProps = hasRest
            ? allProps.map(p => {
              const e = entryByProp.get(p);
              if (!e) return nodeSrc(p);
              const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : propKeySource(p);
              return `${ keySrc }: ${ injector.generateUnusedName() }`;
            })
            : remaining.map(p => nodeSrc(p));
        if (rebuiltProps.length > 0) {
          parts.push(isAssignment
              ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
              : `${ stmtPrefix }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
        }
      }

      const parts = [];
      const deferredSEs = [];
      if (isAssignment) {
        for (const info of infos) emitPolyfilled(info, parts, deferredSEs);
      } else {
        const polyfilledByDecl = new Map(infos.map(i => [i.declaratorPath.node, i]));
        for (const dec of declPath.node.declarations) {
          const info = polyfilledByDecl.get(dec);
          if (info) emitPolyfilled(info, parts, deferredSEs);
          else parts.push(`${ stmtPrefix }${ nodeSrc(dec) }`);
        }
      }
      if (deferredSEs.length) parts.unshift(...deferredSEs);

      if (isForInit) {
        transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
      } else {
        transforms.add(replaceNode.start, replaceNode.end,
          wrapBodylessIfMulti(`${ parts.join(';\n') };`, parts.length > 1, declPath));
      }
    }
  }

  return {
    applyDestructuringTransforms,
    applySynthSwaps,
    canFullyConsumeProxyDeclarator,
    handleDestructuringPure,
  };
}
