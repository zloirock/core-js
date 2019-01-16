'use strict';
var nativeForEach = [].forEach;
var internalForEach = require('../internals/array-methods')(0);

var SLOPPY_METHOD = require('../internals/sloppy-array-method')('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = SLOPPY_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return internalForEach(this, callbackfn, arguments[1]);
} : nativeForEach;
