var has = require('../internals/has');

module.exports = function (descriptor) {
  return descriptor !== undefined && (has(descriptor, 'value') || has(descriptor, 'writable'));
};
