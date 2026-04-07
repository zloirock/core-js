import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { estreeAdapter } from './detect-usage.js';

// detect and transform core-js entry imports (entry-global mode)
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
    // skip trailing whitespace AND any number of line endings after the removed statement so
    // that removing an entry import does not leave an orphan blank line or trailing CRLF
    while (end < ms.original.length) {
      const ch = ms.original[end];
      if (ch === ' ' || ch === '\t') end++;
      else if (ch === '\r' && ms.original[end + 1] === '\n') end += 2;
      else if (ch === '\n' || ch === '\r') end++;
      else break;
    }
    ms.remove(node.start, end);
  }
  return toRemove.length > 0;
}
