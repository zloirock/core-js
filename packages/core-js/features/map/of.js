'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.map');
require('../../modules/esnext.map.of');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapOf = Map.of;

module.exports = function of() {
  return mapOf.apply(isCallable(this) ? this : Map, arguments);
};
