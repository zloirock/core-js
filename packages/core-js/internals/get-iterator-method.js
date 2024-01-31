'use strict';
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  // dependency: es.array.iterator
  // dependency: es.string.iterator
  // dependency: web.dom-collections.iterator
  return it[ITERATOR] || (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};
