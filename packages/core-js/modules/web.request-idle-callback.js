'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var globalThis = require('../internals/global-this');
var defineProperty = require('../internals/object-define-property').f;

var $Date = globalThis.Date;
var $Map = globalThis.Map;
var $setTimeout = globalThis.setTimeout;
var getTime = uncurryThis($Date.prototype.getTime);
var $performance = globalThis.performance;
var now = ($performance && function() { return $performance.now() }) || function () {
  return getTime(new $Date());
};
var rAF = globalThis.requestAnimationFrame || function(callback) {
  var currTime = now();
  $setTimeout(function() {
    callback(currTime + 16);
  }, 16);
};
var $push = globalThis.Array.prototype.push;
var apply = uncurryThis((function(){}).apply);
var $pushApply = function(array1, array2) {
  return apply($push, array1, array2)
}
var shift = uncurryThis([].shift);
var splice = uncurryThis([].splice);
var indexOf = uncurryThis([].indexOf);
var get = uncurryThis(new $Map().get);
var mpDelete = uncurryThis(new $Map().delete);

var __idleRequestCallbacks = [];
var __runnableIdleCallbacks = [];
var __idleCallbackId = 0;
var __idleCallbackMap = new $Map();
var __idleRafScheduled = false;

function IdleDeadline(deadlineTime, didTimeout) {
  this.__deadlineTime = deadlineTime;
  this.__didTimeout = didTimeout;
}
IdleDeadline.prototype.timeRemaining = function() {
  var remaining = this.__deadlineTime - now();
  return remaining > 0 ? remaining : 0;
};
defineProperty(IdleDeadline.prototype, 'didTimeout', {
  get: function() { return this.__didTimeout; },
});

function scheduleNextIdle() {
  if (__idleRafScheduled) return;
  __idleRafScheduled = true;

  rAF(function() {
    $setTimeout(startIdlePeriod, 0);
  });
}

// Start an idle period
function startIdlePeriod() {
  // Move pending to runnable
  if (__idleRequestCallbacks.length) {
    $pushApply(__runnableIdleCallbacks, __idleRequestCallbacks);
    __idleRequestCallbacks.length = 0;
  }

  __idleRafScheduled = false;

  // If no runnable callbacks or already scheduled, exit
  if (!__runnableIdleCallbacks.length) return;

  // 8 does not drop framerate in most places; there's no way
  // to actually get how much time we have before the browser
  // starts to paint the next frame
  var deadlineTime = now() + 8;

  while (__runnableIdleCallbacks.length) {
    var handle = shift(__runnableIdleCallbacks);
    var cb = get(__idleCallbackMap, handle);
    if (!cb) continue; // cancelled
    // Cancel this, so we no longer call it on timeout
    mpDelete(__idleCallbackMap, handle);

    var deadline = new IdleDeadline(deadlineTime, false);
    try { cb(deadline); } catch (e) { $setTimeout(function() { throw e; }, 0); }

    if (now() >= deadlineTime) break; // yield mid-frame if already past schedule
  }

  // Reschedule if any callbacks remain
  if (__runnableIdleCallbacks.length) {
    scheduleNextIdle();
  }

}

// Exported methods
globalThis.requestIdleCallback = globalThis.requestIdleCallback || (
  function requestIdleCallback(callback, options) {
    var handle = ++__idleCallbackId;
    __idleCallbackMap.set(handle, callback);
    __idleRequestCallbacks.push(handle);

    if (options && options.timeout && options.timeout > 0) {
      // FIXME: Spec says that the timeout calling must sort by currentTime +
      // options.timeout, however maintainng such a queue would be very dedious
      $setTimeout(function timeoutCallback() {
        var cb = get(__idleCallbackMap, handle);
        if (!cb) return;
        var i = indexOf(__idleRequestCallbacks, handle);
        if (i > -1) splice(__idleRequestCallbacks, i, 1);
        i = indexOf(__runnableIdleCallbacks, handle);
        if (i > -1) splice(__runnableIdleCallbacks, i, 1);
        var deadline = new IdleDeadline(now(), true);
        try { cb(deadline); } catch (e) { $setTimeout(function() { throw e; }, 0); }
      }, options.timeout);
    }

    scheduleNextIdle();
    return handle;
  }
);

globalThis.cancelIdleCallback = globalThis.cancelIdleCallback || (
  function cancelIdleCallback(handle) {
    mpDelete(__idleCallbackMap, handle);
    var i = indexOf(__idleRequestCallbacks, handle);
    if (i > -1) splice(__idleRequestCallbacks, i, 1);
    i = indexOf(__runnableIdleCallbacks, handle);
    if (i > -1) splice(__runnableIdleCallbacks, i, 1);
  }
);
