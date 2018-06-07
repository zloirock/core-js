require('../../modules/es.object.define-properties');
var Object = require('../../internals/path').Object;

var defineProperties = module.exports = function defineProperties(T, D) {
  return Object.defineProperties(T, D);
};

if (Object.defineProperties.sham) defineProperties.sham = true;
