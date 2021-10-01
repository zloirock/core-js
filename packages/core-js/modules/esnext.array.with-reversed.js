'use strict';
var $ = require('../internals/export');
var toIndexedObject = require('../internals/to-indexed-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withReversed
$({ target: 'Array', proto: true }, {
  withReversed: function withReversed() {
    var O = toIndexedObject(this);
    var len = lengthOfArrayLike(O);
    var A = Array(len);
    var k = 0;
    for (; k < len; k++) A[k] = O[len - k - 1];
    return A;
  }
});

addToUnscopables('withReversed');
