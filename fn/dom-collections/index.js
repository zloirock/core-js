require('../../modules/web.dom.for-each');
require('../../modules/web.dom.iterable');
var $iterators = require('../../modules/es.array.iterator');
module.exports = {
  keys: $iterators.keys,
  values: $iterators.values,
  entries: $iterators.entries,
  iterator: $iterators.values,
  forEach: require('../../modules/_array-for-each')
};
