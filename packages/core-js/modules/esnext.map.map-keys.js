'use strict';
var path = require('./_path');
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var bind = require('core-js-internals/bind-context');
var speciesConstructor = require('core-js-internals/species-constructor');
var Map = path.Map;
var entries = Map.prototype.entries;

// https://github.com/Ginden/collection-methods
require('./_export')({ target: 'Map', proto: true, real: true, forced: require('./_is-pure') }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = entries.call(map);
    var boundFn = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(this, Map))();
    var setter = aFunction(newMap.set);
    var step, entry, value;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      setter.call(newMap, boundFn(value = entry[1], entry[0], map), value);
    }
    return newMap;
  }
});
