var NATIVE_ARRAY_BUFFER = require('../internals/array-buffer-view-core').NATIVE_ARRAY_BUFFER;

require('../internals/export')({ global: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: require('../internals/typed-buffer').DataView
});
