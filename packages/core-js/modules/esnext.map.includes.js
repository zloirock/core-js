'use strict';
var anObject = require('../internals/an-object');
var getMapIterator = require('../internals/get-map-iterator');
var sameValueZero = require('../internals/same-value-zero');

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  includes: function includes(searchElement) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var step;
    while (!(step = iterator.next()).done) {
      if (sameValueZero(step.value[1], searchElement)) return true;
    }
    return false;
  }
});
