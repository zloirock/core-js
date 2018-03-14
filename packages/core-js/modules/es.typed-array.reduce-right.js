'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayReduceRight = [].reduceRight;

// eslint-disable-next-line no-unused-vars
ArrayBufferViewCore.exportProto('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return arrayReduceRight.apply(aTypedArray(this), arguments);
});
