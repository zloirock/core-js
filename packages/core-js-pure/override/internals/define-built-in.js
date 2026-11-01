'use strict';
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var createProperty = require('../internals/create-property');

module.exports = function (target, key, value, options) {
  // Assignment does not change enumerability of an existing property.
  if (options && options.enumerable) createProperty(target, key, value);
  else createNonEnumerableProperty(target, key, value);
  return target;
};
