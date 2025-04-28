'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var aCallable = require('./a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var globalThis = require('../internals/global-this');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');

var Iterator = globalThis.Iterator;
var nativeForEach = Iterator && Iterator.prototype && Iterator.prototype.forEach;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = nativeForEach && !checkIteratorClosingOnEarlyError(TypeError, nativeForEach, null);

// `Iterator.prototype.forEach` method
// https://tc39.es/ecma262/#sec-iterator.prototype.foreach
$({ target: 'Iterator', proto: true, real: true, forced: NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR }, {
  forEach: function forEach(fn) {
    anObject(this);
    try {
      aCallable(fn);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) return call(nativeForEach, this, fn);

    var record = getIteratorDirect(this);
    var counter = 0;
    iterate(record, function (value) {
      fn(value, counter++);
    }, { IS_RECORD: true });
  }
});
