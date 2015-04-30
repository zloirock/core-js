// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
'use strict';
var $ = require('./$')
  , repeat = require('../fn/string/repeat');

module.exports = function $pad(that, minLength, fillChar, left) {
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));

  if ( minLength === undefined ) {
    // 4. If intMinLength is undefined, return S.
    return S;
  } else {
    // 4. Let intMinLength be ToInteger(minLength).
    var intMinLength = $.toInteger(minLength);
  }

  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;

  if ( fillLen < 0 || fillLen === Infinity ) {
    // 6. If fillLen < 0, then throw a RangeError exception.
    // 7. If fillLen is +∞, then throw a RangeError exception.
    throw new RangeError('Cannot satisfy string length ' +
                          minLength + ' for string ' + S);
  }

  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);

  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat(sFillStr, fillLen / sFillStr.length);

  // truncate if we overflowed
  if ( sFillVal.length > fillLen ) {
    sFillVal = sFillVal.slice(0, fillLen);
  }

  if ( left ) {
    // 11. Return a string made from sFillVal, followed by S.
    return sFillVal.concat(S);
  } else {
    // 11. Return a String made from S, followed by sFillVal.
    return S.concat(sFillVal);
  }
};
