'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  var state = this;
  var iterator = state.iterator;

  return Promise.resolve(anObject(state.next.apply(iterator, arguments))).then(function (step) {
    if (step.done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return { done: false, value: [state.index++, step.value] };
  });
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      index: 0
    });
  }
});
