'use strict';
var $ = require('../internals/export');
var fill = require('../internals/array-fill');
var addToUnscopables = require('../internals/add-to-unscopables');

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
// eslint-disable-next-line es/no-array-prototype-fill -- safe
$({ target: 'Array', proto: true, forced: [].fill !== fill }, {
  fill: fill,
});

// https://tc39.es/ecma262/#sec-array.prototype-%symbol.unscopables%
addToUnscopables('fill');
