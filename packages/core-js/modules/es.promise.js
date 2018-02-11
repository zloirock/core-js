'use strict';
var IS_PURE = require('../internals/is-pure');
var global = require('../internals/global');
var classof = require('../internals/classof-raw');
var $export = require('../internals/export');
var isObject = require('../internals/is-object');
var aFunction = require('../internals/a-function');
var anInstance = require('../internals/an-instance');
var iterate = require('../internals/iterate');
var speciesConstructor = require('../internals/species-constructor');
var task = require('../internals/task').set;
var microtask = require('../internals/microtask')();
var newPromiseCapabilityModule = require('../internals/new-promise-capability');
var perform = require('../internals/perform');
var promiseResolve = require('../internals/promise-resolve');
var hostReportErrors = require('../internals/host-report-errors');
var $ = require('../internals/state');
var SPECIES = require('../internals/well-known-symbol')('species');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var document = global.document;
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;
var DISPATCH_EVENT = !!(document && document.createEvent && global.dispatchEvent);
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[SPECIES] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, $promise, isReject) {
  if ($promise.notified) return;
  $promise.notified = true;
  var chain = $promise.reactions;
  microtask(function () {
    var value = $promise.value;
    var ok = $promise.state == FULFILLED;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if ($promise.rejection === UNHANDLED) onHandleUnhandled(promise, $promise);
            $promise.rejection = HANDLED;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    $promise.reactions = [];
    $promise.notified = false;
    if (isReject && !$promise.rejection) onUnhandled(promise, $promise);
  });
};
var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (handler = global['on' + name]) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};
var onUnhandled = function (promise, $promise) {
  task.call(global, function () {
    var value = $promise.value;
    var unhandled = isUnhandled($promise);
    var result;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      $promise.rejection = isNode || isUnhandled($promise) ? UNHANDLED : HANDLED;
    }
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function ($promise) {
  return $promise.rejection !== HANDLED && !$promise.parent;
};
var onHandleUnhandled = function (promise, $promise) {
  task.call(global, function () {
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, $promise.value);
  });
};
var bind = function (fn, promise, $promise, unwrap) {
  return function (value) {
    fn(promise, $promise, value, unwrap);
  };
};
var $reject = function (promise, $promise, value, unwrap) {
  if ($promise.done) return;
  $promise.done = true;
  if (unwrap) $promise = unwrap;
  $promise.value = value;
  $promise.state = REJECTED;
  notify(promise, $promise, true);
};
var $resolve = function (promise, $promise, value, unwrap) {
  if ($promise.done) return;
  $promise.done = true;
  if (unwrap) $promise = unwrap;
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value, bind($resolve, promise, wrapper, $promise), bind($reject, promise, wrapper, $promise));
        } catch (e) {
          $reject(promise, wrapper, e, $promise);
        }
      });
    } else {
      $promise.value = value;
      $promise.state = FULFILLED;
      notify(promise, $promise, false);
    }
  } catch (e) {
    $reject(promise, { done: false }, e, $promise);
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE);
    aFunction(executor);
    Internal.call(this);
    var $promise = $(this);
    try {
      executor(bind($resolve, this, $promise), bind($reject, this, $promise));
    } catch (err) {
      $reject(this, $promise, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    $(this, {
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = require('../internals/redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var $promise = $(this);
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      $promise.parent = true;
      $promise.reactions.push(reaction);
      if ($promise.state != PENDING) notify(this, $promise, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var $promise = $(promise);
    this.promise = promise;
    this.resolve = bind($resolve, promise, $promise);
    this.reject = bind($reject, promise, $promise);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export({ global: true, wrap: true, forced: !USE_NATIVE }, { Promise: $Promise });
require('../internals/set-to-string-tag')($Promise, PROMISE);
require('../internals/set-species')(PROMISE);
Wrapper = require('../internals/path')[PROMISE];

// statics
$export({ target: PROMISE, stat: true, forced: !USE_NATIVE }, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export({ target: PROMISE, stat: true, forced: IS_PURE || !USE_NATIVE }, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(IS_PURE && this === Wrapper ? $Promise : this, x);
  }
});
$export({ target: PROMISE, stat: true, forced: !(USE_NATIVE && require('../internals/iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})) }, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      iterate(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      iterate(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});
