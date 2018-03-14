'use strict';
var arrayForEach = require('../internals/array-methods')(0);
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

ArrayBufferViewCore.exportProto('forEach', function forEach(callbackfn /* , thisArg */) {
  arrayForEach(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});
