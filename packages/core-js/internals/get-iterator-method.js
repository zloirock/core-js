'use strict';
var classof = require('../internals/classof');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
