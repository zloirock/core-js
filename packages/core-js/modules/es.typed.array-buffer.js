'use strict';
var $export = require('../internals/export');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var TypedBufferModule = require('../internals/typed-buffer');
var anObject = require('../internals/an-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');
var ARRAY_BUFFER = 'ArrayBuffer';
var NativeArrayBuffer = require('../internals/global')[ARRAY_BUFFER];
var speciesConstructor = require('../internals/species-constructor');
var ArrayBuffer = TypedBufferModule[ARRAY_BUFFER];
var DataView = TypedBufferModule.DataView;
var nativeIsView = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER && ArrayBuffer.isView;
var nativeArrayBufferSlice = ArrayBuffer.prototype.slice;
var isArrayBufferView = ArrayBufferViewCore.isArrayBufferView;
var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
var INCORRECT_SLICE = require('../internals/fails')(function () {
  return !new ArrayBuffer(2).slice(1, undefined).byteLength;
});

$export({ global: true, forced: NativeArrayBuffer !== ArrayBuffer }, { ArrayBuffer: ArrayBuffer });

$export({ target: ARRAY_BUFFER, stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return nativeIsView && nativeIsView(it) || isArrayBufferView(it);
  }
});

$export({ target: ARRAY_BUFFER, proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
    }
    var len = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, len);
    var final = toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (speciesConstructor(this, ArrayBuffer))(toLength(final - first));
    var viewS = new DataView(this);
    var viewT = new DataView(result);
    var index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('../internals/set-species')(ARRAY_BUFFER);
