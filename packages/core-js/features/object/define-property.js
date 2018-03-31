require('../../modules/es.object.define-property');
var Object = require('../../internals/path').Object;

var defineProperty = module.exports = function defineProperty(it, key, desc) {
  return Object.defineProperty(it, key, desc);
};

if (Object.defineProperty.sham) defineProperty.sham = true;
