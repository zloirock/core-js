'use strict';
var getMethod = require('../internals/get-method');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var getInternalIterator = require('../internals/get-internal-iterator');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) {
    var method = getMethod(it, ITERATOR);
    if (method !== undefined) return method;
    method = getMethod(it, '@@iterator');
    return method !== undefined ? method : getInternalIterator(it);
  }
};
