'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var speciesConstructor = require('../internals/species-constructor');
var Map = require('../internals/path').Map;
var iterate = require('../internals/iterate');

// `Map.prototype.merge` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  merge: function merge(iterable) {
    var map = anObject(this);
    var newMap = new (speciesConstructor(map, Map))();
    var setter = aFunction(newMap.set);
    iterate(map, setter, newMap, true);
    iterate(iterable, setter, newMap, true);
    return newMap;
  }
});
