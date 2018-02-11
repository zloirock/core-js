'use strict';
var path = require('../internals/path');
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var speciesConstructor = require('core-js-internals/species-constructor');
var iterate = require('../internals/iterate');
var Set = path.Set;

// https://github.com/tc39/set-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, Set))(set);
    var remover = aFunction(newSet['delete']);
    var adder = aFunction(newSet.add);
    iterate(iterable, false, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});
