'use strict';
var definePropertyModule = require('./_object-define-property');
var propertyDescriptor = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) definePropertyModule.f(object, index, propertyDescriptor(0, value));
  else object[index] = value;
};
