var global = require('core-js-internals/global');
var bind = require('core-js-internals/bind-context');
var call = Function.call;

module.exports = function (CONSTRUCTOR, METHOD, length) {
  return bind(call, global[CONSTRUCTOR].prototype[METHOD], length);
};
