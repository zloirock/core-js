'use strict';
/* eslint-disable no-undef, no-useless-call, sonarjs/no-reference-error -- required for testing */
/* eslint-disable es/no-legacy-object-prototype-accessor-methods -- required for testing */
var IS_PURE = require('../internals/is-pure');
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');

// Forced replacement object prototype accessors methods
module.exports = IS_PURE || !fails(function () {
  var key = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete globalThis[key];
});
