'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getSetIterator = require('../internals/get-set-iterator');

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var accumulator, step, value;
    aFunction(callbackfn);
    if (arguments.length > 1) accumulator = arguments[1];
    else {
      step = iterator.next();
      if (step.done) throw TypeError('Reduce of empty set with no initial value');
      accumulator = step.value;
    }
    while (!(step = iterator.next()).done) {
      accumulator = callbackfn(accumulator, value = step.value, value, set);
    }
    return accumulator;
  }
});
