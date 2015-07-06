if(require('./$.need-fix-re-wks')('search')){
  var $search = ''.search
    , SEARCH  = require('./$.wks')('search');
  // 21.1.3.15 String.prototype.search(regexp)
  require('./$.redef')(String.prototype, 'search', function search(regexp){
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[SEARCH](str);
  });
  // 21.2.5.9 RegExp.prototype[@@search](string)
  require('./$').hide(RegExp.prototype, SEARCH, function(string){
    return $search.call(string, this);
  });
}