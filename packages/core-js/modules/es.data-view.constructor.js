'use strict';
var $ = require('../internals/export');
var ArrayBufferModule = require('../internals/array-buffer');

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
// TODO: Rework and fix some cases
$({ global: true, constructor: true }, {
  DataView: ArrayBufferModule.DataView,
});
