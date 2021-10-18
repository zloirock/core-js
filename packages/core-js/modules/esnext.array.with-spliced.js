'use strict';
var $ = require('../internals/export');
var toIndexedObject = require('../internals/to-indexed-object');
var arrayWithSpliced = require('../internals/array-with-spliced');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.withSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withSpliced
$({ target: 'Array', proto: true }, {
  // eslint-disable-next-line no-unused-vars -- required for .length
  withSpliced: function withSpliced(start, deleteCount /* , ...items */) {
    for (var i = 0, l = arguments.length, args = Array(l); i < l; i++) args[i] = arguments[i];
    return arrayWithSpliced(toIndexedObject(this), Array, args);
  }
});

addToUnscopables('withSpliced');
