/* eslint-disable sonarjs/inconsistent-function-call -- detection */
'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var inheritIfRequired = require('../internals/inherit-if-required');
var toIndex = require('../internals/to-index');
var fails = require('../internals/fails');

var NativeArrayBuffer = ArrayBuffer;
var NativeDataView = DataView;
var DataViewPrototype = NativeDataView.prototype;
var ObjectPrototype = Object.prototype;

// WebKit bug - the same parent prototype for typed arrays and data view
if (Object.getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

var PROPER_UNDEFINED_HANDLING = !fails(function () {
  return new NativeDataView(new NativeArrayBuffer(1), undefined, undefined).byteLength !== 1;
});

var NEW_REQUIRED = fails(function () {
  NativeDataView(new NativeArrayBuffer(1));
});

// V8 ~ Chrome 50-53 follows ES2015: accepts a negative `byteLength` and rejects a non-integer `byteOffset`
var PROPER_ARGUMENTS_CONVERSION = fails(function () {
  // eslint-disable-next-line no-new -- required for testing
  new NativeDataView(new NativeArrayBuffer(1), 0, -1);
});

var WRAP = !PROPER_UNDEFINED_HANDLING || !NEW_REQUIRED || !PROPER_ARGUMENTS_CONVERSION;

var $DataView = function DataView(buffer /* , byteOffset, byteLength */) {
  anInstance(this, DataViewPrototype);
  // the buffer is validated before the conversion of arguments
  // eslint-disable-next-line no-new -- thrower
  new NativeDataView(buffer);
  var length = arguments.length;
  var byteOffset = toIndex(length > 1 ? arguments[1] : undefined);
  var byteLength = length > 2 ? arguments[2] : undefined;
  return inheritIfRequired(byteLength === undefined
    ? new NativeDataView(buffer, byteOffset)
    : new NativeDataView(buffer, byteOffset, toIndex(byteLength)), this, DataViewPrototype);
};

$DataView.prototype = DataViewPrototype;

if (WRAP) DataViewPrototype.constructor = $DataView;

$({ global: true, constructor: true, forced: WRAP }, {
  DataView: $DataView,
});
