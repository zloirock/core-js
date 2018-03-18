'use strict';
var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer = require('../internals/typed-buffer')[ARRAY_BUFFER];
var NativeArrayBuffer = require('../internals/global')[ARRAY_BUFFER];

require('../internals/export')({ global: true, forced: NativeArrayBuffer !== ArrayBuffer }, {
  ArrayBuffer: ArrayBuffer
});

require('../internals/set-species')(ARRAY_BUFFER);
