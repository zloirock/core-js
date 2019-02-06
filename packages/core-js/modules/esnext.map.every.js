'use strict';
var anObject = require('../internals/an-object');
var bind = require('../internals/bind-context');
var getMapIterator = require('../internals/get-map-iterator');

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var step, entry;
    while (!(step = iterator.next()).done) {
      entry = step.value;
      if (!boundFunction(entry[1], entry[0], map)) return false;
    } return true;
  }
});
