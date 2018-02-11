require('../../modules/es.object.get-own-property-names');
var $Object = require('../../internals/path').Object;

module.exports = function getOwnPropertyNames(it) {
  return $Object.getOwnPropertyNames(it);
};
