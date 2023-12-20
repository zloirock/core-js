'use strict';
var hasOwn = require('../internals/has-own-property');
var ownKeys = require('../internals/own-keys');

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;

module.exports = function (target, source) {
  ownKeys(source).forEach(function (key) {
    if (!hasOwn(target, key)) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  });
};
