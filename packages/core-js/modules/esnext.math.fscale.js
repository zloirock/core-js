// https://rwaldron.github.io/proposal-math-extensions/
var scale = require('../internals/math-scale');
var fround = require('../internals/math-fround');

require('../internals/export')({ target: 'Math', stat: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale(x, inLow, inHigh, outLow, outHigh));
  }
});
