'use strict';
// TODO: in core-js@4, replace direct /modules/ requires with implicit dependencies
require('../modules/es.string.from-code-point');
require('../modules/es.string.to-well-formed');
var getBuiltIn = require('../internals/get-built-in');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var uncurryThis = require('../internals/function-uncurry-this');

var fromCharCode = String.fromCharCode;
var fromCodePoint = getBuiltIn('String', 'fromCodePoint');
var $encodeURIComponent = encodeURIComponent;
var $parseInt = parseInt;
var charAt = uncurryThis(''.charAt);
var stringSlice = uncurryThis(''.slice);
var exec = uncurryThis(/./.exec);
var toWellFormed = uncurryThis(getBuiltInPrototypeMethod('String', 'toWellFormed'));

var FALLBACK_REPLACER = '\uFFFD';
var VALID_HEX = /^[0-9a-f]+$/i;

var parseHexOctet = function (string, start) {
  var substr = stringSlice(string, start, start + 2);
  if (!exec(VALID_HEX, substr)) return NaN;

  return $parseInt(substr, 16);
};

// https://url.spec.whatwg.org/#percent-decode
/* eslint-disable max-depth -- ok */
var decode = function (input) {
  var length = input.length;
  var result = '';
  var i = 0;

  while (i < length) {
    var decodedChar = charAt(input, i);

    if (decodedChar === '%') {
      if (charAt(input, i + 1) === '%' || i + 3 > length) {
        result += '%';
        i++;
        continue;
      }

      var octet = parseHexOctet(input, i + 1);

      // eslint-disable-next-line no-self-compare -- NaN check
      if (octet !== octet) {
        result += decodedChar;
        i++;
        continue;
      }

      i += 2;

      if (octet < 0x80) {
        decodedChar = fromCharCode(octet);
      } else {
        // https://encoding.spec.whatwg.org/#utf-8-decoder - valid leading bytes
        if (octet < 0xC2 || octet > 0xF4) {
          result += FALLBACK_REPLACER;
          i++;
          continue;
        }

        var byteSequenceLength = octet < 0xE0 ? 2 : octet < 0xF0 ? 3 : 4;
        var codePoint = octet & (0x7F >> byteSequenceLength);
        var sequenceIndex = 1;

        while (sequenceIndex < byteSequenceLength) {
          i++;
          if (i + 3 > length || charAt(input, i) !== '%') break;

          var nextByte = parseHexOctet(input, i + 1);

          // eslint-disable-next-line no-self-compare -- NaN check
          if (nextByte !== nextByte || nextByte > 191 || nextByte < 128) break;

          // https://encoding.spec.whatwg.org/#utf-8-decoder - position-specific byte ranges
          // Reject overlong encodings, surrogates, and code points above U+10FFFF.
          if (sequenceIndex === 1) {
            if (octet === 0xE0 && nextByte < 0xA0) break;
            if (octet === 0xED && nextByte > 0x9F) break;
            if (octet === 0xF0 && nextByte < 0x90) break;
            if (octet === 0xF4 && nextByte > 0x8F) break;
          }

          codePoint = codePoint << 6 | nextByte & 0x3F;
          i += 2;
          sequenceIndex++;
        }

        if (sequenceIndex !== byteSequenceLength) {
          result += FALLBACK_REPLACER;
          continue;
        }

        decodedChar = fromCodePoint(codePoint);
      }
    }

    result += decodedChar;
    i++;
  }

  return result;
};
/* eslint-enable max-depth -- ok */

// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
// a lone surrogate is the only input `encodeURIComponent` throws on, and the UTF-8
// encoder replaces it - so the throw selects the slow path instead of a per-call scan
var encode = function (input) {
  try {
    return $encodeURIComponent(input);
  } catch (error) {
    return $encodeURIComponent(toWellFormed(input));
  }
};

module.exports = {
  decode: decode,
  encode: encode
};
