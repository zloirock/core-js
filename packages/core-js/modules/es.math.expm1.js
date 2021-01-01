var $ = require('../internals/export');
var expm1 = require('../internals/math-expm1');

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
$({ target: 'Math', stat: true, forced: expm1 != Math.expm1 }, { expm1: expm1 });
