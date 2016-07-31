// https://rwaldron.github.io/proposal-math-extensions/
var _isNaN = function(x) {x != x};

module.exports = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
  if (arguments.length === 0) {
    return NaN;
  }

  if (_isNaN(x) ||
      _isNaN(inLow) ||
      _isNaN(inHigh) ||
      _isNaN(outLow) ||
      _isNaN(outHigh)) {
    return NaN;
  }

  if (x === Infinity ||
      x === -Infinity) {
    return x;
  }

  return (x - inLow) * (outHigh - outLow) /
    (inHigh - inLow) + outLow;
};
