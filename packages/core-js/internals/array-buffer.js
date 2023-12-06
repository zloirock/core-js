'use strict';
/* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');
var FunctionName = require('../internals/function-name');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIns = require('../internals/define-built-ins');
var fails = require('../internals/fails');
var anInstance = require('../internals/an-instance');
var toIndex = require('../internals/to-index');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var inheritIfRequired = require('../internals/inherit-if-required');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var setToStringTag = require('../internals/set-to-string-tag');

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var NativeArrayBuffer = globalThis[ARRAY_BUFFER];
var $ArrayBuffer = NativeArrayBuffer;
var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer[PROTOTYPE];
var $DataView = globalThis[DATA_VIEW];
var DataViewPrototype = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype = Object.prototype;
var getPrototypeOf = Object.getPrototypeOf;

var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME && NativeArrayBuffer.name !== ARRAY_BUFFER;
if (!fails(function () {
  NativeArrayBuffer(1);
}) || !fails(function () {
  new NativeArrayBuffer(-1);
}) || fails(function () {
  new NativeArrayBuffer();
  new NativeArrayBuffer(1.5);
  new NativeArrayBuffer(NaN);
  return NativeArrayBuffer.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
})) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, ArrayBufferPrototype);
    return inheritIfRequired(new NativeArrayBuffer(toIndex(length)), this, $ArrayBuffer);
  };

  $ArrayBuffer[PROTOTYPE] = ArrayBufferPrototype;

  ArrayBufferPrototype.constructor = $ArrayBuffer;

  copyConstructorProperties($ArrayBuffer, NativeArrayBuffer);
} else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
  createNonEnumerableProperty(NativeArrayBuffer, 'name', ARRAY_BUFFER);
}

// WebKit bug - the same parent prototype for typed arrays and data view
if (getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

// iOS Safari 7.x bug
var testView = new $DataView(new $ArrayBuffer(2));
var $setInt8 = uncurryThis(DataViewPrototype.setInt8);
testView.setInt8(0, 2147483648);
testView.setInt8(1, 2147483649);
if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns(DataViewPrototype, {
  setInt8: function setInt8(byteOffset, value) {
    $setInt8(this, byteOffset, value << 24 >> 24);
  },
  setUint8: function setUint8(byteOffset, value) {
    $setInt8(this, byteOffset, value << 24 >> 24);
  },
}, { unsafe: true });

setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);

module.exports = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView,
};
