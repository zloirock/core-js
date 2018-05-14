'use strict';
var speciesConstructor = require('../internals/species-constructor');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;

var internalTypedArrayMap = require('../internals/array-methods')(1, function (O, length) {
  return new (aTypedArrayConstructor(speciesConstructor(O, O.constructor)))(length);
});

// `%TypedArray%.prototype.map` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.map
ArrayBufferViewCore.exportProto('map', function map(mapfn /* , thisArg */) {
  return internalTypedArrayMap(aTypedArray(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
});
