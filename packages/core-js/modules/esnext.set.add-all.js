'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var addAll = require('../internals/collection-add-all');

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  addAll: addAll
});
