// 20.2.2.30 Math.sinh(x)
var expm1 = require('core-js-internals/math-expm1');
var exp = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
require('./_export')({ target: 'Math', stat: true, forced: require('./_fails')(function () {
  return !Math.sinh(-2e-17) != -2e-17;
}) }, {
  sinh: function sinh(x) {
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
