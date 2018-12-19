var expm1 = require('../internals/math-expm1');
var abs = Math.abs;
var exp = Math.exp;
var E = Math.E;

// `Math.sinh` method
// https://tc39.github.io/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
require('../internals/export')({ target: 'Math', stat: true, forced: require('../internals/fails')(function () {
  return Math.sinh(-2e-17) != -2e-17;
}) }, {
  sinh: function sinh(x) {
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  }
});
