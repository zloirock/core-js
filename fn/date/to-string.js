require('../../modules/es.date.to-string');
var $toString = Date.prototype.toString;

module.exports = function toString(it) {
  return $toString.call(it);
};
