'use strict';
var globalThis = require('../internals/global-this');

module.exports = function (key, value) {
  try {
    Object.defineProperty(globalThis, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    globalThis[key] = value;
  } return value;
};
