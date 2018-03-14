'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arraySort = [].sort;

ArrayBufferViewCore.exportProto('sort', function sort(comparefn) {
  return arraySort.call(aTypedArray(this), comparefn);
});
