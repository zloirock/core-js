'use strict';
var aTypedArrayConstructor = require('../internals/a-typed-array-constructor');
var getTypedArrayConstructor = require('../internals/array-buffer-view-core').getTypedArrayConstructor;
var speciesConstructor = require('../internals/species-constructor');

// a part of `TypedArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#typedarray-species-create
module.exports = function (originalArray) {
  return aTypedArrayConstructor(speciesConstructor(originalArray, getTypedArrayConstructor(originalArray)));
};
