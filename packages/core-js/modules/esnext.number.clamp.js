// types: proposals/number-clamp
'use strict';
var $ = require('../internals/export');
var aNumber = require('../internals/a-number');
var thisNumberValue = require('../internals/this-number-value');

var $min = Math.min;
var $max = Math.max;

// `Number.prototype.clamp` method
// https://github.com/tc39/proposal-math-clamp
$({ target: 'Number', proto: true, forced: true }, {
  clamp: function clamp(min, max) {
    return $min($max(thisNumberValue(this), aNumber(min)), aNumber(max));
  },
});
