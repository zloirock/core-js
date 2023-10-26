'use strict';
var global = require('../internals/global');

module.exports = function (CONSTRUCTOR, METHOD) {
  var Constructor = global[CONSTRUCTOR];
  var Prototype = Constructor && Constructor.prototype;
  return Prototype && Prototype[METHOD];
};
