'use strict';
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var aString = require('../internals/a-string');
var base64Map = require('../internals/base64-map');
var getAlphabetOption = require('../internals/get-alphabet-option');
var notDetached = require('../internals/array-buffer-not-detached');

var base64Alphabet = base64Map.c2i;
var base64UrlAlphabet = base64Map.c2iUrl;

var $SyntaxError = SyntaxError;
var $TypeError = TypeError;

var skipAsciiWhitespace = function (string, index) {
  var length = string.length;
  for (;index < length; index++) {
    var char = string[index];
    if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\f' && char !== '\r') break;
  } return index;
};

var decodeBase64Chunk = function (chunk, alphabet, throwOnExtraBits) {
  var chunkLength = chunk.length;

  if (chunkLength < 4) {
    chunk += chunkLength === 2 ? 'AA' : 'A';
  }

  var triplet = (alphabet[chunk[0]] << 18)
    + (alphabet[chunk[1]] << 12)
    + (alphabet[chunk[2]] << 6)
    + alphabet[chunk[3]];

  var chunkBytes = [
    (triplet >> 16) & 255,
    (triplet >> 8) & 255,
    triplet & 255,
  ];

  if (chunkLength === 2) {
    if (throwOnExtraBits && chunkBytes[1] !== 0) {
      throw new $SyntaxError('Extra bits');
    }
    return [chunkBytes[0]];
  }

  if (chunkLength === 3) {
    if (throwOnExtraBits && chunkBytes[2] !== 0) {
      throw new $SyntaxError('Extra bits');
    }
    return [chunkBytes[0], chunkBytes[1]];
  }

  return chunkBytes;
};

var writeBytes = function (bytes, elements, written) {
  var elementsLength = elements.length;
  for (var index = 0; index < elementsLength; index++) {
    bytes[written + index] = elements[index];
  }
  return written + elementsLength;
};

/* eslint-disable max-statements, max-depth -- TODO */
module.exports = function (string, options, into, maxLength) {
  aString(string);
  anObjectOrUndefined(options);
  var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
  var lastChunkHandling = options ? options.lastChunkHandling : undefined;

  if (lastChunkHandling === undefined) lastChunkHandling = 'loose';

  if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
    throw new $TypeError('Incorrect `lastChunkHandling` option');
  }

  if (into) notDetached(into.buffer);

  var stringLength = string.length;
  var bytes = into || [];
  var written = 0;
  var read = 0;
  var chunk = '';
  var index = 0;

  if (maxLength) while (true) {
    index = skipAsciiWhitespace(string, index);
    if (index === stringLength) {
      if (chunk.length > 0) {
        if (lastChunkHandling === 'stop-before-partial') {
          break;
        }
        if (lastChunkHandling === 'loose') {
          if (chunk.length === 1) {
            throw new $SyntaxError('Malformed padding: exactly one additional character');
          }
          written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
        } else {
          throw new $SyntaxError('Missing padding');
        }
      }
      read = stringLength;
      break;
    }
    var char = string[index];
    ++index;
    if (char === '=') {
      if (chunk.length < 2) {
        throw new $SyntaxError('Padding is too early');
      }
      index = skipAsciiWhitespace(string, index);
      if (chunk.length === 2) {
        if (index === stringLength) {
          if (lastChunkHandling === 'stop-before-partial') {
            break;
          }
          throw new $SyntaxError('Malformed padding: only one =');
        }
        if (string[index] === '=') {
          ++index;
          index = skipAsciiWhitespace(string, index);
        }
      }
      if (index < stringLength) {
        throw new $SyntaxError('Unexpected character after padding');
      }
      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, lastChunkHandling === 'strict'), written);
      read = stringLength;
      break;
    }
    if (!(char in alphabet)) {
      throw new $SyntaxError('Unexpected character');
    }
    var remainingBytes = maxLength - written;
    if (remainingBytes === 1 && chunk.length === 2 || remainingBytes === 2 && chunk.length === 3) {
      // special case: we can fit exactly the number of bytes currently represented by chunk, so we were just checking for `=`
      break;
    }

    chunk += char;
    if (chunk.length === 4) {
      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
      chunk = '';
      read = index;
      if (written === maxLength) {
        break;
      }
    }
  }

  return { bytes: bytes, read: read, written: written };
};
