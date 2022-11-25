var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var symmetricDifference = require('../internals/set-symmetric-difference');

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  symmetricDifference: symmetricDifference
});
