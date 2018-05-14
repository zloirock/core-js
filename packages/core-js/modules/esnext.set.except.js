'use strict';
var path = require('../internals/path');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var speciesConstructor = require('../internals/species-constructor');
var iterate = require('../internals/iterate');
var Set = path.Set;

// `Set.prototype.except` method
// https://github.com/tc39/set-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  except: function except(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, Set))(set);
    var remover = aFunction(newSet['delete']);
    iterate(iterable, function (value) {
      remover.call(newSet, value);
    });
    return newSet;
  }
});
