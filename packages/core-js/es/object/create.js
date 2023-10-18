'use strict';
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = function create(P, D) {
  return getBuiltInStaticMethod('Object', 'create')(P, D);
};
