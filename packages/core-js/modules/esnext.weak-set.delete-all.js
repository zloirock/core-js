'use strict';
var collectionDeleteAll = require('../internals/collection-delete-all');
var IS_PURE = require('../internals/is-pure');

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});
