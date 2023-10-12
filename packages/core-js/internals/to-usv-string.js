'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var toString = require('../internals/to-string');

// dependency: es.string.to-well-formed
var toWellFormed = uncurryThis(getBuiltInPrototypeMethod('String', 'toWellFormed'));

// Web IDL `USVString` conversion
// https://webidl.spec.whatwg.org/#es-USVString
module.exports = function (argument) {
  return toWellFormed(toString(argument));
};
