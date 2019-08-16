'use strict';
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var redefineAll = require('../internals/redefine-all');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var InternalStateModule = require('../internals/internal-state');

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.get;

var $return = function (value) {
  var iterator = getInternalState(this).iterator;
  var $$return = iterator['return'];
  return $$return === undefined ? { done: true, value: value } : anObject($$return.call(iterator, value));
};

var $throw = function (value) {
  var iterator = getInternalState(this).iterator;
  var $$throw = iterator['throw'];
  if ($$throw === undefined) throw value;
  return $$throw.call(iterator, value);
};

module.exports = function (nextHandler) {
  var IteratorProxy = function Iterator(state) {
    state.next = state.iterator.next;
    state.done = false;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = redefineAll(create(IteratorPrototype), {
    next: function next() {
      var state = getInternalState(this);
      var result = state.done ? undefined : nextHandler.apply(state, arguments);
      return { done: state.done, value: result };
    },
    'return': $return,
    'throw': $throw
  });

  return IteratorProxy;
};
