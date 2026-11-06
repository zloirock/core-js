'use strict';
var aCallable = require('../internals/a-callable');
var bind = require('../internals/function-bind');

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : bind(fn, that);
};
