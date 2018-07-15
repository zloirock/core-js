'use strict';
var collectionAddAll = require('../internals/collection-add-all');
var IS_PURE = require('../internals/is-pure');

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll.apply(this, arguments);
  }
});
