'use strict';
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

module.exports = function (CONSTRUCTOR) {
  var C = global[CONSTRUCTOR];
  return isCallable(C) ? C : undefined;
};
