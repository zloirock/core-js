'use strict';
var aFunction = require('../internals/a-function');
var toObject = require('../internals/to-object');
var fails = require('../internals/fails');
var nativeSort = [].sort;
var testData = [1, 2, 3];
// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  testData.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  testData.sort(null);
});
// Old WebKit
var SLOPPY_METHOD = !require('../internals/strict-method')(nativeSort);

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
require('../internals/export')({
  target: 'Array', proto: true, forced: FAILS_ON_UNDEFINED || !FAILS_ON_NULL || SLOPPY_METHOD
}, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});
