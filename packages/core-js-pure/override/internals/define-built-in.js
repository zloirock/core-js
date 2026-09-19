'use strict';
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, key, value, options) {
  if (!options) options = {};
  return definePropertyModule.f(target, key, {
    value: value,
    enumerable: options.enumerable,
    configurable: !options.nonConfigurable,
    writable: !options.nonWritable,
  });
};
