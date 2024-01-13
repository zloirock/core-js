'use strict';
var isObject = require('../internals/is-object');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');

module.exports = function (it) {
  return isObject(it) && !!getTypedArrayConstructor(it);
};
