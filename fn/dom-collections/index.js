require('../../modules/web.dom-collections.for-each');
require('../../modules/web.dom-collections.iterator');
var $iterators = require('../../modules/es.array.iterator');
module.exports = {
  keys: $iterators.keys,
  values: $iterators.values,
  entries: $iterators.entries,
  iterator: $iterators.values,
  forEach: require('../../modules/_array-for-each')
};
