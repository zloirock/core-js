'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

$({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    var iterator = anObject(this);
    var next = aFunction(iterator.next);

    aFunction(fn);

    return new Promise(function (resolve, reject) {
      var loop = function () {
        Promise.resolve(next.call(iterator)).then(function (step) {
          if (step.done) {
            resolve();
          } else {
            Promise.resolve(callWithSafeIterationClosing(iterator, fn, step.value)).then(loop).then(null, reject);
          }
        }, reject).then(null, reject);
      };

      loop();
    });
  }
});
