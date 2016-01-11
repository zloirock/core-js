var fails = require('./_fails');

module.exports = function(method, args){
  return fails(function(){
    method.apply(null, args || []);
  });
};