'use strict';
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, index, value) {
  if (index in object) definePropertyModule.f(object, index, createPropertyDescriptor(0, value));
  else object[index] = value;
};
