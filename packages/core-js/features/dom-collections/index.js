require('../../modules/web.dom-collections.for-each');
require('../../modules/web.dom-collections.iterator');
var ArrayIterators = require('../../modules/es.array.iterator');

module.exports = {
  keys: ArrayIterators.keys,
  values: ArrayIterators.values,
  entries: ArrayIterators.entries,
  iterator: ArrayIterators.values,
  forEach: require('../../internals/array-for-each')
};
