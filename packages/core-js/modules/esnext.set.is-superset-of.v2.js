var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var isSupersetOf = require('../internals/set-is-superset-of');

// `Set.prototype.isSupersetOf` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  isSupersetOf: isSupersetOf
});
