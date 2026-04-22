import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { declaresRequireBinding } from '@core-js/polyfill-provider/helpers';
import { estreeAdapter } from './detect-usage.js';

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

  for (const node of toRemove) removeTopLevelStatement(ms, node);
  return toRemove.length > 0;
}

// chars that, when starting the next statement, force a call/index/divide/concat/tag
// interpretation against the previous expression - ASI doesn't fire between them
const ASI_HAZARD_STARTS = new Set(['(', '[', '/', '+', '-', '`']);

// prev ending in `;` is the only case we can cheaply prove safe - `}` can close a function/class
// expr and still fuse (`function(){}`hello`` is a tag call)
function guardAsiAtBoundary(ms, prevEnd, removalEnd) {
  let nextIdx = removalEnd;
  while (nextIdx < ms.original.length && /\s/.test(ms.original[nextIdx])) nextIdx++;
  if (!ASI_HAZARD_STARTS.has(ms.original[nextIdx])) return;
  let prevIdx = prevEnd - 1;
  while (prevIdx >= 0 && /\s/.test(ms.original[prevIdx])) prevIdx--;
  if (prevIdx < 0 || ms.original[prevIdx] === ';') return;
  ms.prependLeft(removalEnd, ';');
}

// drops a top-level statement including its trailing newline so it doesn't leave a blank gap;
// must not eat the following line's indent. oxc extends `ImportDeclaration.end` to include
// a trailing `;` - when that `;` was actually guarding the next statement's leading
// `(` / `[` / `` ` `` / ..., removal silently turns `var x = 1\n(fn)()` into a call, so
// `guardAsiAtBoundary` re-injects a `;` when the boundary would fuse
export function removeTopLevelStatement(ms, node) {
  let { end } = node;
  while (end < ms.original.length && (ms.original[end] === ' ' || ms.original[end] === '\t')) end++;
  if (ms.original[end] === '\r' && ms.original[end + 1] === '\n') end += 2;
  else if (ms.original[end] === '\n' || ms.original[end] === '\r') end++;
  ms.remove(node.start, end);
  guardAsiAtBoundary(ms, node.start, end);
}
