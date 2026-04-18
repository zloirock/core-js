import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { babelAdapter } from './detect-usage.js';

export default function createEntryVisitors(onEntry) {
  return {
    ImportDeclaration(path) {
      const source = getEntrySource(path.node, babelAdapter, path.scope);
      if (source !== null) onEntry(source, path);
    },
    Program(path) {
      for (const bodyPath of path.get('body')) {
        // the ImportDeclaration visitor above already covers these - skip to avoid double-visit
        if (bodyPath.isImportDeclaration()) continue;
        const source = getEntrySource(bodyPath.node, babelAdapter, bodyPath.scope);
        if (source !== null) onEntry(source, bodyPath);
      }
    },
  };
}
