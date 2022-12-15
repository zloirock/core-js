'use strict';
var $ = require('../internals/export');
var MapHelpers = require('../internals/map-helpers');
var iterate = require('../internals/map-iterate');

var aMap = MapHelpers.aMap;

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    var result = iterate(aMap(this), function (value, key) {
      if (value === searchElement) return { key: key };
    }, true);
    return result && result.key;
  }
});
