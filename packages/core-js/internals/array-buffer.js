'use strict';
/* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
var globalThis = require('../internals/global-this');
var FunctionName = require('../internals/function-name');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var fails = require('../internals/fails');
var anInstance = require('../internals/an-instance');
var toIndex = require('../internals/to-index');
var inheritIfRequired = require('../internals/inherit-if-required');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var setToStringTag = require('../internals/set-to-string-tag');

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var ARRAY_BUFFER = 'ArrayBuffer';
var PROTOTYPE = 'prototype';
var NativeArrayBuffer = globalThis.ArrayBuffer;
var $ArrayBuffer = NativeArrayBuffer;
var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer[PROTOTYPE];

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

setToStringTag($ArrayBuffer, ARRAY_BUFFER);

module.exports = $ArrayBuffer;
