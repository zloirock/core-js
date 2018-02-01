'use strict';
var path = require('./_path');
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/tc39/collection-methods
require('./_export')({ target: 'Set', proto: true, real: true, forced: require('./_is-pure') }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject(this);
    var iterator = values.call(set);
    var accumulator, step, value;
    aFunction(callbackfn);
    if (arguments.length > 1) accumulator = arguments[1];
    else {
      step = iterator.next();
      if (step.done) throw TypeError('Reduce of empty set with no initial value!');
      accumulator = step.value;
    }
    while (!(step = iterator.next()).done) {
      accumulator = callbackfn(accumulator, value = step.value, value, set);
    }
    return accumulator;
  }
});
