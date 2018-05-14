var DEG_PER_RAD = Math.PI / 180;

// `Math.radians` method
// https://rwaldron.github.io/proposal-math-extensions/
require('../internals/export')({ target: 'Math', stat: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});
