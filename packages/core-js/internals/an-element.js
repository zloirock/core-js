'use strict';
var globalThis = require('./global-this');

var $TypeError = TypeError;
var $Element = globalThis.Element;

module.exports = function (argument) {
  if ($Element !== undefined && argument instanceof $Element) return argument;
  throw new $TypeError('Illegal invocation');
};
