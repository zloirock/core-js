var global = require('core-js-internals/global');

module.exports = function (CONSTRUCTOR) {
  return global[CONSTRUCTOR].prototype;
};
