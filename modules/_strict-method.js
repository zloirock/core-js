var fails = require('./_fails');

module.exports = function(method, arg){
  return !!method && fails(function(){
    arg ? method.call(null, function(){ /* empty */ }, 1) : method.call(null);
  });
};