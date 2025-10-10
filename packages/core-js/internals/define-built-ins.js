'use strict';
var defineBuiltIn = require('../internals/define-built-in');

module.exports = function (target, src, options) {
  Object.keys(src).forEach(function (key) {
    defineBuiltIn(target, key, src[key], options);
  });
  return target;
};
