import { getEntrySource, mayBeEntryStatement } from '@core-js/polyfill-provider/detect-usage/entries';
import { babelAdapter } from './detect-usage.js';

// detect every entry-import shape in a program. recognised shapes:
//   - ESM `import 'core-js/...'` ImportDeclaration at top level
//   - top-level `require('core-js/...')` ExpressionStatement
//   - top-level `await import('core-js/...')` ExpressionStatement - bare `import()` is not one
// scanning `programPath.get('body')` directly (instead of a traverse with visitors)
// has two effects: (1) deeper-nested call sites are skipped, since they're NOT entry
// imports by design, and (2) type-only ImportDeclarations nested inside
// `declare module "x" { import ... }` blocks - which TypeScript elides at runtime but
// babel-traverse still walks before `@babel/preset-typescript` strips them - never
// reach the callback. unplugin's `detectEntries` already iterates `ast.body` only, so
// the body-only walk here keeps the two adapters symmetric
export default function runEntryDetection(programPath, onEntry) {
  // the pre-filter is the resolver's OWN accepted-type set, asked through its predicate rather
  // than re-listed here: it only skips the adapter / scope work on shapes `getEntrySource` would
  // reject anyway, and a local copy of the list is what let one emitter silently miss a newly
  // accepted arm the other already handled
  for (const bodyPath of programPath.get('body')) {
    if (!mayBeEntryStatement(bodyPath.node)) continue;
    const source = getEntrySource(bodyPath.node, babelAdapter, bodyPath.scope);
    if (source !== null) onEntry(source, bodyPath);
  }
}
