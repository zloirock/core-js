'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  var state = this;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      Promise.resolve(anObject(state.next.apply(state.iterator, arguments))).then(function (step) {
        if (state.remaining) {
          state.remaining--;
          if (step.done) {
            state.done = true;
            resolve({ done: true, value: undefined });
          } else loop();
        } else resolve(step);
      }, reject).then(null, reject);
    };

    loop();
  });
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
