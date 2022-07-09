// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIterator = require('../internals/get-iterator');
var getIteratorDirect = require('../internals/get-iterator-direct');
var getIteratorMethod = require('../internals/get-iterator-method');

var IteratorProxy = createIteratorProxy(function () {
  var result = anObject(call(this.next, this.iterator));
  var done = this.done = !!result.done;
  if (!done) return result.value;
}, true);

$({ target: 'Iterator', stat: true, forced: true }, {
  from: function from(O) {
    var object = toObject(O);
    var usingIterator = getIteratorMethod(object);
    var iterator;
    if (usingIterator) {
      iterator = getIterator(object, usingIterator);
      if (isPrototypeOf(IteratorPrototype, iterator)) return iterator;
    } else {
      iterator = object;
    } return new IteratorProxy(getIteratorDirect(iterator));
  }
});
