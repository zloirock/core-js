'use strict';
var call = require('../internals/function-call');
var perform = require('../internals/perform');
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIns = require('../internals/define-built-ins');
var wellKnownSymbol = require('../internals/well-known-symbol');
var InternalStateModule = require('../internals/internal-state');
var getBuiltIn = require('../internals/get-built-in');
var getMethod = require('../internals/get-method');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var iteratorClose = require('../internals/iterator-close');

var Promise = getBuiltIn('Promise');

var ASYNC_ITERATOR_PROXY = 'AsyncIteratorProxy';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ASYNC_ITERATOR_PROXY);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = ASYNC_ITERATOR_PROXY;
    state.done = false;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = defineBuiltIns(create(AsyncIteratorPrototype), {
    next: function next() {
      var that = this;
      var result = perform(function () {
        var state = getInternalState(that);
        return state.done ? { done: true, value: undefined } : anObject(call(nextHandler, state, Promise));
      });
      var error = result.error;
      var value = result.value;
      if (IS_ITERATOR) return error ? Promise.reject(value) : Promise.resolve(value);
      return new Promise(function (resolve, reject) {
        error ? reject(value) : resolve(value);
      });
    },
    'return': function (value) {
      var that = this;
      return new Promise(function (resolve, reject) {
        var state = getInternalState(that);
        var iterator = state.iterator;
        var innerIterator = state.innerIterator;
        state.done = true;
        if (innerIterator) try {
          iteratorClose(innerIterator, 'return', value);
        } catch (error) {
          return iteratorClose(iterator, 'throw', error);
        }
        var $$return = getMethod(iterator, 'return');
        if ($$return === undefined) return resolve({ done: true, value: value });
        Promise.resolve(call($$return, iterator, value)).then(function (result) {
          anObject(result);
          resolve({ done: true, value: value });
        }, reject);
      });
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(AsyncIteratorProxy.prototype, TO_STRING_TAG, 'Generator');
  }

  return AsyncIteratorProxy;
};
