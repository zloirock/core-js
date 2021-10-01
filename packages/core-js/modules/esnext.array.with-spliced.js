'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');
var splice = require('../internals/array-splice');

// `Array.prototype.withSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withSpliced
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  withSpliced: function withSpliced(start, deleteCount) {
    var A = slice.call(this);
    splice.apply(A, arguments);
    return A;
  }
});

addToUnscopables('withSpliced');
