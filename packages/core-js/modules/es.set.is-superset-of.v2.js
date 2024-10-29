'use strict';
var $ = require('../internals/export');
var isSupersetOf = require('../internals/set-is-superset-of');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

// `Set.prototype.isSupersetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issupersetof
$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSupersetOf') }, {
  isSupersetOf: isSupersetOf
});
