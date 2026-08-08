// existing polyfill import with a `.js` extension (Node ESM form) must still be
// recognised as providing `Symbol.iterator` for the following `k in obj` check
import _Symbol$iterator from '@core-js/pure/actual/symbol/iterator.js';
const k = _Symbol$iterator;
k in obj;
