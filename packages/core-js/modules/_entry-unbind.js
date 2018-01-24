var global = require('core-js-internals/global');
var ctx = require('./_ctx');
var call = Function.call;

module.exports = function (CONSTRUCTOR, METHOD, length) {
  return ctx(call, global[CONSTRUCTOR].prototype[METHOD], length);
};
