'use strict';
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');

// @dependency: es.array.keys
// eslint-disable-next-line es/no-array-prototype-keys -- safe
var arrayMethod = uncurryThis([].keys);

var GENERIC = !fails(function () {
  Int8Array.prototype.keys.call([1]);
});

// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod('keys', function keys() {
  return arrayMethod(aTypedArray(this));
}, GENERIC);
