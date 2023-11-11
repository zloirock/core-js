'use strict';
var $ = require('../internals/export');
var aMap = require('../internals/a-map');
var remove = require('../internals/map-helpers').remove;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aMap(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      remove(collection, arguments[k]);
    }
    return collection;
  }
});
