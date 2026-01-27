// @types: proposals/array-buffer-base64
'use strict';
/* eslint-disable es/no-uint8array-prototype-setfrombase64 -- safe */
var $ = require('../internals/export');
var $fromBase64 = require('../internals/uint8-from-base64');
var anUint8Array = require('../internals/an-uint8-array');

var INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS = !Uint8Array.prototype.setFromBase64 || !function () {
  var target = new Uint8Array([255, 255, 255, 255, 255]);
  try {
    target.setFromBase64('', null);
    return;
  } catch (error) { /* empty */ }
  // Webkit not throw an error on odd length string
  try {
    target.setFromBase64('a');
    return;
  } catch (error) { /* empty */ }
  try {
    target.setFromBase64('MjYyZg===');
  } catch (error) {
    return target[0] === 50 && target[1] === 54 && target[2] === 50 && target[3] === 255 && target[4] === 255;
  }
}();

// `Uint8Array.prototype.setFromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', proto: true, forced: INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS }, {
  setFromBase64: function setFromBase64(string /* , options */) {
    anUint8Array(this);

    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this, this.length);

    return { read: result.read, written: result.written };
  },
});
