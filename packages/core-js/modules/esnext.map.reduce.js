'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getMapIterator = require('../internals/get-map-iterator');

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Map', proto: true, real: true, forced: require('../internals/is-pure') }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var accumulator, step, entry;
    aFunction(callbackfn);
    if (arguments.length > 1) accumulator = arguments[1];
    else {
      step = iterator.next();
      if (step.done) throw TypeError('Reduce of empty map with no initial value');
      accumulator = step.value[1];
    }
    while (!(step = iterator.next()).done) {
      entry = step.value;
      accumulator = callbackfn(accumulator, entry[1], entry[0], map);
    }
    return accumulator;
  }
});
