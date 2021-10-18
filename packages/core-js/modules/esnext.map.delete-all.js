'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var deleteAll = require('../internals/collection-delete-all');

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: IS_PURE }, {
  deleteAll: deleteAll
});
