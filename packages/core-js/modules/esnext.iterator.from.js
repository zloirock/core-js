// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIteratorFlattenable = require('../internals/get-iterator-flattenable');

var IteratorProxy = createIteratorProxy(function () {
  return call(this.next, this.iterator);
}, true);

$({ target: 'Iterator', stat: true, forced: true }, {
  from: function from(O) {
    var iteratorRecord = getIteratorFlattenable(O);
    return isPrototypeOf(IteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new IteratorProxy(iteratorRecord);
  }
});
