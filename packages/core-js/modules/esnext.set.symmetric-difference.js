'use strict';
var path = require('../internals/path');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var speciesConstructor = require('../internals/species-constructor');
var iterate = require('../internals/iterate');
var Set = path.Set;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, Set))(set);
    var remover = aFunction(newSet['delete']);
    var adder = aFunction(newSet.add);
    iterate(iterable, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});
