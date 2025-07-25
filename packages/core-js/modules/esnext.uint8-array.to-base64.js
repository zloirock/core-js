// type: proposals/array-buffer-base64.d.ts
'use strict';
/* eslint-disable es/no-nonstandard-typed-array-prototype-properties -- safe */
var $ = require('../internals/export');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var anUint8Array = require('../internals/an-uint8-array');
var notDetached = require('../internals/array-buffer-not-detached');
var base64Map = require('../internals/base64-map');
var getAlphabetOption = require('../internals/get-alphabet-option');

var base64Alphabet = base64Map.i2c;
var base64UrlAlphabet = base64Map.i2cUrl;

// eslint-disable-next-line es/no-nonstandard-typed-array-prototype-properties -- safe
var INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS = !Uint8Array.prototype.toBase64 || !function () {
  try {
    var target = new Uint8Array();
    // eslint-disable-next-line es/no-nonstandard-typed-array-prototype-properties -- safe
    target.toBase64(null);
  } catch (error) {
    return true;
  }
}();

// `Uint8Array.prototype.toBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
$({ target: 'Uint8Array', proto: true, forced: INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS }, {
  toBase64: function toBase64(/* options */) {
    var array = anUint8Array(this);
    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
    var omitPadding = !!options && !!options.omitPadding;
    notDetached(this.buffer);

    var result = '';
    var i = 0;
    var length = array.length;
    var triplet;

    var at = function (shift) {
      return alphabet[(triplet >> (6 * shift)) & 63];
    };

    for (; i + 2 < length; i += 3) {
      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
      result += at(3) + at(2) + at(1) + at(0);
    }
    if (i + 2 === length) {
      triplet = (array[i] << 16) + (array[i + 1] << 8);
      result += at(3) + at(2) + at(1) + (omitPadding ? '' : '=');
    } else if (i + 1 === length) {
      triplet = array[i] << 16;
      result += at(3) + at(2) + (omitPadding ? '' : '==');
    }

    return result;
  },
});
