'use strict';
var path = require('../internals/path');
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (NAMESPACE) {
  return aFunction(path[NAMESPACE]) || aFunction(global[NAMESPACE]);
};
