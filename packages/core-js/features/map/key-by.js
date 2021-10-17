'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.key-by');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapKeyBy = uncurryThis(Map.keyBy);

module.exports = function keyBy(source, iterable, keyDerivative) {
  return mapKeyBy(isCallable(this) ? this : Map, source, iterable, keyDerivative);
};
