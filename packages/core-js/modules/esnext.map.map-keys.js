'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var bind = require('../internals/bind-context');
var speciesConstructor = require('../internals/species-constructor');
var getMapIterator = require('../internals/get-map-iterator');
var Map = require('../internals/path').Map;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, Map))();
    var setter = aFunction(newMap.set);
    var step, entry, value;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      setter.call(newMap, boundFunction(value = entry[1], entry[0], map), value);
    }
    return newMap;
  }
});
