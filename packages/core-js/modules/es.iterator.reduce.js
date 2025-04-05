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
var call = require('../internals/function-call');

var $TypeError = TypeError;
var Iterator = globalThis.Iterator;
var nativeReduce = Iterator && Iterator.prototype && Iterator.prototype.reduce;
var NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR = nativeReduce && !checkIteratorClosingOnEarlyError(nativeReduce, null);

// `Iterator.prototype.reduce` method
// https://tc39.es/ecma262/#sec-iterator.prototype.reduce
$({ target: 'Iterator', proto: true, real: true, forced: NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject(this);
    if (!isCallable(reducer)) {
      iteratorClose(this, 'throw', new $TypeError(tryToString(reducer) + ' is not a function'));
    }

    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    if (NATIVE_METHOD_WITHOUT_CLOSING_ON_EARLY_ERROR) {
      return noInitial ? call(nativeReduce, this, reducer) : call(nativeReduce, this, reducer, accumulator);
    }
    var record = getIteratorDirect(this);
    var counter = 0;
    iterate(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw new $TypeError('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});
