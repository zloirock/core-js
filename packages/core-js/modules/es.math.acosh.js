// 20.2.2.3 Math.acosh(x)
var log1p = require('core-js-internals/math-log1p');
var sqrt = Math.sqrt;
var $acosh = Math.acosh;

require('./_export')({ target: 'Math', stat: true, forced: !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  && $acosh(Infinity) == Infinity
) }, {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
