var trimWS='[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]',
    LTrim=new RegExp('^'+trimWS+trimWS+'*'),
    RTrim=new RegExp(trimWS+trimWS+'*$'),
    repeat=$String.repeat||function(count){
      return fill.call(Array(toInt(count)),this).join('')
    };