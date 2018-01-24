require('../../modules/es.regexp.flags');
var flags = require('core-js-internals/regexp-flags');

module.exports = function (it) {
  return flags.call(it);
};
