'use strict';
var $ = require('../internals/export');
var normalizeIteratorMethod = require('../internals/iterator-normalize-method');
var ArrayIterator = require('../internals/array-iterator-constructor');
var addToUnscopables = require('../internals/add-to-unscopables');

var method = normalizeIteratorMethod(Array, 'Array', 'entries') || function entries() {
  return new ArrayIterator(this, 'entries');
};

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// eslint-disable-next-line es/no-array-prototype-entries -- safe
$({ target: 'Array', proto: true, forced: [].entries !== method }, {
  entries: method,
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('entries');
