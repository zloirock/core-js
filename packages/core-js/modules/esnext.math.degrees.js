// https://rwaldron.github.io/proposal-math-extensions/
var RAD_PER_DEG = 180 / Math.PI;

require('../internals/export')({ target: 'Math', stat: true }, {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});
