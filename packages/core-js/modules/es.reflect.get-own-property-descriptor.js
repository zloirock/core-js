var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var anObject = require('../internals/an-object');
var DESCRIPTORS = require('../internals/descriptors');

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-reflect.getownpropertydescriptor
require('../internals/export')({ target: 'Reflect', stat: true, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
  }
});
