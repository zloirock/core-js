'use strict';
var path = require('../internals/path');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var bind = require('../internals/bind-context');
var speciesConstructor = require('../internals/species-constructor');
var Map = path.Map;
var entries = Map.prototype.entries;

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = entries.call(map);
    var boundFn = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, Map))();
    var setter = aFunction(newMap.set);
    var step, entry, key;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      setter.call(newMap, key = entry[0], boundFn(entry[1], key, map));
    }
    return newMap;
  }
});
