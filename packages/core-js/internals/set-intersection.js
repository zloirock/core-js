'use strict';
var SetHelpers = require('../internals/set-helpers');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');

var Set = SetHelpers.Set;
var aSet = SetHelpers.aSet;
var add = SetHelpers.add;
var has = SetHelpers.has;
var size = SetHelpers.size;
var forEach = SetHelpers.forEach;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
module.exports = function intersection(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = new Set();
  if (size(O) <= otherRec.size) forEach(O, function (e) {
    if (otherRec.includes(e)) add(result, e);
  });
  else iterateSimple(otherRec.getIterator(), function (e) {
    if (has(O, e)) add(result, e);
  });
  return result;
};
