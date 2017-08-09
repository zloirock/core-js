'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.from');
var $Map = require('../../modules/_core').Map;
var $from = $Map.from;
module.exports = function from(source, mapFn, thisArg) {
  return $from.call(typeof this === 'function' ? this : $Map, source, mapFn, thisArg);
};
