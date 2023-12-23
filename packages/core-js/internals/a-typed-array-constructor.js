'use strict';
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var tryToString = require('../internals/try-to-string');
var TypedArray = require('../internals/array-buffer-view-core').TypedArray;

module.exports = function (C) {
  if (isCallable(C) && isPrototypeOf(TypedArray, C)) return C;
  throw new TypeError(tryToString(C) + ' is not a typed array constructor');
};
