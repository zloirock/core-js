'use strict';
var globalThis = require('../internals/global-this');
var isCallable = require('../internals/is-callable');

module.exports = function (CONSTRUCTOR) {
  var C = globalThis[CONSTRUCTOR];
  return isCallable(C) ? C : undefined;
};
