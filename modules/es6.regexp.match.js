if(require('./$.need-fix-re-wks')('match')){
  var $match = ''.match
    , MATCH  = require('./$.wks')('match');
  // 21.1.3.11 String.prototype.match(regexp)
  require('./$.redef')(String.prototype, 'match', function match(regexp){
    var str = String(this)
      , fn  = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[MATCH](str);
  });
  // 21.2.5.6 RegExp.prototype[@@match](string)
  require('./$').hide(RegExp.prototype, MATCH, function(string){
    return $match.call(string, this);
  });
}