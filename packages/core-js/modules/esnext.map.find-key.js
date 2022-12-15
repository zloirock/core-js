'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var MapHelpers = require('../internals/map-helpers');

var aMap = MapHelpers.aMap;
var iterate = MapHelpers.iterate;

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return key;
    }, true);
  }
});
