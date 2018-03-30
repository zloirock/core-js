var fails = require('../internals/fails');
var SPECIES = require('../internals/well-known-symbol')('species');

module.exports = function (exec) {
  return !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return exec(array).foo !== 1;
  });
};
