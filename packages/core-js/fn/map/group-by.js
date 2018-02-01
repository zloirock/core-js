'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.group-by');
var Map = require('../../modules/_path').Map;
var fn = Map.groupBy;

module.exports = function groupBy(source, iterable, keyDerivative) {
  return fn.call(typeof this === 'function' ? this : Map, source, iterable, keyDerivative);
};
