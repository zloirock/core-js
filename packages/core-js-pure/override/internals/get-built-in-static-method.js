'use strict';
var path = require('../internals/path');
var global = require('../internals/global');

var getMethod = function (C, METHOD) {
  return C && C[METHOD];
};

module.exports = function (NAMESPACE, METHOD) {
  return getMethod(path[NAMESPACE], METHOD) || getMethod(global[NAMESPACE], METHOD);
};
