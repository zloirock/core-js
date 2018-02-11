var isObject = require('core-js-internals/is-object');

// `Object.isExtensible` method
// https://tc39.github.io/ecma262/#sec-object.isextensible
require('../internals/object-statics-accept-primitives')('isExtensible', function (nativeIsExtensible) {
  return function isExtensible(it) {
    return isObject(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
  };
});
