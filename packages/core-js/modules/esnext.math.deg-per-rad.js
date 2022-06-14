var $ = require('../internals/export');

var DEG_PER_RAD = Math.PI / 180;

// `Math.DEG_PER_RAD` constant
// https://rwaldron.github.io/proposal-math-extensions/
$({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true, forced: Math.DEG_PER_RAD !== DEG_PER_RAD }, {
  DEG_PER_RAD: DEG_PER_RAD
});
