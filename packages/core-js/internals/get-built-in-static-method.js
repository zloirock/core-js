'use strict';
var global = require('../internals/global');

module.exports = function (NAMESPACE, METHOD) {
  var C = global[NAMESPACE];
  return C && C[METHOD];
};
