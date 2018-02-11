var objectGetPrototypeOf = require('../internals/object-get-prototype-of');
var anObject = require('../internals/an-object');

// `Reflect.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-reflect.getprototypeof
require('../internals/export')({ target: 'Reflect', stat: true }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject(target));
  }
});
