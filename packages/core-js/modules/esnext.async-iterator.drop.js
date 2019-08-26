'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        // eslint-disable-next-line max-len
        Promise.resolve(anObject(state.next.call(state.iterator, state.remaining ? undefined : arg))).then(function (step) {
          try {
            if (anObject(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else if (state.remaining) {
              state.remaining--;
              loop();
            } else resolve({ done: false, value: step.value });
          } catch (err) { reject(err); }
        }, reject);
      } catch (error) { reject(error); }
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
