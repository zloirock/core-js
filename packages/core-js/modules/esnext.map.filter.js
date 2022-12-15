'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var MapHelpers = require('../internals/map-helpers');

var Map = MapHelpers.Map;
var aMap = MapHelpers.aMap;
var set = MapHelpers.set;
var iterate = MapHelpers.iterate;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map();
    iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) set(newMap, key, value);
    });
    return newMap;
  }
});
