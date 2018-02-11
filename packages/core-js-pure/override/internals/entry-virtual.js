var core = require('../internals/core');

module.exports = function (CONSTRUCTOR) {
  return core[CONSTRUCTOR].virtual;
};
