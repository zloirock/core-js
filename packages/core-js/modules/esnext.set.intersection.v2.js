var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var intersection = require('../internals/set-intersection');

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  intersection: intersection
});
