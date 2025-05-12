'use strict';
var getBuiltIn = require('../internals/get-built-in');

var Set = getBuiltIn('Set');

// Should get next before cloning this
// https://bugs.webkit.org/show_bug.cgi?id=289430
module.exports = function (METHOD_NAME) {
  var baseSet = new Set([]);
  var setLike = {
    size: 0,
    has: function () { return true; },
    keys: function () {
      var o = {};
      // eslint-disable-next-line es/no-object-defineproperty -- needed for test
      Object.defineProperty(o, 'next', {
        get: function () {
          baseSet.clear();
          baseSet.add(4);
          return function () {
            return { done: true };
          };
        }
      });
      return o;
    }
  };
  var result = baseSet[METHOD_NAME](setLike);

  return result.size !== 1 || result.values().next().value !== 4;
};
