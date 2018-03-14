'use strict';
var arrayFind = require('../internals/array-methods')(5);
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;

ArrayBufferViewCore.exportProto('find', function find(predicate /* , thisArg */) {
  return arrayFind(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});
