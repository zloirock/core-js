'use strict';
var sign = require('../internals/math-sign');

var abs = Math.abs;

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var EPSILON32 = 1.1920928955078125e-7; // 2 ** -23;
var INVERSE_EPSILON = 1 / EPSILON;
var MAX32 = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
var MIN32 = 1.1754943508222875e-38; // 2 ** -126;

var roundTiesToEven = function (n) {
  return n + INVERSE_EPSILON - INVERSE_EPSILON;
};

// `Math.fround` method implementation
// https://tc39.es/ecma262/#sec-math.fround
// eslint-disable-next-line es/no-math-fround -- safe
module.exports = Math.fround || function fround(x) {
  var n = +x;
  var $abs = abs(n);
  var $sign = sign(n);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > MAX32 || result !== result) return $sign * Infinity;
  return $sign * result;
};
