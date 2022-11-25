var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var isSubsetOf = require('../internals/set-is-subset-of');

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  isSubsetOf: isSubsetOf
});
