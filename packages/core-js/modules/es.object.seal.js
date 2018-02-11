var isObject = require('../internals/is-object');
var onFreeze = require('../internals/meta').onFreeze;

// `Object.seal` method
// https://tc39.github.io/ecma262/#sec-object.seal
require('../internals/object-statics-accept-primitives')('seal', function (nativeSeal) {
  return function seal(it) {
    return nativeSeal && isObject(it) ? nativeSeal(onFreeze(it)) : it;
  };
});
