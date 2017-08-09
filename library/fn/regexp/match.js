require('../../modules/es.regexp.match');
var MATCH = require('../../modules/_wks')('match');
module.exports = function (it, str) {
  return RegExp.prototype[MATCH].call(it, str);
};
