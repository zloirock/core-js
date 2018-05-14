// `Reflect.has` method
// https://tc39.github.io/ecma262/#sec-reflect.has
require('../internals/export')({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});
