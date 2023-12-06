'use strict';
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = function create(it, key, desc) {
  return getBuiltInStaticMethod('Object', 'defineProperty')(it, key, desc);
};
