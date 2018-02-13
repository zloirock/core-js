var anObject = require('../internals/an-object');
var getIteratorMethod = require('./core.get-iterator-method');

module.exports = require('../internals/core').getIterator = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iteratorMethod.call(it));
};
