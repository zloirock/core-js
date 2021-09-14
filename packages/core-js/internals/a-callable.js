var isCallable = require('../internals/is-callable');

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw TypeError(String(argument) + ' is not a function');
};
