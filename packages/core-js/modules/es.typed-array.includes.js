'use strict';
var createIncludes = require('../internals/array-includes');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayIncludes = createIncludes(true);

// `%TypedArray%.prototype.includes` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.includes
ArrayBufferViewCore.exportProto('includes', function includes(searchElement /* , fromIndex */) {
  return arrayIncludes(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});
