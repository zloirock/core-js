'use strict';
var anObject = require('../internals/an-object');
var getMapIterator = require('../internals/get-map-iterator');

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  keyOf: function keyOf(searchElement) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var step, entry;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      if (entry[1] === searchElement) return entry[0];
    }
  }
});
