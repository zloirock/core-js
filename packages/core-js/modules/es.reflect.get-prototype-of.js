var objectGetPrototypeOf = require('./_object-get-prototype-of');
var anObject = require('core-js-internals/an-object');

// `Reflect.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-reflect.getprototypeof
require('./_export')({ target: 'Reflect', stat: true }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject(target));
  }
});
