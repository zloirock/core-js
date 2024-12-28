'use strict';
var makeBuiltIn = require('../internals/make-built-in');
var defineProperty = require('../internals/object-define-property');

module.exports = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { prefix: 'get ' });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { prefix: 'set ' });
  return defineProperty.f(target, name, descriptor);
};
