'use strict';
var path = require('../internals/path');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var speciesConstructor = require('../internals/species-constructor');
var iterate = require('../internals/iterate');
var Set = path.Set;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  union: function union(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, Set))(set);
    iterate(iterable, aFunction(newSet.add), newSet);
    return newSet;
  }
});
