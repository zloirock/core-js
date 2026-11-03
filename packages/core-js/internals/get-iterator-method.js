'use strict';
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var method = it[ITERATOR];
  if (method || isCallable(method)) return method;
  method = it['@@iterator'];
  return method || isCallable(method) ? method : (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};
