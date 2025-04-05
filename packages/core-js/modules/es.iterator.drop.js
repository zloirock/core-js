'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var globalThis = require('../internals/global-this');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var iteratorClose = require('../internals/iterator-close');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');
var IS_PURE = require('../internals/is-pure');

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject(call(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject(call(next, iterator));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

var Iterator = globalThis.Iterator;
var nativeDrop = Iterator && Iterator.prototype && Iterator.prototype.drop;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = !IS_PURE && nativeDrop && !checkIteratorClosingOnEarlyError(nativeDrop, -1);
var FORCED = IS_PURE || !nativeDrop || NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR;

// `Iterator.prototype.drop` method
// https://tc39.es/ecma262/#sec-iterator.prototype.drop
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  drop: function drop(limit) {
    anObject(this);
    var remaining;
    try {
      remaining = toPositiveInteger(notANaN(+limit));
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return call(nativeDrop, this, remaining);

    return new IteratorProxy(getIteratorDirect(this), {
      remaining: remaining
    });
  }
});
