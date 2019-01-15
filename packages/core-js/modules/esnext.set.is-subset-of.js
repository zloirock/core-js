'use strict';
var Set = require('../internals/path').Set;
var anObject = require('../internals/an-object');
var getIterator = require('../internals/get-iterator');
var iterate = require('../internals/iterate');
var BREAK = iterate.BREAK;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getIterator(this);
    var otherSet = anObject(iterable);
    var hasCheck = otherSet.has;
    if (typeof hasCheck != 'function') {
      otherSet = new Set(iterable);
      hasCheck = otherSet.has;
    }
    return iterate(iterator, function (value) {
      if (hasCheck.call(otherSet, value) === false) return BREAK;
    }, undefined, false, true) !== BREAK;
  }
});
