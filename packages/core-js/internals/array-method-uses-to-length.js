var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

var defineProperty = Object.defineProperty;

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, argument, ACCESSORS) {
  var method = [][METHOD_NAME];

  return !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    var add = function (key) {
      if (ACCESSORS) defineProperty(O, key, { enumerable: true, get: thrower });
      else O[key] = 1;
    };

    add(1);
    add(2147483646);
    add(4294967294);
    method.call(O, thrower, argument);
  });
};
