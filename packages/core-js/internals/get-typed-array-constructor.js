'use strict';
var getTypedArrayName = require('../internals/get-typed-array-name');
var NativeTypedArrayConstructors = require('../internals/typed-array-core').NativeTypedArrayConstructors;

// the constructor of the current realm for [[TypedArrayName]] of the passed typed array
module.exports = function (it) {
  return NativeTypedArrayConstructors[getTypedArrayName(it)];
};
