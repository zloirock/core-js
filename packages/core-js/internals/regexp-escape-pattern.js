'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var charAt = uncurryThis(''.charAt);

// EscapeRegExpPattern, optionally expanding dots for the dotAll polyfill.
module.exports = function (pattern, dotAll) {
  var result = '';
  var brackets = false;
  for (var i = 0; i < pattern.length; i++) {
    var chr = charAt(pattern, i);
    var escaped = chr === '\\';
    if (escaped) chr = charAt(pattern, ++i);
    switch (chr) {
      case '\n': result += '\\n'; continue;
      case '\r': result += '\\r'; continue;
      case '\u2028': result += '\\u2028'; continue;
      case '\u2029': result += '\\u2029'; continue;
    }
    if (escaped) result += '\\';
    else if (chr === '[') brackets = true;
    else if (chr === ']') brackets = false;
    else if (!brackets && chr === '/') chr = '\\/';
    else if (!brackets && dotAll && chr === '.') chr = '[\\s\\S]';
    result += chr;
  } return result || '(?:)';
};
