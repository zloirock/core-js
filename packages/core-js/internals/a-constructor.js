var isConstructor = require('../internals/is-constructor');
var tryToString = require('../internals/try-to-string');

// `Assert: IsConstructor(argument) is true`
module.exports = function (argument) {
  if (isConstructor(argument)) return argument;
  throw TypeError(tryToString(argument) + ' is not a constructor');
};
