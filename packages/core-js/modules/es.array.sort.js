'use strict';
var $ = require('../internals/export');
var sort = require('../internals/array-sort');

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: [].sort !== sort }, {
  sort: sort
});
