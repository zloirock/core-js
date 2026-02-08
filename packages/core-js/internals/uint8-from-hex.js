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
  var maxLength = (into && into.length < (stringLength >> 1) ? into.length : (stringLength >> 1));
  var bytes = into || new Uint8Array(maxLength);
  var segments = stringMatch(string, /.{2}/g);
  for (var written = 0; written < maxLength; written++) {
    var result = $Number("0x" + segments[written]);
    if ($isNaN(result)) throw new SyntaxError('String should only contain hex characters');
    bytes[written] = result;
  }
  return { bytes: bytes, read: written << 1 };
};
