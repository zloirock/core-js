require('../../modules/es.regexp.search');
var SEARCH = require('core-js-internals/well-known-symbol')('search');

module.exports = function (it, str) {
  return RegExp.prototype[SEARCH].call(it, str);
};
