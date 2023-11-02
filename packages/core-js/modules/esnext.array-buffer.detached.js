'use strict';
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var isDetached = require('../internals/array-buffer-is-detached');

// dependency: es.array-buffer.constructor
var ArrayBufferPrototype = ArrayBuffer.prototype;

if (!('detached' in ArrayBufferPrototype)) {
  defineBuiltInAccessor(ArrayBufferPrototype, 'detached', {
    configurable: true,
    get: function detached() {
      return isDetached(this);
    },
  });
}
