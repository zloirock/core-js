var isConstructor = require('../internals/is-constructor');

// `Assert: IsConstructor(argument) is true`
module.exports = function (argument) {
  if (isConstructor(argument)) return argument;
  throw TypeError(String(argument) + ' is not a constructor');
};
