'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var clone = require('../internals/set-clone');
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var has = SetHelpers.has;
var remove = SetHelpers.remove;

var INCORRECT = !setMethodAcceptSetLike('difference', function (result) {
  return result.size === 0;
});

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  difference: function difference(other) {
    var O = aSet(this);
    var otherRec = getSetRecord(other);
    var result = clone(O);
    if (size(O) <= otherRec.size) iterateSet(O, function (e) {
      if (otherRec.includes(e)) remove(result, e);
    });
    else iterateSimple(otherRec.getIterator(), function (e) {
      if (has(O, e)) remove(result, e);
    });
    return result;
  }
});
