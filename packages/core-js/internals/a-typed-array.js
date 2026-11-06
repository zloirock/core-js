'use strict';
var isTypedArray = require('../internals/is-typed-array');

var $TypeError = TypeError;

module.exports = function (it) {
  if (isTypedArray(it)) return it;
  throw new $TypeError('Target is not a typed array');
};
