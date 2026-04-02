import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { estreeAdapter } from './detect-usage.js';

// вetect and transform core-js entry imports (entry-global mode)
export default function detectEntries(ast, { getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  const toRemove = [];

  for (const node of ast.body) {
    const source = getEntrySource(node, estreeAdapter);
    if (source === null) continue;
    if (isDisabled(node)) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    injectModulesForEntry(entry);
    toRemove.push(node);
  }

  for (const node of toRemove) {
    let { end } = node;
    if (ms.original[end] === '\n') end++;
    else if (ms.original[end] === '\r' && ms.original[end + 1] === '\n') end += 2;
    ms.remove(node.start, end);
  }
  return toRemove.length > 0;
}
