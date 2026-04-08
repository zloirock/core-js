import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { estreeAdapter } from './detect-usage.js';

// does a binding pattern bind an Identifier named `require` anywhere in its tree?
function patternBindsRequire(node) {
  if (!node) return false;
  switch (node.type) {
    case 'Identifier': return node.name === 'require';
    case 'ObjectPattern':
      for (const p of node.properties) {
        if (p.type === 'RestElement') {
          if (patternBindsRequire(p.argument)) return true;
        } else if (patternBindsRequire(p.value)) return true;
      }
      return false;
    case 'ArrayPattern':
      for (const el of node.elements) if (patternBindsRequire(el)) return true;
      return false;
    case 'AssignmentPattern':
      return patternBindsRequire(node.left);
    case 'RestElement':
      return patternBindsRequire(node.argument);
  }
  return false;
}

// scan top-level statements for any binding named `require` (var/let/const/function/class/import)
// - when shadowed, `require('core-js/...')` calls are user code, not entry points
function declaresRequire(body) {
  for (const node of body) {
    switch (node.type) {
      case 'VariableDeclaration':
        for (const d of node.declarations) if (patternBindsRequire(d.id)) return true;
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
  // stub scope: getEntrySource only consults `hasBinding('require')` to skip shadowed calls
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
    // also consume trailing whitespace + line endings to avoid leaving an orphan blank line
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
