'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.of');
var Map = require('../../internals/path').Map;
var mapOf = Map.of;

module.exports = function of() {
  return mapOf.apply(typeof this === 'function' ? this : Map, arguments);
};
