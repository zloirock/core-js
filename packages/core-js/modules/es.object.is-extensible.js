var isObject = require('../internals/is-object');
var nativeIsExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES = require('../internals/fails')(function () { nativeIsExtensible(1); });

// `Object.isExtensible` method
// https://tc39.github.io/ecma262/#sec-object.isextensible
require('../internals/export')({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  isExtensible: function isExtensible(it) {
    return isObject(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
  }
});
