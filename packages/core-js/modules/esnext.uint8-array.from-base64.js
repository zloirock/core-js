'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var aString = require('../internals/a-string');

var Uint8Array = global.Uint8Array;

// `Uint8Array.fromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $({ target: 'Uint8Array', stat: true, forced: true }, {
  fromBase64: function fromBase64(string) {
    aString(string);
    // TODO
    return new Uint8Array(8);
  }
});
