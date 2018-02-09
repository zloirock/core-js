'use strict';
var fails = require('core-js-internals/fails');
var thisNumberValue = require('core-js-internals/this-number-value');
var nativeToPrecision = 1.0.toPrecision;

// `Number.prototype.toPrecision` method
// https://tc39.github.io/ecma262/#sec-number.prototype.toprecision
require('./_export')({ target: 'Number', proto: true, forced: fails(function () {
  // IE7-
  return nativeToPrecision.call(1, undefined) !== '1';
}) || !fails(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision.call({});
}) }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision.call(thisNumberValue(this))
      : nativeToPrecision.call(thisNumberValue(this), precision);
  }
});
