'use strict';
var globalThis = require('../internals/global-this');
var path = require('../internals/path');

var getMethod = function (C, METHOD) {
  return C && C[METHOD];
};

module.exports = function (NAMESPACE, METHOD) {
  return getMethod(path[NAMESPACE], METHOD) || getMethod(globalThis[NAMESPACE], METHOD);
};
