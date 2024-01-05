'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var getIteratorMethod = require('../internals/get-iterator-method');
var addToUnscopables = require('../internals/add-to-unscopables');

// dependency: es.array.iterator
var method = getIteratorMethod([]);

// V8 ~ Chrome 45- bug
if (!IS_PURE && method.name !== 'values') try {
  Object.defineProperty(method, 'name', { value: 'values', configurable: true });
} catch (error) { /* empty */ }

// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// eslint-disable-next-line es/no-array-prototype-values -- safe
$({ target: 'Array', proto: true, forced: [].values !== method }, {
  values: method,
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('values');
