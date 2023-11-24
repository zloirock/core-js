'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var uncurryThis = require('../internals/function-uncurry-this');
var isObject = require('../internals/is-object');
var anUint8Array = require('../internals/an-uint8-array');
var base64Map = require('../internals/base64-map');

var base64Alphabet = base64Map.i2c;
var base64UrlAlphabet = base64Map.i2cUrl;

var Uint8Array = global.Uint8Array;
var TypeError = global.TypeError;
var charAt = uncurryThis(''.charAt);
var BASE64 = 'base64';

// `Uint8Array..prototype.toBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $({ target: 'Uint8Array', proto: true, forced: true }, {
  toBase64: function toBase64(options) {
    var array = anUint8Array(this);
    if (options !== undefined && !isObject(options)) throw new TypeError('Incorrect options');
    var $alphabet = options && options.alphabet;
    if ($alphabet === undefined) $alphabet = BASE64;
    if ($alphabet !== BASE64 && $alphabet !== 'base64url') throw new TypeError('Incorrect `alphabet` option');
    var alphabet = $alphabet === BASE64 ? base64Alphabet : base64UrlAlphabet;

    var result = '';
    var i = 0;
    var length = array.length;
    var triplet;

    var at = function (bit) {
      return charAt(alphabet, (triplet >> bit) & 63);
    };

    for (; i + 2 < length; i += 3) {
      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
      result += at(18) + at(12) + at(6) + at(0);
    }
    if (i + 2 === length) {
      triplet = (array[i] << 16) + (array[i + 1] << 8);
      result += at(18) + at(12) + at(6) + '=';
    } else if (i + 1 === length) {
      triplet = array[i] << 16;
      result += at(18) + at(12) + '==';
    }

    return result;
  }
});
