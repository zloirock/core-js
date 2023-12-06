'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var has = require('../internals/set-helpers').has;
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');
var iteratorClose = require('../internals/iterator-close');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isDisjointFrom') }, {
  isDisjointFrom: function isDisjointFrom(other) {
    var O = aSet(this);
    var otherRec = getSetRecord(other);
    if (size(O) <= otherRec.size) return iterateSet(O, function (e) {
      if (otherRec.includes(e)) return false;
    }, true) !== false;
    var iterator = otherRec.getIterator();
    return iterateSimple(iterator, function (e) {
      if (has(O, e)) return iteratorClose(iterator, 'normal', false);
    }) !== false;
  },
});