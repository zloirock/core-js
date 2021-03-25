'use strict';
var $ = require('../internals/export');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toLength = require('../internals/to-length');
var toInteger = require('../internals/to-integer');
var fails = require('../internals/fails');

var FORCED = fails(function () {
  return '𠮷'.at(0) !== '\uD842';
});

// `String.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$({ target: 'String', proto: true, forced: FORCED }, {
  at: function at(index) {
    var S = String(requireObjectCoercible(this));
    var len = toLength(S.length);
    var relativeIndex = toInteger(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : S.charAt(k);
  },
});
