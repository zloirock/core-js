'use strict';
var globalThis = require('../internals/global-this');

var document = globalThis.document;
var EXISTS = document && typeof document.createElement == 'function';

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};
