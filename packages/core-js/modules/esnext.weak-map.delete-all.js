'use strict';
var collectionDeleteAll = require('../internals/collection-delete-all');

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/collection-methods
require('../internals/export')({
  target: 'WeakMap', proto: true, real: true, forced: require('../internals/is-pure')
}, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});
