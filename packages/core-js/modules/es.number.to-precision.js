'use strict';
var fails = require('core-js-internals/fails');
var thisNumberValue = require('core-js-internals/this-number-value');
var $toPrecision = 1.0.toPrecision;

require('./_export')({ target: 'Number', proto: true, forced: fails(function () {
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !fails(function () {
  // V8 ~ Android 4.3-
  $toPrecision.call({});
}) }, {
  toPrecision: function toPrecision(precision) {
    var that = thisNumberValue(this);
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision);
  }
});
