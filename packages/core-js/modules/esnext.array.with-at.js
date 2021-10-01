'use strict';
var $ = require('../internals/export');
var toIndexedObject = require('../internals/to-indexed-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var isIntegralNumber = require('../internals/is-integral-number');
var addToUnscopables = require('../internals/add-to-unscopables');

var ERROR_MESSAGE = 'Incorrect index';

// `Array.prototype.withAt` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withAt
$({ target: 'Array', proto: true }, {
  withAt: function withAt(index, value) {
    var O = toIndexedObject(this);
    var len = lengthOfArrayLike(O);
    if (!isIntegralNumber(index) || index >= len) throw RangeError(ERROR_MESSAGE);
    var actualIndex = index < 0 ? len + index : index;
    if (actualIndex < 0) throw RangeError(ERROR_MESSAGE);
    var A = Array(len);
    var k = 0;
    for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
    return A;
  }
});

addToUnscopables('withAt');
