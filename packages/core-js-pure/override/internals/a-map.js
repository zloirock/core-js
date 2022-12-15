var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');

module.exports = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'get' in it && 'set' in it && 'delete' in it && 'entries' in it) return it;
  throw TypeError(tryToString(it) + ' is not a map');
};
