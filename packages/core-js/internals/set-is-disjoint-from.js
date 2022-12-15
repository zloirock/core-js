'use strict';
var aSet = require('../internals/a-set');
var has = require('../internals/set-helpers').has;
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
module.exports = function isDisjointFrom(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  return false !== (size(O) <= otherRec.size
    ? iterateSet(O, function (e) {
      if (otherRec.includes(e)) return false;
    }, true)
    : iterateSimple(otherRec.getIterator(), function (e) {
      if (has(O, e)) return false;
    })
  );
};
