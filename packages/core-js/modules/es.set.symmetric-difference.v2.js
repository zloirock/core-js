'use strict';
var $ = require('../internals/export');
var symmetricDifference = require('../internals/set-symmetric-difference');
var setMethodGetNextBeforeCloning = require('../internals/set-method-get-next-before-cloning-detection');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var FORCED = !setMethodAcceptSetLike('symmetricDifference') || !setMethodGetNextBeforeCloning('symmetricDifference');

// `Set.prototype.symmetricDifference` method
// https://tc39.es/ecma262/#sec-set.prototype.symmetricdifference
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  symmetricDifference: symmetricDifference
});
