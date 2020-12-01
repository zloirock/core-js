var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
};
