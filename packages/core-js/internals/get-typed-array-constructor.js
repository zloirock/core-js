'use strict';
var getTypedArrayMetadata = require('../internals/typed-array-core').getTypedArrayMetadata;

module.exports = function (it) {
  return getTypedArrayMetadata(it, 'TypedArrayConstructor');
};
