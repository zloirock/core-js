require('../../modules/es.object.define-properties');
var $Object = require('../../modules/_path').Object;

module.exports = function defineProperties(T, D) {
  return $Object.defineProperties(T, D);
};
