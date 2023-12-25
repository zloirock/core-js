'use strict';
var TypedArray = require('../internals/typed-array-core').TypedArray;
var setSpecies = require('../internals/set-species');

// get %TypedArray%[@@species]
// https://tc39.es/ecma262/#sec-get-%typedarray%-@@species
setSpecies(TypedArray);
