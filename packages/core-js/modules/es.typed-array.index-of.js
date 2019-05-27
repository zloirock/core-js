'use strict';
var createIncludes = require('../internals/array-includes');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayIndexOf = createIncludes(false);

// `%TypedArray%.prototype.indexOf` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.indexof
ArrayBufferViewCore.exportProto('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return arrayIndexOf(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});
