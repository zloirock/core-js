'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.map');
require('../../modules/es.string.iterator');
require('../../modules/esnext.map.from');
require('../../modules/web.dom-collections.iterator');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Map = path.Map;
var mapFrom = uncurryThis(Map.from);

module.exports = function from(source, mapFn, thisArg) {
  return mapFrom(isCallable(this) ? this : Map, source, mapFn, thisArg);
};
