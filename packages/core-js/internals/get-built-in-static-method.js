'use strict';
var globalThis = require('../internals/global-this');

module.exports = function (NAMESPACE, METHOD) {
  var C = globalThis[NAMESPACE];
  return C && C[METHOD];
};
