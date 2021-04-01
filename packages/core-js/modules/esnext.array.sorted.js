'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');
var sort = require('../internals/array-sort');

// `Array.prototype.sorted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.sorted
$({ target: 'Array', proto: true }, {
  sorted: function sorted(compareFn) {
    var A = slice.call(this);
    sort.call(A, compareFn);
    return A;
  }
});

addToUnscopables('sorted');
