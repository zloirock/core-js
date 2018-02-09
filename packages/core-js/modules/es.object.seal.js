var isObject = require('core-js-internals/is-object');
var onFreeze = require('./_meta').onFreeze;

// `Object.seal` method
// https://tc39.github.io/ecma262/#sec-object.seal
require('./_object-statics-accept-primitives')('seal', function (nativeSeal) {
  return function seal(it) {
    return nativeSeal && isObject(it) ? nativeSeal(onFreeze(it)) : it;
  };
});
