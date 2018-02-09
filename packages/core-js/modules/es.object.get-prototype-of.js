var toObject = require('core-js-internals/to-object');
var nativeGetPrototypeOf = require('./_object-get-prototype-of');

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
require('./_object-statics-accept-primitives')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  };
});
