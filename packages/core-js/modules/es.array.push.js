'use strict';
var $ = require('../internals/export');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var fails = require('../internals/fails');

var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;

var INCORRECT_TO_LENGTH = fails(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

var SILENT_ON_NON_WRITABLE_LENGTH = !fails(function () {
  // eslint-disable-next-line es-x/no-object-defineproperty -- safe
  Object.defineProperty([], 'length', { writable: false }).push();
});

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$({ target: 'Array', proto: true, arity: 1, forced: INCORRECT_TO_LENGTH || SILENT_ON_NON_WRITABLE_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var argCount = arguments.length;
    if (len + argCount > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed length exceeded');
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    O.length = len;
    return len;
  }
});
