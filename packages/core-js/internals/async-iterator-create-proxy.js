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
  var IS_GENERATOR = !IS_ITERATOR;
  var ASYNC_ITERATOR_PROXY = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;

  var getInternalState = InternalStateModule.getterFor(ASYNC_ITERATOR_PROXY);

  var getStateOrEarlyExit = function (that) {
    var stateCompletion = perform(function () {
      return getInternalState(that);
    });

    var stateError = stateCompletion.error;
    var state = stateCompletion.value;

    if (stateError || (IS_GENERATOR && state.done)) {
      return { exit: true, value: stateError ? Promise.reject(state) : Promise.resolve({ done: true, value: undefined }) };
    } return { exit: false, value: state };
  };

  var enqueue = function (state, handler) {
    var task = function () {
      var promise = handler();
      if (IS_GENERATOR) {
        state.awaiting = promise;
        var clean = function () {
          if (state.awaiting === promise) state.awaiting = null;
        };
        promise.then(clean, clean);
      } return promise;
    };

    return state.awaiting ? state.awaiting = state.awaiting.then(task, task) : task();
  };

  var AsyncIteratorProxyPrototype = defineBuiltIns(create(AsyncIteratorPrototype), {
    next: function next() {
      var stateCompletion = getStateOrEarlyExit(this);
      var exit = stateCompletion.exit;
      var state = stateCompletion.value;

      return exit ? state : enqueue(state, function () {
        var handlerCompletion = perform(function () {
          return anObject(state.nextHandler(Promise));
        });
        var handlerError = handlerCompletion.error;
        var value = handlerCompletion.value;
        if (handlerError) state.done = true;
        return handlerError ? Promise.reject(value) : Promise.resolve(value);
      });
    },
    'return': function () {
      var stateCompletion = getStateOrEarlyExit(this);
      var exit = stateCompletion.exit;
      var state = stateCompletion.value;

      return exit ? state : enqueue(state, function () {
        return new Promise(function (resolve, reject) {
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
      });
    }
  });

  if (IS_GENERATOR) {
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
    state.awaiting = null;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

  return AsyncIteratorProxy;
};
