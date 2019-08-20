'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  var state = this;
  var Promise = state.Promise;

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
      }, reject);
    };

    loop();
  });
});

$({ target: 'AsyncIterator', proto: true }, {
  drop: function drop(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
