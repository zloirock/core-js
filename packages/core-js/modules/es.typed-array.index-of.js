'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var getTypedArrayIndexOfFix = require('../internals/typed-array-fix-index-of');
var $indexOf = require('../internals/array-includes').indexOf;

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var fixNegativeZero = getTypedArrayIndexOfFix('indexOf');

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod('indexOf', function indexOf(searchElement /* , fromIndex */) {
  if (fixNegativeZero) return fixNegativeZero(this, arguments);
  return $indexOf(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
}, !!fixNegativeZero);
