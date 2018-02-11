var core = require('../internals/core');

module.exports = function (CONSTRUCTOR, METHOD) {
  return core[CONSTRUCTOR][METHOD];
};
