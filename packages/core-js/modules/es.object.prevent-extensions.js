var isObject = require('../internals/is-object');
var onFreeze = require('../internals/internal-metadata').onFreeze;
var nativePreventExtensions = Object.preventExtensions;
var FREEZING = require('../internals/freezing');
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativePreventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.github.io/ecma262/#sec-object.preventextensions
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
  preventExtensions: function preventExtensions(it) {
    return nativePreventExtensions && isObject(it) ? nativePreventExtensions(onFreeze(it)) : it;
  }
});
