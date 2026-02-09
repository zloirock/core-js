'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');

var Uint8Array = globalThis.Uint8Array;
var SyntaxError = globalThis.SyntaxError;
var $Number = globalThis.Number;
var $isNaN = $Number.isNaN;
var stringMatch = uncurryThis(''.match);

module.exports = function (string, into) {
  var stringLength = string.length;
  if (stringLength & 1) throw new SyntaxError('String should be an even number of characters');
  var maxLength = into && into.length < stringLength >> 1 ? into.length : stringLength >> 1;
  var bytes = into || new Uint8Array(maxLength);
  // This splitting is faster than using substrings each time (5x speedup on a medium-
  // sized string)
  var segments = stringMatch(string, /.{2}/g);
  var written = 0;
  for (; written < maxLength; written++) {
    // Attempt to construct a Number and then checking for NaN is aproximately
    // 2x faster than naively using a regex to check each hexit.  Number constructor
    // is maximally strict, except for whitespace which it ignores, so special-case
    // this.
    var result = $Number('0x' + segments[written]);
    if ($isNaN(result) || segments[written].trim() !== segments[written]) {
      throw new SyntaxError('String should only contain hex characters');
    }
    bytes[written] = result;
  }
  return { bytes: bytes, read: written << 1 };
};
