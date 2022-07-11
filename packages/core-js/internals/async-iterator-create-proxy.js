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

var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
var setInternalState = InternalStateModule.set;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
  var ASYNC_ITERATOR_PROXY = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;

  var getInternalState = InternalStateModule.getterFor(ASYNC_ITERATOR_PROXY);

  var AsyncIteratorProxyPrototype = defineBuiltIns(create(AsyncIteratorPrototype), {
    next: function next() {
      var that = this;
      var result = perform(function () {
        var state = getInternalState(that);
        return state.done ? { done: true, value: undefined } : anObject(state.nextHandler(Promise));
      });
      var error = result.error;
      var value = result.value;
      if (IS_ITERATOR) return error ? Promise.reject(value) : Promise.resolve(value);
      return new Promise(function (resolve, reject) {
        error ? reject(value) : resolve(value);
      });
    },
    'return': function () {
      var that = this;
      return new Promise(function (resolve, reject) {
        var state = getInternalState(that);
        var iterator = state.iterator;
        var innerIterator = state.innerIterator;
        state.done = true;
        if (innerIterator) try {
          iteratorClose(innerIterator, 'return');
        } catch (error) {
          return iteratorClose(iterator, 'throw', error);
        }
        var $$return = getMethod(iterator, 'return');
        if ($$return === undefined) return resolve({ done: true, value: undefined });
        Promise.resolve(call($$return, iterator)).then(function (result) {
          anObject(result);
          resolve({ done: true, value: undefined });
        }, reject);
      });
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(AsyncIteratorProxyPrototype, TO_STRING_TAG, 'Async Iterator Helper');
  }

  return AsyncIteratorProxyPrototype;
};

var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);
var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);

module.exports = function (nextHandler, IS_ITERATOR) {
  var ASYNC_ITERATOR_PROXY = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;

  var AsyncIteratorProxy = function AsyncIterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = ASYNC_ITERATOR_PROXY;
    state.nextHandler = nextHandler;
    state.done = false;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

  return AsyncIteratorProxy;
};
