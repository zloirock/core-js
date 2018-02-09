'use strict';
var aFunction = require('core-js-internals/a-function');
var toObject = require('core-js-internals/to-object');
var fails = require('core-js-internals/fails');
var nativeSort = [].sort;
var testData = [1, 2, 3];

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
require('./_export')({ target: 'Array', proto: true, forced: fails(function () {
  // IE8-
  testData.sort(undefined);
}) || !fails(function () {
  // V8 bug
  testData.sort(null);
  // Old WebKit
}) || !require('./_strict-method')(nativeSort) }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});
