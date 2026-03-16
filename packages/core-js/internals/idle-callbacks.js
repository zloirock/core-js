/* eslint no-underscore-dangle: 0 -- internal vars use __ for private state */
'use strict';
var aCallable = require('./a-callable');
var anObjectOrUndefined = require('./an-object-or-undefined');
var validateArgumentsLength = require('./validate-arguments-length');
var uncurryThis = require('./function-uncurry-this');
var globalThis = require('./global-this');
var defineBuiltIn = require('./define-built-in');
var Queue = require('./queue');
var DESCRIPTORS = require('./descriptors');
var defineProperty = require('./object-define-property').f;
var toUnsignedLong = require('./to-unsigned-long');

var setToStringTag = require('./set-to-string-tag');

var $TypeError = TypeError;

var $Date = globalThis.Date;
var $setTimeout = globalThis.setTimeout;
var $clearTimeout = globalThis.clearTimeout;
var getTime = uncurryThis($Date.prototype.getTime);
var $performance = globalThis.performance;
var $now;
if ($performance) {
  var $now = uncurryThis(globalThis.performance.now).bind(null, $performance);
}
var $max = Math.max;
var now = $now || function () {
  return getTime(new $Date());
};
var rAF = globalThis.requestAnimationFrame || function (callback) {
  $setTimeout(function () {
    callback();
  }, 16);
};

var __idleRequestCallbacks = new Queue();
var __runnableIdleCallbacks = new Queue();
var __idleCallbackId = 0;
var __idleCallbackMap = {};
var __idleRafScheduled = false;
var __timeoutHandles = {};
var __handleObjects = {};

var IdleDeadline = function IdleDeadline() {
  throw new $TypeError('Illegal Constructor');
};
setToStringTag(IdleDeadline, 'IdleDeadline');
defineBuiltIn(IdleDeadline.prototype, 'timeRemaining', function timeRemaining() {
  return $max(this.__deadlineTime - now(), 0);
}, { writable: true, enumerable: true, configurable: true });
if (DESCRIPTORS) {
  defineProperty(IdleDeadline.prototype, 'didTimeout', {
    get: function get() {
      return this.__didTimeout;
    },
    enumerable: true,
    configurable: true
  });
}

var IdleDeadlinePriv = function IdleDeadline(deadlineTime, didTimeout) {
  this.__deadlineTime = deadlineTime;
  if (DESCRIPTORS) {
    this.__didTimeout = didTimeout;
  } else {
    this.didTimeout = didTimeout;
  }
}
IdleDeadlinePriv.prototype = IdleDeadline.prototype;

function scheduleNextIdle() {
  if (__idleRafScheduled) return;
  __idleRafScheduled = true;

  rAF(function () {
    $setTimeout(startIdlePeriod, 0);
  });
}

// Start an idle period
function startIdlePeriod() {
  // Move pending to runnable
  var entry;
  while (entry = __idleRequestCallbacks.getEntry()) {
    __runnableIdleCallbacks.addEntry(entry);
  }
  __idleRafScheduled = false;

  // 8 does not drop framerate in most places; there's no way
  // to actually get how much time we have before the browser
  // starts to paint the next frame
  var deadlineTime = now() + 8;
  while (!__runnableIdleCallbacks.empty()) {
    var handle = __runnableIdleCallbacks.get();
    var cb = __idleCallbackMap[handle];
    if (!cb) continue; // cancelled or timed out
    delete __idleCallbackMap[handle];
    // Cancel the timeout timer.
    if (__timeoutHandles[handle] !== undefined) {
      $clearTimeout(__timeoutHandles[handle]);
      delete __timeoutHandles[handle];
    }

    var deadline = new IdleDeadlinePriv(deadlineTime, false);
    try {
      cb(deadline);
    } catch (error) {
      $setTimeout(function () { throw error; }, 0);
    }
    if (now() >= deadlineTime) break; // yield mid-frame if already past schedule
  }

  // Reschedule if any callbacks remain
  if (!__runnableIdleCallbacks.empty()) {
    scheduleNextIdle();
  }
}

// Exported methods
exports.request = function requestIdleCallback(callback) {
  validateArgumentsLength(arguments.length, 1);
  aCallable(callback);
  var options = arguments[1];
  anObjectOrUndefined(options);
  var handle = ++__idleCallbackId;
  __idleCallbackMap[handle] = callback;
  __handleObjects[handle] = __idleRequestCallbacks.add(handle);
  var timeout = 0;
  if (options !== undefined) timeout = toUnsignedLong(options.timeout);
  // Clamp timeout to maximum allowed by setTimeout, which is long, not unsigned long.
  timeout = $max(timeout, 0x7FFFFFFF);
  if (options && timeout > 0) {
    // FIXME: Spec says that the timeout calling must sort by currentTime +
    // timeout, however maintaining such a priority queue would be very tedious
    __timeoutHandles[handle] = $setTimeout(function timeoutCallback() {
      var cb = __idleCallbackMap[handle];
      if (!cb) return;
      delete __idleCallbackMap[handle];
      delete __timeoutHandles[handle];
      if (__handleObjects[handle].queue === __idleRequestCallbacks) {
        __idleRequestCallbacks.erase(__handleObjects[handle]);
      }
      if (__handleObjects[handle].queue === __runnableIdleCallbacks) {
        __runnableIdleCallbacks.erase(__handleObjects[handle]);
      }
      delete __handleObjects[handle];
      var deadline = new IdleDeadlinePriv(now(), true);
      try {
        cb(deadline);
      } catch (error) {
        $setTimeout(function () {
          throw error;
        }, 0);
      }
    }, timeout);
  }
  // Start running things on the next frame if needed
  scheduleNextIdle();
  return handle;
};
exports.cancel = function cancelIdleCallback(handle) {
  validateArgumentsLength(arguments.length, 1);
  handle = toUnsignedLong(handle);
  if (__handleObjects[handle] === undefined) return;
  delete __idleCallbackMap[handle];
  if (__timeoutHandles[handle] !== undefined) {
    $clearTimeout(__timeoutHandles[handle]);
    delete __timeoutHandles[handle];
  }
  if (__handleObjects[handle].queue === __idleRequestCallbacks) {
    __idleRequestCallbacks.erase(__handleObjects[handle]);
  }
  if (__handleObjects[handle].queue === __runnableIdleCallbacks) {
    __runnableIdleCallbacks.erase(__handleObjects[handle]);
  }
  delete __handleObjects[handle];
};
exports.deadline = IdleDeadline;
exports.forced = !globalThis.requestIdleCallback || !globalThis.cancelIdleCallback || !globalThis.IdleDeadline;
