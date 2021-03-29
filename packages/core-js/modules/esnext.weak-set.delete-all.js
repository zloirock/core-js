'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var collectionDeleteAll = require('../internals/collection-delete-all');

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  },
});
