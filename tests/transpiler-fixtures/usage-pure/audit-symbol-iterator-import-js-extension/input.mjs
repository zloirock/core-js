// `import from '.../symbol/iterator.js'` is Node ESM's explicit-extension form; resolveKey
// must still map the polyfill binding back to `Symbol.iterator` for downstream lookups
import _Symbol$iterator from '@core-js/pure/actual/symbol/iterator.js';
const k = _Symbol$iterator;
k in obj;
