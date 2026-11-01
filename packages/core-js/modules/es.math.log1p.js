'use strict';
var $ = require('../internals/export');
var log1p = require('../internals/math-log1p');

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- required for testing
$({ target: 'Math', stat: true, forced: log1p !== Math.log1p }, { log1p: log1p });
