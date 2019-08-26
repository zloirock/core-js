'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return Promise.resolve(anObject(state.next.call(iterator, arg))).then(function (step) {
    if (anObject(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(callWithSafeIterationClosing(iterator, mapper, step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      mapper: aFunction(mapper)
    });
  }
});
