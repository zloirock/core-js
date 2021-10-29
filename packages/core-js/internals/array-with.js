var global = require('../internals/global');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var isIntegralNumber = require('../internals/is-integral-number');

var RangeError = global.RangeError;
var ERROR_MESSAGE = 'Incorrect index';

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
module.exports = function (O, C, index, value) {
  var len = lengthOfArrayLike(O);
  if (!isIntegralNumber(index) || index >= len) throw RangeError(ERROR_MESSAGE);
  var actualIndex = index < 0 ? len + index : index;
  if (actualIndex < 0) throw RangeError(ERROR_MESSAGE);
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
  return A;
};
