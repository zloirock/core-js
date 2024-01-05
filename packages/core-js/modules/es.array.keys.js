'use strict';
var $ = require('../internals/export');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var ArrayIterator = require('../internals/array-iterator-constructor');
var addToUnscopables = require('../internals/add-to-unscopables');

var method = normalizeIteratorMethod(Array, 'Array', 'keys') || function keys() {
  return new ArrayIterator(this, 'keys');
};

// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// eslint-disable-next-line es/no-array-prototype-keys -- safe
$({ target: 'Array', proto: true, forced: [].keys !== method }, {
  keys: method,
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
