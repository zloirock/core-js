'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var uncurryThis = require('../internals/function-uncurry-this');
var aString = require('../internals/a-string');

var Uint8Array = global.Uint8Array;
var SyntaxError = global.SyntaxError;
var parseInt = global.parseInt;
var NOT_HEX = /[^\da-f]/i;
var exec = uncurryThis(NOT_HEX.exec);
var stringSlice = uncurryThis(''.slice);

// `Uint8Array.fromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $({ target: 'Uint8Array', stat: true, forced: true }, {
  fromHex: function fromHex(string) {
    aString(string);
    var stringLength = string.length;
    if (stringLength % 2) throw new SyntaxError('String should have an even number of characters');
    if (exec(NOT_HEX, string)) throw new SyntaxError('String should only contain hex characters');
    var result = new Uint8Array(stringLength / 2);
    for (var i = 0; i < stringLength; i += 2) {
      result[i / 2] = parseInt(stringSlice(string, i, i + 2), 16);
    }
    return result;
  }
});
