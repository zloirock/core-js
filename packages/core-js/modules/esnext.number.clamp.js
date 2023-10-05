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
    var value = thisNumberValue(this);
    aNumber(min);
    aNumber(max);
    return $min(max, $max(min, value));
  }
});
