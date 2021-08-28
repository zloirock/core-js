var AsyncFromSyncIterator = require('../internals/async-from-sync-iterator');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var getIterator = require('../internals/get-iterator');
var getMethod = require('../internals/get-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

module.exports = function (it, usingIterator) {
  var method = arguments.length < 2 ? getMethod(it[ASYNC_ITERATOR]) : usingIterator;
  if (method === undefined) {
    return new AsyncFromSyncIterator(getIterator(it));
  } return anObject(aFunction(method).call(it));
};
