var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var FREEZING = require('../internals/freezing');

// `Object.freeze` method
// https://tc39.github.io/ecma262/#sec-object.freeze
require('../internals/object-statics-accept-primitives')('freeze', function (nativeFreeze) {
  return function freeze(it) {
    return nativeFreeze && isObject(it) ? nativeFreeze(onFreeze(it)) : it;
  };
}, !FREEZING);
