var path = require('../internals/path');

module.exports = function (CONSTRUCTOR, METHOD) {
  return path[CONSTRUCTOR][METHOD];
};
