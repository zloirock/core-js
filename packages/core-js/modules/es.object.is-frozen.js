var isObject = require('../internals/is-object');
var nativeIsFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativeIsFrozen(1); });

// `Object.isFrozen` method
// https://tc39.github.io/ecma262/#sec-object.isfrozen
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  isFrozen: function isFrozen(it) {
    return isObject(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
  }
});
