'use strict';
var defineBuiltIn = require('../internals/define-built-in');

module.exports = function (target, src, options) {
  Object.keys(src).forEach(function (key) {
    if (options && options.unsafe && target[key]) target[key] = src[key];
    else defineBuiltIn(target, key, src[key], options);
  });
  return target;
};
