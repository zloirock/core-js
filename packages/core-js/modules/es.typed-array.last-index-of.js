'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var uncurryThis = require('../internals/function-uncurry-this');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// eslint-disable-next-line es/no-array-prototype-lastindexof -- safe
var $lastIndexOf = uncurryThis([].lastIndexOf);

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
exportTypedArrayMethod('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  var O = aTypedArray(this);
  return (arguments.length > 1 ? $lastIndexOf(O, searchElement, arguments[1]) : $lastIndexOf(O, searchElement)) || 0;
});
