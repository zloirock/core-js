var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method');

module.exports = function (obj) {
  var object = anObject(obj);
  var method = getIteratorMethod(object);
  return getIteratorDirect(anObject(method !== undefined ? call(method, object) : object));
};
