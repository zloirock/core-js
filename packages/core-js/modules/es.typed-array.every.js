'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var $every = uncurryThis([].every);
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod('every', function every(callbackfn /* , thisArg */) {
  return $every(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
