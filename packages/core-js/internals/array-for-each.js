'use strict';
var $forEach = require('../internals/array-iteration').forEach;
var sloppyArrayMethod = require('../internals/sloppy-array-method');
var arrayMethodUsesToLength = require('../internals/array-method-uses-to-length');

var SLOPPY_METHOD = sloppyArrayMethod('forEach');
var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = (SLOPPY_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;
