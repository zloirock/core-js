'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperThrowsOnInvalidIterator = require('../internals/iterator-helper-throws-on-invalid-iterator');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');
var IS_PURE = require('../internals/is-pure');

var $RangeError = RangeError;
var $Infinity = Infinity;

var TAKE_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('take', 1);
var takeWithoutClosingOnEarlyError = !IS_PURE && !TAKE_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('take', RangeError);

var FORCED = IS_PURE || TAKE_WITHOUT_THROWING_ON_INVALID_ITERATOR || takeWithoutClosingOnEarlyError || !function () {
  try {
    // eslint-disable-next-line es/no-iterator, es/no-iterator-prototype-take -- detection
    Iterator.prototype.take.call({
      next: function () { return { done: true }; },
    }, 0x20000000000000);
  } catch (error) {
    return error instanceof $RangeError;
  }
}();

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose(iterator, 'normal', undefined);
  }
  var result = anObject(call(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.take` method
// https://tc39.es/ecma262/#sec-iterator.prototype.take
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  take: function take(limit) {
    anObject(this);
    var remaining;
    try {
      remaining = toPositiveInteger(notANaN(+limit));
      if (remaining > 0x1FFFFFFFFFFFFF && remaining !== $Infinity) {
        throw new $RangeError('The argument should be a safe integer');
      }
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (takeWithoutClosingOnEarlyError) return call(takeWithoutClosingOnEarlyError, this, remaining);

    return new IteratorProxy(getIteratorDirect(this), {
      remaining: remaining,
    });
  },
});
