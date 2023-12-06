'use strict';
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = function defineProperties(T, D) {
  return getBuiltInStaticMethod('Object', 'defineProperties')(T, D);
};
