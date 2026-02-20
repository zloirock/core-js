/* eslint no-underscore-dangle: 0 -- internal vars use sharedStore.__ for private state */
'use strict';
var uncurryThis = require('./function-uncurry-this');
var globalThis = require('./global-this');
var MapHelpers = require('./map-helpers');
var sharedStore = require('./shared-store');

var $Date = globalThis.Date;
var $Map = MapHelpers.Map;
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
var get = MapHelpers.get;
var mpDelete = MapHelpers.remove;

if (sharedStore.idleCallbackPolyfilled === undefined) {
  sharedStore.idleCallbackPolyfilled = true;
  sharedStore.__idleRequestCallbacks = [];
  sharedStore.__runnableIdleCallbacks = [];
  sharedStore.__idleCallbackId = 0;
  sharedStore.__idleCallbackMap = new $Map();
  sharedStore.__idleRafScheduled = false;

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
  if (sharedStore.__idleRafScheduled) return;
  sharedStore.__idleRafScheduled = true;

  rAF(function () {
    $setTimeout(startIdlePeriod, 0);
  });
}

// Start an idle period
function startIdlePeriod() {
  // Move pending to runnable
  if (sharedStore.__idleRequestCallbacks.length) {
    $pushApply(sharedStore.__runnableIdleCallbacks, sharedStore.__idleRequestCallbacks);
    sharedStore.__idleRequestCallbacks.length = 0;
  }
  sharedStore.__idleRafScheduled = false;
  // If no runnable callbacks or already scheduled, exit
  if (!sharedStore.__runnableIdleCallbacks.length) return;
  // 8 does not drop framerate in most places; there's no way
  // to actually get how much time we have before the browser
  // starts to paint the next frame
  var deadlineTime = now() + 8;
  while (sharedStore.__runnableIdleCallbacks.length) {
    var handle = shift(sharedStore.__runnableIdleCallbacks);
    var cb = get(sharedStore.__idleCallbackMap, handle);
    if (!cb) continue; // cancelled
    // Cancel this, so we no longer call it on timeout
    mpDelete(sharedStore.__idleCallbackMap, handle);

    var deadline = new IdleDeadline(deadlineTime, false);
    try {
      cb(deadline);
    } catch (error) {
      $setTimeout(function () { throw error; }, 0);
    }
    if (now() >= deadlineTime) break; // yield mid-frame if already past schedule
  }

  // Reschedule if any callbacks remain
  if (sharedStore.__runnableIdleCallbacks.length) {
    scheduleNextIdle();
  }
}

// Exported methods
exports.request = function requestIdleCallback(callback) {
  var options = arguments[1] || null;
  var handle = ++sharedStore.__idleCallbackId;
  sharedStore.__idleCallbackMap.set(handle, callback);
  sharedStore.__idleRequestCallbacks.push(handle);
  if (options && options.timeout && options.timeout > 0) {
    // FIXME: Spec says that the timeout calling must sort by currentTime +
    // options.timeout, however maintainng such a queue would be very tedious
    $setTimeout(function timeoutCallback() {
      var cb = get(sharedStore.__idleCallbackMap, handle);
      if (!cb) return;
      var i = indexOf(sharedStore.__idleRequestCallbacks, handle);
      if (i > -1) splice(sharedStore.__idleRequestCallbacks, i, 1);
      i = indexOf(sharedStore.__runnableIdleCallbacks, handle);
      if (i > -1) splice(sharedStore.__runnableIdleCallbacks, i, 1);
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
  mpDelete(sharedStore.__idleCallbackMap, handle);
  var i = indexOf(sharedStore.__idleRequestCallbacks, handle);
  if (i > -1) splice(sharedStore.__idleRequestCallbacks, i, 1);
  i = indexOf(sharedStore.__runnableIdleCallbacks, handle);
  if (i > -1) splice(sharedStore.__runnableIdleCallbacks, i, 1);
};
