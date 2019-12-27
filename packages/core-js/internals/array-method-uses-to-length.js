var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var has = require('../internals/has');

var defineProperty = Object.defineProperty;

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, options) {
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    var addTrap = function (key) {
      if (ACCESSORS) defineProperty(O, key, { enumerable: true, get: thrower });
      else O[key] = 1;
    };

    addTrap(1);
    addTrap(2147483646);
    addTrap(4294967294);
    method.call(O, argument0, argument1);
  });
};
