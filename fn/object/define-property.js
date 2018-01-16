require('../../modules/es.object.define-property');
var $Object = require('../../modules/_path').Object;

module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};
