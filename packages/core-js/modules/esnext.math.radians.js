// https://rwaldron.github.io/proposal-math-extensions/
var DEG_PER_RAD = Math.PI / 180;

require('./_export')({ target: 'Math', stat: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});
