'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var shift = [].shift;

// `Array.prototype.shifted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.shifted
$({ target: 'Array', proto: true }, {
  shifted: function shifted() {
    var A = slice.call(this);
    shift.call(A);
    return A;
  }
});

addToUnscopables('shifted');
