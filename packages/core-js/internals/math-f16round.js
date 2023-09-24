'use strict';
var sign = require('../internals/math-sign');

var abs = Math.abs;

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var EPSILON16 = 0.0009765625; // 2 ** -10
var INVERSE_EPSILON = 1 / EPSILON;
var MAX16 = 65504; // 2 ** 15 - 2 ** 10
var MIN16 = 6.103515625e-05; // 2 ** -14

var roundTiesToEven = function (n) {
  return n + INVERSE_EPSILON - INVERSE_EPSILON;
};

// `Math.f16round` method implementation
// https://github.com/tc39/proposal-float16array
module.exports = Math.f16round || function f16round(x) {
  var n = +x;
  var $abs = abs(n);
  var $sign = sign(n);
  var a, result;
  if ($abs < MIN16) return $sign * roundTiesToEven($abs / MIN16 / EPSILON16) * MIN16 * EPSILON16;
  a = (1 + EPSILON16 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > MAX16 || result !== result) return $sign * Infinity;
  return $sign * result;
};
