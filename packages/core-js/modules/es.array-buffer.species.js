'use strict';
var setSpecies = require('../internals/set-species');

// ArrayBuffer[@@species] property
// https://tc39.es/ecma262/#sec-get-arraybuffer-@@species
setSpecies('ArrayBuffer');
