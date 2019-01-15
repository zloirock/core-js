var toObject = require('../internals/to-object');
var nativeKeys = require('../internals/object-keys');
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});
