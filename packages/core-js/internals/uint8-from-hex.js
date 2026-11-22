'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');
var hexDigitToInt = require('../internals/hex-digit-to-int');

var Uint8Array = globalThis.Uint8Array;
var SyntaxError = globalThis.SyntaxError;
var min = Math.min;
var charCodeAt = uncurryThis(''.charCodeAt);

module.exports = function (string, into) {
  var stringLength = string.length;
  if (stringLength % 2 !== 0) throw new SyntaxError('String should be an even number of characters');
  var maxLength = into ? min(into.length, stringLength / 2) : stringLength / 2;
  var bytes = into || new Uint8Array(maxLength);
  var read = 0;
  for (var written = 0; written < maxLength; written++) {
    var high = hexDigitToInt(charCodeAt(string, read++));
    var low = hexDigitToInt(charCodeAt(string, read++));
    if (high < 0 || low < 0) throw new SyntaxError('String should only contain hex characters');
    bytes[written] = high * 16 + low;
  }
  return { bytes: bytes, read: read };
};
