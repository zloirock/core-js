var definePropertyModule = require('../internals/object-define-property');
var propertyDescriptor = require('../internals/property-desc');

module.exports = require('core-js-internals/descriptors') ? function (object, key, value) {
  return definePropertyModule.f(object, key, propertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};
