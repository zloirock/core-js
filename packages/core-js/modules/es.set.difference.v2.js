'use strict';
var $ = require('../internals/export');
var difference = require('../internals/set-difference');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('difference') }, {
  difference: difference
});
