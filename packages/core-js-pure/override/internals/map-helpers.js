var getBuiltIn = require('../internals/get-built-in');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var caller = require('../internals/caller');

var Map = getBuiltIn('Map');

var aMap = function (it) {
  anObject(it);
  if ('size' in it && 'has' in it && 'get' in it && 'set' in it && 'delete' in it && 'entries' in it) return it;
  throw TypeError(tryToString(it) + ' is not a map');
};

module.exports = {
  Map: Map,
  aMap: aMap,
  set: caller('set', 2),
  get: caller('get', 1),
  has: caller('has', 1),
  remove: caller('delete', 1),
  proto: Map.prototype
};
