'use strict';
var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer = require('../internals/array-buffer')[ARRAY_BUFFER];
var NativeArrayBuffer = require('../internals/global')[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.github.io/ecma262/#sec-arraybuffer-constructor
require('../internals/export')({ global: true, forced: NativeArrayBuffer !== ArrayBuffer }, {
  ArrayBuffer: ArrayBuffer
});

require('../internals/set-species')(ARRAY_BUFFER);
