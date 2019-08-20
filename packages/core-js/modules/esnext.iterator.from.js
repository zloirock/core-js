var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');
var createIteratorProxy = require('../internals/create-iterator-proxy');
var getIteratorMethod = require('../internals/get-iterator-method');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;

var Iterator = function () { /* empty */ };

Iterator.prototype = IteratorPrototype;

var IteratorProxy = createIteratorProxy(function () {
  var result = anObject(this.next.apply(this.iterator, arguments));
  var done = this.done = !!result.done;
  if (!done) return result.value;
}, true);

$({ target: 'Iterator', stat: true }, {
  from: function from(O) {
    var object = toObject(O);
    var usingIterator = getIteratorMethod(object);
    var iterator;
    if (usingIterator != null) {
      iterator = aFunction(usingIterator).call(object);
      if (iterator instanceof Iterator) return iterator;
    } else {
      iterator = object;
    } return new IteratorProxy({
      iterator: iterator
    });
  }
});
