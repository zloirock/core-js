'use strict';
var global = require('../internals/global');
var path = require('../internals/path');

module.exports = function (CONSTRUCTOR, METHOD) {
  var $namespace = path[CONSTRUCTOR + 'Prototype'];
  return $namespace && $namespace[METHOD] || global[CONSTRUCTOR].prototype[METHOD];
};
