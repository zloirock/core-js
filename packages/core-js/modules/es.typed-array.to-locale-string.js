'use strict';
var apply = require('../internals/function-apply');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var fails = require('../internals/fails');
var arraySlice = require('../internals/array-slice');

var $Int8Array = Int8Array;
var $toLocaleString = [].toLocaleString;
var Int8ArrayToLocaleString = $Int8Array.prototype.toLocaleString;

var FORCED = fails(function () {
  return [1, 2].toLocaleString() !== Int8ArrayToLocaleString.call(new Float32Array([1, 2]));
}) || !fails(function () {
  Int8ArrayToLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod('toLocaleString', function toLocaleString() {
  return apply($toLocaleString, aTypedArray(this), arraySlice(arguments));
}, FORCED);
