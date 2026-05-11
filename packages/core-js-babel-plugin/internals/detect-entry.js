import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { babelAdapter } from './detect-usage.js';

// detect every entry-import shape in a program: top-level `require('core-js/...')` /
// `import('core-js/...')` ExpressionStatements (scanned manually since deeper-nested
// call sites are NOT entry imports) AND ESM `import 'core-js/...'` ImportDeclarations
// (handled by normal traversal). single function unifies the dual dispatch so consumers
// don't thread a visitor object through manual pre-call + filtered traverse
export default function runEntryDetection(programPath, onEntry) {
  // `getEntrySource` only recognises ImportDeclaration + ExpressionStatement
  // (`require(...)` / `await import(...)`); other shapes short-circuit to null
  function visit(path) {
    const source = getEntrySource(path.node, babelAdapter, path.scope);
    if (source !== null) onEntry(source, path);
  }
  // top-level ExpressionStatement scan: nested ones (inside function bodies, conditionals)
  // are NOT entry-import shapes and must NOT be visited - hence the body-only loop
  // instead of a wildcard `ExpressionStatement` visitor in the traverse below
  for (const bodyPath of programPath.get('body')) {
    if (bodyPath.isExpressionStatement()) visit(bodyPath);
  }
  programPath.traverse({ ImportDeclaration: visit });
}
