import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import {
  declaresRequireBinding,
  extractIndirectRequireSEPrefix,
  resolveBatchDirectivePromotionPolicy,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  ASI_HAZARD_STARTS,
  consumeOneLineEnding,
  injectionFusesLeft,
  parenthesizeExprStmtHazard,
  prevSignificantPos,
  skipGap,
} from './plugin-helpers.js';

// entry-global mode: rewrite top-level `import 'core-js/...'` / `require('core-js/...')`
// statements into the resolved per-feature module set. partitioned in two passes so the
// batch sees every candidate before any commit (mirrors babel-plugin's traversal where
// programExit alters the live body per visitor - the simulation here closes that gap)
export default function detectEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  // getEntrySource only consults `hasBinding('require')`; stub-scope is enough
  const shadowScope = declaresRequireBinding(ast.body) ? { hasBinding: () => true } : null;

  // pass 1: collect candidate body indices, inject modules eagerly (the per-entry module
  // set is identical whether the slot ends up removed or replaced by `0;`)
  const candidateIndices = [];
  let injectedModules = 0;
  for (let idx = 0; idx < ast.body.length; idx++) {
    const node = ast.body[idx];
    const source = getEntrySource(node, adapter, shadowScope);
    if (source === null || isDisabled(node)) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    injectedModules += injectModulesForEntry(entry);
    candidateIndices.push(idx);
  }

  // pass 2: right-to-left simulated walk decides which slots stay as `0;` directive
  // terminators (see `resolveBatchDirectivePromotionPolicy` docstring)
  const { toRemove, toReplaceWithNoop } = resolveBatchDirectivePromotionPolicy({
    body: ast.body,
    candidateIndices,
    // a non-empty injected module block lands after the prologue and blocks promotion
    // for every removed entry - the `0;` placeholder matters only for zero-module files
    injectedImportsBreakPrologue: injectedModules > 0,
  });

  const removeStatement = createTopLevelStatementRemover(ms);
  // indirect-require SE prefix preservation: `(spy(), require)('core-js/...')` passes entry
  // detection via the SequenceExpression tail peel, but raw removal would silently drop the
  // observable prefix slots. emit the prefix as standalone statements (sliced verbatim from
  // ms.original so formatting / comments survive). returns true when SE prefix consumed the
  // slot. checked in BOTH buckets defensively: a future hasPriorDirective propagation could
  // classify an SE entry as `toReplaceWithNoop`, and the prefix replacement already breaks
  // the prologue so `0;` placeholder is never needed when SE prefix is present
  function writeSEPrefixIfAny(node) {
    const sePrefix = extractIndirectRequireSEPrefix(node);
    if (!sePrefix.length) return false;
    const text = sePrefix.map(e => `${ parenthesizeExprStmtHazard(ms.original.slice(e.start, e.end)) };`).join('\n');
    // the rewritten prefix can START with a fusion char (`+spy()` / `[spy()]` / a parenthesised
    // `({ ... })`) that fuses into the prev `;`-less statement. the node parsed AS-DETECTED separate
    // because its original leading `(` ASI-split a postfix `++` / `--` prev (`UpdateExpression Arguments`
    // is a SyntaxError), but the rewritten first char carries no such guarantee - guard it like a removal
    removeStatement.guardInjectionLeftBoundary(node.start, text);
    ms.overwrite(node.start, node.end, text);
    return true;
  }
  // pre-seed the plain removals (SE-prefix entries are rewritten in place, not removed) so the ASI
  // boundary scan treats the whole batch as gone and does not read a not-yet-removed leftward entry
  removeStatement.seed(toRemove.filter(node => !extractIndirectRequireSEPrefix(node).length));
  for (const node of toRemove) {
    if (!writeSEPrefixIfAny(node)) removeStatement(node);
  }
  for (const node of toReplaceWithNoop) {
    if (!writeSEPrefixIfAny(node)) ms.overwrite(node.start, node.end, '0;');
  }
  return toRemove.length + toReplaceWithNoop.length > 0;
}

// factory: `remove(node)` closure that drops a top-level statement plus its trailing
// newline AND injects `;` when the resulting boundary would fuse the next statement into
// the previous one. each closure owns `removedRanges` so the backward scan can skip past
// siblings removed earlier in the same batch - their trailing `;` would otherwise look
// like the active terminator. oxc extends ImportDeclaration.end past the trailing `;`,
// so removing a guarded import (`import 'x';\n(fn)()`) can fuse without our injection
export function createTopLevelStatementRemover(ms) {
  const src = ms.original;
  const removedRanges = [];
  // positions where this batch has already injected `;` at a removal boundary. forward
  // hazard-scan from a later removal that jumps over an injected range sees the `;` as
  // an effective terminator at the right boundary and skips its own injection - else two
  // adjacent removals would both inject (`;;` at the leftmost boundary)
  const injectedSemiAt = new Set();

  // skip past any removed range covering `p`; returns the first position outside the
  // range in the walk direction (negative = backward, positive = forward), or `p`
  // unchanged when no range covers it. shared between the prev / next significant-char
  // walkers so both stay in sync about what "already-removed" means
  function skipPastRemovedRange(p, direction) {
    const range = findRangeContaining(removedRanges, p);
    if (!range) return p;
    return direction > 0 ? range[1] : range[0] - 1;
  }

  // backward walk over whitespace + comments + already-removed ranges; returns the first
  // SURVIVING source char index (-1 = start-of-file). re-entry on a hit inside a range
  // is necessary: `prevSignificantPos` returns a comment-aware position that may itself
  // land inside an earlier batch removal
  function findPrevSignificantChar(fromIdx) {
    let p = fromIdx;
    while (p >= 0) {
      const skipped = skipPastRemovedRange(p, -1);
      if (skipped !== p) {
        p = skipped;
        continue;
      }
      const sig = prevSignificantPos(src, p + 1);
      if (sig < 0) return -1;
      const sigSkipped = skipPastRemovedRange(sig, -1);
      if (sigSkipped !== sig) {
        p = sigSkipped;
        continue;
      }
      return sig;
    }
    return -1;
  }

  // forward walk over whitespace + comments + already-removed ranges. symmetric to
  // `findPrevSignificantChar` - the real caller iterates `toRemove` in descending body
  // position so by the time we process the leftmost sibling, the rightmost is already in
  // `removedRanges`. without the range-aware jump, raw `skipGap` lands on the soon-to-be
  // erased neighbour's text and reads it as non-hazard, silently skipping the `;` guard
  function findNextSignificantChar(fromIdx) {
    let p = fromIdx;
    while (p < src.length) {
      const skipped = skipPastRemovedRange(p, 1);
      if (skipped !== p) {
        p = skipped;
        continue;
      }
      const sig = skipGap(src, p);
      if (sig >= src.length) return src.length;
      const sigSkipped = skipPastRemovedRange(sig, 1);
      if (sigSkipped !== sig) {
        p = sigSkipped;
        continue;
      }
      return sig;
    }
    return src.length;
  }

  // any `;` injection at a removed-range boundary inside (from, to) acts as the new
  // effective terminator at the right edge - no need to re-inject a duplicate on the
  // outer boundary. checks all known injection points, narrow to-range walk only
  function hasInjectedSemiBetween(from, to) {
    for (const pos of injectedSemiAt) if (pos > from && pos <= to) return true;
    return false;
  }

  // `skipGap` is comment-aware so a leading `//` on the next line isn't mis-classified
  // as the regex/division ASI hazard char `/`. prev ending in `;` is the only cheaply-
  // provable-safe case; `}` can close a function/class expr that fuses with a tag call
  // (`function(){}`hello``) so we conservatively guard there too
  function guardAsiAtBoundary(start, end) {
    const nextIdx = findNextSignificantChar(end);
    if (nextIdx >= src.length || !ASI_HAZARD_STARTS.has(src[nextIdx])) return;
    // jumped over a removed range whose own boundary already carries an injected `;` -
    // that `;` is the active terminator for the next significant char, no double-inject
    if (hasInjectedSemiBetween(end, nextIdx)) return;
    const prevIdx = findPrevSignificantChar(start - 1);
    if (prevIdx < 0 || src[prevIdx] === ';') return;
    ms.prependLeft(end, ';');
    injectedSemiAt.add(end);
  }

  // guard the LEFT boundary of an in-place text injection (the SE-prefix rewrite overwrites a detected
  // `(prefix, require)('core-js/...')` node with its prefix statements). where a removal fuses the NEXT
  // surviving char with the prev, here the INJECTED text's FIRST char meets the prev surviving char, and
  // the node-detected-as-separate guarantee does NOT carry over: a postfix `++` / `--` prev ASI-splits
  // from the node's original leading `(` (spec bans `UpdateExpression Arguments`) yet a rewritten
  // `+spy()` / `[spy()]` prefix fuses into `prev + ...` / `prev[...]`. range-aware so a removed sibling
  // between the prev statement and this node is skipped to the real surviving prev char
  function guardInjectionLeftBoundary(start, text) {
    const prevIdx = findPrevSignificantChar(start - 1);
    if (prevIdx < 0 || !injectionFusesLeft(text[0], src[prevIdx])) return;
    // a left-neighbour removal in this batch may already have injected a `;` into the gap
    if (hasInjectedSemiBetween(prevIdx, start)) return;
    ms.prependLeft(start, ';');
    injectedSemiAt.add(start);
  }

  // [start, consumed-end] a removal covers: the node plus trailing horizontal space and one
  // line ending. shared by `seed` (pre-population) and `remove` so both agree on the range
  function removalRange(node) {
    let { end } = node;
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++;
    return [node.start, consumeOneLineEnding(src, end)];
  }

  // pre-populate removedRanges for the whole removal batch so the prev / next significant-char
  // walkers skip a sibling that is ALSO being removed but has not been processed yet (the caller
  // walks rightmost-first, so leftward siblings are not in removedRanges when their right neighbour
  // injects). without seeding, the backward scan reads a leftward to-be-removed entry's text and
  // injects a spurious `;`. duplicate ranges (remove re-pushes) are harmless for containment checks
  function seed(nodes) {
    for (const node of nodes) removedRanges.push(removalRange(node));
  }

  function remove(node) {
    const [start, end] = removalRange(node);
    ms.remove(start, end);
    guardAsiAtBoundary(start, end);
    removedRanges.push([start, end]);
  }
  remove.seed = seed;
  remove.guardInjectionLeftBoundary = guardInjectionLeftBoundary;
  return remove;
}

function findRangeContaining(removedRanges, pos) {
  for (const range of removedRanges) if (pos >= range[0] && pos < range[1]) return range;
  return null;
}
