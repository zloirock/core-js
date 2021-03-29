var global = require('../internals/global');

var call = Function.call;

module.exports = function (CONSTRUCTOR, METHOD) {
  return call.bind(global[CONSTRUCTOR].prototype[METHOD]);
};
