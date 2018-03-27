require('../../modules/es.string.search');
var SEARCH = require('../../internals/well-known-symbol')('search');

module.exports = function (it, str) {
  return RegExp.prototype[SEARCH].call(it, str);
};
