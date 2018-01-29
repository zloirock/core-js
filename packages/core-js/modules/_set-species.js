'use strict';
var global = require('core-js-internals/global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('core-js-internals/descriptors');
var SPECIES = require('core-js-internals/well-known-symbol')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};
