'use strict';
var setSpecies = require('../internals/set-species');

// `RegExp[@@species]` getter
// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies('RegExp');
