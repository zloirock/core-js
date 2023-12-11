'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var fails = require('../internals/fails');
var arraySlice = require('../internals/array-slice');
var fromSameTypeAndList = require('../internals/typed-array-from-same-type-and-list');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

var FORCED = fails(function () {
  var array = new Int8Array(1);
  // Rhino 1.8 returns a view on the source buffer
  // https://github.com/mozilla/rhino/pull/1905
  return array.slice().buffer === array.buffer;
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod('slice', function slice(start, end) {
  // the list goes straight to the helper: in Rhino 1.8, locals assigned after `arraySlice` can be lost once a JS function is called
  return fromSameTypeAndList(this, arraySlice(aTypedArray(this), start, end));
}, FORCED);
