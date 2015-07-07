// @@replace logic
require('./$.fix-re-wks')('replace', function(REPLACE, $replace){
  return [
    // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
    function replace(searchValue, replaceValue){
      var str = String(this)
        , fn  = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, str, replaceValue)
        : $replace.call(str, searchValue, replaceValue);
    },
    // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
    function(string, replaceValue){
      return $replace.call(string, this, replaceValue);
    }
  ];
});