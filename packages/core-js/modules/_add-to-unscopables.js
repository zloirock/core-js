var UNSCOPABLES = require('core-js-internals/well-known-symbol')('unscopables');
var objectCreate = require('./_object-create');
var ArrayPrototype = Array.prototype;

if (ArrayPrototype[UNSCOPABLES] == undefined) require('./_hide')(ArrayPrototype, UNSCOPABLES, objectCreate(null));

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};
