import { getEntrySource } from '@core-js/polyfill-provider/detect-usage';
import { babelAdapter } from './detect-usage.js';

export default function createEntryVisitors(onEntry) {
  return {
    ImportDeclaration(path) {
      const source = getEntrySource(path.node, babelAdapter);
      if (source !== null) onEntry(source, path);
    },
    Program(path) {
      for (const bodyPath of path.get('body')) {
        const source = getEntrySource(bodyPath.node, babelAdapter);
        if (source !== null) onEntry(source, bodyPath);
      }
    },
  };
}
