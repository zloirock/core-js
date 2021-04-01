'use strict';
var $ = require('../internals/export');
var slice = require('../internals/array-slice');

// `Array.prototype.with` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.with
$({ target: 'Array', proto: true }, {
  'with': function (index, value) {
    var A = slice.call(this);
    A[index] = value;
    return A;
  }
});
