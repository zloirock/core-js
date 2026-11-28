'use strict';
// Installed before the bundle in the frame and the standalone page. An uncaught error from either
// bundle evaluation or the exercise must reach the cell's verdict.
(function () {
  if (window.document && document.documentMode && document.documentMode < 11) return;
  // Capture the native constructor before the bundle can replace it. Its rejection event is
  // delivered by the same tracker as an unhandled rejection from the exercise.
  // eslint-disable-next-line es/no-promise -- optional native rejection tracker, absent in IE11
  var NativePromise = window.Promise;
  // Schedule nested thenable calls with the host facilities captured before the bundle.
  var queue = window.queueMicrotask || window.setImmediate || setTimeout;
  var nativeThen = NativePromise && NativePromise.prototype.then;
  var ready = !window.queueMicrotask && nativeThen && new NativePromise(function (resolve) { resolve(); });
  window.e2eQueueJob = function (job) {
    if (ready) Function.prototype.call.call(nativeThen, ready, job);
    else queue.call(window, job);
  };
  var marker;
  var notify;
  function record(failure) {
    if (window.e2eUncaughtError !== undefined) return;
    window.e2eUncaughtError = failure;
    if (window.e2eOnUncaughtError) window.e2eOnUncaughtError();
  }

  window.addEventListener('error', function (event) {
    record({ message: event.message + ' (' + event.filename + ':' + event.lineno + ')' });
  });

  window.addEventListener('unhandledrejection', function (event) {
    if (notify && event.promise === marker) {
      var done = notify;
      notify = null;
      marker = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      done();
      return;
    }
    record({ rejection: event.reason });
  });

  window.e2eAfterRejections = function (callback) {
    // The exercise's microtasks must finish before creating the marker.
    setTimeout(function () {
      if (NativePromise && typeof window.PromiseRejectionEvent === 'function') {
        notify = callback;
        marker = new NativePromise(function (resolve, reject) { reject(); });
      } else if (typeof window.setImmediate === 'function') {
        // IE11's Promise polyfill reports unhandled rejections through setImmediate.
        window.setImmediate(callback);
      } else setTimeout(callback, 0);
    }, 0);
  };
}());
