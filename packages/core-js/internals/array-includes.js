'use strict';
var toObject = require('../internals/to-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var sameValueZero = require('../internals/same-value-zero');

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
module.exports = function ($this, el, fromIndex) {
  var O = toObject($this);
  var length = lengthOfArrayLike(O);
  if (length === 0) return false;
  var index = toAbsoluteIndex(fromIndex, length);
  for (;length > index; index++) {
    if (sameValueZero(O[index], el)) return true;
  } return false;
};
