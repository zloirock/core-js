'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var iteratorClose = require('../internals/iterator-close');
var globalThis = require('../internals/global-this');
var checkIteratorClosingOnEarlyError = require('../internals/check-iterator-closing-on-early-error');
var aCallable = require('./a-callable');

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var result = anObject(call(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
});

var Iterator = globalThis.Iterator;
var nativeMap = Iterator && Iterator.prototype && Iterator.prototype.map;

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
module.exports = (nativeMap && checkIteratorClosingOnEarlyError(TypeError, nativeMap, null)) ? nativeMap : function map(mapper) {
  anObject(this);
  try {
    aCallable(mapper);
  } catch (error) {
    iteratorClose(this, 'throw', error);
  }

  if (nativeMap) return call(nativeMap, this, mapper);

  return new IteratorProxy(getIteratorDirect(this), {
    mapper: mapper
  });
};
