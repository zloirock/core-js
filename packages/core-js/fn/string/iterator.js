require('../../modules/es.string.iterator');
var get = require('../../internals/iterators').String;

module.exports = function (it) {
  return get.call(it);
};
