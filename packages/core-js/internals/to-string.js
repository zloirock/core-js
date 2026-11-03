'use strict';
var classof = require('../internals/classof');

var $String = String;
var $TypeError = TypeError;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw new $TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};
