var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var toObject = require('../internals/to-object');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var getIteratorMethod = require('../internals/get-iterator-method');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

var AsyncIterator = function () { /* empty */ };

AsyncIterator.prototype = AsyncIteratorPrototype;

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  return this.next.apply(this.iterator, arguments);
});

$({ target: 'AsyncIterator', stat: true }, {
  from: function from(O) {
    var object = toObject(O);
    var usingIterator = object[ASYNC_ITERATOR];
    var iterator;
    if (usingIterator === undefined) usingIterator = getIteratorMethod(object);
    if (usingIterator != null) {
      iterator = aFunction(usingIterator).call(object);
      if (iterator instanceof AsyncIterator) return iterator;
    } else {
      iterator = object;
    } return new AsyncIteratorProxy({
      iterator: iterator
    });
  }
});
