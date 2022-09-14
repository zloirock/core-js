'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toString = require('../internals/to-string');

var $Array = Array;
var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var join = uncurryThis([].join);
var REPLACEMENT_CHARACTER = '\uFFFD';

// `String.prototype.toWellFormed` method
// https://github.com/tc39/proposal-is-usv-string
$({ target: 'String', proto: true, forced: true }, {
  toWellFormed: function toWellFormed() {
    var S = toString(requireObjectCoercible(this));
    var length = S.length;
    var result = $Array(length);
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt(S, i);
      // single UTF-16 code unit
      if ((charCode & 0xF800) != 0xD800) result[i] = charAt(S, i);
      // unpaired surrogate
      else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt(S, i + 1) & 0xFC00) != 0xDC00) result[i] = REPLACEMENT_CHARACTER;
      // surrogate pair
      else {
        result[i] = charAt(S, i);
        result[++i] = charAt(S, i);
      }
    } return join(result, '');
  }
});
