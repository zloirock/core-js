// https://rwaldron.github.io/proposal-math-extensions/
var scale = require('./_math-scale');
var fround = require('./_math-fround');

require('./_export')({ target: 'Math', stat: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale(x, inLow, inHigh, outLow, outHigh));
  }
});
