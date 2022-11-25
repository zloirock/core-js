var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var union = require('../internals/set-union');

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  union: union
});
