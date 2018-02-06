// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var getOwnPropertyDescriptor = require('./_object-get-own-property-descriptor').f;
var anObject = require('core-js-internals/an-object');

require('./_export')({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor(anObject(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});
