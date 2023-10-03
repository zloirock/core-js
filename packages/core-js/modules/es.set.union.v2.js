'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var add = require('../internals/set-helpers').add;
var clone = require('../internals/set-clone');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');
var setMethodGetKeysBeforeCloning = require('../internals/set-method-get-keys-before-cloning-detection');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var FORCED = !setMethodAcceptSetLike('union') || !setMethodGetKeysBeforeCloning('union');

// `Set.prototype.union` method
// https://tc39.es/ecma262/#sec-set.prototype.union
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  union: function union(other) {
    var O = aSet(this);
    var keysIter = getSetRecord(other).getIterator();
    var result = clone(O);
    iterateSimple(keysIter, function (it) {
      add(result, it);
    });
    return result;
  }
});
