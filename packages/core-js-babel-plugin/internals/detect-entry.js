import { getEntrySource } from '@core-js/polyfill-provider/detect-usage/entries';
import { babelAdapter } from './detect-usage.js';

export default function createEntryVisitors(onEntry) {
  return {
    ImportDeclaration(path) {
      const source = getEntrySource(path.node, babelAdapter, path.scope);
      if (source !== null) onEntry(source, path);
    },
    Program(path) {
      for (const bodyPath of path.get('body')) {
        // `getEntrySource` only recognises ImportDeclaration (handled above) and ExpressionStatement
        // (`require(...)` / `await import(...)`); everything else short-circuits to null anyway
        if (!bodyPath.isExpressionStatement()) continue;
        const source = getEntrySource(bodyPath.node, babelAdapter, bodyPath.scope);
        if (source !== null) onEntry(source, bodyPath);
      }
    },
  };
}
