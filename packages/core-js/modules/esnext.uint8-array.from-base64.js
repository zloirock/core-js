'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var uncurryThis = require('../internals/function-uncurry-this');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var aString = require('../internals/a-string');
var hasOwn = require('../internals/has-own-property');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var base64Map = require('../internals/base64-map');
var getAlphabetOption = require('../internals/get-alphabet-option');

var base64Alphabet = base64Map.c2i;
var base64UrlAlphabet = base64Map.c2iUrl;

var Uint8Array = global.Uint8Array;
var SyntaxError = global.SyntaxError;
var charAt = uncurryThis(''.charAt);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);
var push = uncurryThis([].push);
var SPACES = /[\t\n\f\r ]/g;
var EXTRA_BITS = 'Extra bits';

// `Uint8Array.fromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $({ target: 'Uint8Array', stat: true, forced: true }, {
  fromBase64: function fromBase64(string /* , options */) {
    aString(string);
    var options = arguments.length > 1 ? anObjectOrUndefined(arguments[1]) : undefined;
    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
    var strict = options ? !!options.strict : false;

    var input = strict ? string : replace(string, SPACES, '');

    if (input.length % 4 === 0) {
      if (stringSlice(input, -2) === '==') input = stringSlice(input, 0, -2);
      else if (stringSlice(input, -1) === '=') input = stringSlice(input, 0, -1);
    } else if (strict) throw new SyntaxError('Input is not correctly padded');

    var lastChunkSize = input.length % 4;

    switch (lastChunkSize) {
      case 1: throw new SyntaxError('Bad input length');
      case 2: input += 'AA'; break;
      case 3: input += 'A';
    }

    var bytes = [];
    var i = 0;
    var inputLength = input.length;

    var at = function (shift) {
      var chr = charAt(input, i + shift);
      if (!hasOwn(alphabet, chr)) throw new SyntaxError('Bad char in input: "' + chr + '"');
      return alphabet[chr] << (18 - 6 * shift);
    };

    for (; i < inputLength; i += 4) {
      var triplet = at(0) + at(1) + at(2) + at(3);
      push(bytes, (triplet >> 16) & 255, (triplet >> 8) & 255, triplet & 255);
    }

    var byteLength = bytes.length;

    if (lastChunkSize === 2) {
      if (strict && bytes[byteLength - 2] !== 0) throw new SyntaxError(EXTRA_BITS);
      byteLength -= 2;
    } else if (lastChunkSize === 3) {
      if (strict && bytes[byteLength - 1] !== 0) throw new SyntaxError(EXTRA_BITS);
      byteLength--;
    }

    return arrayFromConstructorAndList(Uint8Array, bytes, byteLength);
  }
});
