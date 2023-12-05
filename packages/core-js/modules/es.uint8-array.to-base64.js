'use strict';
/* eslint-disable no-useless-assignment -- false positive for [index++] syntax */
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var uncurryThis = require('../internals/function-uncurry-this');
var anUint8Array = require('../internals/an-uint8-array');
var notDetached = require('../internals/array-buffer-not-detached');
var base64Map = require('../internals/base64-map');
var getAlphabetOption = require('../internals/get-alphabet-option');

var base64Alphabet = base64Map.i2c;
var base64UrlAlphabet = base64Map.i2cUrl;
var $floor = Math.floor;
var $ceil = Math.ceil;

var Uint8Array = globalThis.Uint8Array;
var $Array = globalThis.Array;
var join = uncurryThis([].join);

var INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS = !Uint8Array || !Uint8Array.prototype.toBase64 || !function () {
  try {
    var target = new Uint8Array();
    target.toBase64(null);
  } catch (error) {
    return true;
  }
}();

// `Uint8Array.prototype.toBase64` method
// https://tc39.es/ecma262/#sec-uint8array.prototype.tobase64
if (Uint8Array) $({ target: 'Uint8Array', proto: true, forced: INCORRECT_BEHAVIOR_OR_DOESNT_EXISTS }, {
  toBase64: function toBase64(/* options */) {
    var array = anUint8Array(this);
    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
    var omitPadding = !!options && !!options.omitPadding;
    notDetached(this.buffer);

    var i = 0;
    var length = array.length;
    var result = $Array(omitPadding ? $floor(length / 3) * 4 + (length % 3 ? length % 3 + 1 : 0) : $ceil(length / 3) * 4);
    var written = 0;
    var triplet;

    var at = function (shift) {
      return alphabet[(triplet >> (6 * shift)) & 63];
    };

    for (; i + 2 < length; i += 3) {
      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
      result[written++] = at(3);
      result[written++] = at(2);
      result[written++] = at(1);
      result[written++] = at(0);
    }
    if (i + 2 === length) {
      triplet = (array[i] << 16) + (array[i + 1] << 8);
      result[written++] = at(3);
      result[written++] = at(2);
      result[written++] = at(1);
      if (!omitPadding) result[written++] = '=';
    } else if (i + 1 === length) {
      triplet = array[i] << 16;
      result[written++] = at(3);
      result[written++] = at(2);
      if (!omitPadding) {
        result[written++] = '=';
        result[written++] = '=';
      }
    }

    return join(result, '');
  },
});
