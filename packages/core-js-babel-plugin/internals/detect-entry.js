import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { babelAdapter } from './detect-usage.js';

// detect every entry-import shape in a program: top-level `require('core-js/...')` /
// `import('core-js/...')` ExpressionStatements (scanned manually since deeper-nested
// call sites are NOT entry imports) AND ESM `import 'core-js/...'` ImportDeclarations.
// both shapes are visited via the same body-only loop - a wildcard traverse picks up
// type-only ImportDeclarations nested inside `declare module "x" { import ... }` blocks,
// which TypeScript elides at runtime but babel-traverse still walks before
// `@babel/preset-typescript` strips them. unplugin's detect-entry already scans `ast.body`
// only, so this keeps the two adapters symmetric
export default function runEntryDetection(programPath, onEntry) {
  // `getEntrySource` only recognises ImportDeclaration + ExpressionStatement
  // (`require(...)` / `await import(...)`); other shapes short-circuit to null
  for (const bodyPath of programPath.get('body')) {
    if (!bodyPath.isExpressionStatement() && !bodyPath.isImportDeclaration()) continue;
    const source = getEntrySource(bodyPath.node, babelAdapter, bodyPath.scope);
    if (source !== null) onEntry(source, bodyPath);
  }
}
