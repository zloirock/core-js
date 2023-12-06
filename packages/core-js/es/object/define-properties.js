'use strict';
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = function create(T, D) {
  return getBuiltInStaticMethod('Object', 'defineProperties')(T, D);
};
