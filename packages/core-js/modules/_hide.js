var definePropertyModule = require('./_object-define-property');
var propertyDescriptor = require('./_property-desc');

module.exports = require('core-js-internals/descriptors') ? function (object, key, value) {
  return definePropertyModule.f(object, key, propertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};
