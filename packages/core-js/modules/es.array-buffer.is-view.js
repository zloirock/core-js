var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

// `ArrayBuffer.isView` method
// https://tc39.github.io/ecma262/#sec-arraybuffer.isview
require('../internals/export')({
  target: 'ArrayBuffer', stat: true, forced: !ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS
}, { isView: ArrayBufferViewCore.isView });
