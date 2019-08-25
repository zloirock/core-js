'use strict';
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var getBuiltIn = require('../internals/get-built-in');

var Promise = getBuiltIn('Promise');
var push = [].push;

$({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    var iterator = anObject(this);
    var next = aFunction(iterator.next);
    var result = [];

    return new Promise(function (resolve, reject) {
      var loop = function () {
        Promise.resolve(next.call(iterator)).then(function (step) {
          if (step.done) {
            resolve(result);
          } else {
            push.call(result, step.value);
            loop();
          }
        }, reject);
      };

      loop();
    });
  }
});
