// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var getOwnPropertyDescriptorModule = require('./_object-get-own-property-descriptor');
var anObject = require('core-js-internals/an-object');

require('./_export')({ target: 'Reflect', stat: true }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
  }
});
