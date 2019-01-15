var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var nativeSeal = Object.seal;
var FREEZING = require('../internals/freezing');
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativeSeal(1); });

// `Object.seal` method
// https://tc39.github.io/ecma262/#sec-object.seal
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
  seal: function seal(it) {
    return nativeSeal && isObject(it) ? nativeSeal(onFreeze(it)) : it;
  }
});
