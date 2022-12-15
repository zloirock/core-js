'use strict';
var $ = require('../internals/export');
var MapHelpers = require('../internals/map-helpers');

var aMap = MapHelpers.aMap;
var iterate = MapHelpers.iterate;

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    return iterate(aMap(this), function (value, key) {
      if (value === searchElement) return key;
    }, true);
  }
});
