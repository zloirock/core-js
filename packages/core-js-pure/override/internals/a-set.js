'use strict';
var tryToString = require('../internals/try-to-string');

// Perform ? RequireInternalSlot(M, [[SetData]])
module.exports = function (it) {
  if (typeof it == 'object' && 'size' in it && 'has' in it && 'add' in it && 'delete' in it && 'keys' in it) return it;
  throw TypeError(tryToString(it) + ' is not a set');
};
