// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('core-js-internals/to-object');
var nativeGetPrototypeOf = require('./_object-get-prototype-of');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject(it));
  };
});
