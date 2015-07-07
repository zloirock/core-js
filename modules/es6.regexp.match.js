// @@match logic
require('./$.fix-re-wks')('match', function(MATCH, $match){
  return [
    // 21.1.3.11 String.prototype.match(regexp)
    function match(regexp){
      var str = String(this)
        , fn  = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, str) : new RegExp(regexp)[MATCH](str);
    },
    // 21.2.5.6 RegExp.prototype[@@match](string)
    function(string){
      return $match.call(string, this);
    }
  ];
});