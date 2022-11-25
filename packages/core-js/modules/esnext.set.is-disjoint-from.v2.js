var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var isDisjointFrom = require('../internals/set-is-disjoint-from');

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  isDisjointFrom: isDisjointFrom
});
