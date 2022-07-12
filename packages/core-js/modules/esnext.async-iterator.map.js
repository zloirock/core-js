'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createAsyncIteratorProxy = require('../internals/async-iterator-create-proxy');
var closeAsyncIteration = require('../internals/async-iterator-close');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return new Promise(function (resolve, reject) {
    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration(iterator, reject, error, reject);
    };

    Promise.resolve(anObject(call(state.next, iterator))).then(function (step) {
      try {
        if (anObject(step).done) {
          state.done = true;
          resolve({ done: true, value: undefined });
        } else {
          var value = step.value;
          try {
            Promise.resolve(mapper(value)).then(function (mapped) {
              resolve({ done: false, value: mapped });
            }, ifAbruptCloseAsyncIterator);
          } catch (error2) { ifAbruptCloseAsyncIterator(error2); }
        }
      } catch (error) { reject(error); }
    }, reject);
  });
});

$({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy(getIteratorDirect(this), {
      mapper: aCallable(mapper)
    });
  }
});
