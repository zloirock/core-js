'use strict';
var $ = require('../internals/export');
var aString = require('../internals/a-string');
var anUint8Array = require('../internals/an-uint8-array');
var notDetached = require('../internals/array-buffer-not-detached');
var $fromHex = require('../internals/uint8-from-hex');

// `Uint8Array.prototype.setFromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', proto: true }, {
  setFromHex: function setFromHex(string) {
    anUint8Array(this);
    aString(string);
    notDetached(this.buffer);
    var read = $fromHex(string, this).read;
    return { read: read, written: read / 2 };
  },
});
