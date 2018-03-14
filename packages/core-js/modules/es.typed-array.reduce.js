'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayReduce = [].reduce;

// eslint-disable-next-line no-unused-vars
ArrayBufferViewCore.exportProto('reduce', function reduce(callbackfn /* , initialValue */) {
  return arrayReduce.apply(aTypedArray(this), arguments);
});
