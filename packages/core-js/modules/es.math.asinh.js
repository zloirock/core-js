'use strict';
var $ = require('../internals/export');
var log1p = require('../internals/math-log1p');

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var log = Math.log;
var sqrt = Math.sqrt;
var LN2 = Math.LN2;
// sqrt(2 ** 53) - prevent n * n overflow
var SQRT_2_POW_53 = 94906265.62425156;

function asinh(x) {
  var n = +x;
  return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : n > SQRT_2_POW_53 ? log(n) + LN2
    : n < 1e-8 ? n : log1p(n + n * n / (1 + sqrt(n * n + 1)));
}

var FORCED = !($asinh && 1 / $asinh(0) > 0);

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$({ target: 'Math', stat: true, forced: FORCED }, {
  asinh: asinh,
});
