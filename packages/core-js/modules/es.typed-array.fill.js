'use strict';
var arrayFill = require('../internals/array-fill');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

ArrayBufferViewCore.exportProto('fill', function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
  return arrayFill.apply(aTypedArray(this), arguments);
});
