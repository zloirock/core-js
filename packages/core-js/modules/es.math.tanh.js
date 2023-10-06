'use strict';
var $ = require('../internals/export');
var expm1 = require('../internals/math-expm1');

// eslint-disable-next-line es/no-math-tanh -- required for testing
var $tanh = Math.tanh;
var exp = Math.exp;

// V8 ~ Chrome < 48 bug, NaN on big arguments and 0 on tiny ones: https://issues.chromium.org/issues/41480547
var FORCED = !$tanh || $tanh(710) !== 1;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$({ target: 'Math', stat: true, forced: FORCED }, {
  tanh: function tanh(x) {
    var n = +x;
    var a = expm1(n);
    var b = expm1(-n);
    return a === Infinity ? 1 : b === Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
  },
});
