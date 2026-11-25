'use strict';
var Int8Array = require('../internals/global-this').Int8Array;
var apply = require('../internals/function-apply');

// V8 before 5.1 and Firefox before 47 can return -0 for a match at index 0.
module.exports = function (key) {
  var nativeMethod = Int8Array && Int8Array.prototype[key];
  if (nativeMethod && 1 / new Int8Array(1)[key](0, -0) === -Infinity) return function (receiver, args) {
    return apply(nativeMethod, receiver, args) || 0;
  };
};
