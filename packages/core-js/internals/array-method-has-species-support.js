var fails = require('../internals/fails');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  return !fails(function () {
    var object = {};
    var constructor = object.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return [][METHOD_NAME].call(object, Boolean).foo !== 1;
  });
};
