'use strict';
var anObject = require('../internals/an-object');
var isSticky = require('./regexp-sticky-helpers').isSticky;

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (isSticky(that)) result += 'y';
  return result;
};
