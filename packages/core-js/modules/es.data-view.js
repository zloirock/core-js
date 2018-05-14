var NATIVE_ARRAY_BUFFER = require('../internals/array-buffer-view-core').NATIVE_ARRAY_BUFFER;

// `DataView` constructor
// https://tc39.github.io/ecma262/#sec-dataview-constructor
require('../internals/export')({ global: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: require('../internals/array-buffer').DataView
});
