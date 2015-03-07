'use strict';
var $        = require('./$')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , toLength = $.toLength
  , min      = Math.min
  , STRING   = 'String'
  , String   = $.g[STRING]
  , assertDefined = $.assertDefined
  , fromCharCode  = String.fromCharCode;
function assertNotRegExp(it){
  if(cof(it) == 'RegExp')throw TypeError();
}

$def($def.S, STRING, {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function(x){
    var res = []
      , len = arguments.length
      , i   = 0
      , code
    while(len > i){
      code = +arguments[i++];
      if($.toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  },
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function(callSite){
    var raw = $.toObject(callSite.raw)
      , len = toLength(raw.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
     res.push(String(raw[i++]));
     if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});

$def($def.P, STRING, {
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