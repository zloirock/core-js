'use strict';
var $ = require('../internals/export');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$({ target: 'ArrayBuffer', stat: true }, {
  isView: ArrayBufferViewCore.isView,
});
