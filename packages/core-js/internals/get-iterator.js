var anObject = require('../internals/an-object');
var getIteratorMethod = require('../internals/get-iterator-method');

module.exports = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iteratorMethod.call(it));
};
