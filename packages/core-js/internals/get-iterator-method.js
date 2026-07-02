'use strict';
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  return it[ITERATOR] || (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};
