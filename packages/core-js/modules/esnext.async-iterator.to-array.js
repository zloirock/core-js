'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');

var push = [].push;

$({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    var Promise = getBuiltIn('Promise');
    var iterator = this;
    var next = iterator.next;
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
