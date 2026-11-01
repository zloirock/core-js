'use strict';
var $ = require('../internals/export');
var log1p = require('../internals/math-log1p');

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var abs = Math.abs;
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

var FORCED = !($asinh
  // Tor Browser bug: Math.asinh(0) -> -0
  && 1 / $asinh(0) > 0
  // imprecise in V8 < 5.4 and Rhino
  && abs($asinh(1e-8) - 1e-8) < 1e-16
  // FF < 48 bug, imprecise: https://bugzilla.mozilla.org/show_bug.cgi?id=933257
  && $asinh(0.001) === 0.0009999998333334083);

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
$({ target: 'Math', stat: true, forced: FORCED }, {
  asinh: asinh
});
