'use strict';
var path = require('../internals/path');
var globalThis = require('../internals/global-this');

var getMethod = function (C, METHOD) {
  return C && C[METHOD];
};

module.exports = function (NAMESPACE, METHOD) {
  return getMethod(path[NAMESPACE], METHOD) || getMethod(globalThis[NAMESPACE], METHOD);
};
