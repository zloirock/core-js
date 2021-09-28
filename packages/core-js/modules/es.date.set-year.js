'use strict';
var $ = require('../internals/export');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var getTime = Date.prototype.getTime;
var setFullYear = Date.prototype.setFullYear;

// `Date.prototype.setYear` method
// https://tc39.es/ecma262/#sec-date.prototype.setyear
$({ target: 'Date', proto: true }, {
  setYear: function setYear(year) {
    // validate
    getTime.call(this);
    var yi = toIntegerOrInfinity(year);
    var yyyy = 0 <= yi && yi <= 99 ? yi + 1900 : yi;
    return setFullYear.call(this, yyyy);
  }
});
