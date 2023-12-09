'use strict';
var $ = require('../internals/export');
var aString = require('../internals/a-string');
var $fromHex = require('../internals/uint8-from-hex');

// `Uint8Array.fromHex` method
// https://tc39.es/ecma262/#sec-uint8array.fromhex
$({ target: 'Uint8Array', stat: true }, {
  fromHex: function fromHex(string) {
    return $fromHex(aString(string)).bytes;
  },
});
