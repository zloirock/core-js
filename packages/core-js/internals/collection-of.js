'use strict';
var global = require('../internals/global');

var Array = global.Array;

// https://tc39.github.io/proposal-setmap-offrom/
module.exports = function of() {
  var length = arguments.length;
  var A = Array(length);
  while (length--) A[length] = arguments[length];
  return new this(A);
};
