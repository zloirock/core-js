'use strict';
var getInternalIterator = require('../internals/get-internal-iterator');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  return it[ITERATOR] !== undefined || it['@@iterator'] !== undefined || !!getInternalIterator(it);
};
