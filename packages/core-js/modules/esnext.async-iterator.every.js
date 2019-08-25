'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

$({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(fn) {
    var iterator = anObject(this);
    var next = aFunction(iterator.next);
    aFunction(fn);

    return new Promise(function (resolve, reject) {
      var loop = function () {
        Promise.resolve(next.call(iterator)).then(function (step) {
          if (step.done) {
            resolve(true);
          } else {
            Promise.resolve(fn(step.value)).then(function (result) {
              result ? loop() : resolve(false);
            }, reject).then(null, reject);
          }
        }, reject).then(null, reject);
      };

      loop();
    });
  }
});
