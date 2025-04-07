'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var anObject = require('../internals/an-object');
var aCallable = require('../internals/a-callable');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var globalThis = require('../internals/global-this');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');

var Iterator = globalThis.Iterator;
var nativeEvery = Iterator && Iterator.prototype && Iterator.prototype.every;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = nativeEvery && !checkIteratorClosingOnEarlyError(TypeError, nativeEvery, null);

// `Iterator.prototype.every` method
// https://tc39.es/ecma262/#sec-iterator.prototype.every
$({ target: 'Iterator', proto: true, real: true, forced: NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR }, {
  every: function every(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return call(nativeEvery, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return !iterate(record, function (value, stop) {
      if (!predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});
