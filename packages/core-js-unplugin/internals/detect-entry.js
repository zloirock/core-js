import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { estreeAdapter } from './detect-usage.js';

// scan top-level statements for any binding named `require` (var/let/const/function/class/import)
// — when shadowed, `require('core-js/...')` calls are user code, not entry points
function declaresRequire(body) {
  for (const node of body) {
    switch (node.type) {
      case 'VariableDeclaration':
        for (const d of node.declarations) if (d.id?.type === 'Identifier' && d.id.name === 'require') return true;
        break;
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
        if (node.id?.name === 'require') return true;
        break;
      case 'ImportDeclaration':
        for (const s of node.specifiers) if (s.local?.name === 'require') return true;
        break;
    }
  }
  return false;
}

// detect and transform core-js entry imports (entry-global mode)
export default function detectEntries(ast, { getCoreJSEntry, injectModulesForEntry, isDisabled, ms }) {
  const toRemove = [];
  // synthetic scope object: getEntrySource only consults `hasBinding('require')`, so a stub
  // that always returns true is enough to suppress require-style detection
  const shadowScope = declaresRequire(ast.body) ? { hasBinding: () => true } : null;

  for (const node of ast.body) {
    const source = getEntrySource(node, estreeAdapter, shadowScope);
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
