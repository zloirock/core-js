'use strict';
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');

module.exports = function (instance, list) {
  return arrayFromConstructorAndList(getTypedArrayConstructor(instance), list);
};
