'use strict';
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var typedArrayFrom = require('../internals/typed-array-from');

var FORCED = require('../internals/fails')(function () {
  // eslint-disable-next-line no-undef
  Int8Array.from([1]);
});

// `%TypedArray%.from` method
// https://tc39.github.io/ecma262/#sec-%typedarray%.from
ArrayBufferViewCore.exportStatic('from', typedArrayFrom, FORCED);
