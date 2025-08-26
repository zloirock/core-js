'use strict';
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var setArrayLength = require('../internals/array-set-length');
var deletePropertyOrThrow = require('../internals/delete-property-or-throw');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');

var isArray = Array.isArray;
var nativeUnshift = [].unshift;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var NON_WRITABLE = { writable: false };

// the native method should throw a `TypeError` on an array with a property protected like this
var throwsOn = function (array, key, args) {
  try {
    apply(nativeUnshift, defineProperty(array, key, NON_WRITABLE), args);
  } catch (error) {
    return error instanceof TypeError;
  }
};

// IE moves elements even on a call without arguments
// FF < 55 and IE - `ToUint32` or a clamped length instead of `ToLength`
var properCallWithoutArguments = function () {
  var touched = false;
  var accessor = function () { touched = true; };
  try {
    nativeUnshift.call(defineProperty({ length: 1 }, 0, { get: accessor, set: accessor }));
    // an engine that moves elements here would iterate up to a huge length, so it must be excluded first
    return !touched && nativeUnshift.call({ length: 0x100000000 }) === 4294967296;
  } catch (error) { /* empty */ }
};

// non-writable length: V8 ~ Chrome < 71, Safari 14.1 - 15.x and Rhino, FF < 23 throws InternalError
// https://github.com/mozilla/rhino/issues/2591
var FORCED = !throwsOn([], 'length', []) || !properCallWithoutArguments();

// moving elements one by one is much slower than the native method,
// so arrays with arguments are passed to it where it handles them properly
// V8 3.28- (~ Chrome 38-) and Rhino change arrays with a non-writable length or element
var NATIVE_FOR_ARRAYS = FORCED && throwsOn([1], 'length', [0]) && throwsOn([1, 2], 1, [0]);

// `Array.prototype.unshift` method
// https://tc39.es/ecma262/#sec-array.prototype.unshift
$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  unshift: function unshift(item) {
    var O = toObject(this);
    var argCount = arguments.length;
    // only arrays: the native method reads the length of array-likes incorrectly and can iterate up to it
    if (argCount && NATIVE_FOR_ARRAYS && isArray(O)) return apply(nativeUnshift, O, arguments);
    var len = lengthOfArrayLike(O);
    if (argCount) {
      doesNotExceedSafeInteger(len + argCount);
      var k = len;
      while (k--) {
        var to = k + argCount;
        if (k in O) O[to] = O[k];
        else deletePropertyOrThrow(O, to);
      }
      for (var j = 0; j < argCount; j++) {
        O[j] = arguments[j];
      }
    } return setArrayLength(O, len + argCount);
  },
});
