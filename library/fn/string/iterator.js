require('../../modules/es6.string.iterator');
var get = require('../../modules/$.iter').get;
module.exports = function(it){
  return get(String(it));
};