'use strict';
var $ = require('../internals/export');
var log10 = require('../internals/math-log10');

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
// eslint-disable-next-line es/no-math-log10 -- required for testing
$({ target: 'Math', stat: true, forced: log10 !== Math.log10 }, {
  log10: log10
});
