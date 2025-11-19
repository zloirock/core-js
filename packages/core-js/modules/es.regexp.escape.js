'use strict';
var $ = require('../internals/export');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var uncurryThis = require('../internals/function-uncurry-this');
var aString = require('../internals/a-string');
var hasOwn = require('../internals/has-own-property');
var WHITESPACES = require('../internals/whitespaces');

var $Array = Array;
var $escape = RegExp.escape;
var charCodeAt = uncurryThis(''.charCodeAt);
// dependency: es.string.pad-start
var padStart = uncurryThis(getBuiltInPrototypeMethod('String', 'padStart'));
var numberToString = uncurryThis(1.1.toString);
var join = uncurryThis([].join);
var FIRST_DIGIT_OR_ASCII = /^[0-9a-z]/i;
var SYNTAX_SOLIDUS = /^[$()*+./?[\\\]^{|}]/;
var OTHER_PUNCTUATORS_AND_WHITESPACES = RegExp('^[!"#%&\',\\-:;<=>@`~' + WHITESPACES + ']');
var exec = uncurryThis(FIRST_DIGIT_OR_ASCII.exec);

var ControlEscape = {
  '\u0009': 't',
  '\u000A': 'n',
  '\u000B': 'v',
  '\u000C': 'f',
  '\u000D': 'r',
};

var escapeChar = function (char) {
  var hex = numberToString(charCodeAt(char, 0), 16);
  return hex.length < 3 ? '\\x' + padStart(hex, 2, '0') : '\\u' + padStart(hex, 4, '0');
};

// Avoiding the use of polyfills of the previous iteration of this proposal
var FORCED = !$escape || $escape('ab') !== '\\x61b';

// `RegExp.escape` method
// https://tc39.es/ecma262/#sec-regexp.escape
$({ target: 'RegExp', stat: true, forced: FORCED }, {
  escape: function escape(S) {
    aString(S);
    var length = S.length;
    var result = $Array(length);

    for (var i = 0; i < length; i++) {
      var char = S[i];
      if (i === 0 && exec(FIRST_DIGIT_OR_ASCII, char)) {
        result[i] = escapeChar(char);
      } else if (hasOwn(ControlEscape, char)) {
        result[i] = '\\' + ControlEscape[char];
      } else if (exec(SYNTAX_SOLIDUS, char)) {
        result[i] = '\\' + char;
      } else if (exec(OTHER_PUNCTUATORS_AND_WHITESPACES, char)) {
        result[i] = escapeChar(char);
      } else {
        var charCode = charCodeAt(char, 0);
        // single UTF-16 code unit
        if ((charCode & 0xF800) !== 0xD800) result[i] = char;
        // unpaired surrogate
        else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = escapeChar(char);
        // surrogate pair
        else {
          result[i] = char;
          result[++i] = S[i];
        }
      }
    }

    return join(result, '');
  },
});
