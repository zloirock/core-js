// @types: proposals/set-methods
'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var Set = SetHelpers.Set;
var add = SetHelpers.add;
var has = SetHelpers.has;

var INCORRECT = !setMethodAcceptSetLike('intersection', function (result) {
  return result.size === 2 && result.has(1) && result.has(2);
}) || fails(function () {
  // eslint-disable-next-line es/no-array-from -- testing
  return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) !== '3,2';
});

// `Set.prototype.intersection` method
// https://tc39.es/ecma262/#sec-set.prototype.intersection
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  intersection: function intersection(other) {
    var O = aSet(this);
    var otherRec = getSetRecord(other);
    var result = new Set();

    if (size(O) > otherRec.size) {
      iterateSimple(otherRec.getIterator(), function (e) {
        if (has(O, e)) add(result, e);
      });
    } else {
      iterateSet(O, function (e) {
        if (otherRec.includes(e)) add(result, e);
      });
    }

    return result;
  },
});
