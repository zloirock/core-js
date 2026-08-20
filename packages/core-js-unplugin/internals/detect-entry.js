import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import {
  declaresRequireBinding,
  extractIndirectRequireSEPrefix,
  resolveBatchDirectivePromotionPolicy,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { consumeOneLineEnding, injectionFusesLeft, isExprStmtHazardStart } from './plugin-helpers.js';
import { prevSignificantPos, skipGap } from './text-scan.js';

// entry-global mode, the ENGINE-NEUTRAL half: which top-level `import 'core-js/...'` /
// `require('core-js/...')` statements resolve to module sets, and what disposition each
// slot gets. partitioned in two passes so the batch sees every candidate before any commit
// (mirrors babel-plugin's traversal where programExit alters the live body per visitor -
// the simulation here closes that gap). both engines apply the returned plan: the text
// engine through the batch rewriter below, the AST engine by splicing the body
export function planEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled }) {
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
  return { toRemove, toReplaceWithNoop, found: toRemove.length + toReplaceWithNoop.length > 0 };
}

// the text engine's application of the plan
export default function detectEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  const { toRemove, toReplaceWithNoop, found } = planEntries(ast, { adapter, getCoreJSEntry, injectModulesForEntry, isDisabled });
  const rewriter = createTopLevelStatementRewriter(ms);
  for (const node of toRemove) rewriter.remove(node);
  for (const node of toReplaceWithNoop) rewriter.replaceWithNoop(node);
  rewriter.apply();
  return found;
}

// the batch rewriter of top-level statement slots, shared by the entry-global pass and the
// usage-mode sweep over user core-js imports so the seam cannot diverge. two requests, one
// of which may turn into a third disposition:
//   `remove(node)`          - the statement goes, with its trailing horizontal space and ONE line
//                             ending (the user's blank-line layout survives)
//   `replaceWithNoop(node)` - the statement becomes the `0;` directive terminator
//   an indirect-require entry (`(spy(), require)('core-js/...')`) handed to either KEEPS its
//   observable prefix as standalone statements instead; both return that prefix (`[]` when the
//   statement carried none - the caller learns which disposition the node got)
// the prefix is kept by POINT edits around the prefix elements, never by overwriting the
// statement's whole span: the AST nodes of those elements stay live - the usage sweep re-points
// the statement at them and the visitors may still rewrite inside (`(arr.at(0), require)(...)`
// gets its `at` polyfilled) - and an edit inside an overwritten chunk is one MagicString
// refuses ("cannot split a chunk that has already been edited"). the element's own span is
// never written: the terminators, the gap removals and the hazard parens all attach outside it
// `apply()` writes the batch: the removals and overwrites first, then the ASI guards, decided
// over the FINAL surviving text. a removal makes two formerly separated statements neighbours,
// and a kept prefix re-roots its line on a char the parser never saw there; when the first
// surviving char after the seam is a hazard start and the last surviving char before it is not
// a terminator, a `;` lands at the seam. "surviving" is read through the batch's own
// disposition map - a neighbour removed in the same batch is skipped over, a `0;` counts as its
// `0` and its `;`, a kept prefix as its first and last chars - so the guards neither miss a seam
// (the prev `;` was on a removed import) nor double it (two adjacent removals share one seam),
// and every `;` is written AFTER every removal: a `;` attached to a boundary and a later
// `remove()` ending there once erased each other. each disposition maps by statement start /
// last char, so a batch of K statements costs O(K), not a scan of K ranges per boundary
export function createTopLevelStatementRewriter(ms) {
  const src = ms.original;
  // node.start -> disposition; the index of a statement's last source char -> disposition
  // (the backward walk lands there); dispositions in request order
  const byStart = new Map();
  const byLastChar = new Map();
  const order = [];

  function dispose(node, disposition) {
    byStart.set(node.start, disposition);
    byLastChar.set(node.end - 1, disposition);
    order.push(disposition);
  }

  // [start, consumed-end] a removal covers: the node plus trailing horizontal space and one line ending
  function removalRange(node) {
    let { end } = node;
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++;
    return [node.start, consumeOneLineEnding(src, end)];
  }

  // `first` / `last`: the chars a disposition contributes at its two ends (a removal contributes
  // none). a prefix element that starts with `{` / `function` / `class` would reparse as a
  // block / declaration at statement position - it is parenthesized, so it starts on `(`
  function keepSEPrefix(node) {
    const sePrefix = extractIndirectRequireSEPrefix(node);
    if (sePrefix.length) {
      const elements = sePrefix.map(e => ({ start: e.start, end: e.end, wrapped: isExprStmtHazardStart(src.slice(e.start, e.end)) }));
      dispose(node, { kind: 'prefix', node, elements, first: elements[0].wrapped ? '(' : src[elements[0].start], last: ';' });
    }
    return sePrefix;
  }

  function remove(node) {
    const sePrefix = keepSEPrefix(node);
    if (!sePrefix.length) dispose(node, { kind: 'remove', node, range: removalRange(node) });
    return sePrefix;
  }

  function replaceWithNoop(node) {
    const sePrefix = keepSEPrefix(node);
    if (!sePrefix.length) dispose(node, { kind: 'noop', node, first: '0', last: ';' });
    return sePrefix;
  }

  // the next surviving statement at or after `pos`, skipping gaps and the batch's own removals:
  // the char it starts with (`''` at the end of the file) and the boundary it starts after - the
  // end of the last removed range before it, where a seam's `;` lands
  function nextSurviving(pos) {
    let boundary = pos;
    for (let p = skipGap(src, pos); p < src.length; p = skipGap(src, p)) {
      const disposition = byStart.get(p);
      if (!disposition) return { char: src[p], boundary };
      if (disposition.kind !== 'remove') return { char: disposition.first, boundary };
      [, boundary] = disposition.range;
      p = boundary;
    }
    return { char: '', boundary };
  }

  // the seams `apply()` put a `;` on, by boundary
  const guardedBoundaries = new Set();

  // the previous surviving statement's last char before `pos`, as `{ pos, char }`; `pos` -1 and
  // `''` at the start of the file. for a replacement the char is what the replacement ends with,
  // at the statement's own last position; for a removed run whose seam already carries a `;`
  // the char is that terminator
  function prevSurviving(pos) {
    for (let p = prevSignificantPos(src, pos); p >= 0; p = prevSignificantPos(src, p)) {
      const disposition = byLastChar.get(p);
      if (!disposition) return { pos: p, char: src[p] };
      if (disposition.kind !== 'remove') return { pos: p, char: disposition.last };
      if (guardedBoundaries.has(nextSurviving(disposition.range[1]).boundary)) return { pos: p, char: ';' };
      p = disposition.node.start;
    }
    return { pos: -1, char: '' };
  }

  function apply() {
    for (const disposition of order) {
      const { kind, node } = disposition;
      if (kind === 'remove') ms.remove(...disposition.range);
      else if (kind === 'noop') ms.overwrite(node.start, node.end, '0;');
      else {
        // everything between the kept elements goes; each element ends its own statement. the
        // terminator rides the gap overwrite, or attaches to the following chunk when no gap exists
        const { elements } = disposition;
        if (node.start < elements[0].start) ms.remove(node.start, elements[0].start);
        for (let i = 0; i < elements.length; i++) {
          const nextStart = i + 1 < elements.length ? elements[i + 1].start : node.end;
          const terminator = i + 1 < elements.length ? ';\n' : ';';
          if (elements[i].end < nextStart) ms.overwrite(elements[i].end, nextStart, terminator);
          else ms.appendRight(elements[i].end, terminator);
        }
      }
    }
    // the hazard parens and the ASI guards, over the final text - all attached OUTSIDE the
    // kept elements (a later in-element rewrite keeps them). a seam is identified by its previous
    // surviving char's position: every removal sharing it shares the one `;`, placed at the run's
    // right edge (the boundary the next survivor starts after)
    const guardedSeams = new Set();
    for (const disposition of order) {
      const { kind, node } = disposition;
      if (kind === 'noop') continue;
      let boundary;
      let first;
      if (kind === 'prefix') {
        for (const element of disposition.elements) {
          if (!element.wrapped) continue;
          ms.prependLeft(element.start, '(');
          ms.appendRight(element.end, ')');
        }
        boundary = node.start;
        first = disposition.first;
      } else ({ char: first, boundary } = nextSurviving(disposition.range[1]));
      const prev = prevSurviving(node.start);
      if (prev.pos < 0 || guardedSeams.has(prev.pos) || !injectionFusesLeft(first, prev.char)) continue;
      guardedSeams.add(prev.pos);
      guardedBoundaries.add(boundary);
      ms.prependLeft(boundary, ';');
    }
  }

  // the previous surviving statement's last char before `pos`, for the channels that put text at a
  // statement head AFTER this batch (the queue's `(`-leading renders, the lifted destructure SE):
  // their ASI question is the same one `apply()` asks, and its answer has to see through the
  // removals too - a `;`-terminated import between an unterminated statement and a `(`-leading
  // render is gone by the time that render prints, and the two fuse. a seam `apply()` already
  // guarded reads as terminated, so the later channel does not double the `;`
  function prevSurvivingChar(pos) {
    return prevSurviving(pos).char;
  }

  return { remove, replaceWithNoop, apply, prevSurvivingChar };
}
