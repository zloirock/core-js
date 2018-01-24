var core = require('./_core');

module.exports = function (CONSTRUCTOR, METHOD) {
  return core[CONSTRUCTOR][METHOD];
};
