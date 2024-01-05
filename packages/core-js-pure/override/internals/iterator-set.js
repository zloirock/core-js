'use strict';
var globalThis = require('../internals/global-this');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (iterableName, method) {
  if (globalThis[iterableName].prototype[ITERATOR] !== method) {
    Iterators[iterableName] = method;
  }
};
