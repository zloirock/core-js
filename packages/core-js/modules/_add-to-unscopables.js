var UNSCOPABLES = require('core-js-internals/well-known-symbol')('unscopables');
var ObjectCreate = require('./_object-create');
var ArrayProto = Array.prototype;

if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, ObjectCreate(null));

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};
