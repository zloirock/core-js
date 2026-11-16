'use strict';
var toObject = require('../internals/to-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var fails = require('../internals/fails');

// eslint-disable-next-line es/no-array-prototype-fill -- safe
var nativeFill = [].fill;

// the native method on an array-like with a non-writable element
var fillLocked = function (length) {
  return function () {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    nativeFill.call(Object.defineProperty({ length: length }, 0, { writable: false }));
  };
};

// V8 ~ Chrome 45-47 reads the length of array-likes with `ToUint32` instead of `ToLength`
// a negative length is tried only if the method stops on a non-writable element,
// otherwise an engine with such a bug would write 2 ** 32 elements
var CORRECT_NATIVE = nativeFill && fails(fillLocked(1)) && !fails(fillLocked(-1));

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
module.exports = CORRECT_NATIVE ? nativeFill : function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = lengthOfArrayLike(O);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};
