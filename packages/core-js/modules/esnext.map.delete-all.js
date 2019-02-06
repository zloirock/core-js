'use strict';
var collectionDeleteAll = require('../internals/collection-delete-all');

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({
  target: 'Map', proto: true, real: true, forced: require('../internals/is-pure')
}, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});
