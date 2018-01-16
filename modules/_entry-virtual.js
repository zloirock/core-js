var global = require('./_global');

module.exports = function (CONSTRUCTOR) {
  return global[CONSTRUCTOR].prototype;
};
