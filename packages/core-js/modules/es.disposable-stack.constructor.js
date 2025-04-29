// types: proposals/explicit-resource-management
'use strict';
// https://github.com/tc39/proposal-explicit-resource-management
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var aCallable = require('../internals/a-callable');
var anInstance = require('../internals/an-instance');
var defineBuiltIn = require('../internals/define-built-in');
var defineBuiltIns = require('../internals/define-built-ins');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var wellKnownSymbol = require('../internals/well-known-symbol');
var setInternalState = require('../internals/internal-state').set;
var internalStateGetterFor = require('../internals/internal-state-getter-for');
var addDisposableResource = require('../internals/add-disposable-resource');

// @dependency: es.suppressed-error.constructor
var SuppressedError = getBuiltIn('SuppressedError');
var $ReferenceError = ReferenceError;

var DISPOSE = wellKnownSymbol('dispose');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var DISPOSABLE_STACK = 'DisposableStack';
var HINT = 'sync-dispose';
var DISPOSED = 'disposed';
var PENDING = 'pending';

var getDisposableStackInternalState = internalStateGetterFor(DISPOSABLE_STACK);

var getPendingDisposableStackInternalState = function (stack) {
  var internalState = getDisposableStackInternalState(stack);
  if (internalState.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + ' already disposed');
  return internalState;
};

var $DisposableStack = function DisposableStack() {
  setInternalState(anInstance(this, DisposableStackPrototype), {
    type: DISPOSABLE_STACK,
    state: PENDING,
    stack: [],
  });
};

var DisposableStackPrototype = $DisposableStack.prototype;

defineBuiltIns(DisposableStackPrototype, {
  dispose: function dispose() {
    var internalState = getDisposableStackInternalState(this);
    if (internalState.state === DISPOSED) return;
    internalState.state = DISPOSED;
    var stack = internalState.stack;
    var i = stack.length;
    var thrown = false;
    var suppressed;
    while (i) {
      var disposeMethod = stack[--i];
      stack[i] = null;
      try {
        disposeMethod();
      } catch (errorResult) {
        if (thrown) {
          suppressed = new SuppressedError(errorResult, suppressed);
        } else {
          thrown = true;
          suppressed = errorResult;
        }
      }
    }
    internalState.stack = null;
    if (thrown) throw suppressed;
  },
  use: function use(value) {
    addDisposableResource(getPendingDisposableStackInternalState(this), value, HINT);
    return value;
  },
  adopt: function adopt(value, onDispose) {
    var internalState = getPendingDisposableStackInternalState(this);
    aCallable(onDispose);
    addDisposableResource(internalState, undefined, HINT, function () {
      onDispose(value);
    });
    return value;
  },
  defer: function defer(onDispose) {
    var internalState = getPendingDisposableStackInternalState(this);
    aCallable(onDispose);
    addDisposableResource(internalState, undefined, HINT, onDispose);
  },
  move: function move() {
    var internalState = getPendingDisposableStackInternalState(this);
    var newDisposableStack = new $DisposableStack();
    getDisposableStackInternalState(newDisposableStack).stack = internalState.stack;
    internalState.stack = [];
    internalState.state = DISPOSED;
    return newDisposableStack;
  },
});

defineBuiltInAccessor(DisposableStackPrototype, 'disposed', {
  configurable: true,
  get: function disposed() {
    return getDisposableStackInternalState(this).state === DISPOSED;
  },
});

defineBuiltIn(DisposableStackPrototype, DISPOSE, DisposableStackPrototype.dispose, { name: 'dispose' });
// @dependency: es.object.to-string
defineBuiltIn(DisposableStackPrototype, TO_STRING_TAG, DISPOSABLE_STACK, { nonWritable: true });

$({ global: true, constructor: true }, {
  DisposableStack: $DisposableStack,
});
