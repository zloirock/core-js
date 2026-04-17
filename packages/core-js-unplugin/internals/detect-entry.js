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

// consume trailing whitespace + one newline so the removed line doesn't leave a blank gap;
// must not eat the following line's indent
export function removeTopLevelStatement(ms, node) {
  let { end } = node;
  while (end < ms.original.length && (ms.original[end] === ' ' || ms.original[end] === '\t')) end++;
  if (ms.original[end] === '\r' && ms.original[end + 1] === '\n') end += 2;
  else if (ms.original[end] === '\n' || ms.original[end] === '\r') end++;
  ms.remove(node.start, end);
}
