// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toObject = require('../internals/to-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIterator = require('../internals/get-iterator');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method');

var IteratorProxy = createIteratorProxy(function () {
  return call(this.next, this.iterator);
}, true);

$({ target: 'Iterator', stat: true, forced: true }, {
  from: function from(O) {
    var object = toObject(O);
    var usingIterator = getIteratorMethod(object);
    var iteratorRecord;
    if (usingIterator) {
      iteratorRecord = getIteratorDirect(getIterator(object, usingIterator));
      if (isPrototypeOf(IteratorPrototype, iteratorRecord.iterator)) return iteratorRecord.iterator;
    } else {
      iteratorRecord = getIteratorDirect(object);
    } return new IteratorProxy(iteratorRecord);
  }
});
