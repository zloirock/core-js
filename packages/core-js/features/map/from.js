'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.from');
var Map = require('../../internals/path').Map;
var mapFrom = Map.from;

module.exports = function from(source, mapFn, thisArg) {
  return mapFrom.call(typeof this === 'function' ? this : Map, source, mapFn, thisArg);
};
