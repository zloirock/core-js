// 20.2.2.14 Math.expm1(x)
var expm1 = require('core-js-internals/math-expm1');

require('./_export')({ target: 'Math', stat: true, forced: expm1 != Math.expm1 }, { expm1: expm1 });
