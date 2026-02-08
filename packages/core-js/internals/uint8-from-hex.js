'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');

var Uint8Array = globalThis.Uint8Array;
var SyntaxError = globalThis.SyntaxError;
var parseInt = globalThis.parseInt;
var NOT_HEX = /[^\da-f]/i;
var exec = uncurryThis(NOT_HEX.exec);
var stringMatch = uncurryThis(''.match);

module.exports = function (string, into) {
  var stringLength = string.length;
  if (stringLength & 1) throw new SyntaxError('String should be an even number of characters');
  if (exec(NOT_HEX, string)) throw new SyntaxError('String should only contain hex characters');
  var maxLength = (into && into.length < (stringLength >> 1) ? into.length : (stringLength >> 1));
  var bytes = into || new Uint8Array(maxLength);
  var segments = stringMatch(string, /.{2}/g)
  console.log(segments)
  for (var written = 0; written < maxLength; written++) {
    bytes[written] = parseInt(segments[written], 16);
  }
  return { bytes: bytes, read: written << 1 };
};
