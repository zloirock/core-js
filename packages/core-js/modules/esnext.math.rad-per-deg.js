var $ = require('../internals/export');

var RAD_PER_DEG = 180 / Math.PI;

// `Math.RAD_PER_DEG` constant
// https://rwaldron.github.io/proposal-math-extensions/
$({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true, forced: Math.RAD_PER_DEG !== RAD_PER_DEG }, {
  RAD_PER_DEG: RAD_PER_DEG
});
