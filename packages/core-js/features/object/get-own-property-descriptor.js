require('../../modules/es.object.get-own-property-descriptor');
var $Object = require('../../internals/path').Object;

module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};
