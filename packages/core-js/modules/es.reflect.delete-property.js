var $ = require('../internals/export');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var anObject = require('../internals/an-object');

// `Reflect.deleteProperty` method
// https://tc39.github.io/ecma262/#sec-reflect.deleteproperty
$({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor(anObject(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});
