'use strict';
var Set = require('../internals/path').Set;
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getSetIterator = require('../internals/get-set-iterator');
var iterate = require('../internals/iterate');
var classof = require('../internals/classof');
var BREAK = iterate.BREAK;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getSetIterator(anObject(this));
    var otherSet = classof(anObject(iterable)) == 'Set' ? iterable : new Set(iterable);
    var hasCheck = aFunction(otherSet.has);
    return iterate(iterator, function (value) {
      if (hasCheck.call(otherSet, value) === false) return BREAK;
    }) !== BREAK;
  }
});
