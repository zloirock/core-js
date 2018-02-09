var toInteger = require('core-js-internals/to-integer');
var requireObjectCoercible = require('core-js-internals/require-object-coercible');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var S = String(requireObjectCoercible(that));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xd800 || first > 0xdbff || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xdc00 || second > 0xdfff
        ? TO_STRING ? S.charAt(position) : first
        : TO_STRING ? S.slice(position, position + 2) : (first - 0xd800 << 10) + (second - 0xdc00) + 0x10000;
  };
};
