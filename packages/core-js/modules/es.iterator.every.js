'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var tryToString = require('../internals/try-to-string');
var iteratorClose = require('../internals/iterator-close');
var globalThis = require('../internals/global-this');
var isCallable = require('../internals/is-callable');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');

var $TypeError = TypeError;
var Iterator = globalThis.Iterator;
var nativeEvery = Iterator && Iterator.prototype && Iterator.prototype.every;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = nativeEvery && !checkIteratorClosingOnEarlyError(nativeEvery, null);

// `Iterator.prototype.every` method
// https://tc39.es/ecma262/#sec-iterator.prototype.every
$({ target: 'Iterator', proto: true, real: true, forced: NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR }, {
  every: function every(predicate) {
    anObject(this);
    if (!isCallable(predicate)) {
      iteratorClose(this, 'throw', new $TypeError(tryToString(predicate) + ' is not a function'));
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return nativeEvery.call(this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return !iterate(record, function (value, stop) {
      if (!predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});
