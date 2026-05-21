import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { declaresRequireBinding, wouldPromoteDirectiveAfterRemoval } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { consumeOneLineEnding, prevSignificantPos, skipGap } from './plugin-helpers.js';

// detect and transform core-js entry imports (entry-global mode). `adapter` is the
// plugin-instance estree adapter (`getEntrySource` only consults `isStringLiteral` and
// the stub `hasBinding('require')` - no polyfillHint dependency, but threading the
// per-instance adapter keeps the call symmetric with usage-pipeline detection)
export default function detectEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  // toRemove: nodes to drop entirely (the common case).
  // toReplaceWithNoop: directive-promotion guard - replace with `0;` instead of removing.
  // when an entry sits between a real directive and a not-yet-directive string literal,
  // bare removal would let the engine re-parse the second literal as a directive on re-parse
  const toRemove = [];
  const toReplaceWithNoop = [];
  // stub scope: getEntrySource only consults `hasBinding('require')` to skip shadowed calls
  const shadowScope = declaresRequireBinding(ast.body) ? { hasBinding: () => true } : null;

  for (let idx = 0; idx < ast.body.length; idx++) {
    const node = ast.body[idx];
    const source = getEntrySource(node, adapter, shadowScope);
    if (source === null) continue;
    if (isDisabled(node)) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    injectModulesForEntry(entry);
    if (wouldPromoteDirectiveAfterRemoval(ast.body, idx)) toReplaceWithNoop.push(node);
    else toRemove.push(node);
  }

  const removeStatement = createTopLevelStatementRemover(ms);
  for (const node of toRemove) removeStatement(node);
  for (const node of toReplaceWithNoop) ms.overwrite(node.start, node.end, '0;');
  return toRemove.length + toReplaceWithNoop.length > 0;
}

// chars that, when starting the next statement, force a call/index/divide/concat/tag/
// type-assertion interpretation against the previous expression - ASI doesn't fire
// between them. `<` covers TypeScript `<T>foo` TypeAssertion AND JSX top-level elements:
// both could fuse the previous statement as `prev < T > foo` (comparison) when the
// removal collapses the LT separator. spurious `;` before a real less-than comparison
// is harmless (`a; <b` parses as empty-statement + less-than, same semantics).
//
// the inverse predicate is `FUSES_WITH_OPEN_PAREN` (plugin-helpers.js): that one asks
// "does the previous char fuse with an OPEN `(` from the next statement". the two sets
// are deliberately ASYMMETRIC - this set lists STARTING chars that fuse with any
// fusion-capable prev; `FUSES_WITH_OPEN_PAREN` lists ENDING chars that fuse only with
// `(` (the broadest single hazard). over-injecting `;` on non-hazard prev (e.g. when
// prev was `;` already) is filtered downstream by `guardAsiAtBoundary`'s prev-char check
const ASI_HAZARD_STARTS = new Set(['(', '[', '/', '+', '-', '`', '<']);

// factory: returns a `remove(node)` closure that drops a top-level statement (including its
// trailing newline so it doesn't leave a blank gap) and guards against ASI fusion across the
// batch. each closure owns its `removedRanges` so the backward scan can skip past chunks
// already removed in this batch - otherwise the trailing `;` of a sibling removal would
// masquerade as the active terminator. oxc extends ImportDeclaration.end to cover the
// trailing `;` - when that `;` was actually guarding the next statement's leading
// `(` / `[` / `` ` `` / ..., removal silently turns `var x = 1\n(fn)()` into a call, so
// re-injects a `;` when the boundary would fuse. prev ending in `;` is the only case we
// can cheaply prove safe - `}` can close a function/class expr and still fuse
// (`function(){}`hello`` is a tag call)
export function createTopLevelStatementRemover(ms) {
  const src = ms.original;
  const removedRanges = [];

  // walks backward from `fromIdx` over whitespace, line / block comments, AND chunks
  // already in `removedRanges`, landing on the first SOURCE char that survives into
  // output. -1 means the boundary touches start-of-file (no preceding statement to
  // terminate). `prevSignificantPos` handles whitespace + comments; the removedRanges
  // skip handles batch removals where the trailing `;` of an earlier-removed sibling
  // would otherwise masquerade as the active terminator
  function findPrevSignificantChar(fromIdx) {
    let p = fromIdx;
    while (p >= 0) {
      const range = findRangeContaining(removedRanges, p);
      if (range) {
        p = range[0] - 1;
        continue;
      }
      const sig = prevSignificantPos(src, p + 1);
      if (sig < 0) return -1;
      // landed inside or before a previously-removed range; loop around to skip past it
      if (findRangeContaining(removedRanges, sig)) {
        p = sig;
        continue;
      }
      return sig;
    }
    return -1;
  }

  // `skipGap` (shared with usage-* pipelines) advances forward past whitespace and
  // line / block comments. without comment-skip, a `/` starting a line comment would
  // trip the ASI_HAZARD check (`/` is also the regex / division hazard char) and emit
  // a spurious `;` before a comment. line-comment terminator inside `skipGap` is the
  // full ES-spec LineTerminator set (LF/CR/LS/PS) so a U+2028-terminated comment
  // doesn't overshoot into the next line's hazard
  function guardAsiAtBoundary(start, end) {
    const nextIdx = skipGap(src, end);
    if (!ASI_HAZARD_STARTS.has(src[nextIdx])) return;
    const prevIdx = findPrevSignificantChar(start - 1);
    if (prevIdx < 0 || src[prevIdx] === ';') return;
    ms.prependLeft(end, ';');
  }

  return function remove(node) {
    let { end } = node;
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++;
    end = consumeOneLineEnding(src, end);
    ms.remove(node.start, end);
    guardAsiAtBoundary(node.start, end);
    removedRanges.push([node.start, end]);
  };
}

function findRangeContaining(removedRanges, pos) {
  for (const range of removedRanges) if (pos >= range[0] && pos < range[1]) return range;
  return null;
}
