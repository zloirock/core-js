'use strict';
var global = require('../internals/global');
var definePropertyModule = require('../internals/object-define-property');
var DESCRIPTORS = require('../internals/descriptors');
var SPECIES = require('../internals/well-known-symbol')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) definePropertyModule.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};
