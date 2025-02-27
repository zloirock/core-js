'use strict';
var $ = require('../internals/export');
var aNumber = require('../internals/a-number');
var notANaN = require('../internals/not-a-nan');
var sameValue = require('../internals/same-value');

var $RangeError = RangeError;
var $min = Math.min;
var $max = Math.max;

// `Math.clamp` method
// https://github.com/tc39/proposal-math-clamp
$({ target: 'Math', stat: true, forced: true }, {
  clamp: function clamp(value, min, max) {
    aNumber(value);
    notANaN(aNumber(min));
    notANaN(aNumber(max));
    if ((sameValue(min, 0) && sameValue(max, -0)) || min > max) throw new $RangeError('`min` should be smaller than `max`');
    return $min(max, $max(min, value));
  }
});
