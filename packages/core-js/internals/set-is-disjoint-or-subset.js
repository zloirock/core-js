var Set = require('../internals/path').Set;
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getSetIterator = require('../internals/get-set-iterator');
var iterate = require('../internals/iterate');
var classof = require('../internals/classof');
var BREAK = iterate.BREAK;

module.exports = function (set, iterable, disjointMark) {
  var iterator = getSetIterator(anObject(set));
  var otherSet = classof(anObject(iterable)) == 'Set' ? iterable : new Set(iterable);
  var hasCheck = aFunction(otherSet.has);
  return iterate(iterator, function (value) {
    if (hasCheck.call(otherSet, value) === disjointMark) return BREAK;
  }) !== BREAK;
};
