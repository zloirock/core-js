'use strict';
var Uint8Array = require('../internals/global').Uint8Array;
var fails = require('../internals/fails');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayToLocaleString = [].toLocaleString;
var arraySlice = [].slice;

// iOS Safari 6.x fails here
var TO_LOCALE_BUG = !!Uint8Array && fails(function () {
  arrayToLocaleString.call(new Uint8Array(1));
});
var FORCED = fails(function () {
  return [1, 2].toLocaleString() != new Uint8Array([1, 2]).toLocaleString();
}) || !fails(function () {
  Uint8Array.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring
ArrayBufferViewCore.exportProto('toLocaleString', function toLocaleString() {
  return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(aTypedArray(this)) : aTypedArray(this), arguments);
}, FORCED);
