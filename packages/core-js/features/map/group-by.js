'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.group-by');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapGroupBy = Map.groupBy;

module.exports = function groupBy(source, iterable, keyDerivative) {
  return mapGroupBy.call(isCallable(this) ? this : Map, source, iterable, keyDerivative);
};
