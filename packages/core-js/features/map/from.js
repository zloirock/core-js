'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.map');
require('../../modules/es.string.iterator');
require('../../modules/esnext.map.from');
require('../../modules/web.dom-collections.iterator');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapFrom = Map.from;

module.exports = function from(source, mapFn, thisArg) {
  return mapFrom.call(isCallable(this) ? this : Map, source, mapFn, thisArg);
};
