'use strict';
var defineIterator = require('../internals/iterator-define');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var ArrayIterator = require('../internals/array-iterator-constructor');
var IS_PURE = require('../internals/is-pure');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-%symbol.iterator%
defineIterator('Array', normalizeIteratorMethod(Array, 'Array') || function values() {
  return new ArrayIterator(this, 'values');
}, { name: 'values' });

// engines with native array iterator, but without arguments iterator (Firefox < 46)
// https://bugzilla.mozilla.org/show_bug.cgi?id=1067049
if (IS_PURE && !Iterators.Array && !function () { return arguments[ITERATOR]; }()) {
  Iterators.Array = Array.prototype[ITERATOR];
}
