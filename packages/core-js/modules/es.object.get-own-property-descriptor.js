// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIndexedObject = require('core-js-internals/to-indexed-object');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIndexedObject(it), key);
  };
});
