require('../../modules/es.string.iterator');
var get = require('../../modules/_iterators').String;
module.exports = function (it) {
  return get.call(it);
};
