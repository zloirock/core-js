'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.group-by');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapGroupBy = uncurryThis(Map.groupBy);

module.exports = function groupBy(source, iterable, keyDerivative) {
  return mapGroupBy(isCallable(this) ? this : Map, source, iterable, keyDerivative);
};
