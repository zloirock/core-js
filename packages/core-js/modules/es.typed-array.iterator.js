'use strict';
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var wellKnownSymbol = require('../internals/well-known-symbol');

var getArrayIteratorMethod = function (METHOD_NAME) {
  // dependency: es.array.iterator
  return uncurryThis(getBuiltInPrototypeMethod('Array', METHOD_NAME));
};

var ITERATOR = wellKnownSymbol('iterator');
var arrayValues = getArrayIteratorMethod('values');
var arrayKeys = getArrayIteratorMethod('keys');
var arrayEntries = getArrayIteratorMethod('entries');
var Int8ArrayPrototype = Int8Array.prototype;

var GENERIC = !fails(function () {
  Int8ArrayPrototype[ITERATOR].call([1]);
});

var ITERATOR_IS_VALUES = !!Int8ArrayPrototype
  && Int8ArrayPrototype.values
  && Int8ArrayPrototype[ITERATOR] === Int8ArrayPrototype.values
  && Int8ArrayPrototype.values.name === 'values';

var typedArrayValues = function values() {
  return arrayValues(aTypedArray(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod('entries', function entries() {
  return arrayEntries(aTypedArray(this));
}, GENERIC);
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod('keys', function keys() {
  return arrayKeys(aTypedArray(this));
}, GENERIC);
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod(ITERATOR, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
