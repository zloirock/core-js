'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var clone = require('../internals/set-clone');
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');
var fails = require('../internals/fails');
var setMethodAcceptSetLike = require('../internals/set-method-accept-set-like');

var has = SetHelpers.has;
var remove = SetHelpers.remove;

var SET_LIKE_INCORRECT_BEHAVIOR = !setMethodAcceptSetLike('difference', function (result) {
  return result.size === 0;
});

var FORCED = SET_LIKE_INCORRECT_BEHAVIOR || fails(function () {
  // https://bugs.webkit.org/show_bug.cgi?id=288595
  var setLike = {
    size: 1,
    has: function () { return true; },
    keys: function () {
      var index = 0;
      return {
        next: function () {
          var done = index++ > 1;
          if (baseSet.has(1)) baseSet.clear();
          return { done: done, value: 2 };
        },
      };
    },
  };
  var baseSet = new Set([1, 2, 3, 4]);
  // eslint-disable-next-line es/no-set-prototype-difference -- testing
  return baseSet.difference(setLike).size !== 3;
});

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  difference: function difference(other) {
    var O = aSet(this);
    var otherRec = getSetRecord(other);
    var result = clone(O);
    if (size(O) <= otherRec.size) iterateSet(O, function (e) {
      if (otherRec.includes(e)) remove(result, e);
    });
    else iterateSimple(otherRec.getIterator(), function (e) {
      if (has(result, e)) remove(result, e);
    });
    return result;
  },
});
