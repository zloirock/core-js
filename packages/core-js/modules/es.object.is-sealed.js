var isObject = require('../internals/is-object');

// Object.isSealed` method
// https://tc39.github.io/ecma262/#sec-object.issealed
require('../internals/object-statics-accept-primitives')('isSealed', function (nativeIsSealed) {
  return function isSealed(it) {
    return isObject(it) ? nativeIsSealed ? nativeIsSealed(it) : false : true;
  };
});
