'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var size = require('../internals/set-size');
var iterate = require('../internals/set-iterate');
var getSetRecord = require('../internals/get-set-record');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSubsetOf') }, {
  isSubsetOf: function isSubsetOf(other) {
    var O = aSet(this);
    var otherRec = getSetRecord(other);
    if (size(O) > otherRec.size) return false;
    return iterate(O, function (e) {
      if (!otherRec.includes(e)) return false;
    }, true) !== false;
  },
});
