// https://tc39.github.io/ecma262/#sec-toindex
var toInteger = require('core-js-internals/to-integer');
var toLength = require('core-js-internals/to-length');
module.exports = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};
