'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toPropertyKey = require('../internals/to-property-key');

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    anObject(target);
    var key = toPropertyKey(propertyKey);
    var descriptor = getOwnPropertyDescriptor(target, key);
    return descriptor && !descriptor.configurable ? false : delete target[key];
  },
});
