'use strict';
var $ = require('../internals/export');
var $fromBase64 = require('../internals/uint8-from-base64');
var anUint8Array = require('../internals/an-uint8-array');

// `Uint8Array.prototype.setFromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', proto: true }, {
  setFromBase64: function setFromBase64(string /* , options */) {
    anUint8Array(this);

    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this, this.length);

    return { read: result.read, written: result.written };
  },
});
