'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');

$({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var iterator = anObject(this);
    var next = aFunction(iterator.next);
    var hasInitialValue = arguments.length > 1;
    var accumulator = hasInitialValue ? arguments[1] : undefined;
    var empty = true;
    aFunction(reducer);

    return new Promise(function (resolve, reject) {
      var loop = function () {
        Promise.resolve(next.call(iterator)).then(function (step) {
          if (step.done) {
            if (empty && !hasInitialValue) reject('Reduce of empty iterator with no initial value');
            else resolve(accumulator);
          } else {
            var value = step.value;
            if (empty && !hasInitialValue) {
              empty = false;
              accumulator = value;
              loop();
            } else {
              Promise.resolve(reducer(accumulator, value)).then(function (result) {
                accumulator = result;
                loop();
              }, reject).then(null, reject);
            }
          }
        }, reject).then(null, reject);
      };

      loop();
    });
  }
});
