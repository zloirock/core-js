var aFunction = require('../internals/a-function');

var bind = Function.prototype.bind;

// optional / simple context binding
module.exports = function (fn, that) {
  aFunction(fn);
  return that === undefined ? fn : bind.call(fn, that);
};
