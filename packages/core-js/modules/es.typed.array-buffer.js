'use strict';
var $export = require('../internals/export');
var $typed = require('../internals/typed');
var buffer = require('../internals/typed-buffer');
var anObject = require('core-js-internals/an-object');
var toAbsoluteIndex = require('core-js-internals/to-absolute-index');
var toLength = require('core-js-internals/to-length');
var isObject = require('core-js-internals/is-object');
var ArrayBuffer = require('core-js-internals/global').ArrayBuffer;
var speciesConstructor = require('core-js-internals/species-constructor');
var $ArrayBuffer = buffer.ArrayBuffer;
var $DataView = buffer.DataView;
var $isView = $typed.ABV && ArrayBuffer.isView;
var nativeArrayBufferSlice = $ArrayBuffer.prototype.slice;
var VIEW = $typed.VIEW;
var ARRAY_BUFFER = 'ArrayBuffer';

$export({ global: true, wrap: true, forced: ArrayBuffer !== $ArrayBuffer }, { ArrayBuffer: $ArrayBuffer });

$export({ target: ARRAY_BUFFER, stat: true, forced: !$typed.CONSTR }, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export({ target: ARRAY_BUFFER, proto: true, unsafe: true, forced: require('core-js-internals/fails')(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}) }, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
    }
    var len = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, len);
    var final = toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first));
    var viewS = new $DataView(this);
    var viewT = new $DataView(result);
    var index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('../internals/set-species')(ARRAY_BUFFER);
