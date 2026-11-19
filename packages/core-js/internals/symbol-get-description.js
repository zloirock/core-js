'use strict';
var call = require('../internals/function-call');
var description = require('../internals/symbol-description');

var $Object = Object;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;

module.exports = function (it) {
  if (description.correct || !description.valueOf) return it.description;
  // Unbox before inspecting prototypes: foreign symbols are valid, proxies are not.
  try {
    description.valueOf(it);
  } catch (error) {
    return it.description;
  }
  for (var object = $Object(it); object; object = getPrototypeOf(object)) {
    var descriptor = getOwnPropertyDescriptor(object, 'description');
    if (descriptor) {
      // Select the accessor before calling it: an override can delete or replace itself.
      if (!descriptor.get || descriptor.get !== description.getter) return it.description;
      break;
    }
  }
  return call(description.get, it);
};
