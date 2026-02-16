/* eslint no-underscore-dangle: 0 -- internal vars use __ for private state */
'use strict';
var uncurryThis = require('./function-uncurry-this');
var globalThis = require('./global-this');

var $Date = globalThis.Date;
var $Map = globalThis.Map;
var $setTimeout = globalThis.setTimeout;
var getTime = uncurryThis($Date.prototype.getTime);
var $performance = globalThis.performance;
var $max = Math.max;
var now = ($performance && function () { return $performance.now(); }) || function () {
  return getTime(new $Date());
};
var rAF = globalThis.requestAnimationFrame || function (callback) {
  var currTime = now();
  $setTimeout(function () {
    callback(currTime + 16);
  }, 16);
};
var $push = globalThis.Array.prototype.push;
var apply = uncurryThis(Function.prototype.apply);
var $pushApply = function (array1, array2) {
  return apply($push, array1, array2);
};
var shift = uncurryThis([].shift);
var splice = uncurryThis([].splice);
var indexOf = function (arr, value) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === value) return i;
  }
  return -1;
};
var get = uncurryThis(new $Map().get);
var mpDelete = uncurryThis(new $Map()['delete']);

var __idleRequestCallbacks = [];
var __runnableIdleCallbacks = [];
var __idleCallbackId = 0;
var __idleCallbackMap = new $Map();
var __idleRafScheduled = false;

function IdleDeadline(deadlineTime, didTimeout) {
  this.__deadlineTime = deadlineTime;
  // Not done with a getter as the spec suggests,
  // since it's just a simple property so we can
  // drop dependency on defineProperty internal
  this.didTimeout = didTimeout;
}
IdleDeadline.prototype.timeRemaining = function () {
  var remaining = this.__deadlineTime - now();
  return $max(remaining, 0);
};

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
    try {
      cb(deadline);
    } catch (error) {
      $setTimeout(function () { throw error; }, 0);
    }
    if (now() >= deadlineTime) break; // yield mid-frame if already past schedule
  }

  // Reschedule if any callbacks remain
  if (__runnableIdleCallbacks.length) {
    scheduleNextIdle();
  }
}

// Exported methods
exports.request = function requestIdleCallback(callback, options) {
  var handle = ++__idleCallbackId;
  __idleCallbackMap.set(handle, callback);
  __idleRequestCallbacks.push(handle);
  if (options && options.timeout && options.timeout > 0) {
    // FIXME: Spec says that the timeout calling must sort by currentTime +
    // options.timeout, however maintainng such a queue would be very tedious
    $setTimeout(function timeoutCallback() {
      var cb = get(__idleCallbackMap, handle);
      if (!cb) return;
      var i = indexOf(__idleRequestCallbacks, handle);
      if (i > -1) splice(__idleRequestCallbacks, i, 1);
      i = indexOf(__runnableIdleCallbacks, handle);
      if (i > -1) splice(__runnableIdleCallbacks, i, 1);
      var deadline = new IdleDeadline(now(), true);
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
  mpDelete(__idleCallbackMap, handle);
  var i = indexOf(__idleRequestCallbacks, handle);
  if (i > -1) splice(__idleRequestCallbacks, i, 1);
  i = indexOf(__runnableIdleCallbacks, handle);
  if (i > -1) splice(__runnableIdleCallbacks, i, 1);
};
