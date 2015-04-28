// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true)
  , $ = require('./$');


function $pad(that, minLength, fillChar, left) {

  // 2. Let S be ToString(O).
  var S = that.toString();

  if ( minLength === undefined ) {
    // 4. If intMinLength is undefined, return S.
    return S;
  } else {
    // 4. Let intMinLength be ToInteger(minLength).
    var intMinLength = $.toInteger(minLength);
  }


  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;

  if ( fillLen < 0 ||
       fillLen == Infinity ) {
    // 6. If fillLen < 0, then throw a RangeError exception.
    // 7. If fillLen is +∞, then throw a RangeError exception.
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string ' + s);
  }

  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar && fillChar.toString ? fillChar.toString() : ' ';

  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var len = sFillStr.length;
  var sFillVal = "";

  for ( var i = 0; i < fillLen; i += len ) {
    sFillVal += sFillStr;
  }

  // truncate if we overflowed
  sFillVal = sFillVal.substr(0, fillLen);

  if ( left ) {
    // 11. Return a string made from sFillVal, followed by S.
    return sFillVal.concat(S);
  } else {
    // 11. Return a String made from S, followed by sFillVal.
    return S.concat(sFillVal);
  }
};

$def($def.P, 'String', {
  lpad: function lpad(minLength, fillChar) {
    return $pad(this, minLength, fillChar, true);
  },
  rpad: function rpad(minLength, fillChar) {
    return $pad(this, minLength, fillChar, false);
  }
});
