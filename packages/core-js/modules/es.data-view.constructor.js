'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var inheritIfRequired = require('../internals/inherit-if-required');
var fails = require('../internals/fails');

var NativeDataView = DataView;
var DataViewPrototype = NativeDataView.prototype;
var ObjectPrototype = Object.prototype;

// WebKit bug - the same parent prototype for typed arrays and data view
if (Object.getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

var NEW_REQUIRED = fails(function () {
  NativeDataView(new ArrayBuffer(1));
});

var $DataView = function DataView(buffer) {
  anInstance(this, DataViewPrototype);
  var view;
  switch (arguments.length) {
    case 1: view = new NativeDataView(buffer); break;
    case 2: view = new NativeDataView(buffer, arguments[1]); break;
    default: view = new NativeDataView(buffer, arguments[1], arguments[2]);
  }
  return inheritIfRequired(view, this, DataViewPrototype);
};

$DataView.prototype = DataViewPrototype;

if (!NEW_REQUIRED) DataViewPrototype.constructor = $DataView;

$({ global: true, constructor: true, forced: !NEW_REQUIRED }, {
  DataView: $DataView,
});
