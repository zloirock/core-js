var log1p = require('../internals/math-log1p');
var sqrt = Math.sqrt;
var nativeAcosh = Math.acosh;

// `Math.acosh` method
// https://tc39.github.io/ecma262/#sec-math.acosh
require('../internals/export')({ target: 'Math', stat: true, forced: !(nativeAcosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor(nativeAcosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  && nativeAcosh(Infinity) == Infinity
) }, {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
