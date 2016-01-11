var fails = require('./_fails');

module.exports = function(method, arg){
  return fails(function(){
    arg ? method.call(null, arg) : method.call(null);
  });
};