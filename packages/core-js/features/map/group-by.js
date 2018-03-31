'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.group-by');
var Map = require('../../internals/path').Map;
var mapGroupBy = Map.groupBy;

module.exports = function groupBy(source, iterable, keyDerivative) {
  return mapGroupBy.call(typeof this === 'function' ? this : Map, source, iterable, keyDerivative);
};
