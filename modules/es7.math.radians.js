// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export')
  , DEG_PER_RAD = Math.PI / 180;

$export($export.S, 'Math', {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});
