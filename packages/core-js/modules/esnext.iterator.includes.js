// @types: proposals/iterator-includes
'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');
var isIntegralNumber = require('../internals/is-integral-number');
var iteratorClose = require('../internals/iterator-close');
var sameValueZero = require('../internals/same-value-zero');

var $RangeError = RangeError;
var $TypeError = TypeError;
var $Infinity = Infinity;

var INVALID_SKIPPED_ELEMENTS = 'skippedElements should be a positive integer or Infinity';

// `Iterator.prototype.includes` method
// https://tc39.es/proposal-iterator-includes/
// @dependency: es.iterator.constructor
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  includes: function includes(searchElement /* , skippedElements */) {
    anObject(this);
    var skippedElements = arguments.length > 1 ? arguments[1] : undefined;
    var skipped = 0;
    var toSkip;
    try {
      if (skippedElements === undefined) {
        toSkip = 0;
      } else if (skippedElements === $Infinity || skippedElements === -$Infinity || isIntegralNumber(skippedElements)) {
        toSkip = skippedElements;
      } else {
        throw new $TypeError(INVALID_SKIPPED_ELEMENTS);
      }
      if (toSkip < 0) throw new $RangeError(INVALID_SKIPPED_ELEMENTS);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    return iterate(this, function (value, stop) {
      if (skipped < toSkip) skipped++;
      else if (sameValueZero(value, searchElement)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  },
});
