// https://rwaldron.github.io/proposal-math-extensions/
require('./_export')({ target: 'Math', stat: true }, {
  clamp: function clamp(x, lower, upper) {
    return Math.min(upper, Math.max(lower, x));
  }
});
