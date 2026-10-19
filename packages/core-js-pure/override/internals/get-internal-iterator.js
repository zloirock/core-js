'use strict';
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var klass = classof(it);
  // a native array iterator is not in the registry, and some engines (like Firefox < 46) have it,
  // but no own `@@iterator` on `arguments` objects
  if (klass === 'Arguments') return hasOwn(Iterators, 'Array') ? Iterators.Array : ArrayPrototype[ITERATOR];
  return hasOwn(Iterators, klass) ? Iterators[klass] : undefined;
};
