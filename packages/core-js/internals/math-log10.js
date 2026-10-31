'use strict';
// eslint-disable-next-line es/no-math-log10 -- safe
var $log10 = Math.log10;
var abs = Math.abs;
var log = Math.log;
var LOG10E = Math.LOG10E;
var round = Math.round;

var MIN_NORMAL = 2.2250738585072014e-308; // 2 ** -1022

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
module.exports = (!$log10
  // V8 ~ Chrome < 41 bug, inexact on powers of ten: https://issues.chromium.org/issues/42206893
  || $log10(1e15) !== 15
) ? function log10(x) {
  var n = +x;
  var result = log(n) * LOG10E;
  var k = round(result);
  // the change of the base is a few ulps off on powers of ten, and `Math.pow(10, k)` is inexact in many engines,
  // so the power is parsed; subnormals are too far from powers of ten for an integer logarithm
  return abs(result - k) < 1e-12 && n >= MIN_NORMAL && +('1e' + k) === n ? k : result;
} : $log10;
