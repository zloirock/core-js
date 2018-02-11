var toObject = require('core-js-internals/to-object');
var nativeKeys = require('../internals/object-keys');

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
require('../internals/object-statics-accept-primitives')('keys', function () {
  return function keys(it) {
    return nativeKeys(toObject(it));
  };
});
