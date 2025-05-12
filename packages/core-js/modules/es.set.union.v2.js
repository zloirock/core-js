'use strict';
var $ = require('../internals/export');
var union = require('../internals/set-union');
var setMethodGetNextBeforeCloning = require('../internals/set-method-get-next-before-cloning-detection');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var FORCED = !setMethodAcceptSetLike('union') || !setMethodGetNextBeforeCloning('union');

// `Set.prototype.union` method
// https://tc39.es/ecma262/#sec-set.prototype.union
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  union: union
});
