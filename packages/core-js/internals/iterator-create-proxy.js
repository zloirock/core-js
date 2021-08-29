'use strict';
var path = require('../internals/path');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var redefineAll = require('../internals/redefine-all');
var wellKnownSymbol = require('../internals/well-known-symbol');
var InternalStateModule = require('../internals/internal-state');

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.get;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(state) {
    state.next = aFunction(state.iterator.next);
    state.done = false;
    state.ignoreArg = !IS_ITERATOR;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = redefineAll(create(path.Iterator.prototype), {
    next: function next(arg) {
      var state = getInternalState(this);
      var args = arguments.length ? [state.ignoreArg ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
      state.ignoreArg = false;
      var result = state.done ? undefined : nextHandler.call(state, args);
      return { done: state.done, value: result };
    },
    'return': function (value) {
      var iterator = getInternalState(this).iterator;
      var $$return = iterator['return'];
      return { done: true, value: $$return === undefined ? value : anObject($$return.call(iterator, value)).value };
    },
    'throw': function (value) {
      var iterator = getInternalState(this).iterator;
      var $$throw = iterator['throw'];
      if ($$throw === undefined) throw value;
      return $$throw.call(iterator, value);
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty(IteratorProxy.prototype, TO_STRING_TAG, 'Generator');
  }

  return IteratorProxy;
};
