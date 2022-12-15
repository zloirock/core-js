var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');

var WeakSet = getBuiltIn('WeakSet');

var aWeakSet = function (it) {
  anObject(it);
  if ('has' in it && 'add' in it && 'delete' in it) return it;
  throw TypeError(tryToString(it) + ' is not a weakset');
};

var caller = require('../internals/caller');

module.exports = {
  aWeakSet: aWeakSet,
  WeakSet: getBuiltIn('WeakSet'),
  add: caller('add', 1),
  has: caller('has', 1),
  remove: caller('delete', 1)
};
