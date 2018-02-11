require('../../modules/es.regexp.match');
var MATCH = require('../../internals/well-known-symbol')('match');

module.exports = function (it, str) {
  return RegExp.prototype[MATCH].call(it, str);
};
