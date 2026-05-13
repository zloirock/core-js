import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { declaresRequireBinding } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { estreeAdapter } from './detect-usage.js';
import { isLineTerminator, skipBlockComment } from './plugin-helpers.js';

// detect and transform core-js entry imports (entry-global mode)
export default function detectEntries(ast, { getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  const toRemove = [];
  // stub scope: getEntrySource only consults `hasBinding('require')` to skip shadowed calls
  const shadowScope = declaresRequireBinding(ast.body) ? { hasBinding: () => true } : null;

  for (const node of ast.body) {
    const source = getEntrySource(node, estreeAdapter, shadowScope);
    if (source === null) continue;
    if (isDisabled(node)) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    injectModulesForEntry(entry);
    toRemove.push(node);
  }

  const removeStatement = createTopLevelStatementRemover(ms);
  for (const node of toRemove) removeStatement(node);
  return toRemove.length > 0;
}

// chars that, when starting the next statement, force a call/index/divide/concat/tag
// interpretation against the previous expression - ASI doesn't fire between them
const ASI_HAZARD_STARTS = new Set(['(', '[', '/', '+', '-', '`']);

// advance past whitespace and line/block comments; returns the first significant char index.
// without comment-skip, a `/` starting a line comment would trip the ASI_HAZARD check (`/` is
// also the hazard char for division/regex), emitting a spurious `;` before a comment
function skipWhitespaceAndComments(src, pos) {
  let p = pos;
  for (;;) {
    while (p < src.length && /\s/.test(src[p])) p++;
    if (src[p] === '/' && src[p + 1] === '/') {
      while (p < src.length && src[p] !== '\n' && src[p] !== '\r') p++;
      continue;
    }
    if (src[p] === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      if (p === src.length) return p;
      continue;
    }
    return p;
  }
}

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

  // walks backward from `fromIdx` over whitespace AND chunks already in `removedRanges`,
  // landing on the first source char that survives into output. -1 means the boundary
  // touches start-of-file (no preceding statement to terminate)
  function findPrevSignificantChar(fromIdx) {
    let p = fromIdx;
    while (p >= 0) {
      const range = findRangeContaining(removedRanges, p);
      if (range) {
        p = range[0] - 1;
        continue;
      }
      if (!/\s/.test(src[p])) return p;
      p--;
    }
    return -1;
  }

  function guardAsiAtBoundary(start, end) {
    const nextIdx = skipWhitespaceAndComments(src, end);
    if (!ASI_HAZARD_STARTS.has(src[nextIdx])) return;
    const prevIdx = findPrevSignificantChar(start - 1);
    if (prevIdx < 0 || src[prevIdx] === ';') return;
    ms.prependLeft(end, ';');
  }

  return function remove(node) {
    let { end } = node;
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++;
    // ES spec LineTerminator covers LF / CR / CRLF / LS (U+2028) / PS (U+2029). without LS/PS
    // handling, a bundler-emitted separator between the removed import and the following line
    // would stay behind and confuse downstream tooling
    if (src[end] === '\r' && src[end + 1] === '\n') end += 2;
    else if (isLineTerminator(src[end])) end++;
    ms.remove(node.start, end);
    guardAsiAtBoundary(node.start, end);
    removedRanges.push([node.start, end]);
  };
}

function findRangeContaining(removedRanges, pos) {
  for (const range of removedRanges) if (pos >= range[0] && pos < range[1]) return range;
  return null;
}
