'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createAsyncIteratorProxy = require('../internals/async-iterator-create-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;
  var iterator = state.iterator;

  return Promise.resolve(anObject(call(state.next, iterator))).then(function (step) {
    if (anObject(step).done) {
      state.done = true;
      return { value: undefined, done: true };
    }
    return { value: [state.index++, step.value], done: false };
  }).then(null, function (error) {
    state.done = true;
    throw error;
  });
});

module.exports = function indexed() {
  return new AsyncIteratorProxy(getIteratorDirect(this), {
    index: 0
  });
};
