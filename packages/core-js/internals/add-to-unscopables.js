var UNSCOPABLES = require('../internals/well-known-symbol')('unscopables');
var create = require('../internals/object-create');
var hide = require('../internals/hide');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) hide(ArrayPrototype, UNSCOPABLES, create(null));

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};
