var fails = require('../internals/fails');

module.exports = function (METHOD_NAME) {
  var method = [][METHOD_NAME];
  return !!method && !fails(function () {
    method.call({ length: -1, 0: 1, 2147483646: 1, 4294967294: 1 }, function (it) { throw it; }, 1);
  }, 1);
};
