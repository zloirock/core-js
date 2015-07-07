module.exports = function(KEY, exec){
  var SYMBOL  = require('./$.wks')(KEY)
    , methods = exec(SYMBOL, ''[KEY]);
  if(function(){
    try {
      var O = {};
      O[SYMBOL] = function(){ return 7; };
      return ''[KEY](O) != 7;
    } catch(e){
      return true;
    }
  }()){
    require('./$.redef')(String.prototype, KEY, methods[0]);
    require('./$').hide(RegExp.prototype, SYMBOL, methods[1]);
  }
};