'use strict';
var SetHelpers = require('../internals/set-helpers');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');

var aSet = SetHelpers.aSet;
var has = SetHelpers.has;
var remove = SetHelpers.remove;
var size = SetHelpers.size;
var forEach = SetHelpers.forEach;
var clone = SetHelpers.clone;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
module.exports = function difference(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = clone(O);
  if (size(O) <= otherRec.size) forEach(O, function (e) {
    if (otherRec.includes(e)) remove(result, e);
  });
  else iterateSimple(otherRec.getIterator(), function (e) {
    if (has(O, e)) remove(result, e);
  });
  return result;
};
