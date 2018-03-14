'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var aTypedArray = ArrayBufferViewCore.aTypedArray;
var arrayJoin = [].join;

ArrayBufferViewCore.exportProto('join', function join(separator) { // eslint-disable-line no-unused-vars
  return arrayJoin.apply(aTypedArray(this), arguments);
});
