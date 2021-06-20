'use strict';
var $ = require('../internals/export');

var getFullYear = Date.prototype.getFullYear;

// `Date.prototype.getYear` method
// https://tc39.es/ecma262/#sec-date.prototype.getyear
$({ target: 'Date', proto: true }, {
  getYear: function getYear() {
    return getFullYear.call(this) - 1900;
  }
});
