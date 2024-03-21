'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var inheritIfRequired = require('../internals/inherit-if-required');
var fails = require('../internals/fails');

var NativeArrayBuffer = ArrayBuffer;
var NativeDataView = DataView;
var DataViewPrototype = NativeDataView.prototype;
var ObjectPrototype = Object.prototype;

// WebKit bug - the same parent prototype for typed arrays and data view
if (Object.getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

var NEW_REQUIRED = fails(function () {
  NativeDataView(new NativeArrayBuffer(1));
});

var PROPER_UNDEFINED_HANDLING = !fails(function () {
  return new NativeDataView(new NativeArrayBuffer(1), undefined, undefined).byteLength !== 1;
});

var WRAP = !NEW_REQUIRED || !PROPER_UNDEFINED_HANDLING;

var $DataView = function DataView(buffer) {
  anInstance(this, DataViewPrototype);
  var length = arguments.length;
  var view = length > 2 && arguments[2] !== undefined ? new NativeDataView(buffer, arguments[1], arguments[2])
    : length > 1 && arguments[1] !== undefined ? new NativeDataView(buffer, arguments[1])
    : new NativeDataView(buffer);
  return inheritIfRequired(view, this, DataViewPrototype);
};

$DataView.prototype = DataViewPrototype;

if (WRAP) DataViewPrototype.constructor = $DataView;

$({ global: true, constructor: true, forced: WRAP }, {
  DataView: $DataView,
});
