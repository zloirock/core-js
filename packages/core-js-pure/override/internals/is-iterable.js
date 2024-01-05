'use strict';
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var getInternalIterator = require('../internals/get-internal-iterator');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (isNullOrUndefined(it)) return false;
  return it[ITERATOR] !== undefined || !!getInternalIterator(it);
};
