'use strict';
var $ = require('../internals/export');
var clamp = require('../internals/math-clamp');

// `Math.clamp` method
// https://github.com/tc39/proposal-math-clamp
$({ target: 'Math', stat: true, forced: true }, {
  clamp: clamp
});
