'use strict';
var getTypedArrayMetadata = require('../internals/array-buffer-view-core').getTypedArrayMetadata;

module.exports = function (it) {
  return getTypedArrayMetadata(it, 'TypedArrayConstructor');
};
