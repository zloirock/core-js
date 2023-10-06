'use strict';
var $ = require('../internals/export');
var sign = require('../internals/math-sign');

var abs = Math.abs;
var pow = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    var n = +x;
    var y = sign(n) * pow(abs(n), 1 / 3);
    // Newton-Raphson refinement for better precision
    return n !== 0 && isFinite(n) ? (2 * y + n / (y * y)) / 3 : y;
  },
});
