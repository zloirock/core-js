/* eslint no-underscore-dangle: 0 -- internal vars use sharedStore.__ for private state */
'use strict';
var aCallable = require('./a-callable');
var anObjectOrUndefined = require('./an-object-or-undefined');
var aNumber = require('./a-number');
var validateArgumentsLength = require('./validate-arguments-length');
var uncurryThis = require('./function-uncurry-this');
var globalThis = require('./global-this');
var sharedStore = require('./shared-store');
var defineBuiltIn = require('./define-built-in');
var Queue = require('./queue');
var DESCRIPTORS = require('./descriptors');
var defineProperty = require('./object-define-property').f;

var setToStringTag = require('./set-to-string-tag');

var $TypeError = TypeError;
var TOKEN = '__core_js_polyfill_idle_callback__';

var $Date = globalThis.Date;
var $setTimeout = globalThis.setTimeout;
var getTime = uncurryThis($Date.prototype.getTime);
var $performance = globalThis.performance;
var $max = Math.max;
var now = ($performance && function () { return $performance.now(); }) || function () {
  return getTime(new $Date());
};
var rAF = globalThis.requestAnimationFrame || function (callback) {
  $setTimeout(function () {
    callback();
  }, 16);
};

if (sharedStore.idleCallbackPolyfilled === undefined) {
  sharedStore.idleCallbackPolyfilled = true;
  sharedStore.__idleRequestCallbacks = new Queue();
  sharedStore.__runnableIdleCallbacks = new Queue();
  sharedStore.__idleCallbackId = 0;
  sharedStore.__idleCallbackMap = {};
  sharedStore.__idleRafScheduled = false;
  sharedStore.__timeoutHandles = {};
  sharedStore.__handleObjects = {};
}

var IdleDeadline = function IdleDeadline() {
  if (arguments[0] !== TOKEN) throw new $TypeError('Illegal Constructor');
  this.__deadlineTime = arguments[1];
  if (DESCRIPTORS) {
    this.__didTimeout = arguments[2];
  } else {
    this.didTimeout = arguments[2];
  }
};
setToStringTag(IdleDeadline, 'IdleDeadline');
defineBuiltIn(IdleDeadline.prototype, 'timeRemaining', function timeRemaining() {
  return $max(this.__deadlineTime - now(), 0);
}, { writable: true, enumerable: true, configurable: true });
if (DESCRIPTORS) {
  defineProperty(IdleDeadline.prototype, "didTimeout", {
    get: function get() {
      return this.__didTimeout;
    },
    enumerable: true,
    configurable: true
  });
}

function scheduleNextIdle() {
  if (sharedStore.__idleRafScheduled) return;
  sharedStore.__idleRafScheduled = true;

  rAF(function () {
    $setTimeout(startIdlePeriod, 0);
  });
}

// Start an idle period
function startIdlePeriod() {
  // Move pending to runnable
  var entry;
  while (entry = sharedStore.__idleRequestCallbacks.getEntry()) {
    sharedStore.__runnableIdleCallbacks.addEntry(entry);
  }
  sharedStore.__idleRafScheduled = false;

  // 8 does not drop framerate in most places; there's no way
  // to actually get how much time we have before the browser
  // starts to paint the next frame
  var deadlineTime = now() + 8;
  while (!sharedStore.__runnableIdleCallbacks.empty()) {
    var handle = sharedStore.__runnableIdleCallbacks.get();
    var cb = sharedStore.__idleCallbackMap[handle];
    if (!cb) continue; // cancelled or timed out
    delete sharedStore.__idleCallbackMap[handle];
    // Cancel the timeout timer.
    if (sharedStore.__timeoutHandles[handle] !== undefined) {
      clearTimeout(sharedStore.__timeoutHandles[handle]);
      delete sharedStore.__timeoutHandles[handle];
    }

    var deadline = new IdleDeadline(TOKEN, deadlineTime, false);
    try {
      cb(deadline);
    } catch (error) {
      $setTimeout(function () { throw error; }, 0);
    }
    if (now() >= deadlineTime) break; // yield mid-frame if already past schedule
  }

  // Reschedule if any callbacks remain
  if (!sharedStore.__runnableIdleCallbacks.empty()) {
    scheduleNextIdle();
  }
}

// Exported methods
exports.request = function requestIdleCallback(callback) {
  validateArgumentsLength(arguments.length, 1);
  aCallable(callback);
  var options = arguments[1];
  anObjectOrUndefined(options);
  var handle = ++sharedStore.__idleCallbackId;
  sharedStore.__idleCallbackMap[handle] = callback;
  sharedStore.__handleObjects[handle] = sharedStore.__idleRequestCallbacks.add(handle);
  if (options) options.timeout = +options.timeout;
  if (options && options.timeout > 0) {
    // FIXME: Spec says that the timeout calling must sort by currentTime +
    // options.timeout, however maintaining such a priority queue would be very tedious
    sharedStore.__timeoutHandles[handle] = $setTimeout(function timeoutCallback() {
      var cb = sharedStore.__idleCallbackMap[handle];
      if (!cb) return;
      delete sharedStore.__idleCallbackMap[handle];
      if (sharedStore.__handleObjects[handle].queue === sharedStore.__idleRequestCallbacks) {
        sharedStore.__idleRequestCallbacks.erase(sharedStore.__handleObjects[handle]);
      }
      if (sharedStore.__handleObjects[handle].queue === sharedStore.__runnableIdleCallbacks) {
        sharedStore.__runnableIdleCallbacks.erase(sharedStore.__handleObjects[handle]);
      }
      delete sharedStore.__handleObjects[handle];
      var deadline = new IdleDeadline(TOKEN, now(), true);
      try {
        cb(deadline);
      } catch (error) {
        $setTimeout(function () {
          throw error;
        }, 0);
      }
    }, options.timeout);
  }
  // Start running things on the next frame if needed
  scheduleNextIdle();
  return handle;
};
exports.cancel = function cancelIdleCallback(handle) {
  validateArgumentsLength(arguments.length, 1);
  handle = +handle;
  delete sharedStore.__idleCallbackMap[handle];
  if (sharedStore.__timeoutHandles[handle] !== undefined) {
    clearTimeout(sharedStore.__timeoutHandles[handle]);
    delete sharedStore.__timeoutHandles[handle];
  }
  if (sharedStore.__handleObjects[handle].queue === sharedStore.__idleRequestCallbacks) {
    sharedStore.__idleRequestCallbacks.erase(sharedStore.__handleObjects[handle]);
  }
  if (sharedStore.__handleObjects[handle].queue === sharedStore.__runnableIdleCallbacks) {
    sharedStore.__runnableIdleCallbacks.erase(sharedStore.__handleObjects[handle]);
  }
  delete sharedStore.__handleObjects[handle];
};
exports.deadline = IdleDeadline;
exports.forced = !globalThis.requestIdleCallback || !globalThis.cancelIdleCallback || !globalThis.IdleDeadline;
