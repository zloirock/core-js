'use strict';
var classof = require('../internals/classof-raw');
var getMethod = require('../internals/get-method');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  // @dependency: es.array.iterator
  // @dependency: es.string.iterator
  // @dependency: web.dom-collections.iterator
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR) || (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};
