'use strict';
var isCallable = require('../internals/is-callable');
var getInternalIterator = require('../internals/get-internal-iterator');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  var method = it[ITERATOR];
  return method || isCallable(method) ? method : getInternalIterator(it);
};
