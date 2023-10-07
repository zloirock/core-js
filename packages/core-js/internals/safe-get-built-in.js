'use strict';
var global = require('../internals/global');

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
module.exports = function (name) {
  var descriptor = getOwnPropertyDescriptor(global, name);
  return descriptor && descriptor.value;
};
