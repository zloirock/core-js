'use strict';
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  // @dependency: es.array.iterator
  // @dependency: es.string.iterator
  // @dependency: web.dom-collections.iterator
  var method = it[ITERATOR];
  return method || isCallable(method) ? method : (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};
