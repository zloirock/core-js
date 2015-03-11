'use strict';
var $        = require('./$')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , toLength = $.toLength
  , min      = Math.min
  , String   = $.g.String
  , assertDefined = $.assertDefined;
function assertNotRegExp(it){
  if(cof(it) == 'RegExp')throw TypeError();
}

$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: require('./$.string-at')(false),
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function(searchString /*, endPosition = @length */){
    assertNotRegExp(searchString);
    var that = String(assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  },
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function(searchString /*, position = 0 */){
    assertNotRegExp(searchString);
    return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
  },
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: function(count){
    var str = String(assertDefined(this))
      , res = ''
      , n   = $.toInteger(count);
    if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
    return res;
  },
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function(searchString /*, position = 0 */){
    assertNotRegExp(searchString);
    var that  = String(assertDefined(this))
      , index = toLength(min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});