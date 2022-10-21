// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var getAsyncIteratorFlattenable = require('../internals/get-async-iterator-flattenable');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var WrapAsyncIterator = require('../internals/async-iterator-wrap');

$({ target: 'AsyncIterator', stat: true, forced: true }, {
  from: function from(O) {
    var iteratorRecord = getAsyncIteratorFlattenable(O);
    return isPrototypeOf(AsyncIteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new WrapAsyncIterator(iteratorRecord);
  }
});
