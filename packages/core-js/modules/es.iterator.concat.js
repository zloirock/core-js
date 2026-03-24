// @types: proposals/iterator-sequencing
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorMethod = require('../internals/get-iterator-method-internal');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var $Array = Array;
var nativeConcat = !IS_PURE && globalThis.Iterator && globalThis.Iterator.concat;
var INCORRECT_ITERATOR_CLOSING = false;

// V8 incorrectly closes the inner iterator on errors from IteratorStepValue.
// https://issues.chromium.org/issues/580293064
if (nativeConcat) try {
  var iterable = {};
  // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 compatibility
  iterable[wellKnownSymbol('iterator')] = function () {
    return {
      next: function () { throw new Error('Iterator step'); },
      'return': function () { INCORRECT_ITERATOR_CLOSING = true; return {}; }
    };
  };
  nativeConcat(iterable).next();
} catch (error) { /* empty */ }

var IteratorProxy = createIteratorProxy(function () {
  while (true) {
    var iterator = this.iterator;
    if (!iterator) {
      var iterableIndex = this.nextIterableIndex++;
      var iterables = this.iterables;
      if (iterableIndex >= iterables.length) {
        this.done = true;
        return;
      }
      var entry = iterables[iterableIndex];
      this.iterables[iterableIndex] = null;
      iterator = this.iterator = anObject(call(entry.method, entry.iterable));
      this.next = iterator.next;
    }
    var result = anObject(call(this.next, iterator));
    if (result.done) {
      this.iterator = null;
      this.next = null;
      continue;
    }
    return result.value;
  }
});

// `Iterator.concat` method
// https://tc39.es/ecma262/#sec-iterator.concat
// @dependency: es.iterator.constructor
$({ target: 'Iterator', stat: true, forced: IS_PURE || INCORRECT_ITERATOR_CLOSING }, {
  concat: function concat() {
    var length = arguments.length;
    var iterables = $Array(length);
    for (var index = 0; index < length; index++) {
      var item = anObject(arguments[index]);
      iterables[index] = {
        iterable: item,
        // @dependency: es.array.iterator
        // @dependency: es.string.iterator
        // @dependency: web.dom-collections.iterator
        method: aCallable(getIteratorMethod(item)),
      };
    }
    return new IteratorProxy({
      iterables: iterables,
      nextIterableIndex: 0,
      iterator: null,
      next: null,
    });
  },
});
