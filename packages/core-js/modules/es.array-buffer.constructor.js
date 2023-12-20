'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var FunctionName = require('../internals/function-name');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var fails = require('../internals/fails');
var anInstance = require('../internals/an-instance');
var toIndex = require('../internals/to-index');
var inheritIfRequired = require('../internals/inherit-if-required');
var copyConstructorProperties = require('../internals/copy-constructor-properties');

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var ARRAY_BUFFER = 'ArrayBuffer';
var NativeArrayBuffer = globalThis[ARRAY_BUFFER];
var $ArrayBuffer = NativeArrayBuffer;
var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer.prototype;

var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME && NativeArrayBuffer.name !== ARRAY_BUFFER;
/* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
var WRAP = !fails(function () {
  NativeArrayBuffer(1);
}) || !fails(function () {
  new NativeArrayBuffer(-1);
}) || fails(function () {
  new NativeArrayBuffer();
  new NativeArrayBuffer(1.5);
  new NativeArrayBuffer(NaN);
  return NativeArrayBuffer.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
});
/* eslint-enable no-new, sonarjs/inconsistent-function-call -- required for testing */

if (WRAP) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, ArrayBufferPrototype);
    return inheritIfRequired(new NativeArrayBuffer(toIndex(length)), this, $ArrayBuffer);
  };

  $ArrayBuffer.prototype = ArrayBufferPrototype;

  ArrayBufferPrototype.constructor = $ArrayBuffer;

  copyConstructorProperties($ArrayBuffer, NativeArrayBuffer);
} else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
  createNonEnumerableProperty(NativeArrayBuffer, 'name', ARRAY_BUFFER);
}

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$({ global: true, constructor: true, forced: WRAP }, {
  ArrayBuffer: $ArrayBuffer,
});
