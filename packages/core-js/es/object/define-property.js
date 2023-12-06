'use strict';
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = function defineProperty(it, key, desc) {
  return getBuiltInStaticMethod('Object', 'defineProperty')(it, key, desc);
};
