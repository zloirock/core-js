'use strict';
var store = require('../internals/shared-store');

var create = Object.create;

module.exports = function (key, value) {
  return store[key] || (store[key] = value || create(null));
};
