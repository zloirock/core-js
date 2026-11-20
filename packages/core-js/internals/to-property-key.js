'use strict';
var toPrimitive = require('../internals/to-primitive');
var isSymbol = require('../internals/is-symbol');

var $String = String;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  // Rhino 1.7.14 - 1.9.2 can treat a concatenated array index as a named property in Object.defineProperty.
  // https://github.com/mozilla/rhino/issues/2600
  return isSymbol(key) ? key : $String(key);
};
