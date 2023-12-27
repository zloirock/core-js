'use strict';
var apply = require('../internals/function-apply');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var fails = require('../internals/fails');
var arraySlice = require('../internals/array-slice');

var $Int8Array = Int8Array;
var $toLocaleString = [].toLocaleString;
var Int8ArrayToLocaleString = $Int8Array.prototype.toLocaleString;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = fails(function () {
  $toLocaleString.call(new $Int8Array(1));
});

var FORCED = fails(function () {
  return [1, 2].toLocaleString() !== Int8ArrayToLocaleString.call(new Float32Array([1, 2]));
}) || !fails(function () {
  Int8ArrayToLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod('toLocaleString', function toLocaleString() {
  return apply(
    $toLocaleString,
    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray(this)) : aTypedArray(this),
    arraySlice(arguments)
  );
}, FORCED);
