var $ = require('../../modules/_');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};