require('../../modules/es.regexp.replace');
var REPLACE = require('../../internals/well-known-symbol')('replace');

module.exports = function (it, str, replacer) {
  return RegExp.prototype[REPLACE].call(it, str, replacer);
};
