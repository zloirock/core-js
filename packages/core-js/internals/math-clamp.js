'use strict';
var aNumber = require('../internals/a-number');
var notANaN = require('../internals/not-a-nan');

var $min = Math.min;
var $max = Math.max;

module.exports = function clamp(value, min, max) {
  aNumber(value);
  notANaN(aNumber(min));
  notANaN(aNumber(max));
  return $min(max, $max(min, value));
};
