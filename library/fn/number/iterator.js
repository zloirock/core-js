require('../../modules/core.number.iterator');
var get = require('../../modules/$.iter').get;
module.exports = function(it){
  return get(Number(it));
};