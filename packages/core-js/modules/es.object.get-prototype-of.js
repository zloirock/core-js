var toObject = require('../internals/to-object');
var nativeGetPrototypeOf = require('../internals/object-get-prototype-of');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
require('../internals/object-statics-accept-primitives')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  };
}, !CORRECT_PROTOTYPE_GETTER);
