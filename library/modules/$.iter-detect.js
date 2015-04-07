var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
!function(){
  try {
    var iter = [1][SYMBOL_ITERATOR]();
    iter['return'] = function(){ SAFE_CLOSING = true; };
    Array.from(iter, function(){ throw 2; });
  } catch(e){ /* empty */ }
}();
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [[{}, 1]]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};