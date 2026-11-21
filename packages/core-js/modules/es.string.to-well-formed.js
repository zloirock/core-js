'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toString = require('../internals/to-string');
var fails = require('../internals/fails');

var charCodeAt = uncurryThis(''.charCodeAt);
var stringSlice = uncurryThis(''.slice);
// eslint-disable-next-line es/no-string-prototype-towellformed -- safe
var $toWellFormed = ''.toWellFormed;
var REPLACEMENT_CHARACTER = '\uFFFD';

// Safari bug
var TO_STRING_CONVERSION_BUG = $toWellFormed && fails(function () {
  return call($toWellFormed, 1) !== '1';
});

// `String.prototype.toWellFormed` method
// https://tc39.es/ecma262/#sec-string.prototype.towellformed
$({ target: 'String', proto: true, forced: TO_STRING_CONVERSION_BUG }, {
  toWellFormed: function toWellFormed() {
    var S = toString(requireObjectCoercible(this));
    if (TO_STRING_CONVERSION_BUG) return call($toWellFormed, S);
    var length = S.length;
    var result = '';
    var start = 0;
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt(S, i);
      if ((charCode & 0xF800) !== 0xD800) continue;
      if (charCode < 0xDC00 && i + 1 < length && (charCodeAt(S, i + 1) & 0xFC00) === 0xDC00) {
        i++;
      } else {
        result += stringSlice(S, start, i) + REPLACEMENT_CHARACTER;
        start = i + 1;
      }
    } return start ? result + stringSlice(S, start) : S;
  }
});
