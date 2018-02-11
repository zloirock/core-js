var expm1Implementation = require('core-js-internals/math-expm1');

// `Math.expm1` method
// https://tc39.github.io/ecma262/#sec-math.expm1
require('../internals/export')({ target: 'Math', stat: true, forced: expm1Implementation != Math.expm1 }, {
  expm1: expm1Implementation
});
