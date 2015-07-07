// @@search logic
require('./$.fix-re-wks')('search', function(SEARCH, $search){
  return [
    // 21.1.3.15 String.prototype.search(regexp)
    function search(regexp){
      var str = String(this)
        , fn  = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[SEARCH](str);
    },
    // 21.2.5.9 RegExp.prototype[@@search](string)
    function(string){
      return $search.call(string, this);
    }
  ];
});