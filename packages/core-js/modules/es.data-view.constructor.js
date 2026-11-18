'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var ArrayBufferModule = require('../internals/array-buffer');

var $DataView = ArrayBufferModule.DataView;
var FORCED = globalThis.DataView !== $DataView;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$({ global: true, constructor: true, forced: FORCED }, {
  DataView: $DataView
});

// the wrapper shares the native prototype, and the internal module is loaded without this export too
if (FORCED) $DataView.prototype.constructor = $DataView;
