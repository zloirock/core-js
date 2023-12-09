'use strict';
var hasOwn = require('../internals/has-own-property');
var ownKeys = require('../internals/own-keys');

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;

module.exports = function (target, source) {
  var keys = ownKeys(source);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key)) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};
