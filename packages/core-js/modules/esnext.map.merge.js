'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var iterate = require('../internals/iterate');

// `Map.prototype.merge` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  merge: function merge(iterable) {
    var map = anObject(this);
    iterate(iterable, aFunction(map.set), map, true);
    return map;
  }
});
