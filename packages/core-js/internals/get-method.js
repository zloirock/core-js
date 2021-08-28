var aFunction = require('../internals/a-function');

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (fn) {
  return fn == null ? undefined : aFunction(fn);
};
