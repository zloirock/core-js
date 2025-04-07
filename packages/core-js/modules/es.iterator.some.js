'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
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
var nativeSome = Iterator && Iterator.prototype && Iterator.prototype.some;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = nativeSome && !checkIteratorClosingOnEarlyError(nativeSome, null);

// `Iterator.prototype.some` method
// https://tc39.es/ecma262/#sec-iterator.prototype.some
$({ target: 'Iterator', proto: true, real: true, forced: NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR }, {
  some: function some(predicate) {
    anObject(this);
    if (!isCallable(predicate)) {
      iteratorClose(this, 'throw', new $TypeError(tryToString(predicate) + ' is not a function'));
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return call(nativeSome, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return iterate(record, function (value, stop) {
      if (predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});
