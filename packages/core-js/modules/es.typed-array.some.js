'use strict';
var arraySome = require('../internals/array-methods')(3);
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

ArrayBufferViewCore.exportProto('some', function some(callbackfn /* , thisArg */) {
  return arraySome(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
