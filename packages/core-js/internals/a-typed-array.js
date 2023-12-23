'use strict';
var isTypedArray = require('../internals/array-buffer-view-core').isTypedArray;

var $TypeError = TypeError;

module.exports = function (it) {
  if (isTypedArray(it)) return it;
  throw new $TypeError('Target is not a typed array');
};
