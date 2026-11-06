'use strict';
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
// @dependency: es.array-buffer.species
// @dependency: es.array.species
// @dependency: es.regexp.species
// @dependency: es.typed-array.species
defineWellKnownSymbol('species');
