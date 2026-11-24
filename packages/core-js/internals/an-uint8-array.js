'use strict';
var getTypedArrayName = require('../internals/get-typed-array-name');

var $TypeError = TypeError;

// Perform ? RequireInternalSlot(argument, [[TypedArrayName]])
// If argument.[[TypedArrayName]] is not "Uint8Array", throw a TypeError exception
module.exports = function (argument) {
  if (getTypedArrayName(argument) === 'Uint8Array') return argument;
  throw new $TypeError('Argument is not an Uint8Array');
};
