'use strict';
var $ = require('../internals/export');
var MapHelpers = require('../internals/map-helpers');
var createCollectionFrom = require('../internals/collection-from');

// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
// @dependency: es.map.constructor
$({ target: 'Map', stat: true, forced: true }, {
  from: createCollectionFrom(MapHelpers.Map, MapHelpers.set, true),
});
