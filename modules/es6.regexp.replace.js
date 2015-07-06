if(require('./$.need-fix-re-wks')('replace')){
  var $replace = ''.replace
    , REPLACE  = require('./$.wks')('replace');
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  require('./$.redef')(String.prototype, 'replace', function replace(searchValue, replaceValue){
    var str = String(this)
      , fn  = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, str, replaceValue)
      : $replace.call(str, searchValue, replaceValue);
  });
  // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
  require('./$').hide(RegExp.prototype, REPLACE, function(string, replaceValue){
    return $replace.call(string, this, replaceValue);
  });
}