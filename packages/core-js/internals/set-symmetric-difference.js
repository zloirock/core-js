'use strict';
var SetHelpers = require('../internals/set-helpers');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');

var aSet = SetHelpers.aSet;
var add = SetHelpers.add;
var has = SetHelpers.has;
var remove = SetHelpers.remove;
var clone = SetHelpers.clone;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
module.exports = function symmetricDifference(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (e) {
    if (has(O, e)) remove(result, e);
    else add(result, e);
  });
  return result;
};
