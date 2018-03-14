'use strict';
var ArrayIterators = require('../modules/es.array.iterator');
var Uint8Array = require('../internals/global').Uint8Array;
var Iterators = require('../internals/iterators');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var arrayValues = ArrayIterators.values;
var arrayKeys = ArrayIterators.keys;
var arrayEntries = ArrayIterators.entries;
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportProto = ArrayBufferViewCore.exportProto;
var nativeTypedArrayIterator = Uint8Array && Uint8Array.prototype[ITERATOR];

var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

var typedArrayValues = function values() {
  return arrayValues.call(aTypedArray(this));
};

exportProto('entries', function entries() {
  return arrayEntries.call(aTypedArray(this));
});
exportProto('keys', function keys() {
  return arrayKeys.call(aTypedArray(this));
});
exportProto('values', typedArrayValues, !CORRECT_ITER_NAME);
exportProto(ITERATOR, typedArrayValues, !CORRECT_ITER_NAME);

for (var NAME in ArrayBufferViewCore.TypedArrayConstructorsList) {
  Iterators[NAME] = typedArrayValues;
}
