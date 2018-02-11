require('../../modules/es.object.create');
var $Object = require('../../internals/path').Object;

module.exports = function create(P, D) {
  return $Object.create(P, D);
};
