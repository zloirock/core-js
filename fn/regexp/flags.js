require('../../modules/es.regexp.flags');
var flags = require('../../modules/_flags');

module.exports = function (it) {
  return flags.call(it);
};
