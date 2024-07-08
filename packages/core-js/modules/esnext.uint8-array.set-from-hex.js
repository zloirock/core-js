'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var aString = require('../internals/a-string');
var anUint8Array = require('../internals/an-uint8-array');
var notDetached = require('../internals/array-buffer-not-detached');
var $fromHex = require('../internals/uint8-from-hex');

var Uint8Array = global.Uint8Array;

// `Uint8Array.fromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $({ target: 'Uint8Array', proto: true }, {
  setFromHex: function setFromHex(string) {
    anUint8Array(this);
    aString(string);
    notDetached(this.buffer);
    var read = $fromHex(string, this).read;
    return { read: read, written: read / 2 };
  }
});
