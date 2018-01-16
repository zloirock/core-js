// 26.1.9 Reflect.has(target, propertyKey)
require('./_export')({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});
