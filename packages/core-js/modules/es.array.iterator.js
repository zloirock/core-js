'use strict';
var defineIterator = require('../internals/iterator-define');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var ArrayIterator = require('../internals/array-iterator-constructor');

// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
defineIterator('Array', normalizeIteratorMethod(Array, 'Array') || function values() {
  return new ArrayIterator(this, 'values');
});
