'use strict';
var call = require('../internals/function-call');
var defineProperty = require('../internals/object-define-property').f;

var stop = function () { throw new Error('Unexpected index access'); };
var guard = { get: stop, set: stop };

module.exports = function (method, start) {
  // Reject shims that copy skipped indices before trying a large length.
  var O = {};
  var length = 2;
  var reads = 0;
  O[1] = O;
  defineProperty(O, 'length', {
    get: function () { reads++; return length; },
    set: function (value) { length = value; }
  });
  defineProperty(O, 0, guard);
  var result = call(method, O, start, 1);
  if (reads !== 1 || length !== 2 - start || result.length !== 1 || result[0] !== O) stop();
  length = 0x1FFFFFFFFFFFFF;
  return defineProperty(O, length - 3, guard);
};
