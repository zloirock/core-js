'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIns = require('../internals/define-built-ins');
var wellKnownSymbol = require('../internals/well-known-symbol');
var InternalStateModule = require('../internals/internal-state');
var getMethod = require('../internals/get-method');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var iteratorClose = require('../internals/iterator-close');

var ITERATOR_PROXY = 'IteratorProxy';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ITERATOR_PROXY);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = ITERATOR_PROXY;
    state.done = false;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = defineBuiltIns(create(IteratorPrototype), {
    next: function next() {
      var state = getInternalState(this);
      var result = state.done ? undefined : call(nextHandler, state);
      return { done: state.done, value: result };
    },
    'return': function () {
      var state = getInternalState(this);
      var iterator = state.iterator;
      var innerIterator = state.innerIterator;
      state.done = true;
      if (innerIterator) try {
        iteratorClose(innerIterator, 'return');
      } catch (error) {
        return iteratorClose(iterator, 'throw', error);
      }
      var $$return = getMethod(iterator, 'return');
      return { done: true, value: $$return ? anObject(call($$return, iterator)).value : undefined };
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(IteratorProxy.prototype, TO_STRING_TAG, 'Generator');
  }

  return IteratorProxy;
};
