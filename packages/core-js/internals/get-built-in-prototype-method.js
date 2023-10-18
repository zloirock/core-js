'use strict';
var global = require('../internals/global');

module.exports = function (CONSTRUCTOR, METHOD) {
  return global[CONSTRUCTOR].prototype[METHOD];
};
