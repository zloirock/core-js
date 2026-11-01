'use strict';
var $ = require('../internals/export');
var log1p = require('../internals/math-log1p');

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;

function atanh(x) {
  var n = +x;
  return n === 0 ? n : n < 0 ? -atanh(-n) : log1p(2 * n / (1 - n)) / 2;
}

var FORCED = !($atanh
  // Tor Browser bug: Math.atanh(-0) -> 0
  && 1 / $atanh(-0) < 0
  // imprecise in V8 < 5.3 and Rhino < 1.9.2
  && $atanh(1e-20) === 1e-20
  // FF < 48 bug, imprecise: https://bugzilla.mozilla.org/show_bug.cgi?id=933257
  && $atanh(0.001) === 0.0010000003333335333);

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
$({ target: 'Math', stat: true, forced: FORCED }, {
  atanh: atanh
});
