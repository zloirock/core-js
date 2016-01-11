var fails = require('./_fails');

module.exports = function(method, arg){
  return fails(function(){
    arg ? method.call(null, function(){}) : method.call(null);
  });
};