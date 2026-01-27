// @types: proposals/float16
'use strict';
var $ = require('../internals/export');
var sign = require('../internals/math-sign');
var roundTiesToEven = require('../internals/math-round-ties-to-even');

var abs = Math.abs;

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var FLOAT16_EPSILON = 0.0009765625;
var FLOAT16_MAX_VALUE = 65504;
var FLOAT16_MIN_VALUE = 6.103515625e-05;

// `Math.f16round` method
// https://tc39.es/ecma262/#sec-math.f16round
$({ target: 'Math', stat: true }, {
  f16round: function f16round(x) {
    var n = +x;
    var absolute = abs(n);
    var s = sign(n);
    if (absolute < FLOAT16_MIN_VALUE) {
      return s * roundTiesToEven(absolute / FLOAT16_MIN_VALUE / FLOAT16_EPSILON) * FLOAT16_MIN_VALUE * FLOAT16_EPSILON;
    }
    var a = (1 + FLOAT16_EPSILON / EPSILON) * absolute;
    var result = a - (a - absolute);
    // eslint-disable-next-line no-self-compare -- NaN check
    if (result > FLOAT16_MAX_VALUE || result !== result) return s * Infinity;
    return s * result;
  },
});
