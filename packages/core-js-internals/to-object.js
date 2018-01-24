// 7.1.13 ToObject(argument)
var requireObjectCoercible = require('./require-object-coercible');

module.exports = function (it) {
  return Object(requireObjectCoercible(it));
};
