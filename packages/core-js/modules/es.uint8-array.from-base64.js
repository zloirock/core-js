// types: proposals/array-buffer-base64
'use strict';
/* eslint-disable es/no-uint8array-frombase64 -- safe */
var $ = require('../internals/export');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var $fromBase64 = require('../internals/uint8-from-base64');

var $Uint8Array = Uint8Array;
var nativeFromBase64 = $Uint8Array.fromBase64;

var INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS = !nativeFromBase64 || !function () {
  // Webkit not throw an error on odd length string
  try {
    nativeFromBase64('a');
    return;
  } catch (error) { /* empty */ }
  try {
    nativeFromBase64('', null);
  } catch (error) {
    return true;
  }
}();

// `Uint8Array.fromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', stat: true, forced: INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS }, {
  fromBase64: function fromBase64(string /* , options */) {
    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, null, 0x1FFFFFFFFFFFFF);
    return arrayFromConstructorAndList($Uint8Array, result.bytes);
  },
});
