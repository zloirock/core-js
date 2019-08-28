'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var getIteratorMethod = require('../internals/get-iterator-method');
var createIteratorProxy = require('../internals/create-iterator-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');

var IteratorProxy = createIteratorProxy(function (arg) {
  var state = this;
  var iterator = state.iterator;
  var result, mapped, iteratorMethod, innerIterator;

  while (true) {
    if (innerIterator = state.innerIterator) {
      result = anObject(state.innerNext.call(innerIterator));
      if (!result.done) return result.value;
      state.innerIterator = state.innerNext = null;
    }

    result = anObject(state.next.call(iterator, arg));

    if (state.done = !!result.done) return;

    mapped = callWithSafeIterationClosing(iterator, state.mapper, result.value);

    if (isObject(mapped) && (iteratorMethod = getIteratorMethod(mapped)) !== undefined) {
      state.innerIterator = innerIterator = iteratorMethod.call(mapped);
      state.innerNext = aFunction(innerIterator.next);
      continue;
    } return mapped;
  }
});

$({ target: 'Iterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new IteratorProxy({
      iterator: anObject(this),
      mapper: aFunction(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});
