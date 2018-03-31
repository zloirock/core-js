'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.key-by');
var Map = require('../../internals/path').Map;
var mapKeyBy = Map.keyBy;

module.exports = function keyBy(source, iterable, keyDerivative) {
  return mapKeyBy.call(typeof this === 'function' ? this : Map, source, iterable, keyDerivative);
};
