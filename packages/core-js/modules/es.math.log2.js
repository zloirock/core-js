'use strict';
var $ = require('../internals/export');
var log2 = require('../internals/math-log2');

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
// eslint-disable-next-line es/no-math-log2 -- required for testing
$({ target: 'Math', stat: true, forced: log2 !== Math.log2 }, {
  log2: log2,
});
