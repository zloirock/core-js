require('../../modules/es.string.iterator');
var getStringIterator = require('../../internals/iterators').String;

module.exports = function (it) {
  return getStringIterator.call(it);
};
