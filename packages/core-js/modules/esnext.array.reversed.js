'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var reverse = [].reverse;

// `Array.prototype.reversed` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.reversed
$({ target: 'Array', proto: true }, {
  reversed: function reversed() {
    var A = slice.call(this);
    reverse.call(A);
    return A;
  }
});

addToUnscopables('reversed');
