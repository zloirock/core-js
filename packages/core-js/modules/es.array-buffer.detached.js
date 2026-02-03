// @types: proposals/array-buffer-transfer
'use strict';
var fails = require('../internals/fails');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var arrayBufferByteLength = require('../internals/array-buffer-byte-length');
var isDetached = require('../internals/array-buffer-is-detached');

var ArrayBufferPrototype = ArrayBuffer.prototype;
var nativeGetter = uncurryThisAccessor(ArrayBufferPrototype, 'detached', 'get');

// `ArrayBuffer.prototype.detached` getter
// https://tc39.es/ecma262/#sec-get-arraybuffer.prototype.detached
if (!nativeGetter || !fails(function () {
  // Older full polyfills accepted receivers without ArrayBuffer internal state.
  nativeGetter({});
})) {
  defineBuiltInAccessor(ArrayBufferPrototype, 'detached', {
    configurable: true,
    get: function detached() {
      arrayBufferByteLength(this);
      return isDetached(this);
    },
  });
}
