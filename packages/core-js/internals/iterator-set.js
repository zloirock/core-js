'use strict';
var globalThis = require('../internals/global-this');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (iterableName, method, options) {
  var target = globalThis[iterableName].prototype;
  if (target[ITERATOR] !== method) {
    defineBuiltIn(target, ITERATOR, method, options);
  }
};
