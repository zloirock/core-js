'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var ArrayBuffer = require('../internals/array-buffer');
var setSpecies = require('../internals/set-species');

var NativeArrayBuffer = globalThis.ArrayBuffer;

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$({ global: true, constructor: true, forced: NativeArrayBuffer !== ArrayBuffer }, {
  ArrayBuffer: ArrayBuffer,
});

setSpecies('ArrayBuffer');
