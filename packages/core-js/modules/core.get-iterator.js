var anObject = require('../internals/an-object');
var get = require('./core.get-iterator-method');

module.exports = require('../internals/core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
