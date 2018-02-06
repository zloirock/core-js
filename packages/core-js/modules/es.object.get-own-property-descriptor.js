// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIndexedObject = require('core-js-internals/to-indexed-object');
var nativeGetOwnPropertyDescriptor = require('./_object-get-own-property-descriptor').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
  };
});
