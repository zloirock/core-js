'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var globalThis = require('../internals/global-this');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var iteratorClose = require('../internals/iterator-close');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');
var IS_PURE = require('../internals/is-pure');

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

var Iterator = globalThis.Iterator;
var nativeTake = Iterator && Iterator.prototype && Iterator.prototype.take;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = !IS_PURE && nativeTake && !checkIteratorClosingOnEarlyError(RangeError, nativeTake, -1);
var FORCED = IS_PURE || !nativeTake || NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR;

// `Iterator.prototype.take` method
// https://tc39.es/ecma262/#sec-iterator.prototype.take
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  take: function take(limit) {
    anObject(this);
    var remaining;
    try {
      remaining = toPositiveInteger(notANaN(+limit));
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return call(nativeTake, this, remaining);

    return new IteratorProxy(getIteratorDirect(this), {
      remaining: remaining
    });
  }
});
