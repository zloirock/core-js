'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var bind = require('../internals/bind-context');
var speciesConstructor = require('../internals/species-constructor');
var getMapIterator = require('../internals/get-map-iterator');

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: IS_PURE }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aFunction(newMap.set);
    var step, entry, key;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      setter.call(newMap, key = entry[0], boundFunction(entry[1], key, map));
    }
    return newMap;
  }
});
