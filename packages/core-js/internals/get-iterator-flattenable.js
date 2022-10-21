var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var toObject = require('../internals/to-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method');

module.exports = function (obj) {
  var object = toObject(obj);
  var method = getIteratorMethod(object);
  return getIteratorDirect(isCallable(method) ? call(method, object) : object);
};
