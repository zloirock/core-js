var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var nativeFreeze = Object.freeze;
var FREEZING = require('../internals/freezing');
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativeFreeze(1); });

// `Object.freeze` method
// https://tc39.github.io/ecma262/#sec-object.freeze
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
  freeze: function freeze(it) {
    return nativeFreeze && isObject(it) ? nativeFreeze(onFreeze(it)) : it;
  }
});
