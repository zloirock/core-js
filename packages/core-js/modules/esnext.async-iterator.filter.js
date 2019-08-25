'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  var state = this;
  var iterator = state.iterator;
  var next = state.next;
  var filterer = state.filterer;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      Promise.resolve(anObject(next.apply(iterator, arguments))).then(function (step) {
        if (step.done) {
          state.done = true;
          resolve({ done: true, value: undefined });
        } else {
          var value = step.value;
          Promise.resolve(callWithSafeIterationClosing(iterator, filterer, value)).then(function (selected) {
            selected ? resolve({ done: false, value: value }) : loop();
          }, reject).then(null, reject);
        }
      }, reject).then(null, reject);
    };

    loop();
  });
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      filterer: aFunction(filterer)
    });
  }
});
