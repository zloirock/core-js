'use strict';
var path = require('../internals/path');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var bind = require('../internals/bind-context');
var speciesConstructor = require('../internals/species-constructor');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = values.call(set);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor(set, Set))();
    var adder = aFunction(newSet.add);
    var step, value;
    while (!(step = iterator.next()).done) {
      adder.call(newSet, boundFunction(value = step.value, value, set));
    }
    return newSet;
  }
});
