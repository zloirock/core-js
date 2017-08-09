require('../../modules/es.regexp.search');
var SEARCH = require('../../modules/_wks')('search');
module.exports = function (it, str) {
  return RegExp.prototype[SEARCH].call(it, str);
};
