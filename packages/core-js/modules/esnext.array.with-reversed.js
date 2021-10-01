'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var reverse = [].reverse;

// `Array.prototype.withReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withReversed
$({ target: 'Array', proto: true }, {
  withReversed: function withReversed() {
    var A = slice.call(this);
    reverse.call(A);
    return A;
  }
});

addToUnscopables('withReversed');
