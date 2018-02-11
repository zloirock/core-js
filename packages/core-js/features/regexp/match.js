require('../../modules/es.regexp.match');
var MATCH = require('core-js-internals/well-known-symbol')('match');

module.exports = function (it, str) {
  return RegExp.prototype[MATCH].call(it, str);
};
