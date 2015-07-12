require('../../modules/core.number.iterator');
var get = require('../../modules/$.iter').Iterators.Number;
module.exports = function(it){
  return get.call(it);
};