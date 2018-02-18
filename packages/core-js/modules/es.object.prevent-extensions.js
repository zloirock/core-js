var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var FREEZING = require('../internals/freezing');

// `Object.preventExtensions` method
// https://tc39.github.io/ecma262/#sec-object.preventextensions
require('../internals/object-statics-accept-primitives')('preventExtensions', function (nativePreventExtensions) {
  return function preventExtensions(it) {
    return nativePreventExtensions && isObject(it) ? nativePreventExtensions(onFreeze(it)) : it;
  };
}, !FREEZING);
