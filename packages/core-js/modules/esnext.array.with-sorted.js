'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');
var sort = require('../internals/array-sort');

// `Array.prototype.withSorted` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withSorted
$({ target: 'Array', proto: true }, {
  withSorted: function withSorted(compareFn) {
    var A = slice.call(this);
    sort.call(A, compareFn);
    return A;
  }
});

addToUnscopables('withSorted');
