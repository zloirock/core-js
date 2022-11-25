var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var difference = require('../internals/set-difference');

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  difference: difference
});
