'use strict';
var $ = require('../internals/export');
var sign = require('../internals/math-sign');

// eslint-disable-next-line es/no-math-cbrt -- required for testing
var $cbrt = Math.cbrt;
var abs = Math.abs;
var pow = Math.pow;

// imprecise in FF < 48 (`cbrt(64)`) and with glibc `cbrt` (`cbrt(27)`), each check catches only one of them
var FORCED = !$cbrt || $cbrt(27) !== 3 || $cbrt(64) !== 4;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$({ target: 'Math', stat: true, forced: FORCED }, {
  cbrt: function cbrt(x) {
    var n = +x;
    var y = sign(n) * pow(abs(n), 1 / 3);
    // Newton-Raphson refinement for better precision
    return n !== 0 && isFinite(n) ? (2 * y + n / (y * y)) / 3 : y;
  }
});
