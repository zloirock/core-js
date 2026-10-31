'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');
var fails = require('../internals/fails');
var arraySlice = require('../internals/array-slice');

var FORCED = fails(function () {
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod('slice', function slice(start, end) {
  // the constructor goes first: in Rhino 1.8, `getTypedArrayConstructor` called after `arraySlice` loses `list`
  var C = getTypedArrayConstructor(aTypedArray(this));
  var list = arraySlice(this, start, end);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED);
