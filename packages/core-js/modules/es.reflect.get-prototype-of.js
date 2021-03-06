var $ = require('../internals/export');
var anObject = require('../internals/an-object');

// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf = Object.getPrototypeOf;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$({ target: 'Reflect', stat: true }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject(target));
  },
});
