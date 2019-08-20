'use strict';
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var hide = require('../internals/hide');
var redefineAll = require('../internals/redefine-all');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var InternalStateModule = require('../internals/internal-state');
var getBuiltIn = require('../internals/get-built-in');

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.get;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var $return = function (value) {
  var state = getInternalState(this);
  var iterator = state.iterator;
  var $$return = iterator['return'];
  return $$return === undefined
    ? state.Promise.resolve({ done: true, value: value })
    : anObject($$return.call(iterator, value));
};

var $throw = function (value) {
  var state = getInternalState(this);
  var iterator = state.iterator;
  var $$throw = iterator['throw'];
  return $$throw === undefined
    ? state.Promise.reject(value)
    : $$throw.call(iterator, value);
};

module.exports = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(state) {
    state.Promise = getBuiltIn('Promise');
    state.next = state.iterator.next;
    state.done = false;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = redefineAll(create(AsyncIteratorPrototype), {
    next: function next() {
      var state = getInternalState(this);
      var Promise = state.Promise;
      if (state.done) return Promise.resolve({ done: true, value: undefined });
      try {
        return Promise.resolve(anObject(nextHandler.apply(state, arguments)));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    'return': $return,
    'throw': $throw
  });

  if (!IS_ITERATOR) {
    hide(AsyncIteratorProxy.prototype, TO_STRING_TAG, 'Generator');
  }

  return AsyncIteratorProxy;
};
