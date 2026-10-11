// usage-global rewrites none of these statements, so no string is left alone where it would read as a
// directive: each loads the modules of the global its test or its sequence's prefix reads
typeof Symbol == 'undefined' ? installSymbol() : 'ready';
'use strict';
module.exports = [function () {
  (globalThis.Set, 'use strict');
  return this;
}, function () {
  (typeof Map == 'undefined' && installMap(), 'use strict');
  return this;
}];
