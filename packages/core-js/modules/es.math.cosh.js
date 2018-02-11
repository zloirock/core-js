var exp = Math.exp;

// `Math.cosh` method
// https://tc39.github.io/ecma262/#sec-math.cosh
require('../internals/export')({ target: 'Math', stat: true }, {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
