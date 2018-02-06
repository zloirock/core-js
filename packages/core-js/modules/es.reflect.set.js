// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var definePropertyModule = require('./_object-define-property');
var getOwnPropertyDescriptorModule = require('./_object-get-own-property-descriptor');
var getPrototypeOf = require('./_object-get-prototype-of');
var has = require('core-js-internals/has');
var propertyDescriptor = require('./_property-desc');
var anObject = require('core-js-internals/an-object');
var isObject = require('core-js-internals/is-object');

function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
  var existingDescriptor, prototype;
  if (!ownDescriptor) {
    if (isObject(prototype = getPrototypeOf(target))) {
      return set(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = propertyDescriptor(0);
  }
  if (has(ownDescriptor, 'value')) {
    if (ownDescriptor.writable === false || !isObject(receiver)) return false;
    existingDescriptor = getOwnPropertyDescriptorModule.f(receiver, propertyKey) || propertyDescriptor(0);
    existingDescriptor.value = V;
    definePropertyModule.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDescriptor.set === undefined ? false : (ownDescriptor.set.call(receiver, V), true);
}

require('./_export')({ target: 'Reflect', stat: true }, { set: set });
