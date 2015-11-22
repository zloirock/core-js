// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function(arg){
  return cof(arg) == 'Array';
};