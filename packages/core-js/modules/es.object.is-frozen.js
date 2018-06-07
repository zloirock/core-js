var isObject = require('../internals/is-object');

// `Object.isFrozen` method
// https://tc39.github.io/ecma262/#sec-object.isfrozen
require('../internals/object-statics-accept-primitives')('isFrozen', function (nativeIsFrozen) {
  return function isFrozen(it) {
    return isObject(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
  };
});
