'use strict';
var path = require('../internals/path');
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var speciesConstructor = require('core-js-internals/species-constructor');
var iterate = require('../internals/iterate');
var Set = path.Set;

// https://github.com/tc39/set-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  union: function union(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, Set))(set);
    iterate(iterable, false, aFunction(newSet.add), newSet);
    return newSet;
  }
});
