'use strict';
var globalThis = require('../internals/global-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var wellKnownSymbol = require('../internals/well-known-symbol');

var getArrayIteratorMethod = function (METHOD_NAME) {
  // dependency: es.array.iterator
  return uncurryThis(getBuiltInPrototypeMethod('Array', METHOD_NAME));
};

var ITERATOR = wellKnownSymbol('iterator');
var Uint8Array = globalThis.Uint8Array;
var arrayValues = getArrayIteratorMethod('values');
var arrayKeys = getArrayIteratorMethod('keys');
var arrayEntries = getArrayIteratorMethod('entries');
var TypedArrayPrototype = Uint8Array && Uint8Array.prototype;

var GENERIC = !fails(function () {
  TypedArrayPrototype[ITERATOR].call([1]);
});

var ITERATOR_IS_VALUES = !!TypedArrayPrototype
  && TypedArrayPrototype.values
  && TypedArrayPrototype[ITERATOR] === TypedArrayPrototype.values
  && TypedArrayPrototype.values.name === 'values';

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
