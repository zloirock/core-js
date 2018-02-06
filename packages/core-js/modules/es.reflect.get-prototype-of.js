// 26.1.8 Reflect.getPrototypeOf(target)
var nativeGetPrototypeOf = require('./_object-get-prototype-of');
var anObject = require('core-js-internals/an-object');

require('./_export')({ target: 'Reflect', stat: true }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return nativeGetPrototypeOf(anObject(target));
  }
});
