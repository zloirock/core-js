var $ = require('../internals/export');
var intersection = require('../internals/set-intersection');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('intersection') }, {
  intersection: intersection
});
