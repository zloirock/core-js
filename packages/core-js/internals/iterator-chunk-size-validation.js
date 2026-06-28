'use strict';
var iteratorClose = require('../internals/iterator-close');

var $RangeError = RangeError;
var $TypeError = TypeError;
var floor = Math.floor;

var CHUNK_SIZE_VALIDATION_ERROR = 'Chunk size must be an integer in [1, 2^32-1]';

module.exports = function (chunkSize, iterator) {
  if (typeof chunkSize != 'number' || floor(chunkSize) !== chunkSize) {
    return iteratorClose(iterator, 'throw', new $TypeError(CHUNK_SIZE_VALIDATION_ERROR));
  }
  if (chunkSize === 0 || chunkSize >>> 0 !== chunkSize) {
    return iteratorClose(iterator, 'throw', new $RangeError(CHUNK_SIZE_VALIDATION_ERROR));
  }
};
