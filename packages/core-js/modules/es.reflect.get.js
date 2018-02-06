// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var getOwnPropertyDescriptorModule = require('./_object-get-own-property-descriptor');
var getPrototypeOf = require('./_object-get-prototype-of');
var has = require('core-js-internals/has');
var isObject = require('core-js-internals/is-object');
var anObject = require('core-js-internals/an-object');

function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject(target) === receiver) return target[propertyKey];
  if (descriptor = getOwnPropertyDescriptorModule.f(target, propertyKey)) return has(descriptor, 'value')
    ? descriptor.value
    : descriptor.get !== undefined
      ? descriptor.get.call(receiver)
      : undefined;
  if (isObject(prototype = getPrototypeOf(target))) return get(prototype, propertyKey, receiver);
}

require('./_export')({ target: 'Reflect', stat: true }, { get: get });
