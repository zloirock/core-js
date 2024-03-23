'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toString = require('../internals/to-string');
var padStart = require('../internals/string-pad').start;
var WHITESPACES = require('../internals/whitespaces');

var charCodeAt = uncurryThis(''.charCodeAt);
var replace = uncurryThis(''.replace);
var numberToString = uncurryThis(1.1.toString);
var NEED_ESCAPING = RegExp('[!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^`{|}~' + WHITESPACES + ']', 'g');

// `RegExp.escape` method
// https://github.com/tc39/proposal-regex-escaping
$({ target: 'RegExp', stat: true, forced: true }, {
  escape: function escape(S) {
    var str = toString(S);
    var firstCode = charCodeAt(str, 0);
    // escape first DecimalDigit
    return (firstCode > 47 && firstCode < 58 ? '\\x3' : '') + replace(str, NEED_ESCAPING, function (match) {
      var hex = numberToString(charCodeAt(match, 0), 16);
      return hex.length < 3 ? '\\x' + padStart(hex, 2, '0') : '\\u' + padStart(hex, 4, '0');
    });
  }
});
