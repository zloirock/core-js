'use strict';
var collectionAddAll = require('../internals/collection-add-all');

// `Set.prototype.addAll` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll.apply(this, arguments);
  }
});
