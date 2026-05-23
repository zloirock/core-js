import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { babelAdapter } from './detect-usage.js';

// detect every entry-import shape in a program. recognised shapes:
//   - ESM `import 'core-js/...'` ImportDeclaration at top level
//   - top-level `require('core-js/...')` ExpressionStatement
//   - top-level `import('core-js/...')` ExpressionStatement
// scanning `programPath.get('body')` directly (instead of a traverse with visitors)
// has two effects: (1) deeper-nested call sites are skipped, since they're NOT entry
// imports by design, and (2) type-only ImportDeclarations nested inside
// `declare module "x" { import ... }` blocks - which TypeScript elides at runtime but
// babel-traverse still walks before `@babel/preset-typescript` strips them - never
// reach the callback. unplugin's `detectEntries` already iterates `ast.body` only, so
// the body-only walk here keeps the two adapters symmetric
export default function runEntryDetection(programPath, onEntry) {
  // `getEntrySource` recognises ImportDeclaration + ExpressionStatement (require / await
  // import) + TSImportEqualsDeclaration (TS `import x = require('core-js/...')`). other
  // shapes short-circuit to null; the filter pre-rejects those so the hot path skips the
  // adapter / scope work. NOT filtering on TSImportEqualsDeclaration would leave babel
  // silently passing through what unplugin already rewrites to individual core-js entries
  for (const bodyPath of programPath.get('body')) {
    if (!bodyPath.isExpressionStatement() && !bodyPath.isImportDeclaration()
      && bodyPath.node?.type !== 'TSImportEqualsDeclaration') continue;
    const source = getEntrySource(bodyPath.node, babelAdapter, bodyPath.scope);
    if (source !== null) onEntry(source, bodyPath);
  }
}
