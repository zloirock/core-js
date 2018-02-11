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
  filter: function filter(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = values.call(set);
    var boundFn = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor(set, Set))();
    var adder = aFunction(newSet.add);
    var step, value;
    while (!(step = iterator.next()).done) {
      if (boundFn(value = step.value, value, set)) adder.call(newSet, value);
    }
    return newSet;
  }
});
