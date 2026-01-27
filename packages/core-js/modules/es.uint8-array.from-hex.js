// @types: proposals/array-buffer-base64
'use strict';
var $ = require('../internals/export');
var aString = require('../internals/a-string');
var $fromHex = require('../internals/uint8-from-hex');

// `Uint8Array.fromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', stat: true }, {
  fromHex: function fromHex(string) {
    return $fromHex(aString(string)).bytes;
  },
});
