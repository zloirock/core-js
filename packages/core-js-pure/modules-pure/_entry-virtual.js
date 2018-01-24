var core = require('./_core');

module.exports = function (CONSTRUCTOR) {
  return core[CONSTRUCTOR].virtual;
};
