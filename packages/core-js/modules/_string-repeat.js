'use strict';
var toInteger = require('core-js-internals/to-integer');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');

module.exports = function repeat(count) {
  var str = String(requireObjectCoercible(this));
  var res = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};
