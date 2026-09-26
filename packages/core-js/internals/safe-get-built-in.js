'use strict';
var globalThis = require('../internals/global-this');

// Avoid NodeJS experimental warning
module.exports = function (name) {
  var descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  return descriptor && descriptor.value;
};
