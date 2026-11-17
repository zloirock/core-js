'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var fails = require('../internals/fails');
var ArrayBufferModule = require('../internals/array-buffer');
var anObject = require('../internals/an-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var toLength = require('../internals/to-length');

var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
var DataView = ArrayBufferModule.DataView;
var ArrayBufferPrototype = ArrayBuffer.prototype;
var DataViewPrototype = DataView.prototype;
// in NodeJS 0.11.0-0.11.3, `slice` is an own property of each buffer and fails on a missing or undefined argument
var OWN_SLICE = !ArrayBufferPrototype.slice && new ArrayBuffer(1).slice;
var nativeArrayBufferSlice = uncurryThis(ArrayBufferPrototype.slice || OWN_SLICE);
var getUint8 = uncurryThis(DataViewPrototype.getUint8);
var setUint8 = uncurryThis(DataViewPrototype.setUint8);

var INCORRECT_SLICE = fails(function () {
  return !new ArrayBuffer(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice && !OWN_SLICE && end === undefined) {
      return nativeArrayBufferSlice(anObject(this), start); // FF fix
    }
    var length = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    var result;
    if (OWN_SLICE) {
      // the native method converts arguments to int32, so it gets normalized indices
      result = nativeArrayBufferSlice(this, first, fin);
      delete result.slice;
      return result;
    }
    result = new ArrayBuffer(toLength(fin - first));
    var viewSource = new DataView(this);
    var viewTarget = new DataView(result);
    var index = 0;
    while (first < fin) {
      setUint8(viewTarget, index++, getUint8(viewSource, first++));
    } return result;
  }
});
