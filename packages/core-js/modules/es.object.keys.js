var toObject = require('core-js-internals/to-object');
var nativeKeys = require('./_object-keys');

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
require('./_object-statics-accept-primitives')('keys', function () {
  return function keys(it) {
    return nativeKeys(toObject(it));
  };
});
