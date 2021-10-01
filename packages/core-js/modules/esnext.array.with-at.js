'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

// `Array.prototype.withAt` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withAt
$({ target: 'Array', proto: true }, {
  'withAt': function withAt(index, value) {
    var A = slice.call(this);
    A[index] = value;
    return A;
  }
});

addToUnscopables('withAt');
