'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var MapHelpers = require('../internals/map-helpers');
var iterate = require('../internals/map-iterate');

var Map = MapHelpers.Map;
var aMap = MapHelpers.aMap;
var set = MapHelpers.set;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map();
    iterate(map, function (value, key) {
      set(newMap, boundFunction(value, key, map), value);
    });
    return newMap;
  }
});
